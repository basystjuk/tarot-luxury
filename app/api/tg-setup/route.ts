/**
 * TEMPORARY setup endpoint — DELETE THIS FILE after completing setup.
 *
 * Usage: GET /api/tg-setup?s=<TELEGRAM_WEBHOOK_SECRET>
 *
 * What it does:
 *   1. Reads recent Telegram updates to find the owner's chat_id
 *   2. Registers the webhook at /api/telegram with the secret token
 *   3. Returns all info needed to finish configuration
 */
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  const token  = process.env.TELEGRAM_BOT_TOKEN;

  // ── Guard: require webhook secret as ?s= param ─────────────────────────
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

  // ── Step 1: get updates to find owner chat_id ──────────────────────────
  const updResp = await fetch(
    `https://api.telegram.org/bot${token}/getUpdates?limit=10&allowed_updates=["message"]`
  );
  const upd = await updResp.json();

  if (!upd.ok) {
    return NextResponse.json({
      error: "getUpdates failed — webhook may already be registered.",
      details: upd,
      tip: "If the webhook is already set, check TELEGRAM_CHAT_ID in Vercel instead.",
    });
  }

  const messages = (upd.result ?? [])
    .filter((u: Record<string, unknown>) => u.message)
    .map((u: { message: { chat: { id: number; username?: string; first_name?: string } } }) => ({
      chat_id:    u.message.chat.id,
      username:   u.message.chat.username  ?? "(no username)",
      first_name: u.message.chat.first_name ?? "",
    }));

  if (!messages.length) {
    return NextResponse.json({
      step: "No messages found yet.",
      action: "Send any message to @ellen_soul_taro_bot in Telegram, then reload this page.",
    });
  }

  const owner = messages[0];

  // ── Step 2: register webhook ───────────────────────────────────────────
  const siteUrl = req.nextUrl.origin;
  const whResp = await fetch(
    `https://api.telegram.org/bot${token}/setWebhook`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: `${siteUrl}/api/telegram`,
        secret_token: secret,
        allowed_updates: ["message"],
        drop_pending_updates: true,
      }),
    }
  );
  const whResult = await whResp.json();

  return NextResponse.json({
    "✅ Your chat_id": owner.chat_id,
    "   username":     owner.username,
    "   first_name":   owner.first_name,
    "✅ Webhook":       whResult.description ?? whResult,
    "📋 NEXT STEPS": [
      `1. vercel env add TELEGRAM_CHAT_ID   →  value: ${owner.chat_id}`,
      "2. vercel --prod deploy",
      "3. DELETE the file  app/api/tg-setup/route.ts  and redeploy",
    ],
  });
}
