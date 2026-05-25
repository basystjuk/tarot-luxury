"use client";

/**
 * Special Signals card (Phase М11+М15).
 *
 * Collects all the "rare but important" Moon flags into ONE card that
 * only appears when at least one signal is active. Replaces the
 * previous always-on horizontal badge bar that overwhelmed first-time
 * visitors with 5-6 inscrutable pills.
 *
 * Each active signal renders as a small row with:
 *   - glyph + name
 *   - "why I'm seeing this" — the concrete reason this badge fired
 *
 * The general Moon-speed badge stays separate (it's neutral info, not
 * a "special" signal) so the user can still see speed at a glance.
 */

import { useState } from "react";
import { ChevronDown, ChevronUp, AlertCircle } from "lucide-react";
import type { FixedStar } from "./_fixed-stars";

type SignalKey = "darkMoon" | "voc" | "oob" | "eclipse" | "fixedStar";

interface SpecialSignal {
  key: SignalKey;
  /** Localised label (already in user's language). */
  label: string;
  /** One-sentence "why this is shown" — the SPECIFIC concrete reason. */
  why: string;
  /** Visual emphasis level (controls colour). */
  severity: "info" | "warn" | "alert";
  /** Optional inline glyph that overrides the default. */
  glyph?: string;
}

interface Props {
  language: "uk" | "ru" | "en";
  isDarkMoon: boolean;
  voidOfCourse: boolean;
  isOutOfBounds: boolean;
  moonDeclination: number;
  eclipseType: "solar" | "lunar" | null;
  eclipseProximity: number;
  fixedStar: FixedStar | null;
  fixedStarOrb: number;
}

const COPY = {
  uk: {
    heading: "Особливі сигнали сьогодні",
    none: "Звичайний день — особливих місячних сигналів немає.",
    showMore: "Розгорнути пояснення",
    showLess: "Згорнути пояснення",
    why_dark: "Місяць у вікні ±18° від точного з'єднання з Сонцем — він майже невидимий на небі. Класичне 3-денне вікно «зупинки» циклу.",
    why_voc: "Усі основні аспекти, які Місяць міг утворити у поточному знаку, вже завершено. Час «без курсу» до моменту переходу в наступний знак.",
    why_oob: "Декліна Місяця перевищує нахил екліптики (23.4°) — Місяць виходить за межі звичайної смуги. Класичний «дикий» день.",
    why_eclipse_solar: "Сонце та Північний/Південний Вузол сходяться на ±18° на момент Нового Місяця — геометрія, що дає сонячне затемнення.",
    why_eclipse_lunar: "Місяць у межах ±12° від Вузла на момент Повного Місяця — геометрія Місячного затемнення.",
    why_star: (name: string, orb: number) => `Місяць у межах ${orb}′ дуги від нерухомої зірки ${name}. Класична астрологія надає цьому особливого тлумачення.`,
  },
  ru: {
    heading: "Особые сигналы сегодня",
    none: "Обычный день — особых лунных сигналов нет.",
    showMore: "Развернуть объяснение",
    showLess: "Свернуть объяснение",
    why_dark: "Луна в окне ±18° от точного соединения с Солнцем — она почти невидима на небе. Классическое 3-дневное окно «остановки» цикла.",
    why_voc: "Все основные аспекты, которые Луна могла образовать в текущем знаке, уже завершены. Время «без курса» до перехода в следующий знак.",
    why_oob: "Склонение Луны превышает наклон эклиптики (23.4°) — Луна выходит за пределы обычной полосы. Классический «дикий» день.",
    why_eclipse_solar: "Солнце и Северный/Южный Узел сходятся в ±18° на момент Новолуния — геометрия, дающая солнечное затмение.",
    why_eclipse_lunar: "Луна в пределах ±12° от Узла на момент Полнолуния — геометрия Лунного затмения.",
    why_star: (name: string, orb: number) => `Луна в пределах ${orb}′ дуги от неподвижной звезды ${name}. Классическая астрология даёт этому особое толкование.`,
  },
  en: {
    heading: "Special signals today",
    none: "An ordinary day — no special Moon signals.",
    showMore: "Show explanations",
    showLess: "Hide explanations",
    why_dark: "The Moon is within ±18° of an exact conjunction with the Sun — nearly invisible in the sky. The classical 3-day pause in the cycle.",
    why_voc: "All major aspects the Moon could form in its current sign have already exacted. A drift period until it enters the next sign.",
    why_oob: "The Moon's declination exceeds the ecliptic's obliquity (23.4°) — outside its normal band. A classical 'wild card' day.",
    why_eclipse_solar: "Sun and the North/South Node converge within ±18° at New Moon — the geometry that produces a solar eclipse.",
    why_eclipse_lunar: "The Moon is within ±12° of a Node at Full Moon — the geometry of a lunar eclipse.",
    why_star: (name: string, orb: number) => `The Moon is within ${orb}′ of arc of the fixed star ${name}. Classical astrology attaches a specific reading to this.`,
  },
};

export function SpecialSignals(props: Props) {
  const t = COPY[props.language];
  const lang = props.language;

  const signals: SpecialSignal[] = [];

  if (props.eclipseType) {
    signals.push({
      key: "eclipse",
      label: props.eclipseType === "solar"
        ? (lang === "ru" ? "Солнечное затмение" : lang === "en" ? "Solar eclipse" : "Сонячне затемнення")
        : (lang === "ru" ? "Лунное затмение" : lang === "en" ? "Lunar eclipse" : "Місячне затемнення"),
      why: props.eclipseType === "solar" ? t.why_eclipse_solar : t.why_eclipse_lunar,
      severity: "alert",
      glyph: props.eclipseType === "solar" ? "🌒" : "🌕",
    });
  }
  if (props.isDarkMoon) {
    signals.push({
      key: "darkMoon",
      label: lang === "ru" ? "Тёмная Луна" : lang === "en" ? "Dark Moon" : "Темний Місяць",
      why: t.why_dark, severity: "warn", glyph: "🌑",
    });
  }
  if (props.isOutOfBounds) {
    signals.push({
      key: "oob",
      label: `Out of Bounds (δ ${props.moonDeclination >= 0 ? "+" : ""}${props.moonDeclination.toFixed(1)}°)`,
      why: t.why_oob, severity: "warn", glyph: "🌠",
    });
  }
  if (props.voidOfCourse) {
    signals.push({
      key: "voc",
      label: lang === "ru" ? "Пустая Луна (VoC)" : lang === "en" ? "Void of Course" : "Пустий Місяць (VoC)",
      why: t.why_voc, severity: "info", glyph: "⊘",
    });
  }
  if (props.fixedStar) {
    const starName = props.fixedStar.i18n[lang].name;
    signals.push({
      key: "fixedStar",
      label: `${starName} (±${props.fixedStarOrb}′)`,
      why: t.why_star(starName, props.fixedStarOrb), severity: "info", glyph: "✦",
    });
  }

  // Default collapsed when there's only mild stuff; auto-expanded if
  // there's something serious (eclipse / OOB).
  const hasAlert = signals.some(s => s.severity === "alert");
  const [open, setOpen] = useState(hasAlert);

  if (signals.length === 0) {
    return null; // empty state — don't even render the card on quiet days.
  }

  return (
    <div className={`mt-5 rounded-2xl border ${
      hasAlert
        ? "bg-[rgba(122,62,24,0.07)] border-[rgba(122,62,24,0.3)]"
        : "bg-[rgba(196,169,122,0.05)] border-[rgba(196,169,122,0.2)]"
    }`}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <span className="flex items-center gap-2 flex-wrap text-sm">
          <AlertCircle size={14} className={hasAlert ? "text-[#9A6E28]" : "text-[#C4A97A]"} />
          <span className="text-[#5C4530] font-medium">{t.heading}</span>
          {/* Glyph summary even when collapsed — user sees at a glance which signals fired. */}
          <span className="text-base ml-1">
            {signals.map(s => s.glyph).join(" ")}
          </span>
          <span className="text-xs text-[#9A8A78]">({signals.length})</span>
        </span>
        {open
          ? <ChevronUp size={16} className="text-[#C4A97A]" />
          : <ChevronDown size={16} className="text-[#C4A97A]" />}
      </button>

      {open && (
        <ul className="px-4 pb-4 space-y-2.5">
          {signals.map(s => (
            <li key={s.key} className={`p-3 rounded-xl border text-left ${
              s.severity === "alert"
                ? "bg-[rgba(122,62,24,0.08)] border-[rgba(122,62,24,0.32)]"
                : s.severity === "warn"
                ? "bg-[rgba(184,136,58,0.08)] border-[rgba(184,136,58,0.3)]"
                : "bg-white/40 border-[rgba(196,169,122,0.18)]"
            }`}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{s.glyph}</span>
                <span className="text-sm font-medium text-[#1C1512]">{s.label}</span>
              </div>
              {/* Phase М15 — "Why I'm seeing this" line. Specific to THIS
                  signal in THIS chart, not a generic glossary. */}
              <p className="text-xs text-[#5C4530] leading-relaxed pl-7">
                {s.why}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
