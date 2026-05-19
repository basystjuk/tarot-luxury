/**
 * Telegram webhook endpoint.
 *
 * Telegram sends every bot update here (POST).
 * We verify the secret header and silently ignore anyone
 * who is not the bot owner.
 */
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  // ── Verify Telegram webhook secret ──────────────────────────────────────
  const expectedSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
  const incomingSecret = req.headers.get("x-telegram-bot-api-secret-token");

  if (!expectedSecret || incomingSecret !== expectedSecret) {
    // Return 200 so Telegram doesn't retry, but do nothing
    return NextResponse.json({ ok: true });
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

  const senderChatId  = String(msg.chat.id);
  const ownerChatId   = process.env.TELEGRAM_CHAT_ID ?? "";

  // ── Only the owner can interact with this bot ────────────────────────────
  if (senderChatId !== ownerChatId) {
    // Silently ignore — return 200 so Telegram doesn't keep retrying
    return NextResponse.json({ ok: true });
  }

  // ── Owner commands (extend as needed) ───────────────────────────────────
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (token && msg.text === "/status") {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: ownerChatId,
        text: "✅ Бот працює. Форми з сайту будуть приходити сюди.",
      }),
    });
  }

  return NextResponse.json({ ok: true });
}
