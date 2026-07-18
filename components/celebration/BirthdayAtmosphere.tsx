"use client";

/**
 * Birthday Mode — the living site layer. Renders (only while active) a
 * pointer-events-free canvas of ambient magic + a warm edge-glow that frames
 * every page, and injects a few subtle CSS micro-interactions. Sits under the
 * header so navigation stays fully usable. Never on /admin; off under
 * prefers-reduced-motion. Force with ?celebrate=1 / ?birthday=1 for previews.
 */

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useBirthdayMode } from "./useBirthdayMode";
import { startAtmosphere, type AtmosphereHandle } from "./atmosphere";

export default function BirthdayAtmosphere() {
  const pathname = usePathname();
  const { atmosphere } = useBirthdayMode();
  const [forced, setForced] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const handleRef = useRef<AtmosphereHandle | null>(null);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (p.has("celebrate") || p.has("birthday") || p.has("atmosphere")) setForced(true);
  }, []);

  const onAdmin = pathname?.startsWith("/admin") ?? false;
  const active = (atmosphere || forced) && !onAdmin;

  useEffect(() => {
    if (!active || !canvasRef.current) return;
    const reducedMotion =
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

    document.documentElement.classList.add("birthday-mode");
    let handle: AtmosphereHandle | null = null;
    try {
      handle = startAtmosphere(canvasRef.current, { reducedMotion });
    } catch {
      handle = null;
    }
    handleRef.current = handle;

    return () => {
      handle?.destroy();
      handleRef.current = null;
      document.documentElement.classList.remove("birthday-mode");
    };
  }, [active]);

  if (!active) return null;

  return (
    <>
      {/* Subtle micro-interactions layered on existing UI. */}
      <style>{`
        @keyframes birthdayBreath {
          0%, 100% { text-shadow: 0 0 0 rgba(212,168,83,0); }
          50% { text-shadow: 0 0 18px rgba(212,168,83,0.55), 0 0 4px rgba(255,244,214,0.4); }
        }
        .birthday-mode [data-birthday-glow] {
          animation: birthdayBreath 6.5s ease-in-out infinite;
        }
        @keyframes birthdaySheen {
          0% { background-position: -150% 0; }
          100% { background-position: 250% 0; }
        }
        .birthday-mode [data-birthday-sheen] {
          background-image: linear-gradient(100deg, transparent 40%, rgba(255,244,214,0.5) 50%, transparent 60%);
          background-size: 200% 100%;
          background-repeat: no-repeat;
          animation: birthdaySheen 9s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .birthday-mode [data-birthday-glow],
          .birthday-mode [data-birthday-sheen] { animation: none; }
        }
      `}</style>

      {/* Warm candlelight frame — instant "something is special" ambience.
          No mix-blend-mode: a fixed full-viewport blended layer re-composites
          on every scroll frame and tanks scroll performance. */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 40,
          pointerEvents: "none",
          background:
            "radial-gradient(120% 80% at 50% 0%, rgba(184,136,58,0.13) 0%, rgba(184,136,58,0) 40%), radial-gradient(120% 80% at 50% 100%, rgba(184,136,58,0.13) 0%, rgba(184,136,58,0) 40%)",
        }}
      />

      {/* Living particle canvas. */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 41,
          pointerEvents: "none",
          display: "block",
        }}
      />
    </>
  );
}
