export interface ServiceItem {
  id: string;
  title_ru: string;
  subtitle_ru: string;
  title_uk: string;
  subtitle_uk: string;
  title_en: string;
  subtitle_en: string;
  price: string;
  desc_ru: string;
  desc_uk: string;
  desc_en: string;
  includes_ru: string[];
  includes_uk: string[];
  includes_en: string[];
}

export interface OrgItem {
  id: string;
  text_ru: string;
  text_uk: string;
  text_en: string;
}

export const DEFAULT_SERVICES: ServiceItem[] = [
  {
    id: "question",
    title_ru: "Один вопрос",
    subtitle_ru: "Подробный разбор",
    title_uk: "Одне питання",
    subtitle_uk: "Детальний розбір",
    title_en: "One Question",
    subtitle_en: "Detailed analysis",
    price: "$20",
    desc_ru: "Детальный анализ одного волнующего вопроса через призму карт таро.",
    desc_uk: "Детальний аналіз одного хвилюючого питання через призму карт таро.",
    desc_en: "Detailed analysis of one burning question through the lens of tarot cards.",
    includes_ru: [
      "Глубокий анализ одного вопроса",
      "Интерпретация карт",
      "Практические рекомендации",
    ],
    includes_uk: [
      "Глибокий аналіз одного питання",
      "Інтерпретація карт",
      "Практичні рекомендації",
    ],
    includes_en: [
      "In-depth analysis of one question",
      "Card interpretation",
      "Practical recommendations",
    ],
  },
  {
    id: "relationship-lite",
    title_ru: "Расклад на отношения lite",
    subtitle_ru: "2 вопроса",
    title_uk: "Розклад на відносини lite",
    subtitle_uk: "2 питання",
    title_en: "Relationship Spread Lite",
    subtitle_en: "2 questions",
    price: "$30",
    desc_ru: "Расклад для прояснения ситуации в отношениях — два ключевых вопроса.",
    desc_uk: "Розклад для прояснення ситуації у відносинах — два ключових питання.",
    desc_en: "A spread to clarify a relationship situation — two key questions.",
    includes_ru: [
      "Анализ двух вопросов об отношениях",
      "Динамика между партнёрами",
      "Советы по улучшению ситуации",
    ],
    includes_uk: [
      "Аналіз двох питань про відносини",
      "Динаміка між партнерами",
      "Поради щодо покращення ситуації",
    ],
    includes_en: [
      "Analysis of two relationship questions",
      "Dynamics between partners",
      "Tips for improving the situation",
    ],
  },
  {
    id: "relationship",
    title_ru: "Расклад на отношения",
    subtitle_ru: "4 вопроса",
    title_uk: "Розклад на відносини",
    subtitle_uk: "4 питання",
    title_en: "Relationship Spread",
    subtitle_en: "4 questions",
    price: "$50",
    desc_ru: "Полный анализ отношений: прошлое, настоящее, будущее и скрытые мотивы.",
    desc_uk: "Повний аналіз відносин: минуле, теперішнє, майбутнє та приховані мотиви.",
    desc_en: "Full relationship analysis: past, present, future and hidden motives.",
    includes_ru: [
      "Четыре вопроса об отношениях",
      "Анализ прошлого и настоящего",
      "Прогноз развития отношений",
      "Скрытые энергии и мотивы партнёра",
    ],
    includes_uk: [
      "Чотири питання про відносини",
      "Аналіз минулого та теперішнього",
      "Прогноз розвитку відносин",
      "Приховані енергії та мотиви партнера",
    ],
    includes_en: [
      "Four questions about the relationship",
      "Analysis of past and present",
      "Relationship development forecast",
      "Hidden energies and partner's motives",
    ],
  },
  {
    id: "triangle",
    title_ru: "Расклад Треугольник",
    subtitle_ru: "6 вопросов",
    title_uk: "Розклад Трикутник",
    subtitle_uk: "6 питань",
    title_en: "Triangle Spread",
    subtitle_en: "6 questions",
    price: "$60",
    desc_ru: "Комплексный расклад для глубокого понимания ситуации с треугольником отношений.",
    desc_uk: "Комплексний розклад для глибокого розуміння ситуації з трикутником відносин.",
    desc_en: "A comprehensive spread for deep understanding of a love triangle situation.",
    includes_ru: [
      "Шесть вопросов для полного понимания",
      "Анализ всех сторон ситуации",
      "Энергия каждого участника",
      "Возможные пути развития",
      "Рекомендации и советы",
    ],
    includes_uk: [
      "Шість питань для повного розуміння",
      "Аналіз усіх сторін ситуації",
      "Енергія кожного учасника",
      "Можливі шляхи розвитку",
      "Рекомендації та поради",
    ],
    includes_en: [
      "Six questions for full understanding",
      "Analysis of all sides of the situation",
      "Energy of each participant",
      "Possible paths forward",
      "Recommendations and advice",
    ],
  },
  {
    id: "amor",
    title_ru: "Расклад Амур",
    subtitle_ru: "6 вопросов",
    title_uk: "Розклад Амур",
    subtitle_uk: "6 питань",
    title_en: "Amour Spread",
    subtitle_en: "6 questions",
    price: "$60",
    desc_ru: "Специализированный расклад на любовь и отношения — шесть ключевых аспектов.",
    desc_uk: "Спеціалізований розклад на кохання та відносини — шість ключових аспектів.",
    desc_en: "A specialised spread for love and relationships — six key aspects.",
    includes_ru: [
      "Шесть вопросов о любви",
      "Чувства и намерения партнёра",
      "Препятствия и ресурсы",
      "Перспективы отношений",
      "Советы от карт",
    ],
    includes_uk: [
      "Шість питань про кохання",
      "Почуття та наміри партнера",
      "Перешкоди та ресурси",
      "Перспективи відносин",
      "Поради від карт",
    ],
    includes_en: [
      "Six questions about love",
      "Partner's feelings and intentions",
      "Obstacles and resources",
      "Relationship prospects",
      "Card advice",
    ],
  },
  {
    id: "month",
    title_ru: "Прогноз на месяц",
    subtitle_ru: "Комплексный анализ",
    title_uk: "Прогноз на місяць",
    subtitle_uk: "Комплексний аналіз",
    title_en: "Monthly Forecast",
    subtitle_en: "Comprehensive analysis",
    price: "$65",
    desc_ru: "Разбор по основным сферам жизни, совет, сюрприз и главная энергия месяца.",
    desc_uk: "Розбір по основних сферах життя, порада, сюрприз та головна енергія місяця.",
    desc_en: "A breakdown across the main areas of life, advice, surprise and the main energy of the month.",
    includes_ru: [
      "Главная тема и энергия месяца",
      "Разбор по ключевым сферам жизни",
      "Совет от карт на месяц",
      "Сюрприз месяца",
    ],
    includes_uk: [
      "Головна тема та енергія місяця",
      "Розбір по ключових сферах життя",
      "Порада від карт на місяць",
      "Сюрприз місяця",
    ],
    includes_en: [
      "Main theme and energy of the month",
      "Breakdown across key life areas",
      "Card advice for the month",
      "Month's surprise",
    ],
  },
  {
    id: "session",
    title_ru: "Онлайн таро сессия",
    subtitle_ru: "1 час в прямом эфире",
    title_uk: "Онлайн таро сесія",
    subtitle_uk: "1 година наживо",
    title_en: "Online Tarot Session",
    subtitle_en: "1 hour live",
    price: "$100",
    desc_ru: "В течение часа можете задать любое количество вопросов на разные сферы жизни. Общение, после которого становится легче и обретается внутреннее спокойствие.",
    desc_uk: "Протягом години можете ставити будь-яку кількість питань на різні сфери життя. Спілкування, після якого стає легше та знаходиться внутрішній спокій.",
    desc_en: "During one hour you can ask any number of questions across different life areas. A conversation after which you feel lighter and find inner peace.",
    includes_ru: [
      "Неограниченное количество вопросов в течение часа",
      "Живое общение в формате видеозвонка",
      "WhatsApp или Telegram",
      "Ответы на любые темы",
      "Практические рекомендации",
    ],
    includes_uk: [
      "Необмежена кількість питань протягом години",
      "Живе спілкування у форматі відеодзвінка",
      "WhatsApp або Telegram",
      "Відповіді на будь-які теми",
      "Практичні рекомендації",
    ],
    includes_en: [
      "Unlimited questions during one hour",
      "Live communication via video call",
      "WhatsApp or Telegram",
      "Answers on any topic",
      "Practical recommendations",
    ],
  },
];

export const DEFAULT_ORG: OrgItem[] = [
  {
    id: "payment",
    text_ru: "Оплата: 100% предоплата перед консультацией (карта, PayPal, Binance).",
    text_uk: "Оплата: 100% передоплата перед консультацією (картка, PayPal, Binance).",
    text_en: "Payment: 100% prepayment before the consultation (card, PayPal, Binance).",
  },
  {
    id: "format",
    text_ru: "Ответ в формате аудио/видео в течение 24 часов.",
    text_uk: "Відповідь у форматі аудіо/відео протягом 24 годин.",
    text_en: "Response in audio/video format within 24 hours.",
  },
  {
    id: "urgent",
    text_ru: "За срочный ответ в течение часа — дополнительная плата в размере 50% стоимости расклада.",
    text_uk: "За терміновий ответ протягом години — додаткова плата у розмірі 50% вартості розкладу.",
    text_en: "For an urgent response within one hour — an additional charge of 50% of the spread cost.",
  },
  {
    id: "extension",
    text_ru: "Продление консультации: если онлайн-консультация превышает 60 минут, каждые следующие 10 минут оплачиваются отдельно — $20.",
    text_uk: "Продовження консультації: якщо онлайн-консультація перевищує 60 хвилин, кожні наступні 10 хвилин оплачуються окремо — $20.",
    text_en: "Session extension: if the online consultation exceeds 60 minutes, each additional 10 minutes is billed separately — $20.",
  },
];

export const SERVICES_STORAGE_KEY = "ellen_admin_services";
export const ORG_STORAGE_KEY = "ellen_admin_org";
