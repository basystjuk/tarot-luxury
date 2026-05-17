"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import AnimatedSection from "@/components/ui/AnimatedSection";
import GoldDivider from "@/components/ui/GoldDivider";

const MAJOR_ARCANA = [
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
    keyword: "Баланс",
    meaning: "День для помірності та рівноваги. Знайдіть золоту середину між крайнощами.",
    advice: "Не поспішайте. Змішуйте протилежності з терпінням та майстерністю.",
    affirmation: "Я знаходжу баланс у всіх сферах свого життя.",
  },
  {
    num: "XV",
    name: "Диявол",
    keyword: "Свобода",
    meaning: "Яки ланцюги тримають вас? Страх, звичка, залежність — все це можна відпустити.",
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
    meaning: "Почуєте внутрішній поклик до змін. Прийдіть час відповісти на важливе покликання.",
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

function getDayCard(): (typeof MAJOR_ARCANA)[0] {
  const now = new Date();
  const dayIndex =
    now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
  return MAJOR_ARCANA[dayIndex % MAJOR_ARCANA.length];
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
  const card = useMemo(() => getDayCard(), []);

  const today = new Date();
  const UA_MONTHS = [
    "січня","лютого","березня","квітня","травня","червня",
    "липня","серпня","вересня","жовтня","листопада","грудня",
  ];
  const todayStr = `${today.getDate()} ${UA_MONTHS[today.getMonth()]} ${today.getFullYear()}`;

  return (
    <>
      <section className="pt-36 pb-16 bg-[#FDFBF7] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(196,169,122,0.1),transparent)]" />
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <AnimatedSection>
            <span className="tag mb-6 inline-block">Таро</span>
            <h1
              className="text-[clamp(2.5rem,5vw,4.5rem)] text-[#1C1512] mb-4 leading-[1.06]"
              style={{ fontFamily: "var(--font-cormorant)", fontWeight: 400 }}
            >
              Карта дня
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
                  <p className="text-xs text-[#C4A97A] tracking-widest uppercase mb-2">Порада дня</p>
                  <p className="text-[#5C4530] leading-relaxed text-sm">{card.advice}</p>
                </div>

                <div className="p-5 rounded-2xl bg-gradient-to-br from-[#2D2218] to-[#1C1512] border border-[rgba(196,169,122,0.2)]">
                  <p className="text-xs text-[#C4A97A] tracking-widest uppercase mb-2">Аффірмація</p>
                  <p
                    className="text-white/80 italic text-lg"
                    style={{ fontFamily: "var(--font-cormorant)" }}
                  >
                    "{card.affirmation}"
                  </p>
                </div>
              </div>
            </AnimatedSection>
          </div>

          <AnimatedSection delay={0.2}>
            <div className="card-luxury text-center">
              <p className="text-[#7A6A58] mb-6">
                Хочете зрозуміти, як ця карта пов'язана з вашою конкретною ситуацією?
              </p>
              <Link href="/contacts" className="btn-primary">
                Записатись на консультацію
                <ArrowRight size={16} />
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
