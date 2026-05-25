/**
 * Natal snapshot — Phase М8/М9 helper.
 *
 * Computes the user's natal Sun, Moon, Mercury, Venus, Mars, Jupiter,
 * Saturn, Uranus, Neptune, Pluto + Ascendant + Midheaven from their
 * Phase-В profile data. Cached at the snapshot level so every render of
 * the Moon Guide doesn't pay the cost of solving Kepler's equation 10
 * times.
 *
 * The snapshot is built ONCE per profile (when Moon Guide mounts) and
 * lives on the natal-aspects component.
 */

import {
  dateToJD, calcPlanetDeg, calcLST, calcAscendant, calcMC,
} from "./calculations";
import { ianaToOffsetHours } from "@/app/[lang]/studio/moon-phase/_natal";

export interface NatalSnapshot {
  /** Tropical ecliptic longitude per planet (deg, 0-360). */
  sun:     number;
  moon:    number;
  mercury: number;
  venus:   number;
  mars:    number;
  jupiter: number;
  saturn:  number;
  uranus:  number;
  neptune: number;
  pluto:   number;
  /** Ascendant — eastern horizon point (deg). */
  asc: number;
  /** Midheaven — ecliptic point culminating south at birth (deg). */
  mc: number;
  /** Julian Day of birth (UT). */
  jd: number;
}

export interface NatalInput {
  birth_date: string;   // "YYYY-MM-DD"
  birth_time: string;   // "HH:MM" (local at birth_tz)
  birth_lat: number;
  birth_lon: number;
  birth_tz: string;     // IANA, e.g. "Europe/Kyiv"
}

const OBLIQUITY_J2000 = 23.439291111;

/** Build a complete natal snapshot from profile fields. Returns null when
 *  any required field is missing or malformed. */
export function computeNatalSnapshot(p: Partial<NatalInput>): NatalSnapshot | null {
  if (!p.birth_date || !p.birth_time || p.birth_lat == null || p.birth_lon == null || !p.birth_tz) {
    return null;
  }
  const [y, mo, d] = p.birth_date.split("-").map(n => parseInt(n, 10));
  const [h, mi]    = p.birth_time.split(":").map(n => parseInt(n, 10));
  if (![y, mo, d, h, mi].every(Number.isFinite)) return null;

  // Convert local birth time → UT via the timezone offset that was in
  // force on that calendar date (handles historical DST changes).
  const approxUtc = new Date(Date.UTC(y, mo - 1, d, h, mi));
  const tzOffset = ianaToOffsetHours(approxUtc, p.birth_tz);
  const jd = dateToJD(y, mo, d, h, mi, tzOffset);
  const lst = calcLST(jd, p.birth_lon);

  // Use a constant obliquity matching the rest of the lib's lightweight
  // calcs. Sub-arcminute precision isn't material at the natal-aspect orbs
  // we use (1-3°).
  const e = OBLIQUITY_J2000;

  return {
    sun:     calcPlanetDeg(0, jd),
    moon:    calcPlanetDeg(1, jd),
    mercury: calcPlanetDeg(2, jd),
    venus:   calcPlanetDeg(3, jd),
    mars:    calcPlanetDeg(4, jd),
    jupiter: calcPlanetDeg(5, jd),
    saturn:  calcPlanetDeg(6, jd),
    uranus:  calcPlanetDeg(7, jd),
    neptune: calcPlanetDeg(8, jd),
    pluto:   calcPlanetDeg(9, jd),
    asc: calcAscendant(lst, p.birth_lat, e),
    mc:  calcMC(lst, e),
    jd,
  };
}

// ── Aspect detection across transit/natal points ──────────────────────────

export type AspectKey = "conjunction" | "sextile" | "square" | "trine" | "opposition";

export interface AspectHit {
  transit: TransitPoint;
  natal:   NatalPoint;
  kind:    AspectKey;
  /** signed deviation from exact (deg, positive = past exact, negative = before). */
  orb:     number;
}

export type TransitPoint = "Sun" | "Moon" | "Mercury" | "Venus" | "Mars" | "Jupiter" | "Saturn";
export type NatalPoint   = "Sun" | "Moon" | "Mercury" | "Venus" | "Mars" | "Jupiter" | "Saturn" | "ASC" | "MC";

const ASPECT_ANGLES: Record<AspectKey, number> = {
  conjunction: 0, sextile: 60, square: 90, trine: 120, opposition: 180,
};

/** Orb budget per transit planet × aspect. Slower planets get tighter
 *  orbs because their aspects "last" longer in real-world wall-clock time.
 *  Numbers in degrees. */
const TRANSIT_ORBS: Record<TransitPoint, Record<AspectKey, number>> = {
  Moon:    { conjunction: 5, opposition: 5, square: 3, trine: 3, sextile: 2 },
  Sun:     { conjunction: 4, opposition: 4, square: 2, trine: 2, sextile: 1.5 },
  Mercury: { conjunction: 3, opposition: 3, square: 1.5, trine: 1.5, sextile: 1 },
  Venus:   { conjunction: 3, opposition: 3, square: 1.5, trine: 1.5, sextile: 1 },
  Mars:    { conjunction: 3, opposition: 3, square: 1.5, trine: 1.5, sextile: 1 },
  Jupiter: { conjunction: 2.5, opposition: 2.5, square: 1.5, trine: 1.5, sextile: 1 },
  Saturn:  { conjunction: 2, opposition: 2, square: 1, trine: 1, sextile: 1 },
};

/** Detect every active aspect from the given transit planets to the
 *  given natal points, returning hits ordered by smallest orb first. */
export function detectTransitAspects(
  transit: Partial<Record<TransitPoint, number>>,
  natal:   Partial<Record<NatalPoint, number>>,
): AspectHit[] {
  const hits: AspectHit[] = [];
  for (const [tName, tLon] of Object.entries(transit) as [TransitPoint, number][]) {
    if (tLon == null) continue;
    for (const [nName, nLon] of Object.entries(natal) as [NatalPoint, number][]) {
      if (nLon == null) continue;
      // Skip same-name pairs (Sun-Sun, Moon-Moon, etc. trivially conjunct on
      // birthdays). Keep cross-pairs only.
      if (tName === nName) continue;
      let diff = Math.abs(tLon - nLon) % 360;
      if (diff > 180) diff = 360 - diff;
      for (const [kind, angle] of Object.entries(ASPECT_ANGLES) as [AspectKey, number][]) {
        const dev = Math.abs(diff - angle);
        const orb = TRANSIT_ORBS[tName][kind];
        if (dev <= orb) {
          // Signed orb: positive = transit past exact, negative = approaching.
          const signed = ((tLon - nLon) % 360 + 360) % 360 - angle;
          hits.push({ transit: tName, natal: nName, kind, orb: signed });
          break; // one aspect per (transit, natal) pair — tightest wins implicitly
        }
      }
    }
  }
  // Sort by abs-orb so the user sees the most exact aspects first.
  return hits.sort((a, b) => Math.abs(a.orb) - Math.abs(b.orb));
}

// ── Whole-sign houses ─────────────────────────────────────────────────────
// The first-house cusp = the ASC's sign boundary. Each subsequent house is
// the next sign in zodiacal order. Simpler and more historically grounded
// than Placidus; works at any latitude (Placidus fails > 66.5°).
//
// A future Phase М7 will add Placidus as an opt-in. For "the user just
// wants to know what house each natal planet falls in", whole-sign is
// transparent and bulletproof.

export interface WholeSignHouses {
  /** 12-element array. Each entry is the SIGN INDEX (0-11) at that house's cusp. */
  cusps: number[];
}

export function buildWholeSignHouses(ascDeg: number): WholeSignHouses {
  const ascSignIdx = Math.floor(((ascDeg % 360) + 360) % 360 / 30);
  const cusps: number[] = [];
  for (let h = 0; h < 12; h++) cusps.push((ascSignIdx + h) % 12);
  return { cusps };
}

/** Returns the house number (1-12) for a given ecliptic longitude under
 *  whole-sign houses. */
export function whichWholeSignHouse(lon: number, houses: WholeSignHouses): number {
  const signIdx = Math.floor(((lon % 360) + 360) % 360 / 30);
  const ascHouseStart = houses.cusps[0]; // sign idx where house 1 begins
  // house = ((signIdx - ascHouseStart + 12) % 12) + 1
  return ((signIdx - ascHouseStart + 12) % 12) + 1;
}

// ── Lahiri ayanamsa (Phase М10) ───────────────────────────────────────────
// Tropical zodiac is tied to the vernal equinox (which precesses ~50″/yr).
// Sidereal zodiac (used in Vedic / Jyotish astrology) is tied to fixed
// stars. The OFFSET between them is the "ayanamsa".
//
// Lahiri is the official Indian government standard (Chitra Paksha):
// reference epoch is 285 CE when the equinox passed Spica (Chitra).
//
// Formula (linear, sufficient for ±2″ over 1900-2100):
//   T = (jd - 2415020.5) / 36525    // centuries since J1900.0
//   ayanamsa(T) = 22.46° + 1.396042°·T

/** Lahiri ayanamsa in degrees at the given Julian Day. */
export function calcLahiriAyanamsa(jd: number): number {
  const T = (jd - 2415020.5) / 36525.0;
  return 22.46 + 1.396042 * T;
}

export type ZodiacMode = "tropical" | "sidereal";

/** Convert tropical longitude to sidereal (subtract ayanamsa). For
 *  `tropical` mode passes through unchanged. */
export function applyZodiac(tropicalLon: number, jd: number, mode: ZodiacMode): number {
  if (mode === "tropical") return tropicalLon;
  const sidereal = tropicalLon - calcLahiriAyanamsa(jd);
  return ((sidereal % 360) + 360) % 360;
}

/** Sign index 0-11 from a longitude, honouring the zodiac mode. */
export function signOf(tropicalLon: number, jd: number, mode: ZodiacMode = "tropical"): number {
  const lon = applyZodiac(tropicalLon, jd, mode);
  return Math.floor(((lon % 360) + 360) % 360 / 30);
}
