/**
 * IANA timezone → UTC offset, at a specific instant.
 *
 * Lives in the astro library rather than next to the Moon Guide's form
 * because every natal computation on the site needs it — the cron, the year
 * forecast, the natal chart and `computeNatalSnapshot` all convert a local
 * birth time into UT before any ephemeris runs. It used to be exported from
 * a page module, which made `lib/astro/natal-snapshot.ts` import upward into
 * `app/[lang]/studio/...` and dragged page code into anything that wanted to
 * test the astronomy.
 *
 * We resolve the offset AT THE GIVEN INSTANT, not today's, so historical DST
 * rules apply — several countries changed their offset permanently in the
 * 1990s, and `Intl.DateTimeFormat` honours those rules.
 */

/** Offset in hours EAST of UTC at the given UTC instant, in the given IANA tz. */
export function ianaToOffsetHours(date: Date, iana: string): number {
  try {
    const dtf = new Intl.DateTimeFormat("en-US", {
      timeZone: iana,
      timeZoneName: "shortOffset",
    });
    const parts = dtf.formatToParts(date);
    const tzName = parts.find(p => p.type === "timeZoneName")?.value ?? "";
    // Formats: "GMT", "GMT+3", "GMT-5:30", "GMT+03:00"
    const m = tzName.match(/GMT([+-])(\d{1,2})(?::?(\d{2}))?/);
    if (!m) return 0;
    const sign = m[1] === "-" ? -1 : 1;
    const hh = parseInt(m[2], 10);
    const mm = m[3] ? parseInt(m[3], 10) : 0;
    return sign * (hh + mm / 60);
  } catch {
    return 0;
  }
}

/**
 * Offset for a LOCAL wall-clock birth time, resolved by iteration.
 *
 * Chicken-and-egg: to know the offset you need the UTC instant, and to know
 * the UTC instant you need the offset. The old code guessed once — it read
 * the local time as if it were UTC, looked up the offset there, and stopped.
 * Its comment claimed "this iterates once to converge"; no iteration existed.
 * For a birth within a few hours of a DST switchover the first guess lands on
 * the wrong side of the transition and the chart is an hour out.
 *
 * Two passes are enough: the correction is at most a couple of hours, so the
 * second lookup already sits in the right offset regime except for births
 * inside the switchover hour itself, which is ambiguous by definition.
 */
export function localBirthOffsetHours(
  y: number, mo: number, d: number, h: number, mi: number, iana: string,
): number {
  // First guess: read the wall clock as if it were UTC.
  let offset = ianaToOffsetHours(new Date(Date.UTC(y, mo - 1, d, h, mi)), iana);
  // Second pass: re-resolve at the UTC instant that guess implies.
  for (let i = 0; i < 2; i++) {
    const utcMs = Date.UTC(y, mo - 1, d, h, mi) - offset * 3_600_000;
    const next = ianaToOffsetHours(new Date(utcMs), iana);
    if (next === offset) break;
    offset = next;
  }
  return offset;
}
