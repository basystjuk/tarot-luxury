/**
 * POST /api/push/subscribe
 *
 * Stores (or refreshes) a Web Push subscription for the signed-in user.
 * Client sends the result of `pushManager.subscribe()` serialised via
 * `.toJSON()`. We extract endpoint + keys and upsert by endpoint
 * (browsers refuse to issue duplicates of the same endpoint, so it's
 * a safe natural key).
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAiAuth } from "@/lib/auth/gate";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

interface Body {
  subscription: {
    endpoint: string;
    keys: { p256dh: string; auth: string };
  };
}

export async function POST(req: NextRequest) {
  const gate = await requireAiAuth();
  if (gate.deny) return gate.deny;

  let body: Body;
  try { body = (await req.json()) as Body; }
  catch { return NextResponse.json({ error: "bad_json" }, { status: 400 }); }

  const sub = body.subscription;
  if (!sub?.endpoint || !sub.keys?.p256dh || !sub.keys?.auth) {
    return NextResponse.json({ error: "bad_subscription" }, { status: 400 });
  }

  const admin = getSupabaseAdmin();
  if (!admin) return NextResponse.json({ error: "no_admin" }, { status: 500 });

  const ua = req.headers.get("user-agent") || null;
  const { error } = await admin.from("push_subscriptions").upsert({
    endpoint:     sub.endpoint,
    user_id:      gate.user!.id,
    p256dh:       sub.keys.p256dh,
    auth:         sub.keys.auth,
    ua,
    last_seen_at: new Date().toISOString(),
  }, { onConflict: "endpoint" });

  if (error) {
    console.error("push subscribe error", error);
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
