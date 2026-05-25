/**
 * POST /api/telegram/link
 *
 * Creates a one-time token tying the current authenticated user to a
 * future bot /start command. The cabinet uses this to render a
 * "Connect Telegram" deeplink that, when tapped, opens the bot with
 * `?start=<token>`. The bot's webhook then resolves the token →
 * user_id and writes the chat_id back to public.profiles.
 *
 * Tokens are short (16 hex bytes) and expire in 10 minutes (enforced
 * client-side by the bot when consuming). RLS lets the user insert
 * a token only for their own user_id, which we satisfy automatically.
 */

import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { botDeeplink, isTelegramConfigured } from "@/lib/telegram/bot";

function genToken(): string {
  // 16 bytes hex — collision-safe for our scale, easy to URL-embed.
  const buf = new Uint8Array(16);
  crypto.getRandomValues(buf);
  return Array.from(buf, b => b.toString(16).padStart(2, "0")).join("");
}

export async function POST() {
  if (!isTelegramConfigured()) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }
  const supa = await getSupabaseServer();
  if (!supa) return NextResponse.json({ error: "not_configured" }, { status: 503 });

  const { data: { user } } = await supa.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const token = genToken();
  const { error } = await supa
    .from("telegram_link_tokens")
    .insert({ token, user_id: user.id });
  if (error) {
    console.error("token insert failed:", error);
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }

  const deeplink = botDeeplink(token);
  if (!deeplink) {
    return NextResponse.json({ error: "bot_username_missing" }, { status: 500 });
  }
  return NextResponse.json({ token, deeplink });
}
