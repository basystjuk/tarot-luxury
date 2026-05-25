/**
 * POST /api/telegram/test-message
 *
 * Sends a one-off test notification to the current user's linked
 * Telegram chat. Used by the cabinet's "Send a test message" button so
 * the user can confirm the channel works end-to-end before relying on
 * scheduled notifications.
 */

import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { sendMessage, isTelegramConfigured } from "@/lib/telegram/bot";

export async function POST() {
  if (!isTelegramConfigured()) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }
  const supa = await getSupabaseServer();
  if (!supa) return NextResponse.json({ error: "not_configured" }, { status: 503 });

  const { data: { user } } = await supa.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const { data: profile } = await supa
    .from("profiles")
    .select("telegram_chat_id, display_name")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile?.telegram_chat_id) {
    return NextResponse.json({ error: "not_linked" }, { status: 409 });
  }

  const name = profile.display_name ? `, ${profile.display_name}` : "";
  const ok = await sendMessage(profile.telegram_chat_id,
    `<b>✦ Перевірка зв'язку</b>\n\n` +
    `Привіт${name} ✨\n\n` +
    `Якщо ти бачиш це повідомлення — Telegram підключено правильно. ` +
    `Сповіщення про затемнення, Lunar Return та інші важливі моменти ` +
    `надходитимуть сюди.\n\n` +
    `Налаштування — у твоєму <a href="https://tarot-olena.com/uk/account">кабінеті</a>.`
  );
  return NextResponse.json({ sent: ok });
}
