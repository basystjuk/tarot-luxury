/**
 * Plain-language tooltip text for terms used by the Moon Guide tool.
 *
 * Each key maps to uk/ru/en strings that show up in the <TermHint>
 * popover beside a label. Keep them ≤ 320 chars — the popover is sized
 * for short paragraphs, not long-form copy.
 *
 * Tone: friendly, professional, no jargon without explanation. The
 * audience is a curious user who may have never read astrology before.
 */

export type HintKey =
  | "phase"
  | "moonSign"
  | "moonDegree"
  | "illumination"
  | "darkMoon"
  | "voc"
  | "northNode"
  | "southNode"
  | "lilith"
  | "nextFull"
  | "nextNew";

type Lang = "uk" | "ru" | "en";

const HINTS: Record<HintKey, Record<Lang, string>> = {
  phase: {
    uk: "Фаза Місяця — на якому етапі циклу «від новолуння до повного й назад» зараз перебуває Місяць. Кожна фаза має свою енергію: новий — старти й наміри, повний — кульмінація, спадаючий — відпускання.",
    ru: "Фаза Луны — на каком этапе цикла «от новолуния до полнолуния и обратно» сейчас находится Луна. У каждой фазы своя энергия: новая — старты и намерения, полная — кульминация, убывающая — отпускание.",
    en: "Moon phase — where the Moon is in the cycle from new to full and back. Each phase has its own energy: new for starts, full for culmination, waning for release.",
  },
  moonSign: {
    uk: "Знак Місяця — через який знак Зодіаку Місяць проходить у цей момент. Він задає емоційний тон дня: де ми шукаємо турботу, як реагуємо, що нас живить. Змінюється приблизно кожні 2,5 доби.",
    ru: "Знак Луны — через какой знак Зодиака Луна проходит в этот момент. Он задаёт эмоциональный тон дня: где мы ищем заботу, как реагируем, что нас питает. Меняется примерно каждые 2,5 суток.",
    en: "Moon sign — which zodiac sign the Moon is passing through right now. It sets the emotional tone of the day: where we seek comfort, how we react, what nourishes us. Changes every ~2.5 days.",
  },
  moonDegree: {
    uk: "Градус (0–29°) — наскільки далеко Місяць просунувся всередині знака. Початок (0–10°) — свіжа енергія знака, середина (11–20°) — її пік, кінець (21–29°) — згасання й готовність до переходу в наступний знак.",
    ru: "Градус (0–29°) — насколько далеко Луна продвинулась внутри знака. Начало (0–10°) — свежая энергия знака, середина (11–20°) — её пик, конец (21–29°) — угасание и готовность к переходу в следующий знак.",
    en: "Degree (0–29°) — how far the Moon has moved within the sign. Beginning (0–10°): fresh energy, middle (11–20°): peak, end (21–29°): waning, ready to transition into the next sign.",
  },
  illumination: {
    uk: "Освітлення — який відсоток диска Місяця підсвічений Сонцем для нас. 0% = новий Місяць, 100% = повний. Показує, скільки «енергії циклу» зараз видно у небі.",
    ru: "Освещение — какой процент диска Луны подсвечен Солнцем для нас. 0% = новолуние, 100% = полнолуние. Показывает, сколько «энергии цикла» сейчас видно в небе.",
    en: "Illumination — what percentage of the Moon's disc is lit by the Sun as we see it. 0% = new, 100% = full. Shows how much of the cycle's energy is visible in the sky right now.",
  },
  darkMoon: {
    uk: "Темний Місяць — три доби «невидимості» навколо новомісяця, коли Місяць у небі майже не видно. Час інтроверсії, ритуалів відпускання та глибокого відпочинку. Не варто стартувати нічого нового.",
    ru: "Тёмная Луна — три дня «невидимости» вокруг новолуния, когда Луны в небе почти не видно. Время интроверсии, ритуалов отпускания и глубокого отдыха. Не стоит начинать ничего нового.",
    en: "Dark Moon — the 3-day 'invisibility' window around the new moon when the Moon is barely visible. A time for introversion, release rituals, deep rest. Not the moment to start anything new.",
  },
  voc: {
    uk: "Void of Course («пустий Місяць») — інтервал між останнім аспектом Місяця у знаку та його входом у наступний знак. Рішення цього вікна рідко «спрацьовують». Добре для рутини, відпочинку, медитації; не варто підписувати контракти й починати важливе.",
    ru: "Void of Course («пустая Луна») — интервал между последним аспектом Луны в знаке и её входом в следующий знак. Решения этого окна редко «срабатывают». Хорошо для рутины, отдыха, медитации; не стоит подписывать контракты и начинать важное.",
    en: "Void of Course ('void Moon') — the window between the Moon's last aspect in a sign and its entry into the next sign. Decisions made here rarely 'stick'. Good for routine, rest, meditation; not for signing contracts or starting anything important.",
  },
  northNode: {
    uk: "Північний вузол (Раху) — точка нашого карматичного зростання. Знак, через який Раху проходить, показує сферу, де душа збирається розширюватись у поточному циклі (~18 місяців). Це напрям «куди йти».",
    ru: "Северный узел (Раху) — точка нашего кармического роста. Знак, через который Раху проходит, показывает сферу, где душа собирается расширяться в текущем цикле (~18 месяцев). Это направление «куда идти».",
    en: "North Node (Rahu) — the point of karmic growth. The sign Rahu transits shows the area where the soul is meant to expand during the current ~18-month cycle. This is 'where to go'.",
  },
  southNode: {
    uk: "Південний вузол (Кету) — точка вже відпрацьованого досвіду. Знак Кету показує звички, дари й шаблони з минулих циклів, від яких ми вчимося поступово відштовхуватись, щоб рухатись до Раху.",
    ru: "Южный узел (Кету) — точка уже отработанного опыта. Знак Кету показывает привычки, дары и шаблоны из прошлых циклов, от которых мы учимся постепенно отталкиваться, чтобы двигаться к Раху.",
    en: "South Node (Ketu) — the point of already-mastered experience. The sign Ketu transits shows habits, gifts and patterns from past cycles we gradually learn to release as we move toward Rahu.",
  },
  lilith: {
    uk: "Чорна Луна Ліліт — точка нашої тіні, табу та «дикої» жіночої сили. Знак Ліліт показує сферу, де ми відчуваємо сором, інакшість або непокору, і де живе наша незручна, але справжня правда.",
    ru: "Чёрная Луна Лилит — точка нашей тени, табу и «дикой» женской силы. Знак Лилит показывает сферу, где мы ощущаем стыд, инаковость или непокорность, и где живёт наша неудобная, но настоящая правда.",
    en: "Black Moon Lilith — the point of our shadow, taboos and 'wild' feminine power. The sign Lilith transits shows the area where we feel shame, otherness or rebellion, where our uncomfortable but true voice lives.",
  },
  nextFull: {
    uk: "Дата найближчого повного Місяця — пікова точка циклу. Час кульмінації, завершень, відпускання того, що більше не служить. Емоції підвищені — корисно це знати наперед.",
    ru: "Дата ближайшего полнолуния — пиковая точка цикла. Время кульминации, завершений, отпускания того, что больше не служит. Эмоции на пике — полезно знать это заранее.",
    en: "Date of the next full Moon — the peak of the cycle. A time for culmination, endings, releasing what no longer serves. Emotions run high — it helps to know in advance.",
  },
  nextNew: {
    uk: "Дата найближчого новомісяця — точка перезапуску циклу. Найкращий момент для нових намірів, обіцянок собі та посівання задумів на наступні ~28 діб.",
    ru: "Дата ближайшего новолуния — точка перезапуска цикла. Лучший момент для новых намерений, обещаний себе и посева замыслов на следующие ~28 дней.",
    en: "Date of the next new Moon — the cycle's restart point. The best moment for new intentions, promises to yourself, and planting seeds for the next ~28 days.",
  },
};

export function moonHint(language: string, key: HintKey): string {
  const lang: Lang = language === "ru" ? "ru" : language === "en" ? "en" : "uk";
  return HINTS[key][lang];
}
