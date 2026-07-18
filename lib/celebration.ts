/**
 * Celebration overlay — configuration & scheduling helpers.
 *
 * A "celebration" is a full-screen cinematic overlay (see
 * `components/celebration/CelebrationOverlay.tsx`) that plays once per visitor
 * inside a date window. Config lives in the same Vercel-Blob content document
 * as the rest of the site (key `celebration`) and is edited from the admin
 * panel — no DB table needed.
 *
 * Extensible by design: `theme` selects which animation plays, so future
 * holidays can reuse the same plumbing with a new theme id + a new branch in
 * the animation engine.
 */

export type CelebrationTheme = "birthday_cancer";

export interface CelebrationConfig {
  /** Master switch. If false, nothing (intro, atmosphere, footer) shows. */
  enabled: boolean;
  /** Which animation/theme to play. */
  theme: CelebrationTheme;
  /** Inclusive first day the overlay may appear (local date, YYYY-MM-DD). */
  startDate: string;
  /** Inclusive last day the overlay may appear (local date, YYYY-MM-DD). */
  endDate: string;
  /** Owner-facing label only (never shown to visitors). */
  title: string;
  /** Play the cinematic intro overlay (once per visitor). */
  intro: boolean;
  /** The living site-wide layer: ambient particles, shooting stars, cursor
   *  magic, hover dust, footer scene and browser-tab signals. */
  atmosphere: boolean;
}

/** Themes offered in the admin dropdown. Add new holidays here. */
export const CELEBRATION_THEMES: { id: CelebrationTheme; label: string }[] = [
  { id: "birthday_cancer", label: "День народження — Рак (сфера · гліф ♋ · зорепад)" },
];

/**
 * Default lives in code so the overlay works the moment it ships, before the
 * owner ever opens the admin tab. Date-gated to Ellen's birthday window, so it
 * auto-stops after 21 Jul without any manual step.
 */
export const DEFAULT_CELEBRATION: CelebrationConfig = {
  enabled: true,
  theme: "birthday_cancer",
  startDate: "2026-07-18",
  endDate: "2026-07-21",
  title: "День народження Ellen",
  intro: true,
  atmosphere: true,
};

/** Local calendar date as YYYY-MM-DD (visitor's own timezone). */
export function todayLocalISO(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Coerce an unknown blob value into a complete, valid config. */
export function normalizeCelebration(raw: unknown): CelebrationConfig {
  const c = (raw ?? {}) as Partial<CelebrationConfig>;
  const theme = CELEBRATION_THEMES.some((t) => t.id === c.theme)
    ? (c.theme as CelebrationTheme)
    : DEFAULT_CELEBRATION.theme;
  return {
    enabled: typeof c.enabled === "boolean" ? c.enabled : DEFAULT_CELEBRATION.enabled,
    theme,
    startDate: ISO_DATE.test(c.startDate ?? "") ? (c.startDate as string) : DEFAULT_CELEBRATION.startDate,
    endDate: ISO_DATE.test(c.endDate ?? "") ? (c.endDate as string) : DEFAULT_CELEBRATION.endDate,
    title: typeof c.title === "string" && c.title.trim() ? c.title : DEFAULT_CELEBRATION.title,
    intro: typeof c.intro === "boolean" ? c.intro : DEFAULT_CELEBRATION.intro,
    atmosphere: typeof c.atmosphere === "boolean" ? c.atmosphere : DEFAULT_CELEBRATION.atmosphere,
  };
}

/**
 * True when the overlay should be eligible to play today. ISO date strings sort
 * lexically, so plain string comparison is a correct inclusive range check.
 */
export function isCelebrationActive(
  c: CelebrationConfig,
  todayISO: string = todayLocalISO(),
): boolean {
  if (!c.enabled) return false;
  return c.startDate <= todayISO && todayISO <= c.endDate;
}

/**
 * localStorage key for "this visitor already saw it". Keyed by theme + start
 * date so a re-scheduled or re-themed celebration shows again next time.
 */
export function celebrationSeenKey(c: CelebrationConfig): string {
  return `ellen_celebration_seen_${c.theme}_${c.startDate}`;
}
