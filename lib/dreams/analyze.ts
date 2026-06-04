/**
 * Deterministic dream analysis.
 *
 * Pure, instant, offline-capable. Detects known symbols from the dreamer's
 * free text, aggregates an emotional tone (positivity) and the dominant
 * archetypes. This powers the FREE tier of the Сонник tool (shown before /
 * without the auth-gated AI synthesis) and gives the AI a clean structured
 * seed so it never has to "find" symbols itself.
 */

import { DREAM_SYMBOLS, ARCHETYPE_LABELS, type DreamSymbol, type Archetype } from "./symbols";

export type DreamTone = "anxious" | "neutral" | "inspiring";

export interface DreamAnalysis {
  symbols: DreamSymbol[];        // detected, in first-appearance order
  /** -2..+2 average positivity of detected symbols (0 if none). */
  positivityScore: number;
  /** 0..100 for the visual meter (50 = neutral). */
  positivityPercent: number;
  tone: DreamTone;
  archetypes: Archetype[];       // dominant, max 3
}

function normalise(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/['ʼ`’']/g, "")
    .replace(/ё/g, "е");
}

/**
 * Detect known symbols in free text. Order = first appearance.
 *
 * Matching is by WORD-PREFIX, not raw substring — a stem hits a token only
 * if the token starts with it. This captures inflections ("вовк" → вовка,
 * вовком, вовки) while avoiding false positives where a short stem hides
 * inside an unrelated word (e.g. "дом" must NOT match "відомих").
 *
 * Multi-word stems (those containing a space, e.g. "dead relative") fall
 * back to a plain substring search since they can't be a single token.
 */
export function detectSymbols(text: string): DreamSymbol[] {
  const norm = normalise(text);
  // Tokens with their start offset, so we can order hits by appearance.
  const tokens: Array<{ word: string; at: number }> = [];
  const re = /[\p{L}]+/gu;
  let m: RegExpExecArray | null;
  while ((m = re.exec(norm)) !== null) tokens.push({ word: m[0], at: m.index });

  const hits: Array<{ sym: DreamSymbol; at: number }> = [];
  for (const sym of DREAM_SYMBOLS) {
    const stems = [...sym.keywords.uk, ...sym.keywords.ru, ...sym.keywords.en]
      .map(normalise)
      .filter(Boolean);
    let best = -1;
    for (const stem of stems) {
      if (stem.includes(" ")) {
        // multi-word stem → substring search
        const idx = norm.indexOf(stem);
        if (idx !== -1 && (best === -1 || idx < best)) best = idx;
        continue;
      }
      for (const t of tokens) {
        if (t.word.startsWith(stem) && (best === -1 || t.at < best)) best = t.at;
      }
    }
    if (best !== -1) hits.push({ sym, at: best });
  }
  hits.sort((a, b) => a.at - b.at);
  return hits.map((h) => h.sym);
}

export function analyzeDream(text: string): DreamAnalysis {
  const symbols = detectSymbols(text);

  // Tone = average positivity of detected symbols.
  const score = symbols.length
    ? symbols.reduce((s, x) => s + x.positivity, 0) / symbols.length
    : 0;
  const positivityScore = Math.round(score * 100) / 100;
  // Map -2..+2 → 0..100.
  const positivityPercent = Math.max(0, Math.min(100, Math.round(((score + 2) / 4) * 100)));
  const tone: DreamTone = score <= -0.75 ? "anxious" : score >= 0.75 ? "inspiring" : "neutral";

  // Archetypes — frequency across detected symbols, top 3.
  const counts = new Map<Archetype, number>();
  for (const sym of symbols) {
    for (const a of sym.archetypes) counts.set(a, (counts.get(a) ?? 0) + 1);
  }
  const archetypes = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([a]) => a);

  return { symbols, positivityScore, positivityPercent, tone, archetypes };
}

export { ARCHETYPE_LABELS };
