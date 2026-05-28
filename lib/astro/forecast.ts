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
  dateToJD, calcPlanetDeg, findNextLunarReturn, jdToDate,
} from "./calculations";

// ── Day forecast ──────────────────────────────────────────────────────────

export type PhaseKey = "new" | "waxing" | "full" | "waning";

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

function reduce(n: number): number {
  if (n === 11 || n === 22 || n === 33) return n;
  if (n < 10) return n;
  return reduce(String(n).split("").reduce((a, d) => a + parseInt(d, 10), 0));
}

function personalDayFor(birthDate: string, year: number, month: number, day: number): number | undefined {
  const m = birthDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return undefined;
  const bM = parseInt(m[2], 10);
  const bD = parseInt(m[3], 10);
  const py = reduce(
    reduce(bD) + reduce(bM)
    + reduce(String(year).split("").reduce((a, c) => a + parseInt(c, 10), 0))
  );
  const pm = reduce(py + reduce(month));
  return reduce(pm + reduce(day));
}

function phaseFromElongation(elong: number): PhaseKey {
  if (elong < 22.5 || elong > 337.5) return "new";
  if (Math.abs(elong - 180) < 22.5) return "full";
  return elong < 180 ? "waxing" : "waning";
}

/** Build a 7-day forecast starting from `fromDate` (default: today). */
export function buildWeekForecast(fromDate: Date, tzOffset: number, natal?: NatalInput): DayForecast[] {
  const days: DayForecast[] = [];
  const start = new Date(fromDate);
  start.setHours(0, 0, 0, 0);

  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    // Sample at noon — minimises the "Moon crosses sign at 23:50" jumpiness
    // when the user is just glancing.
    const jd = dateToJD(d.getFullYear(), d.getMonth() + 1, d.getDate(), 12, 0, tzOffset);
    const moonLon = calcPlanetDeg(1, jd);
    const sunLon  = calcPlanetDeg(0, jd);
    const elong   = ((moonLon - sunLon) % 360 + 360) % 360;
    const illumination = Math.round(50 * (1 - Math.cos(elong * Math.PI / 180)));
    const phaseKey = phaseFromElongation(elong);
    const signIdx = Math.floor(((moonLon % 360) + 360) % 360 / 30);
    const moonDegree = Math.floor(((moonLon % 30) + 30) % 30);

    let personalDay: number | undefined;
    if (natal?.birthDate) {
      personalDay = personalDayFor(natal.birthDate, d.getFullYear(), d.getMonth() + 1, d.getDate());
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

/** Find next New / Full Moon within `maxHours` from `fromJd`.
 *  Search via 1-hour steps then 5-min refine. */
function findNextNewOrFull(fromJd: number, maxHours: number, want: "new" | "full"): number | null {
  const target = want === "new" ? 0 : 180;
  let prevSign = 0;
  let foundCoarse: number | null = null;
  for (let h = 0; h < maxHours; h++) {
    const jd = fromJd + h / 24;
    const moon = calcPlanetDeg(1, jd);
    const sun  = calcPlanetDeg(0, jd);
    let elong  = ((moon - sun) % 360 + 360) % 360;
    let off    = ((elong - target + 540) % 360) - 180; // signed offset
    if (h > 0 && Math.sign(off) !== Math.sign(prevSign) && Math.abs(off) < 30) {
      foundCoarse = jd;
      break;
    }
    prevSign = off;
    void elong;
  }
  if (foundCoarse == null) return null;
  // Refine via 5-min steps in ±2h window
  let best = foundCoarse;
  let bestDev = Infinity;
  for (let m = -120; m <= 120; m += 5) {
    const jd = foundCoarse + m / (60 * 24);
    const moon = calcPlanetDeg(1, jd);
    const sun  = calcPlanetDeg(0, jd);
    const elong = ((moon - sun) % 360 + 360) % 360;
    const off = Math.abs(((elong - target + 540) % 360) - 180);
    if (off < bestDev) { bestDev = off; best = jd; }
  }
  return best;
}

/** Build the next batch of liminal moments. Always includes the next
 *  sign change; conditionally adds upcoming New / Full Moon and the
 *  user's Lunar Return if a natal Moon is given. */
export function findLiminalMoments(natalMoonLon?: number): LiminalMoment[] {
  const now = new Date();
  const tz = -now.getTimezoneOffset() / 60;
  const jdNow = dateToJD(
    now.getFullYear(), now.getMonth() + 1, now.getDate(),
    now.getHours(), now.getMinutes(), tz,
  );

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

  // 2. Next New Moon (within 30 days)
  const newJd = findNextNewOrFull(jdNow, 30 * 24, "new");
  if (newJd) {
    out.push({
      kind: "new-moon", date: jdToDate(newJd),
      hoursAhead: (newJd - jdNow) * 24,
    });
  }

  // 3. Next Full Moon (within 30 days)
  const fullJd = findNextNewOrFull(jdNow, 30 * 24, "full");
  if (fullJd) {
    out.push({
      kind: "full-moon", date: jdToDate(fullJd),
      hoursAhead: (fullJd - jdNow) * 24,
    });
  }

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
