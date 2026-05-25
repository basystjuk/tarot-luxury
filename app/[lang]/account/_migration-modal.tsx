"use client";

/**
 * One-shot data migration prompt (Bonus 2).
 *
 * On cabinet mount we look at the user's browser localStorage for
 * pre-account data that should now live in their cloud profile:
 *   - tarot history (key: ellen-soul:tarot-history)
 *   - natal data    (key: tarot-luxury:natal)
 *
 * If we find anything, we show a one-time modal: "Found X cards / your
 * natal data in this browser — import?". On confirm we POST to
 * /api/account/import-localstorage and wipe the local copies so the
 * modal doesn't re-appear next session. On dismiss we set a flag so we
 * don't re-prompt for 30 days.
 *
 * The modal NEVER appears on the first sign-up flow if there's nothing
 * to import — silent invisible behaviour by default.
 */

import { useEffect, useState } from "react";
import { Loader2, X, Download } from "lucide-react";

const TAROT_KEY  = "ellen-soul:tarot-history";
const NATAL_KEY  = "tarot-luxury:natal";
const DISMISS_KEY = "ellen-soul:migration-dismissed-at";

interface Detected {
  cards: number;
  natal: boolean;
}

interface NatalShape {
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  lat: number;
  lon: number;
  tz: string;
  natalMoonLon: number;
}

interface HistoryShape {
  day: string;
  cardIndex: number;
  reversed?: boolean;
  question?: string;
  reading?: { meaning: string; advice: string; affirmation: string } | null;
  drawnAt?: string;
}

function readJSON<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch { return null; }
}

const T = {
  uk: {
    title: "Імпортувати дані з браузера?",
    sub: "Ми знайшли в твоєму браузері збережене раніше — імпортуємо в твій акаунт, щоб ти не втратив(ла) їх при зміні пристрою.",
    found_cards: (n: number) => `${n} ${n === 1 ? "карта дня" : n < 5 ? "карти дня" : "карт дня"}`,
    found_natal: "натальний профіль (дата, час, місце народження)",
    cta: "Імпортувати в акаунт",
    later: "Не зараз",
    importing: "Імпортуємо…",
    done_title: "Готово ✨",
    done_text: (cards: number, natal: boolean) => {
      const parts: string[] = [];
      if (cards > 0) parts.push(`Перенесено карт: ${cards}`);
      if (natal) parts.push("Натальний профіль оновлено");
      return parts.length ? parts.join(". ") + "." : "Все вже у твоєму акаунті.";
    },
    error: "Щось пішло не так. Спробуй пізніше — твої дані ще тут.",
  },
  ru: {
    title: "Импортировать данные из браузера?",
    sub: "Мы нашли в твоём браузере сохранённое ранее — импортируем в твой аккаунт, чтобы ты не потерял(а) их при смене устройства.",
    found_cards: (n: number) => `${n} ${n === 1 ? "карта дня" : n < 5 ? "карты дня" : "карт дня"}`,
    found_natal: "натальный профиль (дата, время, место рождения)",
    cta: "Импортировать в аккаунт",
    later: "Не сейчас",
    importing: "Импортируем…",
    done_title: "Готово ✨",
    done_text: (cards: number, natal: boolean) => {
      const parts: string[] = [];
      if (cards > 0) parts.push(`Перенесено карт: ${cards}`);
      if (natal) parts.push("Натальный профиль обновлён");
      return parts.length ? parts.join(". ") + "." : "Всё уже в твоём аккаунте.";
    },
    error: "Что-то пошло не так. Попробуй позже — твои данные ещё здесь.",
  },
  en: {
    title: "Import data from this browser?",
    sub: "We found things you saved here before — let's pull them into your account so you don't lose them when you switch devices.",
    found_cards: (n: number) => `${n} daily card${n === 1 ? "" : "s"}`,
    found_natal: "natal profile (date, time, place of birth)",
    cta: "Import to account",
    later: "Not now",
    importing: "Importing…",
    done_title: "Done ✨",
    done_text: (cards: number, natal: boolean) => {
      const parts: string[] = [];
      if (cards > 0) parts.push(`${cards} cards moved`);
      if (natal) parts.push("natal profile updated");
      return parts.length ? parts.join(", ") + "." : "Everything already in your account.";
    },
    error: "Something went wrong. Try later — your data is still here.",
  },
};

interface Props { language: string; onImported: () => void; }

export function MigrationModal({ language, onImported }: Props) {
  const lang: "uk" | "ru" | "en" = language === "ru" ? "ru" : language === "en" ? "en" : "uk";
  const t = T[lang];

  const [detected, setDetected] = useState<Detected | null>(null);
  const [working, setWorking]   = useState(false);
  const [result, setResult]     = useState<{ cards: number; natal: boolean } | null>(null);
  const [error, setError]       = useState<string | null>(null);

  useEffect(() => {
    // Respect dismissal — re-show only after 30 days.
    try {
      const dismissedAt = window.localStorage.getItem(DISMISS_KEY);
      if (dismissedAt) {
        const ageMs = Date.now() - parseInt(dismissedAt, 10);
        if (ageMs < 30 * 24 * 60 * 60 * 1000) return;
      }
    } catch { /* */ }

    const history = readJSON<HistoryShape[]>(TAROT_KEY) ?? [];
    const natal   = readJSON<NatalShape>(NATAL_KEY);
    const cards = Array.isArray(history) ? history.filter(h => typeof h?.day === "string").length : 0;
    if (cards > 0 || natal) {
      setDetected({ cards, natal: !!natal });
    }
  }, []);

  async function handleImport() {
    if (!detected) return;
    setWorking(true);
    setError(null);
    const history = readJSON<HistoryShape[]>(TAROT_KEY) ?? [];
    const natal   = readJSON<NatalShape>(NATAL_KEY);
    try {
      const res = await fetch("/api/account/import-localstorage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tarot_history: history,
          natal: natal ?? undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(t.error);
        return;
      }
      // Clear local copies — they live in the cloud now.
      try {
        window.localStorage.removeItem(TAROT_KEY);
        window.localStorage.removeItem(NATAL_KEY);
      } catch { /* */ }
      setResult({
        cards: data.tarot_inserted ?? 0,
        natal: data.natal_applied ?? false,
      });
      // Notify parent to refresh profile data.
      setTimeout(() => {
        onImported();
        setDetected(null);
      }, 1800);
    } catch {
      setError(t.error);
    } finally {
      setWorking(false);
    }
  }

  function handleDismiss() {
    try { window.localStorage.setItem(DISMISS_KEY, String(Date.now())); } catch { /* */ }
    setDetected(null);
  }

  if (!detected) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[rgba(28,21,18,0.55)] backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <div className="card-luxury w-full max-w-md relative">
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Close"
          className="absolute top-3 right-3 p-1.5 text-[#9A8A78] hover:text-[#5C4530]"
        >
          <X size={14} />
        </button>

        {result ? (
          <div className="text-center space-y-3 py-4">
            <div className="text-3xl">✨</div>
            <h3 className="text-2xl text-[#1C1512]" style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}>
              {t.done_title}
            </h3>
            <p className="text-sm text-[#5C4530]">{t.done_text(result.cards, result.natal)}</p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D4A853] to-[#C4A97A] flex items-center justify-center text-white">
                <Download size={18} />
              </div>
              <h3 className="text-xl text-[#1C1512]" style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}>
                {t.title}
              </h3>
            </div>

            <p className="text-sm text-[#7A6A58] leading-relaxed mb-4">{t.sub}</p>

            <ul className="space-y-2 mb-5 text-sm text-[#5C4530]">
              {detected.cards > 0 && (
                <li className="flex items-center gap-2"><span className="text-[#B8883A]">🃏</span> {t.found_cards(detected.cards)}</li>
              )}
              {detected.natal && (
                <li className="flex items-center gap-2"><span className="text-[#B8883A]">★</span> {t.found_natal}</li>
              )}
            </ul>

            {error && <p className="text-sm text-[#9A6E28] mb-3">{error}</p>}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleImport}
                disabled={working}
                className="btn-primary disabled:opacity-60"
              >
                {working ? <><Loader2 size={14} className="animate-spin" /> {t.importing}</> : t.cta}
              </button>
              <button
                type="button"
                onClick={handleDismiss}
                disabled={working}
                className="text-sm text-[#7A6A58] hover:text-[#5C4530]"
              >
                {t.later}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
