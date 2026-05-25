/**
 * GET /api/admin/users/[id]
 *
 * Full per-user detail for the admin user panel: profile + notification
 * preferences + last 30 tarot pulls + last 20 notifications sent.
 *
 * Auth: same as the list endpoint (preview cookie or CRON_SECRET).
 */

import { NextRequest, NextResponse } from "next/server";
import { isPreviewFromRequest } from "@/lib/preview";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

function authorised(req: NextRequest): boolean {
  if (isPreviewFromRequest(req)) return true;
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") === `Bearer ${secret}`) return true;
  return false;
}

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!authorised(req)) return new NextResponse("Not found", { status: 404 });

  const { id } = await ctx.params;
  if (!/^[0-9a-f-]{30,}$/i.test(id)) {
    return NextResponse.json({ error: "bad_id" }, { status: 400 });
  }

  const admin = getSupabaseAdmin();
  if (!admin) return NextResponse.json({ error: "no_admin_client" }, { status: 503 });

  const [profileRes, prefsRes, historyRes, notifRes] = await Promise.all([
    admin.from("profiles").select("*").eq("id", id).maybeSingle(),
    admin.from("notification_prefs").select("*").eq("user_id", id).maybeSingle(),
    admin.from("tarot_history").select("*").eq("user_id", id).order("day", { ascending: false }).limit(30),
    admin.from("notification_log").select("*").eq("user_id", id).order("sent_at", { ascending: false }).limit(20),
  ]);

  if (profileRes.error) {
    return NextResponse.json({ error: "db_error", detail: profileRes.error.message }, { status: 500 });
  }
  if (!profileRes.data) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({
    profile: profileRes.data,
    prefs: prefsRes.data,
    tarot_history: historyRes.data ?? [],
    notifications: notifRes.data ?? [],
  });
}
