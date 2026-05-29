/**
 * POST /api/push/unsubscribe
 *
 * Removes a Web Push subscription for the signed-in user.
 * Body: { endpoint: string }. Idempotent — no error if the row is gone.
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAiAuth } from "@/lib/auth/gate";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  const gate = await requireAiAuth();
  if (gate.deny) return gate.deny;

  let body: { endpoint?: string };
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "bad_json" }, { status: 400 }); }

  if (!body.endpoint) return NextResponse.json({ error: "missing_endpoint" }, { status: 400 });

  const admin = getSupabaseAdmin();
  if (!admin) return NextResponse.json({ error: "no_admin" }, { status: 500 });

  // Bound the delete by user_id so a user can only delete their own rows
  // even though we also delete by endpoint (defence in depth on top of RLS).
  await admin
    .from("push_subscriptions")
    .delete()
    .eq("endpoint", body.endpoint)
    .eq("user_id", gate.user!.id);

  return NextResponse.json({ ok: true });
}
