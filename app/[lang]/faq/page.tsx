"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ArrowRight } from "lucide-react";
import AnimatedSection from "@/components/ui/AnimatedSection";
import GoldDivider from "@/components/ui/GoldDivider";
import { useLanguage } from '@/hooks/useLanguage';

export default function FAQPage() {
  const { language } = useLanguage();
  const isRu = language === 'ru';
  const isEn = language === 'en';

  type FAQ = { category: string; q: string; a: string };

  const faqsEn: FAQ[] = [
    { category: "Process", q: "How does an online consultation work?", a: "Consultations take place via Zoom or Telegram video call. After booking I send a link and a short questionnaire. We meet at the scheduled time — the quality and depth of work is equal to an in-person session." },
    { category: "Process", q: "Do I need to prepare anything for the session?", a: "It helps to have 1–3 questions or topics ready in advance to make the best use of our time. But if you have no specific question — that's fine too, we'll find a focus together at the start." },
    { category: "Process", q: "How long does it take to respond to a booking request?", a: "I usually reply within 24 hours on business days. For urgent requests — write to me on Telegram, I respond faster there." },
    { category: "Understanding Tarot", q: "Do you guarantee accuracy of predictions?", a: "Tarot is not fortune-telling — it's a tool for awareness. Cards show tendencies, resources and potential paths. The future is not fixed — your choices and actions shape it. I never guarantee specific events." },
    { category: "Understanding Tarot", q: "Can I get 'bad' cards? Is it dangerous?", a: "Every card carries useful information. Even the most challenging arcana point to areas of growth and necessary change. Tarot doesn't frighten — it warns and guides. I always interpret cards constructively and with respect for you." },
    { category: "Understanding Tarot", q: "Can a reading be done for another person without their knowledge?", a: "I do not practice unauthorised readings for third parties — this is an ethical matter. Instead, we can do a reading about your relationship and your role in the situation, which is more informative and responsible." },
    { category: "Payment & Organisation", q: "How does payment work?", a: "Payment is made before the session begins. I accept card, PayPal or Binance Pay. After confirming your booking I will send payment details." },
    { category: "Payment & Organisation", q: "Is it possible to reschedule or cancel a session?", a: "Rescheduling is free if requested at least 24 hours before the session. Cancellation less than 12 hours before — 50% of the cost. Force-majeure situations are handled individually." },
    { category: "Payment & Organisation", q: "Are there discounts or package deals?", a: "Yes, buying 3 consultations at once gives a 10% discount. Write to me personally on Telegram or Instagram for details." },
    { category: "Confidentiality", q: "Will our session be recorded?", a: "I record sessions only with your consent and solely to send you the recording afterwards. I do not store recordings or share them with anyone. Confidentiality is the foundation of my practice." },
    { category: "Confidentiality", q: "Will you tell anyone about our session?", a: "Absolutely not. Everything that happens during a session stays between us. I follow the principles of psychological confidentiality." },
    { category: "In Person", q: "Are in-person meetings available (offline)?", a: "Yes, when possible I hold in-person sessions in Kyiv. Write to me to find out current availability and location." },
  ];

  const faqsRu: FAQ[] = [
    { category: "Процесс", q: "Как проходит онлайн-консультация?", a: "Консультация проходит через Zoom или Telegram-видеозвонок. После записи я отправляю ссылку и небольшую анкету. Мы встречаемся в назначенное время — качество и глубина работы ничем не уступает личной встрече." },
    { category: "Процесс", q: "Нужно ли что-то подготовить к сессии?", a: "Желательно сформулировать 1–3 вопроса или темы заранее. Если конкретного запроса нет — это тоже нормально, мы вместе найдём фокус в начале встречи." },
    { category: "Процесс", q: "Сколько времени занимает ответ на запрос о записи?", a: "Я обычно отвечаю в течение 24 часов в рабочие дни. Если запрос срочный — напишите в Telegram, там отвечаю быстрее." },
    { category: "Понимание таро", q: "Гарантируете ли вы точность предсказаний?", a: "Таро — это не предсказание, а инструмент осознания. Карты показывают тенденции, ресурсы и потенциальные развития ситуации. Будущее не является жёстко определённым. Я никогда не гарантирую конкретных событий." },
    { category: "Понимание таро", q: "Можно ли получить 'плохие' карты? Это опасно?", a: "Любая карта несёт полезную информацию. Даже самые сложные арканы указывают на зоны роста. Таро не пугает — оно предупреждает и направляет." },
    { category: "Понимание таро", q: "Можно ли делать расклад для другого человека без его ведома?", a: "Я не практикую несанкционированные расклады для третьих лиц. Это вопрос этики. Вместо этого мы можем сделать расклад о ваших отношениях и вашей роли в ситуации." },
    { category: "Оплата и организация", q: "Как происходит оплата?", a: "Оплата производится до начала сессии. Принимаю карту, PayPal или Binance Pay. После подтверждения записи я пришлю реквизиты." },
    { category: "Оплата и организация", q: "Есть ли возможность переноса или отмены сессии?", a: "Перенос возможен не позднее чем за 24 часа до начала — бесплатно. Отмена менее чем за 12 часов — 50% стоимости. Форс-мажорные ситуации рассматриваем индивидуально." },
    { category: "Оплата и организация", q: "Есть ли скидки или пакетные предложения?", a: "Да, при покупке 3 консультаций сразу — скидка 10%. Подробнее напишите мне лично в Telegram или Instagram." },
    { category: "Конфиденциальность", q: "Будет ли сохраняться запись нашей сессии?", a: "Я записываю сессии только с вашего согласия и исключительно для того, чтобы отправить вам запись. Конфиденциальность — основа моей практики." },
    { category: "Конфиденциальность", q: "Расскажете ли вы кому-нибудь о нашем сеансе?", a: "Абсолютно нет. Всё, что происходит во время сессии, остаётся между нами." },
    { category: "Лично", q: "Доступны ли личные встречи (офлайн)?", a: "Да, при возможности — провожу личные встречи в Киеве. Напишите мне для уточнения актуального расписания и места." },
  ];

  const faqsUk: FAQ[] = [
    { category: "Процес", q: "Як відбувається онлайн-консультація?", a: "Консультація проходить через Zoom або Telegram-відеодзвінок. Після запису я надсилаю посилання та невелику анкету. Ми зустрічаємося у призначений час — якість та глибина роботи нічим не поступається особистій зустрічі." },
    { category: "Процес", q: "Чи потрібно щось підготувати до сесії?", a: "Бажано сформулювати 1–3 питання або теми заздалегідь. Але якщо конкретного запиту немає — це теж нормально, ми разом знайдемо фокус." },
    { category: "Процес", q: "Скільки часу займає відповідь на запит про запис?", a: "Я зазвичай відповідаю протягом 24 годин у робочі дні. Якщо запит терміновий — напишіть у Telegram." },
    { category: "Розуміння таро", q: "Чи гарантуєте ви точність передбачень?", a: "Таро — це не передбачення, а інструмент усвідомлення. Карти показують тенденції, ресурси та потенційні розвитки ситуації. Майбутнє не є жорстко визначеним. Я ніколи не гарантую конкретних подій." },
    { category: "Розуміння таро", q: "Чи можна отримати 'погані' карти? Це небезпечно?", a: "Будь-яка карта несе корисну інформацію. Навіть найскладніші аркани вказують на зони росту. Таро не залякує — воно попереджає та направляє." },
    { category: "Розуміння таро", q: "Чи можна робити розклад для іншої людини без її відома?", a: "Я не практикую несанкціоновані розклади для третіх осіб. Це питання етики. Натомість ми можемо зробити розклад про ваші стосунки та вашу роль у ситуації." },
    { category: "Оплата та організація", q: "Як відбувається оплата?", a: "Оплата здійснюється до початку сесії. Приймаю картку, PayPal або Binance Pay. Реквізити надсилаю після підтвердження запису." },
    { category: "Оплата та організація", q: "Чи є можливість переносу або скасування сесії?", a: "Перенос можливий не пізніше ніж за 24 години до початку — безкоштовно. Скасування менш ніж за 12 годин — 50% вартості." },
    { category: "Оплата та організація", q: "Чи є знижки або пакетні пропозиції?", a: "Так, при покупці 3 консультацій одразу — знижка 10%. Детальніше напишіть мені у Telegram або Instagram." },
    { category: "Конфіденційність", q: "Чи зберігатиметься запис нашої сесії?", a: "Я записую сесії лише за вашою згодою і виключно для того, щоб надіслати вам запис. Конфіденційність — основа моєї практики." },
    { category: "Конфіденційність", q: "Чи розповідатимете ви комусь про наш сеанс?", a: "Абсолютно ні. Все, що відбувається під час сесії, залишається між нами." },
    { category: "Особисто", q: "Чи доступні особисті зустрічі (офлайн)?", a: "Так, при можливості — проводжу особисті зустрічі в Києві. Напишіть мені для уточнення актуального розкладу та місця." },
  ];

  const faqs = isRu ? faqsRu : isEn ? faqsEn : faqsUk;

  const ALL_LABEL = isRu ? "Все" : isEn ? "All" : "Всі";
  const categories = isRu
    ? [ALL_LABEL, "Процесс", "Понимание таро", "Оплата и организация", "Конфиденциальность", "Лично"]
    : isEn
    ? [ALL_LABEL, "Process", "Understanding Tarot", "Payment & Organisation", "Confidentiality", "In Person"]
    : [ALL_LABEL, "Процес", "Розуміння таро", "Оплата та організація", "Конфіденційність", "Особисто"];

  const [activeCategory, setActiveCategory] = useState(ALL_LABEL);
  const [openItem, setOpenItem] = useState<number | null>(null);
  const filtered = activeCategory === ALL_LABEL ? faqs : faqs.filter(f => f.category === activeCategory);

  return (
    <>
      <section className="pt-36 pb-16 bg-[#FDFBF7] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(196,169,122,0.1),transparent)]" />
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <AnimatedSection>
            <span className="tag mb-6 inline-block">
              {isRu ? "Вопросы и ответы" : isEn ? "Questions & Answers" : "Питання та відповіді"}
            </span>
            <h1 className="text-[clamp(2.5rem,5vw,5rem)] text-[#1C1512] mb-6 leading-[1.06]" style={{ fontFamily: "var(--font-cormorant)", fontWeight: 400 }}>FAQ</h1>
            <p className="text-xl text-[#7A6A58] leading-relaxed">
              {isRu ? "Ответы на самые частые вопросы." : isEn ? "Answers to the most common questions." : "Відповіді на найпоширеніші запитання."}
            </p>
          </AnimatedSection>
        </div>
      </section>

      <GoldDivider />

      <section className="py-8 bg-[#FDFBF7]">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map(cat => (
              <button key={cat} onClick={() => { setActiveCategory(cat); setOpenItem(null); }}
                className={`px-5 py-2 rounded-full text-sm transition-all duration-300 ${activeCategory === cat ? "bg-[#D4A853] text-white shadow-[0_4px_16px_rgba(212,168,83,0.3)]" : "border border-[rgba(196,169,122,0.4)] text-[#7A6A58] hover:border-[#D4A853] hover:text-[#B8883A]"}`}
                style={{ fontFamily: "var(--font-jost)", fontWeight: 500 }}>
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-section bg-[#FDFBF7] pt-2">
        <div className="max-w-3xl mx-auto px-6">
          <AnimatedSection>
            <div className="space-y-3">
              {filtered.map((faq, i) => (
                <div key={i} className="card-luxury !p-0 overflow-hidden">
                  <button onClick={() => setOpenItem(openItem === i ? null : i)} className="w-full flex items-center justify-between px-6 py-5 text-left group">
                    <div>
                      <span className="text-xs text-[#C4A97A] tracking-widest uppercase block mb-1" style={{ fontFamily: "var(--font-jost)" }}>{faq.category}</span>
                      <span className="text-xl text-[#1C1512] group-hover:text-[#B8883A] transition-colors" style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}>{faq.q}</span>
                    </div>
                    <ChevronDown size={18} className={`text-[#C4A97A] flex-shrink-0 ml-4 transition-transform duration-300 ${openItem === i ? "rotate-180" : ""}`} />
                  </button>
                  {openItem === i && (
                    <div className="px-6 pb-5 text-[#7A6A58] text-sm leading-relaxed border-t border-[rgba(196,169,122,0.1)] pt-4">{faq.a}</div>
                  )}
                </div>
              ))}
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.2} className="mt-16 text-center">
            <div className="card-luxury">
              <h2 className="text-2xl text-[#1C1512] mb-3" style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}>
                {isRu ? "Не нашли ответ?" : isEn ? "Didn't find an answer?" : "Не знайшли відповідь?"}
              </h2>
              <p className="text-[#7A6A58] mb-6">
                {isRu ? "Напишите мне напрямую — я отвечу на любой вопрос."
                  : isEn ? "Write to me directly — I will answer any question."
                  : "Напишіть мені напряму — я відповім на будь-яке питання."}
              </p>
              <Link href={`/${language}/contacts`} className="btn-primary">
                {isRu ? "Написать мне" : isEn ? "Write to Me" : "Написати мені"}
                <ArrowRight size={16} />
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
