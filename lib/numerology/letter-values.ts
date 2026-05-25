/**
 * Letter values + helpers for all 3 numerology schools (Phase Н1).
 *
 * Three schools coexist via the `NumerologySchool` enum. Each school owns:
 *   - its letter→digit map
 *   - its vowel set
 *   - its reducer/digit rules
 *
 *   1. SLAVIC PYTHAGOREAN ("Школа Александрова") — default for CIS audience.
 *      Cyrillic letters keep their cyrillic position-based values; Latin
 *      letters use Latin Pythagorean (1-9 by position). Й = consonant.
 *
 *   2. WESTERN PYTHAGOREAN — international standard. Cyrillic names are
 *      transliterated to Latin first (so "Олена" → "Olena" → value).
 *      Hans Decoz / Yates camp. Y = vowel when adjacent letters are all
 *      consonants (legacy rule).
 *
 *   3. CHALDEAN — older Babylonian-rooted system. 8 values (no 9 — sacred
 *      number). Letters grouped by sound vibration, not position. We
 *      transliterate cyrillic→latin first (no canonical cyrillic Chaldean
 *      table exists).
 */

// ── Public types ───────────────────────────────────────────────────────────

export type NumerologySchool = "slavic-pythagorean" | "western-pythagorean" | "chaldean";

export const SCHOOL_LABELS: Record<NumerologySchool, { uk: string; ru: string; en: string; basis: string }> = {
  "slavic-pythagorean":  {
    uk: "Слов'янська (Александров)", ru: "Славянская (Александров)", en: "Slavic (Aleksandrov)",
    basis: "Школа Pythagorean у кириличній адаптації Александрова. Й — приголосна.",
  },
  "western-pythagorean": {
    uk: "Західна (Hans Decoz)", ru: "Западная (Hans Decoz)", en: "Western (Hans Decoz)",
    basis: "Hans Decoz / Yates стандарт. Кирилиця транслітерується у латиницю. Y — голосна за правилами Decoz.",
  },
  "chaldean": {
    uk: "Халдейська", ru: "Халдейская", en: "Chaldean",
    basis: "Старовавилонська система, 8 чисел (без 9). Кирилиця транслітерується у латиницю.",
  },
};

// ── 1. Slavic Pythagorean (current cyrillic mapping kept verbatim) ─────────
const SLAVIC_VALUES: Record<string, number> = {
  // Ukrainian
  а: 1, б: 2, в: 3, г: 4, ґ: 5, д: 6, е: 7, є: 8, ж: 9,
  з: 1, и: 2, і: 3, ї: 4, й: 5, к: 6, л: 7, м: 8, н: 9,
  о: 1, п: 2, р: 3, с: 4, т: 5, у: 6, ф: 7, х: 8, ц: 9,
  ч: 1, ш: 2, щ: 3, ю: 5, я: 6,
  // Russian extras
  ё: 7, ы: 2, э: 5,
  // Latin (Slavic school also accepts Latin spellings)
  a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9,
  j: 1, k: 2, l: 3, m: 4, n: 5, o: 6, p: 7, q: 8, r: 9,
  s: 1, t: 2, u: 3, v: 4, w: 5, x: 6, y: 7, z: 8,
};
const SLAVIC_VOWELS = new Set([
  "а", "е", "є", "и", "і", "ї", "о", "у", "ю", "я", "ё", "ы", "э",
  "a", "e", "i", "o", "u",
  // Y treated as vowel in Slavic school (matches the Latin-Pythagorean default
  // for non-y-as-semi-vowel detection).
]);

// ── 2. Western Pythagorean (Latin position-based, after transliteration) ───
const WESTERN_VALUES: Record<string, number> = {
  a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9,
  j: 1, k: 2, l: 3, m: 4, n: 5, o: 6, p: 7, q: 8, r: 9,
  s: 1, t: 2, u: 3, v: 4, w: 5, x: 6, y: 7, z: 8,
};
// Western: a, e, i, o, u always vowels; y is vowel only when adjacent are
// all consonants ("Lynn", "Crystal"). We approximate this in `isVowel` below.
const WESTERN_BASE_VOWELS = new Set(["a", "e", "i", "o", "u"]);

// ── 3. Chaldean (sound-vibration grouping, no 9) ──────────────────────────
const CHALDEAN_VALUES: Record<string, number> = {
  a: 1, i: 1, j: 1, q: 1, y: 1,
  b: 2, k: 2, r: 2,
  c: 3, g: 3, l: 3, s: 3,
  d: 4, m: 4, t: 4,
  e: 5, h: 5, n: 5, x: 5,
  u: 6, v: 6, w: 6,
  o: 7, z: 7,
  f: 8, p: 8,
  // No letter resolves to 9 — that's the "sacred" number in Chaldean.
};
const CHALDEAN_VOWELS = new Set(["a", "e", "i", "o", "u", "y"]);

// ── Master numbers + reducers (shared across schools) ─────────────────────
export const MASTER_NUMBERS = new Set([11, 22, 33]);

export function reduceNum(n: number): number {
  if (MASTER_NUMBERS.has(n)) return n;
  if (n < 10) return n;
  return reduceNum(String(n).split("").reduce((a, d) => a + parseInt(d, 10), 0));
}

export function reduceToDigit(n: number): number {
  let v = Math.abs(n);
  while (v >= 10) {
    v = String(v).split("").reduce((a, d) => a + parseInt(d, 10), 0);
  }
  return v;
}

export function findKarmic(raw: number): number | null {
  if ([13, 14, 16, 19].includes(raw)) return raw;
  if (raw < 10) return null;
  const next = String(raw).split("").reduce((a, d) => a + parseInt(d, 10), 0);
  return findKarmic(next);
}

export function digitSum(n: number): number {
  return String(Math.abs(n)).split("").reduce((a, d) => a + parseInt(d, 10), 0);
}

// ── Cyrillic → Latin transliteration ──────────────────────────────────────
// Lossy but standard. Used by Western + Chaldean schools to normalise
// Cyrillic names. Multi-character output expands the letter count (e.g.
// "Ж" → "zh") which is correct — each phonetic component carries its own
// vibration in Pythagorean-style reduction.
const TRANSLIT: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "h", ґ: "g", д: "d", е: "e", є: "ie", ж: "zh",
  з: "z", и: "y", і: "i", ї: "i", й: "i", к: "k", л: "l", м: "m", н: "n",
  о: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "kh", ц: "ts",
  ч: "ch", ш: "sh", щ: "shch", ю: "iu", я: "ia",
  ё: "io", ы: "y", э: "e",
  ь: "", ъ: "",
};
export function transliterateCyrillic(s: string): string {
  let out = "";
  for (const ch of s.toLowerCase()) {
    out += TRANSLIT[ch] ?? ch;
  }
  return out;
}

// ── School-aware letter helpers ────────────────────────────────────────────

/** Convert a name to its "canonical" form for the given school. */
export function canonicaliseName(name: string, school: NumerologySchool): string {
  const lower = name.toLowerCase();
  if (school === "slavic-pythagorean") return lower;
  // Both Western + Chaldean transliterate.
  return transliterateCyrillic(lower);
}

/** Map a single canonicalised character to its numerology value (or 0 if unknown). */
export function letterValue(ch: string, school: NumerologySchool): number {
  switch (school) {
    case "slavic-pythagorean":  return SLAVIC_VALUES[ch]  ?? 0;
    case "western-pythagorean": return WESTERN_VALUES[ch] ?? 0;
    case "chaldean":            return CHALDEAN_VALUES[ch] ?? 0;
  }
}

/**
 * Vowel test for a canonicalised character in the given school.
 *
 * For Western, we honour the "Y as conditional vowel" rule: Y is a vowel
 * when it's the only vowel in its syllable. Approximation: if Y is
 * adjacent to no other a/e/i/o/u within ±1 position, treat as vowel.
 * The caller passes the surrounding context via `prev` / `next`.
 */
export function isVowel(ch: string, school: NumerologySchool, prev?: string, next?: string): boolean {
  switch (school) {
    case "slavic-pythagorean": return SLAVIC_VOWELS.has(ch);
    case "chaldean":           return CHALDEAN_VOWELS.has(ch);
    case "western-pythagorean": {
      if (WESTERN_BASE_VOWELS.has(ch)) return true;
      if (ch === "y") {
        // Y is a vowel when no other vowel is adjacent. Rough check on
        // ±1 — captures "Lynn", "Crystal", "Mary" correctly enough.
        const p = prev?.toLowerCase() ?? "";
        const n = next?.toLowerCase() ?? "";
        const adjacentVowel =
          WESTERN_BASE_VOWELS.has(p) || WESTERN_BASE_VOWELS.has(n);
        return !adjacentVowel;
      }
      return false;
    }
  }
}

// ── First/last/first-vowel walkers (school-aware) ─────────────────────────

/**
 * First / last / first-vowel walkers. School defaults to Slavic so
 * legacy callers (pre-Н1) keep working unchanged.
 */
export function firstLetter(name: string, school: NumerologySchool = "slavic-pythagorean"): string {
  const c = canonicaliseName(name, school);
  for (const ch of c) if (letterValue(ch, school) > 0) return ch;
  return "";
}

export function lastLetter(name: string, school: NumerologySchool = "slavic-pythagorean"): string {
  const c = canonicaliseName(name, school);
  for (let i = c.length - 1; i >= 0; i--) {
    if (letterValue(c[i], school) > 0) return c[i];
  }
  return "";
}

export function firstVowel(name: string, school: NumerologySchool = "slavic-pythagorean"): string {
  const c = canonicaliseName(name, school);
  for (let i = 0; i < c.length; i++) {
    if (letterValue(c[i], school) > 0 && isVowel(c[i], school, c[i - 1], c[i + 1])) return c[i];
  }
  return "";
}

// ── Sum helpers used by the calculators ────────────────────────────────────

/** Sum the values of vowels in a name, school-aware. Returns 0 if none. */
export function sumVowels(name: string, school: NumerologySchool): number {
  const c = canonicaliseName(name, school);
  let sum = 0;
  for (let i = 0; i < c.length; i++) {
    if (isVowel(c[i], school, c[i - 1], c[i + 1])) sum += letterValue(c[i], school);
  }
  return sum;
}

/** Sum the values of consonants in a name, school-aware. */
export function sumConsonants(name: string, school: NumerologySchool): number {
  const c = canonicaliseName(name, school);
  let sum = 0;
  for (let i = 0; i < c.length; i++) {
    if (letterValue(c[i], school) > 0 && !isVowel(c[i], school, c[i - 1], c[i + 1])) {
      sum += letterValue(c[i], school);
    }
  }
  return sum;
}

/** Sum the values of all letters in a name (vowels + consonants). */
export function sumAllLetters(name: string, school: NumerologySchool): number {
  const c = canonicaliseName(name, school);
  let sum = 0;
  for (const ch of c) sum += letterValue(ch, school);
  return sum;
}

// ── Backwards-compatibility shims (old code paths) ────────────────────────
// The original public API used a fixed Slavic-school table. Existing
// callers stay unbroken — they implicitly default to Slavic.

export const LETTER_VALUES: Record<string, number> = SLAVIC_VALUES;
export const VOWELS = SLAVIC_VOWELS;
