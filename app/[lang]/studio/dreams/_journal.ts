"use client";

/**
 * Dream journal — localStorage archive.
 *
 * Consistent with the Daily Card journal pattern (no account needed). Stores
 * up to 60 dreams with their detected symbols + AI reading, and derives
 * "frequent symbols" and "recurring dream" patterns from the archive.
 */

export interface JournalReading {
  interpretation?: string;
  emotionalMessage?: string;
  subconsciousMessage?: string;
  affirmation?: string;
  reflectionQuestions?: string[];
}

export interface DreamEntry {
  id: string;
  iso: string;             // ISO datetime
  text: string;
  symbols: string[];       // slugs
  tone: string;
  positivityPercent: number;
  archetypes: string[];
  reading?: JournalReading;
}

const KEY = "ellen:dreams:journal";
const MAX = 60;

export function loadJournal(): DreamEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch { return []; }
}

export function saveEntry(entry: DreamEntry): DreamEntry[] {
  const list = loadJournal();
  const next = [entry, ...list.filter((e) => e.id !== entry.id)].slice(0, MAX);
  try { window.localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* quota */ }
  return next;
}

export function deleteEntry(id: string): DreamEntry[] {
  const next = loadJournal().filter((e) => e.id !== id);
  try { window.localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* */ }
  return next;
}

/** Symbol slugs ranked by how often they appear across the journal. */
export function frequentSymbols(list: DreamEntry[]): Array<{ slug: string; count: number }> {
  const counts = new Map<string, number>();
  for (const e of list) for (const s of e.symbols) counts.set(s, (counts.get(s) ?? 0) + 1);
  return [...counts.entries()]
    .map(([slug, count]) => ({ slug, count }))
    .filter((x) => x.count >= 2)
    .sort((a, b) => b.count - a.count);
}

/** Symbols that recur (appear in 3+ separate dreams) → possible pattern. */
export function recurringSymbols(list: DreamEntry[]): string[] {
  return frequentSymbols(list).filter((x) => x.count >= 3).map((x) => x.slug);
}
