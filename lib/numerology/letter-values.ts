/**
 * Pythagorean letter values for numerology.
 *
 * Mapping is "adapted Pythagorean" — each letter gets a 1-9 value by its
 * position in the alphabet, then reduced. Ukrainian and Russian alphabets
 * share most letters; soft signs (ь, ъ) are intentionally excluded — they
 * carry no sound.
 *
 * Used across the numerology tool: page calculations, AI synthesis,
 * and the upcoming Pinnacle/Challenge/Plane-of-Expression modules.
 */

export const LETTER_VALUES: Record<string, number> = {
  // Ukrainian
  а: 1, б: 2, в: 3, г: 4, ґ: 5, д: 6, е: 7, є: 8, ж: 9,
  з: 1, и: 2, і: 3, ї: 4, й: 5, к: 6, л: 7, м: 8, н: 9,
  о: 1, п: 2, р: 3, с: 4, т: 5, у: 6, ф: 7, х: 8, ц: 9,
  ч: 1, ш: 2, щ: 3, ю: 5, я: 6,
  // Russian extras
  ё: 7, ы: 2, э: 5,
  // Latin
  a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9,
  j: 1, k: 2, l: 3, m: 4, n: 5, o: 6, p: 7, q: 8, r: 9,
  s: 1, t: 2, u: 3, v: 4, w: 5, x: 6, y: 7, z: 8,
};

export const VOWELS = new Set([
  "а", "е", "є", "и", "і", "ї", "о", "у", "ю", "я", "ё", "ы", "э",
  "a", "e", "i", "o", "u",
]);

/** Master numbers — never reduced further. */
export const MASTER_NUMBERS = new Set([11, 22, 33]);

/** Reduce to single digit unless master number. */
export function reduceNum(n: number): number {
  if (MASTER_NUMBERS.has(n)) return n;
  if (n < 10) return n;
  return reduceNum(String(n).split("").reduce((a, d) => a + parseInt(d, 10), 0));
}

/**
 * Reduce to single digit ALWAYS — master numbers collapse too.
 * Used for Challenges and Plane-of-Expression categories where the
 * standard (Hans Decoz) treats every value as a digit.
 */
export function reduceToDigit(n: number): number {
  let v = Math.abs(n);
  while (v >= 10) {
    v = String(v).split("").reduce((a, d) => a + parseInt(d, 10), 0);
  }
  return v;
}

/** Karmic debt: raw sum is 13, 14, 16, or 19 anywhere in the chain. */
export function findKarmic(raw: number): number | null {
  if ([13, 14, 16, 19].includes(raw)) return raw;
  if (raw < 10) return null;
  const next = String(raw).split("").reduce((a, d) => a + parseInt(d, 10), 0);
  return findKarmic(next);
}

/** Sum each digit of a number — used inside reducers. */
export function digitSum(n: number): number {
  return String(Math.abs(n)).split("").reduce((a, d) => a + parseInt(d, 10), 0);
}

/** First letter of a name (skips whitespace/punctuation). */
export function firstLetter(name: string): string {
  for (const c of name.toLowerCase()) {
    if (LETTER_VALUES[c] !== undefined) return c;
  }
  return "";
}

/** Last letter of a name (skips whitespace/punctuation). */
export function lastLetter(name: string): string {
  const lower = name.toLowerCase();
  for (let i = lower.length - 1; i >= 0; i--) {
    if (LETTER_VALUES[lower[i]] !== undefined) return lower[i];
  }
  return "";
}

/** First vowel of a name. */
export function firstVowel(name: string): string {
  for (const c of name.toLowerCase()) {
    if (VOWELS.has(c)) return c;
  }
  return "";
}
