"use client";

/**
 * Monthly Moon calendar grid. Rendered as a standalone section below the
 * AI message block so a daily-returning user has a reason to come back —
 * the visual cycle of phases at a glance.
 *
 * Each cell:
 *   - day number (top)
 *   - phase emoji (middle)
 *   - sign glyph (bottom)
 *
 * Highlights: today (ring), full moon (warm tint), new moon (cool tint).
 * Click a cell to jump the main form to that date and recompute.
 *
 * The Moon calculation per cell uses calcMoonPhase at local noon — that
 * removes intra-day sign-boundary flicker (each day shows the dominant
 * sign of the day) and is cheap enough to do client-side for 28–31 cells.
 */

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SIGN_GLYPHS } from "@/lib/astro/calculations";
import { TermHint } from "@/components/ui/TermHint";
import { moonHint } from "./_hints";

interface CalcResult {
  emoji: string;
  moonSignIdx: number;
  phaseKey: string; // "new" | "full" | ... — we only branch on a couple
  illumination: number;
}

export interface MoonCalendarProps {
  language: string;
  /** Pass the page's calcMoonPhase fn so we share one ephemeris implementation. */
  calc: (year: number, month: number, day: number, hour: number, minute: number, tz: number) => CalcResult;
  /** Localised phase names, e.g. "Повний Місяць". */
  phaseNameOf: (key: string) => string;
  /** Click handler — jumps the main form to that date. */
  onSelectDate: (year: number, month: number, day: number) => void;
}

const WEEKDAYS: Record<string, string[]> = {
  uk: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"],
  ru: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"],
  en: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
};

const LOCALE: Record<string, string> = {
  uk: "uk-UA",
  ru: "ru-RU",
  en: "en-US",
};

export function MoonCalendar({ language, calc, phaseNameOf, onSelectDate }: MoonCalendarProps) {
  const isRu = language === "ru";
  const isEn = language === "en";

  const today = useMemo(() => new Date(), []);
  const [view, setView] = useState({ y: today.getFullYear(), m: today.getMonth() }); // m: 0-based

  const monthLabel = useMemo(() => {
    const fmt = new Intl.DateTimeFormat(LOCALE[language] || LOCALE.uk, { month: "long", year: "numeric" });
    return fmt.format(new Date(view.y, view.m, 1));
  }, [view, language]);

  // Build the 7-column grid for the visible month with Monday-first weeks.
  const cells = useMemo(() => {
    const firstDay = new Date(view.y, view.m, 1);
    const lastDay  = new Date(view.y, view.m + 1, 0);
    const startWeekday = (firstDay.getDay() + 6) % 7; // 0 = Mon
    const daysInMonth  = lastDay.getDate();

    const out: ({ day: number; data: CalcResult; isToday: boolean } | null)[] = [];
    for (let i = 0; i < startWeekday; i++) out.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      // Local noon → stable per-day phase without timezone ambiguity.
      const data = calc(view.y, view.m + 1, d, 12, 0, 0);
      const isToday =
        today.getFullYear() === view.y &&
        today.getMonth() === view.m &&
        today.getDate() === d;
      out.push({ day: d, data, isToday });
    }
    // Pad to a full final row so the grid stays rectangular.
    while (out.length % 7 !== 0) out.push(null);
    return out;
  }, [view, today, calc]);

  const prev = () => setView(v => v.m === 0 ? { y: v.y - 1, m: 11 } : { y: v.y, m: v.m - 1 });
  const next = () => setView(v => v.m === 11 ? { y: v.y + 1, m: 0 } : { y: v.y, m: v.m + 1 });
  const goToday = () => setView({ y: today.getFullYear(), m: today.getMonth() });

  const weekdayLabels = WEEKDAYS[language] || WEEKDAYS.uk;
  const navBtn = "w-9 h-9 rounded-full border border-[rgba(196,169,122,0.3)] text-[#7A6A58] hover:bg-[rgba(196,169,122,0.08)] hover:text-[#B8883A] transition-colors flex items-center justify-center";

  return (
    <div className="card-luxury">
      <div className="flex items-center justify-between mb-4 gap-3">
        <button type="button" onClick={prev} className={navBtn} aria-label={isRu ? "Предыдущий" : isEn ? "Previous" : "Попередній"}>
          <ChevronLeft size={18} />
        </button>
        <div className="text-center flex-1 min-w-0">
          <h3
            className="text-xl text-[#1C1512] capitalize"
            style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}
          >
            <TermHint hint={moonHint(language, "calendar")}>
              🗓 {monthLabel}
            </TermHint>
          </h3>
        </div>
        <button type="button" onClick={next} className={navBtn} aria-label={isRu ? "Следующий" : isEn ? "Next" : "Наступний"}>
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1.5">
        {weekdayLabels.map((w, i) => (
          <div key={i} className="text-center text-[10px] text-[#9A8A78] uppercase tracking-wider py-1">
            {w}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((c, i) => {
          if (c === null) return <div key={i} aria-hidden="true" />;
          const isFull = c.data.phaseKey === "full";
          const isNew  = c.data.phaseKey === "new";
          const title = `${c.day} · ${phaseNameOf(c.data.phaseKey)} · ${c.data.illumination}%`;
          return (
            <button
              key={i}
              type="button"
              title={title}
              onClick={() => onSelectDate(view.y, view.m + 1, c.day)}
              className={`aspect-square rounded-lg flex flex-col items-center justify-center gap-0.5 transition-all border ${
                c.isToday
                  ? "border-[#B8883A] bg-[rgba(212,168,83,0.12)] shadow-sm"
                  : isFull
                  ? "border-[rgba(232,201,138,0.45)] bg-[rgba(232,201,138,0.15)]"
                  : isNew
                  ? "border-[rgba(28,21,18,0.25)] bg-[rgba(28,21,18,0.05)]"
                  : "border-transparent hover:border-[rgba(196,169,122,0.35)] hover:bg-[rgba(196,169,122,0.08)]"
              }`}
            >
              <span className={`text-[10px] leading-none ${c.isToday ? "text-[#B8883A] font-medium" : "text-[#7A6A58]"}`}>
                {c.day}
              </span>
              <span className="text-base sm:text-lg leading-none">{c.data.emoji}</span>
              <span className="text-[9px] text-[#C4A97A] leading-none">
                {SIGN_GLYPHS[c.data.moonSignIdx]}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between mt-3 gap-2 flex-wrap">
        <p className="text-[10px] text-[#9A8A78] italic">
          {isRu ? "Нажми на дату — получи послание этого дня" : isEn ? "Tap a date for that day's message" : "Натисни на дату — отримай послання цього дня"}
        </p>
        <button
          type="button"
          onClick={goToday}
          className="text-[10px] text-[#B8883A] hover:text-[#9A6E28] underline-offset-2 hover:underline"
        >
          {isRu ? "К сегодняшнему дню" : isEn ? "Today" : "До сьогодні"}
        </button>
      </div>
    </div>
  );
}
