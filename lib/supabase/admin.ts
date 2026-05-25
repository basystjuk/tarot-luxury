/**
 * Service-role Supabase client (Phase Д).
 *
 * Used by server-only routes that need to bypass Row Level Security:
 *   - the Telegram webhook (writes chat_id to profiles of any user
 *     based on the one-time link token — no auth context exists yet)
 *   - the notifications cron job (reads every user's profile)
 *
 * Never expose the service role key to the browser. Never call this
 * from a Client Component or a Route Handler that doesn't validate
 * the caller (cron secret, webhook secret, etc.).
 */

import { createClient } from "@supabase/supabase-js";

export function getSupabaseAdmin() {
  const url  = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const role = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !role) return null;
  return createClient(url, role, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
