/**
 * Ephemeris formula version.
 *
 * Some natal values are computed once and cached — `natalMoonLon` in
 * localStorage and `profiles.natal_moon_lon` in the database — so the Moon
 * Guide doesn't solve Kepler's equation on every render. That cache has no
 * way of knowing the formulas moved underneath it: a value stored in May and
 * a value computed today come from different code and can differ, with
 * nothing in the data to say so.
 *
 * Every cached astronomical value is therefore stamped with this number. On
 * read, a stamp lower than `EPHEMERIS_VERSION` means "recompute and restamp".
 *
 * BUMP THIS whenever a change to lib/astro/* moves a number that could
 * already be sitting in someone's cache. Cheap to bump, expensive to forget:
 * forgetting leaves two populations of users on two different ephemerides.
 *
 * History:
 *   1 — original. Ascendant returned the Descendant (180° off), Placidus
 *       houses 2/3 and 8/9 were swapped, planets carried no precession
 *       correction, Lilith returned the perigee instead of the apogee.
 *   2 — 2026-08-13 audit fixes: correct Ascendant, correct Placidus cusp
 *       assignment, J2000 → equinox-of-date precession on planets, Lilith
 *       corrected to the apogee.
 */
export const EPHEMERIS_VERSION = 2;

/** True when a cached value's stamp is older than the current formulas. */
export function isStale(storedVersion: number | null | undefined): boolean {
  return (storedVersion ?? 0) < EPHEMERIS_VERSION;
}
