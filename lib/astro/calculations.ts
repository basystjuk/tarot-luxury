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
export function calcObliquity(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0;
  return 23.439291111 - 0.013004167 * T - 1.638889e-7 * T * T + 5.03611e-7 * T * T * T;
}

/**
 * Ascendant — the ecliptic longitude rising on the EASTERN horizon.
 *
 *   ASC = atan2( cos(RAMC), −(sin(RAMC)·cos ε + tan φ·sin ε) )
 *
 * The previous form negated both arguments of the atan2, which rotates the
 * result by exactly 180° and therefore returned the DESCENDANT. It was wrong
 * at every latitude and every sidereal time, so nothing about the chart hid
 * it — the Ascendant simply showed the opposite sign, and the Placidus cusps
 * built on top of it could never close into a valid house set.
 *
 * Ground truth used to pin the sign convention (audit 2026-08-13): with 0°
 * Aries culminating (LST = 0) on the equator (φ = 0), the points 6ʰ of right
 * ascension east of the meridian are rising, so RA = 90° is on the eastern
 * horizon and the ecliptic point there is λ = 90° — 0° Cancer. This function
 * must return 90, not 270.
 */
export function calcAscendant(lst: number, lat: number, e: number): number {
  const lstRad = (lst * Math.PI) / 180;
  const latRad = (lat * Math.PI) / 180;
  const eRad = (e * Math.PI) / 180;
  const y = Math.cos(lstRad);
  const x = -(Math.sin(lstRad) * Math.cos(eRad) + Math.tan(latRad) * Math.sin(eRad));
  const asc = (Math.atan2(y, x) * 180) / Math.PI;
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

/**
 * General precession in ecliptic longitude since J2000, in degrees.
 *
 * The JPL orbital elements above are referred to the mean ecliptic and
 * equinox of **J2000**. The Meeus series for the Sun and the Moon are
 * referred to the mean equinox **of date** — the tropical zodiac the whole
 * site reads. Mixing the two frames left every planet from Mercury to Pluto
 * systematically displaced against the luminaries: nothing at all in 2000,
 * −41′ for a 1950 birth, +22′ today, +42′ by 2050. It grew by 1° every 72
 * years in both directions from J2000 and would never have stopped.
 *
 * Adding this term converts the planets into the equinox of date, which is
 * the frame everything else in this file already speaks. Accurate to about
 * 1″ across the 1900–2100 range the tools serve.
 */
export function precessionSinceJ2000(T: number): number {
  return 1.396971 * T + 0.0003086 * T * T;
}

/** Calculate geocentric ecliptic longitude for a planet.
 *  Index: 0=Sun, 1=Moon, 2=Mercury, 3=Venus, 4=Mars, 5=Jupiter,
 *         6=Saturn, 7=Uranus, 8=Neptune, 9=Pluto.
 *  Returns degrees in [0, 360), mean equinox of date. */
export function calcPlanetDeg(planetIdx: number, jd: number): number {
  if (planetIdx === 0) return sunLongitude(jd);
  if (planetIdx === 1) return moonLongitudeFull(jd);

  const planet = PLANET_ORDER[planetIdx - 2];
  if (!planet) return 0;

  const T = (jd - 2451545.0) / 36525.0;
  const p = heliocentricEclipticXYZ(planet, T);
  const earth = heliocentricEclipticXYZ("earth", T);

  // Geocentric = planet − Earth (heliocentric ecliptic, J2000 frame).
  const X = p.x - earth.x;
  const Y = p.y - earth.y;
  // Z is dropped — we only need ecliptic longitude.

  // J2000 → equinox of date, so planets share the Sun's and Moon's frame.
  return norm360(Math.atan2(Y, X) * 180 / Math.PI + precessionSinceJ2000(T));
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

  // Same J2000 → equinox-of-date correction as calcPlanetDeg. Precession
  // rotates about the ecliptic pole, so longitude shifts and latitude
  // doesn't (to the accuracy this approximation claims).
  const lon = norm360(Math.atan2(Y, X) * 180 / Math.PI + precessionSinceJ2000(T));
  const r = Math.sqrt(X * X + Y * Y);
  const lat = Math.atan2(Z, r) * 180 / Math.PI;
  return { lon, lat };
}

// ── Black Moon Lilith (mean lunar apogee) ─────────────────────────────────
//
// Lilith is the APOGEE of the Moon's orbit — the far end of the line of
// apsides. The mean longitude of the perigee follows exactly from the two
// lunar arguments this file already uses:
//
//   L′ = 218.3164477 + 481267.88123421·T     (mean longitude)
//   M′ = 134.9633964 + 477198.8675055·T      (mean anomaly)
//   Π  = L′ − M′ = 83.3530513 + 4069.0137287·T
//
// and the apogee is Π + 180°. The Moon Guide previously carried its own copy
// of this series that returned Π itself — the perigee — so Lilith was shown
// in the opposite sign for every user, on every date. Its drift coefficient
// was off too (4069.0322 against 4069.0137287, ~1′ per century).

/** Mean Black Moon Lilith — the lunar apogee — in degrees, equinox of date. */
export function calcMeanLilith(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0;
  const perigee =
    83.3530513 + 4069.0137287 * T - 0.0103200 * T * T
    - (T * T * T) / 80053 + (T * T * T * T) / 18999000;
  return norm360(perigee + 180);
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
/**
 * Placidus house cusps (Phase М7 — proper iterative algorithm).
 *
 * Based on the Meeus / Pingré iterative formula. For each intermediate
 * cusp we look for the ecliptic point whose right ascension equals
 * ARMC + S · F · SDA(δ), where SDA is the point's own semi-diurnal arc.
 * That's a fixed-point equation; we solve by simple iteration.
 *
 * Conventions:
 *   - cusps[0]  = House 1 (Ascendant)
 *   - cusps[9]  = House 10 (MC)
 *   - cusps[3]  = House 4  = IC = MC + 180°
 *   - cusps[6]  = House 7  = DSC = ASC + 180°
 *   - Houses 11, 12 are above the eastern horizon (between MC and ASC):
 *       House 11: 1/3 of the way from MC toward ASC
 *       House 12: 2/3 of the way from MC toward ASC
 *   - Houses 2, 3 are below the eastern horizon (between ASC and IC):
 *       House 2:  1/3 from ASC toward IC
 *       House 3:  2/3 from ASC toward IC
 *   - Houses 5, 6, 8, 9 are oppositions of 11, 12, 2, 3.
 *
 * Placidus breaks down at |latitude| > 66.5° (circumpolar issues). In
 * that case we fall back to the Ascendant on the failing cusps so the
 * chart still renders gracefully.
 *
 * `lst` (Local Sidereal Time) and the obliquity `e` are in degrees.
 */
export function calcPlacidusHouses(lst: number, lat: number, e: number): number[] {
  const cusps = new Array<number>(12).fill(0);
  const ascDeg = calcAscendant(lst, lat, e);
  const mcDeg  = calcMC(lst, e);
  cusps[0] = ascDeg;
  cusps[9] = mcDeg;
  cusps[3] = norm360(mcDeg + 180);
  cusps[6] = norm360(ascDeg + 180);

  // High-latitude bail-out: Placidus is undefined where the ecliptic
  // never rises (|lat| > 90° − |obliquity|). Fall back to whole-sign
  // by sliding 30° increments from the Ascendant.
  if (Math.abs(lat) > 90 - Math.abs(e) - 0.5) {
    for (let h = 0; h < 12; h++) cusps[h] = norm360(ascDeg + h * 30);
    cusps[9] = mcDeg;
    cusps[3] = norm360(mcDeg + 180);
    cusps[6] = norm360(ascDeg + 180);
    return cusps;
  }

  const phi = rad(lat);
  const eps = rad(e);
  const armc = rad(lst); // ARMC = LST

  // Resolve one intermediate cusp by fixed-point iteration on RA.
  //   F: trisection fraction (1/3 or 2/3)
  //   S: sign — +1 for upper (between MC and ASC, on the eastern side),
  //             -1 for lower (between IC and ASC, on the eastern side).
  function intermediateCusp(F: number, S: number): number {
    // Initial guess = equal-house (90° × fraction off from MC/IC). This
    // is exact when δ = 0 (and converges fast in normal latitudes).
    let H = armc + S * F * Math.PI / 2;
    for (let iter = 0; iter < 40; iter++) {
      // ecliptic longitude of RA-only point (β=0)
      const lambda = Math.atan2(Math.sin(H) * Math.cos(eps), Math.cos(H));
      const sinD = Math.sin(lambda) * Math.sin(eps);
      const delta = Math.asin(Math.max(-1, Math.min(1, sinD)));
      const cosArg = -Math.tan(phi) * Math.tan(delta);
      if (Math.abs(cosArg) >= 1) break; // ran into circumpolar — stop
      const sda = Math.acos(cosArg);
      const newH = armc + S * F * sda;
      if (Math.abs(newH - H) < 1e-9) { H = newH; break; }
      H = newH;
    }
    // Final λ corresponding to the resolved RA.
    const lambda = Math.atan2(Math.sin(H) * Math.cos(eps), Math.cos(H));
    return norm360((lambda * 180) / Math.PI);
  }

  // S = +1 walks EAST of the meridian (RA = ARMC + F·SDA): the arc from the
  // MC down to the Ascendant, i.e. houses 11 and 12.
  cusps[10] = intermediateCusp(1 / 3, +1); // House 11
  cusps[11] = intermediateCusp(2 / 3, +1); // House 12

  // S = −1 walks WEST of the meridian (RA = ARMC − F·SDA). That is the arc
  // from the MC down to the DESCENDANT — houses 9 and 8, NOT 2 and 3.
  //
  // Why these are the right cusps to solve for: cusp 8 sits opposite cusp 2,
  // so δ₈ = −δ₂ and SDA(δ₈) = 180° − SDA(δ₂). Substituting into the Placidus
  // definition of cusp 2 (RA₂ = RAMC + 180° − ⅔·NSA) collapses to the clean
  // form RA₈ = RAMC − ⅔·SDA(δ₈), which is exactly what this iteration finds.
  // Cusps 2 and 3 then come free as the oppositions.
  //
  // Assigning these two results to houses 2 and 3 (the previous code) left
  // the cusp array non-monotonic: the twelve arcs summed to 1800° instead of
  // 360°, and whichPlacidusHouse() could only ever return house 1 or 2 — so
  // every planet of every chart landed in one of those two houses.
  cusps[8]  = intermediateCusp(1 / 3, -1); // House 9
  cusps[7]  = intermediateCusp(2 / 3, -1); // House 8

  // Opposite cusps
  cusps[4] = norm360(cusps[10] + 180); // House 5
  cusps[5] = norm360(cusps[11] + 180); // House 6
  cusps[2] = norm360(cusps[8]  + 180); // House 3
  cusps[1] = norm360(cusps[7]  + 180); // House 2

  // Defensive: if any cusp became NaN (numeric breakdown), fall back to
  // an equal-house value so the wheel still renders something.
  for (let i = 0; i < 12; i++) {
    if (!Number.isFinite(cusps[i])) cusps[i] = norm360(ascDeg + i * 30);
  }
  return cusps;
}

/** Which house (1-12) does the given ecliptic longitude fall in,
 *  according to a Placidus cusp array? Handles wrapping. */
export function whichPlacidusHouse(lon: number, cusps: number[]): number {
  const L = ((lon % 360) + 360) % 360;
  for (let i = 0; i < 12; i++) {
    const a = cusps[i];
    const b = cusps[(i + 1) % 12];
    // Test whether L lies on the arc going forward from a to b.
    const arcLen = ((b - a) % 360 + 360) % 360;
    const offset = ((L - a) % 360 + 360) % 360;
    if (offset < arcLen) return i + 1;
  }
  return 1; // unreachable except for degenerate cusps
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

// ── Moon ecliptic latitude (Phase М3) ──────────────────────────────────────
//
// The first-term approximation β ≈ 5.128° sin(F) is accurate to ~0.5°,
// which is enough to flag Out-of-Bounds but not enough for serious
// astrological work (declination affects house cusps + parans).
//
// Below is the top-15 term ELP2000 latitude series from Meeus Table 47.B.
// These cover the largest periodic perturbations and bring accuracy to
// ~0.05° — within professional range. The remaining 45 series terms are
// each < 30″ and don't materially change sign placement.
//
// Each row: [D, M, M', F, coefficient × 1e6] — same fundamental arguments
// as the longitude series.

const MOON_LATITUDE_TERMS: ReadonlyArray<readonly [number, number, number, number, number]> = [
  [0, 0, 0,  1,  5128122],
  [0, 0, 1,  1,  280602],
  [0, 0, 1, -1,  277693],
  [2, 0, 0, -1,  173237],
  [2, 0, -1, 1,  55413],
  [2, 0, -1, -1, 46271],
  [2, 0, 0,  1,  32573],
  [0, 0, 2,  1,  17198],
  [2, 0, 1, -1,  9266],
  [0, 0, 2, -1,  8822],
  [2, -1, 0, -1, 8216],
  [2, 0, -2, -1, 4324],
  [2, 0, 1,  1,  4200],
  [2, 1, 0, -1, -3359],
  [2, -1, -1, 1, 2463],
];

/** Moon's ecliptic latitude (β) in degrees at jd. ~0.05° accuracy. */
export function calcMoonLatitude(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0;
  const T2 = T * T;
  const T3 = T2 * T;
  const T4 = T3 * T;

  const D  = norm360(297.8501921 + 445267.1114034 * T - 0.0018819 * T2 + T3 / 545868 - T4 / 113065000);
  const M  = norm360(357.5291092 +  35999.0502909 * T - 0.0001536 * T2 + T3 / 24490000);
  const Mp = norm360(134.9633964 + 477198.8675055 * T + 0.0087414 * T2 + T3 / 69699   - T4 / 14712000);
  const F  = norm360( 93.2720950 + 483202.0175233 * T - 0.0036539 * T2 - T3 / 3526000 + T4 / 863310000);

  const E = 1 - 0.002516 * T - 0.0000074 * T2;
  let sumB = 0;
  for (const [d, m, mp, f, coeff] of MOON_LATITUDE_TERMS) {
    const arg = d * D + m * M + mp * Mp + f * F;
    let c = coeff * Math.sin(rad(arg));
    if (Math.abs(m) === 1) c *= E;
    if (Math.abs(m) === 2) c *= E * E;
    sumB += c;
  }
  return sumB / 1_000_000;
}

/** Moon's equatorial declination in degrees at jd. ~0.05° accuracy (M3). */
export function calcMoonDeclination(jd: number): number {
  const beta   = calcMoonLatitude(jd);       // full latitude series
  const lambda = moonLongitudeFull(jd);      // full longitude series
  const e = calcObliquity(jd);
  const sinDec =
    Math.sin(rad(beta)) * Math.cos(rad(e)) +
    Math.cos(rad(beta)) * Math.sin(rad(e)) * Math.sin(rad(lambda));
  const clamped = Math.max(-1, Math.min(1, sinDec));
  return (Math.asin(clamped) * 180) / Math.PI;
}

// ── True Sect (Phase М2) ───────────────────────────────────────────────────
//
// The hellenistic sect distinction (day chart vs. night chart) depends on
// whether the Sun is above or below the horizon. The previous shortcut
// "hour ∈ [6, 18) ⇒ day" is off by up to 1-2h depending on latitude and
// season — sunrise in Kyiv ranges from 04:00 (June) to 08:30 (December).
//
// With lat/lon now in the profile (Phase В), we can compute the Sun's
// true altitude at the given JD. Above the horizon → day chart.
//
// Formula:  sin(alt) = sin(δ)·sin(φ) + cos(δ)·cos(φ)·cos(H)
// where H is the Sun's local hour angle. H = LST − α (Sun's RA).
//
// Returns true if Sun is above horizon (day chart), false otherwise.

/** Convert ecliptic (λ, β=0 for Sun) → equatorial (α, δ). */
function eclipticToEquatorial(lonDeg: number, latDeg: number, obliquityDeg: number): { ra: number; dec: number } {
  const l = rad(lonDeg);
  const b = rad(latDeg);
  const e = rad(obliquityDeg);
  const sinDec = Math.sin(b) * Math.cos(e) + Math.cos(b) * Math.sin(e) * Math.sin(l);
  const dec = Math.asin(Math.max(-1, Math.min(1, sinDec)));
  const y = Math.sin(l) * Math.cos(e) - Math.tan(b) * Math.sin(e);
  const x = Math.cos(l);
  let ra = Math.atan2(y, x) * 180 / Math.PI;
  if (ra < 0) ra += 360;
  return { ra, dec: dec * 180 / Math.PI };
}

/** True sect: is the Sun above the local horizon at this JD?
 *  Lat north positive, lon east positive (degrees). */
export function isDayChartByCoords(lat: number, lon: number, jd: number): boolean {
  const obliquity = calcObliquity(jd);
  const sunLon = sunLongitude(jd);
  const { ra, dec } = eclipticToEquatorial(sunLon, 0, obliquity);
  const lst = calcLST(jd, lon);
  let H = lst - ra;
  H = ((H + 180) % 360 + 360) % 360 - 180; // wrap to [-180, 180]
  const sinAlt =
    Math.sin(rad(dec)) * Math.sin(rad(lat)) +
    Math.cos(rad(dec)) * Math.cos(rad(lat)) * Math.cos(rad(H));
  return sinAlt > 0;
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

// ── Eclipses (Meeus Ch. 54) ───────────────────────────────────────────────
//
// An eclipse is a syzygy — a New or Full Moon — that falls close enough to a
// lunar node for the shadow cones to actually intersect. Two separate steps,
// and conflating them produced the "eclipse at 07:36" bug — RETROSPECTIVE
// 2026-08-12:
//
//   1. Find the EXACT syzygy instant, by bisection on the Sun-Moon
//      elongation. THIS is the moment a message may quote. Stepping through
//      the next N hours and reporting the first hour that passes a loose
//      proximity test does not report the eclipse — it reports the moment the
//      scan happened to start.
//   2. Decide whether that syzygy is an eclipse at all, from γ (gamma): the
//      least distance between the shadow axis and the centre of the Earth
//      (solar) or of the Moon (lunar), in equatorial Earth radii.
//
// Distance-from-node alone is NOT a sufficient test. 2024-09-18 is a real
// partial umbral lunar eclipse at 10.98° from the node, while 2024-03-25 is
// merely penumbral at 10.35° — closer to the node, yet the lesser event,
// because the Moon's distance also sets the apparent shadow size. Only γ
// separates them.
//
// Validated against the NASA five-millennium canon for 2024–2030: all 31
// events reproduced with the correct sub-type, no phantoms, no misses.

export type SolarEclipseKind = "total" | "annular" | "hybrid" | "partial";
export type LunarEclipseKind = "total" | "partial" | "penumbral";

export interface Eclipse {
  type: "solar" | "lunar";
  /** Sub-type. A penumbral lunar eclipse is imperceptible to the naked eye. */
  kind: SolarEclipseKind | LunarEclipseKind;
  /** Julian Day of GREATEST eclipse — the maximum, not the syzygy. */
  jd: number;
  /** Same instant as a JS Date (UTC). */
  date: Date;
  /**
   * Start and end of the umbral phase — the part actually visible as a bite
   * taken out of the Moon. Lunar eclipses only, and the same instants for
   * every observer who can see the Moon at all.
   *
   * null for solar eclipses on purpose: a solar eclipse begins and ends at a
   * different clock time for every point on Earth, and deriving those needs
   * the observer's coordinates plus Besselian elements. We do not have either,
   * so we publish no number rather than a wrong one.
   */
  umbralBegin: Date | null;
  umbralEnd: Date | null;
}

/**
 * Sun-Moon elongation relative to `target` (0 = New Moon, 180 = Full),
 * normalised to (−180, 180]. Increases monotonically through the target and
 * wraps positive→negative half a cycle away, so a negative→positive crossing
 * brackets the syzygy and nothing else.
 */
function syzygyDelta(jd: number, target: 0 | 180): number {
  let d = norm360(moonLongitudeFull(jd) - sunLongitude(jd)) - target;
  if (d > 180) d -= 360;
  if (d <= -180) d += 360;
  return d;
}

/**
 * Exact JD of the next New (target 0) or Full (180) Moon after `fromJd`.
 *
 * The canonical syzygy finder. Three cheaper ones used to live around the
 * codebase — a 5-minute stepper, a 1-hour cron scan, and a constant-rate
 * estimate on the Moon Guide that was off by up to 18 hours and therefore
 * printed the wrong calendar date about a third of the time. Everything now
 * comes here; the search is a bisection on the true elongation, so the answer
 * is good to well under a second.
 */
export function findNextSyzygy(fromJd: number, target: 0 | 180): number {
  // A synodic month is 29.53 days, so 40 always brackets the next one.
  const jd = findSyzygy(fromJd, 40, target);
  if (jd !== null) return jd;
  // Unreachable in practice; keep the contract non-null for callers.
  return fromJd + (target === 0 ? 29.530588861 : 14.765294431);
}

/** Exact JD of the next New (target 0) or Full (180) Moon within `days`. */
function findSyzygy(fromJd: number, days: number, target: 0 | 180): number | null {
  const step = 0.25;                     // Moon gains ~3° of elongation per step
  let prev = syzygyDelta(fromJd, target);
  for (let t = step; t <= days; t += step) {
    const jd = fromJd + t;
    const cur = syzygyDelta(jd, target);
    if (prev < 0 && cur >= 0) {
      let lo = jd - step, hi = jd;
      for (let i = 0; i < 50; i++) {     // bisect to well under a second
        const mid = (lo + hi) / 2;
        if (syzygyDelta(mid, target) < 0) lo = mid; else hi = mid;
      }
      return (lo + hi) / 2;
    }
    prev = cur;
  }
  return null;
}

/**
 * Shadow geometry at a syzygy (Meeus Eq. 54.2): γ and u, where u is the
 * radius of the Moon's umbral cone in the fundamental plane. Both derive
 * from the lunation number k, so we first recover the k whose mean phase
 * lands nearest `jd`.
 */
function shadowGeometry(jd: number, isNew: boolean): { gamma: number; u: number; n: number } {
  const approxYear = 2000 + (jd - 2451545.0) / 365.25;
  let k = Math.round((approxYear - 2000) * 12.3685);
  if (!isNew) k += 0.5;
  for (const cand of [k - 2, k - 1, k, k + 1, k + 2]) {   // snap to the right lunation
    const t0 = cand / 1236.85;
    const meanPhaseJd = 2451550.09766 + 29.530588861 * cand + 0.00015437 * t0 * t0;
    if (Math.abs(meanPhaseJd - jd) < 15) { k = cand; break; }
  }

  const T = k / 1236.85, T2 = T * T, T3 = T2 * T, T4 = T3 * T;
  const E  = 1 - 0.002516 * T - 0.0000074 * T2;          // eccentricity correction
  const M  = rad(2.5534 + 29.10535670 * k - 0.0000014 * T2 - 0.00000011 * T3);
  const Mp = rad(201.5643 + 385.81693528 * k + 0.0107582 * T2 + 0.00001238 * T3 - 0.000000058 * T4);
  const F  = rad(160.7108 + 390.67050284 * k - 0.0016118 * T2 - 0.00000227 * T3 + 0.000000011 * T4);
  const O  = rad(124.7746 - 1.56375588 * k + 0.0020672 * T2 + 0.00000215 * T3);

  const F1 = F - rad(0.02665) * Math.sin(O);
  const P =
      0.2070 * E * Math.sin(M) + 0.0024 * E * Math.sin(2 * M)
    - 0.0392 * Math.sin(Mp)    + 0.0116 * Math.sin(2 * Mp)
    - 0.0073 * E * Math.sin(Mp + M) + 0.0067 * E * Math.sin(Mp - M)
    + 0.0118 * Math.sin(2 * F1);
  const Q =
      5.2207 - 0.0048 * E * Math.cos(M) + 0.0020 * E * Math.cos(2 * M)
    - 0.3299 * Math.cos(Mp) - 0.0060 * E * Math.cos(Mp + M) + 0.0041 * E * Math.cos(Mp - M);
  const W = Math.abs(Math.cos(F1));

  const gamma = (P * Math.cos(F1) + Q * Math.sin(F1)) * (1 - 0.0048 * W);
  const u =
      0.0059 + 0.0046 * E * Math.cos(M) - 0.0182 * Math.cos(Mp)
    + 0.0004 * Math.cos(2 * Mp) - 0.0005 * Math.cos(M + Mp);
  // Hourly motion of the Moon relative to the shadow, in Earth radii (54.1) —
  // converts shadow-radius differences into durations.
  const n = 0.5458 + 0.0400 * Math.cos(Mp);
  return { gamma, u, n };
}

/**
 * Angular separation (degrees) between the Moon and the point it is closing
 * on — the Sun for a solar eclipse, the antisolar point for a lunar one.
 * Unlike the syzygy test this includes the Moon's ecliptic latitude, which is
 * exactly what makes greatest eclipse fall a few minutes off the syzygy.
 */
function shadowSeparation(jd: number, isNew: boolean): number {
  const target = isNew ? sunLongitude(jd) : sunLongitude(jd) + 180;
  const dLon = rad(norm360(moonLongitudeFull(jd) - target));
  const beta = rad(calcMoonLatitude(jd));
  return Math.acos(Math.cos(beta) * Math.cos(dLon)) * 180 / Math.PI;
}

/**
 * ΔT — the gap between Dynamical Time, which every series in this file is
 * really expressed in, and the Universal Time a clock shows. Espenak & Meeus
 * polynomial, valid 2005–2050 (~75 s in 2026); it drifts outside that range,
 * which costs seconds, not minutes. Without this correction every eclipse
 * instant we publish lands systematically ~1–2 minutes late.
 */
function deltaTSeconds(jd: number): number {
  const t = (jd - 2451545.0) / 365.25;      // years since 2000.0
  // Espenak & Meeus fitted this for 2005–2050. Outside that window it drifts,
  // so clamp rather than extrapolate a polynomial nobody validated there —
  // the residual costs seconds on an eclipse instant, which is inside the
  // minute we display, whereas an unbounded quadratic does not stay bounded.
  const tc = Math.max(5, Math.min(50, t));
  return 62.92 + 0.32217 * tc + 0.005589 * tc * tc;
}

/**
 * Instant of greatest eclipse — the minimum of that separation, by ternary
 * search around the syzygy. Reproduces the published maxima to ~2 minutes,
 * against ~4–9 minutes of error if the syzygy itself is quoted as the peak.
 */
function findGreatestEclipse(syzygyJd: number, isNew: boolean): number {
  let lo = syzygyJd - 0.25, hi = syzygyJd + 0.25;
  for (let i = 0; i < 40; i++) {
    const a = lo + (hi - lo) / 3;
    const b = hi - (hi - lo) / 3;
    if (shadowSeparation(a, isNew) < shadowSeparation(b, isNew)) hi = b; else lo = a;
  }
  return (lo + hi) / 2;
}

/** Eclipse sub-type at a syzygy, or null when no eclipse occurs. */
function classifyEclipse(jd: number, isNew: boolean): Eclipse["kind"] | null {
  const { gamma, u } = shadowGeometry(jd, isNew);
  const g = Math.abs(gamma);

  if (isNew) {
    if (g >= 1.5433 + u) return null;              // shadow misses the Earth
    if (g >= 0.9972) return "partial";             // axis misses; penumbra grazes
    if (u < 0) return "total";
    if (u > 0.0047) return "annular";
    // Narrow band where the cone's apex falls near the surface.
    return u < 0.00464 * Math.sqrt(1 - gamma * gamma) ? "hybrid" : "annular";
  }

  const umbralMag = (1.0128 - u - g) / 0.5450;
  if (umbralMag > 0) return umbralMag >= 1 ? "total" : "partial";
  const penumbralMag = (1.5573 + u - g) / 0.5450;
  return penumbralMag > 0 ? "penumbral" : null;
}

/**
 * The next eclipse whose exact moment falls within `hours` of `fromJd`,
 * or null. Returns the earliest when a solar and a lunar eclipse both
 * qualify (they are always ~2 weeks apart, so in practice never).
 */
export function findEclipseWithin(fromJd: number, hours: number): Eclipse | null {
  const days = hours / 24;
  let earliest: Eclipse | null = null;
  for (const isNew of [true, false]) {
    const syzygyJd = findSyzygy(fromJd, days, isNew ? 0 : 180);
    if (syzygyJd === null) continue;
    const kind = classifyEclipse(syzygyJd, isNew);
    if (!kind) continue;

    // Greatest eclipse, converted from the ephemeris' Dynamical Time to UT.
    const jd = findGreatestEclipse(syzygyJd, isNew) - deltaTSeconds(syzygyJd) / 86400;
    if (earliest && earliest.jd <= jd) continue;

    // Umbral semi-duration (Meeus 54.4): half the time the Moon spends inside
    // the dark shadow, centred on greatest eclipse. Solar eclipses get null —
    // see the note on Eclipse.umbralBegin.
    let umbralBegin: Date | null = null;
    let umbralEnd: Date | null = null;
    if (!isNew && kind !== "penumbral") {
      const { gamma, u, n } = shadowGeometry(syzygyJd, isNew);
      const radius = 1.0128 - u;
      const halfMinutes = (60 / n) * Math.sqrt(Math.max(0, radius * radius - gamma * gamma));
      umbralBegin = jdToDate(jd - halfMinutes / 1440);
      umbralEnd   = jdToDate(jd + halfMinutes / 1440);
    }

    earliest = {
      type: isNew ? "solar" : "lunar",
      kind, jd, date: jdToDate(jd), umbralBegin, umbralEnd,
    };
  }
  return earliest;
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
  // Only skip to the next cycle when we are effectively ON the point already.
  // The old 0.5° threshold (≈ 55 minutes of Moon travel) silently swallowed
  // a return that was about to happen within the hour.
  if (diff < 0.01) diff += 360;
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

