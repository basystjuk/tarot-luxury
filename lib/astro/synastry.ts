/**
 * Full synastry engine.
 *
 * Compares EVERY planet of chart A against EVERY planet of chart B and
 * detects the major Ptolemaic aspects between them (the cross-aspect grid
 * professional astrologers actually read), then aggregates a harmony score.
 *
 * This is the depth upgrade over Sun-sign synastry: instead of one
 * Sun↔Sun aspect, we weigh the whole 7×7 inter-aspect matrix, boosting
 * luminary (Sun/Moon) and relationship (Venus/Mars) contacts and weighting
 * each aspect by how tight (close to exact) it is.
 *
 * Pure + deterministic — no I/O, fully unit-testable.
 */

export type PlanetName = "Sun" | "Moon" | "Mercury" | "Venus" | "Mars" | "Jupiter" | "Saturn";
export type AspectKind = "conjunction" | "sextile" | "square" | "trine" | "opposition";
export type AspectPolarity = "harmonious" | "tense" | "neutral";

export interface SynastryAspect {
  a: PlanetName;        // chart-A planet
  b: PlanetName;        // chart-B planet
  kind: AspectKind;
  orb: number;          // degrees from exact (0 = perfect)
  polarity: AspectPolarity;
  contribution: number; // signed weight folded into the score
}

export interface SynastryResult {
  aspects: SynastryAspect[]; // significant aspects, sorted by tightness × weight
  score1to5: number;         // 1..5 bucket (for ScoreBar)
  percent: number;           // 0..100 harmony headline
  harmoniousCount: number;
  tenseCount: number;
}

export const PLANET_ORDER: PlanetName[] = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn"];

const ASPECT_DEFS: Array<{
  kind: AspectKind; angle: number; baseOrb: number; polarity: AspectPolarity; base: number;
}> = [
  // base = signed weight at perfect orb. Opposition is softer than square
  // because in synastry it reads as attraction/полярність, not pure conflict.
  { kind: "conjunction", angle: 0,   baseOrb: 8, polarity: "neutral",    base: 1.0 },
  { kind: "sextile",     angle: 60,  baseOrb: 5, polarity: "harmonious", base: 1.2 },
  { kind: "square",      angle: 90,  baseOrb: 6, polarity: "tense",      base: -1.3 },
  { kind: "trine",       angle: 120, baseOrb: 7, polarity: "harmonious", base: 1.6 },
  { kind: "opposition",  angle: 180, baseOrb: 8, polarity: "tense",      base: -0.7 },
];

// Luminaries and relationship planets carry more weight in synastry.
const PLANET_WEIGHT: Record<PlanetName, number> = {
  Sun: 1.5, Moon: 1.5, Venus: 1.4, Mars: 1.3, Mercury: 1.0, Jupiter: 1.1, Saturn: 1.1,
};

/** Shortest angular separation in [0,180]. */
function separation(a: number, b: number): number {
  let d = (((a - b) % 360) + 360) % 360; // 0..360
  if (d > 180) d = 360 - d;              // 0..180
  return d;
}

export function computeSynastry(
  chartA: Partial<Record<PlanetName, number>>,
  chartB: Partial<Record<PlanetName, number>>,
): SynastryResult {
  const aspects: SynastryAspect[] = [];
  let harmoniousSum = 0, tenseSum = 0;
  let harmoniousCount = 0, tenseCount = 0;

  for (const pa of PLANET_ORDER) {
    const lonA = chartA[pa];
    if (lonA == null) continue;
    for (const pb of PLANET_ORDER) {
      const lonB = chartB[pb];
      if (lonB == null) continue;
      const sep = separation(lonA, lonB);

      // Find the single closest aspect within orb.
      let best: { def: typeof ASPECT_DEFS[number]; orb: number } | null = null;
      for (const def of ASPECT_DEFS) {
        const lumin = pa === "Sun" || pa === "Moon" || pb === "Sun" || pb === "Moon";
        const orbAllow = def.baseOrb + (lumin ? 1 : 0);
        const orb = Math.abs(sep - def.angle);
        if (orb <= orbAllow && (!best || orb < best.orb)) best = { def, orb };
      }
      if (!best) continue;

      const { def, orb } = best;
      const lumin = pa === "Sun" || pa === "Moon" || pb === "Sun" || pb === "Moon";
      const orbAllow = def.baseOrb + (lumin ? 1 : 0);
      const tightness = 1 - orb / orbAllow;                  // 0..1
      const planetW = (PLANET_WEIGHT[pa] + PLANET_WEIGHT[pb]) / 2;
      const contribution = def.base * tightness * planetW;

      aspects.push({ a: pa, b: pb, kind: def.kind, orb, polarity: def.polarity, contribution });
      if (def.polarity === "harmonious") { harmoniousSum += contribution; harmoniousCount++; }
      else if (def.polarity === "tense") { tenseSum += Math.abs(contribution); tenseCount++; }
      else { harmoniousSum += contribution * 0.6; } // conjunction leans mildly positive
    }
  }

  const activity = harmoniousSum + tenseSum;
  // Harmony ratio drives the headline; with no aspects at all default to neutral.
  const harmonyRatio = activity > 0 ? harmoniousSum / activity : 0.5;
  const percent = Math.round(30 + harmonyRatio * 60); // 30..90
  const score1to5 = Math.max(1, Math.min(5, Math.round(percent / 20)));

  aspects.sort((x, y) => Math.abs(y.contribution) - Math.abs(x.contribution));

  return { aspects, score1to5, percent, harmoniousCount, tenseCount };
}
