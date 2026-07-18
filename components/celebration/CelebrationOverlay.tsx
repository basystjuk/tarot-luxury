"use client";

/**
 * CelebrationOverlay — mounts a full-screen cinematic overlay once per visitor
 * during a scheduled window (see `lib/celebration.ts`). Rendered globally from
 * the root layout, so it can appear on any page/locale.
 *
 * Playback decision (client-only):
 *   • `?celebrate=1` (or `?celebrate=<theme>`) forces a preview, ignoring the
 *     date window and the "already seen" flag — used by the admin preview button.
 *   • otherwise: config must be enabled, today must fall in [start, end], and
 *     the visitor must not have seen this event yet (localStorage).
 *
 * Never plays on /admin. Respects prefers-reduced-motion (a calm static variant).
 */

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
  DEFAULT_CELEBRATION,
  normalizeCelebration,
  isCelebrationActive,
  celebrationSeenKey,
  todayLocalISO,
  type CelebrationConfig,
} from "@/lib/celebration";
import { runCelebration, type RunHandle } from "./animation";

export default function CelebrationOverlay() {
  const pathname = usePathname();
  const [play, setPlay] = useState<{ config: CelebrationConfig; forced: boolean } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const handleRef = useRef<RunHandle | null>(null);

  // ── Decide whether to play ──────────────────────────────────────────────
  useEffect(() => {
    if (pathname?.startsWith("/admin")) return;

    let cancelled = false;
    const params = new URLSearchParams(window.location.search);
    const forced = params.has("celebrate");

    (async () => {
      let config = DEFAULT_CELEBRATION;
      try {
        const res = await fetch("/api/celebration", { cache: "no-store" });
        const j = await res.json();
        config = normalizeCelebration(j?.celebration);
      } catch {
        /* fall back to code default */
      }
      if (cancelled) return;

      if (forced) {
        setPlay({ config, forced: true });
        return;
      }
      if (!isCelebrationActive(config, todayLocalISO())) return;
      if (!config.intro) return; // owner disabled the cinematic intro

      try {
        if (localStorage.getItem(celebrationSeenKey(config))) return;
      } catch {
        /* private-mode / storage blocked → just play once */
      }
      setPlay({ config, forced: false });
    })();

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  // ── Run the canvas animation once mounted ───────────────────────────────
  useEffect(() => {
    if (!play || !canvasRef.current || !containerRef.current) return;

    // Mark as seen up-front (real runs only) so a mid-animation reload or a
    // crash still counts as shown — never trap a visitor in a replay loop.
    if (!play.forced) {
      try {
        localStorage.setItem(celebrationSeenKey(play.config), todayLocalISO());
      } catch {
        /* ignore */
      }
    }

    const params = new URLSearchParams(window.location.search);
    const reducedMotion =
      params.has("celebrateReduced") ||
      (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false);

    // Debug: `?celebrateAt=<ms>` freezes a single frame for visual tuning.
    const atRaw = params.get("celebrateAt");
    const freezeMs = atRaw != null && atRaw !== "" ? Number(atRaw) : null;

    const finish = () => {
      handleRef.current = null;
      setPlay(null);
    };

    const frozen = freezeMs != null && Number.isFinite(freezeMs);
    let handle: RunHandle;
    try {
      handle = runCelebration(
        canvasRef.current,
        containerRef.current,
        play.config.theme,
        { reducedMotion, onDone: finish, freezeMs: frozen ? freezeMs : null },
      );
    } catch {
      // A decorative overlay must never take the page down with it.
      finish();
      return;
    }
    handleRef.current = handle;

    // Safety net: a full-screen overlay with pointer-events:auto must never get
    // stuck blocking the page. requestAnimationFrame pauses in a hidden tab, so
    // if the visitor switches away mid-animation the loop stalls — this wall-
    // clock fallback tears the overlay down regardless. Skipped in freeze mode.
    const maxLife = frozen ? 0 : window.setTimeout(finish, 13000);

    return () => {
      if (maxLife) clearTimeout(maxLife);
      handle.destroy();
      handleRef.current = null;
    };
  }, [play]);

  if (!play) return null;

  return (
    <div
      ref={containerRef}
      onClick={() => handleRef.current?.skip()}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2147483000, // above header (z-60) and any modal
        opacity: 0,
        pointerEvents: "auto",
        cursor: "pointer",
        // Dark, warm veil with a whisper of cosmic violet; blurs the page beneath.
        background:
          "radial-gradient(ellipse at center, rgba(22,16,28,0.55) 0%, rgba(12,9,16,0.84) 55%, rgba(6,5,10,0.95) 100%)",
        backdropFilter: "blur(9px)",
        WebkitBackdropFilter: "blur(9px)",
        willChange: "opacity",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{ position: "absolute", inset: 0, display: "block" }}
      />
    </div>
  );
}
