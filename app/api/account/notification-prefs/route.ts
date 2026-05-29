/**
 * GET / POST /api/account/notification-prefs
 *
 * Read or update the current user's Telegram notification preferences.
 * Row is auto-created by trigger when profile is born — we just upsert
 * on POST as a safety net for old profiles that pre-date Phase Д.
 */

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

type Prefs = {
  daily_card?: boolean;
  weekly_card?: boolean;
  eclipse_alerts?: boolean;
  lunar_return?: boolean;
  moon_phase_peaks?: boolean;
  ellen_news?: boolean;
  solar_return?: boolean;
  mercury_retrograde?: boolean;
  daily_horoscope?: boolean;
  push_enabled?: boolean;
};

const KEYS = new Set<keyof Prefs>([
  "daily_card", "weekly_card", "eclipse_alerts", "lunar_return",
  "moon_phase_peaks", "ellen_news",
  "solar_return", "mercury_retrograde", "daily_horoscope", "push_enabled",
]);

export async function GET() {
  const supa = await getSupabaseServer();
  if (!supa) return NextResponse.json({ error: "not_configured" }, { status: 503 });
  const { data: { user } } = await supa.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const { data, error } = await supa
    .from("notification_prefs")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();
  if (error) return NextResponse.json({ error: "db_error" }, { status: 500 });
  return NextResponse.json({ prefs: data });
}

export async function POST(req: NextRequest) {
  const supa = await getSupabaseServer();
  if (!supa) return NextResponse.json({ error: "not_configured" }, { status: 503 });
  const { data: { user } } = await supa.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "bad_json" }, { status: 400 }); }
  if (!body || typeof body !== "object") return NextResponse.json({ error: "bad_body" }, { status: 400 });

  const patch: Prefs = {};
  for (const [k, v] of Object.entries(body)) {
    if (KEYS.has(k as keyof Prefs) && typeof v === "boolean") {
      (patch as Record<string, boolean>)[k] = v;
    }
  }

  // Upsert — safe for old profiles missing a prefs row.
  const { data, error } = await supa
    .from("notification_prefs")
    .upsert({ user_id: user.id, ...patch }, { onConflict: "user_id" })
    .select("*")
    .maybeSingle();
  if (error) {
    console.error("prefs upsert error:", error);
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }
  return NextResponse.json({ prefs: data });
}
