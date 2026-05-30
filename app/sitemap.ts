import { MetadataRoute } from "next";
import { ALL_TOOL_IDS } from "@/lib/tools-config";

/**
 * Multilingual sitemap.
 *
 * Every public page exists in three locales (uk / ru / en). We emit one
 * `<url>` block per locale with proper `alternates.languages` and
 * `x-default` so Google can serve the right translation per searcher and
 * collapse the cluster into one ranking signal.
 *
 * The "/" page is the language landing chooser; per-locale roots live at
 * /uk, /ru, /en — those are the real homepages and get priority 1.0.
 *
 * Video URLs are exposed via a separate /sitemap-videos.xml (see route.ts)
 * so video markup can be served alongside each entry.
 */

const BASE = "https://ellen-soul.com";
const LOCALES = ["uk", "ru", "en"] as const;
type Locale = (typeof LOCALES)[number];

// Page → priority + change frequency. Slugs are the path AFTER the locale.
const PAGES: Array<{ slug: string; priority: number; cf: "daily" | "weekly" | "monthly" }> = [
  { slug: "",          priority: 1.0,  cf: "weekly"  }, // localised home
  { slug: "/about",    priority: 0.9,  cf: "monthly" },
  { slug: "/services", priority: 0.95, cf: "monthly" },
  { slug: "/blog",     priority: 0.9,  cf: "daily"   }, // videos refresh daily
  { slug: "/studio",   priority: 0.85, cf: "weekly"  },
  { slug: "/faq",      priority: 0.8,  cf: "monthly" },
  { slug: "/contacts", priority: 0.85, cf: "monthly" },
];

// Each studio tool, registered in tools-config.ts.
const TOOLS = ALL_TOOL_IDS.map((id) => ({
  slug: `/studio/${id}`,
  // daily-card refreshes daily; the rest are stable computations.
  priority: id === "daily-card" || id === "horoscope" ? 0.8 : 0.75,
  cf: (id === "daily-card" || id === "horoscope" ? "daily" : "monthly") as "daily" | "monthly",
}));

const ALL_PAGES = [...PAGES, ...TOOLS];

function urlFor(loc: Locale, slug: string): string {
  return `${BASE}/${loc}${slug}`;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  for (const page of ALL_PAGES) {
    for (const loc of LOCALES) {
      entries.push({
        url: urlFor(loc, page.slug),
        lastModified: now,
        changeFrequency: page.cf,
        priority: page.priority,
        // hreflang alternates so Google clusters the language variants.
        alternates: {
          languages: {
            uk: urlFor("uk", page.slug),
            ru: urlFor("ru", page.slug),
            en: urlFor("en", page.slug),
            "x-default": urlFor("uk", page.slug),
          },
        },
      });
    }
  }
  return entries;
}
