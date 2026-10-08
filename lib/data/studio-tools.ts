/**
 * Soul Studio tool cards — built-in texts (uk/ru/en), one entry per tool.
 *
 * The public /studio page renders these; the admin can override the title and
 * description of any tool (stored as `studio_tools` in the site content
 * document — only entries that differ from these defaults are kept, so text
 * improvements made here still reach tools the owner never customised).
 */

import type { ToolId } from "../tools-config";

export interface StudioToolTexts {
  title_uk: string; title_ru: string; title_en: string;
  desc_uk: string; desc_ru: string; desc_en: string;
}

export interface StudioToolCard extends StudioToolTexts {
  id: ToolId;
  subtitle_uk: string; subtitle_ru: string; subtitle_en: string;
  glyph: string;
  accent: string;
}

/** Stored admin override for one tool's card. */
export type StudioToolOverride = StudioToolTexts & { id: string };

// Order = order on the Studio page.
export const STUDIO_TOOL_CARDS: StudioToolCard[] = [
  {
    id: "daily-card", glyph: "✦", accent: "from-[#B8883A] to-[#9A6E28]",
    subtitle_uk: "Таро", subtitle_ru: "Таро", subtitle_en: "Tarot",
    title_uk: "Карта дня", title_ru: "Карта дня", title_en: "Card of the Day",
    desc_uk: "Щоденна карта Таро — ваш орієнтир та медитація на сьогодні. Персональне передбачення від Ellen Soul.",
    desc_ru: "Ежедневная карта Таро — ваш ориентир и медитация на сегодня. Персональное предсказание от Ellen Soul.",
    desc_en: "Daily Tarot card — your guide and meditation for today. Personal reading from Ellen Soul.",
  },
  {
    id: "numerology", glyph: "∞", accent: "from-[#D4A853] to-[#C4A97A]",
    subtitle_uk: "Нумерологія", subtitle_ru: "Нумерология", subtitle_en: "Numerology",
    title_uk: "Нумерологія", title_ru: "Нумерология", title_en: "Numerology",
    desc_uk: "Ваше число Долі, число Шляху, Душа, Особистість та карматичні уроки за ім'ям і датою народження.",
    desc_ru: "Ваше число Судьбы, число Пути, Душа, Личность и карматические уроки по имени и дате рождения.",
    desc_en: "Your Destiny, Life Path, Soul, Personality numbers and karmic lessons by name and date of birth.",
  },
  {
    id: "compatibility", glyph: "♡", accent: "from-[#E8C98A] to-[#C4A97A]",
    subtitle_uk: "Астрологія · Нумерологія", subtitle_ru: "Астрология · Нумерология", subtitle_en: "Astrology · Numerology",
    title_uk: "Карта сумісності", title_ru: "Карта совместимости", title_en: "Compatibility Map",
    desc_uk: "Знаки зодіаку та числа долі двох людей — повний аналіз сумісності пари.",
    desc_ru: "Знаки зодиака и числа судьбы двух людей — полный анализ совместимости пары.",
    desc_en: "Zodiac signs and destiny numbers of two people — full couple compatibility analysis.",
  },
  {
    id: "moon-phase", glyph: "🌙", accent: "from-[#C4A97A] to-[#9A6E28]",
    subtitle_uk: "Місяць · Астрологія", subtitle_ru: "Луна · Астрология", subtitle_en: "Moon · Astrology",
    title_uk: "Місячний провідник", title_ru: "Лунный проводник", title_en: "Moon Guide",
    desc_uk: "Точна фаза, знак і градус Місяця на будь-яку дату. Темний Місяць, Void of Course, вузли, Ліліт — особисте місячне послання.",
    desc_ru: "Точная фаза, знак и градус Луны на любую дату. Тёмная Луна, Void of Course, узлы, Лилит — личное лунное послание.",
    desc_en: "The precise Moon phase, sign and degree for any date. Dark Moon, Void of Course, nodes, Lilith — a personal lunar message.",
  },
  {
    id: "natal-chart", glyph: "✺", accent: "from-[#9A6E28] to-[#5A3E18]",
    subtitle_uk: "Астрологія", subtitle_ru: "Астрология", subtitle_en: "Astrology",
    title_uk: "Натальна карта", title_ru: "Натальная карта", title_en: "Natal Chart",
    desc_uk: "Повний астрологічний портрет: планети, доми, аспекти — ваш космічний паспорт.",
    desc_ru: "Полный астрологический портрет: планеты, дома, аспекты — ваш космический паспорт.",
    desc_en: "A full astrological portrait: planets, houses, aspects — your cosmic passport.",
  },
  {
    id: "horoscope", glyph: "☉", accent: "from-[#E8C98A] to-[#9A6E28]",
    subtitle_uk: "Астрологія + Нумерологія", subtitle_ru: "Астрология + Нумерология", subtitle_en: "Astrology + Numerology",
    title_uk: "Гороскоп дня", title_ru: "Гороскоп дня", title_en: "Daily Horoscope",
    desc_uk: "Персональний гороскоп на сьогодні: конвергенція транзитів до твоєї натальної карти, вікна удачі з точністю до хвилини.",
    desc_ru: "Персональный гороскоп на сегодня: конвергенция транзитов к вашей натальной карте, окна удачи с точностью до минуты.",
    desc_en: "Your personal horoscope for today: transit convergence to your natal chart, windows of luck down to the minute.",
  },
  {
    id: "year-forecast", glyph: "❂", accent: "from-[#D4A853] to-[#9A6E28]",
    subtitle_uk: "Соляр · Прогресії", subtitle_ru: "Соляр · Прогрессии", subtitle_en: "Solar Return · Progressions",
    title_uk: "Прогноз року", title_ru: "Прогноз года", title_en: "Year Forecast",
    desc_uk: "Прогноз на рік: соляр задає тему, прогресивний Місяць — твою емоційну пору. З колесом сонячного повернення.",
    desc_ru: "Прогноз на год: соляр задаёт тему, прогрессивная Луна — вашу эмоциональную пору. С колесом солнечного возвращения.",
    desc_en: "Your year ahead: the Solar Return sets the theme, the progressed Moon your emotional season. With a solar-return wheel.",
  },
  {
    id: "dreams", glyph: "🌙", accent: "from-[#7E6AC8] to-[#3B2E6E]",
    subtitle_uk: "AI-аналіз снів", subtitle_ru: "AI-анализ снов", subtitle_en: "AI dream analysis",
    title_uk: "Сонник", title_ru: "Сонник", title_en: "Dream Interpreter",
    desc_uk: "Опишіть свій сон — AI знайде символи, дасть глибоке психологічне й духовне трактування, послання підсвідомості та афірмацію.",
    desc_ru: "Опишите свой сон — AI найдёт символы, даст глубокое психологическое и духовное толкование, послание подсознания и аффирмацию.",
    desc_en: "Describe your dream — AI detects the symbols, gives a deep psychological and spiritual reading, a message from the subconscious and an affirmation.",
  },
];

const TEXT_KEYS = ["title_uk", "title_ru", "title_en", "desc_uk", "desc_ru", "desc_en"] as const;

/** Texts shown for a tool: the stored override if there is one, else the default. */
export function studioToolTexts(card: StudioToolCard, overrides: StudioToolOverride[] | null | undefined): StudioToolTexts {
  const ov = overrides?.find((o) => o.id === card.id);
  const out = {} as StudioToolTexts;
  for (const k of TEXT_KEYS) out[k] = ov?.[k]?.trim() ? ov[k] : card[k];
  return out;
}

/** Overrides to store: one entry per tool whose texts differ from the defaults. */
export function studioOverridesFrom(texts: Record<string, StudioToolTexts>): StudioToolOverride[] {
  return STUDIO_TOOL_CARDS.flatMap((card) => {
    const t = texts[card.id];
    if (!t || TEXT_KEYS.every((k) => (t[k] ?? "").trim() === card[k])) return [];
    return [{ id: card.id, ...t }];
  });
}
