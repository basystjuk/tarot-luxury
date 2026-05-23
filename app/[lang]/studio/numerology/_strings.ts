/**
 * UI strings for Phase 3 numerology redesign — tooltip hints, section
 * titles, and labels for the extended numbers (Pinnacles, Challenges,
 * Cornerstone, Capstone, First Vowel, Plane of Expression).
 *
 * Three languages: uk / ru / en. The key `t(lang, "key")` helper picks
 * the right one and falls back to UK.
 */

type Lang = "uk" | "ru" | "en";

type Trio = [string, string, string]; // [uk, ru, en]

const S = {
  // Section titles
  sectionExpand:        ["Розкрити повний портрет", "Раскрыть полный портрет", "Reveal Full Portrait"] as Trio,
  sectionCollapse:      ["Згорнути", "Свернуть", "Collapse"] as Trio,
  sectionCore:          ["Основні числа", "Основные числа", "Core Numbers"] as Trio,
  sectionCycles:        ["Циклічні впливи", "Циклические влияния", "Cyclical Influences"] as Trio,
  sectionGiftsTrials:   ["Дар і виклики", "Дар и вызовы", "Gifts & Challenges"] as Trio,
  sectionNameStructure: ["Структура імені", "Структура имени", "Name Structure"] as Trio,

  // Renamed: Hidden Passion → Gift of the Element
  giftOfElement:        ["Дар Стихії", "Дар Стихии", "Gift of the Element"] as Trio,
  giftOfElementSub:     ["вроджений талант", "врождённый талант", "innate talent"] as Trio,

  // Pinnacle / Challenge labels
  pinnacleHeading:      ["Активна Вершина", "Активная Вершина", "Active Pinnacle"] as Trio,
  challengeHeading:     ["Активний Виклик", "Активный Вызов", "Active Challenge"] as Trio,
  pinnacleAllHeading:   ["Усі 4 Вершини", "Все 4 Вершины", "All 4 Pinnacles"] as Trio,
  challengeAllHeading:  ["Усі 4 Виклики", "Все 4 Вызова", "All 4 Challenges"] as Trio,
  pinnacleNum:          ["Вершина", "Вершина", "Pinnacle"] as Trio,
  challengeNum:         ["Виклик", "Вызов", "Challenge"] as Trio,
  ageWindow:            ["вік", "возраст", "age"] as Trio,
  ageUntil:             ["до", "до", "until"] as Trio,
  ageFrom:              ["від", "от", "from"] as Trio,
  endOfLife:            ["до кінця життя", "до конца жизни", "to end of life"] as Trio,

  // Letter labels
  cornerstone:          ["Наріжний камінь", "Краеугольный камень", "Cornerstone"] as Trio,
  capstone:             ["Замковий камінь", "Венчающий камень", "Capstone"] as Trio,
  firstVowel:           ["Перша голосна", "Первая гласная", "First Vowel"] as Trio,
  letterLabel:          ["літера", "буква", "letter"] as Trio,
  value:                ["значення", "значение", "value"] as Trio,

  // Plane of Expression
  planeOfExpression:    ["Площина вираження", "Плоскость выражения", "Plane of Expression"] as Trio,
  planePhysical:        ["Фізична", "Физическая", "Physical"] as Trio,
  planeMental:          ["Ментальна", "Ментальная", "Mental"] as Trio,
  planeEmotional:       ["Емоційна", "Эмоциональная", "Emotional"] as Trio,
  planeIntuitive:       ["Інтуїтивна", "Интуитивная", "Intuitive"] as Trio,

  // Master phase
  masterActive:   ["Майстер-число активоване", "Мастер-число активировано", "Master number activated"] as Trio,
  masterDormant:  ["Майстер-число активується у", "Мастер-число активируется в", "Master number activates at age"] as Trio,
  masterYears:    ["років", "лет", ""] as Trio,

  // Karmic / Balance / etc. labels (used inside sections)
  karmicLessons:      ["Карматичні уроки", "Кармические уроки", "Karmic Lessons"] as Trio,
  balance:            ["Число Балансу", "Число Баланса", "Balance Number"] as Trio,
  maturity:           ["Зрілість (після 35)", "Зрелость (после 35)", "Maturity (after 35)"] as Trio,
  personalYear:       ["Особистий рік", "Личный год", "Personal Year"] as Trio,
  destiny:            ["Доля", "Судьба", "Destiny"] as Trio,
  soul:               ["Число Душі", "Число Души", "Soul Number"] as Trio,
  personality:        ["Особистість", "Личность", "Personality"] as Trio,
  birthday:           ["День народження", "День рождения", "Birthday"] as Trio,
};

export function t(lang: Lang, key: keyof typeof S): string {
  const row = S[key];
  return lang === "ru" ? row[1] : lang === "en" ? row[2] : row[0];
}

// ─── Tooltip hints (one sentence each) ─────────────────────────────────────
const HINTS = {
  lifePath: {
    uk: "Сума дня, місяця та року народження. Головна тема й уроки життя.",
    ru: "Сумма дня, месяца и года рождения. Главная тема и уроки жизни.",
    en: "Sum of birth day, month and year. The main theme and lessons of life.",
  },
  destiny: {
    uk: "Сума числових значень усіх літер повного імені — місія, до якої веде доля.",
    ru: "Сумма числовых значений всех букв полного имени — миссия, к которой ведёт судьба.",
    en: "Sum of numeric values of all letters in the full name — the destiny's mission.",
  },
  soul: {
    uk: "Сума голосних в імені — внутрішнє прагнення душі, що ти насправді хочеш.",
    ru: "Сумма гласных в имени — внутреннее стремление души, чего ты на самом деле хочешь.",
    en: "Sum of vowels in the name — the soul's inner urge, what you truly want.",
  },
  personality: {
    uk: "Сума приголосних в імені — як тебе бачать інші, перше враження.",
    ru: "Сумма согласных в имени — как тебя видят другие, первое впечатление.",
    en: "Sum of consonants in the name — how others see you, the first impression.",
  },
  birthday: {
    uk: "Число дня народження — вроджений дар, який працює без зусиль.",
    ru: "Число дня рождения — врождённый дар, который работает без усилий.",
    en: "Day-of-birth number — an innate gift that works effortlessly.",
  },
  personalYear: {
    uk: "Тема поточного року особисто для тебе — від 1 (нові початки) до 9 (завершення).",
    ru: "Тема текущего года лично для тебя — от 1 (новые начинания) до 9 (завершение).",
    en: "Your personal theme for the current year — from 1 (new beginnings) to 9 (endings).",
  },
  maturity: {
    uk: "Сума Шляху + Долі. Друга половина життя після 35 розкривається саме через це число.",
    ru: "Сумма Пути + Судьбы. Вторая половина жизни после 35 раскрывается именно через это число.",
    en: "Sum of Life Path + Destiny. The second half of life after 35 unfolds through this number.",
  },
  balance: {
    uk: "Сума перших літер кожного слова імені — твоя стратегія в моменти стресу й кризи.",
    ru: "Сумма первых букв каждого слова имени — твоя стратегия в моменты стресса и кризиса.",
    en: "Sum of the first letters of each word in the name — your strategy in stress and crisis.",
  },
  karmicLessons: {
    uk: "Цифри 1-9, яких НЕМАЄ в твоєму імені — навички, які душа прийшла опанувати.",
    ru: "Цифры 1-9, которых НЕТ в твоём имени — навыки, которые душа пришла освоить.",
    en: "Digits 1–9 missing from your name — skills the soul came to master.",
  },
  giftOfElement: {
    uk: "Найчастіша цифра в твоєму імені — стихійний дар, який ллється з тебе природньо.",
    ru: "Самая частая цифра в твоём имени — стихийный дар, который льётся из тебя естественно.",
    en: "The most frequent digit in your name — an elemental gift that flows naturally.",
  },
  pinnacle: {
    uk: "4 великі цикли життя. Кожна Вершина — окрема життєва тема та можливості, що домінують у цей період.",
    ru: "4 больших цикла жизни. Каждая Вершина — отдельная жизненная тема и возможности, доминирующие в этот период.",
    en: "Four major life cycles. Each Pinnacle is a distinct theme and the opportunities that dominate that period.",
  },
  challenge: {
    uk: "Парний до Вершини. Виклик показує, що саме треба засвоїти в цьому циклі.",
    ru: "Парный к Вершине. Вызов показывает, что именно нужно освоить в этом цикле.",
    en: "Partner to the Pinnacle. The Challenge shows what specifically must be learned during this cycle.",
  },
  cornerstone: {
    uk: "Перша літера твого імені — як ти підходиш до нових ситуацій і людей.",
    ru: "Первая буква твоего имени — как ты подходишь к новым ситуациям и людям.",
    en: "First letter of your first name — how you approach new situations and people.",
  },
  capstone: {
    uk: "Остання літера твого імені — як ти завершуєш справи й тримаєш курс.",
    ru: "Последняя буква твоего имени — как ты завершаешь дела и держишь курс.",
    en: "Last letter of your first name — how you finish tasks and stay the course.",
  },
  firstVowel: {
    uk: "Перша голосна імені — найперша реакція душі, інстинктивний відгук.",
    ru: "Первая гласная имени — самая первая реакция души, инстинктивный отклик.",
    en: "First vowel of your name — the soul's very first reaction, the instinctive response.",
  },
  planeOfExpression: {
    uk: "Розподіл літер імені за 4 типами енергії. Домінантний тип — як ти проявляєш себе у світі.",
    ru: "Распределение букв имени по 4 типам энергии. Доминантный тип — как ты проявляешь себя в мире.",
    en: "Distribution of name letters across 4 energy types. The dominant type is how you express yourself in the world.",
  },
  masterNumber: {
    uk: "Майстер-числа 11, 22, 33 — особлива енергія, що активується у певному віці.",
    ru: "Мастер-числа 11, 22, 33 — особая энергия, активирующаяся в определённом возрасте.",
    en: "Master numbers 11, 22, 33 carry a heightened energy that activates at a certain age.",
  },
};

export function hint(lang: Lang, key: keyof typeof HINTS): string {
  return HINTS[key][lang] ?? HINTS[key].uk;
}

// ─── Letter meanings (single line per letter, all 9 numeric values) ────────
// Used for Cornerstone / Capstone / First Vowel. The interpretation is the
// same regardless of position — what changes is the framing question.
const LETTER_MEANING: Record<number, Trio> = {
  1: ["незалежність, ініціатива", "независимость, инициатива", "independence, initiative"],
  2: ["чутливість, партнерство", "чувствительность, партнёрство", "sensitivity, partnership"],
  3: ["творчість, виразність", "творчество, выразительность", "creativity, expression"],
  4: ["надійність, структура", "надёжность, структура", "reliability, structure"],
  5: ["свобода, рух", "свобода, движение", "freedom, movement"],
  6: ["турбота, гармонія", "забота, гармония", "care, harmony"],
  7: ["глибина, аналіз", "глубина, анализ", "depth, analysis"],
  8: ["сила, реалізація", "сила, реализация", "power, realisation"],
  9: ["мудрість, великодушність", "мудрость, великодушие", "wisdom, generosity"],
};

export function letterMeaning(lang: Lang, value: number): string {
  const row = LETTER_MEANING[value];
  if (!row) return "";
  return lang === "ru" ? row[1] : lang === "en" ? row[2] : row[0];
}

// Plane-of-expression "dominant" sentence
export function planeDominantNote(lang: Lang, dominant: string): string {
  const map: Record<string, Trio> = {
    physical:  ["Домінантна площина — Фізична. Ти проявляєшся у світі через дію, тіло, конкретику.",
                "Доминантная плоскость — Физическая. Ты проявляешься в мире через действие, тело, конкретику.",
                "Dominant plane — Physical. You express yourself through action, body, the concrete."],
    mental:    ["Домінантна площина — Ментальна. Ти проявляєшся через думку, аналіз, ідеї.",
                "Доминантная плоскость — Ментальная. Ты проявляешься через мысль, анализ, идеи.",
                "Dominant plane — Mental. You express yourself through thought, analysis, ideas."],
    emotional: ["Домінантна площина — Емоційна. Ти проявляєшся через почуття, стосунки, відчуття.",
                "Доминантная плоскость — Эмоциональная. Ты проявляешься через чувства, отношения, ощущения.",
                "Dominant plane — Emotional. You express yourself through feelings, relationships, sensations."],
    intuitive: ["Домінантна площина — Інтуїтивна. Ти проявляєшся через прозріння, бачення, надсенс.",
                "Доминантная плоскость — Интуитивная. Ты проявляешься через прозрения, видение, надсмыслы.",
                "Dominant plane — Intuitive. You express yourself through insight, vision, higher knowing."],
  };
  const row = map[dominant];
  if (!row) return "";
  return lang === "ru" ? row[1] : lang === "en" ? row[2] : row[0];
}
