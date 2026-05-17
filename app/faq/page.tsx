"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ArrowRight } from "lucide-react";
import AnimatedSection from "@/components/ui/AnimatedSection";
import GoldDivider from "@/components/ui/GoldDivider";

const faqs = [
  {
    category: "Процес",
    q: "Як відбувається онлайн-консультація?",
    a: "Консультація проходить через Zoom або Telegram-відеодзвінок. Після запису я надсилаю посилання та невелику анкету. Ми зустрічаємося у призначений час — якість та глибина роботи нічим не поступається особистій зустрічі.",
  },
  {
    category: "Процес",
    q: "Чи потрібно щось підготувати до сесії?",
    a: "Бажано сформулювати 1–3 питання або теми заздалегідь. Це допомагає максимально використати час сесії. Але якщо конкретного запиту немає — це теж нормально, ми разом знайдемо фокус на початку зустрічі.",
  },
  {
    category: "Процес",
    q: "Скільки часу займає відповідь на запит про запис?",
    a: "Я зазвичай відповідаю протягом 24 годин у робочі дні. Якщо запит терміновий — напишіть у Telegram, там відповідаю швидше.",
  },
  {
    category: "Розуміння таро",
    q: "Чи гарантуєте ви точність передбачень?",
    a: "Таро — це не передбачення, а інструмент усвідомлення. Карти показують тенденції, ресурси та потенційні розвитки ситуації. Майбутнє не є жорстко визначеним — ваші рішення та дії змінюють його. Я ніколи не гарантую конкретних подій.",
  },
  {
    category: "Розуміння таро",
    q: "Чи можна отримати 'погані' карти? Це небезпечно?",
    a: "Будь-яка карта несе корисну інформацію. Навіть найскладніші аркани вказують на зони росту та необхідні зміни. Таро не залякує — воно попереджає та направляє. Я завжди трактую карти конструктивно та з повагою до вас.",
  },
  {
    category: "Розуміння таро",
    q: "Чи можна робити розклад для іншої людини без її відома?",
    a: "Я не практикую несанкціоновані розклади для третіх осіб. Це питання етики. Натомість ми можемо зробити розклад про ваші стосунки та вашу роль у ситуації — це інформативніше та відповідальніше.",
  },
  {
    category: "Оплата та організація",
    q: "Як відбувається оплата?",
    a: "Оплата здійснюється до початку сесії через картку або Monobank (гривня). Для клієнтів з-за кордону — PayPal або WISE. Реквізити надсилаю після підтвердження запису.",
  },
  {
    category: "Оплата та організація",
    q: "Чи є можливість переносу або скасування сесії?",
    a: "Перенос можливий не пізніше ніж за 24 години до початку — безкоштовно. Скасування менш ніж за 12 годин — 50% вартості. Форс-мажорні ситуації розглядаємо індивідуально.",
  },
  {
    category: "Оплата та організація",
    q: "Чи є знижки або пакетні пропозиції?",
    a: "Так, при покупці 3 консультацій одразу — знижка 10%. Детальніше напишіть мені особисто у Telegram або Instagram.",
  },
  {
    category: "Конфіденційність",
    q: "Чи зберігатиметься запис нашої сесії?",
    a: "Я записую сесії лише за вашою згодою і виключно для того, щоб надіслати вам запис. Я не зберігаю записи та не передаю їх третім особам. Конфіденційність — основа моєї практики.",
  },
  {
    category: "Конфіденційність",
    q: "Чи розповідатимете ви комусь про наш сеанс?",
    a: "Абсолютно ні. Все, що відбувається під час сесії, залишається між нами. Я дотримуюся принципів психологічної конфіденційності.",
  },
  {
    category: "Особисто",
    q: "Чи доступні особисті зустрічі (офлайн)?",
    a: "Так, при можливості — проводжу особисті зустрічі в Києві. Напишіть мені для уточнення актуального розкладу та місця.",
  },
];

const categories = ["Всі", "Процес", "Розуміння таро", "Оплата та організація", "Конфіденційність", "Особисто"];

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState("Всі");
  const [openItem, setOpenItem] = useState<number | null>(null);

  const filtered = activeCategory === "Всі" ? faqs : faqs.filter((f) => f.category === activeCategory);

  return (
    <>
      <section className="pt-36 pb-16 bg-[#FDFBF7] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(196,169,122,0.1),transparent)]" />
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <AnimatedSection>
            <span className="tag mb-6 inline-block">Питання та відповіді</span>
            <h1
              className="text-[clamp(2.5rem,5vw,5rem)] text-[#1C1512] mb-6 leading-[1.06]"
              style={{ fontFamily: "var(--font-cormorant)", fontWeight: 400 }}
            >
              FAQ
            </h1>
            <p className="text-xl text-[#7A6A58] leading-relaxed">
              Відповіді на найпоширеніші запитання.
            </p>
          </AnimatedSection>
        </div>
      </section>

      <GoldDivider />

      {/* Category filters */}
      <section className="py-8 bg-[#FDFBF7]">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => { setActiveCategory(cat); setOpenItem(null); }}
                className={`px-5 py-2 rounded-full text-sm transition-all duration-300 ${
                  activeCategory === cat
                    ? "bg-[#D4A853] text-white shadow-[0_4px_16px_rgba(212,168,83,0.3)]"
                    : "border border-[rgba(196,169,122,0.4)] text-[#7A6A58] hover:border-[#D4A853] hover:text-[#B8883A]"
                }`}
                style={{ fontFamily: "var(--font-jost)", fontWeight: 500 }}
              >
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
                <div
                  key={i}
                  className="card-luxury !p-0 overflow-hidden"
                >
                  <button
                    onClick={() => setOpenItem(openItem === i ? null : i)}
                    className="w-full flex items-center justify-between px-6 py-5 text-left group"
                  >
                    <div>
                      <span className="text-xs text-[#C4A97A] tracking-widest uppercase block mb-1"
                        style={{ fontFamily: "var(--font-jost)" }}>
                        {faq.category}
                      </span>
                      <span
                        className="text-xl text-[#1C1512] group-hover:text-[#B8883A] transition-colors"
                        style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}
                      >
                        {faq.q}
                      </span>
                    </div>
                    <ChevronDown
                      size={18}
                      className={`text-[#C4A97A] flex-shrink-0 ml-4 transition-transform duration-300 ${
                        openItem === i ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {openItem === i && (
                    <div className="px-6 pb-5 text-[#7A6A58] text-sm leading-relaxed border-t border-[rgba(196,169,122,0.1)] pt-4">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.2} className="mt-16 text-center">
            <div className="card-luxury">
              <h2
                className="text-2xl text-[#1C1512] mb-3"
                style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}
              >
                Не знайшли відповідь?
              </h2>
              <p className="text-[#7A6A58] mb-6">
                Напишіть мені напряму — я відповім на будь-яке питання.
              </p>
              <Link href="/contacts" className="btn-primary">
                Написати мені
                <ArrowRight size={16} />
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
