"use client";

/**
 * Browser-tab birthday signals. While Birthday Mode is active:
 *   • swaps the favicon for a gently twinkling gold crescent-moon;
 *   • sets a warm gold theme-color (mobile browser chrome);
 *   • when the visitor switches away, the tab title changes to a birthday line
 *     so they notice today is special — restored the moment they return.
 * Everything is reverted on cleanup. Never on /admin.
 */

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useBirthdayMode } from "./useBirthdayMode";

const THEME_COLOR = "#B8883A";
const AWAY_TITLE = "🌙 Сьогодні особливий день ✨";

function drawFavicon(twinkle: number): string {
  const s = 64;
  const c = document.createElement("canvas");
  c.width = c.height = s;
  const g = c.getContext("2d")!;
  // deep round backdrop
  const bg = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  bg.addColorStop(0, "#241833");
  bg.addColorStop(1, "#0d0a18");
  g.fillStyle = bg;
  g.beginPath();
  g.arc(s / 2, s / 2, s / 2, 0, Math.PI * 2);
  g.fill();
  // gold crescent
  g.save();
  g.beginPath();
  g.arc(s * 0.46, s * 0.5, s * 0.3, 0, Math.PI * 2);
  g.clip();
  const moon = g.createRadialGradient(s * 0.4, s * 0.42, 2, s * 0.46, s * 0.5, s * 0.3);
  moon.addColorStop(0, "#FFF4D6");
  moon.addColorStop(1, "#D4A853");
  g.fillStyle = moon;
  g.fillRect(0, 0, s, s);
  g.fillStyle = "#0d0a18";
  g.beginPath();
  g.arc(s * 0.6, s * 0.44, s * 0.28, 0, Math.PI * 2);
  g.fill();
  g.restore();
  // twinkling sparkle
  const a = 0.5 + 0.5 * Math.sin(twinkle);
  g.save();
  g.globalCompositeOperation = "lighter";
  g.translate(s * 0.72, s * 0.32);
  g.fillStyle = `rgba(255,244,214,${a})`;
  const spike = (len: number, wid: number, rot: number) => {
    g.save();
    g.rotate(rot);
    g.beginPath();
    g.moveTo(-len, 0);
    g.lineTo(0, -wid);
    g.lineTo(len, 0);
    g.lineTo(0, wid);
    g.closePath();
    g.fill();
    g.restore();
  };
  spike(s * 0.16 * a, s * 0.03, 0);
  spike(s * 0.16 * a, s * 0.03, Math.PI / 2);
  g.restore();
  return c.toDataURL("image/png");
}

export default function BrowserSignals() {
  const pathname = usePathname();
  const { atmosphere } = useBirthdayMode();
  const [forced, setForced] = useState(false);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (p.has("celebrate") || p.has("birthday") || p.has("atmosphere")) setForced(true);
  }, []);

  const onAdmin = pathname?.startsWith("/admin") ?? false;
  const active = (atmosphere || forced) && !onAdmin;

  useEffect(() => {
    if (!active) return;
    const head = document.head;

    // ── favicon ──
    const iconLink = document.createElement("link");
    iconLink.rel = "icon";
    iconLink.type = "image/png";
    head.appendChild(iconLink);
    let phase = 0;
    const paint = () => {
      iconLink.href = drawFavicon(phase);
    };
    paint();
    const favTimer = window.setInterval(() => {
      phase += 0.6;
      paint();
    }, 700);

    // ── theme-color ──
    let themeMeta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    const createdTheme = !themeMeta;
    const prevTheme = themeMeta?.content ?? null;
    if (!themeMeta) {
      themeMeta = document.createElement("meta");
      themeMeta.name = "theme-color";
      head.appendChild(themeMeta);
    }
    themeMeta.content = THEME_COLOR;

    // ── tab title on blur ──
    let stash = "";
    const onVis = () => {
      if (document.hidden) {
        stash = document.title;
        document.title = AWAY_TITLE;
      } else if (stash) {
        document.title = stash;
        stash = "";
      }
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      clearInterval(favTimer);
      iconLink.remove();
      document.removeEventListener("visibilitychange", onVis);
      if (stash) document.title = stash;
      if (createdTheme) themeMeta?.remove();
      else if (themeMeta && prevTheme !== null) themeMeta.content = prevTheme;
    };
  }, [active]);

  return null;
}
