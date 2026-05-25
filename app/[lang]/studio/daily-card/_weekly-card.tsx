"use client";

/**
 * Weekly Card — fresh draw every Monday 00:00 Kyiv time.
 *
 * Separate daily/quota from the Card of the Day: weekly has its own
 * localStorage slot, its own AI call (currently piggy-backs on the
 * tarot-reading endpoint but with `usageContext="weekly"` so the prompt
 * can subtly shift voice — implemented in next iteration).
 *
 * Phase A scope: secure shuffle + reversed + canonical meaning. Reading
 * text falls back to the canonical psychology+advice fields so the
 * weekly block is useful without an extra AI quota burn — the user can
 * always tap "Get reading" to spend a separate (future) weekly quota.
 */

import { useEffect, useState } from "react";
import Image from "next/image";
import { TAROT_CARDS, getCardName, drawCard } from "@/lib/data/tarot-cards";
import { getMeaning } from "@/lib/data/tarot-meanings";
import { track } from "@/lib/analytics/posthog";

const STORAGE_KEY = "ellen-soul:weekly-card";

interface WeeklyDraw {
  weekStart: string;   // YYYY-MM-DD of Monday in Kyiv tz
  cardIndex: number;
  reversed: boolean;
}

/** Monday of the current Kyiv-week as YYYY-MM-DD. */
function kyivMondayKey(): string {
  // Get Kyiv "now" as a Date in local tz (we use the day-of-week math, no DST tricks needed)
  const fmt = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Kiev", year: "numeric", month: "2-digit", day: "2-digit", weekday: "short",
  });
  const parts = fmt.formatToParts(new Date());
  const y = parseInt(parts.find(p => p.type === "year")?.value ?? "2000", 10);
  const m = parseInt(parts.find(p => p.type === "month")?.value ?? "1", 10);
  const d = parseInt(parts.find(p => p.type === "day")?.value ?? "1", 10);
  // weekday in `sv-SE` short is "mån", "tis", … not reliable cross-browser, so compute via Date math:
  const base = new Date(Date.UTC(y, m - 1, d));
  const dow = base.getUTCDay(); // 0=Sun..6=Sat
  const offsetToMonday = (dow + 6) % 7; // days since Monday
  base.setUTCDate(base.getUTCDate() - offsetToMonday);
  return base.toISOString().slice(0, 10);
}

function loadDraw(): WeeklyDraw | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as WeeklyDraw;
    if (parsed.weekStart !== kyivMondayKey()) return null;
    if (parsed.cardIndex < 0 || parsed.cardIndex > 77) return null;
    return parsed;
  } catch {
    return null;
  }
}

function saveDraw(draw: WeeklyDraw): void {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draw)); } catch { /* */ }
}

interface Props {
  language: string;
}

const T = {
  uk: {
    title: "Карта тижня",
    sub: "Тема, що супроводжуватиме твій тиждень. Оновлюється щопонеділка о 00:00 за Києвом.",
    pull: "Витягнути карту тижня",
    reversed: "перевернута",
    week_of: "Тиждень із",
    meaning: "Тема тижня",
    advice: "Що тримати у фокусі",
  },
  ru: {
    title: "Карта недели",
    sub: "Тема, что будет сопровождать твою неделю. Обновляется каждый понедельник в 00:00 по Киеву.",
    pull: "Вытянуть карту недели",
    reversed: "перевёрнута",
    week_of: "Неделя с",
    meaning: "Тема недели",
    advice: "Что держать в фокусе",
  },
  en: {
    title: "Card of the Week",
    sub: "The theme accompanying your week. Refreshes every Monday at 00:00 Kyiv time.",
    pull: "Pull the week's card",
    reversed: "reversed",
    week_of: "Week of",
    meaning: "This week's theme",
    advice: "What to hold in focus",
  },
};

export function WeeklyCard({ language }: Props) {
  const lang: "uk" | "ru" | "en" = language === "ru" ? "ru" : language === "en" ? "en" : "uk";
  const t = T[lang];
  const [draw, setDraw] = useState<WeeklyDraw | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setDraw(loadDraw());
  }, []);

  const handlePull = () => {
    const picked = drawCard(true);
    const next: WeeklyDraw = {
      weekStart: kyivMondayKey(),
      cardIndex: picked.card.index,
      reversed: picked.reversed,
    };
    saveDraw(next);
    setDraw(next);
    track("daily_card_weekly_drawn", {
      arcana: picked.card.suit === "major" ? "major" : "minor",
      suit: picked.card.suit,
      reversed: picked.reversed,
    });
  };

  if (!mounted) return null; // avoid SSR mismatch

  if (!draw) {
    return (
      <div className="card-luxury text-center">
        <div className="text-3xl mb-3">📅</div>
        <h3
          className="text-xl text-[#1C1512] mb-2"
          style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}
        >
          {t.title}
        </h3>
        <p className="text-sm text-[#7A6A58] leading-relaxed mb-5 max-w-md mx-auto">{t.sub}</p>
        <button type="button" onClick={handlePull} className="btn-primary mx-auto">
          ✦ {t.pull}
        </button>
      </div>
    );
  }

  const card = TAROT_CARDS[draw.cardIndex];
  const canon = getMeaning(card.nameEn);
  const facet = canon ? canon[draw.reversed ? "reversed" : "upright"] : null;

  return (
    <div className="card-luxury">
      <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
        <div>
          <p className="text-[10px] text-[#C4A97A] tracking-widest uppercase">
            {t.week_of} {draw.weekStart}
          </p>
          <h3 className="text-xl text-[#1C1512]" style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}>
            {t.title}
          </h3>
        </div>
      </div>

      <div className="flex items-start gap-4 flex-wrap sm:flex-nowrap">
        <div
          className="flex-shrink-0 rounded-xl overflow-hidden border-2 border-[#C4A97A]"
          style={{ width: 120, height: 210, background: "#F5F0E8", transform: draw.reversed ? "rotate(180deg)" : "none" }}
        >
          <Image src={card.image} alt={card.nameEn} width={120} height={210} className="object-contain" priority />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-base text-[#B8883A]" style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}>
            {getCardName(card, language)}
            {draw.reversed && (
              <span className="ml-2 text-[10px] text-[#7A6A58] italic tracking-wide uppercase">({t.reversed})</span>
            )}
          </p>

          {facet && (
            <div className="mt-3 space-y-2">
              <div>
                <p className="text-[10px] text-[#C4A97A] tracking-widest uppercase mb-1">{t.meaning}</p>
                <p className="text-sm text-[#5C4530] leading-relaxed italic" style={{ fontFamily: "var(--font-cormorant)" }}>
                  {facet.core}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-[#C4A97A] tracking-widest uppercase mb-1">{t.advice}</p>
                <p className="text-sm text-[#5C4530] leading-relaxed">{facet.advice}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
