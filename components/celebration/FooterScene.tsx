"use client";

/**
 * Mounts the footer birthday scene behind the footer content. Only while
 * Birthday Mode's atmosphere is active. Pauses when the footer is off-screen
 * (IntersectionObserver) so it costs nothing while the visitor is up the page.
 * Force with ?celebrate=1 / ?birthday=1 for previews.
 */

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useBirthdayMode } from "./useBirthdayMode";
import { startFooterScene, type FooterSceneHandle } from "./footer-scene";

export default function FooterScene() {
  const pathname = usePathname();
  const { atmosphere } = useBirthdayMode();
  const [forced, setForced] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const handleRef = useRef<FooterSceneHandle | null>(null);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (p.has("celebrate") || p.has("birthday") || p.has("atmosphere")) setForced(true);
  }, []);

  const onAdmin = pathname?.startsWith("/admin") ?? false;
  const active = (atmosphere || forced) && !onAdmin;

  useEffect(() => {
    if (!active || !canvasRef.current || !wrapRef.current) return;
    const reducedMotion =
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

    let handle: FooterSceneHandle | null = null;
    try {
      handle = startFooterScene(canvasRef.current, { reducedMotion });
    } catch {
      handle = null;
    }
    handleRef.current = handle;

    // Pause when the footer is out of view.
    const io = new IntersectionObserver(
      ([entry]) => handle?.setPaused(!entry.isIntersecting),
      { rootMargin: "120px" },
    );
    io.observe(wrapRef.current);

    return () => {
      io.disconnect();
      handle?.destroy();
      handleRef.current = null;
    };
  }, [active]);

  if (!active) return null;

  return (
    <div
      ref={wrapRef}
      aria-hidden="true"
      style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}
    >
      <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block" }} />
    </div>
  );
}
