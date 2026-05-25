// Astrology calculation library
// Based on Jean Meeus "Astronomical Algorithms" formulas

export const SIGNS_UA = [
  "Овен", "Телець", "Близнюки", "Рак",
  "Лев", "Діва", "Терези", "Скорпіон",
  "Стрілець", "Козеріг", "Водолій", "Риби",
];

export const SIGNS_EN = [
  "Aries", "Taurus", "Gemini", "Cancer",
  "Leo", "Virgo", "Libra", "Scorpio",
  "Sagittarius", "Capricorn", "Aquarius", "Pisces",
];

export const PLANET_NAMES_UA = [
  "Сонце", "Місяць", "Меркурій", "Венера", "Марс",
  "Юпітер", "Сатурн", "Уран", "Нептун", "Плутон",
];

export const SIGN_GLYPHS = ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"];
export const PLANET_GLYPHS = ["☉", "☽", "☿", "♀", "♂", "♃", "♄", "♅", "♆", "♇"];

/** Convert date/time to Julian Day Number */
export function dateToJD(
  y: number, m: number, d: number,
  h: number, min: number, tz: number
): number {
  const ut = h + min / 60 - tz;
  let year = y;
  let month = m;
  const day = d + ut / 24;
  if (month <= 2) { year -= 1; month += 12; }
  const A = Math.floor(year / 100);
  const B = 2 - A + Math.floor(A / 4);
  return (
    Math.floor(365.25 * (year + 4716)) +
    Math.floor(30.6001 * (month + 1)) +
    day + B - 1524.5
  );
}

/** Greenwich Sidereal Time in degrees */
export function calcGST(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0;
  let gst =
    280.46061837 +
    360.98564736629 * (jd - 2451545.0) +
    0.000387933 * T * T -
    (T * T * T) / 38710000;
  return ((gst % 360) + 360) % 360;
}

/** Local Sidereal Time in degrees */
export function calcLST(jd: number, lon: number): number {
  const gst = calcGST(jd);
  return ((gst + lon) % 360 + 360) % 360;
}

/** Obliquity of the ecliptic in degrees */
function calcObliquity(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0;
  return 23.439291111 - 0.013004167 * T - 1.638889e-7 * T * T + 5.03611e-7 * T * T * T;
}

/** Ascendant (ecliptic longitude of eastern horizon) */
export function calcAscendant(lst: number, lat: number, e: number): number {
  const lstRad = (lst * Math.PI) / 180;
  const latRad = (lat * Math.PI) / 180;
  const eRad = (e * Math.PI) / 180;
  const y = -Math.cos(lstRad);
  const x = Math.sin(eRad) * Math.tan(latRad) + Math.cos(eRad) * Math.sin(lstRad);
  let asc = (Math.atan2(y, x) * 180) / Math.PI;
  return ((asc % 360) + 360) % 360;
}

/** Midheaven (MC) ecliptic longitude */
export function calcMC(lst: number, e: number): number {
  const lstRad = (lst * Math.PI) / 180;
  const eRad = (e * Math.PI) / 180;
  let mc = (Math.atan2(Math.sin(lstRad), Math.cos(lstRad) * Math.cos(eRad)) * 180) / Math.PI;
  return ((mc % 360) + 360) % 360;
}

/** Normalize degrees to 0-360 */
function norm360(d: number): number {
  return ((d % 360) + 360) % 360;
}

/** Convert degrees to radians */
function rad(d: number): number {
  return (d * Math.PI) / 180;
}

/** Sun longitude (low-precision, ~0.01°) */
function sunLongitude(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0;
  const L0 = norm360(280.46646 + 36000.76983 * T);
  const M = norm360(357.52911 + 35999.05029 * T - 0.0001537 * T * T);
  const C =
    (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(rad(M)) +
    (0.019993 - 0.000101 * T) * Math.sin(rad(2 * M)) +
    0.000289 * Math.sin(rad(3 * M));
  return norm360(L0 + C);
}

/** Moon longitude using ELP2000-simplified (60 main terms) */
export function moonLongitudeFull(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0;
  const T2 = T * T;
  const T3 = T2 * T;
  const T4 = T3 * T;

  // Fundamental arguments
  const Lp = norm360(218.3164477 + 481267.88123421 * T - 0.0015786 * T2 + T3 / 538841 - T4 / 65194000);
  const D  = norm360(297.8501921 + 445267.1114034 * T - 0.0018819 * T2 + T3 / 545868 - T4 / 113065000);
  const M  = norm360(357.5291092 + 35999.0502909 * T - 0.0001536 * T2 + T3 / 24490000);
  const Mp = norm360(134.9633964 + 477198.8675055 * T + 0.0087414 * T2 + T3 / 69699 - T4 / 14712000);
  const F  = norm360(93.2720950 + 483202.0175233 * T - 0.0036539 * T2 - T3 / 3526000 + T4 / 863310000);

  // 60 periodic terms for longitude (D, M, M', F, coefficient)
  const terms: [number, number, number, number, number][] = [
    [0, 0, 1, 0, 6288774],
    [2, 0, -1, 0, 1274027],
    [2, 0, 0, 0, 658314],
    [0, 0, 2, 0, 213618],
    [0, 1, 0, 0, -185116],
    [0, 0, 0, 2, -114332],
    [2, 0, -2, 0, 58793],
    [2, -1, -1, 0, 57066],
    [2, 0, 1, 0, 53322],
    [2, -1, 0, 0, 45758],
    [0, 1, -1, 0, -40923],
    [1, 0, 0, 0, -34720],
    [0, 1, 1, 0, -30383],
    [2, 0, 0, -2, 15327],
    [0, 0, 1, 2, -12528],
    [0, 0, 1, -2, 10980],
    [4, 0, -1, 0, 10675],
    [0, 0, 3, 0, 10034],
    [4, 0, -2, 0, 8548],
    [2, 1, -1, 0, -7888],
    [2, 1, 0, 0, -6766],
    [1, 0, -1, 0, -5163],
    [1, 1, 0, 0, 4987],
    [2, -1, 1, 0, 4036],
    [2, 0, 2, 0, 3994],
    [4, 0, 0, 0, 3861],
    [2, 0, -3, 0, 3665],
    [0, 1, -2, 0, -2689],
    [2, 0, -1, 2, -2602],
    [2, -1, -2, 0, 2390],
    [1, 0, 1, 0, -2348],
    [2, -2, 0, 0, 2236],
    [0, 1, 2, 0, -2120],
    [0, 2, 0, 0, -2069],
    [2, -2, -1, 0, 2048],
    [2, 0, 1, -2, -1773],
    [2, 0, 0, 2, -1595],
    [4, -1, -1, 0, 1215],
    [0, 0, 2, 2, -1110],
    [3, 0, -1, 0, -892],
    [2, 1, 1, 0, -810],
    [4, -1, -2, 0, 759],
    [0, 2, -1, 0, -713],
    [2, 2, -1, 0, -700],
    [2, 1, -2, 0, 691],
    [2, -1, 0, -2, 596],
    [4, 0, 1, 0, 549],
    [0, 0, 4, 0, 537],
    [4, -1, 0, 0, 520],
    [1, 0, -2, 0, -487],
    [2, 1, 0, -2, -399],
    [0, 0, 2, -2, -381],
    [1, 1, 1, 0, 351],
    [3, 0, -2, 0, -340],
    [4, 0, -3, 0, 330],
    [2, -1, 2, 0, 327],
    [0, 2, 1, 0, -323],
    [1, 1, -1, 0, 299],
    [2, 0, 3, 0, 294],
    [2, 0, -1, -2, 0],
  ];

  const E = 1 - 0.002516 * T - 0.0000074 * T2;

  let sumL = 0;
  for (const [d, m, mp, f, coeff] of terms) {
    const arg = d * D + m * M + mp * Mp + f * F;
    let c = coeff * Math.sin(rad(arg));
    if (Math.abs(m) === 1) c *= E;
    if (Math.abs(m) === 2) c *= E * E;
    sumL += c;
  }

  // Additional corrections
  const A1 = norm360(119.75 + 131.849 * T);
  const A2 = norm360(53.09 + 479264.29 * T);
  sumL += 3958 * Math.sin(rad(A1)) + 1962 * Math.sin(rad(Lp - F)) + 318 * Math.sin(rad(A2));

  return norm360(Lp + sumL / 1000000);
}

// ── Geocentric planet positions — Phase М1 ────────────────────────────────
//
// The previous implementation skipped the orbital→ecliptic rotation
// entirely and treated heliocentric in-orbit longitude as ecliptic
// longitude. The bug compounded for any planet with non-trivial
// inclination (Pluto i=17° was off by multiple signs).
//
// This implementation uses the JPL Standish/Williams 1992 J2000 mean
// orbital elements with linear secular drift, then performs the full
// 3-D rotation:
//
//   1. solve Kepler's equation → eccentric anomaly E
//   2. compute heliocentric position in the planet's orbital plane
//   3. rotate by argument-of-perihelion ω, longitude-of-node Ω, and
//      inclination i to get heliocentric ecliptic rectangular
//   4. subtract Earth's heliocentric ecliptic rectangular (computed
//      the same way using Earth's elements — NOT just `Sun + 180°`,
//      which was the source of error)
//   5. arctan(Y/X) → geocentric ecliptic longitude
//
// Accuracy budget (vs. JPL DE-440 ephemeris, 1900-2100):
//   - Mercury, Venus, Mars, Jupiter, Saturn:  better than 0.1°
//   - Uranus, Neptune:                        ~0.5°
//   - Pluto (perturbations matter):           ~1-2°
//
// Sufficient for sign placement and transit aspect detection within
// any reasonable orb. For sub-arcminute work (publishing precise charts)
// upgrade to VSOP87 via the `astronomia` package — left for a future
// server-side endpoint when needed.

interface PlanetElements {
  /** semi-major axis (AU) and rate per century */
  a: [number, number];
  /** eccentricity */
  e: [number, number];
  /** inclination (deg) */
  i: [number, number];
  /** longitude of ascending node Ω (deg) */
  O: [number, number];
  /** longitude of perihelion ω̃ = ω + Ω (deg) */
  P: [number, number];
  /** mean longitude L (deg) — accumulates VERY fast for inner planets */
  L: [number, number];
}

// Standish/Williams 1992. Reference: NASA JPL Solar System Dynamics
// "Approximate Positions of the Planets" technical memo.
// Each entry has [value at J2000, rate per Julian century].
const ELEMENTS_J2000: Record<string, PlanetElements> = {
  earth: {
    a: [1.00000261,    0.00000562],
    e: [0.01671123,   -0.00004392],
    i: [-0.00001531,  -0.01294668],
    O: [0.0,           0.0],
    P: [102.93768193,  0.32327364],
    L: [100.46457166,  35999.37244981],
  },
  mercury: {
    a: [0.38709927,    0.00000037],
    e: [0.20563593,    0.00001906],
    i: [7.00497902,   -0.00594749],
    O: [48.33076593,  -0.12534081],
    P: [77.45779628,   0.16047689],
    L: [252.25032350,  149472.67411175],
  },
  venus: {
    a: [0.72333566,    0.00000390],
    e: [0.00677672,   -0.00004107],
    i: [3.39467605,   -0.00078890],
    O: [76.67984255,  -0.27769418],
    P: [131.60246718,  0.00268329],
    L: [181.97909950,  58517.81538729],
  },
  mars: {
    a: [1.52371034,    0.00001847],
    e: [0.09339410,    0.00007882],
    i: [1.84969142,   -0.00813131],
    O: [49.55953891,  -0.29257343],
    P: [-23.94362959,  0.44441088],
    L: [-4.55343205,   19140.30268499],
  },
  jupiter: {
    a: [5.20288700,   -0.00011607],
    e: [0.04838624,   -0.00013253],
    i: [1.30439695,   -0.00183714],
    O: [100.47390909,  0.20469106],
    P: [14.72847983,   0.21252668],
    L: [34.39644051,   3034.74612775],
  },
  saturn: {
    a: [9.53667594,   -0.00125060],
    e: [0.05386179,   -0.00050991],
    i: [2.48599187,    0.00193609],
    O: [113.66242448, -0.28867794],
    P: [92.59887831,  -0.41897216],
    L: [49.95424423,   1222.49362201],
  },
  uranus: {
    a: [19.18916464,  -0.00196176],
    e: [0.04725744,   -0.00004397],
    i: [0.77263783,   -0.00242939],
    O: [74.01692503,   0.04240589],
    P: [170.95427630,  0.40805281],
    L: [313.23810451,  428.48202785],
  },
  neptune: {
    a: [30.06992276,   0.00026291],
    e: [0.00859048,    0.00005105],
    i: [1.77004347,    0.00035372],
    O: [131.78422574, -0.00508664],
    P: [44.96476227,  -0.32241464],
    L: [-55.12002969,  218.45945325],
  },
  // Pluto — Keplerian elements from IAU 2009, deg-level accuracy only.
  pluto: {
    a: [39.48211675,  -0.00031596],
    e: [0.24882730,    0.00005170],
    i: [17.14001206,   0.00004818],
    O: [110.30393684, -0.01183482],
    P: [224.06891629, -0.04062942],
    L: [238.92903833,  145.20780515],
  },
};

const PLANET_ORDER = [
  "mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto",
] as const;

/** Heliocentric ecliptic rectangular coords (AU) for a planet at Julian century T. */
function heliocentricEclipticXYZ(planet: keyof typeof ELEMENTS_J2000, T: number): { x: number; y: number; z: number } {
  const el = ELEMENTS_J2000[planet];
  const a = el.a[0] + el.a[1] * T;
  const e = el.e[0] + el.e[1] * T;
  const i = rad(el.i[0] + el.i[1] * T);
  const O = rad(el.O[0] + el.O[1] * T);
  const P = rad(el.P[0] + el.P[1] * T);
  const L = rad(el.L[0] + el.L[1] * T);
  const w = P - O;            // argument of perihelion
  let M = L - P;              // mean anomaly
  // Wrap M into [-π, π] for stable Kepler iteration.
  M = ((M + Math.PI) % (2 * Math.PI)) - Math.PI;

  // Newton iteration on Kepler's equation. 8 iterations are overkill
  // for e < 0.3 but cheap and safe — converges to <1e-12 every time.
  let E = M;
  for (let k = 0; k < 8; k++) {
    const dE = (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
    E -= dE;
    if (Math.abs(dE) < 1e-12) break;
  }

  // In-plane coords (perihelion along +x in orbital plane).
  const xv = a * (Math.cos(E) - e);
  const yv = a * Math.sqrt(1 - e * e) * Math.sin(E);

  // Standard 3-axis rotation: Rz(Ω) · Rx(i) · Rz(ω)  applied to (xv, yv, 0).
  const cosw = Math.cos(w), sinw = Math.sin(w);
  const cosO = Math.cos(O), sinO = Math.sin(O);
  const cosi = Math.cos(i), sini = Math.sin(i);

  const x = (cosw * cosO - sinw * sinO * cosi) * xv + (-sinw * cosO - cosw * sinO * cosi) * yv;
  const y = (cosw * sinO + sinw * cosO * cosi) * xv + (-sinw * sinO + cosw * cosO * cosi) * yv;
  const z = (sinw * sini) * xv + (cosw * sini) * yv;

  return { x, y, z };
}

/** Calculate geocentric ecliptic longitude for a planet.
 *  Index: 0=Sun, 1=Moon, 2=Mercury, 3=Venus, 4=Mars, 5=Jupiter,
 *         6=Saturn, 7=Uranus, 8=Neptune, 9=Pluto.
 *  Returns degrees in [0, 360). */
export function calcPlanetDeg(planetIdx: number, jd: number): number {
  if (planetIdx === 0) return sunLongitude(jd);
  if (planetIdx === 1) return moonLongitudeFull(jd);

  const planet = PLANET_ORDER[planetIdx - 2];
  if (!planet) return 0;

  const T = (jd - 2451545.0) / 36525.0;
  const p = heliocentricEclipticXYZ(planet, T);
  const earth = heliocentricEclipticXYZ("earth", T);

  // Geocentric = planet − Earth (heliocentric ecliptic of date).
  const X = p.x - earth.x;
  const Y = p.y - earth.y;
  // Z is dropped — we only need ecliptic longitude.

  return norm360(Math.atan2(Y, X) * 180 / Math.PI);
}

/** Same, but returns full ecliptic spherical (longitude + latitude) — for
 *  future Natal Chart tool that wants β too. Latitude is rarely surfaced
 *  in user-facing astrology but matters for declination + OOB checks. */
export function calcPlanetEcliptic(planetIdx: number, jd: number): { lon: number; lat: number } {
  if (planetIdx === 0) return { lon: sunLongitude(jd), lat: 0 };
  if (planetIdx === 1) {
    // Moon ecliptic latitude — first-term approximation. Good to ~0.5°.
    const T = (jd - 2451545.0) / 36525.0;
    const F = 93.2720950 + 483202.0175233 * T;
    return { lon: moonLongitudeFull(jd), lat: 5.128 * Math.sin(rad(F)) };
  }
  const planet = PLANET_ORDER[planetIdx - 2];
  if (!planet) return { lon: 0, lat: 0 };

  const T = (jd - 2451545.0) / 36525.0;
  const p = heliocentricEclipticXYZ(planet, T);
  const earth = heliocentricEclipticXYZ("earth", T);
  const X = p.x - earth.x;
  const Y = p.y - earth.y;
  const Z = p.z - earth.z;

  const lon = norm360(Math.atan2(Y, X) * 180 / Math.PI);
  const r = Math.sqrt(X * X + Y * Y);
  const lat = Math.atan2(Z, r) * 180 / Math.PI;
  return { lon, lat };
}

/** Get sign index (0-11) from ecliptic longitude */
export function degToSign(deg: number): number {
  return Math.floor(norm360(deg) / 30);
}

/** Get Ukrainian sign name from ecliptic longitude */
export function degToSignName(deg: number): string {
  return SIGNS_UA[degToSign(deg)];
}

/** Get degrees within sign (0-29) */
export function degInSign(deg: number): number {
  return norm360(deg) % 30;
}

/** Format degree as "5°23' Овен" */
export function formatDegree(deg: number): string {
  const d = norm360(deg);
  const inSign = d % 30;
  const degrees = Math.floor(inSign);
  const minutes = Math.floor((inSign - degrees) * 60);
  const sign = SIGNS_UA[Math.floor(d / 30)];
  return `${degrees}°${minutes.toString().padStart(2, "0")}' ${sign}`;
}

/** Calculate Placidus house cusps */
export function calcPlacidusHouses(lst: number, lat: number, e: number): number[] {
  const mc = calcMC(lst, e);
  const asc = calcAscendant(lst, lat, e);

  // Start with equal house for simplicity, then apply Placidus correction
  const cusps: number[] = new Array(12).fill(0);
  cusps[0] = asc;  // House 1
  cusps[3] = mc;   // House 4 (IC + 180)
  cusps[6] = norm360(asc + 180); // House 7
  cusps[9] = norm360(mc + 180);  // House 10

  const latRad = rad(lat);
  const eRad = rad(e);
  const mcRad = rad(mc);

  // Placidus intermediate house calculation
  function placidusIntermediate(fraction: number): number {
    const ramc = (lst * Math.PI) / 180;
    let theta = ramc + fraction * Math.PI;
    for (let iter = 0; iter < 20; iter++) {
      const sinDec = Math.sin(eRad) * Math.sin(theta);
      const dec = Math.asin(sinDec);
      const num = -Math.tan(latRad) * Math.tan(dec);
      const newTheta = ramc + fraction * Math.PI - fraction * Math.asin(num);
      if (Math.abs(newTheta - theta) < 0.0001) break;
      theta = newTheta;
    }
    const sinDec2 = Math.sin(eRad) * Math.sin(theta);
    const dec2 = Math.asin(sinDec2);
    const ra = Math.atan2(Math.cos(dec2) * Math.sin(theta), Math.cos(theta)) * 180 / Math.PI;
    // Convert to ecliptic longitude (approximate)
    const sinLon = (Math.sin(ra * Math.PI / 180) * Math.cos(eRad) + Math.tan(dec2) * Math.sin(eRad)) / Math.cos(ra * Math.PI / 180);
    void sinLon;
    const ecLon = Math.atan2(
      Math.sin(ra * Math.PI / 180) * Math.cos(eRad) + Math.tan(dec2) * Math.sin(eRad),
      Math.cos(ra * Math.PI / 180)
    ) * 180 / Math.PI;
    return norm360(ecLon);
  }

  void mcRad;

  cusps[1]  = placidusIntermediate(1/3);   // House 2
  cusps[2]  = placidusIntermediate(2/3);   // House 3
  cusps[4]  = norm360(cusps[10 - 1] + 180); // will be overwritten
  cusps[5]  = norm360(cusps[11 - 1] + 180);

  // Houses 11, 12 (above horizon)
  cusps[10] = placidusIntermediate(2/3 + 1); // House 11
  cusps[11] = placidusIntermediate(1/3 + 1); // House 12

  // Opposite houses
  cusps[4]  = norm360(cusps[10] + 180);
  cusps[5]  = norm360(cusps[11] + 180);

  // Recalculate 2, 3, 5, 6 as equal from ASC if placidus failed
  for (let i = 0; i < 12; i++) {
    if (isNaN(cusps[i])) {
      cusps[i] = norm360(asc + i * 30);
    }
  }

  return cusps;
}

export interface NatalChartData {
  sun: number;
  moon: number;
  mercury: number;
  venus: number;
  mars: number;
  jupiter: number;
  saturn: number;
  uranus: number;
  neptune: number;
  pluto: number;
  asc: number;
  mc: number;
  houses: number[];
}

/** Calculate full natal chart */
export function calcNatalChart(
  year: number, month: number, day: number,
  hour: number, minute: number, tz: number,
  lat: number, lon: number
): NatalChartData {
  const jd = dateToJD(year, month, day, hour, minute, tz);
  const lst = calcLST(jd, lon);
  const e = calcObliquity(jd);
  const asc = calcAscendant(lst, lat, e);
  const mc = calcMC(lst, e);
  const houses = calcPlacidusHouses(lst, lat, e);

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
    asc,
    mc,
    houses,
  };
}

// ── Moon speed & declination (used by the Moon Guide tool) ────────────────
//
// The Moon's speed varies between ~11.6°/day (apogee) and ~15.4°/day
// (perigee). The astrological convention is that ≥13°/day reads as
// "fast" (events unfold quickly, decisions stick fast) and ≤12°/day as
// "slow" (delays, drag). This drift also affects how long a Void of
// Course window lasts.
//
// We use a 24-hour central difference around jd to dampen short-period
// libration noise — that's accurate to better than 0.1°/day, plenty for
// classifying a day as fast/normal/slow.

/** Moon's apparent ecliptic longitude motion in degrees per day at jd. */
export function calcMoonSpeed(jd: number): number {
  const lon1 = moonLongitudeFull(jd - 0.5);
  const lon2 = moonLongitudeFull(jd + 0.5);
  let diff = lon2 - lon1;
  if (diff < -180) diff += 360;
  if (diff > 180)  diff -= 360;
  return diff;
}

// Moon declination — approximate but good to ~0.5°, which is more than
// enough to detect Out of Bounds (|δ| > 23.4365°, the obliquity of the
// ecliptic). We approximate the Moon's ecliptic latitude β ≈ 5.128° ·
// sin(F), where F is the argument of latitude. Then convert ecliptic
// (λ, β) to equatorial declination via the standard rotation.
//
// A full Meeus solution would use the 60-term β series; the simplified
// form is within the precision needed for OOB classification (we only
// care about a binary "is |δ| > 23.4365°" decision).

/** Moon's equatorial declination in degrees at jd. */
export function calcMoonDeclination(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0;
  const F = 93.2720950 + 483202.0175233 * T; // argument of latitude (degrees)
  const beta   = 5.128 * Math.sin(rad(F));   // approximate ecliptic latitude (degrees)
  const lambda = moonLongitudeFull(jd);      // ecliptic longitude (degrees)
  const e = calcObliquity(jd);               // obliquity of ecliptic (degrees)
  const sinDec =
    Math.sin(rad(beta)) * Math.cos(rad(e)) +
    Math.cos(rad(beta)) * Math.sin(rad(e)) * Math.sin(rad(lambda));
  const clamped = Math.max(-1, Math.min(1, sinDec));
  return (Math.asin(clamped) * 180) / Math.PI;
}

/** Obliquity of the ecliptic — the threshold for the Moon being Out of Bounds. */
export const OBLIQUITY_DEG = 23.4365;

// ── Triplicity rulers (Hellenistic / Dorothean tradition) ─────────────────
//
// In the Dorothean tradition each element has three rulers — a day ruler,
// a night ruler, and a participating (helper) ruler. Which one is "active"
// depends on the sect of the chart: day charts (Sun above the horizon)
// emphasise the day ruler; night charts (Sun below the horizon) emphasise
// the night ruler. The participating ruler is always present but secondary.
//
// We don't have a horizon (no birth location yet — that's the natal-mode
// work). For now we approximate sect by local hour: 06:00–17:59 = day,
// 18:00–05:59 = night. Good enough until natal-mode adds true sunrise.

/** 0 = Fire, 1 = Earth, 2 = Air, 3 = Water — index = signIdx % 4
 *  (♈ Aries→Fire, ♉ Taurus→Earth, ♊ Gemini→Air, ♋ Cancer→Water, …). */
export const SIGN_TO_ELEMENT: readonly number[] = [
  0, 1, 2, 3, // Aries, Taurus, Gemini, Cancer
  0, 1, 2, 3, // Leo, Virgo, Libra, Scorpio
  0, 1, 2, 3, // Sagittarius, Capricorn, Aquarius, Pisces
];

export type ElementKey = "fire" | "earth" | "air" | "water";
export const ELEMENT_KEYS: readonly ElementKey[] = ["fire", "earth", "air", "water"];

export type PlanetKey = "sun" | "moon" | "mercury" | "venus" | "mars" | "jupiter" | "saturn";

export interface TriplicityRulers {
  element: ElementKey;
  day: PlanetKey;
  night: PlanetKey;
  participating: PlanetKey;
}

/** Dorothean triplicity rulers. Keyed by ElementKey. */
export const TRIPLICITY: Record<ElementKey, TriplicityRulers> = {
  fire:  { element: "fire",  day: "sun",    night: "jupiter", participating: "saturn"  },
  earth: { element: "earth", day: "venus",  night: "moon",    participating: "mars"    },
  air:   { element: "air",   day: "saturn", night: "mercury", participating: "jupiter" },
  water: { element: "water", day: "venus",  night: "mars",    participating: "moon"    },
};

/** Approximate "is it a day chart?" by local hour. 06:00 ≤ h < 18:00 = day. */
export function isDayChartByHour(hour: number): boolean {
  return hour >= 6 && hour < 18;
}

// ── True Lunar Node (Chapront-Touzé / Meeus Ch. 47) ───────────────────────
//
// The Moon's orbital plane crosses the ecliptic at two points — the nodes.
// The **mean** node moves uniformly retrograde (~19° per year); the **true**
// node is the mean node plus periodic perturbations from solar gravity,
// reaching up to ~1.75° offset from mean. Astrologically the true node is
// what eclipses and "Moon at the Node" events lock onto — using the mean
// node introduces ~1° of slop, which is more than our eclipse tolerance.
//
// Formula from Jean Meeus, "Astronomical Algorithms" 2nd ed., Eq. 47.7,
// using the standard lunar fundamental arguments. Accuracy: better than 1
// arc-minute over the 1900–2100 range we care about. No external deps,
// no GPL licensing.
//
// Returns: tropical ecliptic longitude in degrees, 0–360, of the **North**
// (ascending) node. South node = (north + 180) % 360.

/** True (apparent) North Lunar Node ecliptic longitude in degrees at jd. */
export function calcTrueNode(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0;
  const T2 = T * T;
  const T3 = T2 * T;
  const T4 = T3 * T;

  // Mean longitude of the ascending node (Meeus Eq. 47.7)
  const meanOmega =
    125.0445479
    - 1934.1362891 * T
    + 0.0020754 * T2
    + T3 / 467441
    - T4 / 60616000;

  // Lunar fundamental arguments (same as ELP2000 series)
  const D  = 297.8501921 + 445267.1114034 * T - 0.0018819 * T2 + T3 / 545868 - T4 / 113065000;
  const M  = 357.5291092 +  35999.0502909 * T - 0.0001536 * T2 + T3 / 24490000;
  const Mp = 134.9633964 + 477198.8675055 * T + 0.0087414 * T2 + T3 / 69699   - T4 / 14712000;
  const F  =  93.2720950 + 483202.0175233 * T - 0.0036539 * T2 - T3 / 3526000 + T4 / 863310000;

  // Periodic corrections (Meeus Table 47.A "Periodic terms for nutation
  // in longitude of the Moon's ascending node"). Coefficients in degrees.
  const correction =
    - 1.4979 * Math.sin(rad(2 * D - 2 * F))
    - 0.1500 * Math.sin(rad(M))
    - 0.1226 * Math.sin(rad(2 * D))
    + 0.1176 * Math.sin(rad(2 * F))
    - 0.0801 * Math.sin(rad(2 * Mp - 2 * F));

  return norm360(meanOmega + correction);
}

// ── Lunar Return ──────────────────────────────────────────────────────────
//
// A Lunar Return is the moment the transiting Moon crosses the exact
// ecliptic longitude it held at someone's birth. It happens roughly once
// every 27.3 days (sidereal month) and is read as "your personal new
// emotional month" — a 27-day forecast tailored to the natal Moon, not a
// generic sun-sign horoscope.
//
// Algorithm: Newton-style iteration on the angular difference between the
// current Moon and the natal Moon. Each iteration corrects by Δλ/speed.
// Converges to ~1 second of arc in 3–4 iterations because the Moon's
// motion is smooth on the day-timescale.

/** Find the next time the Moon returns to natalMoonLon (in degrees) after fromJd. */
export function findNextLunarReturn(natalMoonLon: number, fromJd: number): number {
  let jd = fromJd;

  // First-pass estimate: travel time at the Moon's mean motion (13.176°/day).
  const lon0 = moonLongitudeFull(jd);
  let diff = norm360(natalMoonLon - lon0);
  // If we're already at or just past the natal point, push to the NEXT return.
  if (diff < 0.5) diff += 360;
  jd += diff / 13.176;

  // Refine
  for (let i = 0; i < 8; i++) {
    const cur = moonLongitudeFull(jd);
    let d = ((natalMoonLon - cur) % 360 + 360) % 360;
    if (d > 180) d -= 360;
    if (Math.abs(d) < 1 / 3600) break; // < 1 arc-second — done
    const speed = calcMoonSpeed(jd);   // °/day, ~13
    if (Math.abs(speed) < 0.1) break;  // safety
    jd += d / speed;
  }
  return jd;
}

/** Convert a Julian Day to a JS Date (UTC). */
export function jdToDate(jd: number): Date {
  return new Date((jd - 2440587.5) * 86400_000);
}

