// Landing point for Supabase email links (currently: password reset).
// Handles both link styles Supabase can send:
//  - ?code=…               PKCE flow (the default email template)
//  - ?token_hash=…&type=…  custom templates using {{ .TokenHash }}
// Either way the user ends up signed in, then forwarded to `next`.
import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  const next = safeNext(searchParams.get("next"), origin);

  let ok = false;
  try {
    const supabase = await createClient();
    if (code) {
      ok = !(await supabase.auth.exchangeCodeForSession(code)).error;
    } else if (tokenHash && type) {
      ok = !(await supabase.auth.verifyOtp({ type, token_hash: tokenHash })).error;
    }
  } catch {
    ok = false;
  }

  return NextResponse.redirect(new URL(ok ? next : "/login/reset", origin));
}

// Only same-site paths, so the link can't bounce users elsewhere. Checking
// the string alone isn't enough: browsers read "/\evil.com" and "/\t/evil.com"
// as protocol-relative, so resolve it the way the browser will and require
// our own origin.
function safeNext(nextParam: string | null, origin: string) {
  if (!nextParam || !nextParam.startsWith("/")) return "/admin";
  try {
    const url = new URL(nextParam, origin);
    if (url.origin !== origin) return "/admin";
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return "/admin";
  }
}
