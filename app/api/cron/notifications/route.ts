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
import { sendPushToUser, isPushConfigured, type PushPayload } from "@/lib/push/send";
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
    `<a href="https://ellen-soul.com/uk/studio/moon-phase">Подивитись повний прогноз →</a>`;
}

function weeklyCardMessage(): string {
  return `<b>🃏 Карта тижня готова</b>\n\n` +
    `Понеділок — час витягти карту, яка задаватиме тон твого тижня.\n\n` +
    `<a href="https://ellen-soul.com/uk/studio/daily-card">Витягнути карту тижня →</a>`;
}

function phasePeakMessage(p: { type: "new" | "full"; date: Date }, moonSignIdx: number): string {
  const phase = p.type === "new" ? "🌑 Новий Місяць" : "🌕 Повний Місяць";
  return `<b>${phase}</b>\n\n` +
    `${fmtKyiv(p.date)} — у знаку ${SIGN_GLYPHS[moonSignIdx]} ${SIGNS_UA[moonSignIdx]}.\n\n` +
    (p.type === "new"
      ? "Час нових намірів. Посій бажання — цикл починається з чистого аркуша."
      : "Кульмінація і відпускання. Подивись, що тримає тебе і вже не служить.") +
    `\n\n<a href="https://ellen-soul.com/uk/studio/moon-phase">Повне послання →</a>`;
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
  daily_horoscope?: boolean;
  push_enabled?: boolean;
};

// ── Web Push helpers ──────────────────────────────────────────────────────
// Telegram messages use Telegram-flavoured HTML; the OS notification needs
// a flat plain-text body. We re-derive the short form here per kind.

function pushFor(kind: "eclipse" | "lunar_return" | "weekly_card" | "moon_phase_peak", opts: {
  eclipse?: EclipseFinding;
  lunarReturnDate?: Date;
  phase?: { type: "new" | "full"; date: Date };
  moonSignIdx?: number;
}): PushPayload {
  switch (kind) {
    case "eclipse": {
      const e = opts.eclipse!;
      const label = e.type === "solar" ? "Сонячне затемнення" : "Місячне затемнення";
      return {
        title: `🌒 ${label}`,
        body:  `Через ${e.hoursAhead} год — ${fmtKyiv(e.date)}. День не для нових починань.`,
        url:   "/uk/studio/moon-phase",
        tag:   `eclipse-${e.date.toISOString().slice(0,10)}`,
      };
    }
    case "lunar_return":
      return {
        title: "🌑 Місячне повернення",
        body:  `Твій 27-денний цикл починається ${fmtKyiv(opts.lunarReturnDate!)}.`,
        url:   "/uk/studio/moon-phase",
        tag:   `lunar-${opts.lunarReturnDate!.toISOString().slice(0,10)}`,
      };
    case "weekly_card":
      return {
        title: "🃏 Карта тижня готова",
        body:  "Понеділок — час витягти карту тижня.",
        url:   "/uk/studio/daily-card",
        tag:   "weekly-card",
      };
    case "moon_phase_peak": {
      const p = opts.phase!;
      const sign = `${SIGN_GLYPHS[opts.moonSignIdx!]} ${SIGNS_UA[opts.moonSignIdx!]}`;
      return {
        title: p.type === "new" ? "🌑 Новий Місяць" : "🌕 Повний Місяць",
        body:  `${fmtKyiv(p.date)} — у знаку ${sign}.`,
        url:   "/uk/studio/moon-phase",
        tag:   `phase-${p.type}-${p.date.toISOString().slice(0,10)}`,
      };
    }
  }
}

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
  const telegramOn = isTelegramConfigured();
  const pushOn     = isPushConfigured();
  if (!telegramOn && !pushOn) {
    return NextResponse.json({ skipped: "no_channels_configured" });
  }
  const admin = getSupabaseAdmin();
  if (!admin) return NextResponse.json({ error: "no_supabase_admin" }, { status: 500 });

  // Users with any reachable channel — either Telegram or at least one
  // browser push subscription. We over-fetch and filter per-user below.
  const { data: tgProfiles } = await admin
    .from("profiles")
    .select("id, telegram_chat_id, natal_moon_lon, display_name")
    .not("telegram_chat_id", "is", null);
  const { data: pushedUsers } = await admin
    .from("push_subscriptions")
    .select("user_id");
  const pushUserIds = new Set((pushedUsers as { user_id: string }[] | null)?.map(p => p.user_id) ?? []);

  // Merge: TG profiles + any user with push but without TG.
  const tgList = (tgProfiles as ProfileRow[] | null) ?? [];
  const tgIds = new Set(tgList.map(p => p.id));
  const pushOnlyIds = [...pushUserIds].filter(id => !tgIds.has(id));
  let profiles: ProfileRow[] = tgList;
  if (pushOnlyIds.length > 0) {
    const { data: extra } = await admin
      .from("profiles")
      .select("id, telegram_chat_id, natal_moon_lon, display_name")
      .in("id", pushOnlyIds);
    profiles = [...tgList, ...((extra as ProfileRow[] | null) ?? [])];
  }
  if (profiles.length === 0) {
    return NextResponse.json({ ok: true, sent: 0, eligible: 0 });
  }

  const userIds = profiles.map(p => p.id);
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
  let pushCount = 0;

  /**
   * Per-kind dispatch: try Telegram (if linked + token configured),
   * fall back / fan-out to web push (if subscribed + push configured).
   * The notification_log is keyed by (user_id, kind, key) — one row
   * across both channels — so we don't double-ping someone tomorrow.
   * The `tag` on the push payload prevents duplicate-channel rendering
   * within a single browser. */
  async function dispatch(
    userId: string, chatId: number | null, pushAllowed: boolean,
    kind: string, key: string,
    tg: () => string, push: () => PushPayload,
    payloadMeta: unknown,
  ): Promise<void> {
    if (await alreadySent(admin, userId, kind, key)) return;
    let anyOk = false;
    if (telegramOn && chatId) {
      const ok = await sendMessage(chatId, tg());
      if (ok) { sentCount++; anyOk = true; }
    }
    if (pushOn && pushAllowed) {
      const delivered = await sendPushToUser(userId, push());
      if (delivered > 0) { pushCount += delivered; anyOk = true; }
    }
    if (anyOk) await logSent(admin, userId, kind, key, payloadMeta);
  }

  for (const profile of profiles) {
    const prefs = prefsMap.get(profile.id);
    if (!prefs) continue;
    const pushAllowed = prefs.push_enabled !== false;
    const chatId = profile.telegram_chat_id ?? null;

    try {
      // ── Eclipse alert ─────────────────────────────────────────────────
      if (eclipse && prefs.eclipse_alerts) {
        const key = `eclipse:${eclipse.date.toISOString().slice(0, 10)}`;
        await dispatch(profile.id, chatId, pushAllowed, "eclipse", key,
          () => eclipseMessage(eclipse),
          () => pushFor("eclipse", { eclipse }),
          { type: eclipse.type });
      }

      // ── Lunar Return ─────────────────────────────────────────────────
      if (prefs.lunar_return && profile.natal_moon_lon != null) {
        const returnJd = findNextLunarReturn(profile.natal_moon_lon, nowJd);
        const hoursAhead = (returnJd - nowJd) * 24;
        if (hoursAhead >= 0 && hoursAhead <= 36) {
          const when = jdToDate(returnJd);
          const key = `lunar_return:${when.toISOString().slice(0, 10)}`;
          await dispatch(profile.id, chatId, pushAllowed, "lunar_return", key,
            () => lunarReturnMessage(when),
            () => pushFor("lunar_return", { lunarReturnDate: when }),
            { when: when.toISOString() });
        }
      }

      // ── Weekly card (Mondays) ────────────────────────────────────────
      if (isMonday && prefs.weekly_card) {
        const key = `weekly:${now.toISOString().slice(0, 10)}`;
        await dispatch(profile.id, chatId, pushAllowed, "weekly_card", key,
          () => weeklyCardMessage(),
          () => pushFor("weekly_card", {}),
          {});
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
        await dispatch(profile.id, chatId, pushAllowed, "moon_phase_peak", key,
          () => phasePeakMessage(phasePeak, signIdx),
          () => pushFor("moon_phase_peak", { phase: phasePeak, moonSignIdx: signIdx }),
          { type: phasePeak.type, signIdx });
      }

    } catch (e) {
      console.error("cron user error", profile.id, e);
    }
  }

  return NextResponse.json({
    ok: true,
    eligible: profiles.length,
    sent_telegram: sentCount,
    sent_push: pushCount,
    eclipse_today: !!eclipse,
    phase_peak_today: !!phasePeak,
    is_monday: isMonday,
  });
}
