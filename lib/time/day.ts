/**
 * Which calendar day is it — one answer, one format.
 *
 * `getKyivDay` existed in four places in two different string formats:
 * `uk-UA` gave "13.08.2026" in three of them and `sv-SE` gave "2026-08-13" in
 * the other two. Both are used as localStorage and rate-limit keys. Nothing
 * was broken while the namespaces stayed separate, and nothing would have
 * warned anyone the first time a value crossed between them.
 *
 * ISO (YYYY-MM-DD) everywhere: it sorts lexicographically, it round-trips
 * through Date, and it is what the database columns already hold.
 */

/**
 * Ellen's own day, for things anchored to the studio rather than the visitor —
 * the daily card, the rate limits, the activation-of-the-day.
 *
 * `Europe/Kyiv` is the canonical zone name; `Europe/Kiev` is a deprecated
 * alias that still resolves but should not be written into new code.
 */
export const STUDIO_ZONE = "Europe/Kyiv";

/** Calendar day in a given IANA zone, as YYYY-MM-DD. */
export function dayISOIn(zone: string, date: Date = new Date()): string {
  try {
    // "en-CA" yields ISO order; the explicit parts avoid locale surprises.
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: zone, year: "numeric", month: "2-digit", day: "2-digit",
    }).format(date);
  } catch {
    return date.toISOString().slice(0, 10);
  }
}

/** The studio's calendar day (Kyiv), as YYYY-MM-DD. */
export function studioDayISO(date: Date = new Date()): string {
  return dayISOIn(STUDIO_ZONE, date);
}

/**
 * Calendar parts as seen from a zone `offsetHours` east of UTC.
 *
 * Deliberately not `date.getFullYear()`: that reads the HOST's zone, so the
 * same call answered differently on a UTC server and on a laptop in Kyiv.
 */
export function localDayParts(date: Date, offsetHours: number): { y: number; m: number; d: number } {
  const shifted = new Date(date.getTime() + offsetHours * 3_600_000);
  return { y: shifted.getUTCFullYear(), m: shifted.getUTCMonth() + 1, d: shifted.getUTCDate() };
}

/** The same, formatted as YYYY-MM-DD. */
export function localDayISO(date: Date, offsetHours: number): string {
  const { y, m, d } = localDayParts(date, offsetHours);
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}
