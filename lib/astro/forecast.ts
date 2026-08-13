/**
 * Forecast helpers (Phase М13 + М16).
 *
 * Two related ideas:
 *   1. WEEK AHEAD — for each of the next 7 days, what's the Moon's sign,
 *      phase, illumination + Personal Day (if natal date known) + the
 *      single tightest transit-to-natal aspect (if a natal profile is
 *      present). Shown as a horizontally-scrollable grid.
 *
 *   2. LIMINAL MOMENTS — precise wall-clock times of the next N major
 *      threshold events: Moon enters next sign, exact New/Full Moon
 *      within ~30 days, and the user's next Lunar Return (already
 *      computed elsewhere but bundled here for one consolidated list).
 *
 * Both are computed client-side from the same lightweight calc lib;
 * no API call required. Recomputed on every Moon Guide mount in
 * "Today" mode — the moments are very stable across a single browsing
 * session.
 */

import {
  dateToJD, calcPlanetDeg, findNextLunarReturn, jdToDate, findNextSyzygy,
} from "./calculations";
import { calcPersonalDayFromISO } from "@/lib/numerology/calculators";
import { phaseFromElongation, illuminationPercent, type PhaseKey } from "./moon-state";
import { localDayParts } from "@/lib/time/day";

// ── Day forecast ──────────────────────────────────────────────────────────

export type { PhaseKey };

export interface DayForecast {
  /** Local-noon JD used for the snapshot. */
  jd: number;
  /** Midnight at start of the local day this entry represents. */
  date: Date;
  /** Day-of-week (0 = Sun..6 = Sat) for grid layout. */
  weekday: number;
  /** Moon longitude at local noon. */
  moonLon: number;
  moonSignIdx: number;
  moonDegree: number;
  illumination: number;
  phaseKey: PhaseKey;
  /** Personal Day (1-9 + 11/22) if a birth date was given. */
  personalDay?: number;
  /** Tightest transit-Moon→natal aspect of the day, if any. */
  topAspect?: {
    target: "Sun" | "Moon" | "Venus" | "Mars" | "ASC" | "MC";
    kind: "conjunction" | "sextile" | "square" | "trine" | "opposition";
    orb: number;
  };
}

interface NatalInput {
  moon?: number; sun?: number; venus?: number; mars?: number;
  asc?: number; mc?: number;
  /** Birth date YYYY-MM-DD for Personal Day. */
  birthDate?: string;
}

const ASPECT_ANGLES: Record<NonNullable<DayForecast["topAspect"]>["kind"], number> = {
  conjunction: 0, sextile: 60, square: 90, trine: 120, opposition: 180,
};
// Tight orbs for moon-day forecast — the Moon moves fast.
const ASPECT_ORBS: Record<NonNullable<DayForecast["topAspect"]>["kind"], number> = {
  conjunction: 5, sextile: 2, square: 3, trine: 3, opposition: 5,
};

// Personal Day and the phase buckets both come from the shared modules now —
// this file used to carry its own copy of each, and the copies disagreed with
// the other four implementations on the site.
function personalDayFor(birthDate: string, year: number, month: number, day: number): number | undefined {
  return calcPersonalDayFromISO(birthDate, year, month, day) ?? undefined;
}

/** Build a 7-day forecast starting from `fromDate` (default: today). */
export function buildWeekForecast(fromDate: Date, tzOffset: number, natal?: NatalInput): DayForecast[] {
  const days: DayForecast[] = [];
  // The calendar days belong to the USER's zone, not the host's. This used to
  // read `start.setHours(0,0,0,0)` and then pass the profile's tzOffset into
  // dateToJD — mixing the host's idea of "which day" with the user's idea of
  // "what time". horoscope.ts carries a comment about fixing exactly this
  // pattern; the fix never reached here.
  const base = localDayParts(fromDate, tzOffset);

  for (let i = 0; i < 7; i++) {
    // Step in UTC to avoid host-DST arithmetic, then re-read the parts.
    const dayAnchor = new Date(Date.UTC(base.y, base.m - 1, base.d) + i * 86_400_000);
    const y = dayAnchor.getUTCFullYear();
    const m = dayAnchor.getUTCMonth() + 1;
    const dd = dayAnchor.getUTCDate();

    // Sample at noon — minimises the "Moon crosses sign at 23:50" jumpiness
    // when the user is just glancing.
    const jd = dateToJD(y, m, dd, 12, 0, tzOffset);
    const moonLon = calcPlanetDeg(1, jd);
    const sunLon  = calcPlanetDeg(0, jd);
    const elong   = ((moonLon - sunLon) % 360 + 360) % 360;
    const illumination = illuminationPercent(elong);
    const phaseKey = phaseFromElongation(elong);
    const signIdx = Math.floor(((moonLon % 360) + 360) % 360 / 30);
    const moonDegree = Math.floor(((moonLon % 30) + 30) % 30);
    const d = dayAnchor;

    let personalDay: number | undefined;
    if (natal?.birthDate) {
      personalDay = personalDayFor(natal.birthDate, y, m, dd);
    }

    // Find tightest aspect transit Moon → any natal point
    let topAspect: DayForecast["topAspect"] = undefined;
    if (natal) {
      const candidates: Array<{ name: NonNullable<DayForecast["topAspect"]>["target"]; lon: number | undefined }> = [
        { name: "Sun",   lon: natal.sun },
        { name: "Moon",  lon: natal.moon },
        { name: "Venus", lon: natal.venus },
        { name: "Mars",  lon: natal.mars },
        { name: "ASC",   lon: natal.asc },
        { name: "MC",    lon: natal.mc },
      ];
      let bestOrb = Infinity;
      for (const c of candidates) {
        if (c.lon == null) continue;
        let diff = Math.abs(moonLon - c.lon) % 360;
        if (diff > 180) diff = 360 - diff;
        for (const [kind, angle] of Object.entries(ASPECT_ANGLES) as Array<[NonNullable<DayForecast["topAspect"]>["kind"], number]>) {
          const dev = Math.abs(diff - angle);
          if (dev <= ASPECT_ORBS[kind] && dev < bestOrb) {
            bestOrb = dev;
            topAspect = { target: c.name, kind, orb: dev };
          }
        }
      }
    }

    days.push({
      jd, date: d, weekday: d.getDay(),
      moonLon, moonSignIdx: signIdx, moonDegree,
      illumination, phaseKey, personalDay, topAspect,
    });
  }
  return days;
}

// ── Liminal moments ──────────────────────────────────────────────────────

export type LiminalKind = "sign-change" | "new-moon" | "full-moon" | "lunar-return";

export interface LiminalMoment {
  kind: LiminalKind;
  date: Date;
  /** Hours from "now" until the moment (positive = future). */
  hoursAhead: number;
  /** For sign-change: the sign index the Moon enters. */
  nextSignIdx?: number;
}

/** Find the next time the Moon enters a new sign after `fromJd`.
 *  Search via 5-minute steps; accuracy ~3 minutes. */
function findNextSignChange(fromJd: number): { jd: number; signIdx: number } | null {
  let prevSign = Math.floor(((calcPlanetDeg(1, fromJd) % 360) + 360) % 360 / 30);
  for (let m = 5; m < 60 * 24 * 4; m += 5) { // up to 4 days
    const jd = fromJd + m / (60 * 24);
    const lon = calcPlanetDeg(1, jd);
    const sign = Math.floor(((lon % 360) + 360) % 360 / 30);
    if (sign !== prevSign) {
      return { jd, signIdx: sign };
    }
    prevSign = sign;
  }
  return null;
}

// The 1-hour-scan-then-5-minute-refine finder that used to live here is gone.
// findNextSyzygy in calculations.ts bisects the true elongation to well under
// a second, and having one exact finder is what stops the Liminal Moments
// panel and the eclipse engine quoting New Moon times minutes apart.

/** Build the next batch of liminal moments. Always includes the next
 *  sign change; conditionally adds upcoming New / Full Moon and the
 *  user's Lunar Return if a natal Moon is given. */
export function findLiminalMoments(natalMoonLon?: number, now: Date = new Date()): LiminalMoment[] {
  // JD straight from the instant — no wall-clock round trip, so seconds are
  // kept and there is no host-vs-user zone to get wrong.
  const jdNow = now.getTime() / 86_400_000 + 2440587.5;

  const out: LiminalMoment[] = [];

  // 1. Next sign change (always close — usually within 2-3 days)
  const sc = findNextSignChange(jdNow);
  if (sc) {
    const d = jdToDate(sc.jd);
    out.push({
      kind: "sign-change", date: d,
      hoursAhead: (sc.jd - jdNow) * 24,
      nextSignIdx: sc.signIdx,
    });
  }

  // 2 + 3. Exact New and Full Moon, by bisection.
  const newJd = findNextSyzygy(jdNow, 0);
  out.push({ kind: "new-moon", date: jdToDate(newJd), hoursAhead: (newJd - jdNow) * 24 });

  const fullJd = findNextSyzygy(jdNow, 180);
  out.push({ kind: "full-moon", date: jdToDate(fullJd), hoursAhead: (fullJd - jdNow) * 24 });

  // 4. Lunar Return (if natal Moon known)
  if (natalMoonLon != null) {
    const lrJd = findNextLunarReturn(natalMoonLon, jdNow);
    out.push({
      kind: "lunar-return", date: jdToDate(lrJd),
      hoursAhead: (lrJd - jdNow) * 24,
    });
  }

  // Order by time, soonest first.
  return out.sort((a, b) => a.hoursAhead - b.hoursAhead);
}
