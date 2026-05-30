/**
 * Tarot-journal tag classifier.
 *
 * Since every video on the channel is tarot-themed, classifying by tool
 * (taro / astro / numerology) would mostly produce one bucket. Instead we
 * classify by THEME — the question the reading answers — which is what a
 * viewer actually browses by. Owner can override any tag in admin.
 *
 * Strategy:
 *   1. Normalise title + description (lowercase, strip diacritics).
 *   2. Score each theme by summing keyword hits weighted by where they
 *      appear: title hit = 3, description hit = 1.
 *   3. Apply a floor so off-topic noise doesn't tag everything.
 *   4. Return all themes whose score >= floor, sorted by score desc.
 *      Cap at 3 (a reading rarely deserves more than 3 thematic tags).
 *
 * Multilingual: ukrainian, russian, english stems collected per theme,
 * because the channel mixes languages.
 */

export type ThemeTag =
  | "love"          // стосунки, кохання
  | "money"         // фінанси, гроші
  | "career"        // робота, бізнес, успіх
  | "future"        // майбутнє, прогноз
  | "self"          // самопізнання, тінь, ріст
  | "moon"          // місячні цикли, ритуали
  | "decision"      // вибір, перехрестя
  | "shadow"        // виклики, страхи, блоки
  | "spiritual";    // духовне, медитація

export const THEME_LABELS: Record<ThemeTag, { uk: string; ru: string; en: string; glyph: string }> = {
  love:      { uk: "Любов",        ru: "Любовь",        en: "Love",        glyph: "♡" },
  money:     { uk: "Гроші",        ru: "Деньги",        en: "Money",       glyph: "✦" },
  career:    { uk: "Кар'єра",      ru: "Карьера",       en: "Career",      glyph: "▲" },
  future:    { uk: "Майбутнє",     ru: "Будущее",       en: "Future",      glyph: "❂" },
  self:      { uk: "Самопізнання", ru: "Самопознание",  en: "Self",        glyph: "◉" },
  moon:      { uk: "Місяць",       ru: "Луна",          en: "Moon",        glyph: "☽" },
  decision:  { uk: "Вибір",        ru: "Выбор",         en: "Decision",    glyph: "✕" },
  shadow:    { uk: "Виклик",       ru: "Вызов",         en: "Challenge",   glyph: "△" },
  spiritual: { uk: "Духовне",      ru: "Духовное",      en: "Spiritual",   glyph: "✺" },
};

/** Multilingual keyword sets per theme. Stems are matched with word-boundary
 *  awareness so "грошима" matches "грош" but "проштрафив" does not match "штраф". */
const KEYWORDS: Record<ThemeTag, string[]> = {
  love: [
    "люб", "коха", "любов", "любв", "love", "lover", "relationship",
    "стосун", "отношен", "пара", "couple",
    "сумісн", "совмест", "compatibility",
    "побач", "свидан", "date",
    "ревнощ", "ревнос", "jealous",
    "розрив", "разрыв", "breakup", "розставан", "расстава",
    "шлюб", "брак", "marriage", "engaged",
    "ex", "колишн", "бывш",
  ],
  money: [
    "грош", "деньг", "money", "cash",
    "фінанс", "финанс", "finance",
    "багатств", "богатств", "wealth",
    "прибут", "доход", "income", "profit",
    "борг", "долг", "debt",
    "успіх у грош", "успех в деньг",
    "інвест", "инвест", "invest",
  ],
  career: [
    "кар'єр", "карьер", "career",
    "робот", "работ", "work", "job",
    "бізнес", "бизнес", "business",
    "проєкт", "проект", "project",
    "колектив", "коллектив", "team",
    "посад", "должност", "position",
    "звільн", "увольн", "fired",
    "співбесід", "собеседован", "interview",
  ],
  future: [
    "майбутн", "будущ", "future",
    "прогноз", "forecast",
    "рік", "год ", " year",
    "тиждень", "недел", "week",
    "місяц", "месяц", "month",
    "що чекає", "что ждет", "what awaits",
    "що буде", "что будет",
    "найближч", "ближайш", "upcoming",
  ],
  self: [
    "самопізнан", "самопозн", "self",
    "розвит", "развит", "growth",
    "усвідомл", "осознан", "awareness",
    "потенціал", "потенциал", "potential",
    "призначен", "призван", "purpose",
    "ціль", "цель", "goal",
    "урок", "lesson",
    "тінь", "тень", "shadow",
  ],
  moon: [
    "місяц", "месяц", "moon", "lunar",
    "повня", "полнолун", "full moon",
    "новолун", "new moon",
    "ритуал", "ritual",
    "цикл", "cycle",
    "затемнен", "eclipse",
  ],
  decision: [
    "вибір", "выбор", "choice", "choose",
    "рішенн", "решен", "decision", "decide",
    "перехрест", "перекрест", "crossroad",
    "дилем", "dilemma",
    "куди йти", "куда идти", "which way",
  ],
  shadow: [
    "виклик", "вызов", "challenge",
    "страх", "fear",
    "блок", "block",
    "перешкод", "препятств", "obstacle",
    "проблем", "problem",
    "криз", "crisis",
    "втрат", "loss",
    "зрад", "измен", "betray",
  ],
  spiritual: [
    "духовн", "spiritual",
    "медитац", "meditation",
    "молитв", "molitva", "prayer",
    "карм", "karma",
    "душ", "soul",
    "ангел", "angel", "guide",
    "знак", "sign",
    "інтуїц", "интуиц", "intuition",
  ],
};

/** Latin-only fold so cyrillic + latin keywords compare against a stable form. */
function normalise(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // strip diacritics
    .replace(/['ʼ`’']/g, "")          // strip apostrophes (укр. кар'єра → карєра)
    .replace(/ё/g, "е");
}

export function classifyVideo(title: string, description: string): ThemeTag[] {
  const titleN = normalise(title);
  const descN  = normalise(description);
  const scores: Record<ThemeTag, number> = {
    love: 0, money: 0, career: 0, future: 0, self: 0, moon: 0,
    decision: 0, shadow: 0, spiritual: 0,
  };
  for (const [theme, kws] of Object.entries(KEYWORDS) as Array<[ThemeTag, string[]]>) {
    for (const kw of kws) {
      const k = normalise(kw);
      if (titleN.includes(k)) scores[theme] += 3;
      if (descN.includes(k))  scores[theme] += 1;
    }
  }
  // Floor of 3 = at least one title hit or three description hits. Stops
  // single-word coincidences in a long description from creating ghost tags.
  const FLOOR = 3;
  const hits = (Object.entries(scores) as Array<[ThemeTag, number]>)
    .filter(([, s]) => s >= FLOOR)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([t]) => t);
  return hits;
}
