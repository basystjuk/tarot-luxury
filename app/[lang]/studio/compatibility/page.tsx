"use client";

import { useState } from "react";
import { Heart, Sparkles } from "lucide-react";
import AnimatedSection from "@/components/ui/AnimatedSection";
import GoldDivider from "@/components/ui/GoldDivider";
import { useLanguage } from "@/hooks/useLanguage";
import { SIGNS_UA, SIGNS_EN, SIGN_GLYPHS, dateToJD, calcPlanetDeg } from "@/lib/astro/calculations";

// ── Zodiac data ───────────────────────────────────────────────────────────────
const SIGNS_RU = [
  "Овен","Телец","Близнецы","Рак",
  "Лев","Дева","Весы","Скорпион",
  "Стрелец","Козерог","Водолей","Рыбы",
];
const ELEMENTS_UA = ["Вогонь","Земля","Повітря","Вода","Вогонь","Земля","Повітря","Вода","Вогонь","Земля","Повітря","Вода"];
const ELEMENTS_RU = ["Огонь","Земля","Воздух","Вода","Огонь","Земля","Воздух","Вода","Огонь","Земля","Воздух","Вода"];
const ELEMENTS_EN = ["Fire","Earth","Air","Water","Fire","Earth","Air","Water","Fire","Earth","Air","Water"];

// ── Numerology helpers ────────────────────────────────────────────────────────
const LETTER_VALUES: Record<string, number> = {
  а:1,б:2,в:3,г:4,ґ:5,д:6,е:7,є:8,ж:9,
  з:1,и:2,і:3,ї:4,й:5,к:6,л:7,м:8,н:9,
  о:1,п:2,р:3,с:4,т:5,у:6,ф:7,х:8,ц:9,
  ч:1,ш:2,щ:3,ю:5,я:6,
  ё:7,ы:2,э:5,
  a:1,b:2,c:3,d:4,e:5,f:6,g:7,h:8,i:9,
  j:1,k:2,l:3,m:4,n:5,o:6,p:7,q:8,r:9,
  s:1,t:2,u:3,v:4,w:5,x:6,y:7,z:8,
};

function reduceNum(n: number): number {
  if (n === 11 || n === 22 || n === 33) return n;
  if (n < 10) return n;
  return reduceNum(String(n).split("").reduce((a, d) => a + parseInt(d), 0));
}

function calcLifePath(day: number, month: number, year: number): number {
  const d = reduceNum(day);
  const m = reduceNum(month);
  const y = reduceNum(String(year).split("").reduce((a, c) => a + parseInt(c), 0));
  return reduceNum(d + m + y);
}

function calcDestiny(name: string): number {
  const val = name.toLowerCase().split("").reduce((s, c) => s + (LETTER_VALUES[c] ?? 0), 0);
  return reduceNum(val);
}

// Zodiac index from birthday
function getZodiacIndex(day: number, month: number): number {
  if ((month === 3  && day >= 21) || (month === 4  && day <= 19)) return 0;  // Aries
  if ((month === 4  && day >= 20) || (month === 5  && day <= 20)) return 1;  // Taurus
  if ((month === 5  && day >= 21) || (month === 6  && day <= 20)) return 2;  // Gemini
  if ((month === 6  && day >= 21) || (month === 7  && day <= 22)) return 3;  // Cancer
  if ((month === 7  && day >= 23) || (month === 8  && day <= 22)) return 4;  // Leo
  if ((month === 8  && day >= 23) || (month === 9  && day <= 22)) return 5;  // Virgo
  if ((month === 9  && day >= 23) || (month === 10 && day <= 22)) return 6;  // Libra
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 7;  // Scorpio
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 8;  // Sagittarius
  if ((month === 12 && day >= 22) || (month === 1  && day <= 19)) return 9;  // Capricorn
  if ((month === 1  && day >= 20) || (month === 2  && day <= 18)) return 10; // Aquarius
  return 11; // Pisces
}

// ── Zodiac compatibility ──────────────────────────────────────────────────────
type CompatType = "same"|"trine"|"sextile"|"opposition"|"square"|"quincunx"|"neutral";

type RelType = "romantic" | "business" | "friendship";

function getZodiacCompat(s1: number, s2: number, relType: RelType): { score: number; type: CompatType } {
  const diff = Math.abs(s1 - s2);
  const d = Math.min(diff, 12 - diff);
  if (s1 === s2) {
    // Same sign: business/friendship benefits from shared values; romance can stagnate
    return { score: relType === "romantic" ? 3 : 5, type: "same" };
  }
  if (d === 4)    return { score: 5, type: "trine" };
  if (d === 2)    return { score: 4, type: "sextile" };
  if (d === 6) {
    // Opposition: romantic magnetism; business friction; friendship balanced
    return { score: relType === "romantic" ? 4 : relType === "business" ? 2 : 3, type: "opposition" };
  }
  if (d === 3)    return { score: 2, type: "square" };
  if (d === 5)    return { score: 3, type: "quincunx" };
  return          { score: 3, type: "neutral" };
}

// ── Helpers for additional planetary points ─────────────────────────────────
function signFromLon(lon: number): number {
  return Math.floor(((lon % 360) + 360) % 360 / 30);
}

// Midpoint of two ecliptic longitudes, taking shorter arc
function midpointLon(a: number, b: number): number {
  const diff = ((b - a) % 360 + 360) % 360;
  const mid = diff > 180 ? a + (diff - 360) / 2 : a + diff / 2;
  return ((mid % 360) + 360) % 360;
}

// ── LP compatibility matrix ───────────────────────────────────────────────────
const LP_COMPAT: Record<number, Record<number, number>> = {
  1: {1:3, 2:4, 3:4, 4:3, 5:4, 6:2, 7:4, 8:4, 9:3},
  2: {1:4, 2:5, 3:3, 4:4, 5:3, 6:5, 7:4, 8:3, 9:4},
  3: {1:4, 2:3, 3:4, 4:2, 5:4, 6:4, 7:3, 8:3, 9:5},
  4: {1:3, 2:4, 3:2, 4:5, 5:2, 6:4, 7:4, 8:4, 9:3},
  5: {1:4, 2:3, 3:4, 4:2, 5:3, 6:3, 7:3, 8:3, 9:4},
  6: {1:2, 2:5, 3:4, 4:4, 5:3, 6:5, 7:3, 8:4, 9:5},
  7: {1:4, 2:4, 3:3, 4:4, 5:3, 6:3, 7:5, 8:3, 9:4},
  8: {1:4, 2:3, 3:3, 4:4, 5:3, 6:4, 7:3, 8:4, 9:3},
  9: {1:3, 2:4, 3:5, 4:3, 5:4, 6:5, 7:4, 8:3, 9:4},
};

function getNumCompat(lp1: number, lp2: number): number {
  const base = (n: number) => n === 11 ? 2 : n === 22 ? 4 : n === 33 ? 6 : n;
  const a = base(lp1), b = base(lp2);
  return LP_COMPAT[a]?.[b] ?? LP_COMPAT[b]?.[a] ?? 3;
}

// ── Elemental compatibility ───────────────────────────────────────────────────
// element index = zodiacIndex % 4: 0=Fire,1=Earth,2=Air,3=Water
const ELEM_SCORE: number[][] = [
  [4, 2, 5, 2], // Fire vs Fire, Earth, Air, Water
  [2, 4, 3, 5], // Earth
  [5, 3, 3, 3], // Air
  [2, 5, 3, 4], // Water
];
function getElemIdx(z: number): number { return z % 4; }
function getElemScore(z1: number, z2: number): number {
  return ELEM_SCORE[getElemIdx(z1)][getElemIdx(z2)];
}

const ELEM_PAIR_LABEL: Record<string, {uk:string;ru:string;en:string}> = {
  "0-0":{uk:"Вогонь і Вогонь — пристрасть і суперництво",ru:"Огонь и Огонь — страсть и соперничество",en:"Fire & Fire — passion and rivalry"},
  "0-1":{uk:"Вогонь і Земля — різні ритми",ru:"Огонь и Земля — разные ритмы",en:"Fire & Earth — different rhythms"},
  "0-2":{uk:"Вогонь і Повітря — взаємне натхнення",ru:"Огонь и Воздух — взаимное вдохновение",en:"Fire & Air — mutual inspiration"},
  "0-3":{uk:"Вогонь і Вода — суперечливі сили",ru:"Огонь и Вода — противоречивые силы",en:"Fire & Water — conflicting forces"},
  "1-1":{uk:"Земля і Земля — спільний ґрунт",ru:"Земля и Земля — общая почва",en:"Earth & Earth — common ground"},
  "1-2":{uk:"Земля і Повітря — різні швидкості",ru:"Земля и Воздух — разные скорости",en:"Earth & Air — different speeds"},
  "1-3":{uk:"Земля і Вода — природне поєднання",ru:"Земля и Вода — природное соединение",en:"Earth & Water — natural union"},
  "2-2":{uk:"Повітря і Повітря — легкість без якоря",ru:"Воздух и Воздух — лёгкость без якоря",en:"Air & Air — lightness without anchor"},
  "2-3":{uk:"Повітря і Вода — думки зустрічають почуття",ru:"Воздух и Вода — мысли встречают чувства",en:"Air & Water — thoughts meet feelings"},
  "3-3":{uk:"Вода і Вода — глибина та злиття",ru:"Вода и Вода — глубина и слияние",en:"Water & Water — depth and merger"},
};
function getElemLabel(z1: number, z2: number, lang: string): string {
  const a = getElemIdx(z1), b = getElemIdx(z2);
  const key = `${Math.min(a,b)}-${Math.max(a,b)}`;
  const e = ELEM_PAIR_LABEL[key];
  return e ? (lang==="ru" ? e.ru : lang==="en" ? e.en : e.uk) : "";
}

// ── Modality ──────────────────────────────────────────────────────────────────
function getModality(z: number): number { return z % 3; }

const MODALITY_PAIR_LABEL: Record<string, {uk:string;ru:string;en:string}> = {
  "0-0":{uk:"Обидва кардинальні — боротьба за ініціативу",ru:"Оба кардинальные — борьба за инициативу",en:"Both cardinal — competing for lead"},
  "1-1":{uk:"Обидва фіксовані — стійкість і впертість",ru:"Оба фиксированные — стойкость и упрямство",en:"Both fixed — stable but stubborn"},
  "2-2":{uk:"Обидва мутабельні — гнучкість без якоря",ru:"Оба мутабельные — гибкость без якоря",en:"Both mutable — flexible but ungrounded"},
  "0-1":{uk:"Кардинальний + Фіксований — ініціатива і стабільність",ru:"Кардинальный + Фиксированный — инициатива и стабильность",en:"Cardinal + Fixed — initiative meets stability"},
  "0-2":{uk:"Кардинальний + Мутабельний — лідер і адаптер",ru:"Кардинальный + Мутабельный — лидер и адаптер",en:"Cardinal + Mutable — leader and adapter"},
  "1-2":{uk:"Фіксований + Мутабельний — якір і вітер",ru:"Фиксированный + Мутабельный — якорь и ветер",en:"Fixed + Mutable — anchor and breeze"},
};
function getModalityLabel(z1: number, z2: number, lang: string): string {
  const a = getModality(z1), b = getModality(z2);
  const key = `${Math.min(a,b)}-${Math.max(a,b)}`;
  const e = MODALITY_PAIR_LABEL[key];
  return e ? (lang==="ru" ? e.ru : lang==="en" ? e.en : e.uk) : "";
}

// ── Soul Urge ─────────────────────────────────────────────────────────────────
const VOWELS_SET = new Set(["а","е","є","и","і","ї","о","у","ю","я","ё","ы","э","a","e","i","o","u"]);
function calcSoul(name: string): number {
  const val = name.toLowerCase().split("").reduce((s,c) =>
    VOWELS_SET.has(c) && LETTER_VALUES[c] ? s + LETTER_VALUES[c] : s, 0);
  return reduceNum(val || 1);
}
const SOUL_KEYWORDS: Record<string, Record<number,string>> = {
  uk:{1:"Незалежність",2:"Єдність",3:"Самовираження",4:"Стабільність",5:"Свобода",6:"Любов",7:"Глибина",8:"Визнання",9:"Служіння",11:"Просвітлення",22:"Велич",33:"Безумовна любов"},
  ru:{1:"Независимость",2:"Единство",3:"Самовыражение",4:"Стабильность",5:"Свобода",6:"Любовь",7:"Глубина",8:"Признание",9:"Служение",11:"Просветление",22:"Величие",33:"Безусловная любовь"},
  en:{1:"Independence",2:"Unity",3:"Self-expression",4:"Stability",5:"Freedom",6:"Love",7:"Depth",8:"Recognition",9:"Service",11:"Enlightenment",22:"Greatness",33:"Unconditional love"},
};

// Life Path keyword maps
const LP_KEYWORDS: Record<string, Record<number, string>> = {
  uk: { 1:"Лідер",2:"Дипломат",3:"Творець",4:"Будівельник",5:"Дослідник",6:"Вихователь",7:"Мудрець",8:"Реалізатор",9:"Гуманіст",11:"Ясновидець",22:"Майстер-будівельник",33:"Майстер-вчитель" },
  ru: { 1:"Лидер",2:"Дипломат",3:"Творец",4:"Строитель",5:"Исследователь",6:"Наставник",7:"Мудрец",8:"Реализатор",9:"Гуманист",11:"Ясновидящий",22:"Мастер-строитель",33:"Мастер-учитель" },
  en: { 1:"Leader",2:"Diplomat",3:"Creator",4:"Builder",5:"Explorer",6:"Nurturer",7:"Seeker",8:"Achiever",9:"Humanitarian",11:"Visionary",22:"Master Builder",33:"Master Teacher" },
};
const DEST_KEYWORDS: Record<string, Record<number, string>> = {
  uk: { 1:"Ініціатор",2:"Партнер",3:"Виразник",4:"Майстер",5:"Авантюрист",6:"Покровитель",7:"Дослідник",8:"Організатор",9:"Мудрець",11:"Натхненник",22:"Архітектор",33:"Цілитель" },
  ru: { 1:"Инициатор",2:"Партнёр",3:"Выразитель",4:"Мастер",5:"Авантюрист",6:"Покровитель",7:"Исследователь",8:"Организатор",9:"Мудрец",11:"Вдохновитель",22:"Архитектор",33:"Целитель" },
  en: { 1:"Initiator",2:"Partner",3:"Expresser",4:"Craftsman",5:"Adventurer",6:"Guardian",7:"Analyst",8:"Organiser",9:"Sage",11:"Inspirer",22:"Architect",33:"Healer" },
};

const COMPAT_LABELS: Record<string, Record<CompatType, string>> = {
  uk: { same:"Дзеркало",trine:"Гармонія стихій",sextile:"Приємна сумісність",opposition:"Магнетичне притяжіння",square:"Пристрасна напруга",quincunx:"Складна гармонія",neutral:"Нейтральна енергія" },
  ru: { same:"Зеркало",trine:"Гармония стихий",sextile:"Приятная совместимость",opposition:"Магнетическое притяжение",square:"Страстное напряжение",quincunx:"Сложная гармония",neutral:"Нейтральная энергия" },
  en: { same:"Mirror Match",trine:"Elemental Harmony",sextile:"Pleasant Compatibility",opposition:"Magnetic Attraction",square:"Passionate Tension",quincunx:"Complex Harmony",neutral:"Neutral Energy" },
};

// ── Sub-components ────────────────────────────────────────────────────────────
function ScoreBar({ score }: { score: number }) {
  return (
    <div className="flex gap-1.5">
      {[1,2,3,4,5].map(s => (
        <div key={s} className="flex-1 h-2 rounded-full transition-all duration-500"
          style={{ background: s <= score ? "#D4A853" : "rgba(196,169,122,0.2)" }} />
      ))}
    </div>
  );
}

function PersonCard({ title, sign, glyph, element, lifePath, lpKeyword, destiny, destKeyword, soul, soulKeyword, lang }:
  { title: string; sign: string; glyph: string; element: string; lifePath: number; lpKeyword: string; destiny: number; destKeyword: string; soul: number; soulKeyword: string; lang: string }) {
  const lpLabel   = lang === "ru" ? "Жизненный путь" : lang === "en" ? "Life Path"   : "Шлях";
  const destLabel = lang === "ru" ? "Судьба"          : lang === "en" ? "Destiny"     : "Доля";
  const soulLabel = lang === "ru" ? "Душа"            : lang === "en" ? "Soul"        : "Душа";
  return (
    <div className="flex-1 bg-[#F9F5EE] rounded-2xl p-5 border border-[rgba(196,169,122,0.2)]">
      <p className="text-[10px] text-[#C4A97A] tracking-widest uppercase mb-3">{title}</p>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#E8C98A] to-[#C4A97A] flex items-center justify-center text-xl">
          {glyph}
        </div>
        <div>
          <p className="font-medium text-[#1C1512]" style={{ fontFamily: "var(--font-cormorant)", fontSize: "1.2rem" }}>{sign}</p>
          <p className="text-xs text-[#9A8A78]">{element}</p>
        </div>
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-[#9A8A78] text-xs">{lpLabel}</span>
          <span className="text-[#B8883A] font-medium">{lifePath} · {lpKeyword}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[#9A8A78] text-xs">{destLabel}</span>
          <span className="text-[#B8883A] font-medium">{destiny} · {destKeyword}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[#9A8A78] text-xs">{soulLabel}</span>
          <span className="text-[#B8883A] font-medium">{soul} · {soulKeyword}</span>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
interface PersonForm { name: string; day: string; month: string; year: string; hour: string; minute: string; }

// PersonFields — defined OUTSIDE the page component so React doesn't remount it on every state change.
// Inline-defined components lose input focus after each keystroke; this fixes that.
function PersonFields({
  person, setPerson, title, useExactTime, language,
}: {
  person: PersonForm;
  setPerson: (p: PersonForm) => void;
  title: string;
  useExactTime: boolean;
  language: string;
}) {
  const t = (uk: string, ru: string, en: string) => language === "ru" ? ru : language === "en" ? en : uk;
  return (
    <div className="space-y-4">
      <p className="text-xs text-[#C4A97A] tracking-widest uppercase">{title}</p>
      <div>
        <label className="block text-xs text-[#7A6A58] mb-2 tracking-wide">
          {t("Повне ім'я", "Полное имя", "Full name")}
          <span className="text-[10px] text-[#C4A97A] italic font-normal">
            {t(" · ПІБ повністю для числа долі і душі"," · ФИО полностью для числа судьбы и души"," · full name for destiny and soul")}
          </span>
        </label>
        <input
          type="text"
          required
          placeholder={t("Ім'я По-батькові Прізвище", "Имя Отчество Фамилия", "First Middle Last")}
          value={person.name}
          onChange={e => setPerson({ ...person, name: e.target.value })}
          className="input-luxury"
        />
      </div>
      <div className="grid grid-cols-3 gap-3 sm:gap-4 items-start">
        {[
          { key:"day",   label: t("День","День","Day"),     ph:"14",   maxLen:2 },
          { key:"month", label: t("Місяць","Месяц","Month"), ph:"3",    maxLen:2 },
          { key:"year",  label: t("Рік","Год","Year"),       ph:"1990", maxLen:4 },
        ].map(f => (
          <div key={f.key} className="flex flex-col">
            <label className="block text-xs text-[#7A6A58] mb-2 tracking-wide min-h-[1.25rem]">{f.label}</label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={f.maxLen}
              required
              placeholder={f.ph}
              value={person[f.key as keyof PersonForm]}
              onChange={e => setPerson({ ...person, [f.key]: e.target.value.replace(/[^0-9]/g, "") })}
              className="input-luxury"
            />
          </div>
        ))}
      </div>
      {useExactTime && (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 items-start">
          <div className="flex flex-col">
            <label className="block text-xs text-[#7A6A58] mb-2 tracking-wide">{t("Години","Часы","Hour")}</label>
            <input
              type="text" inputMode="numeric" pattern="[0-9]*" maxLength={2}
              placeholder="14"
              value={person.hour}
              onChange={e => setPerson({ ...person, hour: e.target.value.replace(/[^0-9]/g, "") })}
              className="input-luxury"
            />
          </div>
          <div className="flex flex-col">
            <label className="block text-xs text-[#7A6A58] mb-2 tracking-wide">{t("Хвилини","Минуты","Minutes")}</label>
            <input
              type="text" inputMode="numeric" pattern="[0-9]*" maxLength={2}
              placeholder="30"
              value={person.minute}
              onChange={e => setPerson({ ...person, minute: e.target.value.replace(/[^0-9]/g, "") })}
              className="input-luxury"
            />
          </div>
        </div>
      )}
    </div>
  );
}


// Modality names per language
const MODALITY_NAMES: Record<string, string[]> = {
  uk: ["Кардинальний", "Фіксований", "Мутабельний"],
  ru: ["Кардинальный", "Фиксированный", "Мутабельный"],
  en: ["Cardinal", "Fixed", "Mutable"],
};

interface CompatResult {
  zodiacIdx1: number; zodiacIdx2: number;
  element1: string;  element2: string;
  elemIdx1: number;  elemIdx2: number;
  lifePath1: number; lifePath2: number;
  destiny1: number;  destiny2: number;
  soul1: number;     soul2: number;
  zodiacCompat: { score: number; type: CompatType };
  elemScore: number;
  numScore: number;
  overallScore: number;
  elemLabel: string;
  modalityLabel: string;
  modality1: string;
  modality2: string;
  birthDate1: string;
  birthDate2: string;
  // Birth-time-dependent (optional)
  birthTimeProvided: boolean;
  moonSignIdx1: number | null;
  moonSignIdx2: number | null;
  venusSignIdx1: number;
  venusSignIdx2: number;
  marsSignIdx1: number;
  marsSignIdx2: number;
  // Composite
  compositeSunSignIdx: number;
  compositeMoonSignIdx: number | null;
  // Soul mate / karmic / lo shu
  soulMateAspects: string[];
  karmicMatchText: string;
  loShuPair: string;
}

export default function CompatibilityPage() {
  const { language } = useLanguage();
  const isRu = language === "ru";
  const isEn = language === "en";

  const signs    = isRu ? SIGNS_RU : isEn ? SIGNS_EN : SIGNS_UA;
  const elements = isRu ? ELEMENTS_RU : isEn ? ELEMENTS_EN : ELEMENTS_UA;

  const [p1, setP1] = useState<PersonForm>({ name:"", day:"", month:"", year:"", hour:"", minute:"" });
  const [p2, setP2] = useState<PersonForm>({ name:"", day:"", month:"", year:"", hour:"", minute:"" });
  const [useExactTime, setUseExactTime] = useState(false);
  const tzHours = -new Date().getTimezoneOffset() / 60;
  const [result, setResult] = useState<CompatResult | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [aiError, setAiError] = useState(false);
  const [relType, setRelType] = useState<RelType>("romantic");
  const [showMethod, setShowMethod] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const d1 = parseInt(p1.day), m1 = parseInt(p1.month), y1 = parseInt(p1.year);
    const d2 = parseInt(p2.day), m2 = parseInt(p2.month), y2 = parseInt(p2.year);

    const zi1 = getZodiacIndex(d1, m1);
    const zi2 = getZodiacIndex(d2, m2);
    const el1 = elements[zi1];
    const el2 = elements[zi2];
    const lp1 = calcLifePath(d1, m1, y1);
    const lp2 = calcLifePath(d2, m2, y2);
    const dest1 = calcDestiny(p1.name);
    const dest2 = calcDestiny(p2.name);
    const soul1 = calcSoul(p1.name);
    const soul2 = calcSoul(p2.name);
    const zodiacCompat = getZodiacCompat(zi1, zi2, relType);
    const numScore = getNumCompat(lp1, lp2);
    const elemScore = getElemScore(zi1, zi2);
    const overallScore = Math.round((zodiacCompat.score + numScore + elemScore) / 3);
    const elemLabel = getElemLabel(zi1, zi2, language);
    const modalityLabel = getModalityLabel(zi1, zi2, language);
    const modalityNames = MODALITY_NAMES[language] ?? MODALITY_NAMES.uk;
    const modality1 = modalityNames[getModality(zi1)];
    const modality2 = modalityNames[getModality(zi2)];
    const birthDate1 = `${d1.toString().padStart(2,"0")}.${m1.toString().padStart(2,"0")}.${y1}`;
    const birthDate2 = `${d2.toString().padStart(2,"0")}.${m2.toString().padStart(2,"0")}.${y2}`;

    // ── Planetary positions ────────────────────────────────────────────────
    const h1 = useExactTime ? parseInt(p1.hour || "12") : 12;
    const min1 = useExactTime ? parseInt(p1.minute || "0") : 0;
    const h2 = useExactTime ? parseInt(p2.hour || "12") : 12;
    const min2 = useExactTime ? parseInt(p2.minute || "0") : 0;
    const jd1 = dateToJD(y1, m1, d1, h1, min1, useExactTime ? tzHours : 0);
    const jd2 = dateToJD(y2, m2, d2, h2, min2, useExactTime ? tzHours : 0);

    const sun1Lon  = calcPlanetDeg(0, jd1);
    const sun2Lon  = calcPlanetDeg(0, jd2);
    const moon1Lon = calcPlanetDeg(1, jd1);
    const moon2Lon = calcPlanetDeg(1, jd2);
    const venus1Lon = calcPlanetDeg(3, jd1);
    const venus2Lon = calcPlanetDeg(3, jd2);
    const mars1Lon  = calcPlanetDeg(4, jd1);
    const mars2Lon  = calcPlanetDeg(4, jd2);

    const moonSignIdx1 = useExactTime ? signFromLon(moon1Lon) : null;
    const moonSignIdx2 = useExactTime ? signFromLon(moon2Lon) : null;
    const venusSignIdx1 = signFromLon(venus1Lon);
    const venusSignIdx2 = signFromLon(venus2Lon);
    const marsSignIdx1 = signFromLon(mars1Lon);
    const marsSignIdx2 = signFromLon(mars2Lon);

    // Composite Sun (always available)
    const compositeSunLon = midpointLon(sun1Lon, sun2Lon);
    const compositeSunSignIdx = signFromLon(compositeSunLon);
    const compositeMoonSignIdx = useExactTime ? signFromLon(midpointLon(moon1Lon, moon2Lon)) : null;

    // ── Soul Mate aspects (Linda Goodman + classical) ─────────────────────
    const soulMateAspects: string[] = [];
    const signDiff = Math.abs(zi1 - zi2);
    const signDist = Math.min(signDiff, 12 - signDiff);
    if (zi1 === zi2) soulMateAspects.push(
      language === "ru" ? "Близнецовая душа (один знак)" :
      language === "en" ? "Twin Souls (same sign)" :
      "Близнюкові душі (один знак)"
    );
    if (signDist === 4) soulMateAspects.push(
      language === "ru" ? "Душевный трин (стихия)" :
      language === "en" ? "Soul Trine (same element)" :
      "Душевний трин (стихія)"
    );
    if (signDist === 6) soulMateAspects.push(
      language === "ru" ? "Кармическая полярность" :
      language === "en" ? "Karmic Polarity" :
      "Карматична полярність"
    );
    // Venus trine Venus or sextile — strong love bond
    const venusDiff = Math.abs(venusSignIdx1 - venusSignIdx2);
    const venusDist = Math.min(venusDiff, 12 - venusDiff);
    if (venusDist === 4 || venusDist === 0) soulMateAspects.push(
      language === "ru" ? "Венера в гармонии (любовные ценности)" :
      language === "en" ? "Venus in harmony (love values)" :
      "Венера в гармонії (цінності любові)"
    );
    // Venus-Mars trine — passion match
    const vmDiff1 = Math.abs(venusSignIdx1 - marsSignIdx2);
    const vmDist1 = Math.min(vmDiff1, 12 - vmDiff1);
    const vmDiff2 = Math.abs(venusSignIdx2 - marsSignIdx1);
    const vmDist2 = Math.min(vmDiff2, 12 - vmDiff2);
    if (vmDist1 === 4 || vmDist2 === 4 || vmDist1 === 0 || vmDist2 === 0) soulMateAspects.push(
      language === "ru" ? "Венера-Марс резонанс (страсть)" :
      language === "en" ? "Venus–Mars resonance (passion)" :
      "Венера-Марс резонанс (пристрасть)"
    );
    if (useExactTime && moonSignIdx1 !== null && moonSignIdx2 !== null) {
      const md = Math.abs(moonSignIdx1 - moonSignIdx2);
      const mDist = Math.min(md, 12 - md);
      if (mDist === 0) soulMateAspects.push(
        language === "ru" ? "Луна-Луна соединение (одна эмоциональная волна)" :
        language === "en" ? "Moon–Moon conjunction (one emotional wave)" :
        "Місяць-Місяць з'єднання (одна емоційна хвиля)"
      );
      else if (mDist === 4) soulMateAspects.push(
        language === "ru" ? "Луна-Луна трин (эмоциональная гармония)" :
        language === "en" ? "Moon–Moon trine (emotional harmony)" :
        "Місяць-Місяць трин (емоційна гармонія)"
      );
    }

    // ── Karmic Match (numerology) ─────────────────────────────────────────
    const karmicParts: string[] = [];
    if (soul1 === soul2) karmicParts.push(
      language === "ru" ? `одинаковые Числа Души (${soul1})` :
      language === "en" ? `same Soul Number (${soul1})` :
      `однакові Числа Душі (${soul1})`
    );
    if (lp1 === lp2) karmicParts.push(
      language === "ru" ? `один Жизненный путь (${lp1})` :
      language === "en" ? `same Life Path (${lp1})` :
      `один Життєвий шлях (${lp1})`
    );
    const dSum = dest1 + dest2;
    if (dSum === 11 || dSum === 22 || dSum === 33) karmicParts.push(
      language === "ru" ? `сумма Судеб = мастер-число ${dSum}` :
      language === "en" ? `Destiny sum = master number ${dSum}` :
      `сума Доль = майстер-число ${dSum}`
    );
    const karmicMatchText = karmicParts.length > 0 ? karmicParts.join("; ") : (
      language === "ru" ? "без прямых нумерологических связей — отношения строятся через дополнение" :
      language === "en" ? "no direct numerological links — connection built through complement" :
      "без прямих нумерологічних зв'язків — стосунки будуються через доповнення"
    );

    // ── Lo Shu pair square (simplified) ───────────────────────────────────
    const getDigits = (date: string): Set<number> => {
      const s = new Set<number>();
      date.split("").forEach(c => { if (/[1-9]/.test(c)) s.add(parseInt(c)); });
      return s;
    };
    const digits1 = getDigits(birthDate1);
    const digits2 = getDigits(birthDate2);
    const combined = new Set([...digits1, ...digits2]);
    const missing: number[] = [];
    for (let i = 1; i <= 9; i++) if (!combined.has(i)) missing.push(i);
    const loShuPair = missing.length === 0
      ? (language === "ru" ? "Полный квадрат пары — баланс всех 9 энергий" :
         language === "en" ? "Complete couple square — all 9 energies balanced" :
         "Повний квадрат пари — баланс усіх 9 енергій")
      : (language === "ru" ? `Отсутствуют энергии ${missing.join(", ")} — совместная зона роста` :
         language === "en" ? `Missing energies ${missing.join(", ")} — joint growth zone` :
         `Відсутні енергії ${missing.join(", ")} — спільна зона зростання`);

    setResult({
      zodiacIdx1:zi1, zodiacIdx2:zi2,
      element1:el1, element2:el2,
      elemIdx1:getElemIdx(zi1), elemIdx2:getElemIdx(zi2),
      lifePath1:lp1, lifePath2:lp2,
      destiny1:dest1, destiny2:dest2,
      soul1, soul2,
      zodiacCompat, elemScore, numScore, overallScore,
      elemLabel, modalityLabel,
      modality1, modality2,
      birthDate1, birthDate2,
      birthTimeProvided: useExactTime,
      moonSignIdx1, moonSignIdx2,
      venusSignIdx1, venusSignIdx2,
      marsSignIdx1, marsSignIdx2,
      compositeSunSignIdx, compositeMoonSignIdx,
      soulMateAspects, karmicMatchText, loShuPair,
    });
    setAnalysis(null);
    setAiError(false);
  };

  const handleAi = async () => {
    if (!result) return;
    setLoadingAi(true);
    setAiError(false);
    try {
      const lpKw = LP_KEYWORDS[language] ?? LP_KEYWORDS.uk;
      const dKw  = DEST_KEYWORDS[language] ?? DEST_KEYWORDS.uk;
      const soulKw = SOUL_KEYWORDS[language] ?? SOUL_KEYWORDS.uk;
      const aspectLabels = COMPAT_LABELS[language] ?? COMPAT_LABELS.uk;
      const res = await fetch("/api/compatibility-reading", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language,
          name1: p1.name.split(" ")[0], sign1: signs[result.zodiacIdx1], element1: result.element1,
          modality1: result.modality1, birthDate1: result.birthDate1,
          lifePath1: result.lifePath1,  lpKeyword1:  lpKw[result.lifePath1]  ?? "",
          destiny1:  result.destiny1,   destKeyword1: dKw[result.destiny1]   ?? "",
          soul1: result.soul1, soulKeyword1: soulKw[result.soul1] ?? "",
          moonSign1: result.moonSignIdx1 !== null ? signs[result.moonSignIdx1] : undefined,
          venusSign1: signs[result.venusSignIdx1],
          marsSign1: signs[result.marsSignIdx1],
          name2: p2.name.split(" ")[0], sign2: signs[result.zodiacIdx2], element2: result.element2,
          modality2: result.modality2, birthDate2: result.birthDate2,
          lifePath2: result.lifePath2,  lpKeyword2:  lpKw[result.lifePath2]  ?? "",
          destiny2:  result.destiny2,   destKeyword2: dKw[result.destiny2]   ?? "",
          soul2: result.soul2, soulKeyword2: soulKw[result.soul2] ?? "",
          moonSign2: result.moonSignIdx2 !== null ? signs[result.moonSignIdx2] : undefined,
          venusSign2: signs[result.venusSignIdx2],
          marsSign2: signs[result.marsSignIdx2],
          zodiacAspect: aspectLabels[result.zodiacCompat.type],
          zodiacScore:  result.zodiacCompat.score,
          elemInteraction: result.elemLabel,
          modalityInteraction: result.modalityLabel,
          relType: relType,
          birthTimeProvided: result.birthTimeProvided,
          compositeSunSign: signs[result.compositeSunSignIdx],
          compositeMoonSign: result.compositeMoonSignIdx !== null ? signs[result.compositeMoonSignIdx] : undefined,
          soulMateAspects: result.soulMateAspects,
          karmicMatch: result.karmicMatchText,
          loShuPair: result.loShuPair,
        }),
      });
      const d = await res.json();
      if (d.analysis) setAnalysis(d.analysis);
      else setAiError(true);
    } catch {
      setAiError(true);
    } finally {
      setLoadingAi(false);
    }
  };

  const scoreLabel = (s: number) => {
    const map: Record<string, string[]> = {
      uk: ["","Складно","Виклик","Нейтрально","Добре","Відмінно"],
      ru: ["","Сложно","Вызов","Нейтрально","Хорошо","Отлично"],
      en: ["","Difficult","Challenge","Neutral","Good","Excellent"],
    };
    return (map[language] ?? map.uk)[s] ?? "";
  };

  const t = (uk: string, ru: string, en: string) => isRu ? ru : isEn ? en : uk;


  return (
    <>
      <section className="pt-36 pb-16 bg-[#FDFBF7] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(196,169,122,0.1),transparent)]" />
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <AnimatedSection>
            <span className="tag mb-6 inline-block">
              {t("Астрологія · Нумерологія", "Астрология · Нумерология", "Astrology · Numerology")}
            </span>
            <h1 className="text-[clamp(2.5rem,5vw,4.5rem)] text-[#1C1512] mb-6 leading-[1.06]"
              style={{ fontFamily: "var(--font-cormorant)", fontWeight: 400 }}>
              {t("Карта сумісності", "Карта совместимости", "Compatibility Map")}
            </h1>
            <p className="text-xl text-[#7A6A58] leading-relaxed">
              {t(
                "Знаки зодіаку та числа долі двох людей — повний аналіз сумісності пари.",
                "Знаки зодиака и числа судьбы двух людей — полный анализ совместимости пары.",
                "Zodiac signs and destiny numbers of two people — a full couple compatibility analysis."
              )}
            </p>
          </AnimatedSection>
        </div>
      </section>

      <GoldDivider />

      <section className="section-padding bg-[#FDFBF7]">
        <div className="max-w-2xl mx-auto px-6">
          <AnimatedSection>
            <div className="card-luxury mb-8">
              {/* Relationship type tabs */}
              <div className="flex gap-6 justify-center mb-6">
                {([
                  { key:"romantic" as const, label: t("❤ Романтика","❤ Романтика","❤ Romance") },
                  { key:"friendship" as const, label: t("✦ Дружба","✦ Дружба","✦ Friendship") },
                  { key:"business" as const, label: t("◆ Бізнес","◆ Бизнес","◆ Business") },
                ]).map(rt => (
                  <button
                    key={rt.key}
                    type="button"
                    onClick={() => setRelType(rt.key)}
                    className={`text-xs pb-1 transition-colors ${relType === rt.key ? "text-[#D4A853] border-b-2 border-[#D4A853]" : "text-[#9A8A78]"}`}
                  >
                    {rt.label}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Birth-time toggle */}
                <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[rgba(196,169,122,0.06)] border border-[rgba(196,169,122,0.15)]">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[#5C4530] tracking-wide font-medium">
                      {t("Вказати час народження","Указать время рождения","Specify birth time")}
                    </p>
                    <p className="text-[10px] text-[#9A8A78] italic mt-0.5">
                      {t(
                        "Не всі знають точний час — це нормально. З часом аналіз точніший: рахуються знаки Місяця, повний композит, Луна-Луна аспекти.",
                        "Не все знают точное время — это нормально. Со временем анализ точнее: рассчитываются знаки Луны, полный композит, Луна-Луна аспекты.",
                        "Not everyone knows exact time — that's fine. With time the analysis is deeper: Moon signs, full composite, Moon–Moon aspects."
                      )}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setUseExactTime(v => !v)}
                    className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${useExactTime ? "bg-[#B8883A]" : "bg-[rgba(196,169,122,0.3)]"}`}
                    aria-pressed={useExactTime}
                    aria-label={t("Час народження","Время рождения","Birth time")}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${useExactTime ? "translate-x-5" : ""}`} />
                  </button>
                </div>

                <PersonFields person={p1} setPerson={setP1}
                  title={t("Перша людина","Первый человек","First person")}
                  useExactTime={useExactTime} language={language} />

                <div className="flex items-center gap-4">
                  <div className="flex-1 h-px bg-[rgba(196,169,122,0.2)]" />
                  <Heart size={18} className="text-[#D4A853]" />
                  <div className="flex-1 h-px bg-[rgba(196,169,122,0.2)]" />
                </div>

                <PersonFields person={p2} setPerson={setP2}
                  title={t("Друга людина","Второй человек","Second person")}
                  useExactTime={useExactTime} language={language} />

                <button type="submit" className="btn-primary w-full">
                  {t("Перевірити сумісність","Проверить совместимость","Check Compatibility")}
                </button>
              </form>
            </div>
          </AnimatedSection>

          {result && (
            <AnimatedSection delay={0.1}>
              <div className="space-y-6">

                {/* Person cards */}
                <div className="flex flex-col sm:flex-row gap-4 items-stretch">
                  <PersonCard
                    title={p1.name.split(" ")[0]}
                    sign={signs[result.zodiacIdx1]}
                    glyph={SIGN_GLYPHS[result.zodiacIdx1]}
                    element={result.element1}
                    lifePath={result.lifePath1}
                    lpKeyword={(LP_KEYWORDS[language] ?? LP_KEYWORDS.uk)[result.lifePath1] ?? ""}
                    destiny={result.destiny1}
                    destKeyword={(DEST_KEYWORDS[language] ?? DEST_KEYWORDS.uk)[result.destiny1] ?? ""}
                    soul={result.soul1}
                    soulKeyword={(SOUL_KEYWORDS[language] ?? SOUL_KEYWORDS.uk)[result.soul1] ?? ""}
                    lang={language}
                  />
                  <div className="flex items-center justify-center py-2 sm:py-0">
                    <Heart size={20} className="text-[#D4A853]" />
                  </div>
                  <PersonCard
                    title={p2.name.split(" ")[0]}
                    sign={signs[result.zodiacIdx2]}
                    glyph={SIGN_GLYPHS[result.zodiacIdx2]}
                    element={result.element2}
                    lifePath={result.lifePath2}
                    lpKeyword={(LP_KEYWORDS[language] ?? LP_KEYWORDS.uk)[result.lifePath2] ?? ""}
                    destiny={result.destiny2}
                    destKeyword={(DEST_KEYWORDS[language] ?? DEST_KEYWORDS.uk)[result.destiny2] ?? ""}
                    soul={result.soul2}
                    soulKeyword={(SOUL_KEYWORDS[language] ?? SOUL_KEYWORDS.uk)[result.soul2] ?? ""}
                    lang={language}
                  />
                </div>

                {/* Scores */}
                <div className="card-luxury space-y-5">
                  {/* Overall */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-[#7A6A58]">
                        {t("Загальна сумісність","Общая совместимость","Overall compatibility")}
                      </p>
                      <span className="text-[#B8883A] font-medium text-sm">{scoreLabel(result.overallScore)}</span>
                    </div>
                    <ScoreBar score={result.overallScore} />
                  </div>

                  <div className="h-px bg-[rgba(196,169,122,0.15)]" />

                  {/* Zodiac */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-xs text-[#C4A97A] tracking-widest uppercase mb-0.5">
                          {t("Астрологія","Астрология","Astrology")}
                        </p>
                        <p className="text-base text-[#1C1512]" style={{ fontFamily:"var(--font-cormorant)", fontWeight:500 }}>
                          {(COMPAT_LABELS[language] ?? COMPAT_LABELS.uk)[result.zodiacCompat.type]}
                        </p>
                      </div>
                      <div className="flex gap-3 items-center text-xs text-[#9A8A78]">
                        <span>{result.element1}</span>
                        <span>·</span>
                        <span>{result.element2}</span>
                      </div>
                    </div>
                    <ScoreBar score={result.zodiacCompat.score} />
                    <p className="text-xs text-[#9A8A78] mt-2 italic" style={{fontFamily:"var(--font-cormorant)"}}>
                      {result.elemLabel} · {result.modalityLabel}
                    </p>
                  </div>

                  <div className="h-px bg-[rgba(196,169,122,0.15)]" />

                  {/* Elements */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-xs text-[#C4A97A] tracking-widest uppercase mb-0.5">
                          {t("Стихії","Стихии","Elements")}
                        </p>
                      </div>
                      <span className="text-xs text-[#9A8A78]">{scoreLabel(result.elemScore)}</span>
                    </div>
                    <ScoreBar score={result.elemScore} />
                  </div>

                  <div className="h-px bg-[rgba(196,169,122,0.15)]" />

                  {/* Numerology */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-xs text-[#C4A97A] tracking-widests uppercase mb-0.5">
                          {t("Нумерологія","Нумерология","Numerology")}
                        </p>
                        <p className="text-base text-[#1C1512]" style={{ fontFamily:"var(--font-cormorant)", fontWeight:500 }}>
                          {t(
                            `Шляхи ${result.lifePath1} і ${result.lifePath2}`,
                            `Пути ${result.lifePath1} и ${result.lifePath2}`,
                            `Paths ${result.lifePath1} & ${result.lifePath2}`
                          )}
                        </p>
                      </div>
                      <span className="text-xs text-[#9A8A78]">{scoreLabel(result.numScore)}</span>
                    </div>
                    <ScoreBar score={result.numScore} />
                  </div>
                </div>

                {/* Venus / Mars / Moon row */}
                <div className="card-luxury space-y-4">
                  <p className="text-xs text-[#C4A97A] tracking-widest uppercase">
                    {t("Глибинні планети","Глубинные планеты","Deep planets")}
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                    {result.birthTimeProvided && result.moonSignIdx1 !== null && result.moonSignIdx2 !== null && (
                      <div className="col-span-2 sm:col-span-3 p-3 rounded-xl bg-[rgba(196,169,122,0.06)] border border-[rgba(196,169,122,0.12)]">
                        <p className="text-[10px] text-[#C4A97A] tracking-widest uppercase mb-1">
                          ☽ {t("Місяці · емоції","Луны · эмоции","Moons · emotion")}
                        </p>
                        <p className="text-[#5C4530]">
                          {p1.name.split(" ")[0]}: <strong>{SIGN_GLYPHS[result.moonSignIdx1]} {signs[result.moonSignIdx1]}</strong>
                          <span className="mx-2 text-[#C4A97A]">·</span>
                          {p2.name.split(" ")[0]}: <strong>{SIGN_GLYPHS[result.moonSignIdx2]} {signs[result.moonSignIdx2]}</strong>
                        </p>
                      </div>
                    )}
                    <div className="p-3 rounded-xl bg-[rgba(196,169,122,0.06)] border border-[rgba(196,169,122,0.12)]">
                      <p className="text-[10px] text-[#C4A97A] tracking-widest uppercase mb-1">
                        ♀ {t("Венери · любить як","Венеры · любит как","Venus · loves as")}
                      </p>
                      <p className="text-[#5C4530] text-xs">
                        {p1.name.split(" ")[0]}: <strong>{signs[result.venusSignIdx1]}</strong><br/>
                        {p2.name.split(" ")[0]}: <strong>{signs[result.venusSignIdx2]}</strong>
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-[rgba(196,169,122,0.06)] border border-[rgba(196,169,122,0.12)]">
                      <p className="text-[10px] text-[#C4A97A] tracking-widest uppercase mb-1">
                        ♂ {t("Марси · діє як","Марсы · действует как","Mars · acts as")}
                      </p>
                      <p className="text-[#5C4530] text-xs">
                        {p1.name.split(" ")[0]}: <strong>{signs[result.marsSignIdx1]}</strong><br/>
                        {p2.name.split(" ")[0]}: <strong>{signs[result.marsSignIdx2]}</strong>
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-[rgba(28,21,18,0.05)] border border-[rgba(28,21,18,0.15)]">
                      <p className="text-[10px] text-[#7A6A58] tracking-widest uppercase mb-1">
                        ⊕ {t("Композит · карта пари","Композит · карта пары","Composite · pair chart")}
                      </p>
                      <p className="text-[#1C1512] text-xs">
                        ☉ <strong>{signs[result.compositeSunSignIdx]}</strong>
                        {result.compositeMoonSignIdx !== null && (
                          <><br/>☽ <strong>{signs[result.compositeMoonSignIdx]}</strong></>
                        )}
                      </p>
                    </div>
                  </div>
                  {!result.birthTimeProvided && (
                    <p className="text-[10px] text-[#C4A97A] italic">
                      {t(
                        "Знаки Місяця і композит-Місяць доступні лише з часом народження.",
                        "Знаки Луны и композит-Луна доступны только со временем рождения.",
                        "Moon signs and composite Moon require birth time."
                      )}
                    </p>
                  )}
                </div>

                {/* Soul Mate aspects + Karmic match + Lo Shu */}
                <div className="card-luxury space-y-4">
                  {result.soulMateAspects.length > 0 && (
                    <div>
                      <p className="text-xs text-[#C4A97A] tracking-widest uppercase mb-2">
                        ✦ {t("Soul Mate аспекти","Soul Mate аспекты","Soul Mate aspects")}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {result.soulMateAspects.map((a, i) => (
                          <span key={i} className="px-3 py-1 rounded-full text-xs bg-[rgba(212,168,83,0.12)] text-[#B8883A] border border-[rgba(212,168,83,0.3)]">
                            {a}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-[#C4A97A] tracking-widest uppercase mb-2">
                      ♾ {t("Карматичний матч","Кармический матч","Karmic match")}
                    </p>
                    <p className="text-sm text-[#5C4530] leading-relaxed">{result.karmicMatchText}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#C4A97A] tracking-widest uppercase mb-2">
                      ▦ {t("Ло Шу · квадрат пари","Ло Шу · квадрат пары","Lo Shu · couple square")}
                    </p>
                    <p className="text-sm text-[#5C4530] leading-relaxed">{result.loShuPair}</p>
                  </div>
                </div>

                {/* AI analysis */}
                <div className="card-luxury border-[rgba(212,168,83,0.3)]">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#D4A853] to-[#9A6E28] flex items-center justify-center">
                      <Sparkles size={16} className="text-white" />
                    </div>
                    <div>
                      <p className="text-[10px] text-[#C4A97A] tracking-widest uppercase">
                        {t("Аналіз пари","Анализ пары","Couple analysis")}
                      </p>
                      <p className="text-lg text-[#1C1512]" style={{ fontFamily:"var(--font-cormorant)", fontWeight:500 }}>
                        {t("Синтез зірок і чисел","Синтез звёзд и чисел","Stars & Numbers synthesis")}
                      </p>
                    </div>
                  </div>

                  {!analysis && !loadingAi && (
                    <button onClick={handleAi} className="btn-primary w-full">
                      <Sparkles size={15} />
                      {t("Отримати аналіз пари","Получить анализ пары","Get couple analysis")}
                    </button>
                  )}

                  {loadingAi && (
                    <div className="flex items-center justify-center gap-3 py-6 text-[#C4A97A]">
                      <div className="w-4 h-4 border-2 border-[#C4A97A] border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm">{t("Аналізуємо…","Анализируем…","Analysing…")}</span>
                    </div>
                  )}

                  {analysis && (
                    <p className="text-[#5C4530] leading-relaxed"
                      style={{ fontFamily:"var(--font-cormorant)", fontSize:"1.1rem" }}>
                      {analysis}
                    </p>
                  )}

                  {aiError && (
                    <div className="space-y-3">
                      <p className="text-sm text-[#9A8A78]">
                        {t("Не вдалось отримати аналіз. Спробуйте ще раз.","Не удалось получить анализ. Попробуйте снова.","Could not get analysis. Please try again.")}
                      </p>
                      <button onClick={handleAi} className="btn-outline text-sm px-4 py-2">
                        {t("Повторити","Повторить","Retry")}
                      </button>
                    </div>
                  )}
                </div>

                {/* How is this calculated? */}
                <button onClick={() => setShowMethod(!showMethod)} className="flex items-center gap-2 text-sm text-[#9A8A78] hover:text-[#B8883A] transition-colors mx-auto mt-6">
                  <span style={{fontFamily:"var(--font-cormorant)",fontStyle:"italic"}}>
                    {t("Як це розраховується?","Как это рассчитывается?","How is this calculated?")}
                  </span>
                  <span className={`transition-transform duration-200 inline-block ${showMethod?"rotate-180":""}`}>▾</span>
                </button>
                {showMethod && (
                  <div className="mt-4 space-y-3 max-w-xl mx-auto">
                    {[
                      {
                        uk:"Знаки зодіаку · визначаємо за датою народження — Тропічний зодіак (Aries 21.03–19.04 тощо)",
                        ru:"Знаки зодиака · определяем по дате рождения — Тропический зодиак (Aries 21.03–19.04 и т.д.)",
                        en:"Zodiac signs · determined by date of birth — Tropical zodiac (Aries 21.03–19.04 etc.)",
                      },
                      {
                        uk:"Стихії · кожен знак несе природну якість — Вогонь, Земля, Повітря, Вода",
                        ru:"Стихии · каждый знак несёт природное качество — Огонь, Земля, Воздух, Вода",
                        en:"Elements · each sign carries a natural quality — Fire, Earth, Air, Water",
                      },
                      {
                        uk:"Число Шляху · сума дати народження за Піфагором, майстер-числа 11, 22, 33 зберігаються",
                        ru:"Число Пути · сумма даты рождения по Пифагору, мастер-числа 11, 22, 33 сохраняются",
                        en:"Life Path number · sum of date of birth by Pythagoras, master numbers 11, 22, 33 preserved",
                      },
                      {
                        uk:"Число Душі · сума голосних літер повного імені — твоя внутрішня мотивація",
                        ru:"Число Души · сумма гласных букв полного имени — твоя внутренняя мотивация",
                        en:"Soul number · sum of vowels in the full name — your inner motivation",
                      },
                    ].map((item, i) => (
                      <div key={i} className="flex gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#D4A853] mt-2 flex-shrink-0" />
                        <p className="text-xs text-[#9A8A78] leading-relaxed">
                          {isRu ? item.ru : isEn ? item.en : item.uk}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                <p className="text-xs text-[#7A6A58] text-center">
                  {t(
                    "Аналіз базується на Піфагорійській нумерології та класичній астрології.",
                    "Анализ основан на Пифагорейской нумерологии и классической астрологии.",
                    "Analysis based on Pythagorean numerology and classical astrology."
                  )}
                </p>
              </div>
            </AnimatedSection>
          )}
        </div>
      </section>
    </>
  );
}
