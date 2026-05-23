"use client";

/**
 * Sub-components for the numerology result UI (Phase 3).
 *
 * Kept in a sibling file so the main page.tsx stays readable. Everything
 * here is stateless / lightly-stateful presentation — no API calls, no
 * routing, no global state.
 */

import { useState, useId, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Info, ChevronDown } from "lucide-react";
import type { PersonalDay } from "@/lib/numerology/calculators";

// ─── TermHint — tooltip on tap (mobile) / hover (desktop) ──────────────────
// Rendered via React Portal into <body> so it never clips inside parent
// containers with overflow:hidden or transforms (e.g. inside a closed
// <details> summary). Position is computed relative to the trigger button
// and clamped to the viewport so it stays fully visible on every edge.
// `textTransform: none` + `normal-case` prevent inheritance from labels
// styled with the `uppercase` class.
export function TermHint({ children, hint }: { children: React.ReactNode; hint: string }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number; width: number } | null>(null);
  const [mounted, setMounted] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const id = useId();

  useEffect(() => setMounted(true), []);

  const openTip = useCallback(() => {
    const el = btnRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const tipWidth = Math.min(280, window.innerWidth - 16);
    const center = rect.left + rect.width / 2;
    let left = center - tipWidth / 2;
    left = Math.max(8, Math.min(left, window.innerWidth - tipWidth - 8));
    setPos({ top: rect.bottom + 8, left, width: tipWidth });
    setOpen(true);
  }, []);

  const closeTip = useCallback(() => setOpen(false), []);

  // Close on scroll/resize — trigger may move and the fixed-position tooltip
  // would drift. Cheaper than recomputing on every scroll event.
  useEffect(() => {
    if (!open) return;
    window.addEventListener("scroll", closeTip, true);
    window.addEventListener("resize", closeTip);
    return () => {
      window.removeEventListener("scroll", closeTip, true);
      window.removeEventListener("resize", closeTip);
    };
  }, [open, closeTip]);

  return (
    <span className="inline-flex items-center gap-1 align-middle">
      {children}
      <button
        ref={btnRef}
        type="button"
        aria-describedby={open ? id : undefined}
        aria-label={hint}
        onClick={(e) => { e.preventDefault(); open ? closeTip() : openTip(); }}
        onBlur={closeTip}
        onMouseEnter={openTip}
        onMouseLeave={closeTip}
        className="inline-flex items-center justify-center text-[#C4A97A] hover:text-[#B8883A] transition-colors flex-shrink-0"
      >
        <Info size={13} aria-hidden="true" />
      </button>
      {mounted && open && pos && createPortal(
        <span
          id={id}
          role="tooltip"
          style={{
            position: "fixed",
            top: pos.top,
            left: pos.left,
            width: pos.width,
            zIndex: 9999,
            fontFamily: "var(--font-cormorant)",
            fontSize: "13px",
            textTransform: "none",
            letterSpacing: "normal",
            lineHeight: 1.45,
          }}
          className="p-3 rounded-lg bg-[#1C1512] text-white/95 shadow-2xl border border-[rgba(196,169,122,0.4)] pointer-events-none normal-case"
        >
          {hint}
        </span>,
        document.body,
      )}
    </span>
  );
}

// ─── CollapseSection — native <details> styled to match brand ──────────────
export function CollapseSection({
  title,
  defaultOpen = false,
  children,
}: {
  title: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  return (
    <details
      open={defaultOpen}
      className="group rounded-2xl border border-[rgba(196,169,122,0.25)] bg-[rgba(255,253,248,0.7)] transition-colors hover:border-[rgba(196,169,122,0.45)]"
    >
      <summary
        className="flex items-center justify-between gap-3 px-5 py-4 cursor-pointer list-none select-none"
        style={{ fontFamily: "var(--font-cormorant)" }}
      >
        <span className="text-[#1C1512] text-lg font-medium flex-1">{title}</span>
        <ChevronDown
          size={18}
          className="text-[#C4A97A] transition-transform duration-300 group-open:rotate-180 flex-shrink-0"
        />
      </summary>
      <div className="px-5 pb-5 pt-1 space-y-4">{children}</div>
    </details>
  );
}

// ─── LifePathHero — big visual block with the single most important number
export function LifePathHero({
  number,
  archetype,
  description,
  masterNote,
}: {
  number: number;
  archetype: string;
  description: string;
  masterNote?: string | null;
}) {
  return (
    <div className="relative rounded-3xl bg-gradient-to-br from-[#FFFAF0] via-[#FDF6E8] to-[#F5EAD4] border border-[rgba(196,169,122,0.3)] p-7 sm:p-10 overflow-hidden">
      {/* decorative rings */}
      <div className="pointer-events-none absolute -top-16 -right-16 w-56 h-56 rounded-full bg-[radial-gradient(circle,rgba(212,168,83,0.18),transparent_70%)]" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-12 -left-12 w-40 h-40 rounded-full bg-[radial-gradient(circle,rgba(196,169,122,0.15),transparent_70%)]" aria-hidden="true" />

      <div className="relative flex flex-col items-center text-center gap-5">
        <div
          className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full flex items-center justify-center shadow-[0_15px_45px_rgba(180,140,60,0.35)]"
          style={{
            background: "radial-gradient(circle at 32% 30%, #F5E5BD 0%, #D4A853 45%, #9A6E28 100%)",
          }}
        >
          {/* Neutral sans-serif for numbers — refined but not antique-italic */}
          <span
            className="text-white tabular-nums"
            style={{
              fontWeight: 300,
              fontSize: number >= 10 ? "3.5rem" : "4.5rem",
              lineHeight: 1,
              letterSpacing: "-0.02em",
              textShadow: "0 2px 8px rgba(80,55,20,0.35)",
            }}
          >
            {number}
          </span>
        </div>

        <div className="space-y-2 max-w-xl">
          <p
            className="text-[#1C1512] tracking-wide"
            style={{ fontFamily: "var(--font-cormorant)", fontSize: "1.65rem", fontWeight: 500 }}
          >
            {archetype}
          </p>
          <p className="text-[#5C4530] leading-relaxed text-base sm:text-[1.05rem]">
            {description}
          </p>
          {masterNote && (
            <p className="text-xs text-[#B8883A] italic pt-2" style={{ fontFamily: "var(--font-cormorant)", fontSize: "0.95rem" }}>
              ✦ {masterNote}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── AI Intro Panel — shown above the hero once synthesis arrives ──────────
// Powder-rose palette: distinct from the gold accents used everywhere else,
// soft enough to read effortlessly. Dark warm-brown text on a blush gradient
// — no shadows, no inverted text, no clash with the cream page background.
export function AiIntroPanel({ text }: { text: string }) {
  return (
    <div
      className="rounded-2xl p-6 sm:p-7 border shadow-[0_8px_24px_rgba(180,130,120,0.12)]"
      style={{
        background: "linear-gradient(135deg, #F2DCD0 0%, #E8C7B9 100%)",
        borderColor: "rgba(196,150,135,0.35)",
      }}
    >
      <p
        className="italic"
        style={{
          fontFamily: "var(--font-cormorant)",
          fontSize: "1.15rem",
          lineHeight: 1.6,
          color: "#3A2418",
        }}
      >
        {text}
      </p>
    </div>
  );
}

// ─── Pinnacle / Challenge / Letter / Plane display blocks ──────────────────
export function ExtendedRow({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 border-b border-[rgba(196,169,122,0.15)] last:border-b-0">
      <span className="text-sm text-[#7A6A58] tracking-wide flex items-center gap-1">
        {hint ? <TermHint hint={hint}>{label}</TermHint> : label}
      </span>
      <span
        className="text-[#1C1512] text-base font-medium text-right"
        style={{ fontFamily: "var(--font-cormorant)" }}
      >
        {value}
      </span>
    </div>
  );
}

export function PlaneBars({
  data,
  labels,
}: {
  data: { physical: number; mental: number; emotional: number; intuitive: number; dominant: string };
  labels: { physical: string; mental: string; emotional: string; intuitive: string; dominantLabel: string };
}) {
  const total = data.physical + data.mental + data.emotional + data.intuitive || 1;
  const rows: { key: "physical" | "mental" | "emotional" | "intuitive"; label: string }[] = [
    { key: "physical",  label: labels.physical },
    { key: "mental",    label: labels.mental },
    { key: "emotional", label: labels.emotional },
    { key: "intuitive", label: labels.intuitive },
  ];
  return (
    <div className="space-y-3">
      {rows.map(r => {
        const pct = Math.round((data[r.key] / total) * 100);
        const isDom = data.dominant === r.key;
        return (
          <div key={r.key}>
            <div className="flex justify-between text-xs mb-1">
              <span className={`tracking-wide ${isDom ? "text-[#B8883A] font-medium" : "text-[#7A6A58]"}`}>
                {r.label} {isDom && "✦"}
              </span>
              <span className="text-[#9A8A78]">{data[r.key]} · {pct}%</span>
            </div>
            <div className="h-2 rounded-full bg-[rgba(196,169,122,0.15)] overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${pct}%`,
                  background: isDom
                    ? "linear-gradient(90deg,#D4A853,#9A6E28)"
                    : "linear-gradient(90deg,#C4A97A,#A07F50)",
                  opacity: isDom ? 1 : 0.7,
                }}
              />
            </div>
          </div>
        );
      })}
      <p className="text-xs text-[#7A6A58] italic pt-2" style={{ fontFamily: "var(--font-cormorant)", fontSize: "0.95rem" }}>
        {labels.dominantLabel}
      </p>
    </div>
  );
}

// ─── Personal Days Calendar ─────────────────────────────────────────────────
// Highlights the favourable days of the current month based on Personal Day
// vibration. 1 = beginnings, 5 = motion/travel, 9 = completion — the three
// most actionable for everyday decisions.

const FAVOURABLE = new Set([1, 5, 9]);

// Powder palette — each Personal-Day number gets its own saturated muted
// hue. Avoids "all gold" monotony while staying away from the bright/
// pastel territory the user dislikes. Best days (1, 5, 9) get the most
// vivid options; ordinary days get softer neutrals.
const PD_COLOR: Record<number, { bg: string; text: string }> = {
  1: { bg: "linear-gradient(135deg,#C97F73,#A85E55)", text: "#FFFFFF" }, // dusty rose — initiation
  2: { bg: "linear-gradient(135deg,#C8B2C2,#9B8BA8)", text: "#3A2C3A" }, // muted mauve — partnership
  3: { bg: "linear-gradient(135deg,#D6AF95,#B58A70)", text: "#3C2418" }, // terracotta — creativity
  4: { bg: "linear-gradient(135deg,#B6BFA9,#8FA084)", text: "#2C3328" }, // sage — work
  5: { bg: "linear-gradient(135deg,#86A8B5,#638C9A)", text: "#FFFFFF" }, // dusty teal — movement
  6: { bg: "linear-gradient(135deg,#D8A398,#BC7D72)", text: "#3A1F1A" }, // blush coral — care
  7: { bg: "linear-gradient(135deg,#A695B0,#7F6E91)", text: "#FFFFFF" }, // muted plum — reflection
  8: { bg: "linear-gradient(135deg,#B89878,#947453)", text: "#FFFFFF" }, // warm clay — power
  9: { bg: "linear-gradient(135deg,#9F7C8E,#7D5B6D)", text: "#FFFFFF" }, // dusky rose — completion
};

const PD_LABEL: Record<number, [string, string, string]> = {
  1: [
    "нові починання — старт справ, перші кроки, ініціатива",
    "новые начинания — старт дел, первые шаги, инициатива",
    "new beginnings — starting things, first steps, initiative",
  ],
  2: [
    "партнерство — переговори, союзи, тонкі стосунки",
    "партнёрство — переговоры, союзы, тонкие отношения",
    "partnership — negotiations, alliances, subtle relationships",
  ],
  3: [
    "творчість — самовираження, спілкування, презентації",
    "творчество — самовыражение, общение, презентации",
    "creativity — self-expression, communication, presentations",
  ],
  4: [
    "робота — рутина, структура, методична праця",
    "работа — рутина, структура, методичный труд",
    "work — routine, structure, methodical effort",
  ],
  5: [
    "рух — подорожі, важливі зміни, гнучкі рішення",
    "движение — путешествия, важные перемены, гибкие решения",
    "movement — travel, important changes, flexible decisions",
  ],
  6: [
    "дім — сім'я, турбота про близьких, гармонія",
    "дом — семья, забота о близких, гармония",
    "home — family, care for loved ones, harmony",
  ],
  7: [
    "рефлексія — навчання, аналіз, тиха внутрішня робота",
    "рефлексия — обучение, анализ, тихая внутренняя работа",
    "reflection — study, analysis, quiet inner work",
  ],
  8: [
    "сила — фінанси, великі рішення, кар'єрні кроки",
    "сила — финансы, большие решения, карьерные шаги",
    "power — finance, big decisions, career moves",
  ],
  9: [
    "завершення — підсумки, відпускання, закриття циклів",
    "завершение — итоги, отпускание, закрытие циклов",
    "completion — wrapping up, letting go, closing cycles",
  ],
};

function getPdLabel(n: number, language: "uk" | "ru" | "en"): string {
  const row = PD_LABEL[n];
  if (!row) return "";
  return language === "ru" ? row[1] : language === "en" ? row[2] : row[0];
}

export function PersonalDaysCalendar({
  days,
  year,
  month,
  language,
  monthName,
  weekdayShort,
  todayDay,
}: {
  days: PersonalDay[];
  year: number;
  month: number;
  language: "uk" | "ru" | "en";
  monthName: string;
  /** 7 short weekday labels starting Monday */
  weekdayShort: [string, string, string, string, string, string, string];
  /** today's day-of-month if viewing current month; else undefined */
  todayDay?: number;
}) {
  // Build grid starting Monday (ISO week)
  const firstWeekday = (new Date(year, month - 1, 1).getDay() + 6) % 7; // 0=Mon
  const cells: (PersonalDay | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  days.forEach(d => cells.push(d));

  // Group favourable days for the "best dates" summary
  const best: Record<number, number[]> = { 1: [], 5: [], 9: [] };
  days.forEach(d => {
    if (FAVOURABLE.has(d.number)) best[d.number].push(d.day);
  });

  return (
    <div className="space-y-5">
      <div className="text-center">
        <p className="text-[10px] text-[#C4A97A] tracking-widest uppercase mb-1">
          {language === "ru" ? "Календарь личных дней" : language === "en" ? "Personal Days Calendar" : "Календар особистих днів"}
        </p>
        <p className="text-xl text-[#1C1512]" style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}>
          {monthName} {year}
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-1 sm:gap-1.5 text-center">
        {weekdayShort.map((w, i) => (
          <div key={i} className="text-[10px] text-[#C4A97A] tracking-wider uppercase py-1.5">
            {w}
          </div>
        ))}
        {cells.map((cell, i) => {
          if (!cell) return <div key={i} aria-hidden="true" />;
          const isFav = FAVOURABLE.has(cell.number);
          const isToday = todayDay === cell.day;
          const color = PD_COLOR[cell.number];
          return (
            <div
              key={i}
              title={`${cell.day}: ${getPdLabel(cell.number, language)}`}
              className={[
                "aspect-square rounded-lg flex flex-col items-center justify-center transition-all tabular-nums",
                isFav
                  ? "shadow-[0_3px_10px_rgba(120,80,60,0.18)]"
                  : "bg-[rgba(255,253,248,0.5)] border border-[rgba(196,169,122,0.15)] text-[#7A6A58]",
                isToday ? "ring-2 ring-[#1C1512] ring-offset-1" : "",
              ].join(" ")}
              style={isFav && color ? { background: color.bg, color: color.text } : undefined}
            >
              <span className={`text-[10px] sm:text-xs ${isFav ? "opacity-85" : "opacity-60"}`}>
                {cell.day}
              </span>
              <span
                className={`text-sm sm:text-base ${isFav ? "font-medium" : ""}`}
                style={{ letterSpacing: "-0.01em", fontWeight: isFav ? 500 : 400 }}
              >
                {cell.number}
              </span>
            </div>
          );
        })}
      </div>

      {/* Best dates summary — each digit in its own powder hue */}
      <div className="space-y-2.5 pt-2">
        {([1, 5, 9] as const).map(n => (
          best[n].length > 0 && (
            <div key={n} className="flex items-baseline gap-3 text-sm">
              <span
                className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 tabular-nums"
                style={{
                  background: PD_COLOR[n]?.bg,
                  color: PD_COLOR[n]?.text,
                  fontWeight: 500,
                  letterSpacing: "-0.01em",
                }}
              >
                {n}
              </span>
              <span className="text-[#5C4530] flex-1 leading-relaxed">
                <span className="font-medium text-[#1C1512]">{best[n].join(", ")}</span>
                <span className="text-[#7A6A58]"> · {getPdLabel(n, language)}</span>
              </span>
            </div>
          )
        ))}
      </div>
    </div>
  );
}

