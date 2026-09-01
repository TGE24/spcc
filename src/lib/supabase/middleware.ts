// Refreshes the Supabase auth session on every request. Called from proxy.ts.
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  try {
    // Refreshes the session if expired — required for Server Components,
    // which can't set cookies themselves. Best-effort: if Supabase isn't
    // configured yet (placeholder env vars) or is unreachable, don't take
    // the whole site down over it.
    await supabase.auth.getUser();
  } catch {
    // ignore — public pages still render, admin routes fail closed to /login
  }

  return supabaseResponse;
}
