/**
 * TEMPORARY setup endpoint — DELETE THIS FILE after completing setup.
 *
 * Usage: GET /api/tg-setup?s=<TELEGRAM_WEBHOOK_SECRET>
 *
 * What it does:
 *   1. Shows ALL unique senders who have messaged the bot
 *      (both you and the tarot reader should message the bot first)
 *   2. Registers the webhook at /api/telegram with the secret token
 */
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  const token  = process.env.TELEGRAM_BOT_TOKEN;

  if (!secret) {
    return NextResponse.json(
      { error: "TELEGRAM_WEBHOOK_SECRET is not set in Vercel env vars." },
      { status: 500 }
    );
  }
  if (req.nextUrl.searchParams.get("s") !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!token) {
    return NextResponse.json(
      { error: "TELEGRAM_BOT_TOKEN is not set." },
      { status: 500 }
    );
  }

  // ── Fetch recent updates ─────────────────────────────────────────────────
  const updResp = await fetch(
    `https://api.telegram.org/bot${token}/getUpdates?limit=50&allowed_updates=["message"]`
  );
  const upd = await updResp.json();

  if (!upd.ok) {
    return NextResponse.json({
      error:   "getUpdates failed — webhook is probably already registered.",
      details: upd,
      tip:     "If webhook is already set, the chat_ids are already saved. Just check TELEGRAM_CHAT_IDS in Vercel.",
    });
  }

  // Deduplicate by chat_id — keep only unique senders
  const seen = new Set<number>();
  const senders: { chat_id: number; username: string; first_name: string }[] = [];

  for (const u of upd.result ?? []) {
    const chat = u.message?.chat;
    if (!chat || seen.has(chat.id)) continue;
    seen.add(chat.id);
    senders.push({
      chat_id:    chat.id,
      username:   chat.username   ?? "(no username)",
      first_name: chat.first_name ?? "",
    });
  }

  if (!senders.length) {
    return NextResponse.json({
      step:   "No messages found yet.",
      action: "Both you AND the tarot reader should send any message to @ellen_soul_taro_bot, then reload this page.",
    });
  }

  // Build the comma-separated value for TELEGRAM_CHAT_IDS
  const chatIdsValue = senders.map(s => s.chat_id).join(",");

  // ── Register webhook ─────────────────────────────────────────────────────
  const siteUrl = req.nextUrl.origin;
  const whResp  = await fetch(
    `https://api.telegram.org/bot${token}/setWebhook`,
    {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url:                  `${siteUrl}/api/telegram`,
        secret_token:         secret,
        allowed_updates:      ["message"],
        drop_pending_updates: true,
      }),
    }
  );
  const whResult = await whResp.json();

  return NextResponse.json({
    "👥 Senders found": senders,
    "✅ Webhook":        whResult.description ?? whResult,
    "📋 NEXT STEPS": [
      `1. vercel env add TELEGRAM_CHAT_IDS  →  value: ${chatIdsValue}`,
      "   (comma-separated, no spaces)",
      "2. vercel --prod deploy",
      "3. Test: send /status to the bot — both people should get a reply",
      "4. DELETE  app/api/tg-setup/route.ts  and redeploy",
    ],
  });
}
