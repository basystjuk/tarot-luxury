/* eslint-disable @next/next/no-img-element */
/**
 * Shared edge-rendered OG card factory for studio tools.
 *
 * Each tool folder re-exports a thin wrapper passing its ToolId, so we
 * keep one styled card and seven 6-line files instead of seven copies of
 * the design. ImageResponse is from next/og — the OS-bundled font is
 * used as a safe fallback (no remote fetch on the cold path).
 */

import { ImageResponse } from "next/og";
import { TOOL_LABELS, type ToolId } from "@/lib/tools-config";

const OG_SIZE = { width: 1200, height: 630 };

const GLYPH: Record<ToolId, string> = {
  "daily-card": "✦",
  numerology: "∞",
  compatibility: "♡",
  "moon-phase": "🌙",
  "natal-chart": "✺",
  horoscope: "☉",
  "year-forecast": "❂",
};

const SUBTITLE: Record<ToolId, { uk: string; ru: string; en: string }> = {
  "daily-card":   { uk: "Карта дня · Таро",            ru: "Карта дня · Таро",            en: "Card of the Day · Tarot" },
  numerology:     { uk: "Нумерологія",                 ru: "Нумерология",                 en: "Numerology" },
  compatibility:  { uk: "Сумісність пари · Синастрія", ru: "Совместимость · Синастрия",   en: "Compatibility · Synastry" },
  "moon-phase":   { uk: "Місячний провідник",          ru: "Лунный проводник",            en: "Moon Guide" },
  "natal-chart":  { uk: "Натальна карта",              ru: "Натальная карта",             en: "Natal Chart" },
  horoscope:      { uk: "Гороскоп дня",                ru: "Гороскоп дня",                en: "Daily Horoscope" },
  "year-forecast":{ uk: "Прогноз року · Соляр",        ru: "Прогноз года · Соляр",        en: "Year Forecast · Solar Return" },
};

export async function renderToolOg(id: ToolId, langRaw: string) {
  const lang = langRaw === "ru" ? "ru" : langRaw === "en" ? "en" : "uk";
  const title = TOOL_LABELS[id][lang as "uk" | "ru" | "en"];
  const sub = SUBTITLE[id][lang as "uk" | "ru" | "en"];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%", height: "100%",
          display: "flex", flexDirection: "column", justifyContent: "space-between",
          padding: "80px",
          background:
            "radial-gradient(ellipse 70% 60% at 50% 30%, rgba(212,168,83,0.15), transparent), linear-gradient(180deg, #FDFBF7 0%, #F2EBD9 100%)",
          color: "#1C1512",
          fontFamily: "serif",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 32, letterSpacing: 2 }}>Ellen Soul</span>
            <span style={{ fontSize: 13, letterSpacing: 5, color: "#7A6A58", textTransform: "uppercase", marginTop: 4 }}>
              таро · астрологія · нумерологія
            </span>
          </div>
          <div style={{ fontSize: 110, lineHeight: 1, color: "#B8883A", opacity: 0.85 }}>{GLYPH[id]}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: 22, letterSpacing: 8, textTransform: "uppercase", color: "#B8883A" }}>{sub}</span>
          <span style={{ fontSize: 96, lineHeight: 1.05, marginTop: 18, fontWeight: 500 }}>{title}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <span style={{ fontSize: 22, color: "#7A6A58" }}>ellen-soul.com</span>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <span style={{ width: 80, height: 1, background: "#C4A97A" }} />
            <span style={{ fontSize: 18, letterSpacing: 4, color: "#9A6E28", textTransform: "uppercase" }}>
              Soul Studio
            </span>
          </div>
        </div>
      </div>
    ),
    OG_SIZE,
  );
}
