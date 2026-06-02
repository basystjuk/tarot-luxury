"use client";

/**
 * Fullscreen video lightbox.
 *
 * Mounted at the journal page root so any card can summon it via context.
 * Renders a portal overlay covering the viewport with the YouTube iframe
 * sized for max readability (responsive 16:9, capped at 90vw × 80vh).
 *
 * Implementation choices:
 *   - Portal target = document.body (escapes the section's overflow-clip
 *     and any transform parents).
 *   - Backdrop click + Esc both close the modal.
 *   - Body scroll locked while open.
 *   - youtube-nocookie embed with autoplay so opening = playing.
 */

import { createPortal } from "react-dom";
import { useEffect } from "react";
import { X } from "lucide-react";

export default function VideoLightbox({
  videoId, title, onClose,
}: {
  videoId: string;
  title: string;
  onClose: () => void;
}) {
  // Esc closes; body scroll lock.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  if (typeof document === "undefined") return null;

  const src = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;

  return createPortal(
    <div
      role="dialog" aria-modal="true" aria-label={title}
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-8 bg-black/85 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <button
        type="button" aria-label="Close"
        onClick={onClose}
        className="absolute top-4 right-4 sm:top-6 sm:right-6 w-11 h-11 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-colors"
      >
        <X size={22} />
      </button>

      <div
        className="relative w-full max-w-[1280px] aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl"
        style={{ maxHeight: "82vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        <iframe
          src={src}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        />
      </div>

      {title && (
        <p
          className="absolute bottom-6 left-1/2 -translate-x-1/2 max-w-[80vw] text-center text-white/85 text-sm sm:text-base px-4"
          style={{ fontFamily: "var(--font-cormorant)" }}
          onClick={(e) => e.stopPropagation()}
        >
          {title}
        </p>
      )}
    </div>,
    document.body,
  );
}
