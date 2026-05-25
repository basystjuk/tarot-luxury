/**
 * POST /api/telegram/verify-subscription
 *
 * Checks whether the currently-authenticated user is subscribed to
 * Ellen's Telegram channel via getChatMember. Updates the
 * `subscribed_to_channel` + `channel_checked_at` columns on the
 * profile and returns the result.
 *
 * Requires the user to have already linked their Telegram (so we know
 * their chat_id). Returns 409 if they haven't.
 */

import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { isChannelMember, isTelegramConfigured } from "@/lib/telegram/bot";

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
    .select("telegram_chat_id")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile?.telegram_chat_id) {
    return NextResponse.json({ error: "not_linked" }, { status: 409 });
  }

  const isMember = await isChannelMember(profile.telegram_chat_id);
  if (isMember === null) {
    return NextResponse.json({ error: "check_failed" }, { status: 502 });
  }

  await supa
    .from("profiles")
    .update({
      subscribed_to_channel: isMember,
      channel_checked_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  return NextResponse.json({ subscribed: isMember });
}
