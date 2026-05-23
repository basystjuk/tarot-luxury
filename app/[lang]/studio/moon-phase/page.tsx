"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowRight, Sparkles, ChevronDown, Check } from "lucide-react";
import AnimatedSection from "@/components/ui/AnimatedSection";
import GoldDivider from "@/components/ui/GoldDivider";
import { useLanguage } from "@/hooks/useLanguage";
import { dateToJD, calcPlanetDeg, SIGNS_UA, SIGNS_EN, SIGN_GLYPHS } from "@/lib/astro/calculations";

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

  return {
    phaseKey, phaseAngle: elongation, illumination, emoji,
    nextFull: fullDate, nextNew: newDate,
    moonSignIdx, moonDegree,
    isDarkMoon, voidOfCourse,
    northNodeSignIdx, southNodeSignIdx,
    lilithSignIdx,
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

// ── Page ──────────────────────────────────────────────────────────────────────

export default function MoonPhasePage() {
  const { language } = useLanguage();
  const isRu = language === "ru";
  const isEn = language === "en";

  const today = new Date();
  // Browser timezone offset in hours (Date.getTimezoneOffset returns minutes WEST of UTC)
  const tzHours = -today.getTimezoneOffset() / 60;

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
  const [sunSignIdx, setSunSignIdx]   = useState<number | null>(null);

  const phaseContent    = isRu ? PHASE_CONTENT.ru    : isEn ? PHASE_CONTENT.en    : PHASE_CONTENT.uk;
  const moonSignContent = isRu ? MOON_SIGN_CONTENT.ru : isEn ? MOON_SIGN_CONTENT.en : MOON_SIGN_CONTENT.uk;
  const signNames       = isRu ? SIGNS_RU : isEn ? SIGNS_EN : SIGNS_UA;

  // Auto-calculate today on first render — use current hour/minute for live data
  const [initialized, setInitialized] = useState(false);
  if (!initialized) {
    setInitialized(true);
    setResult(calcMoonPhase(today.getFullYear(), today.getMonth() + 1, today.getDate(), today.getHours(), today.getMinutes(), tzHours));
  }

  // Live preview computed on every form change
  const previewResult = (() => {
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
    const h = useExactTime ? parseInt(form.hour || "12") : 12;
    const min = useExactTime ? parseInt(form.minute || "0") : 0;
    setResult(calcMoonPhase(parseInt(form.year), parseInt(form.month), parseInt(form.day), h, min, useExactTime ? tzHours : 0));
    setAiResult(null);
    setAiError(null);
    setAiRateLimited(false);
  };

  const handleAi = async () => {
    if (!result) return;
    setAiLoading(true);
    setAiError(null);
    try {
      const moonSign   = signNames[result.moonSignIdx];
      const moonSignEn = SIGNS_EN[result.moonSignIdx];
      const phaseName  = phaseContent[result.phaseKey].name;

      // Detect usage context from selected date
      const selectedDate = new Date(parseInt(form.year), parseInt(form.month) - 1, parseInt(form.day));
      const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const usageContext =
        selectedDate.getTime() === todayMidnight.getTime() ? "today"
        : selectedDate < todayMidnight ? "natal"
        : "future";

      const sunSign   = sunSignIdx !== null ? signNames[sunSignIdx] : null;
      const sunSignEn = sunSignIdx !== null ? SIGNS_EN[sunSignIdx]  : null;

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

          {/* ── Date form ── */}
          <AnimatedSection>
            <div className="card-luxury mb-8">
              <h2
                className="text-2xl text-[#1C1512] mb-2"
                style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}
              >
                {isRu ? "Выберите дату" : isEn ? "Select a date" : "Оберіть дату"}
              </h2>
              <p className="text-sm text-[#7A6A58] mb-6 leading-relaxed">
                {isRu
                  ? "Сегодня, дата рождения или любое важное событие — Луна расскажет своим языком."
                  : isEn
                  ? "Today, your birth date, or any meaningful event — the Moon speaks its own language."
                  : "Сьогодні, дата народження або будь-яка важлива подія — Місяць розкаже своєю мовою."}
              </p>
              <form onSubmit={handleSubmit} className="space-y-5">
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

                {/* Optional exact time toggle */}
                <div className="flex items-center justify-between gap-3 py-1">
                  <label htmlFor="useExactTime" className="text-xs text-[#7A6A58] tracking-wide cursor-pointer">
                    {isRu ? "Указать точное время (точнее знак Луны)"
                      : isEn ? "Specify exact time (more accurate Moon sign)"
                      : "Вказати точний час (точніший знак Місяця)"}
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

                {/* Optional Sun sign — custom branded dropdown */}
                <div>
                  <label className="block text-xs text-[#7A6A58] mb-2 tracking-wide">
                    {isRu ? "Ваш знак Солнца (необязательно)" : isEn ? "Your Sun sign (optional)" : "Ваш знак Сонця (необов'язково)"}
                  </label>
                  <CustomDropdown
                    value={sunSignIdx}
                    options={signNames.map((s, i) => ({ idx: i, label: s, glyph: SIGN_GLYPHS[i] }))}
                    onChange={setSunSignIdx}
                    placeholder={isRu ? "— не указывать —" : isEn ? "— not specified —" : "— не вказувати —"}
                    ariaLabel={isRu ? "Знак Солнца" : isEn ? "Sun sign" : "Знак Сонця"}
                  />
                  <p className="text-[10px] text-[#C4A97A] mt-1 italic">
                    {isRu ? "Знак Солнца уточняет взаимодействие лунной и солнечной энергий в послании"
                      : isEn ? "Your Sun sign adds Sun–Moon interaction nuance to the reading"
                      : "Знак Сонця додає нюанс взаємодії місячної та сонячної енергій у посланні"}
                  </p>
                </div>

                {/* Live preview */}
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

                <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2 min-h-[48px]">
                  <ArrowRight size={16} />
                  {isRu ? "Рассчитать" : isEn ? "Calculate" : "Розрахувати"}
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
                  {phaseContent[result.phaseKey].name}
                </h2>

                {/* Moon sign + degree badge */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[rgba(196,169,122,0.3)] bg-[rgba(196,169,122,0.06)] mb-6">
                  <span className="text-[#C4A97A] text-lg">{SIGN_GLYPHS[result.moonSignIdx]}</span>
                  <span className="text-sm text-[#7A6A58]">
                    {isRu ? "Луна в" : isEn ? "Moon in" : "Місяць у"}{" "}
                    <strong className="text-[#5C4530]">{signNames[result.moonSignIdx]}</strong>
                    <span className="text-[#C4A97A] ml-1">{result.moonDegree}°</span>
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
                      {isRu ? "Знак Луны" : isEn ? "Moon Sign" : "Знак Місяця"}
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
                      {isRu ? `${result.illumination}% освещения` : isEn ? `${result.illumination}% illuminated` : `${result.illumination}% освітлення`}
                    </p>
                  </div>
                </div>

                {/* Static phase advice */}
                <div className="mt-6 p-6 bg-[rgba(196,169,122,0.06)] rounded-2xl border border-[rgba(196,169,122,0.15)]">
                  <p className="text-xl text-[#5C4530] italic" style={{ fontFamily: "var(--font-cormorant)" }}>
                    &ldquo;{phaseContent[result.phaseKey].advice}&rdquo;
                  </p>
                </div>

                {/* Astrological flags */}
                {(result.isDarkMoon || result.voidOfCourse) && (
                  <div className="flex flex-wrap justify-center gap-2 mt-5">
                    {result.isDarkMoon && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-[#1C1512] text-[#C4A97A] border border-[rgba(196,169,122,0.3)]">
                        🌑 {isRu ? "Тёмная Луна" : isEn ? "Dark Moon" : "Темний Місяць"}
                      </span>
                    )}
                    {result.voidOfCourse && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-[rgba(196,169,122,0.12)] text-[#7A6A58] border border-[rgba(196,169,122,0.3)]">
                        ⊘ {isRu ? "Пустая Луна (VoC)" : isEn ? "Void of Course" : "Пустий Місяць (VoC)"}
                      </span>
                    )}
                  </div>
                )}

                {/* Lunar nodes + Lilith */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5 text-left">
                  <div className="p-3 rounded-xl bg-[rgba(196,169,122,0.06)] border border-[rgba(196,169,122,0.12)]">
                    <p className="text-[10px] text-[#C4A97A] tracking-widest uppercase mb-1">
                      ☊ {isRu ? "Северный узел · Раху" : isEn ? "North Node · Rahu" : "Північний вузол · Раху"}
                    </p>
                    <p className="text-sm text-[#5C4530]" style={{fontFamily:"var(--font-cormorant)", fontWeight:500}}>
                      {SIGN_GLYPHS[result.northNodeSignIdx]} {signNames[result.northNodeSignIdx]}
                    </p>
                    <p className="text-[10px] text-[#9A8A78] mt-0.5 italic">{isRu ? "карма роста" : isEn ? "growth karma" : "карма зростання"}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-[rgba(196,169,122,0.06)] border border-[rgba(196,169,122,0.12)]">
                    <p className="text-[10px] text-[#C4A97A] tracking-widest uppercase mb-1">
                      ☋ {isRu ? "Южный узел · Кету" : isEn ? "South Node · Ketu" : "Південний вузол · Кету"}
                    </p>
                    <p className="text-sm text-[#5C4530]" style={{fontFamily:"var(--font-cormorant)", fontWeight:500}}>
                      {SIGN_GLYPHS[result.southNodeSignIdx]} {signNames[result.southNodeSignIdx]}
                    </p>
                    <p className="text-[10px] text-[#9A8A78] mt-0.5 italic">{isRu ? "прошлый опыт" : isEn ? "past habits" : "минулий досвід"}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-[rgba(28,21,18,0.06)] border border-[rgba(28,21,18,0.18)]">
                    <p className="text-[10px] text-[#7A6A58] tracking-widest uppercase mb-1">
                      ⚸ {isRu ? "Чёрная Луна · Лилит" : isEn ? "Black Moon · Lilith" : "Чорна Луна · Ліліт"}
                    </p>
                    <p className="text-sm text-[#1C1512]" style={{fontFamily:"var(--font-cormorant)", fontWeight:500}}>
                      {SIGN_GLYPHS[result.lilithSignIdx]} {signNames[result.lilithSignIdx]}
                    </p>
                    <p className="text-[10px] text-[#9A8A78] mt-0.5 italic">{isRu ? "тень и сила" : isEn ? "shadow & power" : "тінь і сила"}</p>
                  </div>
                </div>

                {/* Next events */}
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="text-center p-4 rounded-xl bg-[rgba(196,169,122,0.06)]">
                    <p className="text-xs text-[#7A6A58] mb-1 tracking-wide uppercase">
                      {isRu ? "Полнолуние" : isEn ? "Full Moon" : "Повний місяць"}
                    </p>
                    <p className="text-[#B8883A] font-medium" style={{ fontFamily: "var(--font-cormorant)", fontSize: "1.2rem" }}>
                      {fmtDate(result.nextFull, language)}
                    </p>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-[rgba(196,169,122,0.06)]">
                    <p className="text-xs text-[#7A6A58] mb-1 tracking-wide uppercase">
                      {isRu ? "Новолуние" : isEn ? "New Moon" : "Новомісяць"}
                    </p>
                    <p className="text-[#B8883A] font-medium" style={{ fontFamily: "var(--font-cormorant)", fontSize: "1.2rem" }}>
                      {fmtDate(result.nextNew, language)}
                    </p>
                  </div>
                </div>
              </div>

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
            </AnimatedSection>
          )}
        </div>
      </section>
    </>
  );
}
