/**
 * Astronomy invariants — the barrier the 2026-08-13 audit left behind.
 *
 *   npm test
 *
 * Every check here is one that a CORRECT implementation cannot fail and that
 * the shipped code did fail. They are deliberately not unit tests of internal
 * shapes: each is either an external gold standard (Meeus, the NASA eclipse
 * canon) or a structural property the maths guarantees (twelve house arcs sum
 * to a circle). That is what makes them survive refactors.
 *
 * What each one caught, so nobody deletes them as noise:
 *
 *   ASC-EQUATOR        the Ascendant returned the Descendant, 180° off,
 *                      at every latitude and every sidereal time.
 *   CUSP-SUM-360       Placidus cusps 2/3 and 8/9 were swapped; the twelve
 *                      arcs summed to 1800° instead of 360°.
 *   ALL-HOUSES-REACH   ...so whichPlacidusHouse could only ever return house
 *                      1 or 2 and every planet of every chart landed there.
 *   PLANET-FRAME       planets sat in the J2000 frame while the Sun and Moon
 *                      sat in the equinox of date — a gap that was 0 in 2000
 *                      and grew 1° every 72 years in both directions.
 *   LILITH-APOGEE      Lilith returned the lunar perigee, so it showed the
 *                      opposite sign for every user on every date.
 *   ORB-SIGNED         transit orbs weren't wrapped, reporting 358° for a
 *                      conjunction 2° from exact.
 *   MEEUS-*            the Sun and Moon series themselves — these passed
 *                      before the audit and must keep passing after it.
 *   ECLIPSE-CANON      the eclipse engine reproduces the published maxima.
 */

import {
  dateToJD, calcAscendant, calcMC, calcObliquity, calcLST,
  calcPlacidusHouses, whichPlacidusHouse,
  calcPlanetDeg, calcMoonLatitude, calcMeanLilith, precessionSinceJ2000,
  findEclipseWithin,
} from "./calculations";
import { detectTransitAspects } from "./natal-snapshot";

let failures = 0;
let checks = 0;

function ok(id: string, condition: boolean, detail: string): void {
  checks++;
  if (condition) {
    console.log(`  ok   ${id.padEnd(18)} ${detail}`);
  } else {
    failures++;
    console.error(`  FAIL ${id.padEnd(18)} ${detail}`);
  }
}

const norm = (d: number) => ((d % 360) + 360) % 360;

// ── The Ascendant rises in the EAST ────────────────────────────────────────
// 0° Aries culminating (LST = 0) on the equator: points 6ʰ of right ascension
// east of the meridian are rising, so RA = 90° is on the eastern horizon and
// the ecliptic point there is λ = 90°, i.e. 0° Cancer. 270° is the Descendant.
{
  const asc = calcAscendant(0, 0, 23.4393);
  ok("ASC-EQUATOR", Math.abs(asc - 90) < 1e-6,
    `LST=0 lat=0 → ${asc.toFixed(4)}° (must be 90 = 0° Cancer, not 270)`);

  // MC at the same moment is 0° Aries by definition.
  const mc = calcMC(0, 23.4393);
  ok("MC-EQUATOR", Math.abs(norm(mc)) < 1e-6 || Math.abs(norm(mc) - 360) < 1e-6,
    `LST=0 → MC ${mc.toFixed(4)}° (must be 0)`);
}

// ── Placidus cusps partition the circle ────────────────────────────────────
// Twelve consecutive arcs, each in (0°, 180°), summing to exactly one circle.
// Swept across latitudes and sidereal times, including the high-latitude
// fallback band.
{
  let worstSum = 0;
  let bad = 0;
  let configs = 0;
  for (let lst = 0; lst < 360; lst += 7) {
    for (const lat of [-66, -60, -45, -20, 0, 20, 45, 60, 66]) {
      configs++;
      const cusps = calcPlacidusHouses(lst, lat, calcObliquity(2451545));
      let sum = 0;
      let arcsValid = true;
      for (let i = 0; i < 12; i++) {
        const gap = norm(cusps[(i + 1) % 12] - cusps[i]);
        sum += gap;
        if (!(gap > 0 && gap < 180)) arcsValid = false;
      }
      if (!arcsValid || Math.abs(sum - 360) > 1e-6) bad++;
      worstSum = Math.max(worstSum, Math.abs(sum - 360));
    }
  }
  ok("CUSP-SUM-360", bad === 0,
    `${configs - bad}/${configs} configs partition the circle (worst |Σ−360| = ${worstSum.toExponential(1)}°)`);
}

// ── Every house is reachable ───────────────────────────────────────────────
// Scanning the whole zodiac must land in all twelve houses. This is the check
// that would have screamed loudest: before the fix only houses 1 and 2 were
// ever returned.
{
  const jd = dateToJD(1990, 4, 15, 14, 30, 3);
  const cusps = calcPlacidusHouses(calcLST(jd, 30.52), 50.45, calcObliquity(jd));
  const seen = new Set<number>();
  for (let d = 0; d < 360; d += 0.25) seen.add(whichPlacidusHouse(d, cusps));
  ok("ALL-HOUSES-REACH", seen.size === 12,
    `${seen.size}/12 houses reachable scanning the full zodiac`);

  // And each cusp must resolve to its own house.
  let misplaced = 0;
  for (let i = 0; i < 12; i++) {
    if (whichPlacidusHouse(cusps[i] + 1e-3, cusps) !== i + 1) misplaced++;
  }
  ok("CUSP-SELF-HOUSE", misplaced === 0, `${12 - misplaced}/12 cusps resolve to their own house`);
}

// ── Planets share the luminaries' reference frame ──────────────────────────
// The Sun derived from the JPL Earth elements must agree with the Meeus solar
// series in EVERY era. If the planets are left in J2000 while the Sun is in
// the equinox of date, this diverges as the precession curve: −41′ in 1950,
// +42′ in 2050, zero only around 2000.
{
  // Independent reimplementation from the published Standish/JPL 1800–2050
  // elements. Deliberately a second copy rather than an import: a test that
  // calls the code under test to build its own expectation proves nothing.
  const rad = (d: number) => (d * Math.PI) / 180;
  type Elements = { a: number[]; e: number[]; i: number[]; O: number[]; P: number[]; L: number[] };
  const EARTH: Elements = {
    a: [1.00000261, 0.00000562], e: [0.01671123, -0.00004392],
    i: [-0.00001531, -0.01294668], O: [0, 0],
    P: [102.93768193, 0.32327364], L: [100.46457166, 35999.37244981],
  };
  const MARS: Elements = {
    a: [1.52371034, 0.00001847], e: [0.09339410, 0.00007882],
    i: [1.84969142, -0.00813131], O: [49.55953891, -0.29257343],
    P: [-23.94362959, 0.44441088], L: [-4.55343205, 19140.30268499],
  };
  function helioXY(el: Elements, T: number): { x: number; y: number } {
    const a = el.a[0] + el.a[1] * T;
    const e = el.e[0] + el.e[1] * T;
    const i = rad(el.i[0] + el.i[1] * T);
    const O = rad(el.O[0] + el.O[1] * T);
    const P = rad(el.P[0] + el.P[1] * T);
    const L = rad(el.L[0] + el.L[1] * T);
    const w = P - O;
    let M = L - P;
    M = ((M + Math.PI) % (2 * Math.PI)) - Math.PI;
    let E = M;
    for (let k = 0; k < 40; k++) {
      const dE = (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
      E -= dE;
      if (Math.abs(dE) < 1e-14) break;
    }
    const xv = a * (Math.cos(E) - e);
    const yv = a * Math.sqrt(1 - e * e) * Math.sin(E);
    const cw = Math.cos(w), sw = Math.sin(w);
    const cO = Math.cos(O), sO = Math.sin(O), ci = Math.cos(i);
    return {
      x: (cw * cO - sw * sO * ci) * xv + (-sw * cO - cw * sO * ci) * yv,
      y: (cw * sO + sw * cO * ci) * xv + (-sw * sO + cw * cO * ci) * yv,
    };
  }
  const earthXY = (T: number) => helioXY(EARTH, T);
  /** Geocentric Mars longitude in the RAW J2000 frame — no precession. */
  function marsJ2000Lon(T: number): number {
    const m = helioXY(MARS, T);
    const e = helioXY(EARTH, T);
    return norm((Math.atan2(m.y - e.y, m.x - e.x) * 180) / Math.PI);
  }

  // Two linked assertions, neither of which hardcodes the correction — the
  // first draft of this test wrote the precession polynomial into the test
  // body and therefore passed no matter what the source did.
  //
  // (a) MAGNITUDE. The Meeus solar series is developed independently of the
  //     JPL elements, so it is a genuine outside witness. Rotating the
  //     J2000 Earth-derived Sun by the library's own precessionSinceJ2000
  //     must land on it, in every era. A wrong polynomial fails here.
  //
  // (b) APPLICATION. calcPlanetDeg must actually apply that rotation to the
  //     planets. Deleting the call would leave (a) passing and (b) failing.
  const epochs = [1930, 1950, 1975, 2000, 2026, 2050, 2080];

  let worstMagnitude = 0;
  for (const y of epochs) {
    const jd = dateToJD(y, 6, 1, 0, 0, 0);
    const T = (jd - 2451545.0) / 36525.0;
    const E = earthXY(T);
    const rotated = norm((Math.atan2(-E.y, -E.x) * 180) / Math.PI + precessionSinceJ2000(T));
    let d = calcPlanetDeg(0, jd) - rotated;
    if (d > 180) d -= 360;
    if (d < -180) d += 360;
    worstMagnitude = Math.max(worstMagnitude, Math.abs(d) * 60);
  }
  ok("PRECESSION-VALUE", worstMagnitude < 1.5,
    `J2000 Sun + precession lands on the Meeus Sun to ${worstMagnitude.toFixed(2)}′ across 1930–2080`);

  let worstApplied = 0;
  let smallestShift = Infinity;
  for (const y of epochs) {
    const jd = dateToJD(y, 6, 1, 0, 0, 0);
    const T = (jd - 2451545.0) / 36525.0;
    if (Math.abs(T) < 0.05) continue;              // near J2000 the shift is ~0
    let applied = calcPlanetDeg(4, jd) - marsJ2000Lon(T);   // 4 = Mars
    if (applied > 180) applied -= 360;
    if (applied < -180) applied += 360;
    worstApplied = Math.max(worstApplied, Math.abs(applied - precessionSinceJ2000(T)) * 3600);
    smallestShift = Math.min(smallestShift, Math.abs(applied) * 60);
  }
  ok("PLANET-FRAME", worstApplied < 1 && smallestShift > 1,
    `Mars carries the rotation to ${worstApplied.toFixed(3)}″ (smallest applied shift ${smallestShift.toFixed(1)}′ — must be non-zero)`);
}

// ── Lilith is the apogee, not the perigee ──────────────────────────────────
// Π = L′ − M′ follows exactly from the lunar arguments; the apogee is Π+180°.
{
  let worst = 0;
  for (const y of [1950, 1990, 2000, 2026, 2050]) {
    const jd = dateToJD(y, 1, 1, 0, 0, 0);
    const T = (jd - 2451545.0) / 36525.0;
    const perigee = norm(
      (218.3164477 + 481267.88123421 * T) - (134.9633964 + 477198.8675055 * T),
    );
    let d = calcMeanLilith(jd) - norm(perigee + 180);
    if (d > 180) d -= 360;
    if (d < -180) d += 360;
    worst = Math.max(worst, Math.abs(d) * 60);
  }
  ok("LILITH-APOGEE", worst < 2,
    `within ${worst.toFixed(2)}′ of the true mean apogee (perigee bug was 180°)`);
}

// ── Transit orbs are signed deviations, not raw separations ────────────────
// Every reported orb must be no larger than the widest orb budget in the
// table (5°). Before the fix, aspects approached from behind reported 358°,
// 119°, 181° — and the "sorted by tightness" list put them first.
{
  let worst = 0;
  for (let sep = 0; sep < 360; sep += 0.5) {
    const hits = detectTransitAspects({ Moon: norm(sep) }, { Sun: 0 });
    for (const h of hits) worst = Math.max(worst, Math.abs(h.orb));
  }
  ok("ORB-SIGNED", worst <= 5 + 1e-9,
    `widest reported |orb| = ${worst.toFixed(2)}° over a full sweep (budget 5°)`);
}

// ── The ephemeris series themselves ────────────────────────────────────────
// Meeus, Astronomical Algorithms, worked examples. These passed before the
// audit; they exist so a future "optimisation" of the series gets caught.
{
  const sun = calcPlanetDeg(0, 2448908.5);           // 1992-10-13.0 TD
  ok("MEEUS-SUN", Math.abs(sun - 199.90988) * 3600 < 5,
    `Ex. 25.a → ${sun.toFixed(5)}° (expected 199.90988, Δ ${((sun - 199.90988) * 3600).toFixed(1)}″)`);

  const moon = calcPlanetDeg(1, 2448724.5);          // 1992-04-12.0 TD
  ok("MEEUS-MOON-LON", Math.abs(moon - 133.162655) * 3600 < 5,
    `Ex. 47.a → ${moon.toFixed(6)}° (expected 133.162655, Δ ${((moon - 133.162655) * 3600).toFixed(1)}″)`);

  const beta = calcMoonLatitude(2448724.5);
  ok("MEEUS-MOON-LAT", Math.abs(beta + 3.229126) * 3600 < 60,
    `Ex. 47.a → ${beta.toFixed(6)}° (expected −3.229126, Δ ${((beta + 3.229126) * 3600).toFixed(1)}″)`);
}

// ── Eclipse canon ──────────────────────────────────────────────────────────
// Type, sub-type and instant against the NASA five-millennium canon. The
// engine is the good one in this file; this pins it so the cheap
// distance-from-node shortcut can never creep back.
{
  const canon: Array<[string, number, number, number, string, string, string]> = [
    ["2024-04-08", 2024, 4, 1, "solar", "total", "18:17"],
    ["2024-09-18", 2024, 9, 10, "lunar", "partial", "02:44"],
    ["2025-03-14", 2025, 3, 1, "lunar", "total", "06:58"],
    ["2025-09-07", 2025, 9, 1, "lunar", "total", "18:11"],
    ["2026-02-17", 2026, 2, 1, "solar", "annular", "12:12"],
    ["2026-03-03", 2026, 3, 1, "lunar", "total", "11:33"],
    ["2026-08-12", 2026, 8, 1, "solar", "total", "17:46"],
  ];
  let matched = 0;
  let worstMin = 0;
  for (const [label, y, m, d, type, kind, hhmm] of canon) {
    const e = findEclipseWithin(dateToJD(y, m, d, 0, 0, 0), 24 * 20);
    if (!e || e.type !== type || e.kind !== kind) {
      console.error(`       ${label}: got ${e ? `${e.type}/${e.kind}` : "nothing"}, expected ${type}/${kind}`);
      continue;
    }
    const [hh, mm] = hhmm.split(":").map(Number);
    const expected = Date.UTC(y, e.date.getUTCMonth(), e.date.getUTCDate(), hh, mm);
    const driftMin = Math.abs(e.date.getTime() - expected) / 60000;
    worstMin = Math.max(worstMin, driftMin);
    if (driftMin <= 5) matched++;
  }
  ok("ECLIPSE-CANON", matched === canon.length,
    `${matched}/${canon.length} events with correct sub-type, worst drift ${worstMin.toFixed(1)} min`);
}

// ── Report ─────────────────────────────────────────────────────────────────
console.log(
  failures === 0
    ? `\n${checks}/${checks} astronomy invariants hold.\n`
    : `\n${checks - failures}/${checks} passed — ${failures} FAILED.\n`,
);
if (failures > 0) process.exitCode = 1;
