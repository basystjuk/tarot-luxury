/**
 * POST /api/account/import-localstorage
 *
 * Bulk import of pre-Phase-В data from the user's browser:
 *   - Daily-card history (per-day entries, max 30)
 *   - Natal profile (date / time / place / coords / tz / pre-computed moon lon)
 *
 * Authenticated user only. Uses regular (RLS-scoped) Supabase client —
 * RLS ensures we can only write to the current user's rows.
 *
 * Idempotent on history: `tarot_history` has UNIQUE (user_id, day), so
 * re-running with overlapping days no-ops on those rows via `onConflict`.
 * Natal data overwrites whatever was in profiles ONLY IF the profile
 * currently has no birth_date (we don't want to silently overwrite
 * something the user typed by hand later).
 */

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

interface ImportPayload {
  tarot_history?: Array<{
    day: string;             // YYYY-MM-DD
    cardIndex: number;       // 0..77
    reversed?: boolean;
    question?: string;
    reading?: { meaning: string; advice: string; affirmation: string } | null;
    drawnAt?: string;        // ISO
  }>;
  natal?: {
    birthDate: string;       // YYYY-MM-DD
    birthTime: string;       // HH:MM
    birthPlace: string;
    lat: number;
    lon: number;
    tz: string;
    natalMoonLon: number;
  };
}

const KYIV_DAY = /^\d{4}-\d{2}-\d{2}$/;
const TIME = /^\d{2}:\d{2}$/;

export async function POST(req: NextRequest) {
  const supa = await getSupabaseServer();
  if (!supa) return NextResponse.json({ error: "not_configured" }, { status: 503 });
  const { data: { user } } = await supa.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  let body: ImportPayload;
  try { body = (await req.json()) as ImportPayload; }
  catch { return NextResponse.json({ error: "bad_json" }, { status: 400 }); }
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "bad_body" }, { status: 400 });
  }

  const summary = { tarot_inserted: 0, natal_applied: false, errors: [] as string[] };

  // ── Tarot history bulk insert ────────────────────────────────────────────
  if (Array.isArray(body.tarot_history) && body.tarot_history.length > 0) {
    // Validate + shape rows. Anything malformed is silently skipped (we
    // tolerate dirty client data — the user's browser may have been
    // touched by other extensions).
    const rows = body.tarot_history
      .filter(e =>
        typeof e?.day === "string" && KYIV_DAY.test(e.day)
        && Number.isInteger(e?.cardIndex) && e.cardIndex >= 0 && e.cardIndex < 78
      )
      .slice(0, 60) // hard cap — 30 in localStorage but defensive doubling
      .map(e => ({
        user_id: user.id,
        day: e.day,
        card_index: e.cardIndex,
        reversed: Boolean(e.reversed),
        question: typeof e.question === "string" ? e.question.slice(0, 600) : null,
        reading: e.reading ?? null,
        drawn_at: typeof e.drawnAt === "string" ? e.drawnAt : new Date().toISOString(),
      }));
    if (rows.length > 0) {
      // upsert on the UNIQUE (user_id, day) so existing rows are preserved.
      // Switch `ignoreDuplicates: true` so the API doesn't overwrite if
      // the DB already has a different read for that day.
      const { error, data } = await supa
        .from("tarot_history")
        .upsert(rows, { onConflict: "user_id,day", ignoreDuplicates: true })
        .select("id");
      if (error) {
        summary.errors.push(`tarot: ${error.message}`);
      } else {
        // With ignoreDuplicates, .select() returns only freshly-inserted
        // rows — pre-existing (user_id, day) collisions are silently dropped.
        summary.tarot_inserted = data?.length ?? 0;
      }
    }
  }

  // ── Natal profile (only if profile is empty) ─────────────────────────────
  const natal = body.natal;
  if (natal && typeof natal.birthDate === "string" && KYIV_DAY.test(natal.birthDate)
      && typeof natal.birthTime === "string" && TIME.test(natal.birthTime)
      && typeof natal.lat === "number" && typeof natal.lon === "number"
      && typeof natal.tz === "string" && typeof natal.natalMoonLon === "number") {
    const { data: existing } = await supa
      .from("profiles")
      .select("birth_date")
      .eq("id", user.id)
      .maybeSingle();
    if (!existing?.birth_date) {
      const { error } = await supa
        .from("profiles")
        .update({
          birth_date: natal.birthDate,
          birth_time: natal.birthTime,
          birth_place: natal.birthPlace,
          birth_lat:   natal.lat,
          birth_lon:   natal.lon,
          birth_tz:    natal.tz,
          natal_moon_lon: natal.natalMoonLon,
        })
        .eq("id", user.id);
      if (error) summary.errors.push(`natal: ${error.message}`);
      else summary.natal_applied = true;
    }
  }

  return NextResponse.json({ ok: true, ...summary });
}
