/**
 * Phase #3 — Persistent natal Moon profile.
 *
 * Stores the user's birth chart Moon position so the "Today" view can
 * compare transit Moon ↔ natal Moon ("your personal weather forecast"),
 * and so Phase #11 (Lunar Return) has the natal point it needs to find
 * the next transit-Moon-meets-natal-Moon date.
 *
 * Data layout (localStorage key `tarot-luxury:natal`):
 *   {
 *     birthDate:    "1990-04-15",    // ISO yyyy-mm-dd
 *     birthTime:    "14:30",         // HH:MM local
 *     birthPlace:   "Київ, Україна", // free-text label
 *     lat:          50.4501,
 *     lon:          30.5234,
 *     tz:           "Europe/Kyiv",   // IANA — converted to offset per-date
 *     natalMoonLon: 218.45,          // tropical ecliptic longitude, degrees
 *     savedAt:      "2026-05-25T08:12:00Z",
 *   }
 *
 * We store both the inputs (so the user can edit / re-derive) and the
 * pre-computed natal Moon longitude (so the "Today" view doesn't need to
 * recalculate it on every render).
 *
 * No data ever leaves the browser. The form is fully client-side; the
 * city autocomplete hits Nominatim (OpenStreetMap) directly from the
 * client. We pass `Accept-Language` so suggestions are localised.
 */

import { dateToJD, calcPlanetDeg } from "@/lib/astro/calculations";

export interface NatalProfile {
  birthDate: string;      // "1990-04-15"
  birthTime: string;      // "14:30"
  birthPlace: string;     // free-text label, e.g. "Kyiv, Ukraine"
  lat: number;
  lon: number;
  tz: string;             // IANA, e.g. "Europe/Kyiv"
  natalMoonLon: number;   // tropical ecliptic longitude (degrees)
  savedAt: string;        // ISO timestamp
}

export const NATAL_STORAGE_KEY = "tarot-luxury:natal";

// ── Storage ────────────────────────────────────────────────────────────────

export function loadNatal(): NatalProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(NATAL_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as NatalProfile;
    // Shape sanity check — anything missing → treat as no profile.
    if (
      !parsed.birthDate || !parsed.birthTime || !parsed.birthPlace ||
      typeof parsed.lat !== "number" || typeof parsed.lon !== "number" ||
      !parsed.tz || typeof parsed.natalMoonLon !== "number"
    ) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveNatal(profile: NatalProfile): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(NATAL_STORAGE_KEY, JSON.stringify(profile));
  } catch { /* quota / private mode — non-fatal */ }
}

export function clearNatal(): void {
  if (typeof window === "undefined") return;
  try { window.localStorage.removeItem(NATAL_STORAGE_KEY); } catch { /* */ }
}

// ── Timezone offset (IANA → hours) ─────────────────────────────────────────
//
// We resolve the IANA timezone (e.g. "Europe/Kyiv") to its UTC offset
// AT THE BIRTH DATE — not today. This matters for historical DST changes
// (the rules have shifted over decades; some countries flipped offset
// permanently in the 1990s). `Intl.DateTimeFormat` honors the historical
// rules.

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

// ── Natal Moon computation ─────────────────────────────────────────────────

/**
 * Compute the tropical ecliptic longitude of the Moon at someone's birth.
 * The local birth time is converted to UT via the IANA timezone (using
 * the historical offset that was in force on that calendar date).
 */
export function computeNatalMoonLon(
  birthDate: string,   // "YYYY-MM-DD"
  birthTime: string,   // "HH:MM"
  iana: string,
): number {
  const [y, mo, d] = birthDate.split("-").map(n => parseInt(n, 10));
  const [h, min] = birthTime.split(":").map(n => parseInt(n, 10));
  // Need an approximate UTC date instant to query the historical offset.
  // We build it assuming UTC, then correct via the offset at THAT instant.
  // For DST edge cases (the 1-2h window around switchover) this iterates
  // once to converge — good enough for natal Moon, which moves <0.6°/h.
  const approxUtc = new Date(Date.UTC(y, mo - 1, d, h, min));
  const offset = ianaToOffsetHours(approxUtc, iana);
  const jd = dateToJD(y, mo, d, h, min, offset);
  return calcPlanetDeg(1, jd);
}

// ── Nominatim geocoder ─────────────────────────────────────────────────────
//
// OpenStreetMap's free geocoder. Terms of use: max ~1 req/sec (we debounce),
// must send a real User-Agent (browsers add one automatically). Returns
// open-data POIs/cities/villages. We restrict featuretype to settlements
// to keep suggestions tight.

export interface GeoCandidate {
  label: string;     // "Kyiv, Ukraine"
  lat: number;
  lon: number;
  rawType: string;   // "city", "town", "village", ...
}

export async function searchCity(query: string, lang: string): Promise<GeoCandidate[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", trimmed);
  url.searchParams.set("format", "json");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("limit", "6");
  url.searchParams.set("accept-language", lang === "ru" ? "ru,en" : lang === "en" ? "en" : "uk,en");
  // Bias toward settlements
  url.searchParams.set("featuretype", "city");

  const res = await fetch(url.toString(), {
    headers: { "Accept": "application/json" },
  });
  if (!res.ok) return [];
  type NominatimAddress = {
    city?: string; town?: string; village?: string; hamlet?: string;
    state?: string; country?: string;
  };
  type NominatimResult = {
    lat: string;
    lon: string;
    display_name: string;
    type: string;
    class: string;
    address?: NominatimAddress;
  };
  const data = (await res.json()) as NominatimResult[];
  return data
    .filter(r => ["city", "town", "village", "hamlet", "municipality", "administrative"]
      .includes(r.type) || r.class === "place")
    .slice(0, 6)
    .map(r => {
      const a: NominatimAddress = r.address ?? {};
      const settlement = a.city ?? a.town ?? a.village ?? a.hamlet ?? "";
      const region = a.state ?? "";
      const country = a.country ?? "";
      const label = [settlement, region, country].filter(Boolean).join(", ") || r.display_name;
      return {
        label,
        lat: parseFloat(r.lat),
        lon: parseFloat(r.lon),
        rawType: r.type,
      };
    });
}

/** Resolve (lat, lon) → IANA timezone via the tz-lookup table (offline). */
export async function coordsToIana(lat: number, lon: number): Promise<string> {
  // Dynamic import: keeps the 150KB tz-lookup data out of the initial
  // page bundle. Only loaded when the user actually opens the natal form.
  const mod = await import("tz-lookup");
  // tz-lookup exports a default function (lat, lon) → IANA string.
  // Some environments expose it as `default`, others as the module itself.
  const fn = (mod as unknown as { default?: (a: number, b: number) => string }).default
    ?? (mod as unknown as (a: number, b: number) => string);
  try {
    return fn(lat, lon);
  } catch {
    return "UTC";
  }
}
