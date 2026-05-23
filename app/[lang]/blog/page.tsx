"use client";

import { useState, useEffect, useCallback } from "react";
import AnimatedSection from "@/components/ui/AnimatedSection";
import GoldDivider from "@/components/ui/GoldDivider";
import { useLanguage } from "@/hooks/useLanguage";
import type { VideoEntry } from "@/app/api/telegram/route";

// ── Helpers ───────────────────────────────────────────────────────────────

function formatDuration(seconds: number): string {
  if (!seconds) return "";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function formatDate(unixTs: number, lang: string): string {
  return new Date(unixTs * 1000).toLocaleDateString(
    lang === "ru" ? "ru-RU" : lang === "en" ? "en-GB" : "uk-UA",
    { day: "numeric", month: "long", year: "numeric" }
  );
}

// ── Video Modal ───────────────────────────────────────────────────────────

function VideoModal({
  entry,
  onClose,
  lang,
}: {
  entry: VideoEntry;
  onClose: () => void;
  lang: string;
}) {
  const videoSrc = `/api/telegram-video-url?file_id=${encodeURIComponent(entry.file_id)}`;

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl bg-[#1C1512] rounded-2xl overflow-hidden shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/80 transition-colors"
          aria-label="Закрити"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>

        {/* Video player */}
        {entry.type === "video" ? (
          <video
            src={videoSrc}
            controls
            autoPlay
            playsInline
            className="w-full max-h-[70vh] bg-black"
            poster={entry.thumb_url || undefined}
          />
        ) : (
          /* Photo */
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/api/telegram-video-url?file_id=${encodeURIComponent(entry.file_id)}`}
            alt={entry.caption}
            className="w-full max-h-[70vh] object-contain"
          />
        )}

        {/* Caption */}
        {entry.caption && (
          <div className="p-5">
            <p className="text-sm text-[#E8DCC5] leading-relaxed whitespace-pre-line">{entry.caption}</p>
            <p className="mt-2 text-xs text-[#9B7A52]">{formatDate(entry.date, lang)}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Video Card ────────────────────────────────────────────────────────────

function VideoCard({
  entry,
  onClick,
  lang,
}: {
  entry: VideoEntry;
  onClick: () => void;
  lang: string;
}) {
  const isVideo = entry.type === "video";

  return (
    <button
      onClick={onClick}
      className="group text-left w-full card-luxury p-0 overflow-hidden cursor-pointer"
      aria-label={entry.caption || (isVideo ? "Відео" : "Фото")}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-[#2D2218] overflow-hidden">
        {entry.thumb_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={entry.thumb_url}
            alt=""
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-4xl opacity-30" style={{ fontFamily: "var(--font-cormorant)" }}>✦</span>
          </div>
        )}

        {/* Play / photo overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {isVideo ? (
            <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M6 4l12 6-12 6V4z" fill="#1C1512"/>
              </svg>
            </div>
          ) : (
            <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <rect x="2" y="2" width="16" height="16" rx="2" stroke="#1C1512" strokeWidth="2"/>
                <circle cx="10" cy="10" r="3" fill="#1C1512"/>
              </svg>
            </div>
          )}
        </div>

        {/* Duration badge */}
        {isVideo && entry.duration > 0 && (
          <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/70 text-white text-xs font-mono">
            {formatDuration(entry.duration)}
          </span>
        )}
      </div>

      {/* Caption */}
      <div className="p-4">
        {entry.caption ? (
          <p className="text-sm text-[#5C4530] line-clamp-3 leading-relaxed">{entry.caption}</p>
        ) : (
          <p className="text-sm text-[#9B7A52] italic">
            {isVideo ? "Відео з каналу" : "Фото з каналу"}
          </p>
        )}
        <p className="mt-2 text-xs text-[#9B7A52]">{formatDate(entry.date, lang)}</p>
      </div>
    </button>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────

const DEFAULT_BLOG = {
  title_ru: "Telegram-канал",
  desc_ru: "Там я регулярно публикую расклады, пишу о картах и делюсь мыслями.",
  btn_ru: "Перейти в канал",
  title_uk: "Telegram-канал",
  desc_uk: "Там я регулярно публікую розклади, пишу про карти та ділюся думками.",
  btn_uk: "Перейти в канал",
  link: "https://t.me/ellen_soul_taro",
};

export default function BlogPage() {
  const { language } = useLanguage();
  const isRu = language === "ru";
  const isEn = language === "en";

  const [blog, setBlog] = useState(DEFAULT_BLOG);
  const [videos, setVideos] = useState<VideoEntry[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(true);
  const [activeVideo, setActiveVideo] = useState<VideoEntry | null>(null);

  useEffect(() => {
    fetch("/api/content")
      .then(r => r.json())
      .then(d => { if (d.blog) setBlog(d.blog); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/api/telegram-videos")
      .then(r => r.json())
      .then((data: VideoEntry[]) => { setVideos(data); setLoadingVideos(false); })
      .catch(() => setLoadingVideos(false));
  }, []);

  const handleClose = useCallback(() => setActiveVideo(null), []);

  const title = isRu ? blog.title_ru : blog.title_uk;
  const desc  = isRu ? blog.desc_ru  : blog.desc_uk;
  const btn   = isRu ? blog.btn_ru   : blog.btn_uk;

  const hasVideos = videos.length > 0;

  return (
    <>
      {/* Modal */}
      {activeVideo && (
        <VideoModal entry={activeVideo} onClose={handleClose} lang={language} />
      )}

      {/* ── Hero ── */}
      <section className="pt-36 pb-16 bg-[#FDFBF7] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(196,169,122,0.1),transparent)]" />
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <AnimatedSection>
            <span className="tag mb-6 inline-block">
              {isRu ? "Дневник таролога" : isEn ? "Tarot Journal" : "Щоденник таролога"}
            </span>
            <h1
              className="text-[clamp(2.5rem,5vw,5rem)] text-[#1C1512] mb-6 leading-[1.06]"
              style={{ fontFamily: "var(--font-cormorant)", fontWeight: 400 }}
            >
              {isRu
                ? "Видео из канала"
                : isEn
                ? "Videos from the Channel"
                : "Відео з каналу"}
            </h1>
            <p className="text-xl text-[#7A6A58] leading-relaxed max-w-xl mx-auto">
              {isRu
                ? "Расклады, мысли о картах, разборы — всё из моего Telegram-канала."
                : isEn
                ? "Readings, thoughts on cards, analyses — all from my Telegram channel."
                : "Розклади, думки про карти, розбори — усе з мого Telegram-каналу."}
            </p>
          </AnimatedSection>
        </div>
      </section>

      <GoldDivider />

      {/* ── Video grid ── */}
      <section className="section-padding bg-[#FDFBF7]">
        <div className="max-w-6xl mx-auto px-6">

          {loadingVideos && (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 rounded-full border-2 border-[#D4A853] border-t-transparent animate-spin" />
            </div>
          )}

          {!loadingVideos && !hasVideos && (
            <AnimatedSection>
              <div className="max-w-2xl mx-auto text-center">
                <div className="card-luxury py-16">
                  <div className="text-6xl text-[#D4A853] mb-6 select-none" style={{ fontFamily: "var(--font-cormorant)" }}>✦</div>
                  <h2 className="text-3xl text-[#1C1512] mb-4" style={{ fontFamily: "var(--font-cormorant)", fontWeight: 400 }}>
                    {title}
                  </h2>
                  <p className="text-[#7A6A58] mb-8 leading-relaxed">{desc}</p>
                  <a href={blog.link} target="_blank" rel="noopener noreferrer" className="btn-primary inline-flex">
                    {btn}
                  </a>
                </div>
              </div>
            </AnimatedSection>
          )}

          {!loadingVideos && hasVideos && (
            <AnimatedSection>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {videos.map(entry => (
                  <VideoCard
                    key={entry.id}
                    entry={entry}
                    onClick={() => setActiveVideo(entry)}
                    lang={language}
                  />
                ))}
              </div>

              {/* Link to full channel */}
              <div className="mt-12 text-center">
                <a href={blog.link} target="_blank" rel="noopener noreferrer" className="btn-outline inline-flex">
                  {isRu ? "Все видео в Telegram" : isEn ? "All videos on Telegram" : "Усі відео в Telegram"}
                </a>
              </div>
            </AnimatedSection>
          )}
        </div>
      </section>
    </>
  );
}
