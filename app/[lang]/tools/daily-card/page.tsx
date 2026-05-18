"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import AnimatedSection from "@/components/ui/AnimatedSection";
import GoldDivider from "@/components/ui/GoldDivider";
import { useLanguage } from "@/hooks/useLanguage";

const MAJOR_ARCANA_UK = [
  {
    num: "0",
    name: "Блазень",
    keyword: "Початок",
    meaning: "Ви стоїте на порозі нового досвіду. Відпустіть страх невідомого та зробіть крок вперед з відкритим серцем.",
    advice: "Дозвольте собі бути легким. Сьогодні — день для сміливих та спонтанних рішень.",
    affirmation: "Я довіряю шляху, що розгортається переді мною.",
  },
  {
    num: "I",
    name: "Маг",
    keyword: "Воля",
    meaning: "Усі ресурси, необхідні вам, вже є у вашому розпорядженні. Настав час діяти з намірами та впевненістю.",
    advice: "Сфокусуйтесь на одній меті та направте всю свою енергію на неї.",
    affirmation: "Я маю силу творити свою реальність.",
  },
  {
    num: "II",
    name: "Верховна Жриця",
    keyword: "Інтуїція",
    meaning: "Сьогодні ваша інтуїція особливо загострена. Довіряйте внутрішньому голосу більше, ніж зовнішнім порадам.",
    advice: "Зробіть паузу та прислухайтесь до себе. Відповідь вже є всередині вас.",
    affirmation: "Я довіряю мудрості свого серця.",
  },
  {
    num: "III",
    name: "Імператриця",
    keyword: "Рясність",
    meaning: "День сповнений творчою енергією та родючістю. Піклуйтесь про себе та тих, кого любите.",
    advice: "Оточіть себе красою. Приготуйте щось смачне, доглядайте за собою, розкрийте творчість.",
    affirmation: "Я приймаю ласку та рясність у своє життя.",
  },
  {
    num: "IV",
    name: "Імператор",
    keyword: "Структура",
    meaning: "Час встановити порядок та взяти відповідальність. Структура — це не обмеження, а основа для зростання.",
    advice: "Сплануйте свій день, встановіть межі та дійте з рішучістю.",
    affirmation: "Я відповідаю за своє життя та свої вибори.",
  },
  {
    num: "V",
    name: "Ієрофант",
    keyword: "Традиція",
    meaning: "Зверніться до перевіреної мудрості та традицій. Можливо, варто поговорити з досвідченим наставником.",
    advice: "Поважайте встановлені правила там, де вони служать добру. Шукайте мудрість у спільноті.",
    affirmation: "Я відкрита до мудрості інших та традиційних знань.",
  },
  {
    num: "VI",
    name: "Закохані",
    keyword: "Вибір",
    meaning: "Перед вами стоїть важливий вибір серця. Дотримуйтесь своїх найглибших цінностей, а не тимчасових бажань.",
    advice: "Перш ніж вирішити — запитайте себе: що справді важливо для мене?",
    affirmation: "Мої серцеві рішення несуть мені до справжнього щастя.",
  },
  {
    num: "VII",
    name: "Колісниця",
    keyword: "Перемога",
    meaning: "День вимагає дисципліни та цілеспрямованості. Зосередьтесь на меті та рухайтесь уперед, попри перешкоди.",
    advice: "Не дозволяйте суперечливим емоціям збити вас з курсу. Ваша воля — найсильніший ваш ресурс.",
    affirmation: "Я контролюю свій шлях та рухаюся до перемоги.",
  },
  {
    num: "VIII",
    name: "Сила",
    keyword: "Мужність",
    meaning: "Справжня сила — це ніжність, а не грубість. Сьогодні ви здатні подолати будь-що з любов'ю та терпінням.",
    advice: "Підійдіть до складної ситуації з м'якістю та розумінням замість конфронтації.",
    affirmation: "Я сильна і ніжна одночасно.",
  },
  {
    num: "IX",
    name: "Відлюдник",
    keyword: "Самопізнання",
    meaning: "День для інтроспекції та тиші. Відсторонення від метушні відкриє вам важливі відповіді.",
    advice: "Проведіть час на самоті. Медитуйте, пишіть у щоденник або просто побудьте у тиші.",
    affirmation: "У тиші я знаходжу свою внутрішню мудрість.",
  },
  {
    num: "X",
    name: "Колесо Фортуни",
    keyword: "Цикл",
    meaning: "Все змінюється. Якщо зараз важко — це пройде. Якщо добре — насолоджуйтесь та будьте вдячні.",
    advice: "Прийміть циклічність життя. Відпустіть те, що поза вашим контролем.",
    affirmation: "Я довіряю ритму та циклам свого життя.",
  },
  {
    num: "XI",
    name: "Справедливість",
    keyword: "Баланс",
    meaning: "Сьогодні особливо важлива чесність — із собою та іншими. Ваші вчинки матимуть наслідки.",
    advice: "Прийміть рішення, яке є справедливим для всіх сторін, включно з вами.",
    affirmation: "Я дію чесно та отримую справедливий результат.",
  },
  {
    num: "XII",
    name: "Повішений",
    keyword: "Пауза",
    meaning: "Іноді найкраща дія — це нічого не робити. Переосмисліть ситуацію під іншим кутом.",
    advice: "Зупиніться. Подивіться на ситуацію з нової перспективи. Не поспішайте з рішенням.",
    affirmation: "У паузі я знаходжу нові можливості.",
  },
  {
    num: "XIII",
    name: "Смерть",
    keyword: "Трансформація",
    meaning: "Це карта перетворення, а не кінця. Щось завершується, щоб звільнити місце для нового.",
    advice: "Відпустіть те, що вже відслужило своє. Трансформація — це дар.",
    affirmation: "Я відпускаю старе і відкриваюся новому з вдячністю.",
  },
  {
    num: "XIV",
    name: "Поміркованість",
    keyword: "Рівновага",
    meaning: "День для помірності та рівноваги. Знайдіть золоту середину між крайнощами.",
    advice: "Не поспішайте. Змішуйте протилежності з терпінням та майстерністю.",
    affirmation: "Я знаходжу баланс у всіх сферах свого життя.",
  },
  {
    num: "XV",
    name: "Диявол",
    keyword: "Свобода",
    meaning: "Які ланцюги тримають вас? Страх, звичка, залежність — все це можна відпустити.",
    advice: "Подивіться чесно на те, що вас обмежує. Усвідомлення — перший крок до свободи.",
    affirmation: "Я вільна від усього, що більше мені не служить.",
  },
  {
    num: "XVI",
    name: "Вежа",
    keyword: "Одкровення",
    meaning: "Можливо, щось руйнується. Але те, що справжнє — витримає. Решта мала зникнути.",
    advice: "Не чіпляйтесь за те, що розвалюється. Це звільняє місце для кращого.",
    affirmation: "Я стійка навіть коли навколо змінюється.",
  },
  {
    num: "XVII",
    name: "Зірка",
    keyword: "Надія",
    meaning: "Після бурі — ясне небо. Сьогодні — час відновлення, натхнення та надії.",
    advice: "Дозвольте собі мріяти. Ваші бажання мають право на існування.",
    affirmation: "Я вірю у прекрасне майбутнє, що мене чекає.",
  },
  {
    num: "XVIII",
    name: "Місяць",
    keyword: "Ілюзія",
    meaning: "Не все є таким, яким здається. Перевірте свої припущення та страхи перед тим, як діяти.",
    advice: "Зачекайте з важливими рішеннями. Ситуація ще не прояснилась повністю.",
    affirmation: "Я бачу реальність такою, якою вона є, без ілюзій.",
  },
  {
    num: "XIX",
    name: "Сонце",
    keyword: "Радість",
    meaning: "Чудовий день! Ваша енергія висока, ви випромінюєте тепло та привертаєте позитив.",
    advice: "Виходьте назовні, спілкуйтесь, святкуйте. Дозвольте собі бути щасливою.",
    affirmation: "Моє серце відкрите для радості та любові.",
  },
  {
    num: "XX",
    name: "Суд",
    keyword: "Відродження",
    meaning: "Чуєте внутрішній поклик до змін. Прийшов час відповісти на важливе покликання.",
    advice: "Прислухайтесь до того, що кличе вас зсередини. Не ігноруйте поклик душі.",
    affirmation: "Я відповідаю на справжнє покликання свого серця.",
  },
  {
    num: "XXI",
    name: "Світ",
    keyword: "Завершення",
    meaning: "Цикл завершено. Насолоджуйтесь відчуттям досягнення та готуйтесь до наступного рівня.",
    advice: "Відзначте свої успіхи. Ви досягли чогось важливого — визнайте це.",
    affirmation: "Я повна та цілісна. Все складається ідеально.",
  },
];

const MAJOR_ARCANA_EN = [
  {
    num: "0",
    name: "The Fool",
    keyword: "Beginning",
    meaning: "You stand on the threshold of a new experience. Release your fear of the unknown and step forward with an open heart.",
    advice: "Allow yourself to be light and free. Today is a day for bold, spontaneous decisions.",
    affirmation: "I trust the path that unfolds before me.",
  },
  {
    num: "I",
    name: "The Magician",
    keyword: "Will",
    meaning: "All the resources you need are already at your disposal. The time has come to act with intention and confidence.",
    advice: "Focus on one goal and channel all your energy toward it.",
    affirmation: "I have the power to create my own reality.",
  },
  {
    num: "II",
    name: "The High Priestess",
    keyword: "Intuition",
    meaning: "Today your intuition is especially sharp. Trust your inner voice more than external advice.",
    advice: "Pause and listen to yourself. The answer is already within you.",
    affirmation: "I trust the wisdom of my heart.",
  },
  {
    num: "III",
    name: "The Empress",
    keyword: "Abundance",
    meaning: "The day is filled with creative energy and fertility. Nurture yourself and those you love.",
    advice: "Surround yourself with beauty. Cook something delicious, care for yourself, unleash your creativity.",
    affirmation: "I welcome grace and abundance into my life.",
  },
  {
    num: "IV",
    name: "The Emperor",
    keyword: "Structure",
    meaning: "It is time to establish order and take responsibility. Structure is not a limitation — it is the foundation for growth.",
    advice: "Plan your day, set boundaries, and act with resolve.",
    affirmation: "I am responsible for my life and my choices.",
  },
  {
    num: "V",
    name: "The Hierophant",
    keyword: "Tradition",
    meaning: "Turn to tried and tested wisdom and tradition. It may be worth speaking with an experienced mentor.",
    advice: "Respect established rules where they serve the greater good. Seek wisdom within your community.",
    affirmation: "I am open to the wisdom of others and traditional knowledge.",
  },
  {
    num: "VI",
    name: "The Lovers",
    keyword: "Choice",
    meaning: "An important choice of the heart stands before you. Stay true to your deepest values rather than temporary desires.",
    advice: "Before deciding, ask yourself: what truly matters to me?",
    affirmation: "My heart's decisions lead me toward genuine happiness.",
  },
  {
    num: "VII",
    name: "The Chariot",
    keyword: "Victory",
    meaning: "The day calls for discipline and focus. Concentrate on your goal and move forward despite obstacles.",
    advice: "Do not let conflicting emotions throw you off course. Your willpower is your greatest resource.",
    affirmation: "I am in control of my path and moving toward victory.",
  },
  {
    num: "VIII",
    name: "Strength",
    keyword: "Courage",
    meaning: "True strength is gentleness, not force. Today you are capable of overcoming anything with love and patience.",
    advice: "Approach a difficult situation with softness and understanding rather than confrontation.",
    affirmation: "I am both strong and tender at the same time.",
  },
  {
    num: "IX",
    name: "The Hermit",
    keyword: "Self-knowledge",
    meaning: "A day for introspection and stillness. Withdrawing from the noise will reveal important answers.",
    advice: "Spend time alone. Meditate, journal, or simply sit in silence.",
    affirmation: "In stillness, I find my inner wisdom.",
  },
  {
    num: "X",
    name: "Wheel of Fortune",
    keyword: "Cycle",
    meaning: "Everything changes. If times are hard now — they will pass. If things are good — enjoy and be grateful.",
    advice: "Accept the cyclical nature of life. Release what is beyond your control.",
    affirmation: "I trust the rhythm and cycles of my life.",
  },
  {
    num: "XI",
    name: "Justice",
    keyword: "Balance",
    meaning: "Honesty is especially important today — with yourself and with others. Your actions will have consequences.",
    advice: "Make a decision that is fair to all parties, including yourself.",
    affirmation: "I act with integrity and receive a fair outcome.",
  },
  {
    num: "XII",
    name: "The Hanged Man",
    keyword: "Pause",
    meaning: "Sometimes the best action is to do nothing. Reconsider the situation from a different angle.",
    advice: "Stop. Look at the situation from a new perspective. Do not rush a decision.",
    affirmation: "In the pause, I discover new possibilities.",
  },
  {
    num: "XIII",
    name: "Death",
    keyword: "Transformation",
    meaning: "This is a card of transformation, not of ending. Something is closing so that space can open for the new.",
    advice: "Release what has already served its purpose. Transformation is a gift.",
    affirmation: "I let go of the old and embrace the new with gratitude.",
  },
  {
    num: "XIV",
    name: "Temperance",
    keyword: "Equilibrium",
    meaning: "A day for moderation and balance. Find the golden mean between extremes.",
    advice: "Do not rush. Blend opposites with patience and skill.",
    affirmation: "I find balance in all areas of my life.",
  },
  {
    num: "XV",
    name: "The Devil",
    keyword: "Freedom",
    meaning: "What chains are holding you? Fear, habit, dependency — all of these can be released.",
    advice: "Look honestly at what limits you. Awareness is the first step toward freedom.",
    affirmation: "I am free from everything that no longer serves me.",
  },
  {
    num: "XVI",
    name: "The Tower",
    keyword: "Revelation",
    meaning: "Something may be crumbling. But what is true will endure. The rest needed to fall away.",
    advice: "Do not cling to what is collapsing. It is making room for something better.",
    affirmation: "I remain grounded even as things around me change.",
  },
  {
    num: "XVII",
    name: "The Star",
    keyword: "Hope",
    meaning: "After the storm comes a clear sky. Today is a time of renewal, inspiration, and hope.",
    advice: "Allow yourself to dream. Your desires have every right to exist.",
    affirmation: "I believe in the beautiful future that awaits me.",
  },
  {
    num: "XVIII",
    name: "The Moon",
    keyword: "Illusion",
    meaning: "Not everything is as it appears. Examine your assumptions and fears before you act.",
    advice: "Wait before making important decisions. The situation has not yet fully clarified.",
    affirmation: "I see reality as it truly is, without illusions.",
  },
  {
    num: "XIX",
    name: "The Sun",
    keyword: "Joy",
    meaning: "A wonderful day! Your energy is high, you radiate warmth and attract positivity.",
    advice: "Go outside, connect with others, celebrate. Allow yourself to be happy.",
    affirmation: "My heart is open to joy and love.",
  },
  {
    num: "XX",
    name: "Judgement",
    keyword: "Rebirth",
    meaning: "You hear an inner call to change. The time has come to answer an important calling.",
    advice: "Listen to what calls you from within. Do not ignore the call of your soul.",
    affirmation: "I answer the true calling of my heart.",
  },
  {
    num: "XXI",
    name: "The World",
    keyword: "Completion",
    meaning: "A cycle is complete. Savour the sense of accomplishment and prepare for the next level.",
    advice: "Celebrate your achievements. You have reached something important — acknowledge it.",
    affirmation: "I am whole and complete. Everything is falling into place perfectly.",
  },
];

const MAJOR_ARCANA_RU = [
  {
    num: "0",
    name: "Шут",
    keyword: "Начало",
    meaning: "Вы стоите на пороге нового опыта. Отпустите страх неизвестного и сделайте шаг вперёд с открытым сердцем.",
    advice: "Позвольте себе быть лёгким. Сегодня — день для смелых и спонтанных решений.",
    affirmation: "Я доверяю пути, который разворачивается передо мной.",
  },
  {
    num: "I",
    name: "Маг",
    keyword: "Воля",
    meaning: "Все ресурсы, которые вам нужны, уже в вашем распоряжении. Пришло время действовать с намерением и уверенностью.",
    advice: "Сосредоточьтесь на одной цели и направьте всю свою энергию на неё.",
    affirmation: "Я обладаю силой творить свою реальность.",
  },
  {
    num: "II",
    name: "Верховная Жрица",
    keyword: "Интуиция",
    meaning: "Сегодня ваша интуиция особенно обострена. Доверяйте внутреннему голосу больше, чем внешним советам.",
    advice: "Сделайте паузу и прислушайтесь к себе. Ответ уже есть внутри вас.",
    affirmation: "Я доверяю мудрости своего сердца.",
  },
  {
    num: "III",
    name: "Императрица",
    keyword: "Изобилие",
    meaning: "День полон творческой энергией и плодородием. Заботьтесь о себе и о тех, кого любите.",
    advice: "Окружите себя красотой. Приготовьте что-то вкусное, ухаживайте за собой, раскройте творчество.",
    affirmation: "Я принимаю благодать и изобилие в свою жизнь.",
  },
  {
    num: "IV",
    name: "Император",
    keyword: "Структура",
    meaning: "Время установить порядок и взять на себя ответственность. Структура — это не ограничение, а основа для роста.",
    advice: "Спланируйте свой день, установите границы и действуйте с решимостью.",
    affirmation: "Я несу ответственность за свою жизнь и свои выборы.",
  },
  {
    num: "V",
    name: "Иерофант",
    keyword: "Традиция",
    meaning: "Обратитесь к проверенной мудрости и традициям. Возможно, стоит поговорить с опытным наставником.",
    advice: "Уважайте установленные правила там, где они служат добру. Ищите мудрость в сообществе.",
    affirmation: "Я открыта к мудрости других и традиционным знаниям.",
  },
  {
    num: "VI",
    name: "Влюблённые",
    keyword: "Выбор",
    meaning: "Перед вами стоит важный выбор сердца. Придерживайтесь своих глубочайших ценностей, а не временных желаний.",
    advice: "Прежде чем решить — спросите себя: что действительно важно для меня?",
    affirmation: "Мои сердечные решения ведут меня к истинному счастью.",
  },
  {
    num: "VII",
    name: "Колесница",
    keyword: "Победа",
    meaning: "День требует дисциплины и целеустремлённости. Сосредоточьтесь на цели и двигайтесь вперёд, несмотря на препятствия.",
    advice: "Не позволяйте противоречивым эмоциям сбить вас с курса. Ваша воля — ваш сильнейший ресурс.",
    affirmation: "Я контролирую свой путь и двигаюсь к победе.",
  },
  {
    num: "VIII",
    name: "Сила",
    keyword: "Мужество",
    meaning: "Настоящая сила — это нежность, а не грубость. Сегодня вы способны преодолеть всё с любовью и терпением.",
    advice: "Подойдите к сложной ситуации с мягкостью и пониманием вместо конфронтации.",
    affirmation: "Я сильная и нежная одновременно.",
  },
  {
    num: "IX",
    name: "Отшельник",
    keyword: "Самопознание",
    meaning: "День для интроспекции и тишины. Отстранение от суеты откроет вам важные ответы.",
    advice: "Проведите время в одиночестве. Медитируйте, пишите в дневник или просто побудьте в тишине.",
    affirmation: "В тишине я нахожу свою внутреннюю мудрость.",
  },
  {
    num: "X",
    name: "Колесо Фортуны",
    keyword: "Цикл",
    meaning: "Всё меняется. Если сейчас трудно — это пройдёт. Если хорошо — наслаждайтесь и будьте благодарны.",
    advice: "Примите цикличность жизни. Отпустите то, что вне вашего контроля.",
    affirmation: "Я доверяю ритму и циклам своей жизни.",
  },
  {
    num: "XI",
    name: "Справедливость",
    keyword: "Баланс",
    meaning: "Сегодня особенно важна честность — с собой и другими. Ваши поступки будут иметь последствия.",
    advice: "Примите решение, которое справедливо для всех сторон, включая вас.",
    affirmation: "Я действую честно и получаю справедливый результат.",
  },
  {
    num: "XII",
    name: "Повешенный",
    keyword: "Пауза",
    meaning: "Иногда лучшее действие — это ничего не делать. Переосмыслите ситуацию под другим углом.",
    advice: "Остановитесь. Посмотрите на ситуацию с новой перспективы. Не торопитесь с решением.",
    affirmation: "В паузе я нахожу новые возможности.",
  },
  {
    num: "XIII",
    name: "Смерть",
    keyword: "Трансформация",
    meaning: "Это карта преобразования, а не конца. Что-то завершается, чтобы освободить место для нового.",
    advice: "Отпустите то, что уже отслужило своё. Трансформация — это дар.",
    affirmation: "Я отпускаю старое и открываюсь новому с благодарностью.",
  },
  {
    num: "XIV",
    name: "Умеренность",
    keyword: "Равновесие",
    meaning: "День для умеренности и равновесия. Найдите золотую середину между крайностями.",
    advice: "Не торопитесь. Смешивайте противоположности с терпением и мастерством.",
    affirmation: "Я нахожу баланс во всех сферах своей жизни.",
  },
  {
    num: "XV",
    name: "Дьявол",
    keyword: "Свобода",
    meaning: "Какие цепи держат вас? Страх, привычка, зависимость — всё это можно отпустить.",
    advice: "Посмотрите честно на то, что вас ограничивает. Осознание — первый шаг к свободе.",
    affirmation: "Я свободна от всего, что больше мне не служит.",
  },
  {
    num: "XVI",
    name: "Башня",
    keyword: "Откровение",
    meaning: "Возможно, что-то разрушается. Но то, что истинно — выдержит. Остальное должно было исчезнуть.",
    advice: "Не цепляйтесь за то, что рассыпается. Это освобождает место для лучшего.",
    affirmation: "Я устойчива, даже когда вокруг всё меняется.",
  },
  {
    num: "XVII",
    name: "Звезда",
    keyword: "Надежда",
    meaning: "После бури — ясное небо. Сегодня — время восстановления, вдохновения и надежды.",
    advice: "Позвольте себе мечтать. Ваши желания имеют право на существование.",
    affirmation: "Я верю в прекрасное будущее, которое меня ожидает.",
  },
  {
    num: "XVIII",
    name: "Луна",
    keyword: "Иллюзия",
    meaning: "Не всё является таким, каким кажется. Проверьте свои предположения и страхи прежде, чем действовать.",
    advice: "Подождите с важными решениями. Ситуация ещё не прояснилась полностью.",
    affirmation: "Я вижу реальность такой, какая она есть, без иллюзий.",
  },
  {
    num: "XIX",
    name: "Солнце",
    keyword: "Радость",
    meaning: "Замечательный день! Ваша энергия высока, вы излучаете тепло и притягиваете позитив.",
    advice: "Выходите на улицу, общайтесь, празднуйте. Позвольте себе быть счастливой.",
    affirmation: "Моё сердце открыто для радости и любви.",
  },
  {
    num: "XX",
    name: "Суд",
    keyword: "Возрождение",
    meaning: "Слышите внутренний зов к переменам. Пришло время ответить на важное призвание.",
    advice: "Прислушайтесь к тому, что зовёт вас изнутри. Не игнорируйте зов души.",
    affirmation: "Я отвечаю на истинное призвание своего сердца.",
  },
  {
    num: "XXI",
    name: "Мир",
    keyword: "Завершение",
    meaning: "Цикл завершён. Наслаждайтесь ощущением достижения и готовьтесь к следующему уровню.",
    advice: "Отметьте свои успехи. Вы достигли чего-то важного — признайте это.",
    affirmation: "Я полна и целостна. Всё складывается идеально.",
  },
];

function getDayCard(arcana: typeof MAJOR_ARCANA_UK) {
  const now = new Date();
  const dayIndex =
    now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
  return arcana[dayIndex % arcana.length];
}

function CardVisual({ num, name }: { num: string; name: string }) {
  return (
    <div className="w-[180px] h-[300px] rounded-3xl bg-gradient-to-b from-[#2D2218] to-[#1C1512] border border-[rgba(196,169,122,0.3)] shadow-[0_20px_80px_rgba(0,0,0,0.3)] flex flex-col items-center justify-between p-6 mx-auto">
      <div className="w-full border-t border-[rgba(196,169,122,0.3)]" />
      <div className="text-center">
        <p
          className="text-5xl text-[#D4A853] mb-3"
          style={{ fontFamily: "var(--font-cormorant)", fontWeight: 300 }}
        >
          {num}
        </p>
        <div className="w-16 h-16 rounded-full border border-[rgba(196,169,122,0.3)] flex items-center justify-center mx-auto mb-3">
          <span className="text-[#C4A97A] text-2xl">✦</span>
        </div>
        <p
          className="text-lg text-[#E8C98A] leading-tight"
          style={{ fontFamily: "var(--font-cormorant)", fontWeight: 300 }}
        >
          {name}
        </p>
      </div>
      <div className="w-full border-b border-[rgba(196,169,122,0.3)]" />
    </div>
  );
}

export default function DailyCardPage() {
  const { language } = useLanguage();
  const isRu = language === "ru";
  const isEn = language === "en";

  const arcana = isRu ? MAJOR_ARCANA_RU : isEn ? MAJOR_ARCANA_EN : MAJOR_ARCANA_UK;
  const card = useMemo(() => getDayCard(arcana), [arcana]);

  const today = new Date();
  const UA_MONTHS = [
    "січня","лютого","березня","квітня","травня","червня",
    "липня","серпня","вересня","жовтня","листопада","грудня",
  ];
  const RU_MONTHS = [
    "января","февраля","марта","апреля","мая","июня",
    "июля","августа","сентября","октября","ноября","декабря",
  ];
  const EN_MONTHS = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December",
  ];
  const months = isRu ? RU_MONTHS : isEn ? EN_MONTHS : UA_MONTHS;
  const todayStr = isEn
    ? `${EN_MONTHS[today.getMonth()]} ${today.getDate()}, ${today.getFullYear()}`
    : `${today.getDate()} ${months[today.getMonth()]} ${today.getFullYear()}`;

  return (
    <>
      <section className="pt-36 pb-16 bg-[#FDFBF7] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(196,169,122,0.1),transparent)]" />
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <AnimatedSection>
            <span className="tag mb-6 inline-block">Tarot</span>
            <h1
              className="text-[clamp(2.5rem,5vw,4.5rem)] text-[#1C1512] mb-4 leading-[1.06]"
              style={{ fontFamily: "var(--font-cormorant)", fontWeight: 400 }}
            >
              {isRu ? "Карта дня" : isEn ? "Card of the Day" : "Карта дня"}
            </h1>
            <p className="text-[#C4A97A] tracking-wide">{todayStr}</p>
          </AnimatedSection>
        </div>
      </section>

      <GoldDivider />

      <section className="section-padding bg-[#FDFBF7]">
        <div className="max-w-3xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-10 items-center mb-10">
            <AnimatedSection direction="right">
              <CardVisual num={card.num} name={card.name} />
            </AnimatedSection>

            <AnimatedSection direction="left" delay={0.1}>
              <div>
                <span className="tag mb-4 inline-block">{card.keyword}</span>
                <h2
                  className="text-4xl lg:text-5xl text-[#1C1512] mb-6"
                  style={{ fontFamily: "var(--font-cormorant)", fontWeight: 400 }}
                >
                  {card.name}
                </h2>
                <p className="text-[#7A6A58] leading-relaxed mb-6">{card.meaning}</p>

                <div className="p-5 rounded-2xl bg-[rgba(196,169,122,0.08)] border border-[rgba(196,169,122,0.15)] mb-6">
                  <p className="text-xs text-[#C4A97A] tracking-widest uppercase mb-2">
                    {isRu ? "Совет дня" : isEn ? "Advice of the Day" : "Порада дня"}
                  </p>
                  <p className="text-[#5C4530] leading-relaxed text-sm">{card.advice}</p>
                </div>

                <div className="p-5 rounded-2xl bg-gradient-to-br from-[#2D2218] to-[#1C1512] border border-[rgba(196,169,122,0.2)]">
                  <p className="text-xs text-[#C4A97A] tracking-widest uppercase mb-2">
                    {isRu ? "Аффирмация" : isEn ? "Affirmation" : "Аффірмація"}
                  </p>
                  <p
                    className="text-white/80 italic text-lg"
                    style={{ fontFamily: "var(--font-cormorant)" }}
                  >
                    &ldquo;{card.affirmation}&rdquo;
                  </p>
                </div>
              </div>
            </AnimatedSection>
          </div>

          <AnimatedSection delay={0.2}>
            <div className="card-luxury text-center">
              <p className="text-[#7A6A58] mb-6">
                {isRu
                  ? "Хотите понять, как эта карта связана с вашей конкретной ситуацией?"
                  : isEn
                  ? "Want to understand how this card relates to your specific situation?"
                  : "Хочете зрозуміти, як ця карта пов'язана з вашою конкретною ситуацією?"}
              </p>
              <Link href={`/${language}/contacts`} className="btn-primary">
                {isRu ? "Записаться на консультацию" : isEn ? "Book a Consultation" : "Записатись на консультацію"}
                <ArrowRight size={16} />
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
