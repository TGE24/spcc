"use server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { siteConfig } from "@/lib/site-config";

function withError(path: string, message: string) {
  return `${path}?error=${encodeURIComponent(message)}`;
}

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    const message =
      error.code === "invalid_credentials"
        ? "That email and password don't match a staff account. Check both and try again."
        : error.message;
    redirect(withError("/login", message));
  }
  redirect("/admin");
}

// Sends a Supabase password-reset email. The link lands on /auth/confirm,
// which signs the user in and forwards them to /login/reset to choose a new
// password. The response is identical whether or not the email belongs to
// an account, so the form can't be used to discover staff emails.
export async function sendResetLink(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) redirect(withError("/login/forgot", "Enter your staff email address."));

  // Prefer the request's own origin so preview deployments and localhost
  // send links back to themselves; fall back to the configured site URL.
  const origin = (await headers()).get("origin") ?? siteConfig.siteUrl;
  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/confirm?next=/login/reset`,
  });

  if (error && error.status === 429) {
    redirect(withError("/login/forgot", "Too many reset requests. Wait a few minutes, then try again."));
  }
  redirect("/login/forgot?sent=1");
}

export async function updatePassword(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (password.length < 8) redirect(withError("/login/reset", "Use at least 8 characters."));
  if (password !== confirm) redirect(withError("/login/reset", "The two passwords don't match."));

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    const message =
      error.code === "same_password"
        ? "That's your current password. Choose a different one."
        : error.message;
    redirect(withError("/login/reset", message));
  }
  redirect("/admin");
}
