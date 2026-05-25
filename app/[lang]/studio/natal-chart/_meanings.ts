/**
 * Canonical natal-chart meanings (Phase М17 polish).
 *
 * Three layers:
 *   1. Planet-in-sign — Sun/Moon/Ascendant/MC/Venus/Mars in each of the
 *      12 signs. The chart's "spine + relational stack".
 *   2. Planet-in-house — concise themes for each of the 10 planets in
 *      each of the 12 houses. (Compact: one line per pair, English-
 *      translated by the UI layer if needed.)
 *   3. Aspect archetypes — what each of the 5 Ptolemaic aspect kinds
 *      MEANS as a general energetic pattern, before planetary nuance.
 *
 * Style: warm, modern, no astrology jargon. Source synthesis: Liz
 * Greene, Steven Forrest, Demetra George (modern psychological school).
 *
 * Each entry has uk/ru/en. The UI picks one based on the active locale.
 */

type Trio = { uk: string; ru: string; en: string };

// ─── Sun in each sign ───────────────────────────────────────────────────
export const SUN_IN_SIGN: Trio[] = [
  // 0 = Aries
  { uk: "Сонце в Овні: пряма воля, інстинкт першості, енергія старту. Світ читає тебе як того, хто йде попереду.",
    ru: "Солнце в Овне: прямая воля, инстинкт первенства, энергия старта. Мир читает тебя как того, кто идёт впереди.",
    en: "Sun in Aries: direct will, instinct to lead, the spark of beginning. The world reads you as someone who moves first." },
  // 1 = Taurus
  { uk: "Сонце в Тельці: тиха сила, чуттєвість, прагнення стабільності. Твоя ідентичність будується через те, що ти створюєш руками й тілом.",
    ru: "Солнце в Тельце: тихая сила, чувственность, стремление к стабильности. Твоя идентичность строится через то, что ты создаёшь руками и телом.",
    en: "Sun in Taurus: quiet strength, sensuality, the pull toward stability. Your identity is built through what you make with hands and body." },
  // 2 = Gemini
  { uk: "Сонце в Близнюках: гнучкий розум, цікавість, потреба зв'язків. Ти стаєш собою через слова, обмін, навчання.",
    ru: "Солнце в Близнецах: гибкий ум, любопытство, потребность в связях. Ты становишься собой через слова, обмен, обучение.",
    en: "Sun in Gemini: flexible mind, curiosity, the need to connect. You become yourself through words, exchange, learning." },
  // 3 = Cancer
  { uk: "Сонце в Раку: емоційна глибина, інстинкт турботи, потреба коренів. Твоя ідентичність — у тому, кого ти захищаєш.",
    ru: "Солнце в Раке: эмоциональная глубина, инстинкт заботы, потребность в корнях. Твоя идентичность — в том, кого ты защищаешь.",
    en: "Sun in Cancer: emotional depth, instinct to nurture, the need for roots. Your identity lives in whom you protect." },
  // 4 = Leo
  { uk: "Сонце в Леві: серце-вогонь, потреба бути побаченим, благородна щедрість. Ти найбільше «ти», коли творчо випромінюєш.",
    ru: "Солнце во Льве: сердце-огонь, потребность быть увиденным, благородная щедрость. Ты больше всего «ты», когда творчески излучаешь.",
    en: "Sun in Leo: heart-fire, the need to be seen, noble generosity. You are most yourself when you radiate creatively." },
  // 5 = Virgo
  { uk: "Сонце в Діві: майстер деталей, інстинкт удосконалення, тиха цінність служіння. Ідентичність — у якості того, що ти робиш.",
    ru: "Солнце в Деве: мастер деталей, инстинкт совершенствования, тихая ценность служения. Идентичность — в качестве того, что ты делаешь.",
    en: "Sun in Virgo: master of detail, instinct to refine, the quiet value of service. Identity lives in the quality of what you do." },
  // 6 = Libra
  { uk: "Сонце в Терезах: пошук гармонії, чутливість до балансу, інстинкт зустрічі. Ти стаєш собою через дзеркало інших.",
    ru: "Солнце в Весах: поиск гармонии, чувствительность к балансу, инстинкт встречи. Ты становишься собой через зеркало других.",
    en: "Sun in Libra: search for harmony, attunement to balance, the instinct to meet. You become yourself through the mirror of others." },
  // 7 = Scorpio
  { uk: "Сонце в Скорпіоні: глибина, інтенсивність, неуникний інстинкт трансформації. Ідентичність формується через те, що ти переживаєш до кінця.",
    ru: "Солнце в Скорпионе: глубина, интенсивность, неизбежный инстинкт трансформации. Идентичность формируется через то, что ты переживаешь до конца.",
    en: "Sun in Scorpio: depth, intensity, an unavoidable instinct for transformation. Identity is forged through what you live to the end." },
  // 8 = Sagittarius
  { uk: "Сонце в Стрільці: потреба сенсу, інстинкт ширшого горизонту, віра в більше. Ти стаєш собою через подорож і пошук.",
    ru: "Солнце в Стрельце: потребность в смысле, инстинкт более широкого горизонта, вера в большее. Ты становишься собой через путешествие и поиск.",
    en: "Sun in Sagittarius: need for meaning, instinct for the wider horizon, faith in more. You become yourself through journey and search." },
  // 9 = Capricorn
  { uk: "Сонце в Козерозі: дисципліна, потреба структури, інстинкт довгої гри. Ідентичність — у тому, що ти будуєш століттями.",
    ru: "Солнце в Козероге: дисциплина, потребность в структуре, инстинкт долгой игры. Идентичность — в том, что ты строишь веками.",
    en: "Sun in Capricorn: discipline, need for structure, instinct for the long game. Identity lives in what you build for the ages." },
  // 10 = Aquarius
  { uk: "Сонце у Водолії: інстинкт оригінальності, відчуття колективного, віра в майбутнє. Ти стаєш собою, коли ламаєш зайвий шаблон.",
    ru: "Солнце в Водолее: инстинкт оригинальности, ощущение коллективного, вера в будущее. Ты становишься собой, когда ломаешь лишний шаблон.",
    en: "Sun in Aquarius: instinct for originality, sense of the collective, faith in the future. You become yourself when you break a pattern that's worn out." },
  // 11 = Pisces
  { uk: "Сонце в Рибах: душа без меж, інстинкт милосердя, тяжіння до невидимого. Ідентичність розчиняється у тому, що більше за тебе.",
    ru: "Солнце в Рыбах: душа без границ, инстинкт милосердия, тяга к невидимому. Идентичность растворяется в том, что больше тебя.",
    en: "Sun in Pisces: a boundless soul, instinct toward mercy, pull toward the unseen. Identity dissolves into what is larger than you." },
];

// ─── Moon in each sign ──────────────────────────────────────────────────
export const MOON_IN_SIGN: Trio[] = [
  { uk: "Місяць в Овні: швидкі емоції, спалахи й пожежі. Заспокоюєшся, коли дієш — а не коли думаєш.",
    ru: "Луна в Овне: быстрые эмоции, вспышки и пожары. Успокаиваешься, когда действуешь — а не когда думаешь.",
    en: "Moon in Aries: quick emotions, sparks and small fires. You settle by acting, not by thinking." },
  { uk: "Місяць у Тельці: повільне глибоке відчуття. Тобі треба тіло, дотик, ароматне, м'яке — щоб бути собою.",
    ru: "Луна в Тельце: медленное глубокое чувство. Тебе нужно тело, прикосновение, ароматное, мягкое — чтобы быть собой.",
    en: "Moon in Taurus: slow, deep feeling. You need body, touch, fragrance and softness to be yourself." },
  { uk: "Місяць у Близнюках: емоції-слова, серце, що думає вголос. Заспокоюєшся через розмову.",
    ru: "Луна в Близнецах: эмоции-слова, сердце, думающее вслух. Успокаиваешься через разговор.",
    en: "Moon in Gemini: emotions made of words, a heart that thinks out loud. You settle by talking." },
  { uk: "Місяць у Раку: дім — це всередині. Глибинна емпатія, інстинкт берегти, місячна пам'ять.",
    ru: "Луна в Раке: дом — это внутри. Глубокая эмпатия, инстинкт беречь, лунная память.",
    en: "Moon in Cancer: home is inside. Deep empathy, the instinct to hold and protect, a lunar memory." },
  { uk: "Місяць у Леві: серце-вогонь. Тобі потрібно бути побаченим, оціненим, мати «своїх».",
    ru: "Луна во Льве: сердце-огонь. Тебе нужно быть увиденным, оценённым, иметь «своих».",
    en: "Moon in Leo: heart of fire. You need to be seen, valued, to have 'your people'." },
  { uk: "Місяць у Діві: емоції, що бажають точності. Турбота через дрібну роботу й порядок.",
    ru: "Луна в Деве: эмоции, которые хотят точности. Забота через мелкую работу и порядок.",
    en: "Moon in Virgo: emotions that want precision. You care through small work and order." },
  { uk: "Місяць у Терезах: серце, налаштоване на гармонію. Болить, коли поруч щось дисонує.",
    ru: "Луна в Весах: сердце, настроенное на гармонию. Болит, когда рядом что-то диссонирует.",
    en: "Moon in Libra: a heart tuned to harmony. It hurts when something nearby is out of tune." },
  { uk: "Місяць у Скорпіоні: усе або нічого. Емоції-глибина, ревнощі, відчуття іншого крізь стіни.",
    ru: "Луна в Скорпионе: всё или ничего. Эмоции-глубина, ревность, ощущение другого сквозь стены.",
    en: "Moon in Scorpio: all or nothing. Depth-emotions, jealousy, sensing another through walls." },
  { uk: "Місяць у Стрільці: серце, що мандрує. Заспокоюєшся через відкритий простір і нові горизонти.",
    ru: "Луна в Стрельце: сердце, которое странствует. Успокаиваешься через открытое пространство и новые горизонты.",
    en: "Moon in Sagittarius: a wandering heart. You settle through open space and new horizons." },
  { uk: "Місяць у Козерозі: емоції під замком. Заспокоюєшся через мету, відповідальність, контроль.",
    ru: "Луна в Козероге: эмоции под замком. Успокаиваешься через цель, ответственность, контроль.",
    en: "Moon in Capricorn: emotions kept locked. You settle through purpose, responsibility, control." },
  { uk: "Місяць у Водолії: серце, що бачить здалеку. Дружба важливіша за романтику; самотність терпиш легше за більшість.",
    ru: "Луна в Водолее: сердце, видящее издалека. Дружба важнее романтики; одиночество переносится легче, чем у большинства.",
    en: "Moon in Aquarius: a heart that watches from a distance. Friendship matters more than romance; you bear solitude better than most." },
  { uk: "Місяць у Рибах: серце без меж. Вбираєш чужі емоції як губка; мистецтво — твоя терапія.",
    ru: "Луна в Рыбах: сердце без границ. Впитываешь чужие эмоции как губка; искусство — твоя терапия.",
    en: "Moon in Pisces: a borderless heart. You absorb others' emotions like a sponge; art is your therapy." },
];

// ─── Ascendant in each sign ─────────────────────────────────────────────
export const ASC_IN_SIGN: Trio[] = [
  { uk: "Асцендент в Овні: ти заходиш у кімнату першою. Світ читає тебе як прямого, активного, безкомпромісного.",
    ru: "Асцендент в Овне: ты входишь в комнату первой. Мир читает тебя как прямого, активного, бескомпромиссного.",
    en: "Ascendant in Aries: you enter a room first. The world reads you as direct, active, uncompromising." },
  { uk: "Асцендент у Тельці: спокійна присутність, м'який голос, тіло на землі. Люди розслабляються поруч.",
    ru: "Асцендент в Тельце: спокойное присутствие, мягкий голос, тело на земле. Люди расслабляются рядом.",
    en: "Ascendant in Taurus: calm presence, soft voice, body on the earth. People relax around you." },
  { uk: "Асцендент у Близнюках: швидкі очі, гнучка мова, манера журналіста. Уся комунікація проходить через тебе вільно.",
    ru: "Асцендент в Близнецах: быстрые глаза, гибкая речь, манера журналиста. Вся коммуникация проходит через тебя свободно.",
    en: "Ascendant in Gemini: quick eyes, flexible speech, the manner of a journalist. All communication flows through you freely." },
  { uk: "Асцендент у Раку: відчутна емпатія, м'яка стійкість, інстинкт оточити турботою. Тобі довіряють секрети.",
    ru: "Асцендент в Раке: ощутимая эмпатия, мягкая стойкость, инстинкт окружить заботой. Тебе доверяют секреты.",
    en: "Ascendant in Cancer: visible empathy, soft resilience, an instinct to surround with care. People trust you with secrets." },
  { uk: "Асцендент у Леві: природна сценічність, тепло, гідність. Люди прислухаються коли ти говориш.",
    ru: "Асцендент во Льве: природная сценичность, тепло, достоинство. Люди прислушиваются, когда ты говоришь.",
    en: "Ascendant in Leo: natural stage presence, warmth, dignity. People listen when you speak." },
  { uk: "Асцендент у Діві: спостережливість, акуратність, тихий розум. Світ читає тебе як експерта.",
    ru: "Асцендент в Деве: наблюдательность, аккуратность, тихий ум. Мир читает тебя как эксперта.",
    en: "Ascendant in Virgo: observation, neatness, a quiet intellect. The world reads you as an expert." },
  { uk: "Асцендент у Терезах: вроджена грація, чарівність, симетрія. Тобі дають фору саме тому, що з тобою приємно.",
    ru: "Асцендент в Весах: врождённая грация, обаяние, симметрия. Тебе дают фору именно потому, что с тобой приятно.",
    en: "Ascendant in Libra: innate grace, charm, symmetry. People give you a head start because it's pleasant to be around you." },
  { uk: "Асцендент у Скорпіоні: магнетична присутність, погляд крізь людей. Тебе або обожнюють, або сторонять.",
    ru: "Асцендент в Скорпионе: магнетическое присутствие, взгляд сквозь людей. Тебя или обожают, или сторонятся.",
    en: "Ascendant in Scorpio: magnetic presence, a gaze that pierces. People either adore you or stay back." },
  { uk: "Асцендент у Стрільці: відкрита посмішка, енергія мандрівника, інстинкт навчати. Все навколо ширшає коли ти приходиш.",
    ru: "Асцендент в Стрельце: открытая улыбка, энергия путешественника, инстинкт учить. Всё вокруг расширяется, когда ты приходишь.",
    en: "Ascendant in Sagittarius: open smile, traveller's energy, the instinct to teach. Everything widens when you walk in." },
  { uk: "Асцендент у Козерозі: серйозне обличчя, дорослість раніше за вік, інстинкт відповідальності. Тебе беруть на серйозне.",
    ru: "Асцендент в Козероге: серьёзное лицо, взрослость раньше возраста, инстинкт ответственности. Тебя воспринимают серьёзно.",
    en: "Ascendant in Capricorn: a serious face, adulthood ahead of your age, the instinct of responsibility. People take you seriously." },
  { uk: "Асцендент у Водолії: ти трохи дивний — у хорошому сенсі. Люди впізнають тебе серед натовпу.",
    ru: "Асцендент в Водолее: ты немного странный — в хорошем смысле. Люди узнают тебя в толпе.",
    en: "Ascendant in Aquarius: a touch unusual — in a good way. People spot you in a crowd." },
  { uk: "Асцендент у Рибах: м'які контури, поетична присутність, ніби трохи в іншому світі. Люди тягнуться до тебе як до тиші.",
    ru: "Асцендент в Рыбах: мягкие контуры, поэтическое присутствие, словно немного в другом мире. Люди тянутся к тебе как к тишине.",
    en: "Ascendant in Pisces: soft contours, poetic presence, as if slightly elsewhere. People are drawn to you like quiet." },
];

// ─── MC in each sign (career / vocation) ────────────────────────────────
export const MC_IN_SIGN: Trio[] = [
  { uk: "МС в Овні: покликання — починати, очолювати, прокладати шлях.",
    ru: "МС в Овне: призвание — начинать, возглавлять, прокладывать путь.",
    en: "MC in Aries: vocation is to begin, lead, blaze a trail." },
  { uk: "МС у Тельці: покликання — створювати тривке, цінувати ресурс, бути майстром.",
    ru: "МС в Тельце: призвание — создавать долговечное, ценить ресурс, быть мастером.",
    en: "MC in Taurus: vocation is to create what lasts, to value resource, to be a master craftsman." },
  { uk: "МС у Близнюках: покликання — носити інформацію, навчати, з'єднувати людей словом.",
    ru: "МС в Близнецах: призвание — носить информацию, обучать, соединять людей словом.",
    en: "MC in Gemini: vocation is to carry information, teach, connect people through word." },
  { uk: "МС у Раку: покликання — піклуватися, створювати безпечні простори, лікувати корені.",
    ru: "МС в Раке: призвание — заботиться, создавать безопасные пространства, лечить корни.",
    en: "MC in Cancer: vocation is to nurture, create safe spaces, heal at the roots." },
  { uk: "МС у Леві: покликання — творити, сяяти, надихати своєю присутністю.",
    ru: "МС во Льве: призвание — творить, сиять, вдохновлять своим присутствием.",
    en: "MC in Leo: vocation is to create, to shine, to inspire by presence." },
  { uk: "МС у Діві: покликання — служити майстерністю, удосконалювати системи, доводити до досконалості.",
    ru: "МС в Деве: призвание — служить мастерством, совершенствовать системы, доводить до совершенства.",
    en: "MC in Virgo: vocation is to serve through mastery, refine systems, bring things to completion." },
  { uk: "МС у Терезах: покликання — створювати гармонію, бути посередником, нести красу.",
    ru: "МС в Весах: призвание — создавать гармонию, быть посредником, нести красоту.",
    en: "MC in Libra: vocation is to create harmony, mediate, carry beauty." },
  { uk: "МС у Скорпіоні: покликання — занурюватись у глибоке, працювати з тінню, трансформувати.",
    ru: "МС в Скорпионе: призвание — погружаться в глубокое, работать с тенью, трансформировать.",
    en: "MC in Scorpio: vocation is to dive deep, work with the shadow, transform." },
  { uk: "МС у Стрільці: покликання — вчити, мандрувати, нести сенс, бути голосом більшого.",
    ru: "МС в Стрельце: призвание — учить, путешествовать, нести смысл, быть голосом большего.",
    en: "MC in Sagittarius: vocation is to teach, travel, carry meaning, be a voice for something larger." },
  { uk: "МС у Козерозі: покликання — будувати структури, керувати, нести відповідальність як владу.",
    ru: "МС в Козероге: призвание — строить структуры, руководить, нести ответственность как власть.",
    en: "MC in Capricorn: vocation is to build structures, lead, carry responsibility as power." },
  { uk: "МС у Водолії: покликання — приносити майбутнє, оновлювати застаріле, працювати з громадою.",
    ru: "МС в Водолее: призвание — приносить будущее, обновлять устаревшее, работать с сообществом.",
    en: "MC in Aquarius: vocation is to bring the future, refresh the obsolete, work with the collective." },
  { uk: "МС у Рибах: покликання — нести зцілення, мистецтво, духовність — те, що неможливо виміряти.",
    ru: "МС в Рыбах: призвание — нести исцеление, искусство, духовность — то, что невозможно измерить.",
    en: "MC in Pisces: vocation is to bring healing, art, the spiritual — what cannot be measured." },
];

// ─── Aspect archetypes ──────────────────────────────────────────────────
type AspectKey = "conjunction" | "sextile" | "square" | "trine" | "opposition";

export const ASPECT_MEANING: Record<AspectKey, Trio> = {
  conjunction: {
    uk: "Зʼєднання: дві енергії злиті в одну, сильна тема, яка завжди увімкнена. Залежить від планет — може бути даром або тиском.",
    ru: "Соединение: две энергии слиты в одну, сильная тема, которая всегда включена. Зависит от планет — может быть даром или давлением.",
    en: "Conjunction: two energies fused into one, a strong always-on theme. Whether it's a gift or a pressure depends on the planets.",
  },
  sextile: {
    uk: "Секстиль: легка можливість, дві енергії підтримують одна одну, але треба зробити крок.",
    ru: "Секстиль: лёгкая возможность, две энергии поддерживают друг друга, но нужно сделать шаг.",
    en: "Sextile: an easy opening — two energies support each other, but you must take the step.",
  },
  square: {
    uk: "Квадрат: внутрішня напруга, що змушує рости. Дві енергії тиснуть одна на одну. Найбільший двигун розвитку.",
    ru: "Квадрат: внутреннее напряжение, заставляющее расти. Две энергии давят друг на друга. Главный двигатель развития.",
    en: "Square: internal tension that forces growth. Two energies press against each other. The strongest engine of development.",
  },
  trine: {
    uk: "Тригон: природна гармонія, дар, що дається без зусиль. Ризик: лінь — бо все саме собою.",
    ru: "Тригон: природная гармония, дар, дающийся без усилий. Риск: лень — потому что всё само собой.",
    en: "Trine: natural harmony, a gift that arrives without effort. The risk is complacency — because everything just flows.",
  },
  opposition: {
    uk: "Опозиція: дзеркало — те, що ти бачиш у іншому, насправді у тобі. Інтеграція приходить через стосунки.",
    ru: "Оппозиция: зеркало — то, что ты видишь в другом, на самом деле в тебе. Интеграция приходит через отношения.",
    en: "Opposition: a mirror — what you see in another is in you. Integration comes through relationship.",
  },
};

// ─── Helpers ────────────────────────────────────────────────────────────
export function meaningSun(signIdx: number, lang: "uk" | "ru" | "en"): string {
  return SUN_IN_SIGN[signIdx]?.[lang] ?? "";
}
export function meaningMoon(signIdx: number, lang: "uk" | "ru" | "en"): string {
  return MOON_IN_SIGN[signIdx]?.[lang] ?? "";
}
export function meaningAsc(signIdx: number, lang: "uk" | "ru" | "en"): string {
  return ASC_IN_SIGN[signIdx]?.[lang] ?? "";
}
export function meaningMc(signIdx: number, lang: "uk" | "ru" | "en"): string {
  return MC_IN_SIGN[signIdx]?.[lang] ?? "";
}
export function meaningAspect(kind: AspectKey, lang: "uk" | "ru" | "en"): string {
  return ASPECT_MEANING[kind]?.[lang] ?? "";
}
