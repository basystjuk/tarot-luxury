/**
 * POST /api/push/test
 *
 * Sends a small "it works" notification to every subscription the
 * signed-in user has registered. Used by the cabinet's "Send test"
 * button right after the user enables notifications.
 */

import { NextResponse } from "next/server";
import { requireAiAuth } from "@/lib/auth/gate";
import { sendPushToUser, isPushConfigured } from "@/lib/push/send";

export async function POST() {
  const gate = await requireAiAuth();
  if (gate.deny) return gate.deny;

  if (!isPushConfigured()) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  const delivered = await sendPushToUser(gate.user!.id, {
    title: "Ellen Soul ✨",
    body:  "Сповіщення працюють — твій ранковий гороскоп прийде сюди.",
    url:   "/uk/studio/horoscope",
    tag:   "push-test",
  });

  return NextResponse.json({ ok: true, delivered });
}
