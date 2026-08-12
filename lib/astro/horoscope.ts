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

// Planet names in uk/ru carry grammatical case, and the aspect phrase picks
// which case: "з'єднується з твоїм Сонцем" (instrumental) but "у тригоні до
// твого Сонця" (genitive). Storing a single form and gluing it to a fixed
// possessive produced "у тригоні до твого Сонцем" in four aspects out of five.
// The possessive cannot live in the aspect phrase either — Venus is feminine
// ("до твоєї Венери"), so each planet carries both complete phrases.
type PlanetForms = {
  uk: { withCase: string; toCase: string };   // орудний / родовий
  ru: { withCase: string; toCase: string };   // творительный / дательный
  en: string;                                 // English has no cases here
};

const PLANET_FORMS: Record<string, PlanetForms> = {
  Sun:     { uk: { withCase: "твоїм Сонцем",    toCase: "твого Сонця"    }, ru: { withCase: "твоим Солнцем",   toCase: "твоему Солнцу"   }, en: "your Sun" },
  Moon:    { uk: { withCase: "твоїм Місяцем",   toCase: "твого Місяця"   }, ru: { withCase: "твоей Луной",     toCase: "твоей Луне"      }, en: "your Moon" },
  Mercury: { uk: { withCase: "твоїм Меркурієм", toCase: "твого Меркурія" }, ru: { withCase: "твоим Меркурием", toCase: "твоему Меркурию" }, en: "your Mercury" },
  Venus:   { uk: { withCase: "твоєю Венерою",   toCase: "твоєї Венери"   }, ru: { withCase: "твоей Венерой",   toCase: "твоей Венере"    }, en: "your Venus" },
  Mars:    { uk: { withCase: "твоїм Марсом",    toCase: "твого Марса"    }, ru: { withCase: "твоим Марсом",    toCase: "твоему Марсу"    }, en: "your Mars" },
  Jupiter: { uk: { withCase: "твоїм Юпітером",  toCase: "твого Юпітера"  }, ru: { withCase: "твоим Юпитером",  toCase: "твоему Юпитеру"  }, en: "your Jupiter" },
  Saturn:  { uk: { withCase: "твоїм Сатурном",  toCase: "твого Сатурна"  }, ru: { withCase: "твоим Сатурном",  toCase: "твоему Сатурну"  }, en: "your Saturn" },
  ASC:     { uk: { withCase: "твоїм АСЦ",       toCase: "твого АСЦ"      }, ru: { withCase: "твоим АСЦ",       toCase: "твоему АСЦ"      }, en: "your ASC" },
  MC:      { uk: { withCase: "твоїм МС",        toCase: "твого МС"       }, ru: { withCase: "твоим МС",        toCase: "твоему МС"       }, en: "your MC" },
};

// Aspect phrases stop at the preposition — the planet supplies the rest.
const ASPECT_VERBAL: Record<AspectKind, Trio> = {
  conjunction: { uk: "з'єднується з", ru: "соединяется с", en: "meets" },
  sextile:     { uk: "у секстилі до", ru: "в секстиле к",  en: "sextiles" },
  square:      { uk: "у квадраті до", ru: "в квадрате к",  en: "squares" },
  trine:       { uk: "у тригоні до",  ru: "в тригоне к",   en: "trines" },
  opposition:  { uk: "в опозиції до", ru: "в оппозиции к", en: "opposes" },
};

/** Aspect + natal planet as one grammatical phrase, e.g. "у тригоні до твого Сонця". */
function aspectPhrase(kind: AspectKind, planet: string, language: "uk" | "ru" | "en"): string {
  const forms = PLANET_FORMS[planet];
  const verb = l(ASPECT_VERBAL[kind], language);
  if (!forms) return verb;
  const noun = language === "en"
    ? forms.en
    : kind === "conjunction" ? forms[language].withCase : forms[language].toCase;
  return `${verb} ${noun}`;
}

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

/**
 * The calendar day `date` falls on, as seen from a zone `tzOffsetHours` east
 * of UTC.
 *
 * Deliberately not `d.setHours(0,0,0,0)`: that reads the HOST's timezone, so
 * the same call produced a different day's reading on a UTC server than on a
 * developer's laptop — and after per-user zones landed, "which day" stopped
 * being the server's business entirely.
 */
function localDayParts(date: Date, tzOffsetHours: number): { y: number; m: number; d: number } {
  const shifted = new Date(date.getTime() + tzOffsetHours * 3_600_000);
  return { y: shifted.getUTCFullYear(), m: shifted.getUTCMonth() + 1, d: shifted.getUTCDate() };
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

  const { y, m, d } = localDayParts(input.date, tzOffsetHours);

  for (let s = 0; s < SLOTS_PER_DAY; s++) {
    const minutes = s * SLOT_MINUTES;
    // Slot labels are wall-clock in the user's zone; dateToJD converts them.
    const jd = dateToJD(y, m, d, Math.floor(minutes / 60), minutes % 60, tzOffsetHours);
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

          const label = `☽ ${aspectPhrase(kind, name, language)}`;
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

/** Minutes either side of the strongest slot that a window reaches. */
const WINDOW_HALF_WIDTH = 45;

/**
 * The day's single strongest stretch, centred on its peak slot.
 *
 * The previous version returned every RUN of qualifying slots ≥60 min long.
 * With nine natal points and orbs up to 5°, aspects overlap for hours, so a
 * "window of luck" routinely came out 7–11 hours wide and 19% of them ran into
 * the midnight edge — advice that spans half a day advises nothing. Owner's
 * call (2026-08-12): one window per day, ±45 min around the peak.
 */
function peakWindow(
  slots: SlotRecord[],
  polarity: "luck" | "pressure",
): Array<{ startMinutes: number; endMinutes: number; peakScore: number; contributors: ConvergenceSignal[] }> {
  const qualifies = (s: SlotRecord) => polarity === "luck" ? s.score >= 2 : s.score <= -2;

  let best: SlotRecord | null = null;
  for (const s of slots) {
    if (!qualifies(s)) continue;
    if (!best || Math.abs(s.score) > Math.abs(best.score)) best = s;
  }
  if (!best) return [];

  const startMinutes = Math.max(0, best.minutes - WINDOW_HALF_WIDTH);
  const endMinutes   = Math.min(24 * 60, best.minutes + SLOT_MINUTES + WINDOW_HALF_WIDTH);
  const contributors = slots
    .filter(s => s.minutes >= startMinutes && s.minutes < endMinutes)
    .flatMap(s => s.contributors);

  return [{ startMinutes, endMinutes, peakScore: Math.abs(best.score), contributors }];
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

  // Day signature — the user's calendar day, never the host's.
  const { y, m, d } = localDayParts(date, tzOffsetHours);
  const noonJd = dateToJD(y, m, d, 12, 0, tzOffsetHours);
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
  const luckRaw = peakWindow(slots, "luck");
  const chlRaw  = peakWindow(slots, "pressure");
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
    // The user's local date — also the per-user dedup key in the cron.
    isoDate: `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
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
      // "кордон" is a state border in Ukrainian — the sense here is personal
      // boundaries, which is "межі". Direct calque from the Russian "границы".
      : `${greet}день внутрішнього тиску${pdTheme ? ` — ${pdTheme}` : ""}. Бережи свої межі і не поспішай.`;
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

/**
 * Numerology Personal Day (Pythagorean reduction).
 *
 * Takes the target date as explicit calendar parts rather than a Date, so the
 * caller decides which day it means — the browser's, the user's zone, or the
 * server's. Reading them off a Date is how "today" quietly became the host's
 * today. Use localDayFor() to get the parts for a given zone.
 */
export function calcPersonalDay(
  birthDate: string, year: number, month: number, day: number,
): number | null {
  const parsed = birthDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!parsed) return null;
  const reduceN = (n: number): number => {
    if (n === 11 || n === 22 || n === 33) return n;
    if (n < 10) return n;
    return reduceN(String(n).split("").reduce((a, c) => a + parseInt(c, 10), 0));
  };
  const birthMonth = parseInt(parsed[2], 10);
  const birthDay   = parseInt(parsed[3], 10);
  const py = reduceN(reduceN(birthDay) + reduceN(birthMonth)
    + reduceN(String(year).split("").reduce((a, c) => a + parseInt(c, 10), 0)));
  const pm = reduceN(py + reduceN(month));
  return reduceN(pm + reduceN(day));
}

/** Calendar parts of `date` as seen from a zone `tzOffsetHours` east of UTC. */
export function localDayFor(date: Date, tzOffsetHours: number): { y: number; m: number; d: number } {
  return localDayParts(date, tzOffsetHours);
}

export { ASPECT_GLYPH };
