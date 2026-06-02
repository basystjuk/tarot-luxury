/**
 * Shared video-metadata formatting helpers.
 *
 * Single source of truth for the "video description" string. Used by:
 *  - components/journal/VideoSchema.tsx  (Schema.org VideoObject)
 *  - app/sitemap-videos.xml/route.ts     (Google video sitemap)
 *
 * Why centralised: YouTube often omits descriptions on shorts, so the
 * raw `v.description` is an EMPTY STRING (not null), and `??` doesn't
 * catch it. That made Google Search Console raise "Missing field
 * 'description'" warnings on most of our VideoObject markup. The helper
 * below guarantees a non-empty, descriptive string for every video.
 */

const BRAND_SUFFIX = {
  uk: "розклад Таро · Ellen Soul",
  ru: "расклад Таро · Ellen Soul",
  en: "Tarot reading · Ellen Soul",
} as const;

export interface VideoLite { title: string; description: string | null }

/**
 * Return a guaranteed non-empty description for SEO markup.
 * If YouTube provided one, use it (trimmed, capped to `max` chars).
 * Otherwise synthesise from title + brand suffix.
 */
export function describeVideo(
  v: VideoLite,
  opts: { lang?: "uk" | "ru" | "en"; max?: number } = {}
): string {
  const max = opts.max ?? 500;
  const trimmed = (v.description ?? "").trim();
  if (trimmed.length > 0) return trimmed.slice(0, max);
  const lang = opts.lang ?? "uk";
  const title = (v.title ?? "").trim();
  const suffix = BRAND_SUFFIX[lang];
  // "Title · brand suffix" — natural, search-friendly, never empty.
  const base = title ? `${title} — ${suffix}` : suffix;
  return base.slice(0, max);
}
