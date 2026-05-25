/**
 * POST /api/telegram/webhook
 *
 * Receives updates from the Telegram Bot API. We handle three things:
 *   1. /start <token>   — link a chat to the user who issued the token
 *   2. /start (no token) — generic welcome message
 *   3. Anything else    — gentle no-op reply so the user knows the bot heard
 *
 * Security:
 *   - Telegram sends X-Telegram-Bot-Api-Secret-Token if you set it on
 *     the setWebhook call. We compare to TELEGRAM_WEBHOOK_SECRET env var.
 *
 * Uses the service-role Supabase client because there's no logged-in
 * user at the time of the webhook — we resolve identity via the token.
 */

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { sendMessage, isTelegramConfigured, escapeHtml } from "@/lib/telegram/bot";

interface TelegramUser {
  id: number;
  first_name?: string;
  username?: string;
}

interface TelegramChat {
  id: number;
  type: "private" | "group" | "supergroup" | "channel";
}

interface TelegramMessage {
  message_id: number;
  from?: TelegramUser;
  chat: TelegramChat;
  text?: string;
}

interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
}

export async function POST(req: NextRequest) {
  if (!isTelegramConfigured()) {
    return NextResponse.json({ ok: true }); // silently accept until configured
  }
  // Verify the secret header set on setWebhook().
  const expected = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (expected) {
    const got = req.headers.get("x-telegram-bot-api-secret-token");
    if (got !== expected) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  let update: TelegramUpdate;
  try {
    update = await req.json() as TelegramUpdate;
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  const msg = update.message;
  if (!msg?.from || msg.chat.type !== "private" || !msg.text) {
    // We only handle direct messages with text. Channel posts, etc — ignore.
    return NextResponse.json({ ok: true });
  }

  const chatId    = msg.chat.id;
  const text      = msg.text.trim();
  const firstName = msg.from.first_name ?? "";

  // Handle /start [token]
  if (text.startsWith("/start")) {
    const parts = text.split(/\s+/);
    const startParam = parts[1];

    if (startParam) {
      await handleStartWithToken(chatId, startParam, firstName, msg.from.username);
    } else {
      await sendMessage(chatId,
        `<b>✦ Ellen Soul</b>\n\nЦе бот для нотифікацій з твого кабінету. ` +
        `Зайди на сайт, натисни «Підключити Telegram» — і повертайся з посиланням.\n\n` +
        `Це the bot for notifications from your cabinet. Visit the site, ` +
        `click "Connect Telegram" — and come back with the link.`
      );
    }
    return NextResponse.json({ ok: true });
  }

  // Anything else — friendly no-op.
  await sendMessage(chatId,
    `Привіт${firstName ? ` ${escapeHtml(firstName)}` : ""} ✨\n\n` +
    `Я бот для нотифікацій з Ellen Soul. Я не приймаю команд тут — ` +
    `налаштовуй сповіщення у <a href="https://ellen-soul.com/uk/account">кабінеті на сайті</a>.`
  );
  return NextResponse.json({ ok: true });
}

async function handleStartWithToken(
  chatId: number, token: string, firstName: string, username?: string,
): Promise<void> {
  const admin = getSupabaseAdmin();
  if (!admin) {
    await sendMessage(chatId, "Сервер ще не готовий — спробуй пізніше.");
    return;
  }

  // Look up the token. Must exist, not be consumed, not be expired.
  const { data: tok } = await admin
    .from("telegram_link_tokens")
    .select("user_id, expires_at, consumed_at")
    .eq("token", token)
    .maybeSingle();
  if (!tok) {
    await sendMessage(chatId, "Посилання недійсне. Згенеруй нове у кабінеті на сайті.");
    return;
  }
  if (tok.consumed_at) {
    await sendMessage(chatId, "Це посилання вже було використане. Якщо потрібно — створи нове у кабінеті.");
    return;
  }
  if (new Date(tok.expires_at).getTime() < Date.now()) {
    await sendMessage(chatId, "Посилання прострочене (термін дії 10 хвилин). Згенеруй нове у кабінеті.");
    return;
  }

  // Write chat_id + username back to the user's profile.
  await admin
    .from("profiles")
    .update({
      telegram_chat_id: chatId,
      telegram_username: username ?? null,
    })
    .eq("id", tok.user_id);

  // Consume the token.
  await admin
    .from("telegram_link_tokens")
    .update({ consumed_at: new Date().toISOString() })
    .eq("token", token);

  // Confirmation to the user.
  await sendMessage(chatId,
    `<b>✓ Telegram підключено</b>\n\n` +
    `Привіт${firstName ? `, ${escapeHtml(firstName)}` : ""} ✨\n\n` +
    `Тепер ти отримуватимеш сповіщення про затемнення, ` +
    `Lunar Return, важливі моменти Місяця та особисті повідомлення від Ellen.\n\n` +
    `Налаштувати які саме — у <a href="https://ellen-soul.com/uk/account">кабінеті</a>.`
  );
}
