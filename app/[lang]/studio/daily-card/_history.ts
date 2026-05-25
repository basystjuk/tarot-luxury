/**
 * Daily-card history (Phase A — local journal).
 *
 * Stores up to 30 days of drawn cards in localStorage. Once Supabase
 * arrives (Phase В), this becomes the migration source and the cap goes
 * away. Until then we warn the user before pruning and let them save a
 * day's reading as a PNG before it's lost.
 *
 * The journal is keyed by Kyiv day (YYYY-MM-DD) so the daily lookup
 * stays consistent with the rate-limit + draw-once-per-day rules.
 */

const STORAGE_KEY = "ellen-soul:tarot-history";
const MAX_ENTRIES = 30;

export interface HistoryReading {
  meaning: string;
  advice: string;
  affirmation: string;
}

export interface HistoryEntry {
  day: string;            // YYYY-MM-DD in Kyiv tz
  cardIndex: number;      // 0–77
  reversed: boolean;
  question?: string;      // optional user question
  reading: HistoryReading | null; // null if rate-limited that day
  drawnAt: string;        // ISO timestamp (informational)
}

export function getKyivDay(): string {
  try {
    // sv-SE locale gives ISO YYYY-MM-DD reliably
    return new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Kiev" });
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}

function readAll(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as HistoryEntry[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      e => e && typeof e.day === "string"
        && typeof e.cardIndex === "number"
        && e.cardIndex >= 0 && e.cardIndex < 78
    );
  } catch {
    return [];
  }
}

function writeAll(entries: HistoryEntry[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch { /* quota / private mode — non-fatal */ }
}

/** Return all history entries newest-first. */
export function listHistory(): HistoryEntry[] {
  return readAll().slice().sort((a, b) => (a.day < b.day ? 1 : -1));
}

/** Look up the entry for a specific Kyiv day, or null. */
export function getEntry(day: string): HistoryEntry | null {
  return readAll().find(e => e.day === day) ?? null;
}

/**
 * Save (or update) today's entry. Returns `{ pruned }` — the slice of
 * older entries that had to be dropped to honour the 30-entry cap, so
 * the UI can warn / offer download.
 */
export function saveEntry(entry: HistoryEntry): { pruned: HistoryEntry[] } {
  const all = readAll();
  const others = all.filter(e => e.day !== entry.day);
  const merged = [entry, ...others].sort((a, b) => (a.day < b.day ? 1 : -1));
  const pruned: HistoryEntry[] = [];
  while (merged.length > MAX_ENTRIES) {
    const removed = merged.pop();
    if (removed) pruned.push(removed);
  }
  writeAll(merged);
  return { pruned };
}

/** Returns how close we are to the cap — used for the "warn before pruning" hint. */
export function nearingCap(): { count: number; cap: number; oldest: HistoryEntry | null } {
  const all = listHistory();
  return {
    count: all.length,
    cap: MAX_ENTRIES,
    oldest: all[all.length - 1] ?? null,
  };
}

/** Erase everything. Only call from an explicit user "clear all" action. */
export function clearHistory(): void {
  if (typeof window === "undefined") return;
  try { window.localStorage.removeItem(STORAGE_KEY); } catch { /* */ }
}
