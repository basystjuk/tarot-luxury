"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowRight, Sparkles, ChevronDown, Check } from "lucide-react";
import AnimatedSection from "@/components/ui/AnimatedSection";
import GoldDivider from "@/components/ui/GoldDivider";
import { useLanguage } from "@/hooks/useLanguage";
import { dateToJD, calcPlanetDeg, calcMoonSpeed, calcMoonDeclination, OBLIQUITY_DEG, SIGN_TO_ELEMENT, TRIPLICITY, isDayChartByHour, type ElementKey, type PlanetKey, SIGNS_UA, SIGNS_EN, SIGN_GLYPHS } from "@/lib/astro/calculations";
import { TermHint } from "@/components/ui/TermHint";
import { moonHint } from "./_hints";
import { moonAdvice, type AdviceKey } from "./_advice";
import { MoonCalendar } from "./_calendar";

type PhaseKey =
  | "new"
  | "waxing_crescent"
  | "first_quarter"
  | "waxing_gibbous"
  | "full"
  | "waning_gibbous"
  | "last_quarter"
  | "waning_crescent";

// Russian sign names (not in calculations.ts)
const SIGNS_RU = [
  "Овен", "Телец", "Близнецы", "Рак", "Лев", "Дева",
  "Весы", "Скорпион", "Стрелец", "Козерог", "Водолей", "Рыбы",
];

interface MoonData {
  phaseKey: PhaseKey;
  phaseAngle: number; // elongation 0–360°
  illumination: number;
  emoji: string;
  nextFull: Date;
  nextNew: Date;
  moonSignIdx: number; // 0–11
  moonDegree: number;  // 0–29° within sign
  isDarkMoon: boolean; // true when elongation < 5° (3-day pre-new window)
  voidOfCourse: boolean;
  northNodeSignIdx: number; // Rahu sign
  southNodeSignIdx: number; // Ketu sign
  lilithSignIdx: number;    // Black Moon Lilith sign
  sunSignIdx: number;       // 0–11, computed from the same JD
  sunDegree: number;        // 0–29° within sign
  moonSpeedDegPerDay: number; // signed; ~11.6–15.4°/day for Moon
  moonSpeedClass: "fast" | "normal" | "slow"; // ≥13 fast, 12–13 normal, <12 slow
  moonDeclination: number;    // signed degrees; |δ| > 23.4365° → OOB
  isOutOfBounds: boolean;     // true when |moonDeclination| > 23.4365°
  element: ElementKey;        // element of the Moon's sign (fire/earth/air/water)
  isDayChart: boolean;        // approximated from hour: 6–18 = day
  rulerDay: PlanetKey;        // day triplicity ruler for the element
  rulerNight: PlanetKey;      // night triplicity ruler
  rulerParticipating: PlanetKey; // participating ruler (always present)
  rulerActive: PlanetKey;     // whichever of day/night is currently active
  eclipseType: "solar" | "lunar" | null;
  eclipseProximity: number;   // 0–100, higher = closer to exact alignment
}

// ── Astrology helpers ────────────────────────────────────────────────────────

function calcLunarNorthNode(jd: number): number {
  // Mean Moon's ascending node — Rahu
  const T = (jd - 2451545.0) / 36525.0;
  const omega = 125.04452 - 1934.136261 * T + 0.0020708 * T * T + T * T * T / 450000;
  return ((omega % 360) + 360) % 360;
}

function calcLilithMean(jd: number): number {
  // Mean Black Moon Lilith — apogee of Moon's orbit
  const T = (jd - 2451545.0) / 36525.0;
  const lambda =
    83.35324212 + 4069.0322 * T - 0.01032 * T * T -
    (T * T * T) / 80053 + (T * T * T * T) / 18999000;
  return ((lambda % 360) + 360) % 360;
}

function calcVoidOfCourse(jd: number, moonLon: number): boolean {
  // Find arc until next sign boundary
  const sign = Math.floor(((moonLon % 360) + 360) % 360 / 30);
  const boundary = (sign + 1) * 30;
  let distance = boundary - moonLon;
  if (distance <= 0) distance += 360;
  if (distance > 30) return false; // safety

  // Get planet positions at current JD (treat as fixed during Moon's transit of sign)
  const planetIndices = [0, 2, 3, 4, 5, 6]; // Sun, Mercury, Venus, Mars, Jupiter, Saturn
  const planetLons = planetIndices.map(i => calcPlanetDeg(i, jd));

  // Major aspect angles (Ptolemaic)
  const aspectAngles = [0, 60, 90, 120, 180];

  // For each planet, find Moon target longitudes for any major aspect
  for (const pLon of planetLons) {
    for (const a of aspectAngles) {
      for (const offset of [a, -a]) {
        const target = (((pLon + offset) % 360) + 360) % 360;
        let diff = target - moonLon;
        if (diff < 0) diff += 360;
        // Moon will hit this aspect before crossing sign boundary
        if (diff > 0.5 && diff <= distance) return false;
      }
    }
  }
  return true;
}

function calcMoonPhase(year: number, month: number, day: number, hour: number = 12, minute: number = 0, tzHours: number = 0): MoonData {
  const jd = dateToJD(year, month, day, hour, minute, tzHours);
  const synodicMonth = 29.53058867;

  // Accurate ELP2000-simplified Moon + Meeus Sun positions
  const moonLon = calcPlanetDeg(1, jd);
  const sunLon  = calcPlanetDeg(0, jd);

  // Elongation: 0° = new moon, 180° = full moon
  const elongation  = ((moonLon - sunLon) % 360 + 360) % 360;
  const illumination = Math.round(((1 - Math.cos((elongation * Math.PI) / 180)) / 2) * 100);
  const moonSignIdx  = Math.floor(((moonLon % 360) + 360) % 360 / 30);
  const moonDegree   = Math.floor(((moonLon % 30) + 30) % 30);

  // Dark Moon: 3-day window of invisibility around exact conjunction
  // (covers ~36 hours before and after new moon — elongation < 18° or > 342° for the 3-day window)
  const isDarkMoon = elongation < 18 || elongation > 342;

  // Void of Course Moon
  const voidOfCourse = calcVoidOfCourse(jd, moonLon);

  // Lunar Nodes (Rahu / Ketu)
  const northNodeLon = calcLunarNorthNode(jd);
  const northNodeSignIdx = Math.floor(((northNodeLon % 360) + 360) % 360 / 30);
  const southNodeSignIdx = (northNodeSignIdx + 6) % 12;

  // Black Moon Lilith
  const lilithLon = calcLilithMean(jd);
  const lilithSignIdx = Math.floor(((lilithLon % 360) + 360) % 360 / 30);

  // ── Eclipse detection ───────────────────────────────────────────────────
  // An eclipse happens when Sun, Moon and a Lunar Node are aligned. The
  // Moon's orbital plane is tilted ~5° from the ecliptic; the nodes mark
  // where it crosses. Standard tolerances:
  //   Solar: at New Moon, Sun within ~18° of a node (partial OK ≤18°,
  //          total ≤10°). The Moon is by definition at ~same longitude.
  //   Lunar: at Full Moon, Moon within ~12° of a node (partial ≤12°,
  //          total ≤6°).
  // We also require we're within ~24h of exact conjunction/opposition
  // (~13° elongation tolerance — Moon moves ~13°/day).
  //
  // We can't easily distinguish total vs partial without shadow geometry,
  // so the UI just says "Solar/Lunar eclipse" — close enough for a daily
  // tool. Precision: detects every actual eclipse, false-positives are
  // rare (~1–2 days per year that look eclipse-adjacent but aren't quite).
  const angDist = (a: number, b: number) => {
    let d = Math.abs(((a - b) % 360 + 360) % 360);
    if (d > 180) d = 360 - d;
    return d;
  };
  const southNodeLon = (northNodeLon + 180) % 360;
  const sunNodeDist  = Math.min(angDist(sunLon, northNodeLon),  angDist(sunLon, southNodeLon));
  const moonNodeDist = Math.min(angDist(moonLon, northNodeLon), angDist(moonLon, southNodeLon));
  const isNearNew  = elongation < 13 || elongation > 347;
  const isNearFull = Math.abs(elongation - 180) < 13;
  let eclipseType: "solar" | "lunar" | null = null;
  let eclipseProximity = 0; // 0–100, higher = closer to exact alignment
  if (isNearNew && sunNodeDist < 18) {
    eclipseType = "solar";
    eclipseProximity = Math.max(0, Math.round(100 * (1 - sunNodeDist / 18)));
  } else if (isNearFull && moonNodeDist < 12) {
    eclipseType = "lunar";
    eclipseProximity = Math.max(0, Math.round(100 * (1 - moonNodeDist / 12)));
  }

  let phaseKey: PhaseKey;
  let emoji: string;
  if      (elongation < 22.5 || elongation >= 337.5) { phaseKey = "new";             emoji = "🌑"; }
  else if (elongation < 67.5)                         { phaseKey = "waxing_crescent"; emoji = "🌒"; }
  else if (elongation < 112.5)                        { phaseKey = "first_quarter";   emoji = "🌓"; }
  else if (elongation < 157.5)                        { phaseKey = "waxing_gibbous";  emoji = "🌔"; }
  else if (elongation < 202.5)                        { phaseKey = "full";            emoji = "🌕"; }
  else if (elongation < 247.5)                        { phaseKey = "waning_gibbous";  emoji = "🌖"; }
  else if (elongation < 292.5)                        { phaseKey = "last_quarter";    emoji = "🌗"; }
  else                                                { phaseKey = "waning_crescent"; emoji = "🌘"; }

  // Days to next full moon (elongation → 180°)
  const daysToFull = (() => {
    let diff = ((180 - elongation) + 360) % 360;
    if (diff < 0.5) diff += synodicMonth;
    return (diff / 360) * synodicMonth;
  })();

  // Days to next new moon (elongation → 0°)
  const daysToNew = (() => {
    let diff = (360 - elongation) % 360;
    if (diff < 0.5) diff += synodicMonth;
    return (diff / 360) * synodicMonth;
  })();

  const fullDate = new Date(year, month - 1, day);
  fullDate.setDate(fullDate.getDate() + Math.round(daysToFull));
  const newDate = new Date(year, month - 1, day);
  newDate.setDate(newDate.getDate() + Math.round(daysToNew));

  // Sun sign (tropical) derived from the same JD — used by the AI route
  // to compute the Sun–Moon dialogue without a manual dropdown.
  const sunSignIdx = Math.floor(((sunLon % 360) + 360) % 360 / 30);
  const sunDegree  = Math.floor(((sunLon % 30) + 30) % 30);

  // Moon speed (°/day) and Out of Bounds. Speed buckets follow the
  // astrological convention: ≥13 fast (events unfold quickly, VoC windows
  // are short), 12–13 normal, <12 slow (drag, longer VoC). OOB happens
  // when the Moon's declination exceeds the ecliptic's obliquity —
  // historically tied to "wild card" days and major standstill epochs.
  const moonSpeedDegPerDay = calcMoonSpeed(jd);
  const moonSpeedAbs = Math.abs(moonSpeedDegPerDay);
  const moonSpeedClass: "fast" | "normal" | "slow" =
    moonSpeedAbs >= 13 ? "fast" : moonSpeedAbs >= 12 ? "normal" : "slow";
  const moonDeclination = calcMoonDeclination(jd);
  const isOutOfBounds = Math.abs(moonDeclination) > OBLIQUITY_DEG;

  // Triplicity rulers for the Moon's sign element. Sect (day/night) is
  // approximated by local hour until natal-mode brings true sunrise data.
  const element = (["fire", "earth", "air", "water"] as const)[SIGN_TO_ELEMENT[moonSignIdx]];
  const triplicity = TRIPLICITY[element];
  const isDayChart = isDayChartByHour(hour);
  const rulerActive = isDayChart ? triplicity.day : triplicity.night;

  return {
    phaseKey, phaseAngle: elongation, illumination, emoji,
    nextFull: fullDate, nextNew: newDate,
    moonSignIdx, moonDegree,
    isDarkMoon, voidOfCourse,
    northNodeSignIdx, southNodeSignIdx,
    lilithSignIdx,
    sunSignIdx, sunDegree,
    moonSpeedDegPerDay, moonSpeedClass,
    moonDeclination, isOutOfBounds,
    element, isDayChart,
    rulerDay: triplicity.day,
    rulerNight: triplicity.night,
    rulerParticipating: triplicity.participating,
    rulerActive,
    eclipseType,
    eclipseProximity,
  };
}

// ── Static content ────────────────────────────────────────────────────────────

const PHASE_CONTENT = {
  uk: {
    new:             { name: "Новий Місяць",         advice: "Час нових починань і намірів. Посійте насіння бажань — цикл починається з чистого аркуша." },
    waxing_crescent: { name: "Серп, що росте",        advice: "Ідеальний час для старту та руху вперед. Енергія зростає — дійте рішуче та з вірою." },
    first_quarter:   { name: "Перша чверть",          advice: "Настав час долати перешкоди. Прийміть рішення і йдіть далі — сумніви тут зайві." },
    waxing_gibbous:  { name: "Прибуваючий Місяць",    advice: "Тонка настройка та вдосконалення. Зосередьтесь на деталях — фінальний штрих вирішує все." },
    full:            { name: "Повний Місяць",          advice: "Кульмінація і завершення циклу. Відпустіть те, що більше не служить вашій душі." },
    waning_gibbous:  { name: "Спадаючий Місяць",      advice: "Час подяки та мудрої рефлексії. Поділіться здобутим і підбийте підсумки." },
    last_quarter:    { name: "Остання чверть",         advice: "Відпустіть і очистіть простір. Звільніть місце для того, що прийде у новому циклі." },
    waning_crescent: { name: "Серп, що спадає",        advice: "Час відпочинку, інтеграції та підготовки. Слухайте внутрішній голос — він знає, що далі." },
  },
  ru: {
    new:             { name: "Новолуние",              advice: "Время новых начинаний и намерений. Посейте семена желаний — цикл начинается с чистого листа." },
    waxing_crescent: { name: "Растущий серп",          advice: "Идеальное время для старта и движения вперёд. Энергия растёт — действуйте решительно и с верой." },
    first_quarter:   { name: "Первая четверть",        advice: "Пришло время преодолевать препятствия. Примите решение и идите вперёд — сомнениям здесь нет места." },
    waxing_gibbous:  { name: "Прибывающая Луна",       advice: "Тонкая настройка и совершенствование. Сосредоточьтесь на деталях — финальный штрих решает всё." },
    full:            { name: "Полнолуние",              advice: "Кульминация и завершение цикла. Отпустите то, что больше не служит вашей душе." },
    waning_gibbous:  { name: "Убывающая Луна",         advice: "Время благодарности и мудрой рефлексии. Поделитесь обретённым и подведите итоги." },
    last_quarter:    { name: "Последняя четверть",     advice: "Отпустите и очистите пространство. Освободите место для того, что придёт в новом цикле." },
    waning_crescent: { name: "Убывающий серп",         advice: "Время отдыха, интеграции и подготовки. Слушайте внутренний голос — он знает, что дальше." },
  },
  en: {
    new:             { name: "New Moon",               advice: "A time for new beginnings and intentions. Plant the seeds of your desires — the cycle begins on a clean slate." },
    waxing_crescent: { name: "Waxing Crescent",        advice: "The perfect time to start and move forward. Energy is growing — act decisively and with faith." },
    first_quarter:   { name: "First Quarter",          advice: "The time to overcome obstacles has come. Make your decision and move forward — doubt has no place here." },
    waxing_gibbous:  { name: "Waxing Gibbous",         advice: "Fine-tuning and refinement. Focus on the details — the final touch makes all the difference." },
    full:            { name: "Full Moon",              advice: "Culmination and completion of the cycle. Release what no longer serves your soul." },
    waning_gibbous:  { name: "Waning Gibbous",         advice: "A time of gratitude and wise reflection. Share what you've gained and take stock." },
    last_quarter:    { name: "Last Quarter",           advice: "Let go and clear the space. Make room for what will come in the new cycle." },
    waning_crescent: { name: "Waning Crescent",        advice: "A time of rest, integration and preparation. Listen to your inner voice — it knows what comes next." },
  },
};

// Moon sign energy: keyword + element (12 signs × 3 languages)
const MOON_SIGN_CONTENT = {
  uk: [
    { keyword: "Ініціатива",     energy: "Вогонь · Дія" },
    { keyword: "Стабільність",   energy: "Земля · Чуттєвість" },
    { keyword: "Спілкування",    energy: "Повітря · Адаптивність" },
    { keyword: "Інтуїція",       energy: "Вода · Турбота" },
    { keyword: "Творчість",      energy: "Вогонь · Серце" },
    { keyword: "Аналіз",         energy: "Земля · Точність" },
    { keyword: "Гармонія",       energy: "Повітря · Баланс" },
    { keyword: "Трансформація",  energy: "Вода · Глибина" },
    { keyword: "Розширення",     energy: "Вогонь · Мудрість" },
    { keyword: "Структура",      energy: "Земля · Дисципліна" },
    { keyword: "Оновлення",      energy: "Повітря · Свобода" },
    { keyword: "Мрія",           energy: "Вода · Інтуїція" },
  ],
  ru: [
    { keyword: "Инициатива",     energy: "Огонь · Действие" },
    { keyword: "Стабильность",   energy: "Земля · Чувственность" },
    { keyword: "Общение",        energy: "Воздух · Адаптивность" },
    { keyword: "Интуиция",       energy: "Вода · Забота" },
    { keyword: "Творчество",     energy: "Огонь · Сердце" },
    { keyword: "Анализ",         energy: "Земля · Точность" },
    { keyword: "Гармония",       energy: "Воздух · Баланс" },
    { keyword: "Трансформация",  energy: "Вода · Глубина" },
    { keyword: "Расширение",     energy: "Огонь · Мудрость" },
    { keyword: "Структура",      energy: "Земля · Дисциплина" },
    { keyword: "Обновление",     energy: "Воздух · Свобода" },
    { keyword: "Мечта",          energy: "Вода · Интуиция" },
  ],
  en: [
    { keyword: "Initiative",     energy: "Fire · Action" },
    { keyword: "Stability",      energy: "Earth · Sensuality" },
    { keyword: "Connection",     energy: "Air · Adaptability" },
    { keyword: "Intuition",      energy: "Water · Nurturing" },
    { keyword: "Creativity",     energy: "Fire · Heart" },
    { keyword: "Analysis",       energy: "Earth · Precision" },
    { keyword: "Harmony",        energy: "Air · Balance" },
    { keyword: "Transformation", energy: "Water · Depth" },
    { keyword: "Expansion",      energy: "Fire · Wisdom" },
    { keyword: "Structure",      energy: "Earth · Discipline" },
    { keyword: "Innovation",     energy: "Air · Freedom" },
    { keyword: "Dream",          energy: "Water · Intuition" },
  ],
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const UA_MONTHS = ["січня","лютого","березня","квітня","травня","червня","липня","серпня","вересня","жовтня","листопада","грудня"];
const RU_MONTHS = ["января","февраля","марта","апреля","мая","июня","июля","августа","сентября","октября","ноября","декабря"];
const EN_MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function fmtDate(d: Date, lang: string): string {
  if (lang === "en") return `${EN_MONTHS[d.getMonth()]} ${d.getDate()}`;
  if (lang === "ru") return `${d.getDate()} ${RU_MONTHS[d.getMonth()]}`;
  return `${d.getDate()} ${UA_MONTHS[d.getMonth()]}`;
}

// ── Moon visual — точне NASA фото по елонгації ────────────────────────────────
// Маппінг: elongation 0–360° → кадр 2024 NASA датасету
// Jan 11 2024 ~12:00 UTC = кадр 252 (новолуння), синодичний місяць = 708.73 год
const NASA_BASE = "https://svs.gsfc.nasa.gov/vis/a000000/a005100/a005187/frames/730x730_1x1_30p";
const JAN11_NM_FRAME = 252;
const SYNODIC_HOURS = 708.73;

function elongationToFrame(elongation: number): string {
  const frame = JAN11_NM_FRAME + Math.round((elongation / 360) * SYNODIC_HOURS);
  return frame.toString().padStart(4, "0");
}

function MoonVisual({
  illumination, phaseKey, phaseAngle, label,
}: {
  illumination: number; phaseKey: PhaseKey; phaseAngle: number; label: string;
}) {
  const [useNasa, setUseNasa] = useState(true);
  const isFull = phaseKey === "full";
  const isNew  = phaseKey === "new";

  const nasaUrl     = `${NASA_BASE}/moon.${elongationToFrame(phaseAngle)}.jpg`;
  const fallbackUrl = `/images/moon/${phaseKey}.jpg`;
  const src         = useNasa ? nasaUrl : fallbackUrl;

  const glow = isFull
    ? "0 0 0 1px rgba(196,169,122,0.25), 0 0 50px rgba(232,201,138,0.4), 0 0 100px rgba(196,169,122,0.15)"
    : isNew
    ? "0 0 0 1px rgba(196,169,122,0.12), inset 0 0 20px rgba(0,0,0,0.6)"
    : "0 0 0 1px rgba(196,169,122,0.18), 0 0 24px rgba(0,0,0,0.5)";

  return (
    <div className="flex flex-col items-center gap-5">
      {/* Moon photo — black space background is intentional */}
      <div
        className="rounded-full overflow-hidden bg-[#050508] flex items-center justify-center"
        style={{ width: 200, height: 200, boxShadow: glow }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={src}
          src={src}
          alt={`Moon — ${phaseKey}`}
          onError={() => { if (useNasa) setUseNasa(false); }}
          className="w-full h-full object-contain"
        />
      </div>

      {/* Illumination */}
      <div className="text-center">
        <p className="text-4xl text-[#B8883A] mb-1" style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}>
          {illumination}%
        </p>
        <p className="text-sm text-[#7A6A58]">{label}</p>
      </div>
    </div>
  );
}

// ── Custom branded dropdown (replaces native <select>) ──────────────────────
// TODO(natal-mode): re-used tomorrow for the natal-mode timezone / city
// selector. Kept here to avoid a churn cycle.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function CustomDropdown({
  value, options, onChange, placeholder, ariaLabel,
}: {
  value: number | null;
  options: { idx: number; label: string; glyph: string }[];
  onChange: (idx: number | null) => void;
  placeholder: string;
  ariaLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const selected = value !== null ? options.find(o => o.idx === value) : null;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label={ariaLabel}
        onClick={() => setOpen(o => !o)}
        className="input-luxury w-full flex items-center justify-between text-left"
      >
        <span className={selected ? "text-[#1C1512]" : "text-[#9A8A78]"}>
          {selected ? `${selected.glyph} ${selected.label}` : placeholder}
        </span>
        <ChevronDown size={16} className={`text-[#C4A97A] transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <ul
          role="listbox"
          className="absolute z-30 mt-1 w-full max-h-72 overflow-y-auto rounded-xl border border-[rgba(196,169,122,0.3)] bg-white shadow-[0_8px_30px_rgba(0,0,0,0.08)] py-1"
        >
          <li>
            <button
              type="button"
              onClick={() => { onChange(null); setOpen(false); }}
              className="w-full text-left px-4 py-2 text-sm text-[#9A8A78] hover:bg-[rgba(196,169,122,0.08)] flex items-center justify-between"
            >
              <span className="italic">{placeholder}</span>
              {value === null && <Check size={14} className="text-[#B8883A]" />}
            </button>
          </li>
          {options.map(o => (
            <li key={o.idx}>
              <button
                type="button"
                onClick={() => { onChange(o.idx); setOpen(false); }}
                className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between hover:bg-[rgba(196,169,122,0.08)] ${value === o.idx ? "text-[#B8883A] bg-[rgba(196,169,122,0.05)]" : "text-[#1C1512]"}`}
              >
                <span><span className="text-[#C4A97A] mr-2">{o.glyph}</span>{o.label}</span>
                {value === o.idx && <Check size={14} className="text-[#B8883A]" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ── Expand block ("Що це для тебе?") ───────────────────────────────────────
// Native <details> styled to match the brand. Used below Dark Moon / VoC
// badges to give first-time visitors concrete do/don't lists and a small
// ritual without burning another AI call. The personal AI message at the
// bottom of the page still carries the day's specific nuance.
function AdviceExpand({
  language,
  adviceKey,
  badge,
  question,
}: {
  language: string;
  adviceKey: AdviceKey;
  badge: React.ReactNode; // e.g. "🌑 Темний Місяць"
  question: string;       // localised "Що це для тебе зараз?"
}) {
  const advice = moonAdvice(language, adviceKey);
  return (
    <details className="group rounded-2xl border border-[rgba(196,169,122,0.25)] bg-[rgba(255,253,248,0.7)] transition-colors hover:border-[rgba(196,169,122,0.45)] text-left">
      <summary
        className="flex items-center justify-between gap-3 px-5 py-4 cursor-pointer list-none select-none"
        style={{ fontFamily: "var(--font-cormorant)" }}
      >
        <span className="text-[#1C1512] text-base sm:text-lg font-medium flex-1">
          {badge}
          <span className="block text-xs sm:text-sm text-[#7A6A58] italic mt-0.5">{question}</span>
        </span>
        <ChevronDown
          size={18}
          className="text-[#C4A97A] transition-transform duration-300 group-open:rotate-180 flex-shrink-0"
        />
      </summary>
      <div className="px-5 pb-5 pt-1 space-y-4">
        <p className="text-sm text-[#5C4530] leading-relaxed">{advice.intro}</p>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <p className="text-[10px] text-[#B8883A] tracking-widest uppercase mb-2 font-medium">
              ✓ {advice.doTitle}
            </p>
            <ul className="space-y-1.5 text-sm text-[#5C4530]">
              {advice.doList.map((item, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-[#C4A97A] mt-0.5">·</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[10px] text-[#9A8A78] tracking-widest uppercase mb-2 font-medium">
              ✕ {advice.avoidTitle}
            </p>
            <ul className="space-y-1.5 text-sm text-[#7A6A58]">
              {advice.avoidList.map((item, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-[#C4A97A]/60 mt-0.5">·</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[rgba(196,169,122,0.08)] border border-[rgba(196,169,122,0.2)]">
          <p className="text-[10px] text-[#B8883A] tracking-widest uppercase mb-1 font-medium">
            ✦ {advice.ritualTitle}
          </p>
          <p className="text-sm text-[#5C4530] italic leading-relaxed" style={{ fontFamily: "var(--font-cormorant)" }}>
            {advice.ritual}
          </p>
        </div>
      </div>
    </details>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function MoonPhasePage() {
  const { language } = useLanguage();
  const isRu = language === "ru";
  const isEn = language === "en";

  const today = new Date();
  // Browser timezone offset in hours (Date.getTimezoneOffset returns minutes WEST of UTC)
  const tzHours = -today.getTimezoneOffset() / 60;

  // Tool mode — Phase #2 ships only "today" and "event".
  // "natal" is intentionally hidden until the natal-mode phase lands
  // (see TODO(natal-mode) markers below).
  type Mode = "today" | "event";
  const [mode, setMode] = useState<Mode>("today");

  const [form, setForm] = useState({
    year:   today.getFullYear().toString(),
    month:  (today.getMonth() + 1).toString(),
    day:    today.getDate().toString(),
    hour:   today.getHours().toString(),
    minute: today.getMinutes().toString().padStart(2, "0"),
  });
  const [useExactTime, setUseExactTime] = useState(false);
  const [result, setResult]           = useState<MoonData | null>(null);
  const [aiResult, setAiResult]       = useState<{ energy: string; advice: string; affirmation: string } | null>(null);
  const [aiLoading, setAiLoading]     = useState(false);
  const [aiError, setAiError]         = useState<string | null>(null);
  const [aiRateLimited, setAiRateLimited] = useState(false);

  // Phase #14 — crystal / oil / tea recommendations. Separate endpoint
  // and separate daily quota from the main AI message.
  type RecItem = { name: string; why: string };
  type RecResult = { crystals: RecItem[]; oils: RecItem[]; teas: RecItem[] };
  const [recResult, setRecResult] = useState<RecResult | null>(null);
  const [recLoading, setRecLoading] = useState(false);
  const [recError, setRecError] = useState<string | null>(null);
  const [recRateLimited, setRecRateLimited] = useState(false);

  const phaseContent    = isRu ? PHASE_CONTENT.ru    : isEn ? PHASE_CONTENT.en    : PHASE_CONTENT.uk;
  const moonSignContent = isRu ? MOON_SIGN_CONTENT.ru : isEn ? MOON_SIGN_CONTENT.en : MOON_SIGN_CONTENT.uk;
  const signNames       = isRu ? SIGNS_RU : isEn ? SIGNS_EN : SIGNS_UA;

  // Localised element + planet labels for the Triplicity card.
  const elementLabel: Record<ElementKey, { name: string; glyph: string }> = {
    fire:  { name: isRu ? "Огонь"   : isEn ? "Fire"  : "Вогонь", glyph: "🔥" },
    earth: { name: isRu ? "Земля"   : isEn ? "Earth" : "Земля",  glyph: "🌿" },
    air:   { name: isRu ? "Воздух"  : isEn ? "Air"   : "Повітря", glyph: "🌬" },
    water: { name: isRu ? "Вода"    : isEn ? "Water" : "Вода",    glyph: "💧" },
  };
  const planetLabel: Record<PlanetKey, { name: string; glyph: string }> = {
    sun:     { name: isRu ? "Солнце"   : isEn ? "Sun"     : "Сонце",   glyph: "☉" },
    moon:    { name: isRu ? "Луна"     : isEn ? "Moon"    : "Місяць",  glyph: "☽" },
    mercury: { name: isRu ? "Меркурий" : isEn ? "Mercury" : "Меркурій", glyph: "☿" },
    venus:   { name: isRu ? "Венера"   : isEn ? "Venus"   : "Венера",  glyph: "♀" },
    mars:    { name: isRu ? "Марс"     : isEn ? "Mars"    : "Марс",    glyph: "♂" },
    jupiter: { name: isRu ? "Юпитер"   : isEn ? "Jupiter" : "Юпітер",  glyph: "♃" },
    saturn:  { name: isRu ? "Сатурн"   : isEn ? "Saturn"  : "Сатурн",  glyph: "♄" },
  };

  // Auto-calculate today on first render — use current hour/minute for live data
  const [initialized, setInitialized] = useState(false);
  if (!initialized) {
    setInitialized(true);
    setResult(calcMoonPhase(today.getFullYear(), today.getMonth() + 1, today.getDate(), today.getHours(), today.getMinutes(), tzHours));
  }

  // Keep "today" mode live: recompute whenever the mode flips back to today,
  // and refresh once a minute so the badge stays current on long-open tabs.
  useEffect(() => {
    if (mode !== "today") return;
    const refresh = () => {
      const now = new Date();
      setResult(calcMoonPhase(now.getFullYear(), now.getMonth() + 1, now.getDate(), now.getHours(), now.getMinutes(), tzHours));
    };
    refresh();
    const id = setInterval(refresh, 60_000);
    return () => clearInterval(id);
  }, [mode, tzHours]);

  // Live preview computed on every form change (only meaningful in "event" mode).
  const previewResult = (() => {
    if (mode !== "event") return null;
    const y = parseInt(form.year), m = parseInt(form.month), d = parseInt(form.day);
    if (!y || !m || !d || y < 1900 || y > 2100 || m < 1 || m > 12 || d < 1 || d > 31) return null;
    const h = useExactTime ? parseInt(form.hour || "12") : 12;
    const min = useExactTime ? parseInt(form.minute || "0") : 0;
    if (useExactTime && (isNaN(h) || h < 0 || h > 23 || isNaN(min) || min < 0 || min > 59)) return null;
    try {
      return calcMoonPhase(y, m, d, h, min, useExactTime ? tzHours : 0);
    } catch { return null; }
  })();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "today") {
      const now = new Date();
      setResult(calcMoonPhase(now.getFullYear(), now.getMonth() + 1, now.getDate(), now.getHours(), now.getMinutes(), tzHours));
    } else {
      const h = useExactTime ? parseInt(form.hour || "12") : 12;
      const min = useExactTime ? parseInt(form.minute || "0") : 0;
      setResult(calcMoonPhase(parseInt(form.year), parseInt(form.month), parseInt(form.day), h, min, useExactTime ? tzHours : 0));
    }
    setAiResult(null);
    setAiError(null);
    setAiRateLimited(false);
  };

  // Wired from the monthly calendar grid. Switches the form to "event"
  // mode, fills the date, recomputes the result, clears stale AI output,
  // and scrolls the user back up so they see the reading.
  const formRef = useRef<HTMLDivElement>(null);
  const handleCalendarSelect = (y: number, m: number, d: number) => {
    setMode("event");
    setForm(f => ({ ...f, year: String(y), month: String(m), day: String(d) }));
    setResult(calcMoonPhase(y, m, d, 12, 0, 0));
    setAiResult(null);
    setAiError(null);
    setAiRateLimited(false);
    // Smooth scroll on the next frame so React paints first.
    requestAnimationFrame(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const handleAi = async () => {
    if (!result) return;
    setAiLoading(true);
    setAiError(null);
    try {
      const moonSign   = signNames[result.moonSignIdx];
      const moonSignEn = SIGNS_EN[result.moonSignIdx];
      const phaseName  = phaseContent[result.phaseKey].name;

      // Mode → AI context. Phase #2 ships only two modes; the API still
      // accepts "natal" for tomorrow's natal-mode work — TODO(natal-mode).
      const usageContext = mode === "today" ? "today" : "event";

      // Sun sign is now derived from the same JD as the Moon — no manual
      // dropdown. Always present.
      const sunSign   = signNames[result.sunSignIdx];
      const sunSignEn = SIGNS_EN[result.sunSignIdx];

      const res = await fetch("/api/moon-reading", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language,
          phaseName,
          moonSign,
          moonSignEn,
          moonDegree: result.moonDegree,
          illumination: result.illumination,
          sunSign,
          sunSignEn,
          usageContext,
          isDarkMoon: result.isDarkMoon,
          voidOfCourse: result.voidOfCourse,
          northNodeSign: signNames[result.northNodeSignIdx],
          southNodeSign: signNames[result.southNodeSignIdx],
          lilithSign: signNames[result.lilithSignIdx],
          moonSpeedDegPerDay: result.moonSpeedDegPerDay,
          moonSpeedClass: result.moonSpeedClass,
          moonDeclination: result.moonDeclination,
          isOutOfBounds: result.isOutOfBounds,
          element: result.element,
          isDayChart: result.isDayChart,
          rulerActive: result.rulerActive,
          rulerDay: result.rulerDay,
          rulerNight: result.rulerNight,
          rulerParticipating: result.rulerParticipating,
          eclipseType: result.eclipseType,
          eclipseProximity: result.eclipseProximity,
        }),
      });
      const data = await res.json();

      if (data.error === "rate_limit") {
        setAiRateLimited(true);
        setAiError(
          isRu ? "Ліміт 1 послання на добу. Повертайтесь завтра 🌙"
          : isEn ? "1 message per day limit reached. Come back tomorrow 🌙"
          : "Ліміт 1 послання на добу. Повертайтесь завтра 🌙"
        );
      } else if (data.error) {
        setAiError(
          isRu ? "Щось пішло не так. Спробуйте пізніше."
          : isEn ? "Something went wrong. Please try again later."
          : "Щось пішло не так. Спробуйте пізніше."
        );
      } else {
        setAiResult(data);
      }
    } catch {
      setAiError(
        isRu ? "Ошибка соединения. Попробуйте позже."
        : isEn ? "Connection error. Please try again."
        : "Помилка з'єднання. Спробуйте пізніше."
      );
    } finally {
      setAiLoading(false);
    }
  };

  // Reset cached UI recs whenever the underlying sign changes so the user
  // sees fresh content when they pick another date / today rolls over.
  useEffect(() => {
    setRecResult(null);
    setRecError(null);
    setRecRateLimited(false);
  }, [result?.moonSignIdx, language]);

  const recCacheKey = (lang: string, signIdx: number) => `moonRec:${lang}:${signIdx}`;

  const handleRecommendations = async () => {
    if (!result) return;

    // Client-side cache by (language × moon sign) — recommendations don't
    // change with the day, only with the sign, so the same sign hits the
    // cache forever. Saves both the user's daily quota and Groq tokens.
    const key = recCacheKey(language, result.moonSignIdx);
    try {
      const cached = typeof window !== "undefined" ? window.localStorage.getItem(key) : null;
      if (cached) {
        const parsed = JSON.parse(cached) as RecResult;
        if (parsed?.crystals && parsed?.oils && parsed?.teas) {
          setRecResult(parsed);
          return;
        }
      }
    } catch { /* corrupt cache — fall through and refetch */ }

    setRecLoading(true);
    setRecError(null);
    setRecRateLimited(false);
    try {
      const res = await fetch("/api/moon-recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language,
          moonSign: signNames[result.moonSignIdx],
          moonSignEn: SIGNS_EN[result.moonSignIdx],
          element: result.element,
        }),
      });
      const data = await res.json();
      if (data.error === "rate_limit") {
        setRecRateLimited(true);
        setRecError(
          isRu ? "Лимит 1 запрос рекомендаций в сутки. Возвращайтесь завтра 🌿"
          : isEn ? "1 recommendations request per day limit reached. Come back tomorrow 🌿"
          : "Ліміт 1 запит рекомендацій на добу. Повертайтесь завтра 🌿"
        );
      } else if (data.error) {
        setRecError(
          isRu ? "Что-то пошло не так. Попробуйте позже."
          : isEn ? "Something went wrong. Please try again later."
          : "Щось пішло не так. Спробуйте пізніше."
        );
      } else {
        setRecResult(data as RecResult);
        try {
          if (typeof window !== "undefined") {
            window.localStorage.setItem(key, JSON.stringify(data));
          }
        } catch { /* quota full or private mode — non-fatal */ }
      }
    } catch {
      setRecError(
        isRu ? "Ошибка соединения. Попробуйте позже."
        : isEn ? "Connection error. Please try again."
        : "Помилка з'єднання. Спробуйте пізніше."
      );
    } finally {
      setRecLoading(false);
    }
  };

  return (
    <>
      {/* ── Hero ── */}
      <section className="pt-36 pb-16 bg-[#FDFBF7] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(196,169,122,0.1),transparent)]" />
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <AnimatedSection>
            <span className="tag mb-6 inline-block">
              {isRu ? "Луна · Астрология" : isEn ? "Moon · Astrology" : "Місяць · Астрологія"}
            </span>
            <h1
              className="text-[clamp(2.5rem,5vw,4.5rem)] text-[#1C1512] mb-6 leading-[1.06]"
              style={{ fontFamily: "var(--font-cormorant)", fontWeight: 400 }}
            >
              {isRu ? "Місячний провідник" : isEn ? "Moon Guide" : "Місячний провідник"}
            </h1>
            <p className="text-xl text-[#7A6A58] leading-relaxed">
              {isRu
                ? "Точная фаза, знак и градус Луны на любую дату — личное лунное послание."
                : isEn
                ? "The precise Moon phase, sign and degree for any date — a personal lunar message."
                : "Точна фаза, знак і градус Місяця на будь-яку дату — особисте місячне послання."}
            </p>
          </AnimatedSection>
        </div>
      </section>

      <GoldDivider />

      <section className="section-padding bg-[#FDFBF7]">
        <div className="max-w-2xl mx-auto px-6">

          {/* ── Mode tabs + date form ──
              Phase #2 of the Moon Guide overhaul: two explicit modes.
              "today" — live current sky, no inputs needed.
              "event" — pick any date (past or future) for an event reading.
              TODO(natal-mode): a third "natal" tab lands tomorrow once we
              decide how to capture place of birth / timezone. Until then,
              the natal branch in the API directive stays dormant. */}
          <AnimatedSection>
            <div ref={formRef} className="card-luxury mb-8">
              {/* Mode segmented control */}
              <div
                role="tablist"
                aria-label={isRu ? "Режим" : isEn ? "Mode" : "Режим"}
                className="flex p-1 rounded-2xl bg-[rgba(196,169,122,0.08)] border border-[rgba(196,169,122,0.2)] mb-5"
              >
                {([
                  { id: "today" as Mode, glyph: "🌙",
                    label: isRu ? "Сегодня" : isEn ? "Today" : "Сьогодні" },
                  { id: "event" as Mode, glyph: "📅",
                    label: isRu ? "Другая дата" : isEn ? "Other date" : "Інша дата" },
                ]).map(t => {
                  const active = mode === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => setMode(t.id)}
                      className={`flex-1 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        active
                          ? "bg-white text-[#1C1512] shadow-sm"
                          : "text-[#7A6A58] hover:text-[#5C4530]"
                      }`}
                    >
                      <span className="mr-1.5">{t.glyph}</span>
                      {t.label}
                    </button>
                  );
                })}
              </div>

              <h2
                className="text-2xl text-[#1C1512] mb-2"
                style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}
              >
                {mode === "today"
                  ? (isRu ? "Сейчас в небе" : isEn ? "The sky right now" : "Зараз у небі")
                  : (isRu ? "Дата события" : isEn ? "Event date" : "Дата події")}
              </h2>
              <p className="text-sm text-[#7A6A58] mb-6 leading-relaxed">
                {mode === "today"
                  ? (isRu
                      ? "Фаза, знак и градус Луны прямо сейчас — личное послание на текущий момент."
                      : isEn
                      ? "The Moon's phase, sign and degree right now — a personal message for this very moment."
                      : "Фаза, знак і градус Місяця прямо зараз — особисте послання на поточний момент.")
                  : (isRu
                      ? "Любая важная дата — день рождения, свадьба, переезд, запуск проекта. Луна расскажет о качестве этого окна."
                      : isEn
                      ? "Any meaningful date — a birthday, wedding, move, project launch. The Moon will tell you about the quality of that window."
                      : "Будь-яка важлива дата — день народження, весілля, переїзд, старт проєкту. Місяць розкаже про якість цього вікна.")}
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                {mode === "event" && (
                  <>
                    <div className="grid grid-cols-3 gap-4 items-start">
                      {[
                        { key:"day",   label: isRu ? "День"  : isEn ? "Day"   : "День",   ph: today.getDate().toString(),             maxLen: 2 },
                        { key:"month", label: isRu ? "Месяц" : isEn ? "Month" : "Місяць", ph: (today.getMonth()+1).toString(),         maxLen: 2 },
                        { key:"year",  label: isRu ? "Год"   : isEn ? "Year"  : "Рік",    ph: today.getFullYear().toString(),          maxLen: 4 },
                      ].map(f => (
                        <div key={f.key} className="flex flex-col">
                          <label className="block text-xs text-[#7A6A58] mb-2 tracking-wide">{f.label}</label>
                          <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={f.maxLen}
                            placeholder={f.ph}
                            value={form[f.key as keyof typeof form]}
                            onChange={(e) => setForm({ ...form, [f.key]: e.target.value.replace(/[^0-9]/g, "") })}
                            className="input-luxury"
                          />
                        </div>
                      ))}
                    </div>

                    {/* Optional exact time — only meaningful for a specific event. */}
                    <div className="flex items-center justify-between gap-3 py-1">
                      <label htmlFor="useExactTime" className="text-xs text-[#7A6A58] tracking-wide cursor-pointer">
                        {isRu ? "Указать точное время события (точнее знак Луны)"
                          : isEn ? "Specify the event's exact time (more accurate Moon sign)"
                          : "Вказати точний час події (точніший знак Місяця)"}
                      </label>
                      <button
                        type="button"
                        id="useExactTime"
                        onClick={() => setUseExactTime(v => !v)}
                        className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${useExactTime ? "bg-[#B8883A]" : "bg-[rgba(196,169,122,0.3)]"}`}
                        aria-pressed={useExactTime}
                      >
                        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${useExactTime ? "translate-x-5" : ""}`} />
                      </button>
                    </div>

                    {useExactTime && (
                      <div className="grid grid-cols-2 gap-3 sm:gap-4 items-start">
                        <div className="flex flex-col">
                          <label className="block text-xs text-[#7A6A58] mb-2 tracking-wide">
                            {isRu ? "Часы" : isEn ? "Hour" : "Година"}
                          </label>
                          <input
                            type="text" inputMode="numeric" pattern="[0-9]*" maxLength={2}
                            placeholder="14"
                            value={form.hour}
                            onChange={(e) => setForm({ ...form, hour: e.target.value.replace(/[^0-9]/g, "") })}
                            className="input-luxury"
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className="block text-xs text-[#7A6A58] mb-2 tracking-wide">
                            {isRu ? "Минуты" : isEn ? "Minutes" : "Хвилини"}
                          </label>
                          <input
                            type="text" inputMode="numeric" pattern="[0-9]*" maxLength={2}
                            placeholder="30"
                            value={form.minute}
                            onChange={(e) => setForm({ ...form, minute: e.target.value.replace(/[^0-9]/g, "") })}
                            className="input-luxury"
                          />
                        </div>
                        <p className="col-span-2 text-[10px] text-[#C4A97A] -mt-1 italic">
                          {isRu ? `Часовой пояс: UTC${tzHours >= 0 ? "+" : ""}${tzHours} (определён автоматически)`
                            : isEn ? `Timezone: UTC${tzHours >= 0 ? "+" : ""}${tzHours} (detected automatically)`
                            : `Часовий пояс: UTC${tzHours >= 0 ? "+" : ""}${tzHours} (визначено автоматично)`}
                        </p>
                      </div>
                    )}

                    {/* Live preview for event mode */}
                    {previewResult && (
                      <div className="p-3 rounded-xl bg-[rgba(196,169,122,0.06)] border border-[rgba(196,169,122,0.15)] text-center">
                        <p className="text-sm text-[#5C4530]">
                          🌙 {isRu ? "Луна" : isEn ? "Moon" : "Місяць"}{" "}
                          <span className="text-[#9A8A78]">
                            {isRu ? "в" : isEn ? "in" : "у"}
                          </span>{" "}
                          <strong className="text-[#B8883A]">{SIGN_GLYPHS[previewResult.moonSignIdx]} {signNames[previewResult.moonSignIdx]}</strong>{" "}
                          <span className="text-[#C4A97A]">{previewResult.moonDegree}°</span>
                          <span className="mx-1 text-[#C4A97A]/50">·</span>
                          <span className="text-[#7A6A58]">{phaseContent[previewResult.phaseKey].name}</span>
                        </p>
                      </div>
                    )}
                  </>
                )}

                {mode === "today" && result && (
                  <div className="p-4 rounded-xl bg-[rgba(196,169,122,0.06)] border border-[rgba(196,169,122,0.15)] text-center">
                    <p className="text-sm text-[#5C4530]">
                      🌙 {isRu ? "Сейчас" : isEn ? "Right now" : "Зараз"}:{" "}
                      <strong className="text-[#B8883A]">{SIGN_GLYPHS[result.moonSignIdx]} {signNames[result.moonSignIdx]}</strong>{" "}
                      <span className="text-[#C4A97A]">{result.moonDegree}°</span>
                      <span className="mx-1 text-[#C4A97A]/50">·</span>
                      <span className="text-[#7A6A58]">{phaseContent[result.phaseKey].name}</span>
                    </p>
                  </div>
                )}

                <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2 min-h-[48px]">
                  <ArrowRight size={16} />
                  {mode === "today"
                    ? (isRu ? "Открыть послание" : isEn ? "Open the message" : "Відкрити послання")
                    : (isRu ? "Рассчитать" : isEn ? "Calculate" : "Розрахувати")}
                </button>
              </form>
            </div>
          </AnimatedSection>

          {/* ── Result ── */}
          {result && (
            <AnimatedSection delay={0.1}>
              {/* Main moon card */}
              <div className="card-luxury text-center mb-6">
                <div className="text-6xl mb-3">{result.emoji}</div>
                <h2
                  className="text-3xl text-[#1C1512] mb-2"
                  style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}
                >
                  <TermHint hint={moonHint(language, "phase")}>
                    {phaseContent[result.phaseKey].name}
                  </TermHint>
                </h2>

                {/* Moon sign + degree badge */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[rgba(196,169,122,0.3)] bg-[rgba(196,169,122,0.06)] mb-6">
                  <span className="text-[#C4A97A] text-lg">{SIGN_GLYPHS[result.moonSignIdx]}</span>
                  <span className="text-sm text-[#7A6A58]">
                    {isRu ? "Луна в" : isEn ? "Moon in" : "Місяць у"}{" "}
                    <TermHint hint={moonHint(language, "moonSign")}>
                      <strong className="text-[#5C4530]">{signNames[result.moonSignIdx]}</strong>
                    </TermHint>
                    <TermHint hint={moonHint(language, "moonDegree")}>
                      <span className="text-[#C4A97A] ml-1">{result.moonDegree}°</span>
                    </TermHint>
                  </span>
                </div>

                {/* Visual */}
                <MoonVisual
                  illumination={result.illumination}
                  phaseKey={result.phaseKey}
                  phaseAngle={result.phaseAngle}
                  label={isRu ? "освещение" : isEn ? "illumination" : "освітлення"}
                />

                {/* Moon sign + keyword cards */}
                <div className="grid grid-cols-2 gap-3 mt-6">
                  <div className="p-4 rounded-xl bg-[rgba(196,169,122,0.06)] border border-[rgba(196,169,122,0.12)]">
                    <p className="text-xs text-[#7A6A58] mb-1 tracking-wide uppercase">
                      <TermHint hint={moonHint(language, "moonSign")}>
                        {isRu ? "Знак Луны" : isEn ? "Moon Sign" : "Знак Місяця"}
                      </TermHint>
                    </p>
                    <p className="text-[#B8883A] font-medium" style={{ fontFamily: "var(--font-cormorant)", fontSize: "1.25rem" }}>
                      {SIGN_GLYPHS[result.moonSignIdx]} {signNames[result.moonSignIdx]}
                    </p>
                    <p className="text-xs text-[#7A6A58] mt-1">{moonSignContent[result.moonSignIdx].energy}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-[rgba(196,169,122,0.06)] border border-[rgba(196,169,122,0.12)]">
                    <p className="text-xs text-[#7A6A58] mb-1 tracking-wide uppercase">
                      {isRu ? "Ключевое слово" : isEn ? "Keyword" : "Ключове слово"}
                    </p>
                    <p className="text-[#B8883A] font-medium" style={{ fontFamily: "var(--font-cormorant)", fontSize: "1.25rem" }}>
                      {moonSignContent[result.moonSignIdx].keyword}
                    </p>
                    <p className="text-xs text-[#7A6A58] mt-1">
                      <TermHint hint={moonHint(language, "illumination")}>
                        {isRu ? `${result.illumination}% освещения` : isEn ? `${result.illumination}% illuminated` : `${result.illumination}% освітлення`}
                      </TermHint>
                    </p>
                  </div>
                </div>

                {/* Static phase advice */}
                <div className="mt-6 p-6 bg-[rgba(196,169,122,0.06)] rounded-2xl border border-[rgba(196,169,122,0.15)]">
                  <p className="text-xl text-[#5C4530] italic" style={{ fontFamily: "var(--font-cormorant)" }}>
                    &ldquo;{phaseContent[result.phaseKey].advice}&rdquo;
                  </p>
                </div>

                {/* Astrological flags — always shows Moon speed; Dark Moon / VoC / OOB only when active */}
                <div className="flex flex-wrap justify-center gap-2 mt-5">
                  {/* Moon speed — always visible, colour-coded */}
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs border ${
                      result.moonSpeedClass === "fast"
                        ? "bg-[rgba(212,168,83,0.15)] text-[#B8883A] border-[rgba(212,168,83,0.4)]"
                        : result.moonSpeedClass === "slow"
                        ? "bg-[rgba(122,106,88,0.12)] text-[#5C4530] border-[rgba(122,106,88,0.3)]"
                        : "bg-[rgba(196,169,122,0.08)] text-[#7A6A58] border-[rgba(196,169,122,0.25)]"
                    }`}
                  >
                    <TermHint hint={moonHint(language, "moonSpeed")}>
                      {result.moonSpeedClass === "fast"
                        ? (isRu ? "⚡ Быстрая Луна" : isEn ? "⚡ Fast Moon" : "⚡ Швидкий Місяць")
                        : result.moonSpeedClass === "slow"
                        ? (isRu ? "🐌 Медленная Луна" : isEn ? "🐌 Slow Moon" : "🐌 Повільний Місяць")
                        : (isRu ? "Луна в норме" : isEn ? "Normal speed" : "Звичайна швидкість")}
                      <span className="ml-1.5 opacity-70 normal-case">
                        {Math.abs(result.moonSpeedDegPerDay).toFixed(1)}°/{isRu || !isEn ? "доба" : "day"}
                      </span>
                    </TermHint>
                  </span>

                  {result.isDarkMoon && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-[#1C1512] text-[#C4A97A] border border-[rgba(196,169,122,0.3)]">
                      <TermHint hint={moonHint(language, "darkMoon")}>
                        🌑 {isRu ? "Тёмная Луна" : isEn ? "Dark Moon" : "Темний Місяць"}
                      </TermHint>
                    </span>
                  )}
                  {result.voidOfCourse && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-[rgba(196,169,122,0.12)] text-[#7A6A58] border border-[rgba(196,169,122,0.3)]">
                      <TermHint hint={moonHint(language, "voc")}>
                        ⊘ {isRu ? "Пустая Луна (VoC)" : isEn ? "Void of Course" : "Пустий Місяць (VoC)"}
                      </TermHint>
                    </span>
                  )}
                  {result.isOutOfBounds && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-[rgba(28,21,18,0.85)] text-[#E8C98A] border border-[rgba(232,201,138,0.5)]">
                      <TermHint hint={moonHint(language, "outOfBounds")}>
                        🌠 {isRu ? "Out of Bounds" : isEn ? "Out of Bounds" : "Out of Bounds"}
                        <span className="ml-1.5 opacity-80 normal-case">
                          δ {result.moonDeclination >= 0 ? "+" : ""}{result.moonDeclination.toFixed(1)}°
                        </span>
                      </TermHint>
                    </span>
                  )}
                  {result.eclipseType && (
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${
                        result.eclipseType === "solar"
                          ? "bg-[#1C1512] text-[#E8C98A] border-[rgba(232,201,138,0.55)] shadow-sm"
                          : "bg-[rgba(184,136,58,0.95)] text-[#FDFBF7] border-[rgba(184,136,58,0.8)] shadow-sm"
                      }`}
                    >
                      <TermHint hint={moonHint(language, result.eclipseType === "solar" ? "eclipseSolar" : "eclipseLunar")}>
                        {result.eclipseType === "solar"
                          ? (isRu ? "🌒 СОЛНЕЧНОЕ ЗАТМЕНИЕ" : isEn ? "🌒 SOLAR ECLIPSE" : "🌒 СОНЯЧНЕ ЗАТЕМНЕННЯ")
                          : (isRu ? "🌕 ЛУННОЕ ЗАТМЕНИЕ" : isEn ? "🌕 LUNAR ECLIPSE" : "🌕 МІСЯЧНЕ ЗАТЕМНЕННЯ")}
                      </TermHint>
                    </span>
                  )}
                </div>

                {/* Lunar nodes + Lilith */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5 text-left">
                  <div className="p-3 rounded-xl bg-[rgba(196,169,122,0.06)] border border-[rgba(196,169,122,0.12)]">
                    <p className="text-[10px] text-[#C4A97A] tracking-widest uppercase mb-1">
                      <TermHint hint={moonHint(language, "northNode")}>
                        ☊ {isRu ? "Северный узел · Раху" : isEn ? "North Node · Rahu" : "Північний вузол · Раху"}
                      </TermHint>
                    </p>
                    <p className="text-sm text-[#5C4530]" style={{fontFamily:"var(--font-cormorant)", fontWeight:500}}>
                      {SIGN_GLYPHS[result.northNodeSignIdx]} {signNames[result.northNodeSignIdx]}
                    </p>
                    <p className="text-[10px] text-[#9A8A78] mt-0.5 italic">{isRu ? "карма роста" : isEn ? "growth karma" : "карма зростання"}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-[rgba(196,169,122,0.06)] border border-[rgba(196,169,122,0.12)]">
                    <p className="text-[10px] text-[#C4A97A] tracking-widest uppercase mb-1">
                      <TermHint hint={moonHint(language, "southNode")}>
                        ☋ {isRu ? "Южный узел · Кету" : isEn ? "South Node · Ketu" : "Південний вузол · Кету"}
                      </TermHint>
                    </p>
                    <p className="text-sm text-[#5C4530]" style={{fontFamily:"var(--font-cormorant)", fontWeight:500}}>
                      {SIGN_GLYPHS[result.southNodeSignIdx]} {signNames[result.southNodeSignIdx]}
                    </p>
                    <p className="text-[10px] text-[#9A8A78] mt-0.5 italic">{isRu ? "прошлый опыт" : isEn ? "past habits" : "минулий досвід"}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-[rgba(28,21,18,0.06)] border border-[rgba(28,21,18,0.18)]">
                    <p className="text-[10px] text-[#7A6A58] tracking-widest uppercase mb-1">
                      <TermHint hint={moonHint(language, "lilith")}>
                        ⚸ {isRu ? "Чёрная Луна · Лилит" : isEn ? "Black Moon · Lilith" : "Чорна Луна · Ліліт"}
                      </TermHint>
                    </p>
                    <p className="text-sm text-[#1C1512]" style={{fontFamily:"var(--font-cormorant)", fontWeight:500}}>
                      {SIGN_GLYPHS[result.lilithSignIdx]} {signNames[result.lilithSignIdx]}
                    </p>
                    <p className="text-[10px] text-[#9A8A78] mt-0.5 italic">{isRu ? "тень и сила" : isEn ? "shadow & power" : "тінь і сила"}</p>
                  </div>
                </div>

                {/* Triplicity rulers — the day/night/participating helpers of the
                    Moon's sign element. The currently-active ruler (per local hour)
                    is highlighted. Day/night is approximated by hour 06–18 until
                    natal-mode brings true sunrise data. */}
                <div className="mt-5 p-4 rounded-2xl bg-[rgba(196,169,122,0.05)] border border-[rgba(196,169,122,0.18)] text-left">
                  <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                    <p className="text-[10px] text-[#C4A97A] tracking-widest uppercase">
                      <TermHint hint={moonHint(language, "triplicity")}>
                        {isRu ? "Управители стихии" : isEn ? "Triplicity rulers" : "Управителі стихії"}
                      </TermHint>
                      <span className="ml-2 text-[#7A6A58] normal-case tracking-normal">
                        · {elementLabel[result.element].glyph} {elementLabel[result.element].name}
                      </span>
                    </p>
                    <p className="text-[10px] text-[#9A8A78] italic">
                      <TermHint hint={moonHint(language, "sect")}>
                        {result.isDayChart
                          ? (isRu ? "☀ Дневная секта" : isEn ? "☀ Day chart" : "☀ Денна секта")
                          : (isRu ? "🌙 Ночная секта" : isEn ? "🌙 Night chart" : "🌙 Нічна секта")}
                      </TermHint>
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {(["day", "night", "participating"] as const).map(slot => {
                      const planet =
                        slot === "day" ? result.rulerDay
                        : slot === "night" ? result.rulerNight
                        : result.rulerParticipating;
                      const isActive = slot !== "participating" && planet === result.rulerActive;
                      const slotLabel =
                        slot === "day" ? (isRu ? "День" : isEn ? "Day" : "День")
                        : slot === "night" ? (isRu ? "Ночь" : isEn ? "Night" : "Ніч")
                        : (isRu ? "Помощник" : isEn ? "Helper" : "Помічник");
                      const slotGlyph = slot === "day" ? "☀" : slot === "night" ? "🌙" : "⚹";
                      return (
                        <div
                          key={slot}
                          className={`p-2.5 rounded-xl border text-center transition-colors ${
                            isActive
                              ? "bg-[rgba(212,168,83,0.18)] border-[rgba(212,168,83,0.45)]"
                              : "bg-white/40 border-[rgba(196,169,122,0.18)]"
                          }`}
                        >
                          <p className="text-[9px] text-[#9A8A78] tracking-widest uppercase">
                            {slotGlyph} {slotLabel}
                          </p>
                          <p
                            className={`text-sm mt-1 ${isActive ? "text-[#B8883A] font-medium" : "text-[#5C4530]"}`}
                            style={{ fontFamily: "var(--font-cormorant)" }}
                          >
                            {planetLabel[planet].glyph} {planetLabel[planet].name}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Next events */}
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="text-center p-4 rounded-xl bg-[rgba(196,169,122,0.06)]">
                    <p className="text-xs text-[#7A6A58] mb-1 tracking-wide uppercase">
                      <TermHint hint={moonHint(language, "nextFull")}>
                        {isRu ? "Полнолуние" : isEn ? "Full Moon" : "Повний місяць"}
                      </TermHint>
                    </p>
                    <p className="text-[#B8883A] font-medium" style={{ fontFamily: "var(--font-cormorant)", fontSize: "1.2rem" }}>
                      {fmtDate(result.nextFull, language)}
                    </p>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-[rgba(196,169,122,0.06)]">
                    <p className="text-xs text-[#7A6A58] mb-1 tracking-wide uppercase">
                      <TermHint hint={moonHint(language, "nextNew")}>
                        {isRu ? "Новолуние" : isEn ? "New Moon" : "Новомісяць"}
                      </TermHint>
                    </p>
                    <p className="text-[#B8883A] font-medium" style={{ fontFamily: "var(--font-cormorant)", fontSize: "1.2rem" }}>
                      {fmtDate(result.nextNew, language)}
                    </p>
                  </div>
                </div>
              </div>

              {/* ── "Що це для тебе?" expand blocks for Dark Moon / VoC ── */}
              {(result.isDarkMoon || result.voidOfCourse) && (
                <div className="space-y-3 mb-6">
                  {result.isDarkMoon && (
                    <AdviceExpand
                      language={language}
                      adviceKey="darkMoon"
                      badge={<>🌑 {isRu ? "Тёмная Луна" : isEn ? "Dark Moon" : "Темний Місяць"}</>}
                      question={isRu ? "Что это для тебя сейчас?" : isEn ? "What does this mean for you right now?" : "Що це для тебе зараз?"}
                    />
                  )}
                  {result.voidOfCourse && (
                    <AdviceExpand
                      language={language}
                      adviceKey="voc"
                      badge={<>⊘ {isRu ? "Пустая Луна (Void of Course)" : isEn ? "Void of Course" : "Пустий Місяць (Void of Course)"}</>}
                      question={isRu ? "Что это для тебя сейчас?" : isEn ? "What does this mean for you right now?" : "Що це для тебе зараз?"}
                    />
                  )}
                </div>
              )}

              {/* ── AI personal message ── */}
              {!aiResult && (
                <div className="card-luxury text-center">
                  <div className="text-3xl mb-3">✨</div>
                  <h3
                    className="text-2xl text-[#1C1512] mb-2"
                    style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}
                  >
                    {isRu ? "Личное лунное послание" : isEn ? "Personal Moon Message" : "Особисте місячне послання"}
                  </h3>
                  <p className="text-sm text-[#7A6A58] mb-6 leading-relaxed">
                    {isRu
                      ? `Луна в ${signNames[result.moonSignIdx]}, ${result.moonDegree}° — персональное послание для этого момента.`
                      : isEn
                      ? `Moon in ${signNames[result.moonSignIdx]}, ${result.moonDegree}° — a personal message for this exact moment.`
                      : `Місяць у ${signNames[result.moonSignIdx]}, ${result.moonDegree}° — особисте послання для цього моменту.`}
                  </p>

                  {!aiRateLimited && (
                    <button
                      onClick={handleAi}
                      disabled={aiLoading}
                      className="btn-primary flex items-center gap-2 mx-auto disabled:opacity-60"
                    >
                      <Sparkles size={16} />
                      {aiLoading
                        ? (isRu ? "Читаем Луну…" : isEn ? "Reading the Moon…" : "Читаємо Місяць…")
                        : (isRu ? "Получить послание" : isEn ? "Get my message" : "Отримати послання")}
                    </button>
                  )}

                  {aiError && (
                    <p className="mt-4 text-sm text-[#B8883A]">{aiError}</p>
                  )}
                </div>
              )}

              {/* AI result */}
              {aiResult && (
                <div className="card-luxury">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D4A853] to-[#C4A97A] flex items-center justify-center text-white text-base flex-shrink-0">
                      🌙
                    </div>
                    <div>
                      <p className="text-base text-[#1C1512]" style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}>
                        {isRu ? "Лунное послание" : isEn ? "Lunar Message" : "Місячне послання"}
                      </p>
                      <p className="text-xs text-[#7A6A58]">
                        {signNames[result.moonSignIdx]} · {result.moonDegree}° · {phaseContent[result.phaseKey].name}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className="text-[#5C4530] leading-relaxed" style={{ fontFamily: "var(--font-cormorant)", fontSize: "1.15rem" }}>
                      {aiResult.energy}
                    </p>
                    {aiResult.advice && (
                      <p className="text-[#5C4530] leading-relaxed" style={{ fontFamily: "var(--font-cormorant)", fontSize: "1.15rem" }}>
                        {aiResult.advice}
                      </p>
                    )}
                    {aiResult.affirmation && (
                      <div className="mt-4 p-5 bg-[rgba(196,169,122,0.08)] rounded-xl border border-[rgba(196,169,122,0.2)]">
                        <p className="text-xs text-[#C4A97A] tracking-widest uppercase mb-2">
                          {isRu ? "Аффирмация" : isEn ? "Affirmation" : "Аффірмація"}
                        </p>
                        <p className="text-[#B8883A] italic text-xl" style={{ fontFamily: "var(--font-cormorant)" }}>
                          {aiResult.affirmation}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── Recommendations (Phase #14) — separate AI call, separate daily quota.
                  Cached client-side per (language × moon sign): the same sign never
                  re-fetches. Only the very first click for a fresh sign burns quota. */}
              <div className="card-luxury mt-6">
                <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[#C4A97A] tracking-widest uppercase mb-1">
                      <TermHint hint={moonHint(language, "recommendations")}>
                        {isRu ? "Кристаллы · масла · чаи" : isEn ? "Crystals · oils · teas" : "Кристали · олії · чаї"}
                      </TermHint>
                    </p>
                    <h3 className="text-xl text-[#1C1512]" style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}>
                      {isRu ? "Поддержка для Луны в" : isEn ? "Support for the Moon in" : "Підтримка для Місяця у"}{" "}
                      <span className="text-[#B8883A]">{SIGN_GLYPHS[result.moonSignIdx]} {signNames[result.moonSignIdx]}</span>
                    </h3>
                  </div>
                </div>

                {!recResult && !recRateLimited && (
                  <button
                    type="button"
                    onClick={handleRecommendations}
                    disabled={recLoading}
                    className="btn-primary w-full min-h-[48px] flex items-center justify-center gap-2"
                  >
                    {recLoading ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        {isRu ? "Подбираем…" : isEn ? "Curating…" : "Підбираємо…"}
                      </span>
                    ) : (
                      <>✦ {isRu ? "Получить рекомендации" : isEn ? "Get recommendations" : "Отримати рекомендації"}</>
                    )}
                  </button>
                )}

                {recError && (
                  <p className={`text-sm text-center ${recRateLimited ? "text-[#7A6A58] italic" : "text-[#9A6E28]"}`}>
                    {recError}
                  </p>
                )}

                {recResult && (
                  <div className="grid sm:grid-cols-3 gap-3 mt-4">
                    {([
                      { key: "crystals" as const, glyph: "✦",
                        title: isRu ? "Кристаллы" : isEn ? "Crystals" : "Кристали" },
                      { key: "oils" as const, glyph: "💧",
                        title: isRu ? "Эфирные масла" : isEn ? "Essential oils" : "Ефірні олії" },
                      { key: "teas" as const, glyph: "🍵",
                        title: isRu ? "Травяные чаи" : isEn ? "Herbal teas" : "Травʼяні чаї" },
                    ]).map(group => (
                      <div key={group.key} className="p-4 rounded-2xl bg-[rgba(196,169,122,0.06)] border border-[rgba(196,169,122,0.18)]">
                        <p className="text-[10px] text-[#C4A97A] tracking-widest uppercase mb-3 text-center">
                          {group.glyph} {group.title}
                        </p>
                        <ul className="space-y-3">
                          {recResult[group.key].map((item, i) => (
                            <li key={i}>
                              <p className="text-sm text-[#5C4530] font-medium" style={{ fontFamily: "var(--font-cormorant)" }}>
                                {item.name}
                              </p>
                              <p className="text-xs text-[#7A6A58] mt-0.5 leading-relaxed">
                                {item.why}
                              </p>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </AnimatedSection>
          )}

          {/* ── Monthly lunar calendar (Phase #12) ──
              Always-visible grid below the result. Gives daily-returning
              users a reason to come back and a quick visual of the whole
              cycle. Click any day → form jumps to event mode + that date. */}
          <AnimatedSection delay={0.15}>
            <div className="mt-10">
              <MoonCalendar
                language={language}
                calc={(y, m, d, h, min, tz) => {
                  const r = calcMoonPhase(y, m, d, h, min, tz);
                  return {
                    emoji: r.emoji,
                    moonSignIdx: r.moonSignIdx,
                    phaseKey: r.phaseKey,
                    illumination: r.illumination,
                  };
                }}
                phaseNameOf={(key) => phaseContent[key as keyof typeof phaseContent]?.name ?? key}
                onSelectDate={handleCalendarSelect}
              />
            </div>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
