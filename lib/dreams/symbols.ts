/**
 * Dream symbol dictionary.
 *
 * Single source of truth powering BOTH:
 *   1. The free tier of the Сонник tool (deterministic symbol detection +
 *      instant meanings before the AI synthesis loads / behind the gate).
 *   2. The SEO dream dictionary at /dreams/[symbol].
 *
 * Each symbol carries trilingual names, detection keyword stems (matched
 * against the dreamer's free text), three interpretation facets
 * (psychology / spiritual / folk), a positivity score (-2..+2 → tints the
 * "tone of the dream" meter) and the Jungian archetypes it evokes.
 *
 * Keywords are STEMS — we match by `includes` on a normalised string, so
 * "вовка", "вовком", "вовки" all hit the stem "вовк".
 */

export type Archetype =
  | "wanderer"   // Мандрівник
  | "sage"       // Мудрець
  | "creator"    // Творець
  | "healer"     // Цілитель
  | "guardian"   // Захисник
  | "seeker"     // Шукач
  | "shadow"     // Тінь
  | "lover"      // Коханець
  | "child"      // Дитина
  | "ruler";     // Володар

export const ARCHETYPE_LABELS: Record<Archetype, { uk: string; ru: string; en: string }> = {
  wanderer: { uk: "Мандрівник", ru: "Странник", en: "Wanderer" },
  sage:     { uk: "Мудрець", ru: "Мудрец", en: "Sage" },
  creator:  { uk: "Творець", ru: "Творец", en: "Creator" },
  healer:   { uk: "Цілитель", ru: "Целитель", en: "Healer" },
  guardian: { uk: "Захисник", ru: "Защитник", en: "Guardian" },
  seeker:   { uk: "Шукач", ru: "Искатель", en: "Seeker" },
  shadow:   { uk: "Тінь", ru: "Тень", en: "Shadow" },
  lover:    { uk: "Коханець", ru: "Любящий", en: "Lover" },
  child:    { uk: "Дитина", ru: "Дитя", en: "Child" },
  ruler:    { uk: "Володар", ru: "Правитель", en: "Ruler" },
};

export interface Tri { uk: string; ru: string; en: string }

export interface DreamSymbol {
  slug: string;            // URL slug, e.g. "wolf"
  emoji: string;
  name: Tri;
  /** Detection keyword stems per language (lowercase, no apostrophes). */
  keywords: { uk: string[]; ru: string[]; en: string[] };
  /** -2 anxious … 0 neutral … +2 inspiring. */
  positivity: number;
  archetypes: Archetype[];
  psychology: Tri;
  spiritual: Tri;
  folk: Tri;
}

export const DREAM_SYMBOLS: DreamSymbol[] = [
  {
    slug: "wolf", emoji: "🐺",
    name: { uk: "Вовк", ru: "Волк", en: "Wolf" },
    keywords: { uk: ["вовк", "вовч"], ru: ["волк", "волч"], en: ["wolf", "wolves"] },
    positivity: 0, archetypes: ["guardian", "shadow"],
    psychology: { uk: "Вовк уособлює вашу інстинктивну силу та незалежність — частину психіки, яку ви, можливо, стримуєте. Він кличе довіритися інтуїції.", ru: "Волк олицетворяет вашу инстинктивную силу и независимость — часть психики, которую вы, возможно, сдерживаете. Он зовёт довериться интуиции.", en: "The wolf embodies your instinctive power and independence — a part of the psyche you may be holding back. It calls you to trust your intuition." },
    spiritual: { uk: "Як духовний провідник вовк символізує вірність, захист роду та глибинну мудрість дикої природи.", ru: "Как духовный проводник волк символизирует верность, защиту рода и глубинную мудрость дикой природы.", en: "As a spirit guide the wolf symbolises loyalty, protection of one's kin, and the deep wisdom of the wild." },
    folk: { uk: "У народних сонниках білий вовк — добра звістка та надійний союзник; зграя вовків попереджає про оточення, де варто бути уважним.", ru: "В народных сонниках белый волк — добрая весть и надёжный союзник; стая волков предупреждает об окружении, где стоит быть внимательным.", en: "Folk dream-lore reads a white wolf as good news and a loyal ally; a pack warns you to watch your surroundings." },
  },
  {
    slug: "snake", emoji: "🐍",
    name: { uk: "Змія", ru: "Змея", en: "Snake" },
    keywords: { uk: ["змі", "гадюк", "вуж"], ru: ["змея", "змеи", "змей", "гадюк", "уж"], en: ["snake", "serpent", "viper"] },
    positivity: 0, archetypes: ["healer", "shadow"],
    psychology: { uk: "Змія — символ трансформації та зцілення (як на жезлі Асклепія). Вона вказує на процес скидання старого «я» заради оновлення.", ru: "Змея — символ трансформации и исцеления (как на жезле Асклепия). Она указывает на процесс сбрасывания старого «я» ради обновления.", en: "The snake is a symbol of transformation and healing (as on the rod of Asclepius). It points to shedding an old self for renewal." },
    spiritual: { uk: "Духовно змія — це кундаліні, життєва енергія, що пробуджується; знак глибинної мудрості та переродження.", ru: "Духовно змея — это кундалини, пробуждающаяся жизненная энергия; знак глубинной мудрости и перерождения.", en: "Spiritually the snake is kundalini — awakening life-force; a sign of deep wisdom and rebirth." },
    folk: { uk: "Народні трактування різні: змія може віщувати прихованого недоброзичливця або, навпаки, мудрість і несподіване багатство.", ru: "Народные трактовки разные: змея может предвещать скрытого недоброжелателя или, наоборот, мудрость и неожиданное богатство.", en: "Folk readings vary: a snake can foretell a hidden ill-wisher or, conversely, wisdom and unexpected wealth." },
  },
  {
    slug: "water", emoji: "💧",
    name: { uk: "Вода", ru: "Вода", en: "Water" },
    keywords: { uk: ["вод", "річк", "ріка", "потік", "джерел"], ru: ["вод", "река", "реки", "поток", "источник"], en: ["water", "river", "stream", "spring"] },
    positivity: 1, archetypes: ["healer", "seeker"],
    psychology: { uk: "Вода відображає світ ваших емоцій. Чиста вода — внутрішня ясність; каламутна чи бурхлива — почуття, які потребують уваги.", ru: "Вода отражает мир ваших эмоций. Чистая вода — внутренняя ясность; мутная или бурная — чувства, требующие внимания.", en: "Water mirrors your emotional world. Clear water means inner clarity; murky or turbulent water, feelings that need attention." },
    spiritual: { uk: "Вода — символ очищення, інтуїції та потоку життя; запрошення довіритися течії, а не боротися з нею.", ru: "Вода — символ очищения, интуиции и потока жизни; приглашение довериться течению, а не бороться с ним.", en: "Water is a symbol of cleansing, intuition and life's flow — an invitation to trust the current rather than fight it." },
    folk: { uk: "Чиста проточна вода у сні — на добро та здоров'я; стояча або брудна — застереження від тривог.", ru: "Чистая проточная вода во сне — к добру и здоровью; стоячая или грязная — предостережение от тревог.", en: "Clear running water bodes well and signals health; stagnant or dirty water is a caution against worry." },
  },
  {
    slug: "sea", emoji: "🌊",
    name: { uk: "Море", ru: "Море", en: "Sea" },
    keywords: { uk: ["мор", "океан", "хвил"], ru: ["море", "моря", "океан", "волн"], en: ["sea", "ocean", "wave"] },
    positivity: 1, archetypes: ["seeker", "wanderer"],
    psychology: { uk: "Море — це глибина підсвідомості. Спокійне море свідчить про емоційний баланс, шторм — про сильні переживання, що шукають виходу.", ru: "Море — это глубина подсознания. Спокойное море говорит об эмоциональном балансе, шторм — о сильных переживаниях, ищущих выхода.", en: "The sea is the depth of the unconscious. A calm sea speaks of emotional balance; a storm, of strong feelings seeking release." },
    spiritual: { uk: "Море уособлює нескінченність, божественне джерело та цикли життя — народження, розчинення, оновлення.", ru: "Море олицетворяет бесконечность, божественный источник и циклы жизни — рождение, растворение, обновление.", en: "The sea embodies the infinite, the divine source and life's cycles — birth, dissolution, renewal." },
    folk: { uk: "Спокійне море віщує вдалу подорож і добрі зміни; буремне — застерігає перечекати неспокійний період.", ru: "Спокойное море предвещает удачное путешествие и добрые перемены; бурное — советует переждать неспокойный период.", en: "A calm sea foretells a good journey and welcome change; a stormy one advises waiting out a turbulent spell." },
  },
  {
    slug: "cat", emoji: "🐈",
    name: { uk: "Кіт", ru: "Кошка", en: "Cat" },
    keywords: { uk: ["кіт", "кот", "кішк", "коти", "кошен"], ru: ["кот", "кошка", "кошки", "котёнок", "котенок"], en: ["cat", "kitten"] },
    positivity: 0, archetypes: ["seeker", "shadow"],
    psychology: { uk: "Кіт символізує незалежність, жіночу інтуїцію та потаємну частину вас. Він нагадує про потребу в особистому просторі.", ru: "Кошка символизирует независимость, женскую интуицию и потаённую часть вас. Она напоминает о потребности в личном пространстве.", en: "The cat symbolises independence, feminine intuition and a hidden part of you. It reminds you of a need for personal space." },
    spiritual: { uk: "Духовно кіт — охоронець між світами, провідник інтуїтивного знання та містичної чутливості.", ru: "Духовно кошка — страж между мирами, проводник интуитивного знания и мистической чувствительности.", en: "Spiritually the cat is a guardian between worlds, a guide to intuitive knowing and mystical sensitivity." },
    folk: { uk: "Ласкавий кіт — до приємних звісток; агресивний чи дряпається — до дрібних непорозумінь із близькими.", ru: "Ласковый кот — к приятным вестям; агрессивный или царапается — к мелким недоразумениям с близкими.", en: "An affectionate cat brings pleasant news; an aggressive or scratching one, small misunderstandings with loved ones." },
  },
  {
    slug: "dog", emoji: "🐕",
    name: { uk: "Собака", ru: "Собака", en: "Dog" },
    keywords: { uk: ["собак", "пес", "цуцен", "псин"], ru: ["собак", "пёс", "пес", "щенок"], en: ["dog", "puppy", "hound"] },
    positivity: 1, archetypes: ["guardian", "lover"],
    psychology: { uk: "Собака уособлює відданість, дружбу та вашу здатність любити безумовно. Вона відображає стан близьких стосунків.", ru: "Собака олицетворяет преданность, дружбу и вашу способность любить безусловно. Она отражает состояние близких отношений.", en: "The dog embodies loyalty, friendship and your capacity for unconditional love. It reflects the state of your close bonds." },
    spiritual: { uk: "Собака — вірний провідник і захисник душі, символ безумовної відданості та чистого серця.", ru: "Собака — верный проводник и защитник души, символ безусловной преданности и чистого сердца.", en: "The dog is a faithful guide and protector of the soul — a symbol of unconditional devotion and a pure heart." },
    folk: { uk: "Дружній собака — до вірного друга та підтримки; гавкіт — звістка, на яку варто зважити.", ru: "Дружелюбная собака — к верному другу и поддержке; лай — весть, к которой стоит прислушаться.", en: "A friendly dog points to a loyal friend and support; barking is news worth heeding." },
  },
  {
    slug: "fish", emoji: "🐟",
    name: { uk: "Риба", ru: "Рыба", en: "Fish" },
    keywords: { uk: ["риб"], ru: ["рыб"], en: ["fish"] },
    positivity: 1, archetypes: ["creator", "healer"],
    psychology: { uk: "Риба — символ ідей та можливостей, що визрівають у глибинах підсвідомості. Це знак родючості думки й нових починань.", ru: "Рыба — символ идей и возможностей, зреющих в глубинах подсознания. Это знак плодородия мысли и новых начинаний.", en: "Fish symbolise ideas and opportunities ripening in the depths of the unconscious — a sign of fertile thought and new beginnings." },
    spiritual: { uk: "Духовно риба пов'язана з достатком, віддачею Всесвіту та внутрішньою трансформацією.", ru: "Духовно рыба связана с изобилием, отдачей Вселенной и внутренней трансформацией.", en: "Spiritually the fish is tied to abundance, the universe's giving and inner transformation." },
    folk: { uk: "Жива риба у чистій воді — до прибутку та добрих новин; для жінки нерідко — до вагітності.", ru: "Живая рыба в чистой воде — к прибыли и добрым новостям; для женщины нередко — к беременности.", en: "Live fish in clear water foretells gain and good news; for a woman it often hints at pregnancy." },
  },
  {
    slug: "child", emoji: "🧒",
    name: { uk: "Дитина", ru: "Ребёнок", en: "Child" },
    keywords: { uk: ["дитин", "дитя", "немовл", "діт"], ru: ["ребён", "ребен", "дитя", "младен", "дет"], en: ["child", "baby", "infant", "kid"] },
    positivity: 1, archetypes: ["child", "creator"],
    psychology: { uk: "Дитина уособлює вашу внутрішню дитину, новий етап чи проєкт, що потребує турботи. Це символ невинності та потенціалу.", ru: "Ребёнок олицетворяет вашего внутреннего ребёнка, новый этап или проект, требующий заботы. Это символ невинности и потенциала.", en: "A child embodies your inner child, a new stage or project that needs care — a symbol of innocence and potential." },
    spiritual: { uk: "Дитина — символ чистої душі, нового циклу та божественного потенціалу, що тільки народжується.", ru: "Ребёнок — символ чистой души, нового цикла и божественного потенциала, который только рождается.", en: "The child is a symbol of a pure soul, a new cycle and a divine potential just being born." },
    folk: { uk: "Здорова дитина у сні — до радості та добрих змін; плач дитини — до дрібних клопотів.", ru: "Здоровый ребёнок во сне — к радости и добрым переменам; плач ребёнка — к мелким хлопотам.", en: "A healthy child brings joy and good change; a crying child, small troubles." },
  },
  {
    slug: "pregnancy", emoji: "🤰",
    name: { uk: "Вагітність", ru: "Беременность", en: "Pregnancy" },
    keywords: { uk: ["вагітн", "вагітність"], ru: ["беремен"], en: ["pregnan", "pregnancy"] },
    positivity: 2, archetypes: ["creator", "child"],
    psychology: { uk: "Вагітність у сні рідко про буквальну вагітність — це символ задуму, що визріває: ідеї, таланту чи нової версії себе.", ru: "Беременность во сне редко о буквальной беременности — это символ замысла, который зреет: идеи, таланта или новой версии себя.", en: "Pregnancy in a dream is rarely literal — it symbolises something gestating: an idea, a talent, or a new version of yourself." },
    spiritual: { uk: "Це знак творчого зачаття, періоду виношування мрії перед її втіленням у світ.", ru: "Это знак творческого зачатия, периода вынашивания мечты перед её воплощением в мир.", en: "It is a sign of creative conception — a period of carrying a dream before bringing it into the world." },
    folk: { uk: "Вагітність часто віщує добрі новини, прибуток або довгоочікуваний початок чогось важливого.", ru: "Беременность часто предвещает добрые новости, прибыль или долгожданное начало чего-то важного.", en: "Pregnancy often foretells good news, gain, or a long-awaited start of something important." },
  },
  {
    slug: "teeth", emoji: "🦷",
    name: { uk: "Зуби", ru: "Зубы", en: "Teeth" },
    keywords: { uk: ["зуб"], ru: ["зуб"], en: ["teeth", "tooth"] },
    positivity: -1, archetypes: ["shadow", "guardian"],
    psychology: { uk: "Випадіння зубів — один з найпоширеніших снів. Зазвичай він відображає тривогу, страх втрати контролю або занепокоєння через зміни та самооцінку.", ru: "Выпадение зубов — один из самых частых снов. Обычно он отражает тревогу, страх потери контроля или беспокойство из-за перемен и самооценки.", en: "Losing teeth is one of the most common dreams. It usually reflects anxiety, fear of losing control, or worry about change and self-image." },
    spiritual: { uk: "Духовно це може означати завершення старого циклу та потребу відпустити те, що віджило.", ru: "Духовно это может означать завершение старого цикла и потребность отпустить отжившее.", en: "Spiritually it can mean the close of an old cycle and a need to release what has outlived its time." },
    folk: { uk: "У народних сонниках випадіння зубів без крові пов'язують з турботами; із кров'ю — застереження щодо рідних. Сприймайте це лише як символ, не як прогноз.", ru: "В народных сонниках выпадение зубов без крови связывают с хлопотами; с кровью — предостережение о родных. Воспринимайте это лишь как символ, не как прогноз.", en: "Folklore links bloodless tooth loss with worries and bloody loss with concern for relatives. Treat this only as a symbol, not a prediction." },
  },
  {
    slug: "money", emoji: "💰",
    name: { uk: "Гроші", ru: "Деньги", en: "Money" },
    keywords: { uk: ["грош", "монет", "купюр", "гаман"], ru: ["деньг", "монет", "купюр", "кошелёк", "кошелек"], en: ["money", "coin", "cash", "wallet"] },
    positivity: 1, archetypes: ["ruler", "seeker"],
    psychology: { uk: "Гроші у сні відображають вашу самоцінність, енергію та відчуття власних ресурсів — не лише фінанси, а й внутрішню силу.", ru: "Деньги во сне отражают вашу самоценность, энергию и ощущение собственных ресурсов — не только финансы, но и внутреннюю силу.", en: "Money in a dream reflects your self-worth, energy and sense of your own resources — not just finances but inner power." },
    spiritual: { uk: "Гроші — символ обміну енергією зі світом і вашої відкритості приймати достаток.", ru: "Деньги — символ обмена энергией с миром и вашей открытости принимать изобилие.", en: "Money is a symbol of energy exchange with the world and your openness to receive abundance." },
    folk: { uk: "Знаходити гроші — несподівані можливості; втрачати — застереження берегти ресурси та сили.", ru: "Находить деньги — неожиданные возможности; терять — предостережение беречь ресурсы и силы.", en: "Finding money points to unexpected opportunities; losing it cautions you to guard your resources and energy." },
  },
  {
    slug: "deceased", emoji: "🕊️",
    name: { uk: "Померлі родичі", ru: "Умершие родственники", en: "Deceased relatives" },
    keywords: { uk: ["померл", "покійн", "небіжч", "мертв"], ru: ["умерш", "покойн", "мёртв", "мертв"], en: ["deceased", "dead relative", "late mother", "late father"] },
    positivity: 0, archetypes: ["sage", "healer"],
    psychology: { uk: "Сни про померлих рідних — це робота психіки з пам'яттю, любов'ю та незавершеними почуттями. Часто вони приносять зцілення та прийняття.", ru: "Сны об умерших родных — это работа психики с памятью, любовью и незавершёнными чувствами. Часто они приносят исцеление и принятие.", en: "Dreams of deceased relatives are the psyche working through memory, love and unfinished feelings. They often bring healing and acceptance." },
    spiritual: { uk: "Багато традицій бачать у таких снах послання підтримки, благословення чи нагадування від роду.", ru: "Многие традиции видят в таких снах послание поддержки, благословения или напоминания от рода.", en: "Many traditions see such dreams as a message of support, blessing or a reminder from one's lineage." },
    folk: { uk: "Народні трактування: спокійна розмова з покійним — на добро та душевний спокій; прохання чогось — нагадування згадати й вшанувати.", ru: "Народные трактовки: спокойный разговор с покойным — к добру и душевному покою; просьба чего-либо — напоминание вспомнить и почтить.", en: "Folk lore: a calm talk with the departed bodes peace; a request from them is a reminder to remember and honour." },
  },
  {
    slug: "house", emoji: "🏠",
    name: { uk: "Будинок", ru: "Дом", en: "House" },
    keywords: { uk: ["будинок", "будівл", "дім", "хата", "кімнат"], ru: ["дом", "дома", "здани", "комнат"], en: ["house", "home", "room", "building"] },
    positivity: 1, archetypes: ["guardian", "ruler"],
    psychology: { uk: "Будинок — це образ вашого «я». Кімнати — різні грані особистості; нові кімнати — невідкритий потенціал; підвал — підсвідоме.", ru: "Дом — это образ вашего «я». Комнаты — разные грани личности; новые комнаты — нераскрытый потенциал; подвал — подсознательное.", en: "A house is an image of the self. Rooms are facets of your personality; new rooms, untapped potential; the basement, the unconscious." },
    spiritual: { uk: "Будинок символізує душу та її стан: міцні стіни — внутрішня опора, руїни — потребу в зціленні.", ru: "Дом символизирует душу и её состояние: крепкие стены — внутренняя опора, руины — потребность в исцелении.", en: "The house symbolises the soul and its state: solid walls mean inner support; ruins, a need for healing." },
    folk: { uk: "Новий світлий будинок — до добробуту та змін на краще; покинутий — до ностальгії чи потреби оновлення.", ru: "Новый светлый дом — к благополучию и переменам к лучшему; заброшенный — к ностальгии или потребности обновления.", en: "A new bright house bodes well-being and change for the better; an abandoned one, nostalgia or a need for renewal." },
  },
  {
    slug: "fire", emoji: "🔥",
    name: { uk: "Пожежа", ru: "Пожар", en: "Fire" },
    keywords: { uk: ["пожеж", "вогон", "вогн", "полум", "горі"], ru: ["пожар", "огон", "огн", "пламя", "гори"], en: ["fire", "flame", "blaze", "burning"] },
    positivity: 0, archetypes: ["creator", "shadow"],
    psychology: { uk: "Вогонь — це пристрасть, гнів і трансформація. Контрольоване полум'я — натхнення та енергія; пожежа — почуття, що вийшли з-під контролю.", ru: "Огонь — это страсть, гнев и трансформация. Контролируемое пламя — вдохновение и энергия; пожар — чувства, вышедшие из-под контроля.", en: "Fire is passion, anger and transformation. A controlled flame is inspiration and energy; a wildfire, feelings out of control." },
    spiritual: { uk: "Вогонь очищує та оновлює — символ духовного перетворення й спалювання застарілого.", ru: "Огонь очищает и обновляет — символ духовного преображения и сжигания отжившего.", en: "Fire purifies and renews — a symbol of spiritual transformation and burning away the old." },
    folk: { uk: "Рівне тепле полум'я — до достатку та тепла в домі; руйнівна пожежа — застереження про сильні емоції чи зміни.", ru: "Ровное тёплое пламя — к достатку и теплу в доме; разрушительный пожар — предостережение о сильных эмоциях или переменах.", en: "A steady warm flame bodes plenty and warmth at home; a destructive fire warns of intense emotion or upheaval." },
  },
  {
    slug: "flying", emoji: "🕊️",
    name: { uk: "Політ", ru: "Полёт", en: "Flying" },
    keywords: { uk: ["літа", "політ", "лечу", "летіл", "ширя"], ru: ["лета", "полёт", "полет", "лечу", "летел", "паря"], en: ["flying", "flight", "soaring"] },
    positivity: 2, archetypes: ["wanderer", "seeker"],
    psychology: { uk: "Політ уособлює свободу, амбіції та бажання піднятися над обставинами. Це знак віри у власні сили.", ru: "Полёт олицетворяет свободу, амбиции и желание подняться над обстоятельствами. Это знак веры в собственные силы.", en: "Flying embodies freedom, ambition and a wish to rise above circumstances — a sign of faith in your own powers." },
    spiritual: { uk: "Духовно політ — звільнення душі, розширення свідомості та зв'язок із вищим.", ru: "Духовно полёт — освобождение души, расширение сознания и связь с высшим.", en: "Spiritually flight is the soul's liberation, an expansion of awareness and connection with the higher." },
    folk: { uk: "Легкий політ — до успіху та зростання; падіння під час польоту — страх втратити досягнуте.", ru: "Лёгкий полёт — к успеху и росту; падение во время полёта — страх потерять достигнутое.", en: "Effortless flight bodes success and growth; falling mid-flight reflects a fear of losing what you've gained." },
  },
  {
    slug: "falling", emoji: "🌀",
    name: { uk: "Падіння", ru: "Падение", en: "Falling" },
    keywords: { uk: ["падін", "падаю", "падал", "зриваюс", "прірв"], ru: ["паден", "падаю", "падал", "срыва", "пропаст"], en: ["falling", "fall down", "plummet"] },
    positivity: -1, archetypes: ["shadow", "seeker"],
    psychology: { uk: "Падіння відображає відчуття втрати контролю, невпевненості чи страху невдачі. Це запрошення повернути собі опору.", ru: "Падение отражает ощущение потери контроля, неуверенности или страха неудачи. Это приглашение вернуть себе опору.", en: "Falling reflects a sense of losing control, insecurity or fear of failure — an invitation to regain your footing." },
    spiritual: { uk: "Падіння може означати відпускання — довіру процесу та готовність дозволити старому піти.", ru: "Падение может означать отпускание — доверие процессу и готовность позволить старому уйти.", en: "Falling can mean letting go — trusting the process and allowing the old to depart." },
    folk: { uk: "Падіння у сні традиційно пов'язують із турботами, що минають; прокинутися до удару — добрий знак подолання.", ru: "Падение во сне традиционно связывают с заботами, которые проходят; проснуться до удара — добрый знак преодоления.", en: "Folklore ties falling to passing worries; waking before impact is a good sign of overcoming." },
  },
  {
    slug: "moon", emoji: "🌕",
    name: { uk: "Місяць", ru: "Луна", en: "Moon" },
    keywords: { uk: ["місяц", "місяць"], ru: ["луна", "луны", "месяц"], en: ["moon", "lunar"] },
    positivity: 1, archetypes: ["sage", "seeker"],
    psychology: { uk: "Місяць — символ інтуїції, циклів та прихованих емоцій. Він кличе прислухатися до внутрішнього голосу.", ru: "Луна — символ интуиции, циклов и скрытых эмоций. Она зовёт прислушаться к внутреннему голосу.", en: "The moon symbolises intuition, cycles and hidden emotions — calling you to heed your inner voice." },
    spiritual: { uk: "Місяць уособлює жіноче начало, таємницю та духовне світло, що сяє навіть у темряві.", ru: "Луна олицетворяет женское начало, тайну и духовный свет, сияющий даже во тьме.", en: "The moon embodies the feminine, mystery and a spiritual light that shines even in darkness." },
    folk: { uk: "Повний місяць у сні — до завершення справи; молодий — до нового початку.", ru: "Полная луна во сне — к завершению дела; молодой месяц — к новому началу.", en: "A full moon bodes a matter completed; a new moon, a fresh start." },
  },
  {
    slug: "car", emoji: "🚗",
    name: { uk: "Автомобіль", ru: "Автомобиль", en: "Car" },
    keywords: { uk: ["автомобіл", "машин", "авто", "кермо"], ru: ["автомобил", "машин", "авто", "руль"], en: ["car", "vehicle", "driving"] },
    positivity: 0, archetypes: ["ruler", "wanderer"],
    psychology: { uk: "Автомобіль — це ваш життєвий шлях і відчуття контролю над ним. Хто за кермом — той, хто керує вашим життям зараз.", ru: "Автомобиль — это ваш жизненный путь и ощущение контроля над ним. Кто за рулём — тот, кто управляет вашей жизнью сейчас.", en: "A car is your life's path and your sense of control over it. Who's at the wheel is who's steering your life right now." },
    spiritual: { uk: "Авто символізує рух уперед та особисту волю; зупинка — потребу переосмислити напрям.", ru: "Авто символизирует движение вперёд и личную волю; остановка — потребность переосмыслить направление.", en: "A car symbolises forward motion and personal will; a breakdown, a need to rethink direction." },
    folk: { uk: "Впевнена їзда — до успіху в справах; аварія чи поломка — застереження уповільнитися.", ru: "Уверенная езда — к успеху в делах; авария или поломка — предостережение замедлиться.", en: "Confident driving bodes success; a crash or breakdown warns you to slow down." },
  },
  {
    slug: "airplane", emoji: "✈️",
    name: { uk: "Літак", ru: "Самолёт", en: "Airplane" },
    keywords: { uk: ["літак", "літака", "аеропорт"], ru: ["самолёт", "самолет", "аэропорт"], en: ["airplane", "plane", "airport", "flight"] },
    positivity: 1, archetypes: ["wanderer", "seeker"],
    psychology: { uk: "Літак уособлює великі амбіції, швидкі зміни та перехід на новий рівень. Це знак готовності до стрибка.", ru: "Самолёт олицетворяет большие амбиции, быстрые перемены и переход на новый уровень. Это знак готовности к скачку.", en: "An airplane embodies big ambitions, rapid change and a leap to a new level — a sign you're ready for the jump." },
    spiritual: { uk: "Політ літаком — піднесення над буденністю, ширший погляд на власне життя.", ru: "Полёт на самолёте — возвышение над обыденностью, более широкий взгляд на собственную жизнь.", en: "Air travel is a rising above the everyday — a wider view of your own life." },
    folk: { uk: "Вдалий зліт — до здійснення планів; затримка рейсу — до відтермінування, яке варто прийняти спокійно.", ru: "Удачный взлёт — к осуществлению планов; задержка рейса — к отсрочке, которую стоит принять спокойно.", en: "A smooth take-off bodes plans realised; a delayed flight, a postponement best met with calm." },
  },
  {
    slug: "wedding", emoji: "💍",
    name: { uk: "Весілля", ru: "Свадьба", en: "Wedding" },
    keywords: { uk: ["весіл", "наречен", "шлюб"], ru: ["свадьб", "невест", "жених", "брак"], en: ["wedding", "bride", "groom", "marriage"] },
    positivity: 1, archetypes: ["lover", "ruler"],
    psychology: { uk: "Весілля символізує союз протилежностей усередині вас — поєднання розуму й почуттів, чоловічого й жіночого начал.", ru: "Свадьба символизирует союз противоположностей внутри вас — соединение ума и чувств, мужского и женского начал.", en: "A wedding symbolises the union of opposites within you — joining mind and feeling, the masculine and feminine." },
    spiritual: { uk: "Весілля — священний союз, символ цілісності та внутрішньої гармонії.", ru: "Свадьба — священный союз, символ целостности и внутренней гармонии.", en: "A wedding is a sacred union — a symbol of wholeness and inner harmony." },
    folk: { uk: "Радісне весілля — до приємних змін; тривожне — нагадування про важливе рішення, яке визріває.", ru: "Радостная свадьба — к приятным переменам; тревожная — напоминание о важном решении, которое зреет.", en: "A joyful wedding bodes pleasant change; an anxious one, a reminder of a big decision ripening." },
  },
  {
    slug: "rain", emoji: "🌧️",
    name: { uk: "Дощ", ru: "Дождь", en: "Rain" },
    keywords: { uk: ["дощ", "злив"], ru: ["дождь", "дожд", "ливень"], en: ["rain", "downpour"] },
    positivity: 1, archetypes: ["healer", "creator"],
    psychology: { uk: "Дощ — це емоційне очищення та вивільнення накопиченого. Часто він приносить полегшення після внутрішньої напруги.", ru: "Дождь — это эмоциональное очищение и высвобождение накопленного. Часто он приносит облегчение после внутреннего напряжения.", en: "Rain is emotional cleansing and release of what's built up — often it brings relief after inner tension." },
    spiritual: { uk: "Дощ символізує благодать, родючість і оновлення; небеса дарують те, що живить.", ru: "Дождь символизирует благодать, плодородие и обновление; небеса дарят то, что питает.", en: "Rain symbolises grace, fertility and renewal — the heavens giving what nourishes." },
    folk: { uk: "Теплий дощ — до достатку та добрих новин; холодна злива — до короткого смутку, що минеться.", ru: "Тёплый дождь — к достатку и добрым новостям; холодный ливень — к короткой грусти, что пройдёт.", en: "Warm rain bodes plenty and good news; a cold downpour, a brief sadness that passes." },
  },
  {
    slug: "tree", emoji: "🌳",
    name: { uk: "Дерево", ru: "Дерево", en: "Tree" },
    keywords: { uk: ["дерев", "ліс", "гілл", "корін"], ru: ["дерев", "лес", "ветв", "корн"], en: ["tree", "forest", "branch", "roots"] },
    positivity: 1, archetypes: ["sage", "guardian"],
    psychology: { uk: "Дерево уособлює ваш ріст, коріння та зв'язок із родом. Міцне дерево — стабільність; засохле — потребу в оновленні.", ru: "Дерево олицетворяет ваш рост, корни и связь с родом. Крепкое дерево — стабильность; засохшее — потребность в обновлении.", en: "A tree embodies your growth, roots and ties to your lineage. A strong tree means stability; a withered one, a need for renewal." },
    spiritual: { uk: "Дерево життя поєднує землю й небо — символ мудрості, циклів та духовного зростання.", ru: "Древо жизни соединяет землю и небо — символ мудрости, циклов и духовного роста.", en: "The tree of life joins earth and sky — a symbol of wisdom, cycles and spiritual growth." },
    folk: { uk: "Квітуче дерево — до радості та плодів зусиль; зрубане — застереження берегти важливе.", ru: "Цветущее дерево — к радости и плодам усилий; срубленное — предостережение беречь важное.", en: "A blossoming tree bodes joy and the fruits of effort; a felled one cautions you to protect what matters." },
  },
  {
    slug: "bird", emoji: "🕊️",
    name: { uk: "Птахи", ru: "Птицы", en: "Birds" },
    keywords: { uk: ["птах", "птиц", "голуб", "ворон", "орел"], ru: ["птиц", "птах", "голуб", "ворон", "орёл", "орел"], en: ["bird", "birds", "dove", "raven", "eagle"] },
    positivity: 1, archetypes: ["wanderer", "sage"],
    psychology: { uk: "Птахи символізують ваші думки, надії та прагнення до свободи. Зграя — соціальні зв'язки; самотній птах — потребу в незалежності.", ru: "Птицы символизируют ваши мысли, надежды и стремление к свободе. Стая — социальные связи; одинокая птица — потребность в независимости.", en: "Birds symbolise your thoughts, hopes and longing for freedom. A flock means social ties; a lone bird, a need for independence." },
    spiritual: { uk: "Птахи — посланці між світами, символ душі та духовних звісток.", ru: "Птицы — посланники между мирами, символ души и духовных вестей.", en: "Birds are messengers between worlds — a symbol of the soul and spiritual tidings." },
    folk: { uk: "Птахи, що співають, — до добрих новин; чорний птах — до звістки, яку варто спокійно осмислити.", ru: "Поющие птицы — к добрым новостям; чёрная птица — к вести, которую стоит спокойно осмыслить.", en: "Singing birds bode good news; a black bird, tidings worth calmly considering." },
  },
];

/** Quick lookup by slug. */
export const SYMBOL_BY_SLUG: Record<string, DreamSymbol> = Object.fromEntries(
  DREAM_SYMBOLS.map((s) => [s.slug, s]),
);

export function symbolName(s: DreamSymbol, lang: "uk" | "ru" | "en"): string {
  return s.name[lang];
}
