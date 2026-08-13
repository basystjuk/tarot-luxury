/**
 * The canonical lunar state for a moment — one answer, for every tool.
 *
 * Before this module the site carried FOUR opinions about the Moon and they
 * disagreed in public:
 *
 *   • Phase name. The Moon Guide, the horoscope, the week-ahead grid and the
 *     Today widget bucketed elongation at 22.5°; the dream reading bucketed
 *     it at 45°. Measured over 2026 that is 90 days — a quarter of the year —
 *     on which the Moon Guide said "waxing" and the dream reading said "full".
 *
 *   • Exact New / Full Moon. Four finders with accuracies of sub-second
 *     (findSyzygy), ±2.5 min (forecast), ±1 h (the cron) and ±18 h (the Moon
 *     Guide's constant-rate estimate, which after rounding put the date on the
 *     wrong calendar day roughly one time in three).
 *
 *   • Day verdict. The Moon Guide rolled eclipse / Dark Moon / Void of Course
 *     into good–caution–avoid; the horoscope scored transit aspects into
 *     flowing–mixed–turbulent–quiet and knew nothing about the lunar state.
 *     Ten days in every 120 the Guide said "avoid" while the horoscope on the
 *     same date said "a day of flow".
 *
 * Everything lunar now comes from here. `lunarState()` is the single entry
 * point; the horoscope reads the same object the Moon Guide renders, which is
 * what makes the two agree by construction rather than by discipline.
 */

import {
  calcPlanetDeg, calcMoonSpeed, findNextSyzygy, jdToDate, findEclipseWithin,
} from "./calculations";

const norm360 = (d: number) => ((d % 360) + 360) % 360;

// ── Phase ──────────────────────────────────────────────────────────────────

/** Coarse phase, for copy that only needs four states. */
export type PhaseKey = "new" | "waxing" | "full" | "waning";
/** The eight classical phases, for the Moon Guide's dial. */
export type PhaseKey8 =
  | "new" | "waxing_crescent" | "first_quarter" | "waxing_gibbous"
  | "full" | "waning_gibbous" | "last_quarter" | "waning_crescent";

/**
 * Bucket boundaries at 22.5°, i.e. each of the eight phases owns 45° of
 * elongation and "new" / "full" straddle their exact instant. The coarse
 * four-state view is a strict grouping of the eight, so the two can never
 * disagree — which is exactly how the 45°-vs-22.5° split happened.
 */
export function phase8FromElongation(elongation: number): PhaseKey8 {
  const e = norm360(elongation);
  if (e < 22.5 || e >= 337.5) return "new";
  if (e < 67.5)  return "waxing_crescent";
  if (e < 112.5) return "first_quarter";
  if (e < 157.5) return "waxing_gibbous";
  if (e < 202.5) return "full";
  if (e < 247.5) return "waning_gibbous";
  if (e < 292.5) return "last_quarter";
  return "waning_crescent";
}

/** The coarse four-state phase — always consistent with phase8FromElongation. */
export function phaseFromElongation(elongation: number): PhaseKey {
  const p8 = phase8FromElongation(elongation);
  if (p8 === "new" || p8 === "full") return p8;
  return norm360(elongation) < 180 ? "waxing" : "waning";
}

/** Illuminated fraction of the disc, 0–100. Meeus low-precision form. */
export function illuminationPercent(elongation: number): number {
  return Math.round(((1 - Math.cos((norm360(elongation) * Math.PI) / 180)) / 2) * 100);
}

// ── Whole state ────────────────────────────────────────────────────────────

export interface LunarState {
  jd: number;
  /** Sun→Moon elongation, 0 = New, 180 = Full. */
  elongation: number;
  illumination: number;
  phase: PhaseKey;
  phase8: PhaseKey8;
  moonLon: number;
  sunLon: number;
  moonSignIdx: number;
  moonDegree: number;
  sunSignIdx: number;
  /** Degrees per day; ≥13 reads as fast, ≤12 as slow. */
  speed: number;
  /**
   * The three-day window of invisibility around the exact New Moon
   * (elongation < 18° or > 342°, i.e. ±~36 h).
   */
  isDarkMoon: boolean;
  /** Exact instants, by bisection — never a constant-rate estimate. */
  nextNewMoon: Date;
  nextFullMoon: Date;
}

/** Everything lunar about a moment, from one set of numbers. */
export function lunarState(jd: number): LunarState {
  const moonLon = calcPlanetDeg(1, jd);
  const sunLon  = calcPlanetDeg(0, jd);
  const elongation = norm360(moonLon - sunLon);

  // Exact syzygies. `findNextSyzygy` bisects the true elongation, so these are
  // good to well under a second rather than the ±18 h the old linear estimate
  // gave — which after rounding to whole days landed on the wrong date.
  const newJd  = findNextSyzygy(jd, 0);
  const fullJd = findNextSyzygy(jd, 180);

  return {
    jd,
    elongation,
    illumination: illuminationPercent(elongation),
    phase:  phaseFromElongation(elongation),
    phase8: phase8FromElongation(elongation),
    moonLon,
    sunLon,
    moonSignIdx: Math.floor(norm360(moonLon) / 30),
    moonDegree:  Math.floor(norm360(moonLon) % 30),
    sunSignIdx:  Math.floor(norm360(sunLon) / 30),
    speed: calcMoonSpeed(jd),
    isDarkMoon: elongation < 18 || elongation > 342,
    nextNewMoon:  jdToDate(newJd),
    nextFullMoon: jdToDate(fullJd),
  };
}

// ── Void of Course ─────────────────────────────────────────────────────────

/**
 * Is the Moon Void of Course — will it make no further major aspect before it
 * leaves the sign it is in?
 *
 * Moved here from the Moon Guide page so the horoscope can read the same
 * answer. Planet positions are held fixed across the Moon's remaining transit
 * of the sign: they move at most ~1°/day against the Moon's ~13°, so the
 * error is small and always in the direction of declaring MORE void time,
 * which is the conservative side for advice.
 */
export function isVoidOfCourse(jd: number, moonLon: number): boolean {
  const sign = Math.floor(norm360(moonLon) / 30);
  const boundary = (sign + 1) * 30;
  let distance = boundary - norm360(moonLon);
  if (distance <= 0) distance += 360;
  if (distance > 30) return false; // safety

  const planetLons = [0, 2, 3, 4, 5, 6].map(i => calcPlanetDeg(i, jd)); // Sun..Saturn
  const aspectAngles = [0, 60, 90, 120, 180];

  for (const pLon of planetLons) {
    for (const a of aspectAngles) {
      for (const offset of [a, -a]) {
        const target = norm360(pLon + offset);
        let diff = target - norm360(moonLon);
        if (diff < 0) diff += 360;
        // An aspect still to be perfected before the sign boundary.
        if (diff > 0.5 && diff <= distance) return false;
      }
    }
  }
  return true;
}

// ── Shared day verdict ─────────────────────────────────────────────────────

export type LunarVerdict = "clear" | "caution" | "hold";

export interface LunarDayState {
  verdict: LunarVerdict;
  /** Stable reason ids, so each surface renders its own wording in 3 languages. */
  reasons: Array<"eclipse" | "dark-moon" | "void-of-course">;
  isDarkMoon: boolean;
  voidOfCourse: boolean;
  hasEclipse: boolean;
}

/**
 * The lunar contribution to "what kind of day is this".
 *
 * Owner's decision (2026-08-13): the horoscope must know about this. It used
 * to score transit aspects alone and could call a day "flowing" while the
 * Moon Guide, on the same date, showed "✗ avoid" for a Dark Moon — ten days
 * out of every hundred and twenty. Eclipse outranks Dark Moon, which outranks
 * Void of Course, and a "hold" is strong enough that no amount of pleasant
 * aspects may override it.
 */
export function lunarDayState(jd: number): LunarDayState {
  const state = lunarState(jd);
  // A real eclipse within the day either side, using the γ-based engine —
  // not the distance-from-node shortcut the library documents as insufficient.
  const eclipse = findEclipseWithin(jd - 1, 48);
  const hasEclipse = eclipse !== null && !(eclipse.type === "lunar" && eclipse.kind === "penumbral");
  const voidOfCourse = isVoidOfCourse(jd, state.moonLon);

  const reasons: LunarDayState["reasons"] = [];
  if (hasEclipse)         reasons.push("eclipse");
  if (state.isDarkMoon)   reasons.push("dark-moon");
  if (voidOfCourse)       reasons.push("void-of-course");

  const verdict: LunarVerdict =
    hasEclipse || state.isDarkMoon ? "hold"
    : voidOfCourse ? "caution"
    : "clear";

  return { verdict, reasons, isDarkMoon: state.isDarkMoon, voidOfCourse, hasEclipse };
}
