"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Sparkles } from "lucide-react";
import AnimatedSection from "@/components/ui/AnimatedSection";
import GoldDivider from "@/components/ui/GoldDivider";
import { useLanguage } from "@/hooks/useLanguage";
import { pickCard, getCardName, TAROT_CARDS } from "@/lib/data/tarot-cards";

type Step = "form" | "reading" | "result";

interface Reading {
  meaning: string;
  advice: string;
  affirmation: string;
}

interface StoredCard { day: string; cardIndex: number; reading: Reading | null; }

const CARD_W  = 200;
const CARD_H  = 352;
const FLIP_MS = 800;

function getKyivDay(): string {
  try {
    return new Date().toLocaleDateString("uk-UA", { timeZone: "Europe/Kiev" });
  } catch {
    // Fallback: UTC+2 date string
    const d = new Date(Date.now() + 2 * 3600 * 1000);
    return d.toISOString().slice(0, 10);
  }
}

function loadStoredCard(): StoredCard | null {
  try {
    const raw = localStorage.getItem("ellen-soul:daily-card");
    if (!raw) return null;
    const d = JSON.parse(raw) as StoredCard;
    if (d.day !== getKyivDay() || d.cardIndex < 0 || d.cardIndex > 77) return null;
    return d;
  } catch { return null; }
}

function saveCard(cardIndex: number, reading: Reading | null): void {
  try {
    localStorage.setItem("ellen-soul:daily-card", JSON.stringify({ day: getKyivDay(), cardIndex, reading }));
  } catch {}
}

export default function DailyCardPage() {
  const { language } = useLanguage();
  const isRu = language === "ru";
  const isEn = language === "en";

  const [step, setStep]           = useState<Step>("form");
  const [flipped, setFlipped]     = useState(false);
  const [reading, setReading]     = useState<Reading | null>(null);
  const [rateError, setRateError] = useState("");
  const [netError, setNetError]   = useState(false); // retryable network error

  const chosenCardRef = useRef<typeof TAROT_CARDS[0] | null>(null);

  // Restore today's card from localStorage on mount
  useEffect(() => {
    const stored = loadStoredCard();
    if (!stored) return;
    chosenCardRef.current = TAROT_CARDS[stored.cardIndex];
    if (stored.reading) {
      setReading(stored.reading);
    } else {
      // Card was drawn today but rate-limited — show the block without reading
      setRateError(
        language === "ru"
          ? "Ваша карта на сегодня уже открыта. Новая карта ждёт вас завтра ✨"
          : language === "en"
          ? "Your card for today is already open. Come back tomorrow ✨"
          : "Ваша карта на сьогодні вже відкрита. Нова карта чекає вас завтра ✨"
      );
    }
    setFlipped(true);
    setStep("result");
  }, [language]);

  function t(key: string): string {
    const dict: Record<string, [string, string, string]> = {
      tag:       ["Таро",                                           "Таро",                                            "Tarot"],
      title:     ["Карта дня",                                     "Карта дня",                                       "Card of the Day"],
      subtitle:  ["Персональне передбачення",                      "Персональное предсказание",                       "Your Personal Reading"],
      hint:      ["Зосередьтесь на своєму питанні і відкрийте карту",
                  "Сосредоточьтесь на своём вопросе и откройте карту",
                  "Focus on your question and reveal your card"],
      reveal:    ["Дізнатися передбачення",                        "Узнать предсказание",                             "Reveal My Reading"],
      loading:   ["Зірки читають твою карту…",                     "Звёзды читают твою карту…",                       "The stars are reading your card…"],
      meanLbl:   ["Значення",                                      "Значение",                                        "Meaning"],
      adviceLbl: ["Порада",                                        "Совет",                                           "Advice"],
      affLbl:    ["Афірмація",                                     "Аффирмация",                                      "Affirmation"],
      tomorrow:  ["Нова карта відкриється для вас вже завтра ✨",   "Новая карта откроется для вас уже завтра ✨",     "A new card will open for you tomorrow ✨"],
      rateLimit: ["Ваша карта на сьогодні вже відкрита. Нова карта чекає вас завтра ✨",
                  "Ваша карта на сегодня уже открыта. Новая карта ждёт вас завтра ✨",
                  "Your card for today is already open. Come back tomorrow ✨"],
    };
    const row = dict[key] ?? ["", "", ""];
    return isRu ? row[1] : isEn ? row[2] : row[0];
  }

  async function handleReveal() {
    const card = chosenCardRef.current ?? pickCard();
    chosenCardRef.current = card;
    setNetError(false);

    // Determine arcana type + suit element
    const arcanaType = card.suit === "major" ? "major" : "minor";
    const suitElement =
      card.suit === "wands" ? "Fire" :
      card.suit === "cups" ? "Water" :
      card.suit === "swords" ? "Air" :
      card.suit === "pentacles" ? "Earth" : "";

    // Fire fetch before state updates for minimum latency
    const fetchPromise = fetch("/api/tarot-reading", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cardName: card.nameEn, language, arcanaType, suitElement }),
    });

    if (!flipped) {
      setFlipped(true);
      // Collapse the hint/button when card is edge-on (halfway through flip)
      await new Promise<void>(r => setTimeout(r, FLIP_MS / 2));
    }
    setStep("reading");

    try {
      const res = await fetchPromise;
      if (res.status === 429) {
        saveCard(card.index, null); // mark today as used even without a reading
        setRateError(t("rateLimit"));
        setStep("result");
        return;
      }
      const data: Reading = await res.json();
      setReading(data);
      saveCard(card.index, data);
    } catch {
      // Network error (e.g. iOS Safari killed the fetch) — do NOT save null,
      // keep the card visible and offer retry
      setNetError(true);
    }
    setStep("result");
  }

  const card = chosenCardRef.current;

  // ── Card flip — always mounted so CSS transition is never interrupted ──────
  const flipCard = (
    <div style={{ perspective: "1200px", width: CARD_W, flexShrink: 0 }}>
      <div
        style={{
          position: "relative",
          width: CARD_W,
          height: CARD_H,
          transformStyle: "preserve-3d",
          transition: `transform ${FLIP_MS}ms cubic-bezier(0.4,0,0.2,1)`,
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* ── Back face ── */}
        <div
          style={{
            position: "absolute", inset: 0,
            borderRadius: 16,
            overflow: "hidden",
            border: "4px solid #C4A97A",
            boxShadow: "0 20px 60px rgba(0,0,0,0.28), 0 0 0 1px rgba(196,169,122,0.18)",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
          }}
        >
          <div
            style={{
              width: "100%", height: "100%",
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "space-between",
              padding: "24px 16px",
              background: "linear-gradient(160deg,#4A2E08 0%,#7A5018 20%,#C4A250 50%,#7A5018 80%,#4A2E08 100%)",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, width: "100%" }}>
              <div style={{ width: "76%", borderTop: "2px solid rgba(255,238,180,0.65)" }} />
              <div style={{ width: "52%", borderTop: "1px solid rgba(255,238,180,0.4)" }} />
            </div>
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  width: 64, height: 64, borderRadius: "50%",
                  background: "rgba(0,0,0,0.18)",
                  border: "2px solid rgba(255,238,180,0.55)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 14px",
                }}
              >
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

        {/* ── Front face — full card, no plate ── */}
        {card && (
          <div
            style={{
              position: "absolute", inset: 0,
              borderRadius: 16,
              overflow: "hidden",
              border: "4px solid #C4A97A",
              boxShadow: "0 20px 60px rgba(0,0,0,0.32)",
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              background: "#F5F0E8",
            }}
          >
            <Image
              src={card.image}
              alt={card.nameEn}
              fill
              className="object-contain"
              sizes="200px"
              priority
            />
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* ── Hero ── */}
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
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col items-center gap-8">

            {/* Hint — form step only */}
            {step === "form" && (
              <AnimatedSection>
                <p className="text-[#7A6A58] text-sm text-center tracking-wide italic">
                  {t("hint")}
                </p>
              </AnimatedSection>
            )}

            {/* Card — always mounted */}
            {flipCard}

            {/* Card name badge — shown once card is revealed */}
            {card && step !== "form" && (
              <div
                className="flex items-center gap-3 px-6 py-2.5 rounded-full"
                style={{ border: "1.5px solid #C4A97A" }}
              >
                <span className="text-[#C4A97A] text-xs">✦</span>
                <p className="text-[#1C1512] text-xs tracking-[0.18em] uppercase font-medium">{getCardName(card, language)}</p>
                <span className="text-[#C4A97A] text-xs">✦</span>
              </div>
            )}

            {/* Reveal button — form step only */}
            {step === "form" && (
              <button type="button" onClick={handleReveal} className="btn-primary justify-center">
                <Sparkles size={16} />
                {t("reveal")}
              </button>
            )}

            {/* Loading — reading step */}
            {step === "reading" && (
              <div className="flex items-center gap-3 text-[#B8883A]">
                <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                </svg>
                <p className="text-sm italic">{t("loading")}</p>
              </div>
            )}

            {/* Result — result step */}
            {step === "result" && (
              rateError ? (
                <div className="w-full p-5 rounded-xl bg-[rgba(196,169,122,0.08)] border border-[rgba(196,169,122,0.2)] text-center">
                  <p className="text-[#7A6A58] text-sm">{rateError}</p>
                </div>
              ) : reading ? (
                <>
                  <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-5">
                    {/* Meaning */}
                    <div className="p-6 rounded-2xl bg-[rgba(196,169,122,0.08)] border border-[rgba(196,169,122,0.15)]">
                      <p className="text-[11px] text-[#C4A97A] tracking-widest uppercase mb-4 text-center underline underline-offset-4">{t("meanLbl")}</p>
                      <p className="text-[#5C4530] text-sm leading-relaxed">{reading.meaning}</p>
                    </div>
                    {/* Advice */}
                    {reading.advice && (
                      <div className="p-6 rounded-2xl bg-[rgba(196,169,122,0.05)] border border-[rgba(196,169,122,0.12)]">
                        <p className="text-[11px] text-[#C4A97A] tracking-widest uppercase mb-4 text-center underline underline-offset-4">{t("adviceLbl")}</p>
                        <p className="text-[#5C4530] text-sm leading-relaxed">{reading.advice}</p>
                      </div>
                    )}
                    {/* Affirmation */}
                    {reading.affirmation && (
                      <div
                        className="p-6 rounded-2xl border border-[rgba(196,169,122,0.2)]"
                        style={{ background: "linear-gradient(135deg,#2D2218,#1C1512)" }}
                      >
                        <p className="text-[11px] text-[#C4A97A] tracking-widest uppercase mb-4 text-center underline underline-offset-4">{t("affLbl")}</p>
                        <p
                          className="text-white/85 italic"
                          style={{ fontFamily: "var(--font-cormorant)", fontSize: "1.05rem", lineHeight: 1.6 }}
                        >
                          &ldquo;{reading.affirmation}&rdquo;
                        </p>
                      </div>
                    )}
                  </div>
                  {/* Tomorrow — only when there's a reading */}
                  <p className="text-[#C4A97A] text-sm text-center tracking-wide pb-4">
                    {t("tomorrow")}
                  </p>
                </>
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
              ) : (
                <p className="text-[#7A6A58] text-sm text-center">
                  {isRu ? "Не удалось загрузить предсказание." : isEn ? "Could not load reading." : "Не вдалось завантажити передбачення."}
                </p>
              )
            )}

          </div>
        </div>
      </section>
    </>
  );
}
