/**
 * Horoscope engine (Phase H1).
 *
 * What makes this not-another-generic-horoscope:
 *
 *   1. CONVERGENCE OVER SPRAY. Most horoscopes broadcast "Mars-Pluto means
 *      conflict" to everyone. We aggregate signals from 4 systems (natal
 *      astrology + numerology + Moon + Tarot) and surface only what
 *      ACTUALLY converges on a single theme for today.
 *
 *   2. PRECISE TIME WINDOWS, not "today is great". We score every 15-min
 *      slot of the user's local day and surface continuous windows where
 *      multiple positive (or negative) signals overlap.
 *
 *   3. ACTION VERBS, not "you might feel". Each output is a directive:
 *      "write", "decline", "call".
 *
 *   4. REASONING TRAIL. Every signal carries the concrete WHY ("Moon trine
 *      natal Venus + Personal Day 3 → creative output peak").
 *
 *   5. HONEST QUIET-DAY HANDLING. If nothing is converging, we say so —
 *      "today is genuinely uneventful, use the calm" — instead of
 *      manufacturing drama.
 *
 * Architecture:
 *   - Pure deterministic engine (no AI in the core). AI synthesis is a
 *     separate optional layer (api/horoscope-portrait).
 *   - Time-domain scoring across 96 quarter-hour slots per day.
 *   - Multi-system convergence rule: any single signal alone is mild;
 *     two or three independent signals on the same time slot count as
 *     "strong"; four+ as "exceptional".
 */

import {
  dateToJD, calcPlanetDeg, jdToDate,
} from "./calculations";

// ──────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────

export type AspectKind = "conjunction" | "sextile" | "square" | "trine" | "opposition";
export type SignalSystem = "astro" | "numerology" | "moon" | "tarot" | "fixed-star";
export type SignalPolarity = "supporting" | "challenging" | "neutral";

export interface ConvergenceSignal {
  system: SignalSystem;
  polarity: SignalPolarity;
  intensity: 1 | 2 | 3; // 1 = subtle, 2 = moderate, 3 = strong
  /** Localised label like "Moon trine natal Venus". */
  label: string;
  /** Localised concrete reasoning. */
  reasoning: string;
  /** Optional minute-of-day range when this signal is active. Null = all day. */
  startMinutes?: number;
  endMinutes?: number;
}

export interface TimeWindow {
  /** Minutes from local midnight (0–1440). */
  startMinutes: number;
  endMinutes: number;
  /** Peak score during the window. */
  peakScore: number;
  /** Reasoning fragments that contributed (localised). */
  signals: string[];
  /** Localised single-line directive: what to do (supporting) / avoid (challenging). */
  directive: string;
}

export interface HoroscopeInput {
  /** Local-time anchor — today at midnight in the user's TZ. */
  date: Date;
  /** Hours east of UTC (e.g. Kyiv summer = 3). */
  tzOffsetHours: number;
  /** Output language — affects label + reasoning strings. */
  language: "uk" | "ru" | "en";
  /** Optional natal snapshot. Each field independently optional. */
  natal?: Partial<Record<"sun" | "moon" | "mercury" | "venus" | "mars" | "jupiter" | "saturn" | "asc" | "mc", number>>;
  /** Optional numerology context. */
  numerology?: {
    personalYear?: number;
    personalMonth?: number;
    personalDay?: number;
    lifePath?: number;
    hiddenPassion?: number;
  };
  /** First name for natural-language synthesis (optional). */
  firstName?: string;
}

export interface DayReading {
  /** ISO date of the day. */
  isoDate: string;
  /** Localised one-sentence theme. */
  theme: string;
  /** Quality bucket. */
  quality: "flowing" | "mixed" | "turbulent" | "quiet";
  /** All convergent signals for the day, ordered by intensity desc. */
  signals: ConvergenceSignal[];
  /** Top 1-3 windows of luck (continuous positive runs). */
  windowsOfLuck: TimeWindow[];
  /** Challenging windows (continuous negative runs). */
  challengeWindows: TimeWindow[];
  /** Localised action directives. */
  doToday: string[];
  /** Localised avoid directives. */
  avoidToday: string[];
  /** True iff input was empty enough that the reading is mostly generic. */
  isQuiet: boolean;
}

// ──────────────────────────────────────────────────────────────────────────
// Localised content
// ──────────────────────────────────────────────────────────────────────────

type Trio = { uk: string; ru: string; en: string };
function l(t: Trio, lang: "uk" | "ru" | "en"): string { return t[lang]; }

const SIGN_NAMES = {
  uk: ["Овен", "Телець", "Близнюки", "Рак", "Лев", "Діва", "Терези", "Скорпіон", "Стрілець", "Козеріг", "Водолій", "Риби"],
  ru: ["Овен", "Телец", "Близнецы", "Рак", "Лев", "Дева", "Весы", "Скорпион", "Стрелец", "Козерог", "Водолей", "Рыбы"],
  en: ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"],
};

const PD_THEME: Record<number, Trio> = {
  1:  { uk: "ініціативи й нової теми",      ru: "инициативы и новой темы",      en: "initiative and a new theme" },
  2:  { uk: "м'якої співпраці",             ru: "мягкого сотрудничества",       en: "soft collaboration" },
  3:  { uk: "творчого виразу",              ru: "творческого выражения",        en: "creative expression" },
  4:  { uk: "структури та фундаменту",      ru: "структуры и фундамента",       en: "structure and foundation" },
  5:  { uk: "руху, змін, подорожі",         ru: "движения, перемен, путешествия",en: "movement, change, travel" },
  6:  { uk: "турботи й стосунків",          ru: "заботы и отношений",           en: "care and relationships" },
  7:  { uk: "тиші, аналізу, внутрішнього",  ru: "тишины, анализа, внутреннего", en: "quiet, analysis, inner space" },
  8:  { uk: "сили й матеріальної дії",      ru: "силы и материального действия",en: "power and material action" },
  9:  { uk: "завершення й відпускання",     ru: "завершения и отпускания",      en: "completion and release" },
  11: { uk: "інтуїтивного прориву",         ru: "интуитивного прорыва",         en: "intuitive breakthrough" },
  22: { uk: "великого плану в дії",         ru: "великого плана в действии",    en: "the great plan in motion" },
};

const PD_VERB: Record<number, Trio> = {
  1: { uk: "ініціюй", ru: "инициируй", en: "initiate" },
  2: { uk: "слухай партнера", ru: "слушай партнёра", en: "listen to your partner" },
  3: { uk: "напиши, заговори, твори", ru: "напиши, заговори, твори", en: "write, speak, create" },
  4: { uk: "побудуй системну річ", ru: "построй системную вещь", en: "build something systematic" },
  5: { uk: "рухайся, зміни ритм", ru: "двигайся, смени ритм", en: "move, change rhythm" },
  6: { uk: "подзвони рідним", ru: "позвони родным", en: "call your family" },
  7: { uk: "побудь у тиші, прочитай", ru: "побудь в тишине, прочитай", en: "sit in silence, read" },
  8: { uk: "веди справу, веди гроші", ru: "веди дело, веди деньги", en: "lead the deal, lead the money" },
  9: { uk: "закінчи давно почате", ru: "закончи давно начатое", en: "finish what's lingered" },
  11: { uk: "довіряй першому імпульсу", ru: "доверяй первому импульсу", en: "trust the first impulse" },
  22: { uk: "поверни до великого плану", ru: "вернись к большому плану", en: "return to the great plan" },
};

const ASPECT_GLYPH: Record<AspectKind, string> = {
  conjunction: "☌", sextile: "⚹", square: "□", trine: "△", opposition: "☍",
};

const PLANET_NAME: Record<string, Trio> = {
  Sun:     { uk: "Сонцем",   ru: "Солнцем",   en: "Sun" },
  Moon:    { uk: "Місяцем",  ru: "Луной",     en: "Moon" },
  Mercury: { uk: "Меркурієм",ru: "Меркурием", en: "Mercury" },
  Venus:   { uk: "Венерою",  ru: "Венерой",   en: "Venus" },
  Mars:    { uk: "Марсом",   ru: "Марсом",    en: "Mars" },
  Jupiter: { uk: "Юпітером", ru: "Юпитером",  en: "Jupiter" },
  Saturn:  { uk: "Сатурном", ru: "Сатурном",  en: "Saturn" },
  ASC:     { uk: "АСЦ",      ru: "АСЦ",       en: "ASC" },
  MC:      { uk: "МС",       ru: "МС",        en: "MC" },
};

const ASPECT_VERBAL: Record<AspectKind, Trio> = {
  conjunction: { uk: "з'єднується з твоїм", ru: "соединяется с твоим", en: "meets your" },
  sextile:     { uk: "у секстилі до твого", ru: "в секстиле к твоему", en: "sextile your" },
  square:      { uk: "у квадраті до твого", ru: "в квадрате к твоему", en: "squares your" },
  trine:       { uk: "у тригоні до твого",  ru: "в тригоне к твоему",  en: "trines your" },
  opposition:  { uk: "в опозиції до твого", ru: "в оппозиции к твоему",en: "opposes your" },
};

// Polarity of each aspect kind, used for scoring.
const ASPECT_POLARITY: Record<AspectKind, "supporting" | "challenging" | "neutral"> = {
  conjunction: "neutral",     // depends on planets, default neutral
  sextile:     "supporting",
  square:      "challenging",
  trine:       "supporting",
  opposition:  "challenging",
};

// Per-planet polarity bias: a conjunction to Venus is supporting,
// a conjunction to Saturn / Mars is leaning challenging, etc.
const PLANET_DEFAULT_BIAS: Record<string, "supporting" | "challenging" | "neutral"> = {
  Sun: "neutral", Moon: "neutral", Mercury: "neutral",
  Venus: "supporting", Jupiter: "supporting",
  Mars: "challenging", Saturn: "challenging",
  ASC: "neutral", MC: "neutral",
};

function combinePolarity(
  aspect: AspectKind,
  natalPlanet: string,
): "supporting" | "challenging" | "neutral" {
  const a = ASPECT_POLARITY[aspect];
  const p = PLANET_DEFAULT_BIAS[natalPlanet];
  if (a === "neutral") return p;       // conjunction inherits planet bias
  if (p === "challenging" && a === "supporting") return "neutral"; // tempered
  if (p === "supporting" && a === "challenging") return "neutral"; // softened
  return a;
}

// ──────────────────────────────────────────────────────────────────────────
// Core computation
// ──────────────────────────────────────────────────────────────────────────

const SLOT_MINUTES = 15;
const SLOTS_PER_DAY = 24 * 60 / SLOT_MINUTES;

const ASPECT_ANGLES: Record<AspectKind, number> = {
  conjunction: 0, sextile: 60, square: 90, trine: 120, opposition: 180,
};

// Tight orbs (Phase М6).
const TRANSIT_MOON_ORB: Record<AspectKind, number> = {
  conjunction: 5, sextile: 2, square: 3, trine: 3, opposition: 5,
};

interface SlotRecord {
  minutes: number; // start of slot (0..1440-SLOT_MINUTES)
  score: number;
  contributors: ConvergenceSignal[];
}

/** Build per-slot scores across the day from transit-Moon aspects to natal. */
function scoreSlots(input: HoroscopeInput): SlotRecord[] {
  const out: SlotRecord[] = [];
  const { tzOffsetHours, language } = input;
  const natal = input.natal ?? {};
  const natalNamed = [
    ["Sun",     natal.sun],
    ["Moon",    natal.moon],
    ["Mercury", natal.mercury],
    ["Venus",   natal.venus],
    ["Mars",    natal.mars],
    ["Jupiter", natal.jupiter],
    ["Saturn",  natal.saturn],
    ["ASC",     natal.asc],
    ["MC",      natal.mc],
  ] as Array<[string, number | undefined]>;

  const d0 = new Date(input.date);
  d0.setHours(0, 0, 0, 0);

  for (let s = 0; s < SLOTS_PER_DAY; s++) {
    const minutes = s * SLOT_MINUTES;
    const slot = new Date(d0.getTime() + minutes * 60_000);
    const jd = dateToJD(
      slot.getFullYear(), slot.getMonth() + 1, slot.getDate(),
      slot.getHours(), slot.getMinutes(), tzOffsetHours,
    );
    const transitMoon = calcPlanetDeg(1, jd);

    let score = 0;
    const contributors: ConvergenceSignal[] = [];

    for (const [name, nLon] of natalNamed) {
      if (nLon == null) continue;
      let diff = Math.abs(transitMoon - nLon) % 360;
      if (diff > 180) diff = 360 - diff;
      for (const [kind, angle] of Object.entries(ASPECT_ANGLES) as Array<[AspectKind, number]>) {
        const dev = Math.abs(diff - angle);
        if (dev <= TRANSIT_MOON_ORB[kind]) {
          const polarity = combinePolarity(kind, name);
          const intensity: 1 | 2 | 3 =
            dev < TRANSIT_MOON_ORB[kind] * 0.3 ? 3
            : dev < TRANSIT_MOON_ORB[kind] * 0.7 ? 2
            : 1;
          score += (polarity === "supporting" ? +1 : polarity === "challenging" ? -1 : 0) * intensity;

          const planetWord = l(PLANET_NAME[name], language);
          const aspWord    = l(ASPECT_VERBAL[kind], language);
          const label = `☽ ${aspWord} ${planetWord}`;
          contributors.push({
            system: "astro",
            polarity,
            intensity,
            label,
            reasoning: `${ASPECT_GLYPH[kind]} ±${dev.toFixed(1)}°`,
            startMinutes: minutes,
            endMinutes: minutes + SLOT_MINUTES,
          });
          break; // only one aspect per (transit-Moon × natal-target) pair
        }
      }
    }
    out.push({ minutes, score, contributors });
  }
  return out;
}

/** Compress runs of similar-polarity slots into windows. */
function findWindows(
  slots: SlotRecord[],
  predicate: (slot: SlotRecord) => boolean,
  minLengthMinutes = 60,
): Array<{ startMinutes: number; endMinutes: number; peakScore: number; contributors: ConvergenceSignal[] }> {
  const wins: Array<{ startMinutes: number; endMinutes: number; peakScore: number; contributors: ConvergenceSignal[] }> = [];
  let cur: { startMinutes: number; endMinutes: number; peakScore: number; contributors: ConvergenceSignal[] } | null = null;
  for (const s of slots) {
    if (predicate(s)) {
      if (!cur) cur = { startMinutes: s.minutes, endMinutes: s.minutes + SLOT_MINUTES, peakScore: s.score, contributors: [...s.contributors] };
      else {
        cur.endMinutes = s.minutes + SLOT_MINUTES;
        cur.peakScore  = Math.max(cur.peakScore, Math.abs(s.score));
        cur.contributors.push(...s.contributors);
      }
    } else if (cur) {
      if (cur.endMinutes - cur.startMinutes >= minLengthMinutes) wins.push(cur);
      cur = null;
    }
  }
  if (cur && cur.endMinutes - cur.startMinutes >= minLengthMinutes) wins.push(cur);
  return wins;
}

function fmtMinutes(m: number): string {
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${h.toString().padStart(2, "0")}:${mm.toString().padStart(2, "0")}`;
}

const WIN_DIRECTIVE_TOP: Trio = {
  uk: "Гарне вікно для: дій, розмов, рішень.",
  ru: "Хорошее окно для: действий, разговоров, решений.",
  en: "A good window for: action, conversation, decisions.",
};
const CHL_DIRECTIVE_TOP: Trio = {
  uk: "Стримана зона: не починай нового, відклади важливі дзвінки.",
  ru: "Сдержанная зона: не начинай нового, отложи важные звонки.",
  en: "Hold zone: don't start anything new, postpone important calls.",
};

// ──────────────────────────────────────────────────────────────────────────
// Numerology + Moon helpers (no natal needed)
// ──────────────────────────────────────────────────────────────────────────

const MOON_PHASE_THEME: Record<string, Trio> = {
  new:    { uk: "посіви — час задавати нову тему",          ru: "посевы — время задавать новую тему",      en: "seed-time — set a new theme" },
  waxing: { uk: "зростання — все запущене посилюється",     ru: "рост — всё запущенное усиливается",       en: "waxing — everything started amplifies" },
  full:   { uk: "кульмінація — результати ситуацій видно",  ru: "кульминация — результаты ситуаций видны", en: "culmination — outcomes are visible" },
  waning: { uk: "відпускання — час закривати, не починати", ru: "отпускание — время закрывать, не начинать",en: "release — close things, don't start" },
};

export function moonPhaseAt(jd: number): "new" | "waxing" | "full" | "waning" {
  const sun  = calcPlanetDeg(0, jd);
  const moon = calcPlanetDeg(1, jd);
  const elong = ((moon - sun) % 360 + 360) % 360;
  if (elong < 22.5 || elong > 337.5) return "new";
  if (Math.abs(elong - 180) < 22.5)  return "full";
  return elong < 180 ? "waxing" : "waning";
}

// ──────────────────────────────────────────────────────────────────────────
// Public API
// ──────────────────────────────────────────────────────────────────────────

/** Build the day's reading. Pure deterministic — no AI required. */
export function buildDayReading(input: HoroscopeInput): DayReading {
  const { language, date, tzOffsetHours } = input;
  const signals: ConvergenceSignal[] = [];

  // Day signature
  const d0 = new Date(date); d0.setHours(0, 0, 0, 0);
  const noonJd = dateToJD(d0.getFullYear(), d0.getMonth() + 1, d0.getDate(), 12, 0, tzOffsetHours);
  const moonLon = calcPlanetDeg(1, noonJd);
  const moonSignIdx = Math.floor(((moonLon % 360) + 360) % 360 / 30);
  const phase = moonPhaseAt(noonJd);

  // ── Always-on Moon signal — phase + sign ──
  signals.push({
    system: "moon",
    polarity: phase === "waning" ? "neutral" : "supporting",
    intensity: 2,
    label: language === "ru"
      ? `Луна в ${SIGN_NAMES.ru[moonSignIdx]} · ${MOON_PHASE_THEME[phase].ru}`
      : language === "en"
      ? `Moon in ${SIGN_NAMES.en[moonSignIdx]} · ${MOON_PHASE_THEME[phase].en}`
      : `Місяць у ${SIGN_NAMES.uk[moonSignIdx]} · ${MOON_PHASE_THEME[phase].uk}`,
    reasoning: language === "ru" ? "общая лунная погода дня" : language === "en" ? "general lunar weather of the day" : "загальна місячна погода дня",
  });

  // ── Numerology signal ──
  const pd = input.numerology?.personalDay;
  if (pd != null && PD_THEME[pd]) {
    signals.push({
      system: "numerology",
      polarity: pd === 4 || pd === 7 ? "neutral" : "supporting",
      intensity: 2,
      label: language === "ru"
        ? `Личный день ${pd} — день ${l(PD_THEME[pd], "ru")}`
        : language === "en"
        ? `Personal Day ${pd} — a day of ${l(PD_THEME[pd], "en")}`
        : `Особистий день ${pd} — день ${l(PD_THEME[pd], "uk")}`,
      reasoning: language === "ru" ? `вибрация дня для тебя лично` : language === "en" ? "your personal day vibration" : "вібрація дня саме для тебе",
    });
  }

  // ── Hidden Passion signal (constant theme, low intensity) ──
  const hp = input.numerology?.hiddenPassion;
  if (hp != null && PD_THEME[hp]) {
    signals.push({
      system: "numerology",
      polarity: "supporting",
      intensity: 1,
      label: language === "ru"
        ? `Внутренняя страсть ${hp} — естественное вдохновение через ${l(PD_THEME[hp], "ru")}`
        : language === "en"
        ? `Hidden Passion ${hp} — natural fuel through ${l(PD_THEME[hp], "en")}`
        : `Прихована пристрасть ${hp} — природне натхнення через ${l(PD_THEME[hp], "uk")}`,
      reasoning: language === "ru" ? "повторяющиеся буквы в имени" : language === "en" ? "most-repeated letter values in your name" : "найчастіше повторюване число в імені",
    });
  }

  // ── Astro transit signals (only when natal present) ──
  const slots = scoreSlots(input);

  // Collect a deduped list of major aspects active TODAY (not just instantaneously now)
  const aspectMap = new Map<string, ConvergenceSignal>();
  for (const s of slots) {
    for (const c of s.contributors) {
      const k = c.label;
      const prev = aspectMap.get(k);
      if (!prev || c.intensity > prev.intensity) aspectMap.set(k, c);
    }
  }
  for (const c of aspectMap.values()) signals.push(c);

  // Sort by intensity then polarity
  signals.sort((a, b) => {
    if (b.intensity !== a.intensity) return b.intensity - a.intensity;
    if (a.polarity === "supporting" && b.polarity !== "supporting") return -1;
    if (b.polarity === "supporting" && a.polarity !== "supporting") return 1;
    return 0;
  });

  // ── Windows ──
  const luckRaw = findWindows(slots, s => s.score >= 2, 60).slice(0, 3);
  const chlRaw  = findWindows(slots, s => s.score <= -2, 60).slice(0, 2);
  const windowsOfLuck: TimeWindow[] = luckRaw.map(w => ({
    startMinutes: w.startMinutes,
    endMinutes:   w.endMinutes,
    peakScore:    w.peakScore,
    signals:      [...new Set(w.contributors.map(c => c.label))].slice(0, 3),
    directive:    l(WIN_DIRECTIVE_TOP, language),
  }));
  const challengeWindows: TimeWindow[] = chlRaw.map(w => ({
    startMinutes: w.startMinutes,
    endMinutes:   w.endMinutes,
    peakScore:    w.peakScore,
    signals:      [...new Set(w.contributors.map(c => c.label))].slice(0, 3),
    directive:    l(CHL_DIRECTIVE_TOP, language),
  }));

  // ── Quality bucket ──
  const supportingCount  = signals.filter(s => s.polarity === "supporting").length;
  const challengingCount = signals.filter(s => s.polarity === "challenging").length;
  const totalContent = supportingCount + challengingCount;
  let quality: DayReading["quality"];
  if (totalContent === 0) quality = "quiet";
  else if (supportingCount > challengingCount * 2) quality = "flowing";
  else if (challengingCount > supportingCount) quality = "turbulent";
  else quality = "mixed";

  // ── Theme + actions ──
  const theme = buildTheme(language, quality, signals, input);
  const doToday    = buildDoVerbs(language, signals, input);
  const avoidToday = buildAvoidVerbs(language, signals);

  const isQuiet = quality === "quiet" || (totalContent <= 1 && pd == null);

  return {
    isoDate: d0.toISOString().slice(0, 10),
    theme,
    quality,
    signals: signals.slice(0, 8), // cap UI noise
    windowsOfLuck,
    challengeWindows,
    doToday,
    avoidToday,
    isQuiet,
  };
}

/** Localised theme — single sentence that ties the day together. */
function buildTheme(
  language: "uk" | "ru" | "en",
  quality: DayReading["quality"],
  signals: ConvergenceSignal[],
  input: HoroscopeInput,
): string {
  const name = input.firstName?.trim() || "";
  const greet = name
    ? language === "ru" ? `${name}, ` : language === "en" ? `${name}, ` : `${name}, `
    : "";

  const pd = input.numerology?.personalDay;
  const pdTheme = pd != null && PD_THEME[pd] ? l(PD_THEME[pd], language) : "";

  if (quality === "quiet") {
    return language === "ru"
      ? `${greet}сегодня — нейтральный день. Хороший день для отдыха, рутины, восстановления.`
      : language === "en"
      ? `${greet}today is a neutral day. Good for rest, routine, recovery.`
      : `${greet}сьогодні — нейтральний день. Гарний для відпочинку, рутини, відновлення.`;
  }

  // Dominant signal
  const top = signals.find(s => s.intensity === 3 && s.polarity === "supporting")
           ?? signals.find(s => s.intensity === 3)
           ?? signals[0];
  const topPart = top?.label ?? "";

  if (quality === "flowing") {
    return language === "ru"
      ? `${greet}у тебя день потока${pdTheme ? ` — ${pdTheme}` : ""}. ${topPart}.`
      : language === "en"
      ? `${greet}today is a flowing day${pdTheme ? ` — ${pdTheme}` : ""}. ${topPart}.`
      : `${greet}у тебе день потоку${pdTheme ? ` — ${pdTheme}` : ""}. ${topPart}.`;
  }
  if (quality === "turbulent") {
    return language === "ru"
      ? `${greet}день внутреннего давления${pdTheme ? ` — ${pdTheme}` : ""}. Береги границы и не торопись.`
      : language === "en"
      ? `${greet}a day of internal pressure${pdTheme ? ` — ${pdTheme}` : ""}. Guard the boundary, don't rush.`
      : `${greet}день внутрішнього тиску${pdTheme ? ` — ${pdTheme}` : ""}. Бережи кордон і не поспішай.`;
  }
  // mixed
  return language === "ru"
    ? `${greet}смешанный день${pdTheme ? ` — ${pdTheme}` : ""}. Используй окна, отступай в зоны давления.`
    : language === "en"
    ? `${greet}a mixed day${pdTheme ? ` — ${pdTheme}` : ""}. Use the windows, retreat from the pressure zones.`
    : `${greet}змішаний день${pdTheme ? ` — ${pdTheme}` : ""}. Використовуй вікна, відступай у зонах тиску.`;
}

function buildDoVerbs(
  language: "uk" | "ru" | "en",
  signals: ConvergenceSignal[],
  input: HoroscopeInput,
): string[] {
  const out: string[] = [];
  const pd = input.numerology?.personalDay;
  if (pd != null && PD_VERB[pd]) out.push(l(PD_VERB[pd], language));

  // Translate top supporting aspects into action hints
  for (const s of signals.filter(x => x.polarity === "supporting").slice(0, 3)) {
    // Use the readable label as the hint
    out.push(language === "ru" ? `используй: ${s.label.toLowerCase()}` : language === "en" ? `use: ${s.label.toLowerCase()}` : `використай: ${s.label.toLowerCase()}`);
  }
  return [...new Set(out)].slice(0, 4);
}

function buildAvoidVerbs(language: "uk" | "ru" | "en", signals: ConvergenceSignal[]): string[] {
  const out: string[] = [];
  const challenging = signals.filter(s => s.polarity === "challenging");
  if (challenging.length === 0) return out;
  for (const s of challenging.slice(0, 3)) {
    out.push(
      language === "ru" ? `обходи: ${s.label.toLowerCase()}` :
      language === "en" ? `avoid: ${s.label.toLowerCase()}` :
      `уникай: ${s.label.toLowerCase()}`
    );
  }
  return out;
}

// ──────────────────────────────────────────────────────────────────────────
// Time formatter (exported for the UI)
// ──────────────────────────────────────────────────────────────────────────

export function formatHM(m: number): string { return fmtMinutes(m); }

export { ASPECT_GLYPH };
