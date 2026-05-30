"use client";

/**
 * Tag filter strip — single-select chip row above the journal grid.
 *
 * Only renders tags that ACTUALLY appear in the current video set, so the
 * filter never offers an empty bucket. Sorted by frequency (popular first)
 * with "Усі" as the default no-filter pill.
 */

import { THEME_LABELS, type ThemeTag } from "@/lib/youtube/tags";

export default function TagFilter({
  available, active, onChange, lang,
}: {
  available: ThemeTag[];          // tags present in the current set
  active: ThemeTag | null;
  onChange: (t: ThemeTag | null) => void;
  lang: "uk" | "ru" | "en";
}) {
  if (available.length === 0) return null;
  const all = lang === "ru" ? "Все" : lang === "en" ? "All" : "Усі";
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Chip active={active === null} onClick={() => onChange(null)} label={all} />
      {available.map((t) => {
        const meta = THEME_LABELS[t];
        if (!meta) return null;
        return (
          <Chip
            key={t}
            active={active === t}
            onClick={() => onChange(active === t ? null : t)}
            label={`${meta.glyph} ${meta[lang]}`}
          />
        );
      })}
    </div>
  );
}

function Chip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3.5 py-1.5 rounded-full text-xs transition-all border ${
        active
          ? "bg-gradient-to-br from-[#D4A853] to-[#9A6E28] text-white border-transparent shadow-sm"
          : "bg-white/60 text-[#7A6A58] border-[rgba(196,169,122,0.3)] hover:border-[rgba(196,169,122,0.5)] hover:text-[#9A6E28]"
      }`}
    >
      {label}
    </button>
  );
}
