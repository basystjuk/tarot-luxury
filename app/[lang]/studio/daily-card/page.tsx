"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import AnimatedSection from "@/components/ui/AnimatedSection";
import GoldDivider from "@/components/ui/GoldDivider";
import { useLanguage } from "@/hooks/useLanguage";
import { pickCard, getZodiacSign, TAROT_CARDS } from "@/lib/data/tarot-cards";

// ── Zodiac display names ───────────────────────────────────────────────────
const ZODIAC_NAMES: Record<string, Record<string, string>> = {
  Aries:       { uk: "Овен",      ru: "Овен",       en: "Aries" },
  Taurus:      { uk: "Телець",    ru: "Телец",      en: "Taurus" },
  Gemini:      { uk: "Близнюки",  ru: "Близнецы",   en: "Gemini" },
  Cancer:      { uk: "Рак",       ru: "Рак",        en: "Cancer" },
  Leo:         { uk: "Лев",       ru: "Лев",        en: "Leo" },
  Virgo:       { uk: "Діва",      ru: "Дева",       en: "Virgo" },
  Libra:       { uk: "Терези",    ru: "Весы",       en: "Libra" },
  Scorpio:     { uk: "Скорпіон",  ru: "Скорпион",   en: "Scorpio" },
  Sagittarius: { uk: "Стрілець",  ru: "Стрелец",    en: "Sagittarius" },
  Capricorn:   { uk: "Козеріг",   ru: "Козерог",    en: "Capricorn" },
  Aquarius:    { uk: "Водолій",   ru: "Водолей",    en: "Aquarius" },
  Pisces:      { uk: "Риби",      ru: "Рыбы",       en: "Pisces" },
};

type Step = "form" | "card-back" | "reading" | "result";

interface Reading {
  meaning: string;
  advice: string;
  affirmation: string;
}

export default function DailyCardPage() {
  const { language } = useLanguage();
  const isRu = language === "ru";
  const isEn = language === "en";

  const [step, setStep]   = useState<Step>("form");
  const [name, setName]   = useState("");
  const [birth, setBirth] = useState("");   // DD.MM.YYYY
  const [birthError, setBirthError] = useState("");
  const [flipped, setFlipped]       = useState(false);
  const [reading, setReading]       = useState<Reading | null>(null);
  const [loadingText, setLoadingText] = useState("");
  const [rateError, setRateError]     = useState("");

  // Card chosen on button click (captures exact moment)
  const chosenCardRef = useRef<typeof TAROT_CARDS[0] | null>(null);
  const zodiacRef     = useRef<string>("");

  // ── Validate & proceed from form ──────────────────────────────────────────
  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBirthError("");

    const parts = birth.split(".");
    if (parts.length !== 3) { setBirthError(t("birthInvalid")); return; }
    const [d, m, y] = parts.map(Number);
    if (!d || !m || !y || d < 1 || d > 31 || m < 1 || m > 12 || y < 1900 || y > new Date().getFullYear()) {
      setBirthError(t("birthInvalid")); return;
    }

    zodiacRef.current = getZodiacSign(d, m);
    chosenCardRef.current = null;
    setStep("card-back");
  }

  // ── Flip the card & fetch reading ─────────────────────────────────────────
  async function handleReveal() {
    const parts = birth.split(".").map(Number);
    const card  = pickCard(name, parts[0], parts[1], parts[2]);
    chosenCardRef.current = card;
    setFlipped(true);

    // Brief pause for flip animation then fetch
    setTimeout(async () => {
      setStep("reading");
      setLoadingText(t("loading"));

      try {
        const res = await fetch("/api/tarot-reading", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            cardName: card.nameEn,
            zodiac: zodiacRef.current,
            language,
          }),
        });

        if (res.status === 429) {
          setRateError(t("rateLimit"));
          setStep("result");
          return;
        }

        const data: Reading = await res.json();
        setReading(data);
        setStep("result");
      } catch {
        setStep("result");
      }
    }, 900);
  }

  // ── i18n ──────────────────────────────────────────────────────────────────
  function t(key: string): string {
    const dict: Record<string, [string, string, string]> = {
      //                               uk                                    ru                                 en
      tag:           ["Таро",                           "Таро",                          "Tarot"],
      title:         ["Карта дня",                      "Карта дня",                     "Card of the Day"],
      subtitle:      ["Персональне передбачення",       "Персональное предсказание",     "Your Personal Reading"],
      nameLbl:       ["Ваше ім'я",                      "Ваше имя",                      "Your name"],
      birthLbl:      ["Дата народження",                "Дата рождения",                 "Date of birth"],
      birthPh:       ["ДД.ММ.РРРР",                     "ДД.ММ.ГГГГ",                    "DD.MM.YYYY"],
      birthInvalid:  ["Введіть коректну дату",          "Введите корректную дату",       "Enter a valid date"],
      next:          ["Далі",                           "Далее",                         "Next"],
      reveal:        ["Дізнатися передбачення",         "Узнать предсказание",           "Reveal My Card"],
      loading:       ["Зірки читають твою карту…",      "Звёзды читают твою карту…",     "The stars are reading your card…"],
      meanLbl:       ["Значення",                       "Значение",                      "Meaning"],
      adviceLbl:     ["Порада",                         "Совет",                         "Advice"],
      affLbl:        ["Аффірмація",                     "Аффирмация",                    "Affirmation"],
      zodiacLbl:     ["Знак зодіаку",                   "Знак зодиака",                  "Zodiac sign"],
      again:         ["Витягнути ще раз",               "Вытянуть ещё раз",              "Draw again"],
      cta:           ["Записатись на консультацію",     "Записаться на консультацию",    "Book a Consultation"],
      rateLimit:     ["Ліміт 3 передбачення на добу вичерпано. Повертайтесь завтра ✨",
                      "Лимит 3 предсказания в сутки исчерпан. Возвращайтесь завтра ✨",
                      "Daily limit of 3 readings reached. Come back tomorrow ✨"],
    };
    const row = dict[key] ?? ["","",""];
    return isRu ? row[1] : isEn ? row[2] : row[0];
  }

  const card = chosenCardRef.current;
  const zodiacDisplay = zodiacRef.current
    ? (ZODIAC_NAMES[zodiacRef.current]?.[language] ?? zodiacRef.current)
    : "";

  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
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
        <div className="max-w-2xl mx-auto px-6">

          {/* ── Step 1: Form ────────────────────────────────────────────── */}
          {step === "form" && (
            <AnimatedSection>
              <div className="card-luxury">
                <h2
                  className="text-2xl text-[#1C1512] mb-8 text-center"
                  style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}
                >
                  {isRu ? "Введите данные для предсказания"
                        : isEn ? "Enter your details"
                        : "Введіть дані для передбачення"}
                </h2>
                <form onSubmit={handleFormSubmit} className="space-y-5">
                  <div>
                    <label className="block text-xs text-[#7A6A58] mb-2 tracking-wide">{t("nameLbl")}</label>
                    <input
                      type="text"
                      required
                      placeholder={isRu ? "Ваше имя" : isEn ? "Your name" : "Ваше ім'я"}
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="input-luxury w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#7A6A58] mb-2 tracking-wide">{t("birthLbl")}</label>
                    <input
                      type="text"
                      required
                      placeholder={t("birthPh")}
                      value={birth}
                      onChange={e => setBirth(e.target.value)}
                      className="input-luxury w-full"
                      maxLength={10}
                    />
                    {birthError && <p className="text-xs text-red-500 mt-2">{birthError}</p>}
                  </div>
                  <button type="submit" className="btn-primary w-full justify-center">
                    <Sparkles size={16} />
                    {t("next")}
                  </button>
                </form>
              </div>
            </AnimatedSection>
          )}

          {/* ── Step 2: Animated card back ──────────────────────────────── */}
          {(step === "card-back" || step === "reading") && (
            <AnimatedSection>
              <div className="flex flex-col items-center gap-8">
                {/* Card flip container */}
                <div className="relative" style={{ perspective: "1000px" }}>
                  <div
                    className="relative transition-transform duration-700"
                    style={{
                      transformStyle: "preserve-3d",
                      transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
                      width: 200, height: 340,
                    }}
                  >
                    {/* Back face */}
                    <div
                      className="absolute inset-0 rounded-2xl overflow-hidden border-2 border-[#C4A97A] shadow-[0_20px_60px_rgba(0,0,0,0.25)]"
                      style={{ backfaceVisibility: "hidden" }}
                    >
                      <div className="w-full h-full bg-gradient-to-b from-[#2D2218] to-[#1C1512] flex flex-col items-center justify-between p-5">
                        <div className="w-full border-t border-[rgba(196,169,122,0.4)]" />
                        <div className="text-center space-y-3">
                          <div className="w-16 h-16 rounded-full border border-[rgba(196,169,122,0.4)] flex items-center justify-center mx-auto">
                            <span className="text-[#C4A97A] text-3xl">✦</span>
                          </div>
                          <p className="text-[#C4A97A] text-xs tracking-[0.2em] uppercase">Tarot</p>
                        </div>
                        <div className="w-full border-b border-[rgba(196,169,122,0.4)]" />
                      </div>
                    </div>
                    {/* Front face (shown after flip) */}
                    {card && (
                      <div
                        className="absolute inset-0 rounded-2xl overflow-hidden border-2 border-[#C4A97A] shadow-[0_20px_60px_rgba(0,0,0,0.25)]"
                        style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                      >
                        <Image
                          src={card.image}
                          alt={card.nameEn}
                          fill
                          className="object-cover"
                          sizes="200px"
                        />
                        {/* Gold name bar */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#1C1512]/90 to-transparent px-3 py-2 text-center">
                          <p className="text-[#D4A853] text-xs tracking-wider font-medium">{card.nameEn}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Pulse animation while unflipped */}
                {!flipped && (
                  <div className="text-center space-y-6">
                    <p className="text-[#7A6A58] text-sm">
                      {isRu ? "Ваша карта готова. Нажмите, чтобы открыть..."
                            : isEn ? "Your card is ready. Click to reveal..."
                            : "Ваша карта готова. Натисніть, щоб відкрити..."}
                    </p>
                    <button
                      onClick={handleReveal}
                      className="btn-primary justify-center"
                    >
                      <Sparkles size={16} />
                      {t("reveal")}
                    </button>
                  </div>
                )}

                {step === "reading" && (
                  <div className="flex items-center gap-3 text-[#B8883A]">
                    <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"/>
                    </svg>
                    <p className="text-sm italic">{loadingText}</p>
                  </div>
                )}
              </div>
            </AnimatedSection>
          )}

          {/* ── Step 3: Result ──────────────────────────────────────────── */}
          {step === "result" && card && (
            <AnimatedSection>
              <div className="space-y-6">
                {/* Card + meta */}
                <div className="flex flex-col sm:flex-row gap-8 items-center sm:items-start">
                  <div className="shrink-0 relative w-[160px] h-[270px] rounded-2xl overflow-hidden border-2 border-[#C4A97A] shadow-[0_12px_40px_rgba(0,0,0,0.2)]">
                    <Image src={card.image} alt={card.nameEn} fill className="object-cover" sizes="160px" />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#1C1512]/90 to-transparent px-2 py-2 text-center">
                      <p className="text-[#D4A853] text-xs tracking-wider">{card.nameEn}</p>
                    </div>
                  </div>

                  <div className="flex-1 space-y-4">
                    <div>
                      <p className="text-xs text-[#C4A97A] tracking-widest uppercase mb-1">{t("zodiacLbl")}</p>
                      <p className="text-[#1C1512] font-medium">{zodiacDisplay}</p>
                    </div>

                    {rateError ? (
                      <div className="p-4 rounded-xl bg-[rgba(196,169,122,0.08)] border border-[rgba(196,169,122,0.2)]">
                        <p className="text-[#7A6A58] text-sm">{rateError}</p>
                      </div>
                    ) : reading ? (
                      <>
                        <div className="p-4 rounded-xl bg-[rgba(196,169,122,0.08)] border border-[rgba(196,169,122,0.15)]">
                          <p className="text-xs text-[#C4A97A] tracking-widest uppercase mb-2">{t("meanLbl")}</p>
                          <p className="text-[#5C4530] text-sm leading-relaxed">{reading.meaning}</p>
                        </div>
                        {reading.advice && (
                          <div className="p-4 rounded-xl bg-[rgba(196,169,122,0.05)] border border-[rgba(196,169,122,0.12)]">
                            <p className="text-xs text-[#C4A97A] tracking-widest uppercase mb-2">{t("adviceLbl")}</p>
                            <p className="text-[#5C4530] text-sm leading-relaxed">{reading.advice}</p>
                          </div>
                        )}
                        {reading.affirmation && (
                          <div className="p-4 rounded-xl bg-gradient-to-br from-[#2D2218] to-[#1C1512] border border-[rgba(196,169,122,0.2)]">
                            <p className="text-xs text-[#C4A97A] tracking-widest uppercase mb-2">{t("affLbl")}</p>
                            <p className="text-white/80 italic text-base" style={{ fontFamily: "var(--font-cormorant)" }}>
                              &ldquo;{reading.affirmation}&rdquo;
                            </p>
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="text-[#7A6A58] text-sm">{isRu ? "Не удалось загрузить предсказание." : isEn ? "Could not load reading." : "Не вдалось завантажити передбачення."}</p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-3 justify-center pt-2">
                  <button
                    onClick={() => { setStep("form"); setReading(null); setFlipped(false); setRateError(""); chosenCardRef.current = null; }}
                    className="btn-secondary"
                  >
                    {t("again")}
                  </button>
                  <Link href={`/${language}/contacts`} className="btn-primary">
                    {t("cta")} <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </AnimatedSection>
          )}

        </div>
      </section>
    </>
  );
}
