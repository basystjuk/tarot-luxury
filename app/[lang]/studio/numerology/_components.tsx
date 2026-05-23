"use client";

/**
 * Sub-components for the numerology result UI (Phase 3).
 *
 * Kept in a sibling file so the main page.tsx stays readable. Everything
 * here is stateless / lightly-stateful presentation — no API calls, no
 * routing, no global state.
 */

import { useState, useId } from "react";
import { Info, ChevronDown } from "lucide-react";

// ─── TermHint — tooltip on tap (mobile) / hover (desktop) ──────────────────
export function TermHint({ children, hint }: { children: React.ReactNode; hint: string }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <span className="relative inline-flex items-center gap-1 align-middle">
      {children}
      <button
        type="button"
        aria-describedby={id}
        aria-label={hint}
        onClick={(e) => { e.preventDefault(); setOpen(v => !v); }}
        onBlur={() => setOpen(false)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        className="inline-flex items-center justify-center text-[#C4A97A] hover:text-[#B8883A] transition-colors flex-shrink-0"
      >
        <Info size={13} aria-hidden="true" />
      </button>
      {open && (
        <span
          id={id}
          role="tooltip"
          className="absolute z-20 left-1/2 -translate-x-1/2 top-full mt-2 w-56 sm:w-64 p-3 rounded-lg bg-[#1C1512] text-white/95 text-xs leading-snug shadow-xl border border-[rgba(196,169,122,0.4)] pointer-events-none"
          style={{ fontFamily: "var(--font-cormorant)", fontSize: "13px" }}
        >
          {hint}
        </span>
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
      className="group rounded-2xl border border-[rgba(196,169,122,0.25)] bg-[rgba(255,253,248,0.7)] overflow-hidden transition-colors hover:border-[rgba(196,169,122,0.45)]"
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
          <span
            className="text-white"
            style={{
              fontFamily: "var(--font-cormorant)",
              fontWeight: 500,
              fontSize: number >= 10 ? "3.5rem" : "4.5rem",
              lineHeight: 1,
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
export function AiIntroPanel({ text }: { text: string }) {
  return (
    <div className="rounded-2xl p-6 sm:p-7 border border-[rgba(196,169,122,0.35)] bg-gradient-to-br from-[#C4A97A] to-[#A07F50] text-white shadow-[0_10px_30px_rgba(160,127,80,0.25)]">
      <p
        className="italic"
        style={{
          fontFamily: "var(--font-cormorant)",
          fontSize: "1.15rem",
          lineHeight: 1.6,
          textShadow: "0 1px 2px rgba(80,55,20,0.25)",
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
