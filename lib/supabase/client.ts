/**
 * Browser-side Supabase client (Phase В).
 *
 * Used inside Client Components and hooks. Session state is kept in cookies
 * by `@supabase/ssr`, so refreshing the page restores the user without
 * re-authenticating. Returns `null` when env vars are missing — every
 * caller must defensively handle this so the app keeps working before the
 * Supabase project is wired up in production.
 */

"use client";

import { createBrowserClient } from "@supabase/ssr";

let cached: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabaseBrowser() {
  if (cached) return cached;
  const url  = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return null;
  cached = createBrowserClient(url, anon);
  return cached;
}

/** True iff Supabase env vars are set (used to gate UI like "Sign in" buttons). */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
