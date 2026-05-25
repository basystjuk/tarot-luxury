/**
 * Supabase auth session refresh — called from the root middleware.
 *
 * Without this, the access token expires after 1h and the user appears
 * "logged out" on the next page navigation. The `@supabase/ssr` package
 * docs require this to be invoked on every request, so we wire it into
 * the same middleware that already handles locale detection.
 *
 * Returns the mutated NextResponse (cookies updated) which the caller
 * should chain with its own redirect / pass-through.
 */

import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

export async function refreshSupabaseSession(req: NextRequest): Promise<NextResponse> {
  const url  = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  let response = NextResponse.next({ request: req });

  if (!url || !anon) return response;

  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll() {
        return req.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          req.cookies.set(name, value);
        }
        response = NextResponse.next({ request: req });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  // Touching getUser() triggers refresh if the token is near expiry.
  await supabase.auth.getUser();
  return response;
}
