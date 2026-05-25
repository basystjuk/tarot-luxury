"use client";

/**
 * Visual journal of the last 30 days of tarot pulls.
 *
 * Renders a vertical timeline with the card image, name, orientation,
 * question (if any) and the reading. Each entry has a "save as PNG"
 * button so users can persist a meaningful day before the 30-day cap
 * scrolls it off. Future Supabase migration replaces the cap entirely.
 */

import { useEffect, useState } from "react";
import Image from "next/image";
import { ChevronDown, Download, AlertTriangle } from "lucide-react";
import { TAROT_CARDS, getCardName } from "@/lib/data/tarot-cards";
import { listHistory, type HistoryEntry, nearingCap } from "./_history";

interface Props {
  language: string;
  /** Trigger to refresh — bumped by parent when a new card is saved. */
  refreshToken?: number;
  onDownload: (entry: HistoryEntry) => void;
}

const T = {
  uk: {
    title: "Журнал карт",
    sub: "Останні 30 днів. Старіші — пропадають з браузера. Збережи важливі як зображення, щоб залишити з тобою.",
    empty: "Поки що журнал порожній. Витягни першу карту дня — і вона зʼявиться тут.",
    nearCap: "Скоро журнал почне видаляти старіші записи. Збережи важливі тобі дні.",
    download: "Зберегти PNG",
    reversed: "перевернута",
    expand: "Розкрити",
    question: "Питання",
    of: "з",
  },
  ru: {
    title: "Журнал карт",
    sub: "Последние 30 дней. Старые — исчезают из браузера. Сохрани важные как изображение, чтобы оставить с собой.",
    empty: "Пока журнал пуст. Вытяни первую карту дня — и она появится здесь.",
    nearCap: "Скоро журнал начнёт удалять старые записи. Сохрани важные тебе дни.",
    download: "Скачать PNG",
    reversed: "перевёрнута",
    expand: "Раскрыть",
    question: "Вопрос",
    of: "из",
  },
  en: {
    title: "Card journal",
    sub: "The last 30 days. Older ones disappear from your browser. Save the meaningful ones as images so they stay with you.",
    empty: "The journal is empty for now. Pull your first card of the day — it will appear here.",
    nearCap: "The journal will soon start removing older entries. Save the days that matter to you.",
    download: "Save PNG",
    reversed: "reversed",
    expand: "Open",
    question: "Question",
    of: "of",
  },
};

function fmtDay(day: string, lang: "uk" | "ru" | "en"): string {
  // day is YYYY-MM-DD
  try {
    const [y, m, d] = day.split("-").map(n => parseInt(n, 10));
    const date = new Date(Date.UTC(y, m - 1, d));
    return date.toLocaleDateString(
      lang === "ru" ? "ru-RU" : lang === "en" ? "en-US" : "uk-UA",
      { weekday: "short", day: "numeric", month: "long", year: "numeric" }
    );
  } catch {
    return day;
  }
}

export function HistoryView({ language, refreshToken, onDownload }: Props) {
  const lang: "uk" | "ru" | "en" = language === "ru" ? "ru" : language === "en" ? "en" : "uk";
  const t = T[lang];

  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [cap, setCap] = useState({ count: 0, cap: 30 });
  const [openDay, setOpenDay] = useState<string | null>(null);

  useEffect(() => {
    setEntries(listHistory());
    setCap(nearingCap());
  }, [refreshToken]);

  if (entries.length === 0) {
    return (
      <div className="card-luxury text-center">
        <div className="text-3xl mb-3">📖</div>
        <h3
          className="text-xl text-[#1C1512] mb-2"
          style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}
        >
          {t.title}
        </h3>
        <p className="text-sm text-[#7A6A58] leading-relaxed max-w-md mx-auto">{t.empty}</p>
      </div>
    );
  }

  const nearWarn = cap.count >= Math.floor(cap.cap * 0.8); // 80% threshold

  return (
    <div className="card-luxury">
      <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
        <div>
          <p className="text-[10px] text-[#C4A97A] tracking-widest uppercase">
            {cap.count} / {cap.cap}
          </p>
          <h3 className="text-xl text-[#1C1512]" style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}>
            {t.title}
          </h3>
        </div>
      </div>

      <p className="text-xs text-[#7A6A58] mb-4 leading-relaxed">{t.sub}</p>

      {nearWarn && (
        <div className="flex items-start gap-2 p-3 mb-4 rounded-xl bg-[rgba(184,136,58,0.08)] border border-[rgba(184,136,58,0.3)]">
          <AlertTriangle size={16} className="text-[#B8883A] flex-shrink-0 mt-0.5" />
          <p className="text-xs text-[#9A6E28] leading-relaxed">{t.nearCap}</p>
        </div>
      )}

      <ul className="space-y-3">
        {entries.map(entry => {
          const card = TAROT_CARDS[entry.cardIndex];
          if (!card) return null;
          const isOpen = openDay === entry.day;
          return (
            <li key={entry.day} className="rounded-xl border border-[rgba(196,169,122,0.2)] bg-white/40 overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenDay(o => o === entry.day ? null : entry.day)}
                className="w-full flex items-center gap-3 p-3 text-left hover:bg-[rgba(196,169,122,0.05)] transition-colors"
              >
                <div
                  className="flex-shrink-0 rounded-lg overflow-hidden border border-[#C4A97A]/30"
                  style={{ width: 48, height: 84, background: "#F5F0E8", transform: entry.reversed ? "rotate(180deg)" : "none" }}
                >
                  <Image src={card.image} alt={card.nameEn} width={48} height={84} className="object-contain" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-[#9A8A78] tracking-widest uppercase">
                    {fmtDay(entry.day, lang)}
                  </p>
                  <p className="text-sm text-[#1C1512] truncate" style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}>
                    {getCardName(card, language)}{entry.reversed && (
                      <span className="ml-2 text-[10px] text-[#B8883A] italic tracking-wide uppercase">({t.reversed})</span>
                    )}
                  </p>
                  {entry.question && (
                    <p className="text-xs text-[#7A6A58] italic truncate mt-0.5">
                      &ldquo;{entry.question}&rdquo;
                    </p>
                  )}
                </div>
                <ChevronDown
                  size={16}
                  className={`text-[#C4A97A] transition-transform flex-shrink-0 ${isOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isOpen && (
                <div className="border-t border-[rgba(196,169,122,0.15)] p-4 space-y-3 bg-[rgba(196,169,122,0.04)]">
                  {entry.reading ? (
                    <>
                      <p className="text-sm text-[#5C4530] leading-relaxed">{entry.reading.meaning}</p>
                      {entry.reading.advice && (
                        <p className="text-sm text-[#5C4530] leading-relaxed">{entry.reading.advice}</p>
                      )}
                      {entry.reading.affirmation && (
                        <p className="text-sm italic text-[#B8883A] leading-relaxed" style={{ fontFamily: "var(--font-cormorant)" }}>
                          &ldquo;{entry.reading.affirmation}&rdquo;
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-xs text-[#9A8A78] italic">
                      {lang === "ru" ? "Послание не было получено этот день." : lang === "en" ? "No reading was generated that day." : "Послання не було отримано того дня."}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={() => onDownload(entry)}
                    className="inline-flex items-center gap-1.5 text-xs text-[#B8883A] hover:text-[#7A6A58]"
                  >
                    <Download size={12} /> {t.download}
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
