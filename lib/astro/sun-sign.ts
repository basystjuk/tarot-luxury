/**
 * Sun sign from a birth date — from the ephemeris, never a calendar table.
 *
 * Two hand-written tables of fixed date ranges used to live in the codebase
 * (`getZodiacIndex` in the compatibility tool, `getZodiacSign` in the tarot
 * deck module). Fixed ranges cannot be right: the Sun's ingress into a sign
 * drifts by up to a day and a half across the leap cycle and the century, so
 * the tables disagreed with the actual sky on 2.14% of birth dates — 12 days a
 * year for someone born in the 1950s, 3 a year for someone born in the 2020s.
 *
 * Worse, the compatibility tool used BOTH at once: the table drove the sign,
 * element, modality and compatibility score shown on the card, while the
 * synastry aspect grid ran off `calcPlanetDeg`. On those 2.14% of dates it
 * printed "Libra" and computed the aspects for a Sun in Virgo.
 *
 * A cusp birth genuinely depends on the hour, and most people do not know
 * theirs. `sunSignForDate` samples local noon, which is the convention that
 * minimises the error when the time is unknown; `sunSignAt` takes a real
 * instant when the tool has one.
 */

import { dateToJD, calcPlanetDeg } from "./calculations";

/** Sign index 0–11 (0 = Aries) for a Julian Day. */
export function sunSignAtJd(jd: number): number {
  return Math.floor((((calcPlanetDeg(0, jd) % 360) + 360) % 360) / 30);
}

/**
 * Sign index 0–11 for a birth date with no known time.
 *
 * `tzOffsetHours` defaults to 0: with the hour unknown there is no better
 * anchor than noon UT, and it keeps the answer stable for the same date
 * regardless of where the page happens to be rendering.
 */
export function sunSignForDate(
  year: number, month: number, day: number, tzOffsetHours = 0,
): number {
  return sunSignAtJd(dateToJD(year, month, day, 12, 0, tzOffsetHours));
}

/** Same, from a "YYYY-MM-DD" string. Returns null if unparseable. */
export function sunSignForISO(iso: string): number | null {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  return sunSignForDate(parseInt(m[1], 10), parseInt(m[2], 10), parseInt(m[3], 10));
}

/**
 * True when the Sun changes sign during the birth DATE, i.e. the answer
 * genuinely depends on the birth time. Callers can use this to add "born on
 * the cusp — the exact hour decides" rather than quietly picking one.
 */
export function isCuspDate(year: number, month: number, day: number): boolean {
  const start = sunSignAtJd(dateToJD(year, month, day, 0, 0, 0));
  const end   = sunSignAtJd(dateToJD(year, month, day, 23, 59, 0));
  return start !== end;
}
