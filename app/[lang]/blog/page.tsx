/**
 * /blog — "Щоденник таролога" video journal (Phase В1).
 *
 * Server Component:
 *   - Fetches visible videos straight from Supabase at request time (RLS
 *     allows anon to read non-hidden rows; no API round-trip needed).
 *   - Renders the magazine-style hero block + injects Schema.org JSON-LD
 *     so Google sees a structured ItemList of VideoObject for rich
 *     snippets in SERP.
 *
 * Client island (_journal-client.tsx) owns the interactive parts: tag
 * filter, "show more" pagination, lite-youtube hover previews.
 *
 * Telegram channel CTA from the old blog is intentionally removed.
 */

import AnimatedSection from "@/components/ui/AnimatedSection";
import GoldDivider from "@/components/ui/GoldDivider";
import VideoSchema from "@/components/journal/VideoSchema";
import JournalClient from "./_journal-client";
import { getSupabaseServer } from "@/lib/supabase/server";
import type { JournalVideo } from "@/app/api/journal/videos/route";

// Revalidate the SSR cache every 10 minutes — sync runs hourly, so this
// keeps the page within ~10 min of the channel without pounding the DB.
export const revalidate = 600;

const T = {
  uk: {
    tag: "Щоденник таролога",
    title: "Щоденник таролога",
    sub: "Розклади, думки про карти, розбори — нові випуски щотижня. Дивись прямо тут, без переходів.",
  },
  ru: {
    tag: "Дневник таролога",
    title: "Дневник таролога",
    sub: "Расклады, мысли о картах, разборы — новые выпуски еженедельно. Смотри прямо здесь, без переходов.",
  },
  en: {
    tag: "Tarot Diary",
    title: "Tarot Diary",
    sub: "Readings, thoughts on the cards, deep dives — fresh pieces every week. Watch right here, no detours.",
  },
};

async function loadVideos(): Promise<JournalVideo[]> {
  const supa = await getSupabaseServer();
  if (!supa) return [];
  const { data, error } = await supa
    .from("youtube_videos")
    .select("id,title,description,thumb_url,duration_seconds,published_at,view_count,tags,tool_pick")
    .eq("hidden", false)
    .order("published_at", { ascending: false })
    .limit(60);
  if (error) return [];
  return (data ?? []) as JournalVideo[];
}

export default async function BlogPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: rawLang } = await params;
  const lang: "uk" | "ru" | "en" = rawLang === "ru" ? "ru" : rawLang === "en" ? "en" : "uk";
  const t = T[lang];
  const videos = await loadVideos();

  return (
    <>
      <VideoSchema videos={videos} lang={lang} />

      {/* ── Hero ── */}
      <section className="pt-36 pb-12 bg-[#FDFBF7] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(196,169,122,0.12),transparent)]" />
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <AnimatedSection>
            <span className="tag mb-6 inline-block">{t.tag}</span>
            <h1
              className="text-[clamp(2.5rem,5vw,4.5rem)] text-[#1C1512] mb-4 leading-[1.06]"
              style={{ fontFamily: "var(--font-cormorant)", fontWeight: 400 }}
            >
              {t.title}
            </h1>
            <p className="text-xl text-[#7A6A58] leading-relaxed max-w-xl mx-auto">{t.sub}</p>
          </AnimatedSection>
        </div>
      </section>

      <GoldDivider />

      <JournalClient videos={videos} lang={lang} />
    </>
  );
}
