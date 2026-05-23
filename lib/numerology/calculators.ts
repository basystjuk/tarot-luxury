/**
 * Extended numerology calculators — Hans Decoz standard.
 *
 * Adds to the existing 10 numbers (Life Path, Destiny, Soul, Personality,
 * Birthday, Personal Year, Maturity, Balance, Karmic Lessons, Hidden Passion):
 *
 *  - Pinnacles (4) with age windows
 *  - Challenges (4) with age windows
 *  - Cornerstone, Capstone, First Vowel — single letters of the first name
 *  - Plane of Expression — letter categorisation (mental/physical/emotional/intuitive)
 *  - Master-number activation phase (11/22/33 — when they "switch on")
 *
 * All functions are pure. No side effects, no UI. Safe to call from
 * server routes, client components, or tests.
 */

import {
  LETTER_VALUES,
  reduceNum,
  reduceToDigit,
  digitSum,
  firstLetter,
  lastLetter,
  firstVowel,
} from "./letter-values";

// ─── Pinnacles ───────────────────────────────────────────────────────────────
// Four major life cycles. Each is reduced like the Life Path (master numbers
// preserved). The first cycle runs from birth to age (36 - lifePath); each
// next is 9 years; the last runs to end of life.

export interface Pinnacle {
  number: number;
  /** inclusive start age */
  startAge: number;
  /** inclusive end age; null = until end of life */
  endAge: number | null;
}

export function calcPinnacles(
  day: number,
  month: number,
  year: number,
  lifePath: number,
): [Pinnacle, Pinnacle, Pinnacle, Pinnacle] {
  const m = reduceNum(month);
  const d = reduceNum(day);
  const y = reduceNum(digitSum(year));

  const p1 = reduceNum(m + d);
  const p2 = reduceNum(d + y);
  const p3 = reduceNum(p1 + p2);
  const p4 = reduceNum(m + y);

  // First cycle ends at age (36 - reduced lifePath, but master → reduce for window math)
  const lpForWindow = lifePath > 9 ? digitSum(lifePath) : lifePath;
  const end1 = 36 - lpForWindow;

  return [
    { number: p1, startAge: 0,         endAge: end1 },
    { number: p2, startAge: end1 + 1,  endAge: end1 + 9 },
    { number: p3, startAge: end1 + 10, endAge: end1 + 18 },
    { number: p4, startAge: end1 + 19, endAge: null },
  ];
}

// ─── Challenges ──────────────────────────────────────────────────────────────
// Parallel to Pinnacles. Always reduced to a single digit (master numbers
// collapse). 0 is a valid challenge value (most demanding).

export interface Challenge {
  number: number;
  startAge: number;
  endAge: number | null;
}

export function calcChallenges(
  day: number,
  month: number,
  year: number,
  lifePath: number,
): [Challenge, Challenge, Challenge, Challenge] {
  const m = reduceToDigit(month);
  const d = reduceToDigit(day);
  const y = reduceToDigit(digitSum(year));

  const c1 = Math.abs(m - d);
  const c2 = Math.abs(d - y);
  const c3 = Math.abs(c1 - c2);
  const c4 = Math.abs(m - y);

  const lpForWindow = lifePath > 9 ? digitSum(lifePath) : lifePath;
  const end1 = 36 - lpForWindow;

  return [
    { number: reduceToDigit(c1), startAge: 0,         endAge: end1 },
    { number: reduceToDigit(c2), startAge: end1 + 1,  endAge: end1 + 9 },
    { number: reduceToDigit(c3), startAge: end1 + 10, endAge: end1 + 18 },
    { number: reduceToDigit(c4), startAge: end1 + 19, endAge: null },
  ];
}

// ─── Cornerstone / Capstone / First Vowel ────────────────────────────────────
// Single-letter analysis of the FIRST name only.
//  - Cornerstone (first letter) — how you approach life's experiences.
//  - Capstone   (last letter)   — how you complete tasks; the "finishing" energy.
//  - First Vowel               — the soul's first reaction (gut response).
//
// `name` should be just the first name. We split on whitespace defensively.

export interface LetterReading {
  letter: string;
  value: number;
}

function firstNameOnly(fullName: string): string {
  return (fullName.trim().split(/\s+/)[0] ?? "").toLowerCase();
}

export function calcCornerstone(fullName: string): LetterReading {
  const fn = firstNameOnly(fullName);
  const ch = firstLetter(fn);
  return { letter: ch, value: LETTER_VALUES[ch] ?? 0 };
}

export function calcCapstone(fullName: string): LetterReading {
  const fn = firstNameOnly(fullName);
  const ch = lastLetter(fn);
  return { letter: ch, value: LETTER_VALUES[ch] ?? 0 };
}

export function calcFirstVowel(fullName: string): LetterReading {
  const fn = firstNameOnly(fullName);
  const ch = firstVowel(fn);
  return { letter: ch, value: LETTER_VALUES[ch] ?? 0 };
}

// ─── Plane of Expression ─────────────────────────────────────────────────────
// Decoz categorisation. Each letter belongs to one of four planes:
//   • Physical  — body, action, doing
//   • Mental    — thinking, planning, analysis
//   • Emotional — feeling, intuition, relating
//   • Intuitive — higher knowing, inspiration
//
// Decoz's mapping is defined for Latin letters. For Cyrillic we mirror the
// English categories by letter value (1-9 reduction): values cluster into
// the same planes. This is an approximation — Slavic numerology schools
// disagree on the exact mapping, so we document our choice rather than
// claiming a universal standard.

type Plane = "physical" | "mental" | "emotional" | "intuitive";

// Standard Decoz English mapping
const LATIN_PLANE: Record<string, Plane> = {
  e: "physical", w: "physical", d: "physical", m: "physical",
  a: "mental", h: "mental", j: "mental", n: "mental", p: "mental", g: "mental", l: "mental",
  i: "emotional", o: "emotional", r: "emotional", z: "emotional",
  b: "emotional", s: "emotional", t: "emotional", x: "emotional",
  k: "intuitive", f: "intuitive", q: "intuitive", u: "intuitive",
  v: "intuitive", y: "intuitive", c: "intuitive",
};

// Cyrillic mapping — by value buckets:
//   physical: 4, 5  (matter, action)
//   mental:   1, 8  (will, structure)
//   emotional: 2, 3, 6  (relating, expression, harmony)
//   intuitive: 7, 9  (insight, completion)
const VALUE_TO_PLANE: Record<number, Plane> = {
  1: "mental",   8: "mental",
  4: "physical", 5: "physical",
  2: "emotional", 3: "emotional", 6: "emotional",
  7: "intuitive", 9: "intuitive",
};

function planeOf(letter: string): Plane | null {
  if (LATIN_PLANE[letter]) return LATIN_PLANE[letter];
  const v = LETTER_VALUES[letter];
  return v ? VALUE_TO_PLANE[v] : null;
}

export interface PlaneOfExpression {
  physical: number;
  mental: number;
  emotional: number;
  intuitive: number;
  /** the dominant plane (highest count). ties resolved by physical→mental→emotional→intuitive */
  dominant: Plane;
  total: number;
}

export function calcPlaneOfExpression(fullName: string): PlaneOfExpression {
  const counts: Record<Plane, number> = {
    physical: 0, mental: 0, emotional: 0, intuitive: 0,
  };
  let total = 0;
  for (const c of fullName.toLowerCase()) {
    const p = planeOf(c);
    if (p) { counts[p]++; total++; }
  }
  const order: Plane[] = ["physical", "mental", "emotional", "intuitive"];
  const dominant = order.reduce<Plane>((best, p) => counts[p] > counts[best] ? p : best, "physical");
  return { ...counts, dominant, total };
}

// ─── Master Number Phase ─────────────────────────────────────────────────────
// 11/2, 22/4, 33/6 — a person operates on the lower (reduced) vibration
// until a certain age, then the master energy can activate. Ages here
// follow the common modern reading (Decoz / Yates):
//
//   11/2 → 2 from birth, 11 activates ~age 30
//   22/4 → 4 from birth, 22 activates ~age 36
//   33/6 → 6 from birth, 33 activates ~age 45

export type MasterPhase =
  | { isMaster: false }
  | {
      isMaster: true;
      masterNumber: 11 | 22 | 33;
      baseNumber: 2 | 4 | 6;
      activationAge: number;
      currentlyActive: boolean;
    };

// ─── Personal Day ───────────────────────────────────────────────────────────
// Personal Day = Personal Year + month + day, reduced. Each day of the year
// carries its own micro-vibration on top of the Personal Year. Used for
// picking favourable days for action (1), travel (5), completion (9), etc.

export interface PersonalDay {
  /** day of the month (1–31) */
  day: number;
  /** the personal-day number (1–9) — master numbers collapse here for clarity */
  number: number;
  /** day-of-week, 0=Sun..6=Sat — for calendar grid layout */
  weekday: number;
}

export function calcPersonalYear(day: number, month: number, year: number): number {
  // Standard Decoz: reduce(birthDay) + reduce(birthMonth) + reduce(calendarYear)
  const d = reduceNum(day);
  const m = reduceNum(month);
  const y = reduceNum(digitSum(year));
  return reduceNum(d + m + y);
}

export function calcPersonalMonth(personalYear: number, calendarMonth: number): number {
  return reduceNum(personalYear + reduceNum(calendarMonth));
}

/**
 * Generate all Personal Days for a given calendar month.
 *
 * @param birthDay   birthday day-of-month (1–31)
 * @param birthMonth birthday month (1–12)
 * @param year       calendar year for which to compute the days
 * @param month      calendar month (1–12) for which to compute the days
 */
export function calcPersonalDays(
  birthDay: number,
  birthMonth: number,
  year: number,
  month: number,
): PersonalDay[] {
  const personalYear  = calcPersonalYear(birthDay, birthMonth, year);
  const personalMonth = calcPersonalMonth(personalYear, month);
  const daysInMonth = new Date(year, month, 0).getDate(); // month is 1-indexed; passing 0 gives last day of prev = correct here

  const out: PersonalDay[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const pd = reduceToDigit(personalMonth + reduceToDigit(d));
    const weekday = new Date(year, month - 1, d).getDay();
    out.push({ day: d, number: pd, weekday });
  }
  return out;
}

export function calcMasterPhase(num: number, age: number): MasterPhase {
  if (num === 11) {
    return { isMaster: true, masterNumber: 11, baseNumber: 2, activationAge: 30, currentlyActive: age >= 30 };
  }
  if (num === 22) {
    return { isMaster: true, masterNumber: 22, baseNumber: 4, activationAge: 36, currentlyActive: age >= 36 };
  }
  if (num === 33) {
    return { isMaster: true, masterNumber: 33, baseNumber: 6, activationAge: 45, currentlyActive: age >= 45 };
  }
  return { isMaster: false };
}
