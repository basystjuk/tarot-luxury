"use client";

/**
 * Natal-aware blocks that appear on the Moon Guide page when a natal
 * profile is saved (Phase #3) — and the "next Lunar Return" card
 * (Phase #11).
 *
 * Pure presentational helpers — all astrology compute lives upstream.
 */

import { SIGN_GLYPHS, jdToDate, findNextLunarReturn, dateToJD } from "@/lib/astro/calculations";
import type { NatalProfile } from "./_natal";

// ── Aspect detection between two ecliptic longitudes ──────────────────────
//
// Astrology recognises 5 "Ptolemaic" major aspects. For the transit↔natal
// Moon comparison we use slightly wider orbs than for natal-to-natal
// (the Moon moves so fast that "in orb" is ~6h either way).

type AspectKey = "conjunction" | "sextile" | "square" | "trine" | "opposition" | null;

interface AspectInfo {
  key: AspectKey;
  exactDeg: number;   // exact aspect angle (0, 60, 90, 120, 180)
  orb: number;        // signed deviation from exact, degrees
}

function detectAspect(transitLon: number, natalLon: number): AspectInfo {
  let diff = Math.abs(transitLon - natalLon) % 360;
  if (diff > 180) diff = 360 - diff;

  const candidates: { key: NonNullable<AspectKey>; angle: number; orb: number }[] = [
    { key: "conjunction", angle: 0,   orb: 8 },
    { key: "sextile",     angle: 60,  orb: 4 },
    { key: "square",      angle: 90,  orb: 6 },
    { key: "trine",       angle: 120, orb: 6 },
    { key: "opposition",  angle: 180, orb: 8 },
  ];

  for (const c of candidates) {
    const dev = Math.abs(diff - c.angle);
    if (dev <= c.orb) return { key: c.key, exactDeg: c.angle, orb: dev };
  }
  return { key: null, exactDeg: diff, orb: diff };
}

// ── Localised copy ─────────────────────────────────────────────────────────

const ASPECT_LABEL: Record<NonNullable<AspectKey>, { uk: string; ru: string; en: string; glyph: string }> = {
  conjunction: { uk: "З'єднання",  ru: "Соединение",   en: "Conjunction", glyph: "☌" },
  sextile:     { uk: "Секстиль",    ru: "Секстиль",     en: "Sextile",     glyph: "⚹" },
  square:      { uk: "Квадрат",     ru: "Квадрат",      en: "Square",      glyph: "□" },
  trine:       { uk: "Тригон",      ru: "Трин",         en: "Trine",       glyph: "△" },
  opposition:  { uk: "Опозиція",    ru: "Оппозиция",    en: "Opposition",  glyph: "☍" },
};

const ASPECT_HINT: Record<NonNullable<AspectKey>, { uk: string; ru: string; en: string }> = {
  conjunction: {
    uk: "Транзитний і натальний Місяці зливаються — твоя власна емоційна тема в дзеркалі сьогодення. Особистий, насичений день.",
    ru: "Транзитная и натальная Луны сливаются — твоя собственная эмоциональная тема в зеркале сегодняшнего дня. Личный, насыщенный день.",
    en: "The transit and natal Moons merge — your own emotional theme reflected in today. A personal, intense day.",
  },
  sextile: {
    uk: "Легкі емоційні можливості. Світ йде назустріч твоїм почуттям, але треба зробити крок.",
    ru: "Лёгкие эмоциональные возможности. Мир идёт навстречу твоим чувствам, но нужно сделать шаг.",
    en: "Soft emotional openings. The world meets your feelings halfway — but you must take the step.",
  },
  square: {
    uk: "Емоційне напруження. Те, що у тебе всередині, тиснеться у форму, яка не пасує. Сьогодні легше зростати, ніж заспокоюватись.",
    ru: "Эмоциональное напряжение. То, что внутри, давится в форму, которая не подходит. Сегодня легче расти, чем успокоиться.",
    en: "Emotional friction. What's inside is being pressed into a shape that doesn't fit. Today, growth comes easier than calm.",
  },
  trine: {
    uk: "Внутрішній потік. Емоції течуть, тобі легко з самим собою — гарний день для творчості, відпочинку, тонких рішень.",
    ru: "Внутренний поток. Эмоции текут, тебе легко с самим собой — хороший день для творчества, отдыха, тонких решений.",
    en: "Inner flow. Emotions glide, you're at ease with yourself — a good day for creativity, rest, subtle decisions.",
  },
  opposition: {
    uk: "Емоційне дзеркало. Те, що ти не приймаєш у собі, сьогодні зустрінеться у іншому. Не сварися — придивися.",
    ru: "Эмоциональное зеркало. То, что ты не принимаешь в себе, сегодня встретится в другом. Не ссорься — присмотрись.",
    en: "An emotional mirror. What you reject in yourself will meet you in another today. Don't argue — look.",
  },
};

// Element compatibility — used when no major aspect catches.
function signsElementRelation(transitSignIdx: number, natalSignIdx: number, lang: "uk" | "ru" | "en"): string {
  const elements = [0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3]; // 0=fire,1=earth,2=air,3=water
  const eT = elements[transitSignIdx];
  const eN = elements[natalSignIdx];
  // Compatible pairs: fire↔air, earth↔water
  const compatible =
    (eT === 0 && eN === 2) || (eT === 2 && eN === 0) ||
    (eT === 1 && eN === 3) || (eT === 3 && eN === 1);
  // Same element
  if (eT === eN) {
    return lang === "ru"
      ? "Та же стихия, что у твоей натальной Луны — день читается «как ты внутри», знакомо и узнаваемо."
      : lang === "en"
      ? "The same element as your natal Moon — today reads 'like you on the inside,' familiar and easy to recognise."
      : "Та сама стихія, що у твого натального Місяця — день читається «як ти всередині», знайомо і впізнавано.";
  }
  if (compatible) {
    return lang === "ru"
      ? "Совместимая стихия — день шепчет на твоём языке, тебе будет приятно с собой."
      : lang === "en"
      ? "A compatible element — today speaks your language, you'll feel at home with yourself."
      : "Сумісна стихія — день шепоче твоєю мовою, тобі буде приємно із собою.";
  }
  return lang === "ru"
    ? "Несовместимая стихия — день говорит не на твоём языке. Чуть больше усилий, чтобы услышать себя."
    : lang === "en"
    ? "An element your natal Moon doesn't naturally speak — a touch more effort to hear yourself today."
    : "Несумісна стихія — день говорить не твоєю мовою. Трохи більше зусилля, щоб почути себе.";
}

// ── Block 1: Transit ↔ Natal Moon comparison ──────────────────────────────

export function NatalCompareBlock({
  language,
  transitMoonLon,
  transitSignIdx,
  natalProfile,
  signNames,
}: {
  language: string;
  transitMoonLon: number;
  transitSignIdx: number;
  natalProfile: NatalProfile;
  signNames: string[];
}) {
  const lang: "uk" | "ru" | "en" = language === "ru" ? "ru" : language === "en" ? "en" : "uk";
  const natalSignIdx = Math.floor(((natalProfile.natalMoonLon % 360) + 360) % 360 / 30);
  const natalDegInSign = Math.floor(((natalProfile.natalMoonLon % 30) + 30) % 30);
  const aspect = detectAspect(transitMoonLon, natalProfile.natalMoonLon);

  const aspectCopy = aspect.key
    ? `${ASPECT_LABEL[aspect.key].glyph} ${ASPECT_LABEL[aspect.key][lang]}`
    : (lang === "ru" ? "Нет точного аспекта" : lang === "en" ? "No exact aspect" : "Без точного аспекту");
  const aspectHint = aspect.key
    ? ASPECT_HINT[aspect.key][lang]
    : signsElementRelation(transitSignIdx, natalSignIdx, lang);

  return (
    <div className="card-luxury mt-6">
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div>
          <p className="text-[10px] text-[#C4A97A] tracking-widest uppercase">
            {lang === "ru" ? "Твоя личная погода" : lang === "en" ? "Your personal weather" : "Твоя особиста погода"}
          </p>
          <h3 className="text-xl text-[#1C1512]" style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}>
            {lang === "ru" ? "Транзит ↔ натальная Луна" : lang === "en" ? "Transit ↔ natal Moon" : "Транзит ↔ натальний Місяць"}
          </h3>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3 mb-4">
        <div className="p-3 rounded-xl bg-[rgba(196,169,122,0.06)] border border-[rgba(196,169,122,0.18)]">
          <p className="text-[10px] text-[#9A8A78] tracking-widest uppercase mb-1">
            {lang === "ru" ? "🌙 Сегодня" : lang === "en" ? "🌙 Today" : "🌙 Сьогодні"}
          </p>
          <p className="text-base text-[#5C4530]" style={{ fontFamily: "var(--font-cormorant)" }}>
            {SIGN_GLYPHS[transitSignIdx]} {signNames[transitSignIdx]}
          </p>
        </div>
        <div className="p-3 rounded-xl bg-[rgba(196,169,122,0.06)] border border-[rgba(196,169,122,0.18)]">
          <p className="text-[10px] text-[#9A8A78] tracking-widest uppercase mb-1">
            {lang === "ru" ? "★ Твой натал" : lang === "en" ? "★ Your natal" : "★ Твій натал"}
          </p>
          <p className="text-base text-[#5C4530]" style={{ fontFamily: "var(--font-cormorant)" }}>
            {SIGN_GLYPHS[natalSignIdx]} {signNames[natalSignIdx]} <span className="text-[#C4A97A]">{natalDegInSign}°</span>
          </p>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-[rgba(212,168,83,0.10)] border border-[rgba(212,168,83,0.32)]">
        <p className="text-xs text-[#B8883A] tracking-widest uppercase mb-2">
          ✦ {aspectCopy}
          {aspect.key && (
            <span className="ml-2 normal-case text-[#9A8A78] tracking-normal">
              ±{aspect.orb.toFixed(1)}°
            </span>
          )}
        </p>
        <p className="text-sm text-[#5C4530] leading-relaxed">{aspectHint}</p>
      </div>
    </div>
  );
}

// ── Block 2: Next Lunar Return ────────────────────────────────────────────

export function LunarReturnBlock({
  language,
  natalProfile,
  signNames,
}: {
  language: string;
  natalProfile: NatalProfile;
  signNames: string[];
}) {
  const lang: "uk" | "ru" | "en" = language === "ru" ? "ru" : language === "en" ? "en" : "uk";

  // Compute on the fly — cheap (single Newton iteration on the Moon).
  const now = new Date();
  const fromJd = dateToJD(
    now.getFullYear(), now.getMonth() + 1, now.getDate(),
    now.getHours(), now.getMinutes(), -now.getTimezoneOffset() / 60,
  );
  const returnJd = findNextLunarReturn(natalProfile.natalMoonLon, fromJd);
  const returnDate = jdToDate(returnJd);
  const daysAhead = Math.max(0, (returnJd - fromJd));
  const natalSignIdx = Math.floor(((natalProfile.natalMoonLon % 360) + 360) % 360 / 30);

  const tzLocale = lang === "ru" ? "ru-RU" : lang === "en" ? "en-US" : "uk-UA";
  const fullStamp = returnDate.toLocaleString(tzLocale, {
    weekday: "short", day: "numeric", month: "long",
    hour: "2-digit", minute: "2-digit",
  });

  const daysRel = Math.round(daysAhead);
  const inLabel =
    lang === "ru" ? `через ${daysRel} ${daysRel === 1 ? "день" : daysRel < 5 ? "дня" : "дней"}`
    : lang === "en" ? `in ${daysRel} day${daysRel === 1 ? "" : "s"}`
    : `через ${daysRel} ${daysRel === 1 ? "день" : daysRel < 5 ? "дні" : "днів"}`;

  return (
    <div className="card-luxury mt-6">
      <div className="flex items-start gap-3 mb-3">
        <div className="text-3xl flex-shrink-0">🌑</div>
        <div className="flex-1">
          <p className="text-[10px] text-[#C4A97A] tracking-widest uppercase mb-1">
            {lang === "ru" ? "Твой личный лунный новый год"
              : lang === "en" ? "Your personal lunar new month"
              : "Твій особистий місячний новий місяць"}
          </p>
          <h3 className="text-xl text-[#1C1512]" style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}>
            {lang === "ru" ? "Лунное возвращение" : lang === "en" ? "Lunar Return" : "Місячне повернення"}
          </h3>
        </div>
      </div>

      <p className="text-sm text-[#5C4530] leading-relaxed mb-4">
        {lang === "ru"
          ? `Луна вернётся в твою натальную точку ${SIGN_GLYPHS[natalSignIdx]} ${signNames[natalSignIdx]} `
          : lang === "en"
          ? `The Moon returns to your natal point at ${SIGN_GLYPHS[natalSignIdx]} ${signNames[natalSignIdx]} `
          : `Місяць повернеться у твою натальну точку ${SIGN_GLYPHS[natalSignIdx]} ${signNames[natalSignIdx]} `}
        <strong className="text-[#B8883A]">{inLabel}</strong>.{" "}
        {lang === "ru"
          ? "Это начало твоего личного 27-дневного эмоционального цикла."
          : lang === "en"
          ? "That's the start of your personal 27-day emotional cycle."
          : "Це початок твого особистого 27-денного емоційного циклу."}
      </p>

      <div className="p-3 rounded-xl bg-[rgba(196,169,122,0.08)] border border-[rgba(196,169,122,0.22)] text-center">
        <p className="text-[10px] text-[#9A8A78] tracking-widest uppercase mb-1">
          {lang === "ru" ? "Точное время" : lang === "en" ? "Exact moment" : "Точний час"}
        </p>
        <p className="text-base text-[#B8883A]" style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}>
          {fullStamp}
        </p>
      </div>
    </div>
  );
}
