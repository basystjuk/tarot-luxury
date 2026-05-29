/**
 * Forecast engine — Secondary Progressions + Solar Return.
 *
 * Two classical predictive techniques, both pure & deterministic:
 *
 *  1. SECONDARY PROGRESSIONS ("day-for-a-year"): each day of ephemeris
 *     after birth symbolises one year of life. The progressed Moon (the
 *     fastest, ~1 sign / 2.5 yrs) is the key inner-weather timer; the
 *     progressed Sun (~1°/yr) marks slow identity shifts.
 *
 *  2. SOLAR RETURN: the chart for the exact moment the transiting Sun
 *     returns to its natal longitude (≈ the birthday). It sets the theme
 *     for the 12 months ahead — read by the SR Ascendant and the house
 *     the SR Sun falls into.
 *
 * Reuses calcPlanetDeg/dateToJD/calcLST/calcAscendant/calcMC/Placidus from
 * ./calculations and the aspect detector from ./synastry.
 */

import {
  calcPlanetDeg, dateToJD, calcLST, calcAscendant, calcMC, calcPlacidusHouses, jdToDate, OBLIQUITY_DEG,
} from "./calculations";
import { computeSynastry, type SynastryAspect, type PlanetName } from "./synastry";

const TROPICAL_YEAR = 365.2422;
const SUN_DEG_PER_DAY = 0.985647;

/** Planet index map used by calcPlanetDeg. */
const IDX: Record<PlanetName, number> = {
  Sun: 0, Moon: 1, Mercury: 2, Venus: 3, Mars: 4, Jupiter: 5, Saturn: 6,
};

export function signOfLon(lon: number): number {
  return Math.floor(((lon % 360) + 360) % 360 / 30);
}

/** Which Placidus house (1..12) a longitude falls in, given the 12 cusps. */
export function whichHouse(lon: number, cusps: number[]): number {
  const L = ((lon % 360) + 360) % 360;
  for (let i = 0; i < 12; i++) {
    const a = cusps[i];
    const b = cusps[(i + 1) % 12];
    const span = ((b - a) % 360 + 360) % 360;
    const off = ((L - a) % 360 + 360) % 360;
    if (off < span) return i + 1;
  }
  return 1;
}

/** Progressed Julian Day for a given moment: natal JD + age-in-years (days). */
export function progressedJd(natalJd: number, atJd: number): number {
  const ageYears = (atJd - natalJd) / TROPICAL_YEAR;
  return natalJd + ageYears;
}

export interface ProgressedChart {
  ageYears: number;
  Sun: number; Moon: number; Mercury: number; Venus: number; Mars: number;
}

export function progressedChart(natalJd: number, atJd: number): ProgressedChart {
  const pJd = progressedJd(natalJd, atJd);
  return {
    ageYears: (atJd - natalJd) / TROPICAL_YEAR,
    Sun: calcPlanetDeg(0, pJd),
    Moon: calcPlanetDeg(1, pJd),
    Mercury: calcPlanetDeg(2, pJd),
    Venus: calcPlanetDeg(3, pJd),
    Mars: calcPlanetDeg(4, pJd),
  };
}

/**
 * Find the Julian Day in `targetYear` when the Sun returns to `natalSunLon`.
 * Newton iteration anchored near the birthday — converges in a few steps.
 */
export function findSolarReturnJd(
  natalSunLon: number, targetYear: number, birthMonth: number, birthDay: number,
): number {
  let jd = dateToJD(targetYear, birthMonth, birthDay, 12, 0, 0);
  for (let i = 0; i < 10; i++) {
    const cur = calcPlanetDeg(0, jd);
    const diff = ((natalSunLon - cur + 540) % 360) - 180; // signed shortest arc
    if (Math.abs(diff) < 1e-5) break;
    jd += diff / SUN_DEG_PER_DAY;
  }
  return jd;
}

export interface SolarReturn {
  jd: number;
  asc: number; mc: number; cusps: number[];
  planets: Record<PlanetName, number>;
  sunHouse: number;
  ascSign: number;
}

export function solarReturnChart(
  natalSunLon: number, targetYear: number, birthMonth: number, birthDay: number,
  lat: number, lon: number,
): SolarReturn {
  const jd = findSolarReturnJd(natalSunLon, targetYear, birthMonth, birthDay);
  const lst = calcLST(jd, lon);
  const e = OBLIQUITY_DEG;
  const asc = calcAscendant(lst, lat, e);
  const mc = calcMC(lst, e);
  const cusps = calcPlacidusHouses(lst, lat, e);
  const planets = {} as Record<PlanetName, number>;
  for (const p of Object.keys(IDX) as PlanetName[]) planets[p] = calcPlanetDeg(IDX[p], jd);
  return { jd, asc, mc, cusps, planets, sunHouse: whichHouse(planets.Sun, cusps), ascSign: signOfLon(asc) };
}

export interface MoonTimelinePoint { monthOffset: number; isoDate: string; sign: number; }

/** Progressed-Moon sign for each of the next `months` months. */
export function progressedMoonTimeline(natalJd: number, fromJd: number, months = 12): MoonTimelinePoint[] {
  const out: MoonTimelinePoint[] = [];
  for (let m = 0; m <= months; m++) {
    const atJd = fromJd + m * (TROPICAL_YEAR / 12);
    const pJd = progressedJd(natalJd, atJd);
    out.push({ monthOffset: m, isoDate: jdToDate(atJd).toISOString().slice(0, 10), sign: signOfLon(calcPlanetDeg(1, pJd)) });
  }
  return out;
}

/** Date the progressed Moon next changes sign (searched up to 3 years out). */
export function nextProgMoonSignChange(natalJd: number, fromJd: number): { sign: number; isoDate: string } | null {
  const startSign = signOfLon(calcPlanetDeg(1, progressedJd(natalJd, fromJd)));
  const stepDays = 5;
  for (let d = stepDays; d <= TROPICAL_YEAR * 3; d += stepDays) {
    const atJd = fromJd + d;
    const s = signOfLon(calcPlanetDeg(1, progressedJd(natalJd, atJd)));
    if (s !== startSign) return { sign: s, isoDate: jdToDate(atJd).toISOString().slice(0, 10) };
  }
  return null;
}

export interface YearForecast {
  isoDate: string;
  ageYears: number;
  progressed: ProgressedChart & { sunSign: number; moonSign: number };
  progMoonNextSignChange: { sign: number; isoDate: string } | null;
  progToNatalAspects: SynastryAspect[];
  solarReturn: SolarReturn | null;   // null when birth time/location unknown
  moonTimeline: MoonTimelinePoint[];
}

export interface YearForecastInput {
  natalJd: number;
  natalSunLon: number;
  /** Natal planet longitudes for progressed→natal aspects. */
  natal: Partial<Record<PlanetName, number>>;
  /** Birth date parts (for solar-return search). */
  birthMonth: number;
  birthDay: number;
  /** Birth location (for solar-return ASC/houses). Null → no SR chart. */
  lat?: number | null;
  lon?: number | null;
  /** "Now" — defaults to current date. */
  now?: Date;
  /** Solar-return year (defaults to the upcoming birthday's year). */
  srYear?: number;
}

export function buildYearForecast(input: YearForecastInput): YearForecast {
  const now = input.now ?? new Date();
  const nowJd = dateToJD(now.getUTCFullYear(), now.getUTCMonth() + 1, now.getUTCDate(),
                         now.getUTCHours(), now.getUTCMinutes(), 0);

  const pc = progressedChart(input.natalJd, nowJd);
  const progressed = { ...pc, sunSign: signOfLon(pc.Sun), moonSign: signOfLon(pc.Moon) };

  // Progressed → natal aspects (reuse the synastry aspect grid; A = progressed).
  const progAsChart: Partial<Record<PlanetName, number>> = {
    Sun: pc.Sun, Moon: pc.Moon, Mercury: pc.Mercury, Venus: pc.Venus, Mars: pc.Mars,
  };
  const progToNatalAspects = computeSynastry(progAsChart, input.natal).aspects;

  // Solar return — needs a birth location.
  let solarReturn: SolarReturn | null = null;
  if (input.lat != null && input.lon != null) {
    const srYear = input.srYear ?? defaultSrYear(now, input.birthMonth, input.birthDay);
    solarReturn = solarReturnChart(input.natalSunLon, srYear, input.birthMonth, input.birthDay, input.lat, input.lon);
  }

  return {
    isoDate: now.toISOString().slice(0, 10),
    ageYears: pc.ageYears,
    progressed,
    progMoonNextSignChange: nextProgMoonSignChange(input.natalJd, nowJd),
    progToNatalAspects,
    solarReturn,
    moonTimeline: progressedMoonTimeline(input.natalJd, nowJd, 12),
  };
}

/** The current solar-return cycle's year: this year's birthday if it has
 *  passed-or-today, else last year's (the cycle you're currently inside). */
function defaultSrYear(now: Date, birthMonth: number, birthDay: number): number {
  const y = now.getUTCFullYear();
  const bday = new Date(Date.UTC(y, birthMonth - 1, birthDay));
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  return today >= bday ? y : y - 1;
}
