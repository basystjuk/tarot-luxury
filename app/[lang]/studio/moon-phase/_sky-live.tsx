"use client";

/**
 * Sky Live Preview (Phase М14).
 *
 * Compact sticky panel that mounts AT THE TOP of the Moon Guide result.
 * Stays visible as the user scrolls through the long result page, so the
 * current Moon state (sign · degree · phase · illumination) is always
 * one glance away.
 *
 * Design constraints:
 *   - Single line on desktop, two-line on mobile
 *   - Updates with the live `result` (the parent already refreshes every
 *     60 s when in "today" mode)
 *   - Visually subdued so it doesn't compete with the main result card
 *
 * The phase glyph + sign + degree mirror what's in the hero badge, but
 * stay glued to the viewport edge.
 */

import { SIGN_GLYPHS } from "@/lib/astro/calculations";

interface Props {
  moonSignIdx: number;
  moonDegree: number;
  illumination: number;
  phaseKey: string;
  phaseName: string;
  phaseEmoji: string;
  language: "uk" | "ru" | "en";
  signNames: string[];
}

const NOW_LABEL = {
  uk: "Зараз у небі",
  ru: "Сейчас в небе",
  en: "The sky right now",
};

const IN = {
  uk: "у",
  ru: "в",
  en: "in",
};

const ILLUM_LABEL = {
  uk: "освітлення",
  ru: "освещение",
  en: "illuminated",
};

export function SkyLivePreview({
  moonSignIdx, moonDegree, illumination, phaseEmoji, phaseName, language, signNames,
}: Props) {
  return (
    <div
      // The class `sticky top-20` keeps the bar below the header (h-20).
      // `z-10` keeps it under any modal but above the card backgrounds.
      className="sticky top-20 z-10 mb-4 bg-[rgba(28,21,18,0.92)] backdrop-blur-md text-white rounded-full px-4 py-2.5 shadow-[0_4px_20px_rgba(0,0,0,0.18)] border border-[rgba(196,169,122,0.25)]"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center justify-between gap-3 text-sm flex-wrap">
        <span className="flex items-center gap-2">
          <span className="text-[10px] text-[#C4A97A] tracking-widest uppercase">
            {NOW_LABEL[language]}
          </span>
        </span>
        <span className="flex items-center gap-3 flex-wrap">
          <span className="flex items-center gap-1.5">
            <span className="text-lg leading-none">{phaseEmoji}</span>
            <span className="text-[#E8C98A] italic" style={{ fontFamily: "var(--font-cormorant)" }}>
              {phaseName}
            </span>
          </span>
          <span className="text-[#9A8A78]">·</span>
          <span className="flex items-center gap-1">
            <span className="text-[#C4A97A]">{IN[language]}</span>
            <span className="text-[#E8C98A]">{SIGN_GLYPHS[moonSignIdx]}</span>
            <span className="text-white">{signNames[moonSignIdx]}</span>
            <span className="text-[#C4A97A] ml-1 tabular-nums">{moonDegree}°</span>
          </span>
          <span className="text-[#9A8A78]">·</span>
          <span className="text-[#E8C98A] tabular-nums">
            {illumination}% <span className="text-[#9A8A78] normal-case ml-1 hidden sm:inline">{ILLUM_LABEL[language]}</span>
          </span>
        </span>
      </div>
    </div>
  );
}
