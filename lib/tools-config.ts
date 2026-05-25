/**
 * Central registry of Soul Studio tools.
 *
 * Each tool has a stable `id` (also the URL slug under `/studio/`) and a
 * default enabled flag. Admins can toggle tools on/off; the live state lives
 * in the `site-content.json` blob under `tools_enabled`. Disabled tools are
 * hidden from public listings and their pages render a "Coming Soon" stub,
 * unless the visitor has the preview cookie set.
 */

export type ToolId =
  | "daily-card"
  | "numerology"
  | "compatibility"
  | "moon-phase"
  | "natal-chart";

export const ALL_TOOL_IDS: ToolId[] = [
  "daily-card",
  "numerology",
  "compatibility",
  "moon-phase",
  "natal-chart",
];

/**
 * Defaults. Anything not yet ready ships as disabled so the public never
 * sees a half-built tool.
 *
 * Currently OFF (in active polish — owner can re-enable from admin once
 * admin save is verified working):
 *   - compatibility  (Phase N9 — needs synastry build-out)
 *
 * Natal Chart was enabled in Phase М7+М17 once the planet positions
 * (М1), Placidus algorithm (М7) and AI portrait endpoint were live.
 */
export const DEFAULT_TOOLS_ENABLED: Record<ToolId, boolean> = {
  "daily-card": true,
  numerology: true,
  compatibility: false,
  "moon-phase": true,
  "natal-chart": true,
};

/** Human-readable labels for the admin toggles (uk/ru/en). */
export const TOOL_LABELS: Record<ToolId, { uk: string; ru: string; en: string }> = {
  "daily-card":   { uk: "Карта дня",          ru: "Карта дня",            en: "Card of the Day" },
  numerology:     { uk: "Нумерологія",        ru: "Нумерология",          en: "Numerology" },
  compatibility:  { uk: "Карта сумісності",   ru: "Карта совместимости",  en: "Compatibility Map" },
  "moon-phase":   { uk: "Місячний провідник", ru: "Лунный проводник",     en: "Moon Guide" },
  "natal-chart":  { uk: "Натальна карта",     ru: "Натальная карта",      en: "Natal Chart" },
};

export function isToolEnabled(
  id: ToolId,
  toolsEnabled: Partial<Record<ToolId, boolean>> | undefined | null
): boolean {
  if (!toolsEnabled) return DEFAULT_TOOLS_ENABLED[id];
  const v = toolsEnabled[id];
  return typeof v === "boolean" ? v : DEFAULT_TOOLS_ENABLED[id];
}
