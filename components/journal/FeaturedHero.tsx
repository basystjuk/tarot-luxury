"use client";

/**
 * Featured hero card — the latest video, big.
 *
 * Magazine-style: wide 16:9 thumb at the top with a stacked title + tag
 * chips + tool CTA below. The thumb is a button that summons the
 * fullscreen VideoLightbox via the onOpen callback from the journal
 * client — same play path as the smaller cards.
 */

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";
import type { JournalVideo } from "@/app/api/journal/videos/route";
import { TOOL_LABELS, type ToolId } from "@/lib/tools-config";
import { THEME_LABELS, type ThemeTag } from "@/lib/youtube/tags";

function fmtDuration(s: number | null | undefined): string {
  if (!s || s <= 0) return "";
  const m = Math.floor(s / 60), sec = s % 60;
  return `${m}:${String(sec).padStart(2, "0")}`;
}
function fmtDate(iso: string, lang: "uk" | "ru" | "en"): string {
  const locale = lang === "ru" ? "ru-RU" : lang === "en" ? "en-GB" : "uk-UA";
  return new Date(iso).toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" });
}

export default function FeaturedHero({
  video, lang, onOpen,
}: {
  video: JournalVideo;
  lang: "uk" | "ru" | "en";
  onOpen: (v: JournalVideo) => void;
}) {
  const toolId = video.tool_pick as ToolId | null;
  const toolLabel = toolId ? TOOL_LABELS[toolId]?.[lang] : null;
  return (
    <article id={video.id} className="group rounded-3xl overflow-hidden bg-white/60 border border-[rgba(196,169,122,0.25)] shadow-sm">
      <button
        type="button"
        aria-label={`Play: ${video.title}`}
        onClick={() => onOpen(video)}
        className="relative block w-full aspect-video bg-black overflow-hidden"
      >
        <Image
          src={video.thumb_url}
          alt={video.title}
          fill
          sizes="(min-width:1024px) 100vw, 100vw"
          priority
          className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="w-20 h-20 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-xl transition-transform duration-300 group-hover:scale-110">
            <Play size={30} className="text-[#9A6E28] translate-x-0.5" fill="#9A6E28" />
          </span>
        </span>
        {fmtDuration(video.duration_seconds) && (
          <span className="absolute bottom-3 right-3 text-xs text-white/95 tabular-nums bg-black/60 px-2 py-1 rounded">
            {fmtDuration(video.duration_seconds)}
          </span>
        )}
      </button>
      <div className="p-6 lg:p-8">
        <div className="flex items-center flex-wrap gap-2 mb-3">
          <span className="text-[10px] tracking-[0.18em] uppercase text-[#B8883A]">
            {lang === "ru" ? "Свежий выпуск" : lang === "en" ? "Latest piece" : "Свіжий випуск"}
          </span>
          <span className="text-[10px] text-[#9A8A78]">·</span>
          <span className="text-[10px] text-[#9A8A78]">{fmtDate(video.published_at, lang)}</span>
          {video.tags.slice(0, 3).map((t) => {
            const meta = THEME_LABELS[t as ThemeTag];
            if (!meta) return null;
            return (
              <span key={t} className="ml-1 px-2 py-0.5 rounded-full text-[10px] bg-[rgba(196,169,122,0.12)] text-[#9A6E28] border border-[rgba(196,169,122,0.25)]">
                {meta.glyph} {meta[lang]}
              </span>
            );
          })}
        </div>
        <h2
          className="text-2xl lg:text-4xl text-[#1C1512] leading-tight mb-3"
          style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}
        >
          {video.title}
        </h2>
        {video.description && (
          <p className="text-[#5C4530] leading-relaxed line-clamp-3 lg:line-clamp-2 max-w-3xl">
            {video.description}
          </p>
        )}
        {toolId && toolLabel && (
          <Link
            href={`/${lang}/studio/${toolId}`}
            className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 rounded-full bg-gradient-to-br from-[#D4A853] to-[#9A6E28] text-white text-sm hover:opacity-90 transition-opacity"
          >
            {lang === "ru" ? "Открыть инструмент" : lang === "en" ? "Open the tool" : "Відкрити інструмент"}: {toolLabel}
            <ArrowRight size={14} />
          </Link>
        )}
      </div>
    </article>
  );
}
