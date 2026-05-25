/**
 * POST /api/admin/users/[id]/send-message
 *
 * Ellen sends a personal Telegram message to one specific user from the
 * admin panel. The message text comes from the request body; the bot
 * token + chat_id are resolved server-side.
 *
 * Logs to notification_log with kind="ellen_manual" so Ellen can audit
 * what she sent (and so the user's "notifications received" page —
 * future — shows everything).
 */

import { NextRequest, NextResponse } from "next/server";
import { isPreviewFromRequest } from "@/lib/preview";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { sendMessage, isTelegramConfigured, escapeHtml } from "@/lib/telegram/bot";

function authorised(req: NextRequest): boolean {
  if (isPreviewFromRequest(req)) return true;
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") === `Bearer ${secret}`) return true;
  return false;
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!authorised(req)) return new NextResponse("Not found", { status: 404 });
  if (!isTelegramConfigured()) {
    return NextResponse.json({ error: "telegram_not_configured" }, { status: 503 });
  }

  const { id } = await ctx.params;
  if (!/^[0-9a-f-]{30,}$/i.test(id)) {
    return NextResponse.json({ error: "bad_id" }, { status: 400 });
  }

  let body: { text?: string; rawHtml?: boolean } = {};
  try { body = await req.json(); } catch { /* */ }
  const raw = (body.text ?? "").trim();
  if (!raw) return NextResponse.json({ error: "empty_text" }, { status: 400 });
  if (raw.length > 4000) return NextResponse.json({ error: "too_long" }, { status: 400 });

  const admin = getSupabaseAdmin();
  if (!admin) return NextResponse.json({ error: "no_admin_client" }, { status: 503 });

  const { data: profile } = await admin
    .from("profiles")
    .select("telegram_chat_id, display_name")
    .eq("id", id)
    .maybeSingle();
  if (!profile?.telegram_chat_id) {
    return NextResponse.json({ error: "not_linked" }, { status: 409 });
  }

  // We accept either rendered HTML (for power-user flexibility — admin can
  // use <b>, <i>, <a>) or plain text (we escape it). Default is escape.
  const text = body.rawHtml ? raw : escapeHtml(raw);
  // Optional sender prefix so the user can tell apart auto-cron messages
  // from a personal one from Ellen.
  const stamped = `<b>✦ Ellen</b>\n\n${text}`;

  const ok = await sendMessage(profile.telegram_chat_id, stamped);
  if (ok) {
    // Audit log
    await admin.from("notification_log").insert({
      user_id: id,
      kind: "ellen_manual",
      key: `manual:${Date.now()}`,
      payload: { text: raw.slice(0, 500), rawHtml: !!body.rawHtml },
    });
  }
  return NextResponse.json({ sent: ok });
}
