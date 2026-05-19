/**
 * Telegram webhook endpoint.
 *
 * Telegram sends every bot update here (POST).
 * Only chat IDs listed in TELEGRAM_CHAT_IDS can interact with the bot.
 * Everyone else is silently ignored (200 returned so Telegram stops retrying).
 */
import { NextRequest, NextResponse } from "next/server";

/** Parse TELEGRAM_CHAT_IDS env var into a Set of string IDs */
function allowedIds(): Set<string> {
  const raw = process.env.TELEGRAM_CHAT_IDS ?? process.env.TELEGRAM_CHAT_ID ?? "";
  return new Set(
    raw.split(",").map(s => s.trim()).filter(Boolean)
  );
}

export async function POST(req: NextRequest) {
  // ── Verify Telegram webhook secret ──────────────────────────────────────
  const expectedSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
  const incomingSecret = req.headers.get("x-telegram-bot-api-secret-token");

  if (!expectedSecret || incomingSecret !== expectedSecret) {
    return NextResponse.json({ ok: true }); // silent ignore
  }

  // ── Parse update ─────────────────────────────────────────────────────────
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: true });
  }

  const msg = body.message as
    | { chat: { id: number }; text?: string }
    | undefined;

  if (!msg) return NextResponse.json({ ok: true });

  const senderChatId = String(msg.chat.id);

  // ── Block everyone not on the allowlist ──────────────────────────────────
  if (!allowedIds().has(senderChatId)) {
    return NextResponse.json({ ok: true }); // silent ignore
  }

  // ── Commands for allowed users ───────────────────────────────────────────
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (token && msg.text === "/status") {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: senderChatId,
        text:    "✅ Бот працює. Заявки з сайту будуть приходити сюди.",
      }),
    });
  }

  return NextResponse.json({ ok: true });
}
