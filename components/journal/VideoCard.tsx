"use client";

/**
 * Journal video card.
 *
 * Compact card for the grid below the featured hero. The thumbnail is a
 * button — clicking it bubbles up an onOpen callback so the parent can
 * mount a fullscreen lightbox (see VideoLightbox). The card itself stays
 * lightweight: zero YouTube iframes until the user actually plays.
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

export default function VideoCard({
  video, lang, onOpen,
}: {
  video: JournalVideo;
  lang: "uk" | "ru" | "en";
  onOpen: (v: JournalVideo) => void;
}) {
  const toolId = video.tool_pick as ToolId | null;
  const toolLabel = toolId ? TOOL_LABELS[toolId]?.[lang] : null;
  // Anchor id lets video-sitemap deep-links (#<id>) land on this exact card.
  return (
    <article
      id={video.id}
      className="group rounded-2xl overflow-hidden bg-white/60 border border-[rgba(196,169,122,0.18)] hover:border-[rgba(196,169,122,0.4)] hover:shadow-lg transition-all duration-300"
    >
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
          sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="w-14 h-14 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110">
            <Play size={22} className="text-[#9A6E28] translate-x-0.5" fill="#9A6E28" />
          </span>
        </span>
        {fmtDuration(video.duration_seconds) && (
          <span className="absolute bottom-2 right-2 text-[11px] text-white/95 tabular-nums bg-black/60 px-1.5 py-0.5 rounded">
            {fmtDuration(video.duration_seconds)}
          </span>
        )}
      </button>

      <div className="p-5">
        {/* tag chips */}
        {video.tags.length > 0 && (
          <div className="flex items-center flex-wrap gap-1.5 mb-2 text-[10px] tracking-widest uppercase">
            {video.tags.slice(0, 2).map((t) => {
              const meta = THEME_LABELS[t as ThemeTag];
              if (!meta) return null;
              return (
                <span key={t} className="text-[#C4A97A]">
                  {meta.glyph} {meta[lang]}
                </span>
              );
            })}
          </div>
        )}

        <h3
          className="text-xl text-[#1C1512] mb-2 leading-snug group-hover:text-[#B8883A] transition-colors line-clamp-2"
          style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}
        >
          {video.title}
        </h3>

        <p className="text-xs text-[#9A8A78] mb-3">{fmtDate(video.published_at, lang)}</p>

        {toolId && toolLabel && (
          <Link
            href={`/${lang}/studio/${toolId}`}
            className="inline-flex items-center gap-1.5 text-[12px] text-[#9A6E28] hover:text-[#B8883A] transition-colors mt-1"
          >
            <span style={{ fontFamily: "var(--font-cormorant)", fontStyle: "italic" }}>
              {lang === "ru" ? "Попробовать инструмент" : lang === "en" ? "Try the tool" : "Спробувати інструмент"}: {toolLabel}
            </span>
            <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        )}
      </div>
    </article>
  );
}
