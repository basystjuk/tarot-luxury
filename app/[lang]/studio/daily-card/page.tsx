"use client";

/**
 * Daily Card — full Phase A overhaul.
 *
 * What changed from the previous version:
 *   1. Cryptographically-secure draw (`drawCard()` via crypto.getRandomValues).
 *   2. Reversed cards — 50% probability when the toggle is on (default).
 *   3. Optional "What troubles you?" question, woven into the AI reading.
 *   4. Canonical RWS meanings (lib/data/tarot-meanings.ts) drive both AI
 *      context and the local-only fallback when the user is rate-limited.
 *   5. "Already opened today" state shows the full reading as a festive
 *      moment, not an error.
 *   6. "Ask for clarification" — second AI pass on the same card (separate
 *      daily quota). Replaces a "new card" button which would have broken
 *      the one-card-per-day ritual.
 *   7. Arcana / suit-element explanation block under the card.
 *   8. Local journal of the last 30 days with prune warning + per-day PNG.
 *   9. Card of the Week block (Monday 00:00 Kyiv).
 *  10. PNG share of today's reading.
 */

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { Sparkles, Download, Share2, HelpCircle } from "lucide-react";
import AnimatedSection from "@/components/ui/AnimatedSection";
import GoldDivider from "@/components/ui/GoldDivider";
import { useLanguage } from "@/hooks/useLanguage";
import { TAROT_CARDS, getCardName, drawCard } from "@/lib/data/tarot-cards";
import { getMeaning } from "@/lib/data/tarot-meanings";
import { ArcanaInfo } from "./_arcana-info";
import { HistoryView } from "./_history-view";
import { WeeklyCard } from "./_weekly-card";
import {
  getKyivDay, getEntry, saveEntry, type HistoryEntry,
} from "./_history";
import { shareElementAsPng } from "@/lib/share/png-share";
import { track } from "@/lib/analytics/posthog";

type Step = "form" | "breathing" | "reading" | "result";

const RITUAL_MS = 3000;
const CARD_W  = 200;
const CARD_H  = 352;
const FLIP_MS = 800;

interface Reading {
  meaning: string;
  advice: string;
  affirmation: string;
}

/** Track separately whether we've consumed today's clarify quota client-side. */
function clarifyKey(day: string): string {
  return `ellen-soul:tarot-clarify:${day}`;
}

export default function DailyCardPage() {
  const { language } = useLanguage();
  const isRu = language === "ru";
  const isEn = language === "en";
  const lang: "uk" | "ru" | "en" = isRu ? "ru" : isEn ? "en" : "uk";

  // ── Form state ───────────────────────────────────────────────────────────
  const [step, setStep]               = useState<Step>("form");
  const [flipped, setFlipped]         = useState(false);
  const [reading, setReading]         = useState<Reading | null>(null);
  const [netError, setNetError]       = useState(false);
  const [rateLimited, setRateLimited] = useState(false);
  const [question, setQuestion]       = useState("");
  const [withReversed, setWithReversed] = useState(true);
  const [reversed, setReversed]       = useState(false);

  // Today's card lives in a ref so the closure inside the flip animation
  // doesn't lose it between renders.
  const chosenCardRef = useRef<typeof TAROT_CARDS[0] | null>(null);

  // ── Clarify state ────────────────────────────────────────────────────────
  const [clarifyOpen, setClarifyOpen]       = useState(false);
  const [clarifyText, setClarifyText]       = useState("");
  const [clarifyResult, setClarifyResult]   = useState("");
  const [clarifyLoading, setClarifyLoading] = useState(false);
  const [clarifyError, setClarifyError]     = useState("");
  const [clarifyUsed, setClarifyUsed]       = useState(false);

  // History refresh counter — bump after a new save so the HistoryView reloads.
  const [historyRefresh, setHistoryRefresh] = useState(0);

  // Result ref — used both for scroll-to-result and PNG share.
  const resultRef = useRef<HTMLDivElement>(null);

  // ── Mount: restore today's entry if any ──────────────────────────────────
  useEffect(() => {
    track("tool_viewed", { tool: "daily-card" });
    const day = getKyivDay();
    const entry = getEntry(day);
    if (entry) {
      chosenCardRef.current = TAROT_CARDS[entry.cardIndex];
      setReversed(entry.reversed);
      setQuestion(entry.question ?? "");
      if (entry.reading) setReading(entry.reading);
      else setRateLimited(true);
      setFlipped(true);
      setStep("result");
    }
    // Clarify quota — restore from per-day key
    try {
      setClarifyUsed(window.localStorage.getItem(clarifyKey(day)) === "1");
    } catch { /* */ }
  }, []);

  // ── i18n helper ──────────────────────────────────────────────────────────
  function t(key: string): string {
    const dict: Record<string, [string, string, string]> = {
      tag:        ["Таро", "Таро", "Tarot"],
      title:      ["Карта дня", "Карта дня", "Card of the Day"],
      subtitle:   ["Персональне передбачення", "Персональное предсказание", "Your Personal Reading"],
      hint:       ["Зосередься на питанні, зроби вдих — і відкрий карту",
                   "Сосредоточься на вопросе, сделай вдох — и открой карту",
                   "Focus on your question, breathe — and reveal the card"],
      breath:     ["Зроби глибокий вдих… Подумай про своє питання…",
                   "Сделай глубокий вдох… Подумай о своём вопросе…",
                   "Take a deep breath… Hold your question in your heart…"],
      reveal:     ["Відкрити карту дня", "Открыть карту дня", "Reveal my card"],
      loading:    ["Зірки читають твою карту…", "Звёзды читают твою карту…", "The stars are reading your card…"],
      meanLbl:    ["Значення", "Значение", "Meaning"],
      adviceLbl:  ["Порада", "Совет", "Advice"],
      affLbl:     ["Афірмація", "Аффирмация", "Affirmation"],
      tomorrow:   ["Нова карта відкриється для тебе вже завтра ✨",
                   "Новая карта откроется для тебя уже завтра ✨",
                   "A new card opens for you tomorrow ✨"],
      rateLimit:  ["Твоя карта на сьогодні вже відкрита.", "Твоя карта на сегодня уже открыта.", "Your card for today is already open."],
      qLabel:     ["Що тебе турбує? (опційно)", "Что тебя беспокоит? (опционально)", "What troubles you? (optional)"],
      qPh:        ["Сформулюй питання — або залиш порожнім для загального читання",
                   "Сформулируй вопрос — или оставь пустым для общего чтения",
                   "Frame the question — or leave blank for a general reading"],
      reversedLbl:["Враховувати перевернуті карти", "Учитывать перевёрнутые карты", "Include reversed cards"],
      reversedHint:["У класичному RWS 50% карт випадає перевернутими — це інша грань значення.",
                    "В классическом RWS 50% карт выпадает перевёрнутыми — это другая грань значения.",
                    "In classical RWS 50% of cards land reversed — that's another facet of meaning."],
      reversedTag:["перевернута", "перевёрнута", "reversed"],
      clarify:    ["Запитати уточнення", "Спросить уточнение", "Ask for clarification"],
      clarifyPh:  ["Що саме хочеш зрозуміти глибше?",
                   "Что именно хочешь понять глубже?",
                   "What do you want to understand more deeply?"],
      clarifySend:["Отримати відповідь", "Получить ответ", "Get the answer"],
      clarifyUsed:["Сьогодні ти вже отримав/-ла уточнення. Повертайся завтра ✨",
                   "Сегодня ты уже получил/-а уточнение. Возвращайся завтра ✨",
                   "You've already asked for a clarification today. Come back tomorrow ✨"],
      clarifyErr: ["Не вдалось отримати уточнення. Спробуй пізніше.",
                   "Не удалось получить уточнение. Попробуй позже.",
                   "Could not get the clarification. Try again later."],
      sharePng:   ["Зберегти як зображення", "Сохранить как изображение", "Save as image"],
      shareDone:  ["Готово ✨", "Готово ✨", "Done ✨"],
      shareErr:   ["Не вдалось зберегти", "Не удалось сохранить", "Could not save"],
      yourQ:      ["Твоє питання", "Твой вопрос", "Your question"],
    };
    const row = dict[key] ?? ["", "", ""];
    return isRu ? row[1] : isEn ? row[2] : row[0];
  }

  // ── Scroll the result into view after a flip. ───────────────────────────
  const scrollToResult = useCallback(() => {
    requestAnimationFrame(() => {
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, []);

  // ── Main draw + AI fetch flow ───────────────────────────────────────────
  async function handleReveal() {
    const day = getKyivDay();
    // If we already have a card today (from the restore-on-mount path), reuse it.
    // Otherwise, draw fresh.
    let card = chosenCardRef.current;
    let cardReversed = reversed;
    const isFreshDraw = !card;
    if (!card) {
      const drawn = drawCard(withReversed);
      card = drawn.card;
      cardReversed = drawn.reversed;
      chosenCardRef.current = card;
      setReversed(cardReversed);
    }
    setNetError(false);
    // Analytics: only count a real first-of-day draw, not the restored re-reveal.
    if (isFreshDraw) {
      track("daily_card_drawn", {
        arcana: card.suit === "major" ? "major" : "minor",
        suit: card.suit,
        reversed: cardReversed,
        has_question: question.trim().length > 0,
      });
    }

    const arcanaType = card.suit === "major" ? "major" : "minor";
    const suitElement =
      card.suit === "wands" ? "Fire" :
      card.suit === "cups" ? "Water" :
      card.suit === "swords" ? "Air" :
      card.suit === "pentacles" ? "Earth" : "";

    // Skip the ritual on retry — user is already in flow.
    const isRetry = flipped;
    if (!isRetry) {
      setStep("breathing");
      await new Promise<void>(r => setTimeout(r, RITUAL_MS));
    }

    const trimmedQ = question.trim();
    const fetchPromise = fetch("/api/tarot-reading", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cardName: card.nameEn,
        language,
        arcanaType,
        suitElement,
        reversed: cardReversed,
        userQuestion: trimmedQ,
      }),
    });

    if (!flipped) {
      setFlipped(true);
      await new Promise<void>(r => setTimeout(r, FLIP_MS / 2));
    }
    setStep("reading");

    try {
      const res = await fetchPromise;
      if (res.status === 429) {
        // Save the card anyway — rate-limited means we drew it, just can't AI-interpret today.
        const entry: HistoryEntry = {
          day, cardIndex: card.index, reversed: cardReversed,
          question: trimmedQ || undefined, reading: null, drawnAt: new Date().toISOString(),
        };
        saveEntry(entry);
        setHistoryRefresh(n => n + 1);
        setRateLimited(true);
        setStep("result");
        scrollToResult();
        return;
      }
      const data: Reading = await res.json();
      setReading(data);
      const entry: HistoryEntry = {
        day, cardIndex: card.index, reversed: cardReversed,
        question: trimmedQ || undefined, reading: data, drawnAt: new Date().toISOString(),
      };
      saveEntry(entry);
      setHistoryRefresh(n => n + 1);
    } catch {
      setNetError(true);
    }
    setStep("result");
    scrollToResult();
  }

  // ── Clarification flow ───────────────────────────────────────────────────
  async function handleClarify() {
    const card = chosenCardRef.current;
    if (!card || !reading) return;
    if (!clarifyText.trim()) return;
    setClarifyLoading(true);
    setClarifyError("");
    try {
      const res = await fetch("/api/tarot-clarify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cardName: card.nameEn,
          language,
          reversed,
          previousReading: `${reading.meaning}\n\n${reading.advice}\n\n${reading.affirmation}`.trim(),
          userQuestion: clarifyText.trim(),
        }),
      });
      if (res.status === 401) {
        // Anonymous → Phase В gate. Redirect through sign-in with `next` so
        // we land back on this card after authenticating.
        const next = encodeURIComponent(`/${language}/studio/daily-card`);
        window.location.href = `/${language}/account/sign-in?next=${next}`;
        return;
      }
      if (res.status === 429) {
        setClarifyUsed(true);
        setClarifyError(t("clarifyUsed"));
      } else if (!res.ok) {
        setClarifyError(t("clarifyErr"));
      } else {
        const data = await res.json();
        if (data.error) {
          setClarifyError(t("clarifyErr"));
        } else {
          setClarifyResult(data.clarification ?? "");
          setClarifyUsed(true);
          try { window.localStorage.setItem(clarifyKey(getKyivDay()), "1"); } catch { /* */ }
          if (card) {
            track("daily_card_clarify_used", {
              arcana: card.suit === "major" ? "major" : "minor",
              suit: card.suit,
              reversed,
            });
          }
        }
      }
    } catch {
      setClarifyError(t("clarifyErr"));
    } finally {
      setClarifyLoading(false);
    }
  }

  // ── PNG share ────────────────────────────────────────────────────────────
  const [shareStatus, setShareStatus] = useState<"idle" | "saving" | "done" | "error">("idle");
  async function handleShare() {
    if (!resultRef.current) return;
    setShareStatus("saving");
    try {
      const day = getKyivDay();
      await shareElementAsPng(resultRef.current, { filename: `ellen-soul-card-${day}`, scale: 2 });
      setShareStatus("done");
      track("daily_card_pdf_shared", { from: "current" });
      setTimeout(() => setShareStatus("idle"), 2400);
    } catch (e) {
      console.error("share error:", e);
      setShareStatus("error");
      setTimeout(() => setShareStatus("idle"), 2400);
    }
  }

  /** Per-history-entry download — used by HistoryView. */
  const handleHistoryDownload = useCallback(async (entry: HistoryEntry) => {
    // Render a temporary off-screen capture frame for the chosen entry.
    const card = TAROT_CARDS[entry.cardIndex];
    const frame = document.createElement("div");
    frame.style.cssText = "position:fixed; left:-9999px; top:0; width:480px; padding:32px; background:#FDFBF7; font-family:var(--font-cormorant), serif; color:#1C1512;";
    frame.innerHTML = `
      <div style="text-align:center">
        <p style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#C4A97A">${entry.day}</p>
        <h2 style="font-size:28px;margin:8px 0 16px;color:#1C1512;font-weight:500">${getCardName(card, language)}${entry.reversed ? ` <span style='font-size:14px;color:#7A6A58;font-style:italic'>(${t("reversedTag")})</span>` : ""}</h2>
        ${entry.question ? `<p style="font-style:italic;color:#7A6A58;font-size:14px;margin-bottom:12px">"${entry.question}"</p>` : ""}
      </div>
      ${entry.reading ? `
        <div style="margin-top:16px;padding:16px;border:1px solid rgba(196,169,122,0.3);border-radius:12px;background:rgba(196,169,122,0.06)">
          <p style="color:#5C4530;font-size:14px;line-height:1.6;font-family:system-ui,sans-serif">${entry.reading.meaning}</p>
          ${entry.reading.advice ? `<p style="color:#5C4530;font-size:14px;line-height:1.6;margin-top:12px;font-family:system-ui,sans-serif">${entry.reading.advice}</p>` : ""}
          ${entry.reading.affirmation ? `<p style="color:#B8883A;font-size:16px;line-height:1.6;margin-top:14px;font-style:italic">"${entry.reading.affirmation}"</p>` : ""}
        </div>
      ` : ""}
      <p style="text-align:center;margin-top:18px;color:#C4A97A;font-size:10px;letter-spacing:0.2em;text-transform:uppercase">Ellen Soul · ellen-soul.com</p>
    `;
    document.body.appendChild(frame);
    try {
      await shareElementAsPng(frame, { filename: `ellen-soul-card-${entry.day}`, scale: 2 });
    } catch (e) { console.error("history download error:", e); }
    document.body.removeChild(frame);
  }, [language]);

  // ── Render helpers ───────────────────────────────────────────────────────
  const card = chosenCardRef.current;
  const canon = card ? getMeaning(card.nameEn) : null;
  const canonFacet = canon ? canon[reversed ? "reversed" : "upright"] : null;

  const flipCard = (
    <div style={{ perspective: "1200px", width: CARD_W, flexShrink: 0 }}>
      <div
        style={{
          position: "relative",
          width: CARD_W, height: CARD_H,
          transformStyle: "preserve-3d",
          transition: `transform ${FLIP_MS}ms cubic-bezier(0.4,0,0.2,1)`,
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* Back face */}
        <div
          style={{
            position: "absolute", inset: 0,
            borderRadius: 16, overflow: "hidden",
            border: "4px solid #C4A97A",
            boxShadow: "0 20px 60px rgba(0,0,0,0.28), 0 0 0 1px rgba(196,169,122,0.18)",
            backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden",
          }}
        >
          <div style={{
            width: "100%", height: "100%",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between",
            padding: "24px 16px",
            background: "linear-gradient(160deg,#4A2E08 0%,#7A5018 20%,#C4A250 50%,#7A5018 80%,#4A2E08 100%)",
          }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, width: "100%" }}>
              <div style={{ width: "76%", borderTop: "2px solid rgba(255,238,180,0.65)" }} />
              <div style={{ width: "52%", borderTop: "1px solid rgba(255,238,180,0.4)" }} />
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{
                width: 64, height: 64, borderRadius: "50%",
                background: "rgba(0,0,0,0.18)", border: "2px solid rgba(255,238,180,0.55)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 14px",
              }}>
                <span style={{ color: "#FFF8E7", fontSize: 30 }}>✦</span>
              </div>
              <p style={{ color: "rgba(255,240,190,0.88)", fontSize: 9, letterSpacing: "0.32em", textTransform: "uppercase", fontWeight: 500 }}>
                Ellen Soul
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, width: "100%" }}>
              <div style={{ width: "52%", borderBottom: "1px solid rgba(255,238,180,0.4)" }} />
              <div style={{ width: "76%", borderBottom: "2px solid rgba(255,238,180,0.65)" }} />
            </div>
          </div>
        </div>

        {/* Front face — rotated 180° if drawn reversed */}
        {card && (
          <div
            style={{
              position: "absolute", inset: 0,
              borderRadius: 16, overflow: "hidden",
              border: "4px solid #C4A97A",
              boxShadow: "0 20px 60px rgba(0,0,0,0.32)",
              backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              background: "#F5F0E8",
            }}
          >
            <div style={{
              width: "100%", height: "100%",
              transform: reversed ? "rotate(180deg)" : "none",
              transition: "transform 600ms ease",
            }}>
              <Image src={card.image} alt={card.nameEn} fill className="object-contain" sizes="200px" priority />
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <section className="pt-36 pb-16 bg-[#FDFBF7] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(196,169,122,0.1),transparent)]" />
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <AnimatedSection>
            <span className="tag mb-6 inline-block">{t("tag")}</span>
            <h1
              className="text-[clamp(2.5rem,5vw,4.5rem)] text-[#1C1512] mb-4 leading-[1.06]"
              style={{ fontFamily: "var(--font-cormorant)", fontWeight: 400 }}
            >
              {t("title")}
            </h1>
            <p className="text-[#C4A97A] tracking-wide text-lg">{t("subtitle")}</p>
          </AnimatedSection>
        </div>
      </section>

      <GoldDivider />

      <section className="section-padding bg-[#FDFBF7]">
        <div className="max-w-3xl mx-auto px-6">
          <div className="flex flex-col items-center gap-8">

            {/* ── Form (pre-flip) ── */}
            {step === "form" && (
              <AnimatedSection>
                <div className="card-luxury w-full max-w-xl mx-auto space-y-5">
                  <p className="text-[#7A6A58] text-sm text-center tracking-wide italic">{t("hint")}</p>

                  <div>
                    <label className="block text-xs text-[#B8883A] tracking-widest uppercase mb-2">
                      {t("qLabel")}
                    </label>
                    <textarea
                      value={question}
                      onChange={e => setQuestion(e.target.value.slice(0, 240))}
                      placeholder={t("qPh")}
                      rows={2}
                      className="input-luxury w-full resize-none"
                      maxLength={240}
                    />
                  </div>

                  <div className="flex items-start justify-between gap-3 pt-1">
                    <div className="flex-1 min-w-0">
                      <label htmlFor="withReversed" className="text-sm text-[#5C4530] cursor-pointer block">
                        {t("reversedLbl")}
                      </label>
                      <p className="text-[11px] text-[#9A8A78] italic leading-snug mt-1">{t("reversedHint")}</p>
                    </div>
                    <button
                      type="button"
                      id="withReversed"
                      onClick={() => setWithReversed(v => !v)}
                      aria-pressed={withReversed}
                      className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${withReversed ? "bg-[#B8883A]" : "bg-[rgba(196,169,122,0.3)]"}`}
                    >
                      <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${withReversed ? "translate-x-5" : ""}`} />
                    </button>
                  </div>
                </div>
              </AnimatedSection>
            )}

            {/* ── Breathing pause ── */}
            {step === "breathing" && (
              <div className="flex flex-col items-center gap-5 px-4 text-center daily-card-breath">
                <div className="daily-card-breath-orb" aria-hidden="true">
                  <span className="daily-card-breath-orb-glyph">✦</span>
                </div>
                <p
                  className="text-[#7A6A58] italic max-w-sm tracking-wide"
                  style={{ fontFamily: "var(--font-cormorant)", fontSize: "1.15rem", lineHeight: 1.55 }}
                >
                  {t("breath")}
                </p>
              </div>
            )}

            {/* ── Card visual ── */}
            {flipCard}

            {/* ── Card name + reversed tag ── */}
            {card && step !== "form" && (
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-3 px-6 py-2.5 rounded-full" style={{ border: "1.5px solid #C4A97A" }}>
                  <span className="text-[#C4A97A] text-xs">✦</span>
                  <p className="text-[#1C1512] text-xs tracking-[0.18em] uppercase font-medium">{getCardName(card, language)}</p>
                  <span className="text-[#C4A97A] text-xs">✦</span>
                </div>
                {reversed && (
                  <p className="text-[10px] text-[#B8883A] italic tracking-[0.2em] uppercase">
                    ({t("reversedTag")})
                  </p>
                )}
              </div>
            )}

            {/* ── Reveal button ── */}
            {step === "form" && (
              <button type="button" onClick={handleReveal} className="btn-primary justify-center">
                <Sparkles size={16} />
                {t("reveal")}
              </button>
            )}

            {/* ── Loading ── */}
            {step === "reading" && (
              <div className="flex items-center gap-3 text-[#B8883A]">
                <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                </svg>
                <p className="text-sm italic">{t("loading")}</p>
              </div>
            )}

            {/* ── Result ── */}
            {step === "result" && card && (
              <div ref={resultRef} className="w-full flex flex-col items-center gap-6 scroll-mt-24">
                <ArcanaInfo card={card} language={language} />

                {/* User's question, echoed back as part of the moment */}
                {question.trim() && (
                  <div className="w-full max-w-xl mx-auto p-4 rounded-xl bg-[rgba(196,169,122,0.06)] border border-[rgba(196,169,122,0.18)] text-center">
                    <p className="text-[10px] text-[#C4A97A] tracking-widest uppercase mb-1">{t("yourQ")}</p>
                    <p className="text-sm italic text-[#5C4530] leading-relaxed" style={{ fontFamily: "var(--font-cormorant)" }}>
                      &ldquo;{question.trim()}&rdquo;
                    </p>
                  </div>
                )}

                {reading ? (
                  <>
                    <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-5">
                      <div className="p-6 rounded-2xl bg-[rgba(196,169,122,0.08)] border border-[rgba(196,169,122,0.15)]">
                        <p className="text-[11px] text-[#C4A97A] tracking-widest uppercase mb-4 text-center underline underline-offset-4">{t("meanLbl")}</p>
                        <p className="text-[#5C4530] text-sm leading-relaxed">{reading.meaning}</p>
                      </div>
                      {reading.advice && (
                        <div className="p-6 rounded-2xl bg-[rgba(196,169,122,0.05)] border border-[rgba(196,169,122,0.12)]">
                          <p className="text-[11px] text-[#C4A97A] tracking-widest uppercase mb-4 text-center underline underline-offset-4">{t("adviceLbl")}</p>
                          <p className="text-[#5C4530] text-sm leading-relaxed">{reading.advice}</p>
                        </div>
                      )}
                      {reading.affirmation && (
                        <div className="p-6 rounded-2xl border" style={{ background: "linear-gradient(135deg, #F2DCD0 0%, #E8C7B9 100%)", borderColor: "rgba(196,150,135,0.4)" }}>
                          <p className="text-[11px] tracking-widest uppercase mb-4 text-center underline underline-offset-4" style={{ color: "#7A4636" }}>{t("affLbl")}</p>
                          <p className="italic" style={{ fontFamily: "var(--font-cormorant)", fontSize: "1.05rem", lineHeight: 1.6, color: "#3A2418" }}>
                            &ldquo;{reading.affirmation}&rdquo;
                          </p>
                        </div>
                      )}
                    </div>
                  </>
                ) : rateLimited && canonFacet ? (
                  // Festive "already opened today" state — show the canonical RWS reading
                  // as a real meaningful moment, not as an error.
                  <div className="w-full max-w-xl mx-auto space-y-4">
                    <div className="p-4 rounded-2xl bg-[rgba(196,169,122,0.08)] border border-[rgba(196,169,122,0.2)] text-center">
                      <p className="text-sm text-[#7A6A58] italic">{t("rateLimit")}</p>
                    </div>
                    <div className="p-6 rounded-2xl bg-[rgba(196,169,122,0.06)] border border-[rgba(196,169,122,0.15)]">
                      <p className="text-[11px] text-[#C4A97A] tracking-widest uppercase mb-3">{t("meanLbl")}</p>
                      <p className="text-[#5C4530] text-sm leading-relaxed italic" style={{ fontFamily: "var(--font-cormorant)" }}>
                        {canonFacet.core}
                      </p>
                      <p className="text-[#5C4530] text-sm leading-relaxed mt-3">
                        {canonFacet.psychology}
                      </p>
                    </div>
                    <div className="p-6 rounded-2xl bg-[rgba(196,169,122,0.05)] border border-[rgba(196,169,122,0.12)]">
                      <p className="text-[11px] text-[#C4A97A] tracking-widest uppercase mb-3">{t("adviceLbl")}</p>
                      <p className="text-[#5C4530] text-sm leading-relaxed">{canonFacet.advice}</p>
                    </div>
                  </div>
                ) : netError ? (
                  <div className="flex flex-col items-center gap-4 text-center">
                    <p className="text-[#7A6A58] text-sm">
                      {isRu ? "Соединение прервалось. Попробуйте ещё раз ✨"
                            : isEn ? "Connection interrupted. Please try again ✨"
                            : "З'єднання перервалось. Спробуйте ще раз ✨"}
                    </p>
                    <button type="button" onClick={handleReveal} className="btn-primary justify-center">
                      <Sparkles size={16} />
                      {isRu ? "Повторить" : isEn ? "Try again" : "Спробувати ще раз"}
                    </button>
                  </div>
                ) : null}

                {/* Share + clarify actions — only when we have content worth acting on */}
                {(reading || (rateLimited && canonFacet)) && (
                  <div className="w-full max-w-xl mx-auto flex flex-wrap items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={handleShare}
                      disabled={shareStatus === "saving"}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[rgba(196,169,122,0.4)] text-sm text-[#5C4530] hover:bg-[rgba(196,169,122,0.08)] transition-colors"
                    >
                      {shareStatus === "saving" ? (
                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" /></svg>
                      ) : shareStatus === "done" ? (
                        <span>✨</span>
                      ) : (
                        <Share2 size={14} />
                      )}
                      {shareStatus === "done" ? t("shareDone") : shareStatus === "error" ? t("shareErr") : t("sharePng")}
                    </button>

                    {reading && (
                      <button
                        type="button"
                        onClick={() => setClarifyOpen(o => !o)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[rgba(196,169,122,0.4)] text-sm text-[#5C4530] hover:bg-[rgba(196,169,122,0.08)] transition-colors"
                      >
                        <HelpCircle size={14} />
                        {t("clarify")}
                      </button>
                    )}
                  </div>
                )}

                {/* Clarify panel — collapsible */}
                {clarifyOpen && reading && (
                  <div className="w-full max-w-xl mx-auto card-luxury space-y-4">
                    {clarifyUsed && !clarifyResult ? (
                      <p className="text-sm text-[#7A6A58] italic text-center">{t("clarifyUsed")}</p>
                    ) : !clarifyResult ? (
                      <>
                        <textarea
                          value={clarifyText}
                          onChange={e => setClarifyText(e.target.value.slice(0, 240))}
                          placeholder={t("clarifyPh")}
                          rows={2}
                          className="input-luxury w-full resize-none"
                          maxLength={240}
                        />
                        <button
                          type="button"
                          onClick={handleClarify}
                          disabled={clarifyLoading || !clarifyText.trim()}
                          className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {clarifyLoading ? (isRu ? "Думаю…" : isEn ? "Thinking…" : "Думаю…") : t("clarifySend")}
                        </button>
                        {clarifyError && <p className="text-sm text-[#9A6E28] text-center">{clarifyError}</p>}
                      </>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-[10px] text-[#C4A97A] tracking-widest uppercase">
                          {isRu ? "Уточнение" : isEn ? "Clarification" : "Уточнення"}
                        </p>
                        <p className="text-sm text-[#5C4530] leading-relaxed whitespace-pre-wrap">{clarifyResult}</p>
                      </div>
                    )}
                  </div>
                )}

                {reading && <p className="text-[#C4A97A] text-sm text-center tracking-wide">{t("tomorrow")}</p>}
              </div>
            )}

            {/* ── Weekly card block ── */}
            <div className="w-full mt-8">
              <WeeklyCard language={language} />
            </div>

            {/* ── History journal ── */}
            <div className="w-full mt-4">
              <HistoryView
                language={language}
                refreshToken={historyRefresh}
                onDownload={handleHistoryDownload}
              />
            </div>

          </div>
        </div>
      </section>
    </>
  );
}
