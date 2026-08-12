/**
 * GET /api/cron/notifications
 *
 * Daily 06:00 Kyiv cron that fans out personalised Telegram notifications.
 * Configured via Vercel Cron (see vercel.json). Verified by a CRON_SECRET
 * header to keep it from being triggered by the public.
 *
 * Categories evaluated each run (per-user, per-preference toggle):
 *   1. eclipse_alerts  — a real eclipse within 36h of "now" (Meeus ch.54)
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
  findEclipseWithin, type Eclipse,
  SIGNS_UA, SIGN_GLYPHS,
} from "@/lib/astro/calculations";
import { computeNatalSnapshot } from "@/lib/astro/natal-snapshot";
import { buildDayReading, formatHM, calcPersonalDay, localDayFor } from "@/lib/astro/horoscope";
import { ianaToOffsetHours } from "@/app/[lang]/studio/moon-phase/_natal";

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

/** How far ahead we look for astro events — one cron run's worth plus slack. */
const HORIZON_HOURS = 36;

interface EclipseAlert {
  eclipse: Eclipse;
  hoursAhead: number;
}

/**
 * The next eclipse worth telling people about, within HORIZON_HOURS.
 *
 * The geometry lives in lib/astro/calculations (findEclipseWithin) — it
 * returns the exact instant of the eclipse, not the moment we noticed it.
 *
 * Penumbral lunar eclipses are filtered out by owner's decision (2026-08-12):
 * the Moon passes through the faint outer shadow only, nothing is visible to
 * the naked eye, and announcing one invites "I looked and saw nothing".
 *
 * Cron runs every 24h against a 36h horizon, so every eclipse is caught with
 * 12–36h of lead time — never "in 0 hours", never after the fact.
 */
function findEclipseAlert(fromJd: number): EclipseAlert | null {
  const eclipse = findEclipseWithin(fromJd, HORIZON_HOURS);
  if (!eclipse) return null;
  if (eclipse.type === "lunar" && eclipse.kind === "penumbral") return null;
  return { eclipse, hoursAhead: Math.round((eclipse.jd - fromJd) * 24) };
}

/**
 * The zone a user's times are rendered in. profiles.tz is what they picked in
 * the cabinet; Kyiv is the fallback for everyone who never picked one, which
 * is exactly the behaviour every user had before the column existed.
 */
const FALLBACK_ZONE = "Europe/Kiev";
function zoneOf(profile: { tz?: string | null }): string {
  return profile.tz || FALLBACK_ZONE;
}

/** Is today Monday where the user lives? */
function isMondayIn(now: Date, tz: string): boolean {
  const wd = new Intl.DateTimeFormat("en-US", { timeZone: tz, weekday: "short" })
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

/**
 * Detect a planetary "station" — the moment a planet's apparent motion
 * changes direction (direct→retrograde or retrograde→direct) — within the
 * next `hours`. We sample the geocentric longitude at 6-hour steps and
 * watch for the daily-motion sign to flip. Returns the first flip found.
 *
 * Signed daily motion is estimated by central difference. A sign change
 * between consecutive samples brackets a station.
 */
function findPlanetStation(
  planetIdx: number, fromJd: number, hours: number,
): { kind: "retrograde" | "direct"; date: Date; hoursAhead: number } | null {
  const step = 6 / 24;                       // 6-hour sampling
  const dh   = 0.5;                           // half-day for the derivative
  function motion(jd: number): number {
    let d = calcPlanetDeg(planetIdx, jd + dh) - calcPlanetDeg(planetIdx, jd - dh);
    // Unwrap the 0/360 seam so a forward planet near 360→0 isn't read as huge negative.
    if (d > 180) d -= 360;
    if (d < -180) d += 360;
    return d;
  }
  let prev = motion(fromJd);
  for (let h = step * 24; h <= hours; h += step * 24) {
    const jd = fromJd + h / 24;
    const cur = motion(jd);
    if (prev === 0) { prev = cur; continue; }
    if ((prev > 0 && cur < 0) || (prev < 0 && cur > 0)) {
      return {
        kind: cur < 0 ? "retrograde" : "direct",
        date: jdToDate(jd),
        hoursAhead: Math.round(h),
      };
    }
    prev = cur;
  }
  return null;
}

/** Is `birthDate` (YYYY-MM-DD) the user's birthday today, where they live? */
function isBirthdayIn(birthDate: string | null, now: Date, tz: string): boolean {
  if (!birthDate) return false;
  const [, mo, d] = birthDate.split("-");
  const todayMd = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz, month: "2-digit", day: "2-digit",
  }).format(now); // "MM-DD"
  return todayMd === `${mo}-${d}`;
}

// ── Message templates ──────────────────────────────────────────────────────

/** "ср, 12 серпня о 20:46" in the user's own zone. */
function fmtDateTime(d: Date, tz: string): string {
  return d.toLocaleString("uk-UA", {
    timeZone: tz,
    weekday: "short", day: "numeric", month: "long",
    hour: "2-digit", minute: "2-digit",
  });
}

/** Just "20:46", for the second and third time in one sentence. */
function fmtTime(d: Date, tz: string): string {
  return d.toLocaleString("uk-UA", { timeZone: tz, hour: "2-digit", minute: "2-digit" });
}

/** "ср, 12 серпня" — no time. */
function fmtDate(d: Date, tz: string): string {
  return d.toLocaleString("uk-UA", {
    timeZone: tz, weekday: "short", day: "numeric", month: "long",
  });
}

/** "28 серпня 00:13" — for phases that spill onto the neighbouring date. */
function fmtDayTime(d: Date, tz: string): string {
  return d.toLocaleString("uk-UA", {
    timeZone: tz, day: "numeric", month: "long", hour: "2-digit", minute: "2-digit",
  });
}

/** Local calendar day, for deciding whether a bare "05:35" is unambiguous. */
function localDay(d: Date, tz: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit",
  }).format(d);
}

/**
 * "Повне сонячне затемнення" — the sub-type now comes from the geometry
 * (Eclipse.kind) instead of being flattened away. Penumbral never reaches
 * here; it is filtered out in findEclipseAlert.
 */
function eclipseHeadline(eclipse: Eclipse): string {
  const KIND_UA: Record<string, string> = {
    total: "Повне", annular: "Кільцеве", hybrid: "Гібридне", partial: "Часткове",
    penumbral: "Напівтіньове",
  };
  const noun = eclipse.type === "solar" ? "сонячне затемнення" : "місячне затемнення";
  const adj = KIND_UA[eclipse.kind] ?? "";
  return adj ? `${adj} ${noun}` : noun.charAt(0).toUpperCase() + noun.slice(1);
}

function eclipseMessage({ eclipse, hoursAhead }: EclipseAlert, tz: string): string {
  const glyph = eclipse.type === "solar" ? "🌒" : "🌕";
  const kind = `${glyph} ${eclipseHeadline(eclipse)}`;
  const { umbralBegin, umbralEnd, date: peak } = eclipse;

  let timing: string;
  if (umbralBegin && umbralEnd) {
    // A lunar eclipse's phases can straddle local midnight — in New York the
    // 28 Aug 2026 eclipse begins on the 27th. Only drop the date when all
    // three instants share one local day.
    const sameDay = localDay(umbralBegin, tz) === localDay(peak, tz)
                 && localDay(umbralEnd,  tz) === localDay(peak, tz);
    const f = sameDay ? fmtTime : fmtDayTime;
    timing = `Початок ${f(umbralBegin, tz)} · пік ${f(peak, tz)} · кінець ${f(umbralEnd, tz)}.`;
  } else {
    // Solar: a single global maximum. Begin and end differ for every point on
    // Earth and need the observer's coordinates, so we publish neither.
    timing = `Пік о ${fmtTime(peak, tz)}.`;
  }

  return `<b>${kind}</b>\n\n` +
    `Через ${hoursAhead} год — ${fmtDate(peak, tz)}.\n${timing}\n\n` +
    `День затемнення — не для нових починань. Спостерігай, відпускай те, що вже не служить, ` +
    `і не довіряй гострим рішенням сьогодні. Поверни увагу всередину.`;
}

function lunarReturnMessage(when: Date, tz: string): string {
  return `<b>🌑 Місячне повернення</b>\n\n` +
    `Твій особистий «місячний новий місяць» починається ${fmtDateTime(when, tz)}.\n\n` +
    `Це початок твого 27-денного емоційного циклу. ` +
    `<a href="https://ellen-soul.com/uk/studio/moon-phase">Подивитись повний прогноз →</a>`;
}

function weeklyCardMessage(): string {
  return `<b>🃏 Карта тижня готова</b>\n\n` +
    `Понеділок — час витягти карту, яка задаватиме тон твого тижня.\n\n` +
    `<a href="https://ellen-soul.com/uk/studio/daily-card">Витягнути карту тижня →</a>`;
}

function phasePeakMessage(p: { type: "new" | "full"; date: Date }, moonSignIdx: number, tz: string): string {
  const phase = p.type === "new" ? "🌑 Новий Місяць" : "🌕 Повний Місяць";
  return `<b>${phase}</b>\n\n` +
    `${fmtDateTime(p.date, tz)} — у знаку ${SIGN_GLYPHS[moonSignIdx]} ${SIGNS_UA[moonSignIdx]}.\n\n` +
    (p.type === "new"
      ? "Час нових намірів. Посій бажання — цикл починається з чистого аркуша."
      : "Кульмінація і відпускання. Подивись, що тримає тебе і вже не служить.") +
    `\n\n<a href="https://ellen-soul.com/uk/studio/moon-phase">Повне послання →</a>`;
}

function solarReturnMessage(name: string | null): string {
  const greet = name ? `, ${name}` : "";
  return `<b>☀️ Твоє Соляне повернення</b>\n\n` +
    `З Днем народження${greet}! Сьогодні Сонце повертається у точку, де воно сяяло у мить твого народження — ` +
    `починається твій новий особистий рік.\n\n` +
    `Загадай напрям на 12 місяців уперед. ` +
    `<a href="https://ellen-soul.com/uk/studio/natal-chart">Подивитись свою натальну карту →</a>`;
}

function mercuryRetroMessage(s: { kind: "retrograde" | "direct"; date: Date }, tz: string): string {
  if (s.kind === "retrograde") {
    return `<b>☿℞ Меркурій ретроградний</b>\n\n` +
      `З ${fmtDateTime(s.date, tz)} Меркурій починає зворотний рух.\n\n` +
      `Найближчі тижні — час перепродумати, передомовити, переробити, а не запускати нове. ` +
      `Двічі перечитуй листи, зберігай бекапи, май запас часу в дорозі.`;
  }
  return `<b>☿ Меркурій прямий</b>\n\n` +
    `З ${fmtDateTime(s.date, tz)} Меркурій знову рухається вперед.\n\n` +
    `Туман розсіюється — можна підписувати, запускати, рушати з місця те, що зависло.`;
}

/** Upper-case the first letter — themes are written to follow a name. */
function capitalise(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * No name in the greeting (owner's call, 2026-08-12). Ukrainian address takes
 * the vocative — "Сергію", not "Сергій" — and generating it reliably for
 * arbitrary and foreign names is not worth the wrongness when it misses.
 */
function dailyHoroscopeMessage(theme: string, quality: string, topWindow: string | null): string {
  const head = quality === "flowing" ? "🌿 Сьогодні — потоковий день"
             : quality === "turbulent" ? "⚡ Сьогодні — турбулентний день"
             : "✨ Гороскоп дня";
  let body = `<b>${head}</b>\n\nДоброго ранку! ${capitalise(theme)}`;
  if (topWindow) body += `\n\n🍀 Вікно удачі: <b>${topWindow}</b>`;
  body += `\n\n<a href="https://ellen-soul.com/uk/studio/horoscope">Повний гороскоп на сьогодні →</a>`;
  return body;
}

// ── Send + log ─────────────────────────────────────────────────────────────

type ProfileRow = {
  id: string;
  telegram_chat_id: number | null;
  natal_moon_lon: number | null;
  display_name: string | null;
  full_name: string | null;
  birth_date: string | null;
  birth_time: string | null;
  birth_lat: number | null;
  birth_lon: number | null;
  birth_tz: string | null;
  /** Optional: absent until migration 0006 is applied. */
  tz?: string | null;
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
  solar_return?: boolean;
  mercury_retrograde?: boolean;
  push_enabled?: boolean;
};

const PROFILE_COLS_PRE_0006 =
  "id, telegram_chat_id, natal_moon_lon, display_name, full_name, birth_date, birth_time, birth_lat, birth_lon, birth_tz";
const PROFILE_COLS = `${PROFILE_COLS_PRE_0006}, tz`;

/**
 * Select profiles, surviving a deploy that lands before migration 0006.
 *
 * Selecting a column Postgres doesn't have fails the whole query, which here
 * would mean zero profiles and every notification silently stopping — the
 * worst possible failure for a job nobody watches. So: ask for `tz`, and if
 * the database hasn't got it yet, ask again without and let zoneOf() fall
 * back to Kyiv exactly as before.
 */
async function selectProfiles(
  run: (cols: string) => PromiseLike<{ data: unknown; error: unknown }>,
): Promise<ProfileRow[]> {
  const withTz = await run(PROFILE_COLS);
  if (!withTz.error) return (withTz.data as ProfileRow[] | null) ?? [];
  console.warn("profiles: tz column missing (migration 0006 not applied?) — falling back", withTz.error);
  const legacy = await run(PROFILE_COLS_PRE_0006);
  return (legacy.data as ProfileRow[] | null) ?? [];
}

// ── Web Push helpers ──────────────────────────────────────────────────────
// Telegram messages use Telegram-flavoured HTML; the OS notification needs
// a flat plain-text body. We re-derive the short form here per kind.

function pushFor(kind: "eclipse" | "lunar_return" | "weekly_card" | "moon_phase_peak" | "solar_return" | "mercury_retrograde" | "daily_horoscope", opts: {
  eclipse?: EclipseAlert;
  lunarReturnDate?: Date;
  phase?: { type: "new" | "full"; date: Date };
  moonSignIdx?: number;
  station?: { kind: "retrograde" | "direct"; date: Date };
  name?: string | null;
  theme?: string;
  quality?: string;
  topWindow?: string | null;
}, tz: string): PushPayload {
  switch (kind) {
    case "eclipse": {
      const { eclipse, hoursAhead } = opts.eclipse!;
      return {
        title: `${eclipse.type === "solar" ? "🌒" : "🌕"} ${eclipseHeadline(eclipse)}`,
        body:  `Через ${hoursAhead} год — ${fmtDateTime(eclipse.date, tz)}. День не для нових починань.`,
        url:   "/uk/studio/moon-phase",
        tag:   `eclipse-${eclipse.date.toISOString().slice(0,10)}`,
      };
    }
    case "lunar_return":
      return {
        title: "🌑 Місячне повернення",
        body:  `Твій 27-денний цикл починається ${fmtDateTime(opts.lunarReturnDate!, tz)}.`,
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
        body:  `${fmtDateTime(p.date, tz)} — у знаку ${sign}.`,
        url:   "/uk/studio/moon-phase",
        tag:   `phase-${p.type}-${p.date.toISOString().slice(0,10)}`,
      };
    }
    case "solar_return":
      return {
        title: "☀️ Твоє Соляне повернення",
        body:  `${opts.name ? opts.name + ", з" : "З"} Днем народження! Починається твій новий особистий рік.`,
        url:   "/uk/studio/natal-chart",
        tag:   "solar-return",
      };
    case "mercury_retrograde": {
      const s = opts.station!;
      return {
        title: s.kind === "retrograde" ? "☿℞ Меркурій ретроградний" : "☿ Меркурій прямий",
        body:  s.kind === "retrograde"
          ? `З ${fmtDateTime(s.date, tz)} — час передумати й переробити, а не запускати нове.`
          : `З ${fmtDateTime(s.date, tz)} — туман розсіюється, можна рушати застрягле.`,
        url:   "/uk/studio/horoscope",
        tag:   `mercury-${s.kind}-${s.date.toISOString().slice(0,10)}`,
      };
    }
    case "daily_horoscope":
      return {
        title: opts.quality === "flowing" ? "🌿 Потоковий день"
             : opts.quality === "turbulent" ? "⚡ Турбулентний день"
             : "✨ Гороскоп дня",
        body:  (opts.theme ?? "") + (opts.topWindow ? ` · 🍀 ${opts.topWindow}` : ""),
        url:   "/uk/studio/horoscope",
        tag:   "daily-horoscope",
      };
  }
}

/**
 * Build today's DayReading for a profile, if we have enough natal data.
 * Prefers a full natal snapshot (birth time + place); falls back to just
 * the stored natal Moon longitude so users who only gave a birth date
 * still get the lunar weather.
 */
function readingForProfile(profile: ProfileRow, now: Date, tzOffset: number) {
  const snap = computeNatalSnapshot({
    birth_date: profile.birth_date ?? undefined,
    birth_time: profile.birth_time ?? undefined,
    birth_lat:  profile.birth_lat ?? undefined,
    birth_lon:  profile.birth_lon ?? undefined,
    birth_tz:   profile.birth_tz ?? undefined,
  });
  const natal = snap
    ? { sun: snap.sun, moon: snap.moon, mercury: snap.mercury, venus: snap.venus,
        mars: snap.mars, jupiter: snap.jupiter, saturn: snap.saturn, asc: snap.asc, mc: snap.mc }
    : (profile.natal_moon_lon != null ? { moon: profile.natal_moon_lon } : undefined);
  if (!natal) return null;

  // `now` is the anchor; buildDayReading derives the user's own calendar day
  // from tzOffset, so nobody gets yesterday's or tomorrow's reading.
  const { y, m, d } = localDayFor(now, tzOffset);
  return buildDayReading({
    date: now,
    tzOffsetHours: tzOffset,
    language: "uk",
    natal,
    // The web page feeds Personal Day too; without it the Telegram teaser and
    // the page it links to described the same day differently.
    numerology: profile.birth_date
      ? { personalDay: calcPersonalDay(profile.birth_date, y, m, d) ?? undefined }
      : undefined,
    // No firstName on purpose: the Telegram message already opens with
    // "Доброго ранку, <name>!", and buildTheme would prefix the name a
    // second time — "Доброго ранку Сергій! Сергій, день внутрішнього тиску".
  });
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
  const tgProfiles = await selectProfiles(cols => admin
    .from("profiles")
    .select(cols)
    .not("telegram_chat_id", "is", null));
  const { data: pushedUsers } = await admin
    .from("push_subscriptions")
    .select("user_id");
  const pushUserIds = new Set((pushedUsers as { user_id: string }[] | null)?.map(p => p.user_id) ?? []);

  // Merge: TG profiles + any user with push but without TG.
  const tgList = tgProfiles;
  const tgIds = new Set(tgList.map(p => p.id));
  const pushOnlyIds = [...pushUserIds].filter(id => !tgIds.has(id));
  let profiles: ProfileRow[] = tgList;
  if (pushOnlyIds.length > 0) {
    const extra = await selectProfiles(cols => admin
      .from("profiles")
      .select(cols)
      .in("id", pushOnlyIds));
    profiles = [...tgList, ...extra];
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
  const eclipseAlert = findEclipseAlert(nowJd);
  const phasePeak = findUpcomingPhasePeak(nowJd);
  const mercuryStation = findPlanetStation(2, nowJd, 36); // idx 2 = Mercury

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
    // Everything below renders in the user's own zone; "today" and the
    // day's slot grid are theirs too, not Kyiv's.
    const tz = zoneOf(profile);
    const tzOffset = ianaToOffsetHours(now, tz);
    const isMonday = isMondayIn(now, tz);

    try {
      // ── Eclipse alert ─────────────────────────────────────────────────
      if (eclipseAlert && prefs.eclipse_alerts) {
        const { eclipse } = eclipseAlert;
        // Keyed on the eclipse's own date, which is fixed — so the runs on
        // either side of it dedupe against each other instead of resending.
        const key = `eclipse:${eclipse.date.toISOString().slice(0, 10)}`;
        await dispatch(profile.id, chatId, pushAllowed, "eclipse", key,
          () => eclipseMessage(eclipseAlert, tz),
          () => pushFor("eclipse", { eclipse: eclipseAlert }, tz),
          { type: eclipse.type, kind: eclipse.kind });
      }

      // ── Lunar Return ─────────────────────────────────────────────────
      if (prefs.lunar_return && profile.natal_moon_lon != null) {
        const returnJd = findNextLunarReturn(profile.natal_moon_lon, nowJd);
        const hoursAhead = (returnJd - nowJd) * 24;
        if (hoursAhead >= 0 && hoursAhead <= 36) {
          const when = jdToDate(returnJd);
          const key = `lunar_return:${when.toISOString().slice(0, 10)}`;
          await dispatch(profile.id, chatId, pushAllowed, "lunar_return", key,
            () => lunarReturnMessage(when, tz),
            () => pushFor("lunar_return", { lunarReturnDate: when }, tz),
            { when: when.toISOString() });
        }
      }

      // ── Weekly card (Mondays) ────────────────────────────────────────
      if (isMonday && prefs.weekly_card) {
        const key = `weekly:${now.toISOString().slice(0, 10)}`;
        await dispatch(profile.id, chatId, pushAllowed, "weekly_card", key,
          () => weeklyCardMessage(),
          () => pushFor("weekly_card", {}, tz),
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
          () => phasePeakMessage(phasePeak, signIdx, tz),
          () => pushFor("moon_phase_peak", { phase: phasePeak, moonSignIdx: signIdx }, tz),
          { type: phasePeak.type, signIdx });
      }

      // ── Solar Return (birthday) ──────────────────────────────────────
      if (prefs.solar_return !== false && isBirthdayIn(profile.birth_date, now, tz)) {
        const year = new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric" }).format(now);
        const key = `solar:${year}`;
        await dispatch(profile.id, chatId, pushAllowed, "solar_return", key,
          () => solarReturnMessage(profile.display_name),
          () => pushFor("solar_return", { name: profile.display_name }, tz),
          { year });
      }

      // ── Mercury retrograde / direct station ──────────────────────────
      if (mercuryStation && prefs.mercury_retrograde !== false) {
        const key = `mercury_${mercuryStation.kind}:${mercuryStation.date.toISOString().slice(0, 10)}`;
        await dispatch(profile.id, chatId, pushAllowed, "mercury_retrograde", key,
          () => mercuryRetroMessage(mercuryStation, tz),
          () => pushFor("mercury_retrograde", { station: mercuryStation }, tz),
          { kind: mercuryStation.kind });
      }

      // ── Daily Horoscope (standout days only) ─────────────────────────
      if (prefs.daily_horoscope !== false) {
        const reading = readingForProfile(profile, now, tzOffset);
        // Only ping when the day clearly stands out — never on ordinary days.
        if (reading && (reading.quality === "flowing" || reading.quality === "turbulent")) {
          const top = reading.windowsOfLuck[0];
          const topWindow = top ? `${formatHM(top.startMinutes)}–${formatHM(top.endMinutes)}` : null;
          const key = `horoscope:${reading.isoDate}`;
          await dispatch(profile.id, chatId, pushAllowed, "daily_horoscope", key,
            () => dailyHoroscopeMessage(reading.theme, reading.quality, topWindow),
            () => pushFor("daily_horoscope", { name: profile.display_name, theme: reading.theme, quality: reading.quality, topWindow }, tz),
            { quality: reading.quality });
        }
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
    eclipse_today: !!eclipseAlert,
    phase_peak_today: !!phasePeak,
    // No is_monday here any more — weekday is evaluated per user's zone.
  });
}
