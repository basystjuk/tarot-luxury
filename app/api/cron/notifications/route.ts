/**
 * GET /api/cron/notifications
 *
 * Daily 06:00 Kyiv cron that fans out personalised Telegram notifications.
 * Configured via Vercel Cron (see vercel.json). Verified by a CRON_SECRET
 * header to keep it from being triggered by the public.
 *
 * Categories evaluated each run (per-user, per-preference toggle):
 *   1. eclipse_alerts  — any eclipse within 36h of "now" (Sun/Moon-node geom)
 *   2. lunar_return    — user's natal Moon return within next 36h
 *   3. weekly_card     — Mondays only; gentle reminder the weekly card refreshed
 *   4. moon_phase_peaks — exact New / Full Moon within next 36h
 *
 * Deduplication: every send writes to notification_log with a unique
 * (user_id, kind, key) key, where key encodes the event date (e.g.
 * "eclipse:2026-08-12"). Re-runs of the cron on the same day skip
 * already-logged users.
 *
 * Errors per user are caught and logged — one failure shouldn't abort
 * the whole batch.
 */

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { sendMessage, isTelegramConfigured } from "@/lib/telegram/bot";
import {
  dateToJD, calcPlanetDeg, findNextLunarReturn, jdToDate,
  SIGNS_UA, SIGN_GLYPHS,
} from "@/lib/astro/calculations";

export const maxDuration = 60; // up to a minute — many small Telegram calls

// ── Auth ───────────────────────────────────────────────────────────────────
function isAuthorised(req: NextRequest): boolean {
  // Vercel Cron sends Authorization: Bearer <CRON_SECRET> automatically
  // when the secret is set in the project's env vars.
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const auth = req.headers.get("authorization") ?? "";
  return auth === `Bearer ${secret}`;
}

// ── Astro helpers ──────────────────────────────────────────────────────────

interface EclipseFinding {
  type: "solar" | "lunar";
  date: Date;        // when the eclipse is exact
  hoursAhead: number;
}

function angDist(a: number, b: number): number {
  let d = Math.abs(((a - b) % 360 + 360) % 360);
  if (d > 180) d = 360 - d;
  return d;
}

/** Mean Lunar Node — good enough for eclipse-window detection. */
function meanNode(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0;
  const omega = 125.04452 - 1934.136261 * T;
  return ((omega % 360) + 360) % 360;
}

/**
 * Scan the next 36 hours for an eclipse-tight Sun-Moon-Node alignment.
 * Returns the FIRST hit so daily cron sends one alert per day max.
 */
function findUpcomingEclipse(fromJd: number): EclipseFinding | null {
  for (let hour = 0; hour < 36; hour++) {
    const jd = fromJd + hour / 24;
    const sunLon  = calcPlanetDeg(0, jd);
    const moonLon = calcPlanetDeg(1, jd);
    const elong = ((moonLon - sunLon) % 360 + 360) % 360;
    const nodeLon = meanNode(jd);
    const southNode = (nodeLon + 180) % 360;
    const sunNodeDist  = Math.min(angDist(sunLon, nodeLon),  angDist(sunLon, southNode));
    const moonNodeDist = Math.min(angDist(moonLon, nodeLon), angDist(moonLon, southNode));
    const isNearNew  = elong < 13 || elong > 347;
    const isNearFull = Math.abs(elong - 180) < 13;
    if (isNearNew && sunNodeDist < 18) {
      return { type: "solar", date: jdToDate(jd), hoursAhead: hour };
    }
    if (isNearFull && moonNodeDist < 12) {
      return { type: "lunar", date: jdToDate(jd), hoursAhead: hour };
    }
  }
  return null;
}

/** Is today Monday in Kyiv? */
function isMondayKyiv(now: Date): boolean {
  const wd = new Intl.DateTimeFormat("en-US", { timeZone: "Europe/Kiev", weekday: "short" })
    .format(now);
  return wd === "Mon";
}

/** Distance in degrees from full or new moon (whichever is closer) within next 36h. */
function findUpcomingPhasePeak(fromJd: number): { type: "new" | "full"; date: Date; hoursAhead: number } | null {
  for (let hour = 0; hour < 36; hour++) {
    const jd = fromJd + hour / 24;
    const sunLon  = calcPlanetDeg(0, jd);
    const moonLon = calcPlanetDeg(1, jd);
    const elong = ((moonLon - sunLon) % 360 + 360) % 360;
    if (elong < 0.5 || elong > 359.5) return { type: "new",  date: jdToDate(jd), hoursAhead: hour };
    if (Math.abs(elong - 180) < 0.5)    return { type: "full", date: jdToDate(jd), hoursAhead: hour };
  }
  return null;
}

// ── Message templates ──────────────────────────────────────────────────────

function fmtKyiv(d: Date): string {
  return d.toLocaleString("uk-UA", {
    timeZone: "Europe/Kiev",
    weekday: "short", day: "numeric", month: "long",
    hour: "2-digit", minute: "2-digit",
  });
}

function eclipseMessage(e: EclipseFinding): string {
  const kind = e.type === "solar" ? "🌒 Сонячне затемнення" : "🌕 Місячне затемнення";
  return `<b>${kind}</b>\n\n` +
    `Через ${e.hoursAhead} год — ${fmtKyiv(e.date)}.\n\n` +
    `День затемнення — не для нових починань. Спостерігай, відпускай те, що вже не служить, ` +
    `і не довіряй гострим рішенням сьогодні. Поверни увагу всередину.`;
}

function lunarReturnMessage(when: Date): string {
  return `<b>🌑 Місячне повернення</b>\n\n` +
    `Твій особистий «місячний новий місяць» починається ${fmtKyiv(when)}.\n\n` +
    `Це початок твого 27-денного емоційного циклу. ` +
    `<a href="https://tarot-olena.com/uk/studio/moon-phase">Подивитись повний прогноз →</a>`;
}

function weeklyCardMessage(): string {
  return `<b>🃏 Карта тижня готова</b>\n\n` +
    `Понеділок — час витягти карту, яка задаватиме тон твого тижня.\n\n` +
    `<a href="https://tarot-olena.com/uk/studio/daily-card">Витягнути карту тижня →</a>`;
}

function phasePeakMessage(p: { type: "new" | "full"; date: Date }, moonSignIdx: number): string {
  const phase = p.type === "new" ? "🌑 Новий Місяць" : "🌕 Повний Місяць";
  return `<b>${phase}</b>\n\n` +
    `${fmtKyiv(p.date)} — у знаку ${SIGN_GLYPHS[moonSignIdx]} ${SIGNS_UA[moonSignIdx]}.\n\n` +
    (p.type === "new"
      ? "Час нових намірів. Посій бажання — цикл починається з чистого аркуша."
      : "Кульмінація і відпускання. Подивись, що тримає тебе і вже не служить.") +
    `\n\n<a href="https://tarot-olena.com/uk/studio/moon-phase">Повне послання →</a>`;
}

// ── Send + log ─────────────────────────────────────────────────────────────

type ProfileRow = {
  id: string;
  telegram_chat_id: number | null;
  natal_moon_lon: number | null;
  display_name: string | null;
};
type PrefsRow = {
  user_id: string;
  daily_card: boolean;
  weekly_card: boolean;
  eclipse_alerts: boolean;
  lunar_return: boolean;
  moon_phase_peaks: boolean;
  ellen_news: boolean;
};

async function alreadySent(
  admin: ReturnType<typeof getSupabaseAdmin>,
  userId: string, kind: string, key: string,
): Promise<boolean> {
  if (!admin) return true;
  const { data } = await admin
    .from("notification_log")
    .select("id")
    .eq("user_id", userId).eq("kind", kind).eq("key", key)
    .maybeSingle();
  return Boolean(data);
}

async function logSent(
  admin: ReturnType<typeof getSupabaseAdmin>,
  userId: string, kind: string, key: string, payload: unknown,
): Promise<void> {
  if (!admin) return;
  await admin.from("notification_log").insert({
    user_id: userId, kind, key, payload,
  });
}

// ── Main handler ───────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  if (!isAuthorised(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!isTelegramConfigured()) {
    return NextResponse.json({ skipped: "no_telegram_token" });
  }
  const admin = getSupabaseAdmin();
  if (!admin) return NextResponse.json({ error: "no_supabase_admin" }, { status: 500 });

  // Fetch all users with a linked Telegram chat + their prefs.
  const { data: profiles } = await admin
    .from("profiles")
    .select("id, telegram_chat_id, natal_moon_lon, display_name")
    .not("telegram_chat_id", "is", null);
  if (!profiles || profiles.length === 0) {
    return NextResponse.json({ ok: true, sent: 0, eligible: 0 });
  }

  const userIds = (profiles as ProfileRow[]).map(p => p.id);
  const { data: prefsRows } = await admin
    .from("notification_prefs")
    .select("*")
    .in("user_id", userIds);
  const prefsMap = new Map<string, PrefsRow>(
    (prefsRows as PrefsRow[] | null)?.map(p => [p.user_id, p]) ?? [],
  );

  const now = new Date();
  const nowJd = dateToJD(
    now.getUTCFullYear(), now.getUTCMonth() + 1, now.getUTCDate(),
    now.getUTCHours(), now.getUTCMinutes(), 0,
  );

  // Global astro events (same for everyone) — compute once.
  const eclipse = findUpcomingEclipse(nowJd);
  const phasePeak = findUpcomingPhasePeak(nowJd);
  const isMonday = isMondayKyiv(now);

  let sentCount = 0;

  for (const profile of profiles as ProfileRow[]) {
    if (!profile.telegram_chat_id) continue;
    const prefs = prefsMap.get(profile.id);
    if (!prefs) continue;

    try {
      // ── Eclipse alert ─────────────────────────────────────────────────
      if (eclipse && prefs.eclipse_alerts) {
        const key = `eclipse:${eclipse.date.toISOString().slice(0, 10)}`;
        if (!(await alreadySent(admin, profile.id, "eclipse", key))) {
          const ok = await sendMessage(profile.telegram_chat_id, eclipseMessage(eclipse));
          if (ok) {
            await logSent(admin, profile.id, "eclipse", key, { type: eclipse.type });
            sentCount++;
          }
        }
      }

      // ── Lunar Return (per-user, depends on natal Moon) ───────────────
      if (prefs.lunar_return && profile.natal_moon_lon != null) {
        const returnJd = findNextLunarReturn(profile.natal_moon_lon, nowJd);
        const hoursAhead = (returnJd - nowJd) * 24;
        if (hoursAhead >= 0 && hoursAhead <= 36) {
          const when = jdToDate(returnJd);
          const key = `lunar_return:${when.toISOString().slice(0, 10)}`;
          if (!(await alreadySent(admin, profile.id, "lunar_return", key))) {
            const ok = await sendMessage(profile.telegram_chat_id, lunarReturnMessage(when));
            if (ok) {
              await logSent(admin, profile.id, "lunar_return", key, { when: when.toISOString() });
              sentCount++;
            }
          }
        }
      }

      // ── Weekly card (Mondays) ────────────────────────────────────────
      if (isMonday && prefs.weekly_card) {
        const key = `weekly:${now.toISOString().slice(0, 10)}`;
        if (!(await alreadySent(admin, profile.id, "weekly_card", key))) {
          const ok = await sendMessage(profile.telegram_chat_id, weeklyCardMessage());
          if (ok) {
            await logSent(admin, profile.id, "weekly_card", key, {});
            sentCount++;
          }
        }
      }

      // ── New / Full Moon peaks ────────────────────────────────────────
      if (phasePeak && prefs.moon_phase_peaks) {
        const moonLonAt = calcPlanetDeg(1, dateToJD(
          phasePeak.date.getUTCFullYear(), phasePeak.date.getUTCMonth() + 1,
          phasePeak.date.getUTCDate(), phasePeak.date.getUTCHours(),
          phasePeak.date.getUTCMinutes(), 0,
        ));
        const signIdx = Math.floor(((moonLonAt % 360) + 360) % 360 / 30);
        const key = `phase_${phasePeak.type}:${phasePeak.date.toISOString().slice(0, 10)}`;
        if (!(await alreadySent(admin, profile.id, "moon_phase_peak", key))) {
          const ok = await sendMessage(profile.telegram_chat_id, phasePeakMessage(phasePeak, signIdx));
          if (ok) {
            await logSent(admin, profile.id, "moon_phase_peak", key, { type: phasePeak.type, signIdx });
            sentCount++;
          }
        }
      }
    } catch (e) {
      // Per-user errors must not abort the batch.
      console.error("cron user error", profile.id, e);
    }
  }

  return NextResponse.json({
    ok: true,
    eligible: profiles.length,
    sent: sentCount,
    eclipse_today: !!eclipse,
    phase_peak_today: !!phasePeak,
    is_monday: isMonday,
  });
}
