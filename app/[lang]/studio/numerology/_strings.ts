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

// ─── Pinnacle meanings — what the number says and what to do in this cycle ─
// Decoz tradition. Each Pinnacle = a major life theme (10-30 years). For UI:
// `keyword` = 1-3 word headline, `advice` = 1-2 sentence actionable note.
interface CycleMeaning { keyword: string; advice: string }
type CycleEntry = { uk: CycleMeaning; ru: CycleMeaning; en: CycleMeaning };

const PINNACLE_MEANINGS: Record<number, CycleEntry> = {
  1: {
    uk: { keyword: "Самостійність",         advice: "Період, коли ти вчишся стояти на своїх ногах. Час брати ініціативу й приймати рішення без озирання на інших." },
    ru: { keyword: "Самостоятельность",     advice: "Период, когда ты учишься стоять на своих ногах. Время брать инициативу и принимать решения без оглядки на других." },
    en: { keyword: "Self-reliance",         advice: "A period of learning to stand on your own. Take initiative and make decisions without leaning on others." },
  },
  2: {
    uk: { keyword: "Партнерство",           advice: "Час співпраці й тонкого відчуття людей. Стосунки, союзи й угоди принесуть тобі найбільший зріст — не поспішай." },
    ru: { keyword: "Партнёрство",           advice: "Время сотрудничества и тонкого ощущения людей. Отношения, союзы и соглашения принесут тебе наибольший рост — не спеши." },
    en: { keyword: "Partnership",           advice: "A time of cooperation and sensitivity. Relationships, alliances and agreements will bring the greatest growth — don't rush." },
  },
  3: {
    uk: { keyword: "Творчий розквіт",       advice: "Час самовираження, мистецтва й соціальної активності. Дозволь собі помилки — кожне слово та жест зараз працює на тебе." },
    ru: { keyword: "Творческий расцвет",    advice: "Время самовыражения, искусства и социальной активности. Позволь себе ошибки — каждое слово и жест сейчас работает на тебя." },
    en: { keyword: "Creative bloom",        advice: "A time of expression, art and social life. Allow yourself mistakes — every word and gesture works for you now." },
  },
  4: {
    uk: { keyword: "Будівництво",           advice: "Період методичної праці. Те, що ти закладеш зараз, стане базою на десятиліття. Уникай швидких обхідних шляхів." },
    ru: { keyword: "Строительство",         advice: "Период методичного труда. То, что ты заложишь сейчас, станет базой на десятилетия. Избегай быстрых обходных путей." },
    en: { keyword: "Foundation building",   advice: "A period of methodical work. What you build now becomes a base for decades. Avoid shortcuts." },
  },
  5: {
    uk: { keyword: "Рух і зміни",           advice: "Час подорожей, переїздів, перемін. Гнучкість важливіша за плани — будь готовим до несподіванок, вони ведуть тебе вперед." },
    ru: { keyword: "Движение и перемены",   advice: "Время путешествий, переездов, перемен. Гибкость важнее планов — будь готов к неожиданностям, они ведут тебя вперёд." },
    en: { keyword: "Motion and change",     advice: "A time of travel, relocation, change. Flexibility matters more than plans — embrace the unexpected, it moves you forward." },
  },
  6: {
    uk: { keyword: "Сім'я і служіння",      advice: "Дім, родина, спільнота — головний фокус. Час брати на себе турботу про близьких: це не тягар, а джерело сили." },
    ru: { keyword: "Семья и служение",      advice: "Дом, семья, сообщество — главный фокус. Время брать на себя заботу о близких: это не бремя, а источник силы." },
    en: { keyword: "Family and service",    advice: "Home, family, community — the central focus. Take on care for those close to you; it's not a burden but a source of strength." },
  },
  7: {
    uk: { keyword: "Внутрішня глибина",     advice: "Час навчання, аналізу, духовної практики. Уникай поверхневих контактів — справжнє знання приходить в усамітненні." },
    ru: { keyword: "Внутренняя глубина",    advice: "Время обучения, анализа, духовной практики. Избегай поверхностных контактов — настоящее знание приходит в уединении." },
    en: { keyword: "Inner depth",           advice: "A time of study, analysis, spiritual practice. Avoid shallow contacts — real knowing comes in solitude." },
  },
  8: {
    uk: { keyword: "Сила і успіх",          advice: "Час матеріального прориву. Дій сміливо у фінансах, бізнесі, кар'єрі — період підтримує великі рішення та відчутні результати." },
    ru: { keyword: "Сила и успех",          advice: "Время материального прорыва. Действуй смело в финансах, бизнесе, карьере — период поддерживает большие решения и осязаемые результаты." },
    en: { keyword: "Power and success",     advice: "A time of material breakthrough. Move boldly in finance, business, career — the cycle supports big decisions and tangible results." },
  },
  9: {
    uk: { keyword: "Завершення циклу",      advice: "Час закривати старі цикли й віддавати світу те, що накопичено. Чим більше відпускаєш, тим легше йдеш далі." },
    ru: { keyword: "Завершение цикла",      advice: "Время закрывать старые циклы и отдавать миру накопленное. Чем больше отпускаешь, тем легче идёшь дальше." },
    en: { keyword: "Cycle completion",      advice: "A time to close old cycles and give back what you've gathered. The more you release, the lighter your path." },
  },
  11: {
    uk: { keyword: "Інтуїтивне пробудження",advice: "Період підвищеної духовної чутливості. Інтуїція стає головним інструментом — час бути проводником для інших." },
    ru: { keyword: "Интуитивное пробуждение",advice:"Период повышенной духовной чувствительности. Интуиция становится главным инструментом — время быть проводником для других." },
    en: { keyword: "Intuitive awakening",   advice: "A period of heightened spiritual sensitivity. Intuition becomes your main tool — a time to guide others." },
  },
  22: {
    uk: { keyword: "Великий задум",         advice: "Час реалізації масштабних мрій. Те, що інші вважають нереальним, для тебе досяжне — дій великими кроками." },
    ru: { keyword: "Великий замысел",       advice: "Время реализации масштабных мечт. То, что другие считают нереальным, для тебя достижимо — действуй большими шагами." },
    en: { keyword: "Great vision",          advice: "A time to manifest large dreams. What others call impossible is within reach — move in big steps." },
  },
  33: {
    uk: { keyword: "Серце і служіння",      advice: "Рідкісний цикл служіння через любов. Час бути вчителем, цілителем, провідником для багатьох." },
    ru: { keyword: "Сердце и служение",     advice: "Редкий цикл служения через любовь. Время быть учителем, целителем, проводником для многих." },
    en: { keyword: "Heart and service",     advice: "A rare cycle of service through love. A time to be a teacher, healer, guide to many." },
  },
};

const CHALLENGE_MEANINGS: Record<number, CycleEntry> = {
  0: {
    uk: { keyword: "Свобода вибору",        advice: "У тебе всі можливості й немає чітких обмежень. Виклик — самостійно обрати напрям і не загубитись у варіантах." },
    ru: { keyword: "Свобода выбора",        advice: "У тебя все возможности и нет чётких ограничений. Вызов — самостоятельно выбрать направление и не потеряться в вариантах." },
    en: { keyword: "Freedom of choice",     advice: "All options are open with no fixed limits. The challenge is to choose your direction without getting lost in possibilities." },
  },
  1: {
    uk: { keyword: "Незалежність",          advice: "Тебе тягне покладатись на інших або ховатись за чужими рішеннями. Виклик — повірити у власну волю й голос." },
    ru: { keyword: "Независимость",         advice: "Тебя тянет полагаться на других или прятаться за чужими решениями. Вызов — поверить в собственную волю и голос." },
    en: { keyword: "Independence",          advice: "A pull to lean on others or hide behind their decisions. The challenge: trust your own will and voice." },
  },
  2: {
    uk: { keyword: "Баланс чутливості",     advice: "Надмірна вразливість до критики або одержимість думкою інших. Виклик — знайти внутрішню опору, що не залежить від оточення." },
    ru: { keyword: "Баланс чувствительности",advice:"Чрезмерная уязвимость к критике или одержимость мнением других. Вызов — найти внутреннюю опору, не зависящую от окружения." },
    en: { keyword: "Sensitivity balance",   advice: "Over-sensitivity to criticism or obsession with others' opinions. The challenge: find inner ground that doesn't depend on surroundings." },
  },
  3: {
    uk: { keyword: "Самовираження",         advice: "Страх показати справжнього себе або розпорошення на дрібниці. Виклик — знайти свій голос і фокус для творчості." },
    ru: { keyword: "Самовыражение",         advice: "Страх показать настоящего себя или распыление на мелочи. Вызов — найти свой голос и фокус для творчества." },
    en: { keyword: "Self-expression",       advice: "Fear of showing the real you, or scattering on trivia. The challenge: find your voice and creative focus." },
  },
  4: {
    uk: { keyword: "Дисципліна",            advice: "Безлад, ліньки, ухиляння від рутинних справ. Виклик — навчитись систематично доводити справи до кінця." },
    ru: { keyword: "Дисциплина",            advice: "Беспорядок, лень, уклонение от рутинных дел. Вызов — научиться систематически доводить дела до конца." },
    en: { keyword: "Discipline",            advice: "Disorder, laziness, avoiding routine. The challenge: learn to finish what you start, systematically." },
  },
  5: {
    uk: { keyword: "Поміркованість",        advice: "Імпульсивність, надмір змін, нездатність усидіти на місці. Виклик — використовувати свободу конструктивно." },
    ru: { keyword: "Умеренность",           advice: "Импульсивность, избыток перемен, неспособность усидеть на месте. Вызов — использовать свободу конструктивно." },
    en: { keyword: "Moderation",            advice: "Impulsiveness, too much change, restlessness. The challenge: turn freedom into something constructive." },
  },
  6: {
    uk: { keyword: "Прийняття",             advice: "Перфекціонізм у стосунках, нав'язування «правильного» іншим. Виклик — приймати людей такими, як вони є." },
    ru: { keyword: "Принятие",              advice: "Перфекционизм в отношениях, навязывание «правильного» другим. Вызов — принимать людей такими, какие они есть." },
    en: { keyword: "Acceptance",            advice: "Perfectionism in relationships, imposing your 'right way' on others. The challenge: accept people as they are." },
  },
  7: {
    uk: { keyword: "Відкритість",           advice: "Замкненість, скептицизм, страх показати вразливість. Виклик — довіритись комусь і відкрити серце." },
    ru: { keyword: "Открытость",            advice: "Замкнутость, скептицизм, страх показать уязвимость. Вызов — довериться кому-то и открыть сердце." },
    en: { keyword: "Openness",              advice: "Withdrawal, scepticism, fear of vulnerability. The challenge: trust someone and open your heart." },
  },
  8: {
    uk: { keyword: "Сила без надлишку",     advice: "Або одержимість матеріальним, або страх грошей і влади. Виклик — знайти здоровий баланс із силою та статусом." },
    ru: { keyword: "Сила без излишка",      advice: "Или одержимость материальным, или страх денег и власти. Вызов — найти здоровый баланс с силой и статусом." },
    en: { keyword: "Power without excess",  advice: "Either obsession with material gain or fear of money and power. The challenge: find a healthy balance with strength and status." },
  },
};

export function pinnacleMeaning(lang: Lang, num: number): CycleMeaning {
  const row = PINNACLE_MEANINGS[num];
  if (!row) return { keyword: "", advice: "" };
  return row[lang] ?? row.uk;
}
export function challengeMeaning(lang: Lang, num: number): CycleMeaning {
  const row = CHALLENGE_MEANINGS[num];
  if (!row) return { keyword: "", advice: "" };
  return row[lang] ?? row.uk;
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
