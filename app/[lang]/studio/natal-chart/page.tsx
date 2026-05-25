"use client";

/**
 * Natal Chart tool (Phase М17).
 *
 * What this is:
 *   - Full birth chart with 10 planets + ASC + MC + Placidus houses
 *   - Visual wheel (SVG): sign ring, house cusps, planets, aspect grid
 *   - Aspect list (all natal-to-natal aspects within standard orbs)
 *   - AI psychological portrait (3 sections: essence / gifts / work)
 *
 * Data source priority:
 *   1. Cabinet profile (auto-fill if signed in)
 *   2. Manual entry (Nominatim city autocomplete + tz-lookup, same as
 *      the Moon Guide natal form)
 *
 * Auth posture (Phase В rule):
 *   - Anonymous: can compute + see the full chart + houses + aspect
 *     grid. Free educational value.
 *   - AI portrait: signed-in only — that's the conversion hook.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, Check, MapPin, Sparkles, Lock } from "lucide-react";
import Link from "next/link";
import AnimatedSection from "@/components/ui/AnimatedSection";
import GoldDivider from "@/components/ui/GoldDivider";
import { useLanguage } from "@/hooks/useLanguage";
import { useProfile } from "@/hooks/useProfile";
import {
  dateToJD, calcPlanetDeg, calcLST, calcAscendant, calcMC,
  calcPlacidusHouses, whichPlacidusHouse, formatDegree,
  SIGN_GLYPHS, SIGNS_UA, SIGNS_EN,
} from "@/lib/astro/calculations";
import type { AspectKey } from "@/lib/astro/natal-snapshot";
import { meaningSun, meaningMoon, meaningAsc, meaningMc, meaningAspect } from "./_meanings";
import {
  type GeoCandidate,
  searchCity, coordsToIana, ianaToOffsetHours,
} from "@/app/[lang]/studio/moon-phase/_natal";
import { track } from "@/lib/analytics/posthog";

const SIGNS_RU = [
  "Овен", "Телец", "Близнецы", "Рак", "Лев", "Дева",
  "Весы", "Скорпион", "Стрелец", "Козерог", "Водолей", "Рыбы",
];

const PLANET_KEYS = ["sun","moon","mercury","venus","mars","jupiter","saturn","uranus","neptune","pluto"] as const;
type PlanetKey = typeof PLANET_KEYS[number];
const PLANET_GLYPH: Record<string, string> = {
  Sun: "☉", Moon: "☽", Mercury: "☿", Venus: "♀", Mars: "♂",
  Jupiter: "♃", Saturn: "♄", Uranus: "♅", Neptune: "♆", Pluto: "♇",
  ASC: "AC", MC: "MC",
};
const PLANET_LABEL: Record<string, { uk: string; ru: string; en: string }> = {
  Sun:     { uk: "Сонце",   ru: "Солнце",   en: "Sun" },
  Moon:    { uk: "Місяць",  ru: "Луна",     en: "Moon" },
  Mercury: { uk: "Меркурій",ru: "Меркурий", en: "Mercury" },
  Venus:   { uk: "Венера",  ru: "Венера",   en: "Venus" },
  Mars:    { uk: "Марс",    ru: "Марс",     en: "Mars" },
  Jupiter: { uk: "Юпітер",  ru: "Юпитер",   en: "Jupiter" },
  Saturn:  { uk: "Сатурн",  ru: "Сатурн",   en: "Saturn" },
  Uranus:  { uk: "Уран",    ru: "Уран",     en: "Uranus" },
  Neptune: { uk: "Нептун",  ru: "Нептун",   en: "Neptune" },
  Pluto:   { uk: "Плутон",  ru: "Плутон",   en: "Pluto" },
  ASC:     { uk: "Асцендент", ru: "Асцендент", en: "Ascendant" },
  MC:      { uk: "МедКоелі",  ru: "Медиум Коэли", en: "Midheaven" },
};
const ASPECT_GLYPH: Record<AspectKey, string> = {
  conjunction: "☌", sextile: "⚹", square: "□", trine: "△", opposition: "☍",
};
const ASPECT_COLOR: Record<AspectKey, string> = {
  conjunction: "#B8883A", trine: "#3F6A35", sextile: "#5A8A65",
  square: "#9A6E28", opposition: "#7A3E18",
};

const T = {
  uk: {
    tag: "Натальна карта",
    title: "Твоя натальна карта",
    sub: "Повна карта народження з усіма планетами, домами Placidus та психологічним AI-портретом.",
    section_input: "Дані народження",
    cabinet_filled: "Дані підтягнуті з кабінету",
    edit: "Редагувати",
    name: "Як до тебе звертатись",
    name_ph: "Олена",
    date: "Дата народження",
    time: "Час народження",
    time_hint: "Якщо точно не знаєш — постав 12:00 (ASC і будинки будуть приблизні).",
    place: "Місце народження",
    place_ph: "Почни вводити — Київ, Львів, …",
    tz: "Таймзона",
    compute: "Розрахувати карту",
    computing: "Розраховуємо…",
    section_wheel: "Чарт",
    section_planets: "Планети + Дома (Placidus)",
    section_aspects: "Натальні аспекти",
    section_portrait: "AI-портрет",
    portrait_cta: "Отримати психологічний портрет",
    portrait_loading: "Думаю над твоєю картою…",
    portrait_anon: "AI-портрет доступний зареєстрованим. Сама карта + дома + аспекти вище — для всіх.",
    portrait_signin: "Створити акаунт →",
    portrait_rate: "Сьогодні портрет вже зроблений. Повертайся завтра ✨",
    portrait_error: "Не вдалось згенерувати портрет. Спробуй пізніше.",
    essence_label: "Сутність",
    gifts_label: "Дари",
    work_label: "Робота",
    privacy: "Дані залишаються у твоєму браузері й акаунті — нікуди більше не йдуть.",
    house_n: (n: number) => `${n}-й дім`,
    no_aspects: "У межах класичних орбіт натальних аспектів не знайдено.",
  },
  ru: {
    tag: "Натальная карта",
    title: "Твоя натальная карта",
    sub: "Полная карта рождения со всеми планетами, домами Placidus и психологическим AI-портретом.",
    section_input: "Данные рождения",
    cabinet_filled: "Данные подтянуты из кабинета",
    edit: "Редактировать",
    name: "Как к тебе обращаться",
    name_ph: "Елена",
    date: "Дата рождения",
    time: "Время рождения",
    time_hint: "Если точно не знаешь — поставь 12:00 (АСЦ и дома будут приблизительными).",
    place: "Место рождения",
    place_ph: "Начни вводить — Киев, Львов, …",
    tz: "Таймзона",
    compute: "Рассчитать карту",
    computing: "Рассчитываем…",
    section_wheel: "Чарт",
    section_planets: "Планеты + Дома (Placidus)",
    section_aspects: "Натальные аспекты",
    section_portrait: "AI-портрет",
    portrait_cta: "Получить психологический портрет",
    portrait_loading: "Думаю над твоей картой…",
    portrait_anon: "AI-портрет доступен зарегистрированным. Сама карта + дома + аспекты выше — для всех.",
    portrait_signin: "Создать аккаунт →",
    portrait_rate: "Сегодня портрет уже сделан. Возвращайся завтра ✨",
    portrait_error: "Не удалось сгенерировать портрет. Попробуй позже.",
    essence_label: "Суть",
    gifts_label: "Дары",
    work_label: "Работа",
    privacy: "Данные остаются в твоём браузере и аккаунте — никуда больше не уходят.",
    house_n: (n: number) => `${n}-й дом`,
    no_aspects: "В пределах классических орбит натальных аспектов не найдено.",
  },
  en: {
    tag: "Natal Chart",
    title: "Your natal chart",
    sub: "A complete birth chart with all planets, Placidus houses and a psychological AI portrait.",
    section_input: "Birth data",
    cabinet_filled: "Loaded from your account",
    edit: "Edit",
    name: "How should we address you",
    name_ph: "Olena",
    date: "Birth date",
    time: "Birth time",
    time_hint: "If you don't know exactly — use 12:00 (ASC and houses will be approximate).",
    place: "Birth place",
    place_ph: "Start typing — Kyiv, London, …",
    tz: "Timezone",
    compute: "Compute the chart",
    computing: "Computing…",
    section_wheel: "Chart",
    section_planets: "Planets + Houses (Placidus)",
    section_aspects: "Natal aspects",
    section_portrait: "AI Portrait",
    portrait_cta: "Get the psychological portrait",
    portrait_loading: "Reading your chart…",
    portrait_anon: "The AI portrait is for signed-in users. The chart, houses and aspects above are free.",
    portrait_signin: "Create account →",
    portrait_rate: "Today's portrait is already done. Come back tomorrow ✨",
    portrait_error: "Could not generate the portrait. Try again later.",
    essence_label: "Essence",
    gifts_label: "Gifts",
    work_label: "Work",
    privacy: "Data stays in your browser + account — nowhere else.",
    house_n: (n: number) => `house ${n}`,
    no_aspects: "No natal aspects detected within classical orbs.",
  },
};

// Natal-to-natal orbs (Phase М7 — wider than transit because natal is static).
const NATAL_ORBS: Record<AspectKey, number> = {
  conjunction: 8, opposition: 8, square: 7, trine: 7, sextile: 5,
};

function detectNatalAspects(planets: Record<string, number>): Array<{ a: string; b: string; kind: AspectKey; orb: number }> {
  const ASPECT_ANGLES: Record<AspectKey, number> = {
    conjunction: 0, sextile: 60, square: 90, trine: 120, opposition: 180,
  };
  const names = Object.keys(planets);
  const out: Array<{ a: string; b: string; kind: AspectKey; orb: number }> = [];
  for (let i = 0; i < names.length; i++) {
    for (let j = i + 1; j < names.length; j++) {
      const a = names[i], b = names[j];
      let diff = Math.abs(planets[a] - planets[b]) % 360;
      if (diff > 180) diff = 360 - diff;
      for (const [kind, angle] of Object.entries(ASPECT_ANGLES) as [AspectKey, number][]) {
        const dev = Math.abs(diff - angle);
        if (dev <= NATAL_ORBS[kind]) {
          out.push({ a, b, kind, orb: dev });
          break;
        }
      }
    }
  }
  return out.sort((x, y) => x.orb - y.orb);
}

interface NatalChartData {
  planets: Record<string, number>;
  asc: number;
  mc: number;
  cusps: number[];
  jd: number;
}

function computeChart(birthDate: string, birthTime: string, lat: number, lon: number, tz: string): NatalChartData | null {
  const [y, mo, d] = birthDate.split("-").map(n => parseInt(n, 10));
  const [h, mi] = birthTime.split(":").map(n => parseInt(n, 10));
  if (![y, mo, d, h, mi].every(Number.isFinite)) return null;

  const approxUtc = new Date(Date.UTC(y, mo - 1, d, h, mi));
  const tzOffset = ianaToOffsetHours(approxUtc, tz);
  const jd = dateToJD(y, mo, d, h, mi, tzOffset);
  const lst = calcLST(jd, lon);
  const e = 23.439291111;

  const planets: Record<string, number> = {
    Sun:     calcPlanetDeg(0, jd),
    Moon:    calcPlanetDeg(1, jd),
    Mercury: calcPlanetDeg(2, jd),
    Venus:   calcPlanetDeg(3, jd),
    Mars:    calcPlanetDeg(4, jd),
    Jupiter: calcPlanetDeg(5, jd),
    Saturn:  calcPlanetDeg(6, jd),
    Uranus:  calcPlanetDeg(7, jd),
    Neptune: calcPlanetDeg(8, jd),
    Pluto:   calcPlanetDeg(9, jd),
  };
  const asc = calcAscendant(lst, lat, e);
  const mc  = calcMC(lst, e);
  const cusps = calcPlacidusHouses(lst, lat, e);

  return { planets, asc, mc, cusps, jd };
}

export default function NatalChartPage() {
  const { language } = useLanguage();
  const lang: "uk" | "ru" | "en" = language === "ru" ? "ru" : language === "en" ? "en" : "uk";
  const t = T[lang];
  const signNames = lang === "ru" ? SIGNS_RU : lang === "en" ? SIGNS_EN : SIGNS_UA;
  const { profile } = useProfile();

  // ── Form state ─────────────────────────────────────────────────────────
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("12:00");
  const [placeQuery, setPlaceQuery] = useState("");
  const [picked, setPicked] = useState<GeoCandidate | null>(null);
  const [tz, setTz] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const [editMode, setEditMode] = useState(false);

  // ── Cabinet auto-fill ───────────────────────────────────────────────────
  useEffect(() => {
    if (hydrated || !profile) return;
    if (profile.birth_date && profile.birth_time && profile.birth_place
        && profile.birth_lat != null && profile.birth_lon != null && profile.birth_tz) {
      setName(profile.display_name ?? profile.full_name?.split(/\s+/)[0] ?? "");
      setBirthDate(profile.birth_date);
      setBirthTime(profile.birth_time.slice(0, 5));
      setPlaceQuery(profile.birth_place);
      setPicked({ label: profile.birth_place, lat: profile.birth_lat, lon: profile.birth_lon, rawType: "saved" });
      setTz(profile.birth_tz);
    }
    setHydrated(true);
  }, [profile, hydrated]);

  // Track tool view
  useEffect(() => { track("tool_viewed", { tool: "natal-chart" }); }, []);

  // ── City autocomplete ───────────────────────────────────────────────────
  const [suggestions, setSuggestions] = useState<GeoCandidate[]>([]);
  const [searching, setSearching] = useState(false);
  const [open, setOpen] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  useEffect(() => {
    if (picked && placeQuery === picked.label) return;
    if (placeQuery.trim().length < 2) { setSuggestions([]); return; }
    abortRef.current?.abort();
    const ac = new AbortController(); abortRef.current = ac;
    const id = setTimeout(async () => {
      setSearching(true);
      try {
        const list = await searchCity(placeQuery, language);
        if (!ac.signal.aborted) { setSuggestions(list); setOpen(list.length > 0); }
      } finally { if (!ac.signal.aborted) setSearching(false); }
    }, 350);
    return () => { clearTimeout(id); ac.abort(); };
  }, [placeQuery, language, picked]);

  useEffect(() => {
    if (!picked) { setTz(""); return; }
    if (picked.rawType === "saved" && tz) return; // already known
    let cancelled = false;
    (async () => {
      const resolved = await coordsToIana(picked.lat, picked.lon);
      if (!cancelled) setTz(resolved);
    })();
    return () => { cancelled = true; };
  }, [picked, tz]);

  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  // ── Chart compute ───────────────────────────────────────────────────────
  const [chart, setChart] = useState<NatalChartData | null>(null);
  const [computing, setComputing] = useState(false);

  function handleCompute() {
    if (!birthDate || !birthTime || !picked || !tz) return;
    setComputing(true);
    setTimeout(() => {
      const c = computeChart(birthDate, birthTime, picked.lat, picked.lon, tz);
      setChart(c);
      setPortrait(null);
      setComputing(false);
      track("natal_chart_computed");
    }, 50);
  }

  // ── AI portrait ─────────────────────────────────────────────────────────
  type Portrait = { essence?: string; gifts?: string; work?: string };
  const [portrait, setPortrait] = useState<Portrait | null>(null);
  const [portraitLoading, setPortraitLoading] = useState(false);
  const [portraitError, setPortraitError] = useState<"none" | "auth" | "rate" | "other">("none");

  async function handlePortrait() {
    if (!chart) return;
    setPortraitLoading(true);
    setPortraitError("none");
    try {
      const venusIdx = Math.floor(((chart.planets.Venus % 360) + 360) % 360 / 30);
      const marsIdx  = Math.floor(((chart.planets.Mars  % 360) + 360) % 360 / 30);
      const sunIdx   = Math.floor(((chart.planets.Sun   % 360) + 360) % 360 / 30);
      const moonIdx  = Math.floor(((chart.planets.Moon  % 360) + 360) % 360 / 30);
      const ascIdx   = Math.floor(((chart.asc % 360) + 360) % 360 / 30);
      const mcIdx    = Math.floor(((chart.mc  % 360) + 360) % 360 / 30);

      // Stellium detection: which house holds 3+ planets?
      const houseCount: Record<number, string[]> = {};
      for (const pkey of ["Sun","Moon","Mercury","Venus","Mars","Jupiter","Saturn","Uranus","Neptune","Pluto"] as const) {
        const h = whichPlacidusHouse(chart.planets[pkey], chart.cusps);
        houseCount[h] = houseCount[h] ?? [];
        houseCount[h].push(pkey);
      }
      const stellia = Object.entries(houseCount).filter(([, ps]) => ps.length >= 3)
        .map(([h, ps]) => `${h}: ${ps.join(", ")}`).join("; ") || "—";

      // Aspect summary
      const aspectList = detectNatalAspects(chart.planets);
      const aspectsTxt = aspectList.slice(0, 12).map(a =>
        `${a.a} ${ASPECT_GLYPH[a.kind]} ${a.b} (±${a.orb.toFixed(1)}°)`
      ).join("\n") || "—";

      const res = await fetch("/api/natal-chart-portrait", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language,
          name: name || "—",
          sunSign:  signNames[sunIdx],
          moonSign: signNames[moonIdx],
          ascSign:  signNames[ascIdx],
          mcSign:   signNames[mcIdx],
          venusSign: signNames[venusIdx],
          marsSign:  signNames[marsIdx],
          stelliums: stellia,
          majorAspects: aspectsTxt,
        }),
      });
      if (res.status === 401) { setPortraitError("auth"); return; }
      if (res.status === 429) { setPortraitError("rate"); return; }
      const data = await res.json();
      if (data.error) { setPortraitError("other"); return; }
      setPortrait(data);
      track("natal_chart_portrait");
    } catch {
      setPortraitError("other");
    } finally {
      setPortraitLoading(false);
    }
  }

  // ── Derived display values ──────────────────────────────────────────────
  const canCompute = Boolean(birthDate && birthTime && picked && tz);
  const cabinetComplete = Boolean(profile?.birth_date && profile?.birth_time && profile?.birth_place
                                  && profile?.birth_lat != null && profile?.birth_lon != null && profile?.birth_tz);

  const aspects = useMemo(() => chart ? detectNatalAspects(chart.planets) : [], [chart]);

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <>
      <section className="pt-36 pb-12 bg-[#FDFBF7] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(196,169,122,0.1),transparent)]" />
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <AnimatedSection>
            <span className="tag mb-6 inline-block">{t.tag}</span>
            <h1 className="text-[clamp(2.5rem,5vw,4.5rem)] text-[#1C1512] mb-6 leading-[1.06]"
                style={{ fontFamily: "var(--font-cormorant)", fontWeight: 400 }}>
              {t.title}
            </h1>
            <p className="text-xl text-[#7A6A58] leading-relaxed">{t.sub}</p>
          </AnimatedSection>
        </div>
      </section>

      <GoldDivider />

      <section className="section-padding bg-[#FDFBF7]">
        <div className="max-w-3xl mx-auto px-6 space-y-6">
          {/* ── Input form ── */}
          <AnimatedSection>
            <div className="card-luxury space-y-5">
              <h2 className="text-2xl text-[#1C1512]" style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}>
                {t.section_input}
              </h2>

              {cabinetComplete && !editMode && hydrated ? (
                <>
                  <div className="p-4 rounded-xl bg-[rgba(122,170,108,0.10)] border border-[rgba(122,170,108,0.3)] flex items-start gap-3">
                    <Check size={18} className="text-[#3F6A35] flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[#3F6A35]">{t.cabinet_filled}</p>
                      <p className="text-xs text-[#5C4530] mt-1.5">
                        {profile?.birth_date} · {profile?.birth_time?.slice(0, 5)} · {profile?.birth_place}
                      </p>
                      <button type="button" onClick={() => setEditMode(true)}
                              className="underline text-[#B8883A] hover:text-[#7A6A58] text-xs mt-1.5">
                        {t.edit}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-[#B8883A] tracking-widest uppercase mb-2">{t.name}</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)}
                           placeholder={t.name_ph}
                           className="input-luxury w-full" maxLength={80} />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-[#B8883A] tracking-widest uppercase mb-2">{t.date}</label>
                      <input type="date" value={birthDate}
                             onChange={e => setBirthDate(e.target.value)}
                             min="1900-01-01" max={new Date().toISOString().slice(0, 10)}
                             className="input-luxury w-full" />
                    </div>
                    <div>
                      <label className="block text-xs text-[#B8883A] tracking-widest uppercase mb-2">{t.time}</label>
                      <input type="time" value={birthTime}
                             onChange={e => setBirthTime(e.target.value)}
                             className="input-luxury w-full" />
                      <p className="text-[11px] text-[#9A8A78] italic mt-1.5 leading-snug">{t.time_hint}</p>
                    </div>
                  </div>
                  <div ref={containerRef}>
                    <label className="block text-xs text-[#B8883A] tracking-widest uppercase mb-2">{t.place}</label>
                    <div className="relative">
                      <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C4A97A]" />
                      <input type="text" value={placeQuery}
                             onChange={e => { setPlaceQuery(e.target.value); setPicked(null); }}
                             onFocus={() => suggestions.length > 0 && setOpen(true)}
                             placeholder={t.place_ph}
                             className="input-luxury w-full pl-10 pr-9" autoComplete="off" />
                      {searching && <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#C4A97A] animate-spin" />}
                      {!searching && picked && <Check size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#B8883A]" />}
                      {open && suggestions.length > 0 && (
                        <ul role="listbox"
                            className="absolute z-30 mt-1 w-full max-h-72 overflow-y-auto rounded-xl border border-[rgba(196,169,122,0.3)] bg-white shadow-[0_8px_30px_rgba(0,0,0,0.08)] py-1">
                          {suggestions.map((s, i) => (
                            <li key={`${s.lat}-${s.lon}-${i}`}>
                              <button type="button"
                                      onClick={() => { setPicked(s); setPlaceQuery(s.label); setOpen(false); }}
                                      className="w-full text-left px-4 py-2.5 text-sm hover:bg-[rgba(196,169,122,0.08)] flex items-start gap-2">
                                <MapPin size={14} className="text-[#C4A97A] mt-0.5 flex-shrink-0" />
                                <span className="text-[#1C1512]">{s.label}</span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    {picked && tz && (
                      <p className="text-[11px] text-[#9A8A78] mt-1.5 leading-snug">
                        {t.tz}: <span className="font-mono">{tz}</span>
                      </p>
                    )}
                  </div>
                  <p className="text-[11px] text-[#9A8A78] italic leading-snug">🔒 {t.privacy}</p>
                </div>
              )}

              <button type="button" onClick={handleCompute}
                      disabled={!canCompute || computing}
                      className="btn-primary w-full disabled:opacity-50">
                {computing ? <><Loader2 size={14} className="animate-spin" /> {t.computing}</> : t.compute}
              </button>
            </div>
          </AnimatedSection>

          {/* ── Chart result ── */}
          {chart && (
            <>
              {/* Wheel + Key Placements (side-by-side on desktop, stacked on mobile).
                  The Key Placements card surfaces the chart's "spine" (Sun/Moon/ASC/MC)
                  so a first-time visitor doesn't need to scan the full planet table to
                  find their core identity points. */}
              <div className="grid md:grid-cols-2 gap-5 items-start">
                <ChartWheel chart={chart} lang={lang} signNames={signNames} />
                <KeyPlacements chart={chart} lang={lang} signNames={signNames} />
              </div>

              {/* Full planet table */}
              <PlanetTable chart={chart} lang={lang} signNames={signNames} t={t} />

              {/* House cusps — explicit grid of all 12 cusps with formatted
                  degrees (mirrors the prior tool's "Куспіди будинків (Плацідус)"
                  card). The planet table already shows the house each planet
                  occupies; this block shows the cusp LONGITUDES themselves. */}
              <HouseCusps cusps={chart.cusps} lang={lang} />

              {/* Aspects between natal planets */}
              <AspectsList aspects={aspects} lang={lang} />

              {/* AI portrait (auth-gated) */}
              <PortraitBlock
                lang={lang}
                portrait={portrait}
                loading={portraitLoading}
                error={portraitError}
                onRun={handlePortrait}
                t={t}
              />

              {/* Accuracy disclaimer — same posture as the prior tool, but
                  rephrased to reflect the M1+M7 upgrades (planet positions
                  better than 0.1° for Mercury-Saturn; Placidus proper). */}
              <p className="text-xs text-[#7A6A58] text-center max-w-2xl mx-auto leading-relaxed">
                {lang === "ru"
                  ? "Расчёты используют JPL J2000 элементы планет (точность ~0.1° для Меркурия-Сатурна, ~1° для Урана-Плутона) и алгоритм Placidus (Meeus). Для глубокого разбора обратись к Ellen."
                  : lang === "en"
                  ? "Calculations use JPL J2000 planetary elements (~0.1° accuracy for Mercury-Saturn, ~1° for Uranus-Pluto) and the Placidus algorithm (Meeus). For a deep reading, book a session with Ellen."
                  : "Розрахунки використовують JPL J2000 елементи планет (точність ~0.1° для Меркурія-Сатурна, ~1° для Урана-Плутона) і алгоритм Placidus (Meeus). Для глибокого розбору запиши консультацію з Ellen."}
              </p>
            </>
          )}
        </div>
      </section>
    </>
  );
}

// ── Chart wheel SVG ─────────────────────────────────────────────────────────
function ChartWheel({ chart, lang, signNames }: {
  chart: NatalChartData; lang: "uk" | "ru" | "en"; signNames: string[];
}) {
  const cx = 200, cy = 200;
  const rOuter = 195, rSignInner = 165, rHouseInner = 145, rPlanet = 115;

  // Astrology charts use the convention: 0° Aries at the LEFT (east horizon
  // = Ascendant), increasing CCW. We map our longitudes so that the
  // Ascendant always sits at the 9-o'clock (left) point of the wheel.
  function toXY(deg: number, r: number): { x: number; y: number } {
    // Place ASC at 180° (left). Rotate by -asc + 180° in screen coords.
    const adj = ((deg - chart.asc + 180) % 360 + 360) % 360;
    const rad = (adj * Math.PI) / 180;
    return { x: cx - r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  return (
    <div className="card-luxury">
      <svg viewBox="0 0 400 400" className="w-full max-w-[400px] mx-auto" role="img" aria-label="Natal chart wheel">
        {/* Outer ring */}
        <circle cx={cx} cy={cy} r={rOuter} fill="none" stroke="rgba(196,169,122,0.4)" strokeWidth="1.2" />
        <circle cx={cx} cy={cy} r={rSignInner} fill="none" stroke="rgba(196,169,122,0.3)" strokeWidth="0.6" />
        <circle cx={cx} cy={cy} r={rHouseInner} fill="none" stroke="rgba(196,169,122,0.2)" strokeWidth="0.5" />

        {/* Sign divisions (every 30° starting from ASC) */}
        {Array.from({ length: 12 }, (_, i) => {
          const deg = i * 30;
          const a = toXY(deg, rOuter);
          const b = toXY(deg, rSignInner);
          const mid = toXY(deg + 15, (rOuter + rSignInner) / 2);
          // The sign at this slot — depends on where ASC's sign starts.
          // signIdx at this position = (floor((adj + asc) / 30)) % 12
          const adj = deg;
          const lonAtSlot = (chart.asc + adj) % 360;
          const sIdx = Math.floor(((lonAtSlot % 360) + 360) % 360 / 30);
          return (
            <g key={`sign-${i}`}>
              <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="rgba(196,169,122,0.4)" strokeWidth="0.8" />
              <text x={mid.x} y={mid.y} textAnchor="middle" dominantBaseline="central"
                    fontSize="11" fill="#B8883A" style={{ fontFamily: "var(--font-cormorant)" }}>
                {SIGN_GLYPHS[sIdx]}
              </text>
            </g>
          );
        })}

        {/* House cusps (Placidus) */}
        {chart.cusps.map((cusp, i) => {
          const inner = toXY(cusp, 25);
          const outer = toXY(cusp, rHouseInner);
          // Special styling for 1st, 4th, 7th, 10th — the angular houses.
          const isAngular = i === 0 || i === 3 || i === 6 || i === 9;
          const color = isAngular ? "#B8883A" : "rgba(196,169,122,0.4)";
          const width = isAngular ? 1.5 : 0.6;
          const dash  = isAngular ? "" : "2 3";
          // Label position
          const mid = toXY(cusp + 2, rHouseInner - 8);
          return (
            <g key={`cusp-${i}`}>
              <line x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y} stroke={color} strokeWidth={width} strokeDasharray={dash} />
              <text x={mid.x} y={mid.y} textAnchor="start" dominantBaseline="central"
                    fontSize="8" fill="rgba(122,106,88,0.7)">
                {i + 1}
              </text>
            </g>
          );
        })}

        {/* Planet markers — spread along radius if clustered */}
        {Object.entries(chart.planets).map(([name, lon], idx) => {
          const pos = toXY(lon, rPlanet);
          return (
            <g key={name}>
              <circle cx={pos.x} cy={pos.y} r={11}
                      fill="rgba(253,251,247,0.95)" stroke="rgba(196,169,122,0.5)" strokeWidth="0.8" />
              <text x={pos.x} y={pos.y} textAnchor="middle" dominantBaseline="central"
                    fontSize="11" fill="#B8883A"
                    style={{ fontFamily: "var(--font-cormorant)" }}>
                {PLANET_GLYPH[name]}
              </text>
              {/* Tiny degree label below */}
              <text x={pos.x} y={pos.y + 16} textAnchor="middle" dominantBaseline="central"
                    fontSize="6" fill="rgba(122,106,88,0.7)">
                {Math.floor(((lon % 30) + 30) % 30)}°
              </text>
              <text key={`spacer-${idx}`} />
            </g>
          );
        })}

        {/* ASC and MC labels */}
        {(() => {
          const ascPt = toXY(chart.asc, rOuter + 8);
          const mcPt  = toXY(chart.mc,  rOuter + 8);
          return (
            <g>
              <text x={ascPt.x} y={ascPt.y} textAnchor="middle" dominantBaseline="central"
                    fontSize="9" fill="#B8883A" fontWeight="bold">AC</text>
              <text x={mcPt.x}  y={mcPt.y}  textAnchor="middle" dominantBaseline="central"
                    fontSize="9" fill="#B8883A" fontWeight="bold">MC</text>
            </g>
          );
        })()}
      </svg>
      <p className="text-[11px] text-[#9A8A78] italic text-center mt-2">
        {lang === "ru" ? "Дома Placidus. AC слева, MC сверху."
          : lang === "en" ? "Placidus houses. AC on the left, MC on top."
          : "Дома Placidus. AC ліворуч, MC згори."}
      </p>
      <p className="text-[10px] text-[#9A8A78] italic text-center">
        {`Sign names: ${signNames.slice(0, 3).join(" · ")}…`}
      </p>
    </div>
  );
}

// ── Planet table ─────────────────────────────────────────────────────────
// ── Key Placements (Sun/Moon/ASC/MC summary card) ───────────────────────
// The chart's "spine" — what most laypeople check first. We highlight the
// four points in a compact card next to the wheel so they're visible
// without scrolling through the full planet table below.
function KeyPlacements({ chart, lang, signNames }: {
  chart: NatalChartData; lang: "uk" | "ru" | "en"; signNames: string[];
}) {
  const rows: Array<{
    key: string; lon: number; label: string;
    meaningFn: (idx: number, l: "uk" | "ru" | "en") => string;
  }> = [
    { key: "Sun",  lon: chart.planets.Sun,
      label: lang === "ru" ? "Солнце ☉" : lang === "en" ? "Sun ☉" : "Сонце ☉",
      meaningFn: meaningSun },
    { key: "Moon", lon: chart.planets.Moon,
      label: lang === "ru" ? "Луна ☽"   : lang === "en" ? "Moon ☽" : "Місяць ☽",
      meaningFn: meaningMoon },
    { key: "ASC",  lon: chart.asc,
      label: lang === "ru" ? "Асцендент" : lang === "en" ? "Ascendant" : "Асцендент",
      meaningFn: meaningAsc },
    { key: "MC",   lon: chart.mc,
      label: lang === "ru" ? "МС (Зенит)" : lang === "en" ? "MC (Midheaven)" : "МС (Зеніт)",
      meaningFn: meaningMc },
  ];
  return (
    <div className="card-luxury">
      <h3 className="text-2xl text-[#1C1512] mb-5" style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}>
        {lang === "ru" ? "Ключевые позиции" : lang === "en" ? "Key Placements" : "Ключові позиції"}
      </h3>
      <div className="space-y-4">
        {rows.map(({ key, lon, label, meaningFn }) => {
          const signIdx = Math.floor(((lon % 360) + 360) % 360 / 30);
          return (
            <div key={key} className="pb-3 border-b border-[rgba(196,169,122,0.15)] last:border-0 last:pb-0">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-sm text-[#7A6A58]">{label}</span>
                <div className="text-right">
                  <p className="text-[#1C1512] text-sm font-medium" style={{ fontFamily: "var(--font-cormorant)" }}>
                    {SIGN_GLYPHS[signIdx]} {signNames[signIdx]}
                  </p>
                  <p className="text-xs text-[#C4A97A] font-mono">{formatDegree(lon)}</p>
                </div>
              </div>
              {/* Canon interpretation — one short sentence per placement.
                  Sourced from modern psychological astrology (Greene/Forrest/
                  George); not AI-generated, so stable across reloads and
                  available to anonymous users. */}
              <p className="text-xs text-[#5C4530] italic leading-relaxed">
                {meaningFn(signIdx, lang)}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── House Cusps grid ────────────────────────────────────────────────────
// 12-cell grid showing each Placidus cusp's full ecliptic longitude.
// Complements the planet table (which shows which house each planet
// lives in) by exposing the cusp longitudes themselves — important for
// astrologers who want to read the chart precisely.
function HouseCusps({ cusps, lang }: { cusps: number[]; lang: "uk" | "ru" | "en" }) {
  return (
    <div className="card-luxury">
      <h3 className="text-2xl text-[#1C1512] mb-5" style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}>
        {lang === "ru" ? "Куспиды домов (Placidus)" : lang === "en" ? "House Cusps (Placidus)" : "Куспіди будинків (Placidus)"}
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {cusps.map((cusp, i) => {
          // 1, 4, 7, 10 are the angular cusps (ASC/IC/DSC/MC) — accent in gold.
          const isAngular = i === 0 || i === 3 || i === 6 || i === 9;
          return (
            <div key={i}
                 className={`text-sm py-2.5 px-3 rounded-lg border ${
                   isAngular
                     ? "bg-[rgba(212,168,83,0.10)] border-[rgba(212,168,83,0.35)]"
                     : "bg-[rgba(196,169,122,0.06)] border-[rgba(196,169,122,0.12)]"
                 }`}>
              <span className={`font-medium mr-2 ${isAngular ? "text-[#B8883A]" : "text-[#C4A97A]"}`}>
                {i + 1}
              </span>
              <span className="text-[#5C4530] font-mono text-xs">{formatDegree(cusp)}</span>
            </div>
          );
        })}
      </div>
      <p className="text-[11px] text-[#9A8A78] italic mt-3 text-center">
        {lang === "ru" ? "1 = АСЦ, 4 = IC, 7 = ДСЦ, 10 = МС (угловые дома)"
          : lang === "en" ? "1 = ASC, 4 = IC, 7 = DSC, 10 = MC (angular houses)"
          : "1 = АСЦ, 4 = IC, 7 = ДСЦ, 10 = МС (кутові доми)"}
      </p>
    </div>
  );
}

function PlanetTable({ chart, lang, signNames, t }: {
  chart: NatalChartData; lang: "uk" | "ru" | "en"; signNames: string[];
  t: typeof T["uk"];
}) {
  const rows = ["Sun","Moon","Mercury","Venus","Mars","Jupiter","Saturn","Uranus","Neptune","Pluto","ASC","MC"];
  return (
    <div className="card-luxury">
      <h3 className="text-xl text-[#1C1512] mb-3" style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}>
        {t.section_planets}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
        {rows.map(name => {
          const lon = name === "ASC" ? chart.asc : name === "MC" ? chart.mc : chart.planets[name];
          const signIdx = Math.floor(((lon % 360) + 360) % 360 / 30);
          const inSign = ((lon % 30) + 30) % 30;
          const deg = Math.floor(inSign);
          const min = Math.floor((inSign - deg) * 60);
          const house = (name === "ASC" || name === "MC") ? null : whichPlacidusHouse(lon, chart.cusps);
          return (
            <div key={name} className="flex items-center justify-between gap-3 px-3 py-1.5 rounded-lg bg-[rgba(196,169,122,0.05)] border border-[rgba(196,169,122,0.12)] text-sm">
              <span className="flex items-center gap-2 text-[#5C4530]">
                <span className="w-7 text-center text-[#C4A97A] text-base">{PLANET_GLYPH[name]}</span>
                <span className="font-medium" style={{ fontFamily: "var(--font-cormorant)" }}>
                  {PLANET_LABEL[name][lang]}
                </span>
              </span>
              <span className="text-xs text-[#7A6A58] flex items-center gap-1.5">
                {SIGN_GLYPHS[signIdx]}
                <span className="text-[#1C1512]">{signNames[signIdx]}</span>
                <span className="text-[#9A8A78] tabular-nums">{deg}°{min.toString().padStart(2, "0")}′</span>
                {house != null && <span className="ml-1 text-[#B8883A] text-[10px]">· {t.house_n(house)}</span>}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Aspects list ─────────────────────────────────────────────────────────
function AspectsList({ aspects, lang }: {
  aspects: Array<{ a: string; b: string; kind: AspectKey; orb: number }>;
  lang: "uk" | "ru" | "en";
}) {
  const t = T[lang];
  return (
    <div className="card-luxury">
      <h3 className="text-xl text-[#1C1512] mb-3" style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}>
        {t.section_aspects}
      </h3>
      {aspects.length === 0 ? (
        <p className="text-sm text-[#7A6A58] italic">{t.no_aspects}</p>
      ) : (
        <ul className="space-y-2">
          {aspects.map((a, i) => (
            <li key={i} className="px-3 py-2.5 rounded-lg bg-[rgba(196,169,122,0.05)] border border-[rgba(196,169,122,0.12)]">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-[#5C4530] flex-1 flex items-center gap-1.5">
                  <span className="text-base text-[#C4A97A]">{PLANET_GLYPH[a.a]}</span>
                  <span style={{ fontFamily: "var(--font-cormorant)" }}>{PLANET_LABEL[a.a][lang]}</span>
                </span>
                <span style={{ color: ASPECT_COLOR[a.kind] }} className="text-base">{ASPECT_GLYPH[a.kind]}</span>
                <span className="text-[#5C4530] flex-1 text-right flex items-center justify-end gap-1.5">
                  <span style={{ fontFamily: "var(--font-cormorant)" }}>{PLANET_LABEL[a.b][lang]}</span>
                  <span className="text-base text-[#C4A97A]">{PLANET_GLYPH[a.b]}</span>
                </span>
                <span className="text-[10px] text-[#9A8A78] tabular-nums ml-2 w-12 text-right">
                  ±{a.orb.toFixed(1)}°
                </span>
              </div>
              {/* Aspect archetype description — what this kind of aspect
                  generally MEANS (conjunction = fused, square = tension,
                  etc.). Stable canonical text from _meanings.ts; deeper
                  planet-specific interpretation belongs to the AI portrait. */}
              <p className="text-xs text-[#7A6A58] italic mt-1.5 pl-1 leading-relaxed">
                {meaningAspect(a.kind, lang)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ── Portrait block (AI, auth-gated) ──────────────────────────────────────
function PortraitBlock({ lang, portrait, loading, error, onRun, t }: {
  lang: "uk" | "ru" | "en";
  portrait: { essence?: string; gifts?: string; work?: string } | null;
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
            {t.section_portrait}
          </h3>
        </div>
        <p className="text-sm text-[#5C4530] leading-relaxed mb-4">{t.portrait_anon}</p>
        <Link href={`/${lang}/account/sign-in?next=/${lang}/studio/natal-chart`} className="btn-primary inline-flex">
          {t.portrait_signin}
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
          {t.section_portrait}
        </h3>
      </div>

      {portrait ? (
        <div className="space-y-4">
          {([
            { label: t.essence_label, text: portrait.essence, accent: true },
            { label: t.gifts_label,   text: portrait.gifts },
            { label: t.work_label,    text: portrait.work },
          ]).map((b, i) => b.text && (
            <div key={i} className={`p-4 rounded-xl border ${b.accent
              ? "bg-[rgba(212,168,83,0.10)] border-[rgba(212,168,83,0.32)]"
              : "bg-[rgba(196,169,122,0.05)] border-[rgba(196,169,122,0.18)]"
            }`}>
              <p className="text-[10px] text-[#C4A97A] tracking-widest uppercase mb-2">{b.label}</p>
              <p className="text-sm text-[#5C4530] leading-relaxed whitespace-pre-wrap">{b.text}</p>
            </div>
          ))}
        </div>
      ) : error === "rate" ? (
        <p className="text-sm text-[#7A6A58] italic text-center py-3">{t.portrait_rate}</p>
      ) : (
        <>
          <button type="button" onClick={onRun} disabled={loading}
                  className="btn-primary w-full disabled:opacity-60">
            {loading ? <><Loader2 size={14} className="animate-spin" /> {t.portrait_loading}</>
                     : <><Sparkles size={14} /> {t.portrait_cta}</>}
          </button>
          {error === "other" && <p className="text-sm text-[#9A6E28] mt-3 text-center">{t.portrait_error}</p>}
        </>
      )}
    </div>
  );
}
