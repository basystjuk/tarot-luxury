"use client";

/**
 * Year Forecast tool (Phase H2) — Solar Return + Secondary Progressions.
 *
 * Deterministic engine (lib/astro/progressions.ts) computes:
 *   - Solar Return chart (theme of the year, SR Sun house, SR Ascendant)
 *   - Secondary progressions (progressed Sun/Moon = current inner season)
 *   - Progressed→natal aspects, 12-month progressed-Moon timeline
 *
 * Pulls birth data from the cabinet (like the horoscope tool). Anonymous /
 * incomplete-profile users get a clear CTA. AI synthesis is auth-gated.
 */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Sparkles, Loader2, Lock, Sun, Moon, CalendarRange, Compass } from "lucide-react";
import AnimatedSection from "@/components/ui/AnimatedSection";
import GoldDivider from "@/components/ui/GoldDivider";
import { useLanguage } from "@/hooks/useLanguage";
import { useProfile } from "@/hooks/useProfile";
import { dateToJD, calcPlanetDeg, SIGN_GLYPHS, SIGNS_UA, SIGNS_EN } from "@/lib/astro/calculations";
import { ianaToOffsetHours } from "@/app/[lang]/studio/moon-phase/_natal";
import { buildYearForecast } from "@/lib/astro/progressions";
import type { PlanetName, AspectKind } from "@/lib/astro/synastry";
import { track } from "@/lib/analytics/posthog";

const SIGNS_RU = ["Овен","Телец","Близнецы","Рак","Лев","Дева","Весы","Скорпион","Стрелец","Козерог","Водолей","Рыбы"];

const PLANET_GLYPH: Record<PlanetName, string> = { Sun:"☉", Moon:"☽", Mercury:"☿", Venus:"♀", Mars:"♂", Jupiter:"♃", Saturn:"♄" };
const ASPECT_GLYPH: Record<AspectKind, string> = { conjunction:"☌", sextile:"⚹", square:"□", trine:"△", opposition:"☍" };
// element index = sign % 4 → 0 Fire, 1 Earth, 2 Air, 3 Water
const ELEM_COLOR = ["#C9603F", "#7A8C4E", "#C9A24F", "#4F86A8"];

const T = {
  uk: {
    tag: "Соляр + Прогресії",
    title: "Твій прогноз на рік",
    sub: "Соляр задає тему року, прогресивний Місяць — твою внутрішню емоційну пору. Дві перевірені часом техніки в одному прогнозі.",
    need_data: "Щоб скласти прогноз року, потрібні дата, час і місце народження.",
    need_cta: "Заповнити дані →",
    approx_note: "Без часу народження Асцендент соляра й доми приблизні. Прогресивні Сонце і Місяць показані за полуднем.",
    age: "Вік",
    solar_year: "Соляр-рік",
    theme_of_year: "Тема року",
    sr_asc: "Асцендент соляра",
    sr_sun_house: "Сонце соляра в домі",
    house_label: "Дім",
    season: "Емоційна пора",
    prog_moon: "Прогресивний Місяць",
    prog_sun: "Прогресивне Сонце",
    moon_change: "Зміна пори",
    moon_change_none: "цього циклу залишається в тому ж знаку",
    timeline: "Стрічка року · прогрес-Місяць",
    aspects: "Прогресивні аспекти до натальної карти",
    aspects_empty: "Тісних прогресивних аспектів цього року немає — рік рівний, без різких поворотів.",
    prog: "прогр.", natal: "натал.",
    ai: "AI-синтез прогнозу",
    ai_cta: "Розгорнути прогноз року",
    ai_loading: "Складаю прогноз…",
    ai_anon: "Поетичний прогноз доступний зареєстрованим. Розрахунки вище — для всіх.",
    ai_signin: "Створити акаунт →",
    ai_rate: "Сьогодні прогноз року вже згенеровано. Повертайся завтра ✨",
    ai_error: "Не вдалось згенерувати прогноз. Спробуй пізніше.",
    th_theme: "Тема року", th_season: "Пора", th_focus: "Фокус",
    months: ["Зараз","+1","+2","+3","+4","+5","+6","+7","+8","+9","+10","+11","+12"],
  },
  ru: {
    tag: "Соляр + Прогрессии",
    title: "Твой прогноз на год",
    sub: "Соляр задаёт тему года, прогрессивная Луна — твою внутреннюю эмоциональную пору. Две проверенные временем техники в одном прогнозе.",
    need_data: "Чтобы составить прогноз года, нужны дата, время и место рождения.",
    need_cta: "Заполнить данные →",
    approx_note: "Без времени рождения Асцендент соляра и дома приблизительны. Прогрессивные Солнце и Луна показаны на полдень.",
    age: "Возраст",
    solar_year: "Соляр-год",
    theme_of_year: "Тема года",
    sr_asc: "Асцендент соляра",
    sr_sun_house: "Солнце соляра в доме",
    house_label: "Дом",
    season: "Эмоциональная пора",
    prog_moon: "Прогрессивная Луна",
    prog_sun: "Прогрессивное Солнце",
    moon_change: "Смена поры",
    moon_change_none: "в этом цикле остаётся в том же знаке",
    timeline: "Лента года · прогресс-Луна",
    aspects: "Прогрессивные аспекты к натальной карте",
    aspects_empty: "Тесных прогрессивных аспектов в этом году нет — год ровный, без резких поворотов.",
    prog: "прогр.", natal: "натал.",
    ai: "AI-синтез прогноза",
    ai_cta: "Развернуть прогноз года",
    ai_loading: "Составляю прогноз…",
    ai_anon: "Поэтический прогноз доступен зарегистрированным. Расчёты выше — для всех.",
    ai_signin: "Создать аккаунт →",
    ai_rate: "Сегодня прогноз года уже сгенерирован. Возвращайся завтра ✨",
    ai_error: "Не удалось сгенерировать прогноз. Попробуй позже.",
    th_theme: "Тема года", th_season: "Пора", th_focus: "Фокус",
    months: ["Сейчас","+1","+2","+3","+4","+5","+6","+7","+8","+9","+10","+11","+12"],
  },
  en: {
    tag: "Solar Return + Progressions",
    title: "Your forecast for the year",
    sub: "The Solar Return sets the year's theme; the progressed Moon is your inner emotional season. Two time-tested techniques in one forecast.",
    need_data: "To build a year forecast we need your birth date, time and place.",
    need_cta: "Fill in your data →",
    approx_note: "Without a birth time the Solar Return Ascendant and houses are approximate. Progressed Sun and Moon are shown for noon.",
    age: "Age",
    solar_year: "Solar year",
    theme_of_year: "Theme of the year",
    sr_asc: "Solar Return Ascendant",
    sr_sun_house: "SR Sun in house",
    house_label: "House",
    season: "Emotional season",
    prog_moon: "Progressed Moon",
    prog_sun: "Progressed Sun",
    moon_change: "Season shift",
    moon_change_none: "stays in the same sign this cycle",
    timeline: "Year strip · progressed Moon",
    aspects: "Progressed aspects to the natal chart",
    aspects_empty: "No tight progressed aspects this year — a steady year without sharp turns.",
    prog: "prog.", natal: "natal",
    ai: "AI forecast synthesis",
    ai_cta: "Expand the year forecast",
    ai_loading: "Composing the forecast…",
    ai_anon: "The poetic forecast is for signed-in users. The calculations above are free.",
    ai_signin: "Create account →",
    ai_rate: "Today's year forecast is already generated. Come back tomorrow ✨",
    ai_error: "Could not generate the forecast. Try again later.",
    th_theme: "Theme", th_season: "Season", th_focus: "Focus",
    months: ["Now","+1","+2","+3","+4","+5","+6","+7","+8","+9","+10","+11","+12"],
  },
};

const HOUSE_MEANING: Record<"uk"|"ru"|"en", string[]> = {
  uk: ["Я, тіло, новий старт","Гроші, цінності, ресурси","Спілкування, навчання, оточення","Дім, сім'я, коріння","Творчість, любов, діти","Робота, здоров'я, рутина","Партнерство, шлюб, союзи","Трансформація, близькість, кризи","Подорожі, сенси, навчання","Кар'єра, статус, мета","Друзі, спільноти, мрії","Усамітнення, духовність, завершення"],
  ru: ["Я, тело, новый старт","Деньги, ценности, ресурсы","Общение, учёба, окружение","Дом, семья, корни","Творчество, любовь, дети","Работа, здоровье, рутина","Партнёрство, брак, союзы","Трансформация, близость, кризисы","Путешествия, смыслы, учёба","Карьера, статус, цель","Друзья, сообщества, мечты","Уединение, духовность, завершение"],
  en: ["Self, body, fresh start","Money, values, resources","Communication, learning, circle","Home, family, roots","Creativity, love, children","Work, health, routine","Partnership, marriage, unions","Transformation, intimacy, crises","Travel, meaning, study","Career, status, goal","Friends, community, dreams","Solitude, spirit, completion"],
};

export default function YearForecastPage() {
  const { language } = useLanguage();
  const lang: "uk" | "ru" | "en" = language === "ru" ? "ru" : language === "en" ? "en" : "uk";
  const t = T[lang];
  const signs = lang === "ru" ? SIGNS_RU : lang === "en" ? SIGNS_EN : SIGNS_UA;
  const { profile } = useProfile();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { track("tool_viewed", { tool: "year-forecast" }); }, []);
  useEffect(() => { const id = setTimeout(() => setMounted(true), 60); return () => clearTimeout(id); }, []);

  const data = useMemo(() => {
    if (!profile?.birth_date) return null;
    const [y, mo, d] = profile.birth_date.split("-").map(n => parseInt(n, 10));
    if (![y, mo, d].every(Number.isFinite)) return null;
    const hasTime = Boolean(profile.birth_time);
    const [h, mi] = hasTime ? profile.birth_time!.split(":").map(n => parseInt(n, 10)) : [12, 0];
    const hasPlace = profile.birth_lat != null && profile.birth_lon != null && Boolean(profile.birth_tz);
    const tzOff = hasPlace ? ianaToOffsetHours(new Date(Date.UTC(y, mo - 1, d, h, mi)), profile.birth_tz!) : 0;
    const natalJd = dateToJD(y, mo, d, h, mi, tzOff);
    const natalSun = calcPlanetDeg(0, natalJd);
    const natal: Partial<Record<PlanetName, number>> = {
      Sun: natalSun, Moon: calcPlanetDeg(1, natalJd), Mercury: calcPlanetDeg(2, natalJd),
      Venus: calcPlanetDeg(3, natalJd), Mars: calcPlanetDeg(4, natalJd),
      Jupiter: calcPlanetDeg(5, natalJd), Saturn: calcPlanetDeg(6, natalJd),
    };
    const forecast = buildYearForecast({
      natalJd, natalSunLon: natalSun, natal, birthMonth: mo, birthDay: d,
      lat: hasPlace ? profile.birth_lat : null, lon: hasPlace ? profile.birth_lon : null,
    });
    return { forecast, hasTime, hasPlace };
  }, [profile]);

  // ── AI ──
  const [portrait, setPortrait] = useState<{ theme?: string; season?: string; focus?: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<"none" | "auth" | "rate" | "other">("none");

  async function handlePortrait() {
    if (!data) return;
    setLoading(true); setError("none");
    try {
      const f = data.forecast;
      const aspectsTxt = f.progToNatalAspects.slice(0, 6)
        .map(a => `${t.prog} ${PLANET_GLYPH[a.a]} ${ASPECT_GLYPH[a.kind]} ${t.natal} ${PLANET_GLYPH[a.b]} (±${a.orb.toFixed(1)}°)`).join("\n") || "—";
      const res = await fetch("/api/year-forecast-portrait", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: lang,
          name: profile?.display_name ?? profile?.full_name?.split(/\s+/)[0] ?? "",
          age: f.ageYears,
          srAscSign: f.solarReturn ? signs[f.solarReturn.ascSign] : "",
          srSunHouse: f.solarReturn ? String(f.solarReturn.sunHouse) : "",
          progSunSign: signs[f.progressed.sunSign],
          progMoonSign: signs[f.progressed.moonSign],
          progMoonChange: f.progMoonNextSignChange
            ? `${signs[f.progMoonNextSignChange.sign]} (${f.progMoonNextSignChange.isoDate})` : "—",
          progAspects: aspectsTxt,
        }),
      });
      if (res.status === 401) { setError("auth"); return; }
      if (res.status === 429) { setError("rate"); return; }
      const j = await res.json();
      if (j.error) { setError("other"); return; }
      setPortrait(j);
      track("year_forecast_portrait");
    } catch { setError("other"); }
    finally { setLoading(false); }
  }

  return (
    <>
      <section className="pt-36 pb-12 bg-[#FDFBF7] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(196,169,122,0.12),transparent)]" />
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <AnimatedSection>
            <span className="tag mb-6 inline-block">{t.tag}</span>
            <h1 className="text-[clamp(2.5rem,5vw,4.5rem)] text-[#1C1512] mb-4 leading-[1.06]" style={{ fontFamily: "var(--font-cormorant)", fontWeight: 400 }}>
              {t.title}
            </h1>
            <p className="text-xl text-[#7A6A58] leading-relaxed">{t.sub}</p>
          </AnimatedSection>
        </div>
      </section>

      <GoldDivider />

      <section className="section-padding bg-[#FDFBF7]">
        <div className="max-w-3xl lg:max-w-5xl mx-auto px-6 space-y-6">

          {!data ? (
            <AnimatedSection>
              <div className="card-luxury text-center">
                <CalendarRange size={32} className="text-[#C4A97A] mx-auto mb-4" />
                <p className="text-[#5C4530] leading-relaxed mb-4">{t.need_data}</p>
                <Link href={`/${lang}/account`} className="btn-primary inline-flex">{t.need_cta}</Link>
              </div>
            </AnimatedSection>
          ) : (
            <>
              {/* Hero — age, solar year, season at a glance */}
              <AnimatedSection>
                <div className="card-luxury bg-[rgba(212,168,83,0.08)] border-[rgba(212,168,83,0.3)]">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <Stat label={t.age} value={String(Math.round(data.forecast.ageYears))} mounted={mounted} />
                    <Stat label={t.solar_year}
                          value={data.forecast.solarReturn ? `#${Math.round(data.forecast.ageYears)}` : "—"} mounted={mounted} />
                    <div>
                      <p className="text-[10px] text-[#C4A97A] tracking-widest uppercase mb-1">{t.prog_moon}</p>
                      <p className="text-lg text-[#1C1512]" style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}>
                        {SIGN_GLYPHS[data.forecast.progressed.moonSign]} {signs[data.forecast.progressed.moonSign]}
                      </p>
                    </div>
                  </div>
                  {!data.hasTime && (
                    <p className="text-[11px] text-[#7A3E18] italic mt-4 text-center">🕛 {t.approx_note}</p>
                  )}
                </div>
              </AnimatedSection>

              {/* Solar Return wheel + theme */}
              {data.forecast.solarReturn && (
                <AnimatedSection delay={0.05}>
                  <div className="grid md:grid-cols-2 gap-5 items-center">
                    <YearWheel sunHouse={data.forecast.solarReturn.sunHouse} ascSign={data.forecast.solarReturn.ascSign} mounted={mounted} />
                    <div className="space-y-4">
                      <div>
                        <p className="text-[10px] text-[#C4A97A] tracking-widest uppercase mb-1">{t.sr_asc}</p>
                        <p className="text-2xl text-[#1C1512] flex items-center gap-2" style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}>
                          <Compass size={20} className="text-[#B8883A]" />
                          {SIGN_GLYPHS[data.forecast.solarReturn.ascSign]} {signs[data.forecast.solarReturn.ascSign]}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-[#C4A97A] tracking-widest uppercase mb-1">{t.sr_sun_house}</p>
                        <p className="text-2xl text-[#1C1512] flex items-center gap-2" style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}>
                          <Sun size={20} className="text-[#B8883A]" />
                          {t.house_label} {data.forecast.solarReturn.sunHouse}
                        </p>
                        <p className="text-sm text-[#5C4530] italic mt-1">{HOUSE_MEANING[lang][data.forecast.solarReturn.sunHouse - 1]}</p>
                      </div>
                    </div>
                  </div>
                </AnimatedSection>
              )}

              {/* Emotional season — progressed Moon */}
              <AnimatedSection delay={0.1}>
                <div className="card-luxury">
                  <div className="flex items-center gap-2 mb-3">
                    <Moon size={18} className="text-[#B8883A]" />
                    <h3 className="text-xl text-[#1C1512]" style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}>{t.season}</h3>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="p-3 rounded-xl bg-[rgba(196,169,122,0.06)] border border-[rgba(196,169,122,0.15)]">
                      <p className="text-[10px] text-[#C4A97A] tracking-widest uppercase mb-1">{t.prog_moon}</p>
                      <p className="text-lg text-[#1C1512]">{SIGN_GLYPHS[data.forecast.progressed.moonSign]} {signs[data.forecast.progressed.moonSign]}</p>
                      <p className="text-xs text-[#7A6A58] mt-1">
                        {t.moon_change}: {data.forecast.progMoonNextSignChange
                          ? `${SIGN_GLYPHS[data.forecast.progMoonNextSignChange.sign]} ${signs[data.forecast.progMoonNextSignChange.sign]} · ${data.forecast.progMoonNextSignChange.isoDate}`
                          : t.moon_change_none}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-[rgba(196,169,122,0.06)] border border-[rgba(196,169,122,0.15)]">
                      <p className="text-[10px] text-[#C4A97A] tracking-widest uppercase mb-1">{t.prog_sun}</p>
                      <p className="text-lg text-[#1C1512]">{SIGN_GLYPHS[data.forecast.progressed.sunSign]} {signs[data.forecast.progressed.sunSign]}</p>
                    </div>
                  </div>

                  {/* 12-month progressed-Moon strip */}
                  <p className="text-[10px] text-[#C4A97A] tracking-widest uppercase mt-5 mb-2">{t.timeline}</p>
                  <div className="flex gap-1">
                    {data.forecast.moonTimeline.map((p, i) => (
                      <div key={i} className="flex-1 group relative">
                        <div className="h-8 rounded transition-all duration-700"
                             style={{
                               background: ELEM_COLOR[p.sign % 4],
                               opacity: mounted ? 0.45 + (p.sign % 4) * 0.0 + 0.25 : 0,
                               transform: mounted ? "scaleY(1)" : "scaleY(0.2)",
                               transformOrigin: "bottom",
                               transitionDelay: `${i * 40}ms`,
                             }}
                             title={`${t.months[i]} · ${signs[p.sign]}`} />
                        <p className="text-[8px] text-center text-[#9A8A78] mt-1">{SIGN_GLYPHS[p.sign]}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </AnimatedSection>

              {/* Progressed → natal aspects */}
              <AnimatedSection delay={0.15}>
                <div className="card-luxury">
                  <h3 className="text-xl text-[#1C1512] mb-3" style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}>{t.aspects}</h3>
                  {data.forecast.progToNatalAspects.length === 0 ? (
                    <p className="text-sm text-[#7A6A58] italic">{t.aspects_empty}</p>
                  ) : (
                    <ul className="space-y-1.5">
                      {data.forecast.progToNatalAspects.slice(0, 8).map((a, i) => {
                        const color = a.polarity === "harmonious" ? "#3F6A35" : a.polarity === "tense" ? "#9A6E28" : "#7A6A58";
                        const bg = a.polarity === "harmonious" ? "rgba(122,170,108,0.08)" : a.polarity === "tense" ? "rgba(154,110,40,0.08)" : "rgba(196,169,122,0.06)";
                        return (
                          <li key={i} className="flex items-center gap-2 p-2 rounded-lg text-sm" style={{ background: bg }}>
                            <span className="text-[10px] text-[#9A8A78]">{t.prog}</span>
                            <span className="text-[#B8883A]">{PLANET_GLYPH[a.a]}</span>
                            <span style={{ color }} className="font-medium">{ASPECT_GLYPH[a.kind]}</span>
                            <span className="text-[10px] text-[#9A8A78]">{t.natal}</span>
                            <span className="text-[#B8883A]">{PLANET_GLYPH[a.b]}</span>
                            <span className="text-[10px] text-[#9A8A78] ml-auto tabular-nums">±{a.orb.toFixed(1)}°</span>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </AnimatedSection>

              {/* AI synthesis */}
              <AnimatedSection delay={0.2}>
                <PortraitBlock lang={lang} portrait={portrait} loading={loading} error={error} onRun={handlePortrait} t={t} />
              </AnimatedSection>
            </>
          )}
        </div>
      </section>
    </>
  );
}

// ── Animated count-up stat ──
function Stat({ label, value, mounted }: { label: string; value: string; mounted: boolean }) {
  const num = parseInt(value, 10);
  const [shown, setShown] = useState(value);
  useEffect(() => {
    if (!mounted || !Number.isFinite(num)) { setShown(value); return; }
    let cur = 0; const step = Math.max(1, Math.ceil(num / 18));
    const id = setInterval(() => {
      cur += step;
      if (cur >= num) { cur = num; clearInterval(id); }
      setShown(String(cur));
    }, 35);
    return () => clearInterval(id);
  }, [mounted, num, value]);
  return (
    <div>
      <p className="text-[10px] text-[#C4A97A] tracking-widest uppercase mb-1">{label}</p>
      <p className="text-3xl text-[#1C1512]" style={{ fontFamily: "var(--font-cormorant)", fontWeight: 600 }}>{shown}</p>
    </div>
  );
}

// ── Schematic year wheel — 12 equal houses, SR Sun highlighted ──
function YearWheel({ sunHouse, ascSign, mounted }: { sunHouse: number; ascSign: number; mounted: boolean }) {
  const cx = 150, cy = 150, rO = 142, rI = 96;
  // House 1 starts at the left (9 o'clock), houses run counter-clockwise.
  function pt(angleDeg: number, r: number) {
    const rad = (angleDeg * Math.PI) / 180;
    return { x: cx - r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }
  function segPath(i: number) {
    const a0 = i * 30, a1 = (i + 1) * 30;
    const p0 = pt(a0, rO), p1 = pt(a1, rO), p2 = pt(a1, rI), p3 = pt(a0, rI);
    return `M ${p0.x} ${p0.y} A ${rO} ${rO} 0 0 1 ${p1.x} ${p1.y} L ${p2.x} ${p2.y} A ${rI} ${rI} 0 0 0 ${p3.x} ${p3.y} Z`;
  }
  const sunMid = pt((sunHouse - 1) * 30 + 15, (rO + rI) / 2);
  return (
    <div className="card-luxury">
      <svg viewBox="0 0 300 300" className="w-full max-w-[300px] mx-auto"
           style={{ transition: "opacity 0.8s, transform 0.8s", opacity: mounted ? 1 : 0, transform: mounted ? "rotate(0deg)" : "rotate(-12deg)" }}
           role="img" aria-label="Solar return year wheel">
        {Array.from({ length: 12 }, (_, i) => {
          const isSun = i === sunHouse - 1;
          const mid = pt(i * 30 + 15, (rO + rI) / 2 + 22);
          return (
            <g key={i}>
              <path d={segPath(i)}
                    fill={isSun ? "rgba(212,168,83,0.30)" : "rgba(196,169,122,0.06)"}
                    stroke="rgba(196,169,122,0.35)" strokeWidth="0.7" />
              <text x={mid.x} y={mid.y} textAnchor="middle" dominantBaseline="central"
                    fontSize="9" fill={isSun ? "#9A6E28" : "rgba(122,106,88,0.7)"} fontWeight={isSun ? "700" : "400"}>
                {i + 1}
              </text>
            </g>
          );
        })}
        <circle cx={cx} cy={cy} r={rI} fill="none" stroke="rgba(196,169,122,0.3)" strokeWidth="0.6" />
        <circle cx={cx} cy={cy} r={rO} fill="none" stroke="rgba(196,169,122,0.4)" strokeWidth="1" />
        {/* ASC marker at left */}
        <text x={cx - rO - 6} y={cy} textAnchor="middle" dominantBaseline="central" fontSize="9" fill="#B8883A" fontWeight="bold">AC</text>
        {/* SR Sun glyph with gentle pulse */}
        <g style={{ transition: "opacity 0.6s 0.4s", opacity: mounted ? 1 : 0 }}>
          <circle cx={sunMid.x} cy={sunMid.y} r="13" fill="rgba(253,251,247,0.95)" stroke="#D4A853" strokeWidth="1.2" className="animate-pulse" />
          <text x={sunMid.x} y={sunMid.y} textAnchor="middle" dominantBaseline="central" fontSize="14" fill="#B8883A">☉</text>
        </g>
        {/* Center sign of ASC */}
        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fontSize="22" fill="rgba(184,136,58,0.5)">{SIGN_GLYPHS[ascSign]}</text>
      </svg>
    </div>
  );
}

function PortraitBlock({ lang, portrait, loading, error, onRun, t }: {
  lang: "uk" | "ru" | "en";
  portrait: { theme?: string; season?: string; focus?: string } | null;
  loading: boolean; error: "none" | "auth" | "rate" | "other"; onRun: () => void; t: typeof T["uk"];
}) {
  if (error === "auth") {
    return (
      <div className="card-luxury">
        <div className="flex items-start gap-3 mb-3">
          <Lock size={18} className="text-[#B8883A] flex-shrink-0 mt-0.5" />
          <h3 className="text-xl text-[#1C1512]" style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}>{t.ai}</h3>
        </div>
        <p className="text-sm text-[#5C4530] leading-relaxed mb-4">{t.ai_anon}</p>
        <Link href={`/${lang}/account/sign-in?next=/${lang}/studio/year-forecast`} className="btn-primary inline-flex">{t.ai_signin}</Link>
      </div>
    );
  }
  return (
    <div className="card-luxury">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D4A853] to-[#C4A97A] flex items-center justify-center text-white"><Sparkles size={18} /></div>
        <h3 className="text-xl text-[#1C1512]" style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}>{t.ai}</h3>
      </div>
      {portrait ? (
        <div className="space-y-4">
          {portrait.theme && <Block label={t.th_theme} text={portrait.theme} tone="gold" />}
          {portrait.season && <Block label={t.th_season} text={portrait.season} tone="neutral" />}
          {portrait.focus && <Block label={t.th_focus} text={portrait.focus} tone="green" />}
        </div>
      ) : error === "rate" ? (
        <p className="text-sm text-[#7A6A58] italic text-center py-3">{t.ai_rate}</p>
      ) : (
        <>
          <button type="button" onClick={onRun} disabled={loading} className="btn-primary w-full disabled:opacity-60">
            {loading ? <><Loader2 size={14} className="animate-spin" /> {t.ai_loading}</> : <><Sparkles size={14} /> {t.ai_cta}</>}
          </button>
          {error === "other" && <p className="text-sm text-[#9A6E28] mt-3 text-center">{t.ai_error}</p>}
        </>
      )}
    </div>
  );
}

function Block({ label, text, tone }: { label: string; text: string; tone: "gold"|"neutral"|"green" }) {
  const styles = {
    gold:    { bg: "rgba(212,168,83,0.10)", border: "rgba(212,168,83,0.32)", label: "#C4A97A" },
    neutral: { bg: "rgba(196,169,122,0.05)", border: "rgba(196,169,122,0.18)", label: "#C4A97A" },
    green:   { bg: "rgba(122,170,108,0.06)", border: "rgba(122,170,108,0.25)", label: "#3F6A35" },
  }[tone];
  return (
    <div className="p-4 rounded-xl border" style={{ background: styles.bg, borderColor: styles.border }}>
      <p className="text-[10px] tracking-widest uppercase mb-2" style={{ color: styles.label }}>{label}</p>
      <p className="text-sm text-[#5C4530] leading-relaxed whitespace-pre-wrap">{text}</p>
    </div>
  );
}
