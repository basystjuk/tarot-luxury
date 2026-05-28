"use client";

/**
 * Liminal Moments block (Phase М16).
 *
 * A consolidated list of the next major Moon thresholds with precise
 * wall-clock times:
 *   - Moon entering the next sign     (always close, usually < 3 days)
 *   - Next New Moon                   (within ~30 days)
 *   - Next Full Moon                  (within ~30 days)
 *   - User's next Lunar Return        (if natal Moon known)
 *
 * Each entry shows:
 *   - Glyph + label
 *   - "in 14 h" / "in 3 days" rough lead time
 *   - Exact Kyiv-local timestamp
 *
 * Sorted chronologically, soonest first. Auto-refreshes via parent
 * re-render (the parent already ticks every minute in "today" mode).
 */

import { useMemo } from "react";
import { findLiminalMoments, type LiminalMoment, type LiminalKind } from "@/lib/astro/forecast";
import { SIGN_GLYPHS } from "@/lib/astro/calculations";

interface Props {
  language: "uk" | "ru" | "en";
  signNames: string[];
  natalMoonLon: number | null;
}

const GLYPH: Record<LiminalKind, string> = {
  "sign-change": "♋", "new-moon": "🌑", "full-moon": "🌕", "lunar-return": "🌗",
};

const COPY = {
  uk: {
    heading: "Точки переходу",
    sub: "Найближчі моменти зміни — у локальному часі Києва. Гарні точки для пауз і нових починань.",
    in_h: (h: number) => `через ${h} год`,
    in_d: (d: number) => `через ${d} дн.`,
    sign_change: (signGlyph: string, signName: string) => `Місяць заходить у ${signGlyph} ${signName}`,
    new_moon: "Новий Місяць — точне з'єднання Сонця та Місяця",
    full_moon: "Повний Місяць — точна опозиція",
    lunar_return: "Твоє місячне повернення — особистий новий цикл",
  },
  ru: {
    heading: "Точки перехода",
    sub: "Ближайшие моменты смены — в локальном времени Киева. Хорошие точки для пауз и новых начинаний.",
    in_h: (h: number) => `через ${h} ч`,
    in_d: (d: number) => `через ${d} дн.`,
    sign_change: (signGlyph: string, signName: string) => `Луна заходит в ${signGlyph} ${signName}`,
    new_moon: "Новолуние — точное соединение Солнца и Луны",
    full_moon: "Полнолуние — точная оппозиция",
    lunar_return: "Твоё лунное возвращение — личный новый цикл",
  },
  en: {
    heading: "Threshold moments",
    sub: "The closest upcoming shifts — in local Kyiv time. Good points for pauses and new beginnings.",
    in_h: (h: number) => `in ${h} h`,
    in_d: (d: number) => `in ${d} d`,
    sign_change: (signGlyph: string, signName: string) => `Moon enters ${signGlyph} ${signName}`,
    new_moon: "New Moon — exact Sun-Moon conjunction",
    full_moon: "Full Moon — exact opposition",
    lunar_return: "Your Lunar Return — personal new cycle",
  },
};

function fmtKyiv(d: Date, lang: "uk" | "ru" | "en"): string {
  const locale = lang === "ru" ? "ru-RU" : lang === "en" ? "en-US" : "uk-UA";
  return d.toLocaleString(locale, {
    timeZone: "Europe/Kiev",
    weekday: "short", day: "numeric", month: "long",
    hour: "2-digit", minute: "2-digit",
  });
}

export function LiminalMoments({ language, signNames, natalMoonLon }: Props) {
  const t = COPY[language];

  const moments = useMemo(
    () => findLiminalMoments(natalMoonLon ?? undefined),
    [natalMoonLon],
  );

  if (moments.length === 0) return null;

  return (
    <div className="card-luxury">
      <h3 className="text-xl text-[#1C1512]" style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}>
        {t.heading}
      </h3>
      <p className="text-xs text-[#7A6A58] mb-4 mt-1">{t.sub}</p>

      <ul className="space-y-2">
        {moments.map((m, i) => {
          const lead = m.hoursAhead < 24
            ? t.in_h(Math.max(1, Math.round(m.hoursAhead)))
            : t.in_d(Math.round(m.hoursAhead / 24));
          const label = describeMoment(m, language, signNames, t);
          return (
            <li key={i} className="p-3 rounded-xl bg-[rgba(196,169,122,0.05)] border border-[rgba(196,169,122,0.18)]">
              <div className="flex items-start gap-3 flex-wrap">
                <span className="text-lg flex-shrink-0">
                  {m.kind === "sign-change" && m.nextSignIdx != null
                    ? SIGN_GLYPHS[m.nextSignIdx]
                    : GLYPH[m.kind]}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#1C1512]" style={{ fontFamily: "var(--font-cormorant)" }}>
                    {label}
                  </p>
                  <p className="text-[11px] text-[#9A8A78] mt-0.5">
                    <span className="text-[#B8883A]">{lead}</span> · {fmtKyiv(m.date, language)}
                  </p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function describeMoment(
  m: LiminalMoment,
  lang: "uk" | "ru" | "en",
  signNames: string[],
  t: (typeof COPY)["uk"],
): string {
  switch (m.kind) {
    case "sign-change":
      if (m.nextSignIdx != null) {
        return t.sign_change(SIGN_GLYPHS[m.nextSignIdx], signNames[m.nextSignIdx]);
      }
      return lang === "ru" ? "Луна меняет знак" : lang === "en" ? "Moon changes sign" : "Місяць змінює знак";
    case "new-moon":     return t.new_moon;
    case "full-moon":    return t.full_moon;
    case "lunar-return": return t.lunar_return;
  }
}
