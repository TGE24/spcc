// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createSupabaseFake, type SupabaseFake } from "../helpers/supabase";

// The sitemap uses a cookie-free supabase-js client, not the SSR one.
let db: SupabaseFake;
const createClient = vi.fn(() => db);
vi.mock("@supabase/supabase-js", () => ({ createClient: (...args: unknown[]) => createClient(...(args as [])) }));

beforeEach(() => {
  db = createSupabaseFake();
  createClient.mockImplementation(() => db);
});

describe("sitemap", () => {
  async function build() {
    const { default: sitemap } = await import("@/app/sitemap");
    return sitemap();
  }

  it("lists every public page", async () => {
    const urls = (await build()).map((e) => new URL(e.url).pathname);
    expect(urls).toEqual([
      "/",
      "/about",
      "/mass-schedule",
      "/events",
      "/homilies",
      "/organizations",
      "/projects",
      "/harvest",
      "/mass-booking",
      "/baptism-request",
    ]);
  });

  it("never lists staff-only pages", async () => {
    const urls = (await build()).map((e) => e.url);
    expect(urls.some((u) => /\/admin|\/login|\/certificates/.test(u))).toBe(false);
  });

  it("adds a page for each past event, dated by when it was created", async () => {
    db.respond("events", "select", {
      data: [
        { id: "e1", created_at: "2026-01-02T00:00:00Z" },
        { id: "e2", created_at: "2026-03-04T00:00:00Z" },
      ],
    });
    const entries = await build();
    const events = entries.filter((e) => e.url.includes("/events/"));
    expect(events.map((e) => new URL(e.url).pathname)).toEqual(["/events/e1", "/events/e2"]);
    expect(events[0].lastModified).toEqual(new Date("2026-01-02T00:00:00Z"));
  });

  it("only asks for events before today", async () => {
    await build();
    expect(db.callsTo("events")[0].filters).toContainEqual(["lt", ["event_date", "2026-06-15"]]);
  });

  it("still returns the static pages when the events query fails", async () => {
    db.respond("events", "select", { error: { message: "down" } });
    expect(await build()).toHaveLength(10);
  });

  it("still returns the static pages when Supabase isn't configured", async () => {
    createClient.mockImplementation(() => {
      throw new Error("supabaseUrl is required");
    });
    expect(await build()).toHaveLength(10);
  });

  it("regenerates hourly", async () => {
    const mod = await import("@/app/sitemap");
    expect(mod.revalidate).toBe(3600);
  });
});

describe("robots", () => {
  it("allows the site, blocks staff areas and points at the sitemap", async () => {
    const { default: robots } = await import("@/app/robots");
    const { siteConfig } = await import("@/lib/site-config");
    expect(robots()).toEqual({
      rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/login", "/certificates"] },
      sitemap: `${siteConfig.siteUrl}/sitemap.xml`,
    });
  });
});
