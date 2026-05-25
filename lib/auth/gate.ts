/**
 * AI auth gate (Phase В policy).
 *
 * One helper to enforce the rule: every AI generation endpoint EXCEPT
 * the Daily Card requires a signed-in Supabase user. Daily Card stays
 * anonymous because it's the marketing hook — first hit free, the rest
 * behind sign-in (which doubles as the conversion event).
 *
 * Usage:
 *   const gate = await requireAiAuth(req);
 *   if (gate.deny) return gate.deny; // already a NextResponse 401/503
 *   const user = gate.user;          // typed Supabase user
 *
 * Also returns a per-user rate-limit helper bound to a Map you pass in.
 */

import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

type SupabaseUser = { id: string; email?: string };

export interface AuthGateResult {
  user?: SupabaseUser;
  /** If set, the caller should `return` this immediately. */
  deny?: NextResponse;
}

export async function requireAiAuth(): Promise<AuthGateResult> {
  const supa = await getSupabaseServer();
  if (!supa) {
    return {
      deny: NextResponse.json(
        { error: "not_configured", message: "Auth backend not reachable." },
        { status: 503 }
      ),
    };
  }
  const { data: { user } } = await supa.auth.getUser();
  if (!user) {
    return {
      deny: NextResponse.json(
        {
          error: "auth_required",
          message: "Sign in to use this AI feature. The Daily Card stays free.",
        },
        { status: 401 }
      ),
    };
  }
  return { user: { id: user.id, email: user.email ?? undefined } };
}

/**
 * Per-user "1 request per Kyiv day" rate limit.
 * Caller owns the Map (so each endpoint has its own quota space).
 *
 * Returns true if allowed, false if blocked (the caller should respond 429).
 */
export function checkPerUserDailyRate(map: Map<string, { day: string }>, userId: string): boolean {
  const today = new Date().toLocaleDateString("uk-UA", { timeZone: "Europe/Kiev" });
  const entry = map.get(userId);
  if (!entry || entry.day !== today) {
    map.set(userId, { day: today });
    return true;
  }
  return false;
}
