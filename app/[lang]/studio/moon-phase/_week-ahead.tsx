"use client";

/**
 * 7-day Moon forecast grid (Phase М13).
 *
 * Each card represents one day at local noon and shows:
 *   - Day name + date
 *   - Moon sign with glyph + degree
 *   - Phase emoji + illumination %
 *   - Personal Day number (if birth date present)
 *   - Tightest transit-Moon → natal aspect of the day (if natal known)
 *
 * Today is highlighted in gold. The grid scrolls horizontally on
 * narrow viewports; on desktop it lays out as 7 columns.
 */

import { useMemo } from "react";
import { SIGN_GLYPHS } from "@/lib/astro/calculations";
import { buildWeekForecast } from "@/lib/astro/forecast";
import type { Profile } from "@/hooks/useProfile";

interface Props {
  language: "uk" | "ru" | "en";
  signNames: string[];
  profile: Profile | null;
  natalMoonLon: number | null;
}

const PHASE_EMOJI: Record<string, string> = {
  new: "🌑", waxing: "🌒", full: "🌕", waning: "🌖",
};

const WEEKDAY = {
  uk: ["Нд", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"],
  ru: ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"],
  en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
};

const ASPECT_GLYPH: Record<string, string> = {
  conjunction: "☌", sextile: "⚹", square: "□", trine: "△", opposition: "☍",
};
const ASPECT_COLOR: Record<string, string> = {
  conjunction: "#B8883A", sextile: "#5A8A65", square: "#9A6E28",
  trine: "#3F6A35", opposition: "#7A3E18",
};
const TARGET_GLYPH: Record<string, string> = {
  Sun: "☉", Moon: "☽", Venus: "♀", Mars: "♂", ASC: "AC", MC: "MC",
};

const COPY = {
  uk: {
    heading: "Твій тиждень",
    sub: "Місячна погода на 7 днів. Сьогодні виділено золотим.",
    pDay: "PD",
    today: "сьогодні",
  },
  ru: {
    heading: "Твоя неделя",
    sub: "Лунная погода на 7 дней. Сегодня выделено золотым.",
    pDay: "PD",
    today: "сегодня",
  },
  en: {
    heading: "Your week ahead",
    sub: "Moon weather for 7 days. Today is highlighted in gold.",
    pDay: "PD",
    today: "today",
  },
};

export function WeekAhead({ language, signNames, profile, natalMoonLon }: Props) {
  const t = COPY[language];
  const weekdayNames = WEEKDAY[language];

  const days = useMemo(() => {
    const tz = -new Date().getTimezoneOffset() / 60;
    return buildWeekForecast(new Date(), tz, {
      moon:  natalMoonLon ?? undefined,
      sun:   undefined,
      venus: undefined,
      mars:  undefined,
      asc:   undefined,
      mc:    undefined,
      birthDate: profile?.birth_date ?? undefined,
    });
  }, [profile?.birth_date, natalMoonLon]);

  const todayIdx = 0; // first card is always today since we start from new Date()

  return (
    <div className="card-luxury">
      <h3 className="text-xl text-[#1C1512]" style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}>
        {t.heading}
      </h3>
      <p className="text-xs text-[#7A6A58] mb-4 mt-1">{t.sub}</p>

      <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2 sm:grid sm:grid-cols-7 sm:gap-2 sm:overflow-visible">
        {days.map((d, i) => {
          const isToday = i === todayIdx;
          const dateLabel = `${d.date.getDate()}.${String(d.date.getMonth() + 1).padStart(2, "0")}`;
          return (
            <div
              key={i}
              className={`flex-shrink-0 w-[120px] sm:w-auto rounded-xl border p-2.5 ${
                isToday
                  ? "bg-[rgba(212,168,83,0.15)] border-[rgba(212,168,83,0.45)]"
                  : "bg-[rgba(196,169,122,0.05)] border-[rgba(196,169,122,0.18)]"
              }`}
            >
              {/* Header: weekday + date */}
              <div className="flex items-center justify-between mb-1.5">
                <span className={`text-[10px] font-medium tracking-widest uppercase ${
                  isToday ? "text-[#B8883A]" : "text-[#9A8A78]"
                }`}>
                  {isToday ? t.today : weekdayNames[d.weekday]}
                </span>
                <span className="text-[10px] text-[#9A8A78] tabular-nums">{dateLabel}</span>
              </div>

              {/* Moon sign + degree */}
              <div className="flex items-center gap-1.5">
                <span className="text-base text-[#C4A97A]">{SIGN_GLYPHS[d.moonSignIdx]}</span>
                <span className="text-sm text-[#1C1512]" style={{ fontFamily: "var(--font-cormorant)" }}>
                  {signNames[d.moonSignIdx]}
                </span>
              </div>
              <p className="text-[10px] text-[#7A6A58] tabular-nums">{d.moonDegree}°</p>

              {/* Phase + illumination */}
              <div className="flex items-center gap-1 mt-1.5 text-xs text-[#5C4530]">
                <span>{PHASE_EMOJI[d.phaseKey]}</span>
                <span className="tabular-nums">{d.illumination}%</span>
              </div>

              {/* Personal Day */}
              {d.personalDay != null && (
                <div className="mt-1.5 inline-flex items-center gap-1 text-[10px] text-[#5C4530] bg-[rgba(196,169,122,0.18)] rounded-full px-1.5 py-0.5">
                  <span className="text-[#9A8A78]">{t.pDay}</span>
                  <span className="font-medium">{d.personalDay}</span>
                </div>
              )}

              {/* Top aspect — natal-only signal */}
              {d.topAspect && (
                <div className="mt-1.5 text-[10px] flex items-center gap-1">
                  <span className="text-[#C4A97A]">☽</span>
                  <span style={{ color: ASPECT_COLOR[d.topAspect.kind] }} className="text-sm leading-none">
                    {ASPECT_GLYPH[d.topAspect.kind]}
                  </span>
                  <span className="text-[#5C4530]">{TARGET_GLYPH[d.topAspect.target]}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
