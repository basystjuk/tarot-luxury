"use client";

/**
 * Daily Horoscope tool (Phase H1).
 *
 * The deterministic engine in lib/astro/horoscope.ts does the heavy
 * lifting — convergence detection across astro / numerology / Moon.
 * This page presents the engine output as a single-glance dashboard:
 *
 *   1. Hero — quality-coloured theme of the day
 *   2. Signal grid — each convergent signal as a small card with its
 *      reasoning ("Moon trine natal Venus", "Personal Day 5", etc.)
 *   3. Window of Luck timeline — 24h horizontal bar with the day's
 *      good windows highlighted; tap a window to see directives
 *   4. Avoid windows — same style, opposite polarity
 *   5. AI portrait block (auth-gated)
 *
 * Anonymous viewers get the engine output. Auth-gated AI synthesis is
 * the conversion hook.
 */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Sparkles, Loader2, Lock, Hash, MoonStar, Star, AlertCircle } from "lucide-react";
import AnimatedSection from "@/components/ui/AnimatedSection";
import GoldDivider from "@/components/ui/GoldDivider";
import { useLanguage } from "@/hooks/useLanguage";
import { useProfile } from "@/hooks/useProfile";
import { computeNatalSnapshot } from "@/lib/astro/natal-snapshot";
import {
  buildDayReading, formatHM, moonPhaseAt,
  type DayReading, type ConvergenceSignal, type TimeWindow, type SignalSystem,
} from "@/lib/astro/horoscope";
import { dateToJD, calcPlanetDeg, SIGN_GLYPHS } from "@/lib/astro/calculations";
import { track } from "@/lib/analytics/posthog";

const SIGNS_UA = ["Овен","Телець","Близнюки","Рак","Лев","Діва","Терези","Скорпіон","Стрілець","Козеріг","Водолій","Риби"];
const SIGNS_RU = ["Овен","Телец","Близнецы","Рак","Лев","Дева","Весы","Скорпион","Стрелец","Козерог","Водолей","Рыбы"];
const SIGNS_EN = ["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"];

const PHASE_LABEL = {
  uk: { new: "Новий", waxing: "Зростаючий", full: "Повний", waning: "Спадаючий" },
  ru: { new: "Новая", waxing: "Растущая",   full: "Полная", waning: "Убывающая" },
  en: { new: "New",   waxing: "Waxing",     full: "Full",   waning: "Waning"    },
};

const T = {
  uk: {
    tag: "Астрологія + Нумерологія",
    title: "Твій гороскоп на сьогодні",
    sub: "Не «всім овнам однакове». Конвергенція сигналів астрології, нумерології та Місяця в одну сфокусовану тему дня.",
    section_signals: "Сьогоднішні сигнали",
    section_timeline: "Часова стрічка дня",
    section_windows: "Вікна удачі",
    section_challenges: "Зони тиску",
    section_do: "Зроби сьогодні",
    section_avoid: "Уникай сьогодні",
    section_ai: "AI-синтез",
    ai_cta: "Розгорнути в поетичний синтез",
    ai_loading: "Думаю над твоїми сигналами…",
    ai_anon: "Поетичний синтез доступний зареєстрованим. Сигнали + вікна вище — для всіх.",
    ai_signin: "Створити акаунт →",
    ai_rate: "Сьогодні AI вже зробив синтез. Повертайся завтра ✨",
    ai_error: "Не вдалось згенерувати синтез. Спробуй пізніше.",
    essence_label: "Суть дня",
    windows_label: "Вікна",
    do_label: "Дії",
    no_windows: "Сьогодні немає гострих часових піків — енергія рівна.",
    no_challenges: "Зон тиску немає.",
    quality: {
      flowing:   "Потоковий день",
      mixed:     "Змішаний день",
      turbulent: "Турбулентний день",
      quiet:     "Спокійний день",
    },
    no_natal_hint: "Збережи натальні дані у кабінеті — отримаєш персональні аспекти й вікна удачі.",
    cta_cabinet: "Заповнити натал →",
    general_mode: "Загальний режим",
    general_mode_note: "Без часу й місця народження показано лише загальну місячну погоду дня — однакову для всіх. Додай натал для персональних транзитів.",
    why_support: "сприяють",
    why_press: "тиснуть",
    why: {
      flowing:   "День потоковий, бо переважають підтримувальні аспекти",
      mixed:     "День змішаний: підтримка й напруга врівноважені",
      turbulent: "День турбулентний, бо переважають напружені аспекти",
      quiet:     "День спокійний: активних аспектів сьогодні небагато",
    } as Record<DayReading["quality"], string>,
    astro_basis: "Астрологічна підоснова",
    astro_basis_sub: "Конкретні транзити, на яких побудований день",
    astro_basis_empty: "Без натальних даних аспекти до твоєї карти не рахуються — показано загальну місячну погоду. Заповни натал у кабінеті, щоб побачити персональні транзити (Місяць тригон твоя Венера тощо).",
    legend_signal: "Сигнал",
    legend_polarity: { supporting: "сприяє", challenging: "тисне", neutral: "нейтрально" },
    legend_system: { astro: "Астро", numerology: "Нумерологія", moon: "Місяць", tarot: "Tarot", "fixed-star": "Зірка" } as Record<SignalSystem, string>,
  },
  ru: {
    tag: "Астрология + Нумерология",
    title: "Твой гороскоп на сегодня",
    sub: "Не «всем овнам одинаково». Конвергенция сигналов астрологии, нумерологии и Луны в одну сфокусированную тему дня.",
    section_signals: "Сегодняшние сигналы",
    section_timeline: "Временная лента дня",
    section_windows: "Окна удачи",
    section_challenges: "Зоны давления",
    section_do: "Сделай сегодня",
    section_avoid: "Избегай сегодня",
    section_ai: "AI-синтез",
    ai_cta: "Развернуть в поэтический синтез",
    ai_loading: "Думаю над твоими сигналами…",
    ai_anon: "Поэтический синтез доступен зарегистрированным. Сигналы + окна выше — для всех.",
    ai_signin: "Создать аккаунт →",
    ai_rate: "Сегодня AI уже сделал синтез. Возвращайся завтра ✨",
    ai_error: "Не удалось сгенерировать синтез. Попробуй позже.",
    essence_label: "Суть дня",
    windows_label: "Окна",
    do_label: "Действия",
    no_windows: "Сегодня нет острых временных пиков — энергия ровная.",
    no_challenges: "Зон давления нет.",
    quality: {
      flowing:   "Потоковый день",
      mixed:     "Смешанный день",
      turbulent: "Турбулентный день",
      quiet:     "Спокойный день",
    },
    no_natal_hint: "Сохрани натальные данные в кабинете — получишь персональные аспекты и окна удачи.",
    cta_cabinet: "Заполнить натал →",
    general_mode: "Общий режим",
    general_mode_note: "Без времени и места рождения показана только общая лунная погода дня — одинаковая для всех. Добавь натал для персональных транзитов.",
    why_support: "поддерживают",
    why_press: "давят",
    why: {
      flowing:   "День потоковый, потому что преобладают поддерживающие аспекты",
      mixed:     "День смешанный: поддержка и напряжение уравновешены",
      turbulent: "День турбулентный, потому что преобладают напряжённые аспекты",
      quiet:     "День спокойный: активных аспектов сегодня немного",
    } as Record<DayReading["quality"], string>,
    astro_basis: "Астрологическая основа",
    astro_basis_sub: "Конкретные транзиты, на которых построен день",
    astro_basis_empty: "Без натальных данных аспекты к твоей карте не считаются — показана общая лунная погода. Заполни натал в кабинете, чтобы увидеть персональные транзиты (Луна тригон твоя Венера и т.д.).",
    legend_signal: "Сигнал",
    legend_polarity: { supporting: "поддерживает", challenging: "давит", neutral: "нейтрально" },
    legend_system: { astro: "Астро", numerology: "Нумерология", moon: "Луна", tarot: "Tarot", "fixed-star": "Звезда" } as Record<SignalSystem, string>,
  },
  en: {
    tag: "Astrology + Numerology",
    title: "Your horoscope for today",
    sub: "Not 'every Aries hears the same thing'. A convergence of signals from astrology, numerology and the Moon into a single focused theme.",
    section_signals: "Today's signals",
    section_timeline: "Day timeline",
    section_windows: "Windows of luck",
    section_challenges: "Pressure zones",
    section_do: "Do today",
    section_avoid: "Avoid today",
    section_ai: "AI synthesis",
    ai_cta: "Expand into a poetic synthesis",
    ai_loading: "Thinking through your signals…",
    ai_anon: "The poetic synthesis is for signed-in users. The signals + windows above are free.",
    ai_signin: "Create account →",
    ai_rate: "Today's AI synthesis is already done. Come back tomorrow ✨",
    ai_error: "Could not generate the synthesis. Try again later.",
    essence_label: "Essence",
    windows_label: "Windows",
    do_label: "Actions",
    no_windows: "Today has no sharp time peaks — even energy.",
    no_challenges: "No pressure zones.",
    quality: {
      flowing:   "A flowing day",
      mixed:     "A mixed day",
      turbulent: "A turbulent day",
      quiet:     "A quiet day",
    },
    no_natal_hint: "Save your birth data in the cabinet — you'll get personal aspects + windows of luck.",
    cta_cabinet: "Fill in natal →",
    general_mode: "General mode",
    general_mode_note: "Without birth time and place, only the general lunar weather is shown — the same for everyone. Add your birth data for personal transits.",
    why_support: "support",
    why_press: "press",
    why: {
      flowing:   "A flowing day — supporting aspects dominate",
      mixed:     "A mixed day: support and tension are balanced",
      turbulent: "A turbulent day — tense aspects dominate",
      quiet:     "A quiet day: few active aspects today",
    } as Record<DayReading["quality"], string>,
    astro_basis: "Astrological basis",
    astro_basis_sub: "The concrete transits the day is built on",
    astro_basis_empty: "Without birth data no aspects to your chart are computed — only the general lunar weather is shown. Fill in your natal in the cabinet to see personal transits (Moon trine your Venus, etc.).",
    legend_signal: "Signal",
    legend_polarity: { supporting: "supports", challenging: "presses", neutral: "neutral" },
    legend_system: { astro: "Astro", numerology: "Numerology", moon: "Moon", tarot: "Tarot", "fixed-star": "Star" } as Record<SignalSystem, string>,
  },
};

// Numerology Personal Day (Pythagorean reduction). Shared with Today widget.
function reduce(n: number): number {
  if (n === 11 || n === 22 || n === 33) return n;
  if (n < 10) return n;
  return reduce(String(n).split("").reduce((a, d) => a + parseInt(d, 10), 0));
}
function calcPersonalDay(birthDate: string, today: Date): number | null {
  const m = birthDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  const bM = parseInt(m[2], 10);
  const bD = parseInt(m[3], 10);
  const cY = today.getFullYear();
  const cM = today.getMonth() + 1;
  const cD = today.getDate();
  const py = reduce(reduce(bD) + reduce(bM)
                   + reduce(String(cY).split("").reduce((a, c) => a + parseInt(c, 10), 0)));
  const pm = reduce(py + reduce(cM));
  return reduce(pm + reduce(cD));
}

function signalCounts(signals: ConvergenceSignal[]): { sup: number; chl: number } {
  let sup = 0, chl = 0;
  for (const s of signals) {
    if (s.polarity === "supporting") sup++;
    else if (s.polarity === "challenging") chl++;
  }
  return { sup, chl };
}

export default function HoroscopePage() {
  const { language } = useLanguage();
  const lang: "uk" | "ru" | "en" = language === "ru" ? "ru" : language === "en" ? "en" : "uk";
  const t = T[lang];
  const signNames = lang === "ru" ? SIGNS_RU : lang === "en" ? SIGNS_EN : SIGNS_UA;
  const { profile } = useProfile();

  useEffect(() => { track("tool_viewed", { tool: "horoscope" }); }, []);

  // ── Engine compute ──────────────────────────────────────────────────────
  const reading = useMemo<DayReading>(() => {
    const now = new Date();
    const tzOffset = -now.getTimezoneOffset() / 60;
    const natalSnapshot = profile ? computeNatalSnapshot({
      birth_date: profile.birth_date ?? "",
      birth_time: profile.birth_time ?? "",
      birth_lat:  profile.birth_lat ?? 0,
      birth_lon:  profile.birth_lon ?? 0,
      birth_tz:   profile.birth_tz ?? "",
    }) : null;

    return buildDayReading({
      date: now,
      tzOffsetHours: tzOffset,
      language: lang,
      natal: natalSnapshot ? {
        sun:     natalSnapshot.sun,
        moon:    natalSnapshot.moon,
        mercury: natalSnapshot.mercury,
        venus:   natalSnapshot.venus,
        mars:    natalSnapshot.mars,
        jupiter: natalSnapshot.jupiter,
        saturn:  natalSnapshot.saturn,
        asc:     natalSnapshot.asc,
        mc:      natalSnapshot.mc,
      } : undefined,
      numerology: profile?.birth_date ? {
        personalDay: calcPersonalDay(profile.birth_date, now) ?? undefined,
      } : undefined,
      firstName: profile?.display_name ?? profile?.full_name?.split(/\s+/)[0] ?? undefined,
    });
  }, [profile, lang]);

  // Moon snapshot for the hero card
  const moonInfo = useMemo(() => {
    const now = new Date();
    const tz = -now.getTimezoneOffset() / 60;
    const jd = dateToJD(now.getFullYear(), now.getMonth() + 1, now.getDate(),
                        now.getHours(), now.getMinutes(), tz);
    const moonLon = calcPlanetDeg(1, jd);
    const sign = Math.floor(((moonLon % 360) + 360) % 360 / 30);
    const phase = moonPhaseAt(jd);
    return { sign, phase, lon: moonLon };
  }, []);

  // ── AI portrait ─────────────────────────────────────────────────────────
  const [portrait, setPortrait] = useState<{ essence?: string; windows?: string; do?: string } | null>(null);
  const [portraitLoading, setPortraitLoading] = useState(false);
  const [portraitError, setPortraitError] = useState<"none" | "auth" | "rate" | "other">("none");

  async function handlePortrait() {
    setPortraitLoading(true);
    setPortraitError("none");
    try {
      const topSignals = reading.signals.slice(0, 5).map(s => `• ${s.label}`).join("\n");
      const windowsTxt = reading.windowsOfLuck.length > 0
        ? reading.windowsOfLuck.map(w => `${formatHM(w.startMinutes)}–${formatHM(w.endMinutes)}`).join(", ")
        : "—";
      const challengesTxt = reading.challengeWindows.length > 0
        ? reading.challengeWindows.map(w => `${formatHM(w.startMinutes)}–${formatHM(w.endMinutes)}`).join(", ")
        : "—";
      const res = await fetch("/api/horoscope-portrait", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: lang,
          name: profile?.display_name ?? profile?.full_name?.split(/\s+/)[0] ?? "",
          quality: reading.quality,
          theme: reading.theme,
          topSignals,
          windowsOfLuck: windowsTxt,
          challenges: challengesTxt,
          moonSign: signNames[moonInfo.sign],
          moonPhase: PHASE_LABEL[lang][moonInfo.phase],
          personalDay: reading.signals.find(s => s.system === "numerology")?.label.match(/\d+/)?.[0] ?? "",
        }),
      });
      if (res.status === 401) { setPortraitError("auth"); return; }
      if (res.status === 429) { setPortraitError("rate"); return; }
      const data = await res.json();
      if (data.error) { setPortraitError("other"); return; }
      setPortrait(data);
      track("horoscope_portrait");
    } catch {
      setPortraitError("other");
    } finally {
      setPortraitLoading(false);
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────
  const todayLabel = useMemo(() => {
    const now = new Date();
    const locale = lang === "ru" ? "ru-RU" : lang === "en" ? "en-US" : "uk-UA";
    return now.toLocaleDateString(locale, { weekday: "long", day: "numeric", month: "long" });
  }, [lang]);

  const qualityColor = {
    flowing:   { bg: "rgba(122,170,108,0.10)", border: "rgba(122,170,108,0.3)", text: "#3F6A35" },
    mixed:     { bg: "rgba(212,168,83,0.10)",  border: "rgba(212,168,83,0.35)", text: "#9A6E28" },
    turbulent: { bg: "rgba(154,110,40,0.12)",  border: "rgba(154,110,40,0.35)", text: "#7A3E18" },
    quiet:     { bg: "rgba(196,169,122,0.08)", border: "rgba(196,169,122,0.25)", text: "#7A6A58" },
  }[reading.quality];

  // Why the day is what it is + whether we're in personalised or general mode.
  const { sup, chl } = signalCounts(reading.signals);
  const hasAstroSignals = reading.signals.some(s => s.system === "astro");
  const whyLine = `${t.why[reading.quality]} — ${sup} ${t.why_support} / ${chl} ${t.why_press}.`;

  return (
    <>
      <section className="pt-36 pb-12 bg-[#FDFBF7] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(196,169,122,0.1),transparent)]" />
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <AnimatedSection>
            <span className="tag mb-6 inline-block">{t.tag}</span>
            <h1 className="text-[clamp(2.5rem,5vw,4.5rem)] text-[#1C1512] mb-4 leading-[1.06]"
                style={{ fontFamily: "var(--font-cormorant)", fontWeight: 400 }}>
              {t.title}
            </h1>
            <p className="text-xl text-[#7A6A58] leading-relaxed">{t.sub}</p>
          </AnimatedSection>
        </div>
      </section>

      <GoldDivider />

      <section className="section-padding bg-[#FDFBF7]">
        <div className="max-w-3xl lg:max-w-5xl mx-auto px-6 space-y-6">
          {/* ── Hero — quality-coloured theme ── */}
          <AnimatedSection>
            <div className="card-luxury" style={{ background: qualityColor.bg, borderColor: qualityColor.border }}>
              <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
                <span className="text-xs tracking-widest uppercase" style={{ color: qualityColor.text }}>
                  {todayLabel}
                </span>
                <div className="flex items-center gap-2">
                  {!hasAstroSignals && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[rgba(196,169,122,0.15)] text-[#7A6A58] border border-[rgba(196,169,122,0.3)] tracking-wide uppercase">
                      {t.general_mode}
                    </span>
                  )}
                  <span className="text-xs font-medium" style={{ color: qualityColor.text }}>
                    {t.quality[reading.quality]}
                  </span>
                </div>
              </div>
              <p className="text-xl text-[#1C1512] leading-relaxed"
                 style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}>
                {reading.theme}
              </p>
              {/* Why this day — explain the quality from the signal balance */}
              <p className="text-sm text-[#5C4530] leading-relaxed mt-2 italic">
                {whyLine}
              </p>
              <div className="flex items-center gap-4 mt-4 text-sm text-[#5C4530] flex-wrap">
                <span className="flex items-center gap-1.5">
                  <MoonStar size={14} className="text-[#B8883A]" />
                  {SIGN_GLYPHS[moonInfo.sign]} {signNames[moonInfo.sign]} · {PHASE_LABEL[lang][moonInfo.phase]}
                </span>
                {profile?.birth_date && (() => {
                  const pd = calcPersonalDay(profile.birth_date, new Date());
                  if (pd == null) return null;
                  return (
                    <span className="flex items-center gap-1.5">
                      <Hash size={14} className="text-[#B8883A]" />
                      Personal Day {pd}
                    </span>
                  );
                })()}
              </div>
            </div>
          </AnimatedSection>

          {/* ── No natal hint ── */}
          {!profile?.birth_date && (
            <div className="card-luxury">
              <p className="text-sm text-[#5C4530] leading-relaxed">{t.no_natal_hint}</p>
              <Link href={`/${lang}/account`} className="inline-block mt-3 text-sm text-[#B8883A] hover:text-[#7A6A58] underline">
                {t.cta_cabinet}
              </Link>
            </div>
          )}

          {/* ── Signals ── */}
          <SignalsCard signals={reading.signals} lang={lang} t={t} />

          {/* ── Day timeline ── */}
          <DayTimeline
            windows={reading.windowsOfLuck}
            challenges={reading.challengeWindows}
            lang={lang}
            t={t}
          />

          {/* ── Windows of luck list ── */}
          <WindowList
            title={t.section_windows}
            polarity="supporting"
            windows={reading.windowsOfLuck}
            emptyLabel={t.no_windows}
            lang={lang}
          />

          {/* ── Challenge windows list ── */}
          <WindowList
            title={t.section_challenges}
            polarity="challenging"
            windows={reading.challengeWindows}
            emptyLabel={t.no_challenges}
            lang={lang}
          />

          {/* ── Astrological basis (collapsible) — concrete transits ── */}
          <AstroBasis signals={reading.signals} hasAstro={hasAstroSignals} t={t} />

          {/* ── Do / Avoid ── */}
          {(reading.doToday.length > 0 || reading.avoidToday.length > 0) && (
            <div className="grid sm:grid-cols-2 gap-4">
              {reading.doToday.length > 0 && (
                <div className="card-luxury bg-[rgba(122,170,108,0.06)] border-[rgba(122,170,108,0.25)]">
                  <p className="text-[10px] text-[#3F6A35] tracking-widest uppercase mb-3">{t.section_do}</p>
                  <ul className="space-y-1.5 text-sm text-[#5C4530]">
                    {reading.doToday.map((s, i) => <li key={i} className="leading-relaxed">→ {s}</li>)}
                  </ul>
                </div>
              )}
              {reading.avoidToday.length > 0 && (
                <div className="card-luxury bg-[rgba(154,110,40,0.06)] border-[rgba(154,110,40,0.25)]">
                  <p className="text-[10px] text-[#7A3E18] tracking-widest uppercase mb-3">{t.section_avoid}</p>
                  <ul className="space-y-1.5 text-sm text-[#5C4530]">
                    {reading.avoidToday.map((s, i) => <li key={i} className="leading-relaxed">✗ {s}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* ── AI portrait ── */}
          <PortraitBlock
            lang={lang}
            portrait={portrait}
            loading={portraitLoading}
            error={portraitError}
            onRun={handlePortrait}
            t={t}
          />
        </div>
      </section>
    </>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Sub-components
// ──────────────────────────────────────────────────────────────────────────

function SignalsCard({ signals, lang, t }: {
  signals: ConvergenceSignal[];
  lang: "uk" | "ru" | "en";
  t: typeof T["uk"];
}) {
  if (signals.length === 0) return null;
  const sysIcon: Record<SignalSystem, string> = {
    astro: "♃", numerology: "Ω", moon: "☽", tarot: "🃏", "fixed-star": "✦",
  };
  return (
    <div className="card-luxury">
      <h3 className="text-xl text-[#1C1512] mb-4" style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}>
        {t.section_signals}
      </h3>
      <ul className="space-y-2.5">
        {signals.map((s, i) => {
          const polColor = s.polarity === "supporting" ? "#3F6A35" : s.polarity === "challenging" ? "#7A3E18" : "#7A6A58";
          const intDots = "●".repeat(s.intensity) + "○".repeat(3 - s.intensity);
          return (
            <li key={i} className="p-3 rounded-xl border border-[rgba(196,169,122,0.15)] bg-[rgba(196,169,122,0.05)]">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-base text-[#C4A97A] w-5 text-center">{sysIcon[s.system]}</span>
                <span className="text-[10px] text-[#9A8A78] tracking-widest uppercase">{t.legend_system[s.system]}</span>
                <span className="text-[10px] tabular-nums" style={{ color: polColor }}>{intDots}</span>
                <span className="text-[10px] ml-auto" style={{ color: polColor }}>· {t.legend_polarity[s.polarity]}</span>
              </div>
              <p className="text-sm text-[#1C1512] leading-relaxed" style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}>
                {s.label}
              </p>
              <p className="text-[11px] text-[#7A6A58] italic mt-0.5">{s.reasoning}</p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function DayTimeline({ windows, challenges, lang, t }: {
  windows: TimeWindow[];
  challenges: TimeWindow[];
  lang: "uk" | "ru" | "en";
  t: typeof T["uk"];
}) {
  const totalMinutes = 24 * 60;
  return (
    <div className="card-luxury">
      <h3 className="text-xl text-[#1C1512] mb-4" style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}>
        {t.section_timeline}
      </h3>
      <div className="relative h-14 bg-[rgba(196,169,122,0.08)] rounded-xl overflow-hidden border border-[rgba(196,169,122,0.18)]">
        {/* Hour ticks */}
        {[0, 6, 12, 18, 24].map(h => {
          const pct = (h * 60) / totalMinutes * 100;
          return (
            <div key={h}
                 className="absolute top-0 h-full border-l border-[rgba(196,169,122,0.18)] text-[9px] text-[#9A8A78] pl-1"
                 style={{ left: `${pct}%` }}>
              {h.toString().padStart(2, "0")}:00
            </div>
          );
        })}
        {/* Challenge bars (drawn first so luck bars overlay on top) */}
        {challenges.map((w, i) => {
          const left = (w.startMinutes / totalMinutes) * 100;
          const width = ((w.endMinutes - w.startMinutes) / totalMinutes) * 100;
          return (
            <div key={`c-${i}`}
                 title={`${formatHM(w.startMinutes)}–${formatHM(w.endMinutes)}`}
                 className="absolute top-1/2 -translate-y-1/2 h-6 rounded-md bg-[rgba(154,110,40,0.45)] border border-[rgba(154,110,40,0.7)]"
                 style={{ left: `${left}%`, width: `${width}%` }} />
          );
        })}
        {/* Luck bars */}
        {windows.map((w, i) => {
          const left = (w.startMinutes / totalMinutes) * 100;
          const width = ((w.endMinutes - w.startMinutes) / totalMinutes) * 100;
          return (
            <div key={`w-${i}`}
                 title={`${formatHM(w.startMinutes)}–${formatHM(w.endMinutes)}`}
                 className="absolute top-1/2 -translate-y-1/2 h-6 rounded-md bg-[rgba(122,170,108,0.55)] border border-[rgba(122,170,108,0.75)]"
                 style={{ left: `${left}%`, width: `${width}%` }} />
          );
        })}
        {/* Now indicator */}
        <NowIndicator totalMinutes={totalMinutes} />
      </div>
      <div className="flex items-center gap-4 text-[11px] text-[#7A6A58] mt-3 flex-wrap">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-[rgba(122,170,108,0.55)] border border-[rgba(122,170,108,0.75)]" />
          {lang === "ru" ? "окно удачи" : lang === "en" ? "luck window" : "вікно удачі"}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-[rgba(154,110,40,0.45)] border border-[rgba(154,110,40,0.7)]" />
          {lang === "ru" ? "зона давления" : lang === "en" ? "pressure zone" : "зона тиску"}
        </span>
        <span className="flex items-center gap-1.5 ml-auto">
          <span className="w-px h-3 bg-[#B8883A]" />
          {lang === "ru" ? "сейчас" : lang === "en" ? "now" : "зараз"}
        </span>
      </div>
    </div>
  );
}

function NowIndicator({ totalMinutes }: { totalMinutes: number }) {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const recompute = () => {
      const now = new Date();
      const m = now.getHours() * 60 + now.getMinutes();
      setPct((m / totalMinutes) * 100);
    };
    recompute();
    const id = setInterval(recompute, 60_000);
    return () => clearInterval(id);
  }, [totalMinutes]);
  return (
    <div className="absolute top-0 h-full w-px bg-[#B8883A] shadow-[0_0_4px_rgba(184,136,58,0.5)]"
         style={{ left: `${pct}%` }} />
  );
}

function WindowList({ title, windows, emptyLabel, polarity, lang }: {
  title: string; windows: TimeWindow[]; emptyLabel: string;
  polarity: "supporting" | "challenging";
  lang: "uk" | "ru" | "en";
}) {
  if (windows.length === 0) {
    return (
      <div className="card-luxury">
        <p className="text-[10px] text-[#C4A97A] tracking-widest uppercase mb-2">{title}</p>
        <p className="text-sm text-[#7A6A58] italic leading-relaxed">{emptyLabel}</p>
      </div>
    );
  }
  return (
    <div className="card-luxury">
      <h3 className="text-xl text-[#1C1512] mb-3" style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}>
        {title}
      </h3>
      <ul className="space-y-2.5">
        {windows.map((w, i) => {
          const colour = polarity === "supporting" ? "#3F6A35" : "#7A3E18";
          const bg     = polarity === "supporting" ? "rgba(122,170,108,0.08)" : "rgba(154,110,40,0.08)";
          const border = polarity === "supporting" ? "rgba(122,170,108,0.3)"  : "rgba(154,110,40,0.3)";
          return (
            <li key={i} className="p-3 rounded-xl border" style={{ background: bg, borderColor: border }}>
              <div className="flex items-center gap-3 mb-1.5">
                <span className="text-base font-mono tabular-nums" style={{ color: colour }}>
                  {formatHM(w.startMinutes)}–{formatHM(w.endMinutes)}
                </span>
                <span className="text-[10px] text-[#9A8A78]">
                  · {lang === "ru" ? `пик ${w.peakScore}` : lang === "en" ? `peak ${w.peakScore}` : `пік ${w.peakScore}`}
                </span>
              </div>
              <p className="text-sm text-[#5C4530] leading-relaxed">{w.directive}</p>
              {w.signals.length > 0 && (
                <p className="text-[11px] text-[#7A6A58] italic mt-1.5">
                  {lang === "ru" ? "сигналы: " : lang === "en" ? "signals: " : "сигнали: "}
                  {w.signals.join(", ")}
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function AstroBasis({ signals, hasAstro, t }: {
  signals: ConvergenceSignal[];
  hasAstro: boolean;
  t: typeof T["uk"];
}) {
  const [open, setOpen] = useState(false);
  const astro = signals.filter(s => s.system === "astro");
  return (
    <div className="card-luxury">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full gap-3 text-left"
      >
        <div>
          <h3 className="text-xl text-[#1C1512]" style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}>
            {t.astro_basis}
          </h3>
          <p className="text-[11px] text-[#9A8A78] mt-0.5">{t.astro_basis_sub}</p>
        </div>
        <span className={`text-[#B8883A] transition-transform duration-200 inline-block shrink-0 ${open?"rotate-180":""}`}>▾</span>
      </button>
      {open && (
        <div className="mt-4">
          {hasAstro && astro.length > 0 ? (
            <ul className="space-y-2.5">
              {astro.map((s, i) => {
                const polColor = s.polarity === "supporting" ? "#3F6A35" : s.polarity === "challenging" ? "#7A3E18" : "#7A6A58";
                return (
                  <li key={i} className="p-3 rounded-xl border border-[rgba(196,169,122,0.15)] bg-[rgba(196,169,122,0.05)] flex items-start gap-3">
                    <span className="text-base text-[#C4A97A] mt-0.5">♃</span>
                    <div className="flex-1">
                      <p className="text-sm text-[#1C1512]" style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}>
                        {s.label}
                      </p>
                      <p className="text-[11px] text-[#7A6A58] italic mt-0.5">{s.reasoning}</p>
                    </div>
                    <span className="text-[10px]" style={{ color: polColor }}>{t.legend_polarity[s.polarity]}</span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-sm text-[#7A6A58] leading-relaxed italic">{t.astro_basis_empty}</p>
          )}
        </div>
      )}
    </div>
  );
}

function PortraitBlock({ lang, portrait, loading, error, onRun, t }: {
  lang: "uk" | "ru" | "en";
  portrait: { essence?: string; windows?: string; do?: string } | null;
  loading: boolean;
  error: "none" | "auth" | "rate" | "other";
  onRun: () => void;
  t: typeof T["uk"];
}) {
  if (error === "auth") {
    return (
      <div className="card-luxury">
        <div className="flex items-start gap-3 mb-3">
          <Lock size={18} className="text-[#B8883A] flex-shrink-0 mt-0.5" />
          <h3 className="text-xl text-[#1C1512]" style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}>
            {t.section_ai}
          </h3>
        </div>
        <p className="text-sm text-[#5C4530] leading-relaxed mb-4">{t.ai_anon}</p>
        <Link href={`/${lang}/account/sign-in?next=/${lang}/studio/horoscope`} className="btn-primary inline-flex">
          {t.ai_signin}
        </Link>
      </div>
    );
  }

  return (
    <div className="card-luxury">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D4A853] to-[#C4A97A] flex items-center justify-center text-white">
          <Sparkles size={18} />
        </div>
        <h3 className="text-xl text-[#1C1512]" style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}>
          {t.section_ai}
        </h3>
      </div>

      {portrait ? (
        <div className="space-y-4">
          {portrait.essence && (
            <div className="p-4 rounded-xl bg-[rgba(212,168,83,0.10)] border border-[rgba(212,168,83,0.32)]">
              <p className="text-[10px] text-[#C4A97A] tracking-widest uppercase mb-2">{t.essence_label}</p>
              <p className="text-sm text-[#5C4530] leading-relaxed whitespace-pre-wrap">{portrait.essence}</p>
            </div>
          )}
          {portrait.windows && (
            <div className="p-4 rounded-xl bg-[rgba(196,169,122,0.05)] border border-[rgba(196,169,122,0.18)]">
              <p className="text-[10px] text-[#C4A97A] tracking-widest uppercase mb-2">{t.windows_label}</p>
              <p className="text-sm text-[#5C4530] leading-relaxed whitespace-pre-wrap">{portrait.windows}</p>
            </div>
          )}
          {portrait.do && (
            <div className="p-4 rounded-xl bg-[rgba(122,170,108,0.06)] border border-[rgba(122,170,108,0.25)]">
              <p className="text-[10px] text-[#3F6A35] tracking-widest uppercase mb-2">{t.do_label}</p>
              <p className="text-sm text-[#5C4530] leading-relaxed whitespace-pre-wrap">{portrait.do}</p>
            </div>
          )}
        </div>
      ) : error === "rate" ? (
        <p className="text-sm text-[#7A6A58] italic text-center py-3">{t.ai_rate}</p>
      ) : (
        <>
          <button type="button" onClick={onRun} disabled={loading} className="btn-primary w-full disabled:opacity-60">
            {loading ? <><Loader2 size={14} className="animate-spin" /> {t.ai_loading}</>
                     : <><Sparkles size={14} /> {t.ai_cta}</>}
          </button>
          {error === "other" && <p className="text-sm text-[#9A6E28] mt-3 text-center">{t.ai_error}</p>}
        </>
      )}
    </div>
  );
}
