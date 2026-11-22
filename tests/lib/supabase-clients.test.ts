// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

const createServerClient = vi.fn<(...args: unknown[]) => unknown>(() => ({ kind: "server" }));
const createBrowserClient = vi.fn<(...args: unknown[]) => unknown>(() => ({ kind: "browser" }));
vi.mock("@supabase/ssr", () => ({ createServerClient, createBrowserClient }));

type CookieAdapter = {
  getAll: () => unknown;
  setAll: (cookies: { name: string; value: string; options?: object }[]) => void;
};

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://proj.supabase.co");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon-key");
  createServerClient.mockClear();
  createBrowserClient.mockClear();
});

describe("server createClient", () => {
  async function load(cookieStore: { getAll: () => unknown; set: (...a: unknown[]) => void }) {
    const { cookies } = await import("next/headers");
    vi.mocked(cookies).mockResolvedValue(cookieStore as never);
    // tests/setup.ts mocks this module for everything else; load the real one.
    const real = await vi.importActual<typeof import("@/lib/supabase/server")>("@/lib/supabase/server");
    await real.createClient();
    const [url, key, options] = createServerClient.mock.calls[0] as [string, string, { cookies: CookieAdapter }];
    return { url, key, cookies: options.cookies };
  }

  it("creates a server client from the public env vars", async () => {
    const { url, key } = await load({ getAll: () => [], set: vi.fn() });
    expect(url).toBe("https://proj.supabase.co");
    expect(key).toBe("anon-key");
  });

  it("reads cookies from the request", async () => {
    const all = [{ name: "sb", value: "1" }];
    const { cookies } = await load({ getAll: () => all, set: vi.fn() });
    expect(cookies.getAll()).toBe(all);
  });

  it("writes refreshed cookies back", async () => {
    const set = vi.fn();
    const { cookies } = await load({ getAll: () => [], set });
    cookies.setAll([{ name: "sb", value: "2", options: { path: "/" } }]);
    expect(set).toHaveBeenCalledWith("sb", "2", { path: "/" });
  });

  it("ignores cookie writes from Server Components, where they throw", async () => {
    const { cookies } = await load({
      getAll: () => [],
      set: () => {
        throw new Error("Cookies can only be modified in a Server Action or Route Handler");
      },
    });
    expect(() => cookies.setAll([{ name: "sb", value: "2" }])).not.toThrow();
  });
});

describe("browser createClient", () => {
  it("creates a browser client from the public env vars", async () => {
    const { createClient } = await import("@/lib/supabase/client");
    expect(createClient()).toEqual({ kind: "browser" });
    expect(createBrowserClient).toHaveBeenCalledWith("https://proj.supabase.co", "anon-key");
  });
});

describe("updateSession (proxy)", () => {
  async function run(getUser: () => Promise<unknown>) {
    createServerClient.mockImplementationOnce(() => ({ auth: { getUser } }) as never);
    const { NextRequest } = await import("next/server");
    const { updateSession } = await import("@/lib/supabase/middleware");
    const request = new NextRequest("https://parish.org/admin", { headers: { cookie: "sb=old" } });
    const response = await updateSession(request);
    const [, , options] = createServerClient.mock.calls[0] as [string, string, { cookies: CookieAdapter }];
    return { request, response, cookies: options.cookies };
  }

  it("refreshes the session and lets the request through", async () => {
    const getUser = vi.fn(async () => ({ data: { user: null } }));
    const { response } = await run(getUser);
    expect(getUser).toHaveBeenCalled();
    expect(response.headers.get("x-middleware-next")).toBe("1");
  });

  it("exposes the request's cookies to Supabase", async () => {
    const { cookies } = await run(async () => ({}));
    expect(cookies.getAll()).toEqual([{ name: "sb", value: "old" }]);
  });

  it("copies refreshed cookies onto both the request and the response", async () => {
    let adapter!: CookieAdapter;
    createServerClient.mockImplementationOnce(((_u: string, _k: string, opts: { cookies: CookieAdapter }) => {
      adapter = opts.cookies;
      return {
        auth: {
          getUser: async () => {
            adapter.setAll([{ name: "sb", value: "new", options: { path: "/" } }]);
            return {};
          },
        },
      };
    }) as never);
    const { NextRequest } = await import("next/server");
    const { updateSession } = await import("@/lib/supabase/middleware");
    const request = new NextRequest("https://parish.org/");
    const response = await updateSession(request);

    expect(request.cookies.get("sb")?.value).toBe("new");
    expect(response.cookies.get("sb")?.value).toBe("new");
  });

  it("doesn't take the site down when Supabase is unreachable", async () => {
    const { response } = await run(async () => {
      throw new Error("fetch failed");
    });
    expect(response.headers.get("x-middleware-next")).toBe("1");
  });
});

describe("proxy", () => {
  it("delegates every request to updateSession", async () => {
    vi.resetModules();
    const updateSession = vi.fn(async () => "response");
    vi.doMock("@/lib/supabase/middleware", () => ({ updateSession }));
    const { proxy } = await import("@/proxy");
    const req = { url: "https://parish.org/" } as never;
    await expect(proxy(req)).resolves.toBe("response");
    expect(updateSession).toHaveBeenCalledWith(req);
    vi.doUnmock("@/lib/supabase/middleware");
  });

  it("skips static assets and images but matches pages", async () => {
    const { config } = await import("@/proxy");
    const pattern = new RegExp(`^${config.matcher[0]}$`);
    for (const path of ["/", "/admin", "/events/123", "/login/reset"]) expect(pattern.test(path)).toBe(true);
    for (const path of ["/_next/static/a.js", "/_next/image", "/favicon.ico", "/brand/seal.webp", "/x.png", "/f.woff2"]) {
      expect(pattern.test(path)).toBe(false);
    }
  });
});
