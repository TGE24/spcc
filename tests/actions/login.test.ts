import { beforeEach, describe, expect, it, vi } from "vitest";
import { headers } from "next/headers";
import { sendResetLink, signIn, updatePassword } from "@/app/login/actions";
import { siteConfig } from "@/lib/site-config";
import { supabase } from "../helpers/supabase";
import { errorParam, form, redirectTarget } from "../helpers/next";

beforeEach(() => {
  vi.mocked(headers).mockResolvedValue(new Headers({ origin: "https://parish.org" }) as never);
});

describe("signIn", () => {
  it("signs in with the trimmed email and goes to the dashboard", async () => {
    const db = supabase();
    const url = await redirectTarget(signIn(form({ email: "  staff@parish.org ", password: " secret " })));
    expect(db.auth.signInWithPassword).toHaveBeenCalledWith({ email: "staff@parish.org", password: " secret " });
    expect(url).toBe("/admin");
  });

  it("explains wrong credentials in plain language", async () => {
    supabase().auth.signInWithPassword.mockResolvedValueOnce({
      data: {},
      error: { code: "invalid_credentials", message: "Invalid login credentials" },
    });
    const url = await redirectTarget(signIn(form({ email: "a@b.c", password: "x" })));
    expect(url.startsWith("/login?")).toBe(true);
    expect(errorParam(url)).toBe("That email and password don't match a staff account. Check both and try again.");
  });

  it("passes other auth errors through", async () => {
    supabase().auth.signInWithPassword.mockResolvedValueOnce({
      data: {},
      error: { code: "email_not_confirmed", message: "Email not confirmed" },
    });
    expect(errorParam(await redirectTarget(signIn(form({ email: "a@b.c", password: "x" }))))).toBe(
      "Email not confirmed",
    );
  });
});

describe("sendResetLink", () => {
  it("asks for an email first", async () => {
    const db = supabase();
    const url = await redirectTarget(sendResetLink(form({ email: "  " })));
    expect(errorParam(url)).toBe("Enter your staff email address.");
    expect(db.auth.resetPasswordForEmail).not.toHaveBeenCalled();
  });

  it("sends a reset link that returns to this site's confirm route", async () => {
    const db = supabase();
    const url = await redirectTarget(sendResetLink(form({ email: "staff@parish.org" })));
    expect(db.auth.resetPasswordForEmail).toHaveBeenCalledWith("staff@parish.org", {
      redirectTo: "https://parish.org/auth/confirm?next=/login/reset",
    });
    expect(url).toBe("/login/forgot?sent=1");
  });

  it("falls back to the configured site URL without an Origin header", async () => {
    vi.mocked(headers).mockResolvedValue(new Headers() as never);
    const db = supabase();
    await redirectTarget(sendResetLink(form({ email: "staff@parish.org" })));
    expect(db.auth.resetPasswordForEmail).toHaveBeenCalledWith("staff@parish.org", {
      redirectTo: `${siteConfig.siteUrl}/auth/confirm?next=/login/reset`,
    });
  });

  it("shows the same 'sent' screen for unknown emails, so accounts can't be discovered", async () => {
    supabase().auth.resetPasswordForEmail.mockResolvedValueOnce({ data: {}, error: { status: 400, message: "x" } });
    expect(await redirectTarget(sendResetLink(form({ email: "nobody@x.org" })))).toBe("/login/forgot?sent=1");
  });

  it("tells the user to wait when rate limited", async () => {
    supabase().auth.resetPasswordForEmail.mockResolvedValueOnce({ data: {}, error: { status: 429, message: "x" } });
    const url = await redirectTarget(sendResetLink(form({ email: "staff@parish.org" })));
    expect(errorParam(url)).toBe("Too many reset requests. Wait a few minutes, then try again.");
  });
});

describe("updatePassword", () => {
  it("updates the password and goes to the dashboard", async () => {
    const db = supabase();
    const url = await redirectTarget(updatePassword(form({ password: "new-password", confirm: "new-password" })));
    expect(db.auth.updateUser).toHaveBeenCalledWith({ password: "new-password" });
    expect(url).toBe("/admin");
  });

  it("requires at least 8 characters", async () => {
    const db = supabase();
    const url = await redirectTarget(updatePassword(form({ password: "short", confirm: "short" })));
    expect(errorParam(url)).toBe("Use at least 8 characters.");
    expect(db.auth.updateUser).not.toHaveBeenCalled();
  });

  it("accepts exactly 8 characters", async () => {
    expect(await redirectTarget(updatePassword(form({ password: "12345678", confirm: "12345678" })))).toBe("/admin");
  });

  it("requires both entries to match", async () => {
    const url = await redirectTarget(updatePassword(form({ password: "long-enough", confirm: "long-enougH" })));
    expect(errorParam(url)).toBe("The two passwords don't match.");
  });

  it("explains reusing the current password", async () => {
    supabase().auth.updateUser.mockResolvedValueOnce({ data: {}, error: { code: "same_password", message: "x" } });
    const url = await redirectTarget(updatePassword(form({ password: "long-enough", confirm: "long-enough" })));
    expect(errorParam(url)).toBe("That's your current password. Choose a different one.");
  });

  it("passes other errors through, e.g. an expired session", async () => {
    supabase().auth.updateUser.mockResolvedValueOnce({
      data: {},
      error: { code: "session_not_found", message: "Auth session missing!" },
    });
    const url = await redirectTarget(updatePassword(form({ password: "long-enough", confirm: "long-enough" })));
    expect(url.startsWith("/login/reset?")).toBe(true);
    expect(errorParam(url)).toBe("Auth session missing!");
  });
});
