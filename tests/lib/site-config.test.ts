import { afterEach, describe, expect, it, vi } from "vitest";

async function loadSiteUrl(env: Record<string, string | undefined>) {
  vi.resetModules();
  for (const [key, value] of Object.entries(env)) vi.stubEnv(key, value as string);
  const { siteConfig } = await import("@/lib/site-config");
  return siteConfig.siteUrl;
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("siteConfig.siteUrl", () => {
  it("uses NEXT_PUBLIC_SITE_URL first", async () => {
    await expect(
      loadSiteUrl({ NEXT_PUBLIC_SITE_URL: "https://stpatricks.org", NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL: "spcc.vercel.app" }),
    ).resolves.toBe("https://stpatricks.org");
  });

  it("strips trailing slashes from NEXT_PUBLIC_SITE_URL", async () => {
    await expect(loadSiteUrl({ NEXT_PUBLIC_SITE_URL: "https://stpatricks.org///" })).resolves.toBe(
      "https://stpatricks.org",
    );
  });

  it("falls back to Vercel's production URL over https", async () => {
    await expect(
      loadSiteUrl({ NEXT_PUBLIC_SITE_URL: "", NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL: "spcc.vercel.app" }),
    ).resolves.toBe("https://spcc.vercel.app");
  });

  it("falls back to localhost when neither is set", async () => {
    await expect(
      loadSiteUrl({ NEXT_PUBLIC_SITE_URL: "", NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL: "" }),
    ).resolves.toBe("http://localhost:3000");
  });
});

describe("siteConfig", () => {
  it("has the official parish name and contact details", async () => {
    vi.resetModules();
    const { siteConfig } = await import("@/lib/site-config");
    expect(siteConfig.parishFullName).toBe("St. Patrick's Catholic Church, Basorun");
    expect(siteConfig.phones.length).toBeGreaterThan(0);
    expect(siteConfig.email).toMatch(/@/);
  });

  it("lists nav links as same-site paths", async () => {
    vi.resetModules();
    const { siteConfig } = await import("@/lib/site-config");
    expect(siteConfig.navLinks.map((l) => l.href)).toEqual([
      "/",
      "/about",
      "/events",
      "/mass-schedule",
      "/projects",
    ]);
  });
});
