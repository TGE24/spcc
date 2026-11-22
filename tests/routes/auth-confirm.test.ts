// @vitest-environment node
import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "@/app/auth/confirm/route";
import { supabase } from "../helpers/supabase";

async function visit(query: string) {
  const response = await GET(new NextRequest(`https://parish.org/auth/confirm?${query}`));
  return { status: response.status, location: response.headers.get("location") };
}

describe("GET /auth/confirm", () => {
  it("verifies a token_hash link and forwards to next", async () => {
    const db = supabase();
    const res = await visit("token_hash=abc&type=recovery&next=/login/reset");
    expect(db.auth.verifyOtp).toHaveBeenCalledWith({ type: "recovery", token_hash: "abc" });
    expect(res.status).toBe(307);
    expect(res.location).toBe("https://parish.org/login/reset");
  });

  it("exchanges a PKCE code and forwards to next", async () => {
    const db = supabase();
    const res = await visit("code=xyz&next=/admin/events");
    expect(db.auth.exchangeCodeForSession).toHaveBeenCalledWith("xyz");
    expect(res.location).toBe("https://parish.org/admin/events");
  });

  it("prefers the code when both kinds are present", async () => {
    const db = supabase();
    await visit("code=xyz&token_hash=abc&type=recovery");
    expect(db.auth.exchangeCodeForSession).toHaveBeenCalled();
    expect(db.auth.verifyOtp).not.toHaveBeenCalled();
  });

  it("defaults next to /admin", async () => {
    expect((await visit("token_hash=abc&type=email")).location).toBe("https://parish.org/admin");
  });

  it("keeps the query string on next", async () => {
    expect((await visit(`code=1&next=${encodeURIComponent("/admin/events?saved=1")}`)).location).toBe(
      "https://parish.org/admin/events?saved=1",
    );
  });

  it.each([
    ["an absolute URL", "https://evil.example/phish"],
    ["a protocol-relative URL", "//evil.example/phish"],
    ["a backslash URL browsers treat as protocol-relative", "/\\evil.example/phish"],
    ["a tab-smuggled protocol-relative URL", "/\t/evil.example"],
    ["a javascript: URL", "javascript:alert(1)"],
  ])("never forwards to %s", async (_label, next) => {
    const res = await visit(`code=1&next=${encodeURIComponent(next)}`);
    expect(new URL(res.location!).origin).toBe("https://parish.org");
    expect(res.location).toBe("https://parish.org/admin");
  });

  it("sends an invalid or expired link to the reset page", async () => {
    const db = supabase();
    db.auth.verifyOtp.mockResolvedValueOnce({ data: {}, error: { message: "expired" } });
    expect((await visit("token_hash=old&type=recovery&next=/admin")).location).toBe(
      "https://parish.org/login/reset",
    );
  });

  it("sends a failed code exchange to the reset page", async () => {
    const db = supabase();
    db.auth.exchangeCodeForSession.mockResolvedValueOnce({ data: {}, error: { message: "bad code" } });
    expect((await visit("code=bad")).location).toBe("https://parish.org/login/reset");
  });

  it("sends a link with neither code nor token to the reset page", async () => {
    expect((await visit("next=/admin")).location).toBe("https://parish.org/login/reset");
  });

  it("needs a type alongside token_hash", async () => {
    const db = supabase();
    expect((await visit("token_hash=abc")).location).toBe("https://parish.org/login/reset");
    expect(db.auth.verifyOtp).not.toHaveBeenCalled();
  });

  it("treats a Supabase outage as a failed link", async () => {
    const db = supabase();
    db.auth.verifyOtp.mockRejectedValueOnce(new Error("fetch failed"));
    expect((await visit("token_hash=abc&type=recovery")).location).toBe("https://parish.org/login/reset");
  });
});
