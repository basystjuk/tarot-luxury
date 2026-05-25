/**
 * Server-side Supabase client (Phase В).
 *
 * For Route Handlers, Server Components and Server Actions. Reads / writes
 * session cookies via Next.js's `cookies()` API. Treat the returned client
 * as a regular Supabase SDK; auth is automatic via the cookies it reads.
 *
 * Returns `null` if env vars are missing.
 */

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function getSupabaseServer() {
  const url  = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return null;

  const cookieStore = await cookies();

  return createServerClient(url, anon, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // setAll fails in Server Components — Next.js docs note this is
          // expected; middleware refreshes the cookies on every request.
        }
      },
    },
  });
}
