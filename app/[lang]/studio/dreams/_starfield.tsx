"use client";

/**
 * Dream hero backdrop — animated night sky.
 *
 * Pure CSS/SVG, no canvas or libs, so it's GPU-cheap and never blocks the
 * main thread: layered twinkling stars, a glowing moon, and slow-drifting
 * fog. Respects prefers-reduced-motion (animations collapse to static).
 *
 * Deterministic star positions (seeded) so SSR and client markup match —
 * no hydration mismatch.
 */

import { useMemo } from "react";

function seeded(n: number) {
  // tiny LCG for stable pseudo-random star placement
  let s = n >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export default function Starfield() {
  const stars = useMemo(() => {
    const rnd = seeded(42);
    return Array.from({ length: 70 }, () => ({
      x: rnd() * 100,
      y: rnd() * 100,
      r: 0.5 + rnd() * 1.6,
      delay: rnd() * 6,
      dur: 2.5 + rnd() * 4,
      o: 0.3 + rnd() * 0.7,
    }));
  }, []);

  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* deep night gradient */}
      <div className="absolute inset-0" style={{
        background:
          "radial-gradient(ellipse 80% 60% at 50% -10%, #2A2456 0%, #171331 45%, #0C0A20 100%)",
      }} />
      {/* nebula glows */}
      <div className="absolute inset-0" style={{
        background:
          "radial-gradient(circle 40% 30% at 78% 18%, rgba(212,168,83,0.10), transparent), radial-gradient(circle 35% 30% at 20% 70%, rgba(120,90,200,0.12), transparent)",
      }} />

      {/* twinkling stars */}
      <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
        {stars.map((st, i) => (
          <circle key={i} cx={st.x} cy={st.y} r={st.r / 8} fill="#FBF6E8"
            style={{
              opacity: st.o,
              animation: `dreamTwinkle ${st.dur}s ease-in-out ${st.delay}s infinite`,
            }} />
        ))}
      </svg>

      {/* glowing moon */}
      <div className="absolute top-[8%] right-[10%] w-28 h-28 rounded-full"
        style={{
          background: "radial-gradient(circle at 35% 35%, #FBF6E8 0%, #E8D9B0 55%, #C9B888 100%)",
          boxShadow: "0 0 60px 20px rgba(251,246,232,0.25), 0 0 120px 50px rgba(212,168,83,0.12)",
          animation: "dreamMoonGlow 8s ease-in-out infinite",
        }} />

      {/* drifting fog */}
      <div className="absolute bottom-0 left-0 right-0 h-1/2"
        style={{
          background: "linear-gradient(to top, rgba(120,100,180,0.10), transparent)",
          animation: "dreamFog 18s ease-in-out infinite",
        }} />
    </div>
  );
}
