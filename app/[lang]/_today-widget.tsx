"use client";

/**
 * "Today" combined widget (Bonus 1).
 *
 * One block that surfaces the three studio tools' value into a single
 * glance, on the home page. Two modes:
 *
 *   - Anonymous: today's transit Moon + sign + phase, a tease for the
 *     daily card, and a soft "log in for personal weather" CTA.
 *
 *   - Authenticated (profile with full natal data):
 *       • transit Moon ↔ natal Moon aspect (your personal weather)
 *       • Personal Day (numerology micro-cycle for today)
 *       • Today's daily card if already drawn — or CTA to pull it
 *       • Subtle "book a session with Ellen" CTA at the bottom
 *
 * Designed to be the single sticky reason a user comes back daily.
 */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Sparkles, MoonStar, Hash, ChevronRight } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import {
  dateToJD, calcPlanetDeg,
  SIGNS_UA, SIGNS_EN, SIGN_GLYPHS,
} from "@/lib/astro/calculations";
import { useProfile, type Profile } from "@/hooks/useProfile";
import { TAROT_CARDS, getCardName } from "@/lib/data/tarot-cards";

// ── Localised content ──────────────────────────────────────────────────────
const SIGNS_RU = [
  "Овен", "Телец", "Близнецы", "Рак", "Лев", "Дева",
  "Весы", "Скорпион", "Стрелец", "Козерог", "Водолей", "Рыбы",
];

const T = {
  uk: {
    chip: "Сьогодні",
    moon_in: "Місяць у",
    moon_phase_full: "Повний Місяць",
    moon_phase_new: "Новий Місяць",
    moon_phase_grow: "Зростаючий",
    moon_phase_wane: "Спадаючий",
    your_weather: "Твоя особиста погода",
    natal_moon: "Натальний",
    personal_day: "Personal Day",
    todays_card: "Твоя карта сьогодні",
    no_card_yet: "Витягни карту дня",
    pull_card: "Перейти до Студії →",
    sign_in_hint: "Увійди в кабінет, щоб бачити свою особисту версію — натальний Місяць, Personal Day, історію карт.",
    sign_in_cta: "Створити акаунт",
    book_cta: "Потрібна глибша розмова? — Запиши сесію з Ellen",
    aspects: {
      conjunction: "Транзитний Місяць у з'єднанні з твоїм натальним — особиста, насичена тема дня.",
      sextile: "Легкі емоційні можливості — день шепоче, але треба зробити крок.",
      square: "Емоційне напруження — те, що всередині, тиснеться у форму, яка не пасує.",
      trine: "Внутрішній потік — день з тобою заодно. Гарний для тонких рішень.",
      opposition: "Емоційне дзеркало — те, чого ти уникаєш, зустрінеться у іншому.",
      none: "Транзит без точного аспекту до натального — нейтральний день.",
    },
    pday_themes: {
      1: "Початок. День ініціативи, нової теми.",
      2: "Партнерство, дипломатія, мʼяка співпраця.",
      3: "Творчість, спілкування, легкість.",
      4: "Структура, базова робота, фундамент.",
      5: "Зміна, рух, неочікувані повороти.",
      6: "Турбота, дім, стосунки, відповідальність.",
      7: "Тиша, аналіз, внутрішній простір.",
      8: "Сила, гроші, амбіція, реалізація.",
      9: "Завершення, відпускання, підсумок.",
      11: "Майстер-число: інтуїтивний прорив.",
      22: "Майстер-число: великий план у дії.",
    },
  },
  ru: {
    chip: "Сегодня",
    moon_in: "Луна в",
    moon_phase_full: "Полнолуние",
    moon_phase_new: "Новолуние",
    moon_phase_grow: "Растущая",
    moon_phase_wane: "Убывающая",
    your_weather: "Твоя личная погода",
    natal_moon: "Натальная",
    personal_day: "Personal Day",
    todays_card: "Твоя карта сегодня",
    no_card_yet: "Вытяни карту дня",
    pull_card: "Перейти в Студию →",
    sign_in_hint: "Войди в кабинет, чтобы видеть личную версию — натальная Луна, Personal Day, история карт.",
    sign_in_cta: "Создать аккаунт",
    book_cta: "Нужен более глубокий разговор? — Запиши сессию с Ellen",
    aspects: {
      conjunction: "Транзитная Луна в соединении с твоей натальной — личная, насыщенная тема дня.",
      sextile: "Лёгкие эмоциональные возможности — день шепчет, но нужно сделать шаг.",
      square: "Эмоциональное напряжение — то, что внутри, давится в форму, которая не подходит.",
      trine: "Внутренний поток — день с тобой заодно. Хорош для тонких решений.",
      opposition: "Эмоциональное зеркало — то, чего ты избегаешь, встретится в другом.",
      none: "Транзит без точного аспекта к натальной — нейтральный день.",
    },
    pday_themes: {
      1: "Начало. День инициативы, новой темы.",
      2: "Партнёрство, дипломатия, мягкое сотрудничество.",
      3: "Творчество, общение, лёгкость.",
      4: "Структура, базовая работа, фундамент.",
      5: "Перемена, движение, неожиданные повороты.",
      6: "Забота, дом, отношения, ответственность.",
      7: "Тишина, анализ, внутреннее пространство.",
      8: "Сила, деньги, амбиция, реализация.",
      9: "Завершение, отпускание, итог.",
      11: "Мастер-число: интуитивный прорыв.",
      22: "Мастер-число: великий план в действии.",
    },
  },
  en: {
    chip: "Today",
    moon_in: "Moon in",
    moon_phase_full: "Full Moon",
    moon_phase_new: "New Moon",
    moon_phase_grow: "Waxing",
    moon_phase_wane: "Waning",
    your_weather: "Your personal weather",
    natal_moon: "Natal",
    personal_day: "Personal Day",
    todays_card: "Your card today",
    no_card_yet: "Pull today's card",
    pull_card: "Open the Studio →",
    sign_in_hint: "Sign in to see the personal version — natal Moon, Personal Day, card journal.",
    sign_in_cta: "Create account",
    book_cta: "Need a deeper conversation? — Book a session with Ellen",
    aspects: {
      conjunction: "Today's Moon meets your natal Moon — a personal, intense theme of the day.",
      sextile: "Soft emotional openings — the day whispers, but you must take the step.",
      square: "Emotional friction — what's inside is being pressed into a shape that doesn't fit.",
      trine: "Inner flow — the day is on your side. Good for subtle decisions.",
      opposition: "Emotional mirror — what you avoid will meet you in another.",
      none: "Today's Moon has no exact aspect to your natal — a neutral day.",
    },
    pday_themes: {
      1: "Beginning. Day of initiative, fresh topic.",
      2: "Partnership, diplomacy, gentle cooperation.",
      3: "Creativity, communication, lightness.",
      4: "Structure, foundation work, building.",
      5: "Change, movement, sudden turns.",
      6: "Care, home, relationships, responsibility.",
      7: "Quiet, analysis, inner space.",
      8: "Power, money, ambition, realisation.",
      9: "Completion, release, summing up.",
      11: "Master number: intuitive breakthrough.",
      22: "Master number: a great plan in motion.",
    },
  },
};

// ── Numerology Personal Day (Pythagorean reduction) ──────────────────────
const MASTERS = new Set([11, 22, 33]);
function reduceNum(n: number): number {
  if (MASTERS.has(n)) return n;
  if (n < 10) return n;
  return reduceNum(String(n).split("").reduce((a, d) => a + parseInt(d, 10), 0));
}
function calcPersonalDay(birthDate: string, today: Date): number | null {
  // birthDate = "YYYY-MM-DD"
  const m = birthDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  const bMonth = parseInt(m[2], 10);
  const bDay   = parseInt(m[3], 10);
  const cYear  = today.getFullYear();
  const cMonth = today.getMonth() + 1;
  const cDay   = today.getDate();
  const personalYear = reduceNum(
    reduceNum(bDay) + reduceNum(bMonth)
    + reduceNum(String(cYear).split("").reduce((a, c) => a + parseInt(c, 10), 0))
  );
  const personalMonth = reduceNum(personalYear + reduceNum(cMonth));
  return reduceNum(personalMonth + reduceNum(cDay));
}

// ── Aspect detection (re-uses Moon-Guide logic) ──────────────────────────
type AspectKey = "conjunction" | "sextile" | "square" | "trine" | "opposition" | "none";
function detectAspect(a: number, b: number): { key: AspectKey; orb: number } {
  let diff = Math.abs(a - b) % 360;
  if (diff > 180) diff = 360 - diff;
  const candidates: { key: Exclude<AspectKey, "none">; angle: number; orb: number }[] = [
    { key: "conjunction", angle: 0,   orb: 8 },
    { key: "sextile",     angle: 60,  orb: 4 },
    { key: "square",      angle: 90,  orb: 6 },
    { key: "trine",       angle: 120, orb: 6 },
    { key: "opposition",  angle: 180, orb: 8 },
  ];
  for (const c of candidates) {
    const dev = Math.abs(diff - c.angle);
    if (dev <= c.orb) return { key: c.key, orb: dev };
  }
  return { key: "none", orb: diff };
}

// ── Card key fetched from local journal for "today" ──────────────────────
function getTodayCardIndex(): { idx: number; reversed: boolean } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem("ellen-soul:tarot-history");
    if (!raw) return null;
    const list = JSON.parse(raw) as Array<{ day: string; cardIndex: number; reversed: boolean }>;
    const todayKey = new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Kiev" });
    const entry = list.find(e => e.day === todayKey);
    return entry ? { idx: entry.cardIndex, reversed: !!entry.reversed } : null;
  } catch { return null; }
}

// ── Component ─────────────────────────────────────────────────────────────
export function TodayWidget() {
  const { language } = useLanguage();
  const lang: "uk" | "ru" | "en" = language === "ru" ? "ru" : language === "en" ? "en" : "uk";
  const t = T[lang];
  const { profile, loading } = useProfile();

  // Browser timezone offset (hours east of UTC)
  const tzHours = useMemo(() => -new Date().getTimezoneOffset() / 60, []);

  // Compute today's Moon position once per mount
  const moon = useMemo(() => {
    const now = new Date();
    const jd = dateToJD(now.getFullYear(), now.getMonth() + 1, now.getDate(),
                        now.getHours(), now.getMinutes(), tzHours);
    const moonLon = calcPlanetDeg(1, jd);
    const sunLon  = calcPlanetDeg(0, jd);
    const elong   = ((moonLon - sunLon) % 360 + 360) % 360;
    const signIdx = Math.floor(((moonLon % 360) + 360) % 360 / 30);
    const phase: "new" | "full" | "wax" | "wane" =
      elong < 22.5 || elong > 337.5 ? "new"
      : Math.abs(elong - 180) < 22.5 ? "full"
      : elong < 180 ? "wax" : "wane";
    return { moonLon, signIdx, phase };
  }, [tzHours]);

  // Locale-aware sign names
  const signNames = lang === "ru" ? SIGNS_RU : lang === "en" ? SIGNS_EN : SIGNS_UA;

  // Today's drawn card from local journal (if any) — works for both
  // logged-in and anonymous users since the journal lives client-side.
  const [todayCard, setTodayCard] = useState<{ idx: number; reversed: boolean } | null>(null);
  useEffect(() => { setTodayCard(getTodayCardIndex()); }, []);

  // ── Anonymous render ────────────────────────────────────────────────────
  if (!loading && !profile) {
    return <AnonymousWidget
      lang={lang}
      moon={moon}
      todayCard={todayCard}
      signNames={signNames}
      t={t}
    />;
  }

  // ── Personalised render (profile may still be loading — render placeholders) ─
  return <AuthenticatedWidget
    lang={lang}
    moon={moon}
    todayCard={todayCard}
    signNames={signNames}
    profile={profile}
    t={t}
  />;
}

// ── Anonymous sub-widget ─────────────────────────────────────────────────
function AnonymousWidget({
  lang, moon, todayCard, signNames, t,
}: {
  lang: "uk" | "ru" | "en";
  moon: { signIdx: number; phase: "new" | "full" | "wax" | "wane"; moonLon: number };
  todayCard: { idx: number; reversed: boolean } | null;
  signNames: string[];
  t: typeof T["uk"];
}) {
  const phaseLabel =
    moon.phase === "full" ? t.moon_phase_full
    : moon.phase === "new" ? t.moon_phase_new
    : moon.phase === "wax" ? t.moon_phase_grow
    : t.moon_phase_wane;

  return (
    <section className="bg-gradient-to-b from-[#FDFBF7] via-[#F8F2E8] to-[#FDFBF7] py-12 border-y border-[rgba(196,169,122,0.18)]">
      <div className="max-w-4xl mx-auto px-6">
        <div className="card-luxury">
          <div className="flex items-center gap-2 mb-4">
            <span className="tag">{t.chip}</span>
            <span className="text-xs text-[#9A8A78]">
              {new Date().toLocaleDateString(lang === "ru" ? "ru-RU" : lang === "en" ? "en-US" : "uk-UA",
                { weekday: "long", day: "numeric", month: "long" })}
            </span>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <p className="text-[10px] text-[#C4A97A] tracking-widest uppercase mb-1.5">🌙 {t.moon_in}</p>
              <p className="text-2xl text-[#1C1512]" style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}>
                {SIGN_GLYPHS[moon.signIdx]} {signNames[moon.signIdx]}
              </p>
              <p className="text-sm text-[#7A6A58] mt-1">{phaseLabel}</p>
            </div>

            {todayCard ? (
              <CardThumb cardIdx={todayCard.idx} reversed={todayCard.reversed} lang={lang} t={t} />
            ) : (
              <div>
                <p className="text-[10px] text-[#C4A97A] tracking-widest uppercase mb-1.5">🃏 {t.todays_card}</p>
                <Link href={`/${lang}/studio/daily-card`}
                      className="inline-flex items-center gap-2 text-[#B8883A] hover:text-[#7A6A58] text-sm">
                  {t.no_card_yet} <ChevronRight size={14} />
                </Link>
              </div>
            )}
          </div>

          <div className="mt-6 p-4 rounded-xl bg-[rgba(212,168,83,0.10)] border border-[rgba(212,168,83,0.30)]">
            <p className="text-sm text-[#5C4530] leading-relaxed">
              ✨ {t.sign_in_hint}
            </p>
            <Link href={`/${lang}/account/sign-in`}
                  className="inline-flex items-center gap-1 text-sm text-[#B8883A] hover:text-[#7A6A58] mt-2 font-medium">
              {t.sign_in_cta} <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Authenticated sub-widget ─────────────────────────────────────────────
function AuthenticatedWidget({
  lang, moon, todayCard, signNames, profile, t,
}: {
  lang: "uk" | "ru" | "en";
  moon: { signIdx: number; phase: "new" | "full" | "wax" | "wane"; moonLon: number };
  todayCard: { idx: number; reversed: boolean } | null;
  signNames: string[];
  profile: Profile | null;
  t: typeof T["uk"];
}) {
  const phaseLabel =
    moon.phase === "full" ? t.moon_phase_full
    : moon.phase === "new" ? t.moon_phase_new
    : moon.phase === "wax" ? t.moon_phase_grow
    : t.moon_phase_wane;

  // Aspect to natal Moon (only if we have natal data)
  const aspect = profile?.natal_moon_lon != null
    ? detectAspect(moon.moonLon, profile.natal_moon_lon)
    : null;

  // Personal Day (only if birth date known)
  const personalDay = profile?.birth_date ? calcPersonalDay(profile.birth_date, new Date()) : null;

  const displayName = profile?.display_name ?? profile?.full_name?.split(/\s+/)[0] ?? "";

  return (
    <section className="bg-gradient-to-b from-[#FDFBF7] via-[#F8F2E8] to-[#FDFBF7] py-12 border-y border-[rgba(196,169,122,0.18)]">
      <div className="max-w-4xl mx-auto px-6">
        <div className="card-luxury">
          <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="tag">{t.your_weather}</span>
              <span className="text-xs text-[#9A8A78]">
                {new Date().toLocaleDateString(lang === "ru" ? "ru-RU" : lang === "en" ? "en-US" : "uk-UA",
                  { weekday: "long", day: "numeric", month: "long" })}
              </span>
            </div>
            {displayName && (
              <span className="text-xs text-[#7A6A58] italic" style={{ fontFamily: "var(--font-cormorant)" }}>
                {displayName}
              </span>
            )}
          </div>

          {/* Three-column grid: Moon · Personal Day · Card */}
          <div className="grid sm:grid-cols-3 gap-4">
            {/* Moon */}
            <div className="p-4 rounded-xl bg-[rgba(196,169,122,0.06)] border border-[rgba(196,169,122,0.18)]">
              <p className="text-[10px] text-[#C4A97A] tracking-widest uppercase mb-1.5 flex items-center gap-1.5">
                <MoonStar size={11} /> {t.moon_in}
              </p>
              <p className="text-xl text-[#1C1512]" style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}>
                {SIGN_GLYPHS[moon.signIdx]} {signNames[moon.signIdx]}
              </p>
              <p className="text-[11px] text-[#7A6A58] mt-0.5">{phaseLabel}</p>
            </div>

            {/* Personal Day */}
            <div className="p-4 rounded-xl bg-[rgba(196,169,122,0.06)] border border-[rgba(196,169,122,0.18)]">
              <p className="text-[10px] text-[#C4A97A] tracking-widest uppercase mb-1.5 flex items-center gap-1.5">
                <Hash size={11} /> {t.personal_day}
              </p>
              {personalDay != null ? (
                <>
                  <p className="text-xl text-[#1C1512]" style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}>
                    {personalDay}
                  </p>
                  <p className="text-[11px] text-[#7A6A58] mt-0.5">
                    {t.pday_themes[personalDay as keyof typeof t.pday_themes] ?? ""}
                  </p>
                </>
              ) : (
                <p className="text-xs text-[#9A8A78] italic">
                  <Link href={`/${lang}/account`} className="hover:text-[#B8883A]">→ {lang === "ru" ? "додай дату народження" : lang === "en" ? "add birth date" : "додай дату народження"}</Link>
                </p>
              )}
            </div>

            {/* Card */}
            <div className="p-4 rounded-xl bg-[rgba(196,169,122,0.06)] border border-[rgba(196,169,122,0.18)]">
              <p className="text-[10px] text-[#C4A97A] tracking-widest uppercase mb-1.5 flex items-center gap-1.5">
                <Sparkles size={11} /> {t.todays_card}
              </p>
              {todayCard ? (
                <Link href={`/${lang}/studio/daily-card`} className="block hover:opacity-90">
                  <p className="text-base text-[#1C1512]" style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}>
                    {getCardName(TAROT_CARDS[todayCard.idx], lang)}
                  </p>
                  {todayCard.reversed && <p className="text-[10px] text-[#B8883A] italic mt-0.5 tracking-widest uppercase">reversed</p>}
                </Link>
              ) : (
                <Link href={`/${lang}/studio/daily-card`} className="text-sm text-[#B8883A] hover:text-[#7A6A58] inline-flex items-center gap-1">
                  {t.no_card_yet} <ChevronRight size={12} />
                </Link>
              )}
            </div>
          </div>

          {/* Aspect line (the personal signal) */}
          {aspect && (
            <div className="mt-4 p-4 rounded-xl bg-[rgba(212,168,83,0.10)] border border-[rgba(212,168,83,0.30)]">
              <p className="text-sm text-[#5C4530] leading-relaxed">
                ✦ {t.aspects[aspect.key]}
              </p>
              {aspect.key !== "none" && (
                <p className="text-[10px] text-[#9A8A78] mt-1 italic">
                  ±{aspect.orb.toFixed(1)}° · {profile?.natal_moon_lon != null
                    ? `${t.natal_moon} ${signNames[Math.floor(((profile.natal_moon_lon % 360) + 360) % 360 / 30)]}`
                    : ""}
                </p>
              )}
            </div>
          )}

          {/* Booking CTA */}
          <div className="mt-5 pt-4 border-t border-[rgba(196,169,122,0.18)] text-center">
            <Link
              href={`/${lang}/services`}
              className="text-sm text-[#B8883A] hover:text-[#7A6A58] inline-flex items-center gap-1.5"
            >
              {t.book_cta} <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function CardThumb({ cardIdx, reversed, lang, t }: {
  cardIdx: number; reversed: boolean; lang: "uk" | "ru" | "en"; t: typeof T["uk"];
}) {
  const card = TAROT_CARDS[cardIdx];
  return (
    <Link href={`/${lang}/studio/daily-card`} className="flex items-start gap-3 hover:opacity-90">
      <div
        className="flex-shrink-0 rounded-lg overflow-hidden border border-[#C4A97A]/40"
        style={{ width: 56, height: 96, background: "#F5F0E8", transform: reversed ? "rotate(180deg)" : "none" }}
      >
        <Image src={card.image} alt={card.nameEn} width={56} height={96} className="object-contain" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] text-[#C4A97A] tracking-widest uppercase mb-1">{t.todays_card}</p>
        <p className="text-base text-[#1C1512]" style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}>
          {getCardName(card, lang)}
        </p>
        {reversed && <p className="text-[10px] text-[#B8883A] italic mt-0.5 tracking-widest uppercase">reversed</p>}
      </div>
    </Link>
  );
}
