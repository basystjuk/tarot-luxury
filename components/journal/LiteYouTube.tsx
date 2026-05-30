"use client";

/**
 * Lite YouTube embed.
 *
 * Until the user clicks Play we render ONLY a thumbnail + play button —
 * zero iframe, zero YouTube JS, zero cookies. On click we mount the real
 * iframe with autoplay so the click feels instant.
 *
 * Why: a stock <iframe src=youtube.com/embed/...> ships ~1.2 MB of script
 * per video. lite-youtube renders the same thumbnail for ~3 KB until a
 * viewer actually wants to watch. This makes the journal page fast even
 * with 30 videos visible.
 *
 * Privacy: uses youtube-nocookie.com so YouTube can't set tracking
 * cookies until the user explicitly clicks Play. GDPR-friendly.
 *
 * Modes:
 *   - "card"  (default): thumbnail with play overlay, click loads iframe.
 *   - "hover": same, but mouse hover briefly auto-plays a muted preview
 *              (Netflix-style). Click still loads full iframe with sound.
 */

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Play } from "lucide-react";

export interface LiteYouTubeProps {
  videoId: string;
  title: string;
  thumbUrl?: string;
  mode?: "card" | "hover";
  className?: string;
  /** Aspect ratio: "16/9" (default) or "1/1" for square thumbs. */
  aspect?: "16/9" | "1/1";
}

export default function LiteYouTube({
  videoId, title, thumbUrl, mode = "card", className = "", aspect = "16/9",
}: LiteYouTubeProps) {
  const [active, setActive] = useState(false);   // user clicked Play → real iframe mounted
  const [hovering, setHovering] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Generated thumbnail URL fallback if not provided.
  const src = thumbUrl || `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;

  // Hover preview: a muted, sound-off iframe loaded only while hovering.
  // We do NOT keep it mounted after hover ends — saves memory and respects
  // the "lite" intent.
  const showHoverIframe = mode === "hover" && hovering && !active;

  // Player URL: nocookie domain, modest branding, no related videos.
  const playerSrc = (autoplay: boolean, mute: boolean) =>
    `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=${autoplay ? 1 : 0}&mute=${mute ? 1 : 0}&rel=0&modestbranding=1&playsinline=1`;

  // Pause hover-iframe video when leaving (postMessage to YT iframe API).
  useEffect(() => {
    if (!hovering && iframeRef.current && !active) {
      try {
        iframeRef.current.contentWindow?.postMessage(
          JSON.stringify({ event: "command", func: "pauseVideo", args: [] }), "*",
        );
      } catch { /* ignore */ }
    }
  }, [hovering, active]);

  return (
    <div
      className={`relative overflow-hidden bg-[#1C1512] ${className}`}
      style={{ aspectRatio: aspect.replace("/", " / ") }}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onClick={() => setActive(true)}
    >
      {!active && (
        <>
          <Image
            src={src}
            alt={title}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
          {/* Play overlay */}
          <button
            type="button" aria-label={`Play: ${title}`}
            onClick={(e) => { e.stopPropagation(); setActive(true); }}
            className="absolute inset-0 flex items-center justify-center group/play"
          >
            <span className="w-16 h-16 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg transition-transform duration-300 group-hover/play:scale-110">
              <Play size={26} className="text-[#9A6E28] translate-x-0.5" fill="#9A6E28" />
            </span>
          </button>
        </>
      )}

      {/* Hover preview (muted) — Netflix-style */}
      {showHoverIframe && (
        <iframe
          ref={iframeRef}
          src={playerSrc(true, true)}
          allow="autoplay; picture-in-picture"
          title={`Preview: ${title}`}
          className="absolute inset-0 w-full h-full pointer-events-none"
        />
      )}

      {/* Active iframe — only after explicit click */}
      {active && (
        <iframe
          src={playerSrc(true, false)}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          title={title}
          className="absolute inset-0 w-full h-full"
        />
      )}
    </div>
  );
}
