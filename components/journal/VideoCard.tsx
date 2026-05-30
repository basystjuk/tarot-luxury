"use client";

/**
 * Journal video card.
 *
 * Compact card for the grid below the featured hero. Uses LiteYouTube in
 * "hover" mode — desktop visitors see a Netflix-style muted preview on
 * hover; mobile gets a regular play-to-launch flow.
 *
 * If the owner has set a tool_pick for this video, we render a small CTA
 * chip below the title pointing at that tool — a low-friction conversion
 * from passive watching to active tool use.
 */

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import LiteYouTube from "./LiteYouTube";
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
  return new Date(iso).toLocaleDateString(locale, { day: "numeric", month: "long" });
}

export default function VideoCard({ video, lang }: { video: JournalVideo; lang: "uk" | "ru" | "en" }) {
  const toolId = video.tool_pick as ToolId | null;
  const toolLabel = toolId ? TOOL_LABELS[toolId]?.[lang] : null;

  return (
    <article className="group rounded-2xl overflow-hidden bg-white/60 border border-[rgba(196,169,122,0.18)] hover:border-[rgba(196,169,122,0.4)] hover:shadow-lg transition-all duration-300">
      <LiteYouTube videoId={video.id} title={video.title} thumbUrl={video.thumb_url} mode="hover" />
      <div className="p-5">
        {/* tag chips + duration */}
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
          {fmtDuration(video.duration_seconds) && (
            <span className="ml-auto text-[#9A8A78] tabular-nums normal-case tracking-normal">
              {fmtDuration(video.duration_seconds)}
            </span>
          )}
        </div>

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
            onClick={(e) => e.stopPropagation()}
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
