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
 * Also exports the per-user daily quota check.
 */

import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { consumeDailyQuota } from "@/lib/rate-limit";

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
 * Per-user "1 request per Kyiv day" limit, shared by all server instances.
 * Each tool has its own quota.
 *
 * Returns true if allowed, false if blocked (the caller should respond 429).
 */
export function checkPerUserDailyRate(tool: string, userId: string): Promise<boolean> {
  return consumeDailyQuota(tool, userId);
}
