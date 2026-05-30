"use client";

/**
 * Journal client side — featured hero, tag filter, "load more" grid.
 *
 * Lives under a Server Component wrapper that injects the Schema.org JSON-LD
 * for SEO. Receives the full video list as a prop (server-fetched) so the
 * first paint is non-empty and crawlers see the content immediately.
 */

import { useMemo, useState } from "react";
import AnimatedSection from "@/components/ui/AnimatedSection";
import GoldDivider from "@/components/ui/GoldDivider";
import FeaturedHero from "@/components/journal/FeaturedHero";
import VideoCard from "@/components/journal/VideoCard";
import TagFilter from "@/components/journal/TagFilter";
import type { JournalVideo } from "@/app/api/journal/videos/route";
import type { ThemeTag } from "@/lib/youtube/tags";

const PAGE_SIZE = 12;

export default function JournalClient({
  videos, lang,
}: { videos: JournalVideo[]; lang: "uk" | "ru" | "en" }) {
  const [active, setActive] = useState<ThemeTag | null>(null);
  const [shown, setShown] = useState(PAGE_SIZE);

  // Tag inventory from current data (frequency-sorted).
  const tagOrder = useMemo<ThemeTag[]>(() => {
    const counts = new Map<ThemeTag, number>();
    for (const v of videos) for (const t of v.tags as ThemeTag[]) counts.set(t, (counts.get(t) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([t]) => t);
  }, [videos]);

  const filtered = useMemo(() => {
    if (!active) return videos;
    return videos.filter((v) => v.tags.includes(active));
  }, [videos, active]);

  if (videos.length === 0) {
    return (
      <section className="section-padding bg-[#FDFBF7]">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p className="text-[#7A6A58] italic">
            {lang === "ru"
              ? "Свежих видео ещё нет. Загляни позже ✨"
              : lang === "en"
              ? "No videos yet. Check back soon ✨"
              : "Свіжих відео ще немає. Загляни пізніше ✨"}
          </p>
        </div>
      </section>
    );
  }

  // Featured = newest video that matches the filter (so a tag filter still
  // gets a hero). When unfiltered, that's just the first video.
  const [featured, ...rest] = filtered;
  const visibleRest = rest.slice(0, shown);
  const hasMore = rest.length > shown;

  return (
    <section className="section-padding bg-[#FDFBF7]">
      <div className="max-w-3xl lg:max-w-5xl mx-auto px-6 space-y-10">
        {/* Tag filter strip */}
        {tagOrder.length > 0 && (
          <AnimatedSection>
            <TagFilter
              available={tagOrder}
              active={active}
              onChange={(t) => { setActive(t); setShown(PAGE_SIZE); }}
              lang={lang}
            />
          </AnimatedSection>
        )}

        {/* Featured hero */}
        {featured && (
          <AnimatedSection delay={0.05}>
            <FeaturedHero video={featured} lang={lang} />
          </AnimatedSection>
        )}

        {visibleRest.length > 0 && (
          <>
            <GoldDivider />
            <div>
              <h3
                className="text-2xl text-[#1C1512] mb-6 text-center"
                style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}
              >
                {lang === "ru" ? "Архив выпусков" : lang === "en" ? "Previous pieces" : "Архів випусків"}
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {visibleRest.map((v, i) => (
                  <AnimatedSection key={v.id} delay={i * 0.04}>
                    <VideoCard video={v} lang={lang} />
                  </AnimatedSection>
                ))}
              </div>
              {hasMore && (
                <div className="text-center mt-10">
                  <button
                    type="button"
                    onClick={() => setShown((s) => s + PAGE_SIZE)}
                    className="px-7 py-3 rounded-full border border-[rgba(196,169,122,0.4)] text-[#9A6E28] text-sm tracking-wide hover:bg-[rgba(196,169,122,0.08)] transition-colors"
                  >
                    {lang === "ru" ? "Показать ещё" : lang === "en" ? "Show more" : "Показати ще"}
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
