/**
 * Schema.org VideoObject + ItemList JSON-LD.
 *
 * Server-rendered <script type="application/ld+json"> blocks. Tells Google
 * each video on the page is a structured VideoObject so it can show rich
 * snippets (thumbnail + duration in SERP) — a strong free SEO win.
 *
 * Spec: https://developers.google.com/search/docs/appearance/structured-data/video
 */

import type { JournalVideo } from "@/app/api/journal/videos/route";

const SITE = "https://ellen-soul.com";

function isoDuration(seconds: number | null | undefined): string | undefined {
  if (!seconds || seconds <= 0) return undefined;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `PT${h ? `${h}H` : ""}${m ? `${m}M` : ""}${s}S`;
}

function videoObject(v: JournalVideo) {
  return {
    "@type": "VideoObject",
    name: v.title,
    description: (v.description ?? v.title).slice(0, 500),
    thumbnailUrl: [v.thumb_url],
    uploadDate: v.published_at,
    duration: isoDuration(v.duration_seconds),
    contentUrl: `https://www.youtube.com/watch?v=${v.id}`,
    embedUrl: `https://www.youtube-nocookie.com/embed/${v.id}`,
    interactionStatistic: v.view_count
      ? {
          "@type": "InteractionCounter",
          interactionType: { "@type": "WatchAction" },
          userInteractionCount: v.view_count,
        }
      : undefined,
    publisher: { "@type": "Organization", name: "Ellen Soul", url: SITE },
  };
}

export default function VideoSchema({ videos, lang }: { videos: JournalVideo[]; lang: "uk" | "ru" | "en" }) {
  if (!videos || videos.length === 0) return null;
  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: lang === "ru" ? "Дневник таролога"
        : lang === "en" ? "Tarot Diary"
        : "Щоденник таролога",
    url: `${SITE}/${lang}/blog`,
    numberOfItems: videos.length,
    itemListElement: videos.map((v, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: videoObject(v),
    })),
  };
  return (
    <script
      type="application/ld+json"
      // JSON.stringify is XSS-safe here (no user-controlled HTML) and Schema
      // markup must be inlined in <head>/<body>, not loaded externally.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }}
    />
  );
}
