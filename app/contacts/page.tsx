"use client";

import { useState } from "react";
import { Send, CheckCircle } from "lucide-react";
import AnimatedSection from "@/components/ui/AnimatedSection";
import GoldDivider from "@/components/ui/GoldDivider";
import { useLanguage } from '@/hooks/useLanguage';

function InstagramIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <circle cx="12" cy="12" r="4"/>
      <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none"/>
    </svg>
  );
}

function TelegramIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.8 2.2L1.5 10.3c-1.3.5-1.3 1.4-.2 1.8l5.1 1.6 2 6.2c.2.7.5.9 1 .9.4 0 .6-.2 1-.5l2.4-2.4 4.9 3.6c.9.5 1.6.2 1.8-.8L22.9 3.4c.3-1.3-.5-1.8-1.1-1.2z"/>
    </svg>
  );
}

export default function ContactsPage() {
  const { language } = useLanguage();
  const isRu = language === 'ru';

  const TOPICS_UK = [
    "Особиста консультація",
    "Аналіз пари",
    "Картка місяця",
    "Річний прогноз",
    "Загальне питання",
  ];

  const TOPICS_RU = [
    "Личная консультация",
    "Анализ пары",
    "Карта месяца",
    "Годовой прогноз",
    "Общий вопрос",
  ];

  const TOPICS = isRu ? TOPICS_RU : TOPICS_UK;

  const [form, setForm] = useState({
    name: "",
    contact: "",
    topic: TOPICS[0],
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1200);
  };

  const hours = isRu ? [
    { day: "Понедельник–Пятница", hours: "10:00 – 20:00" },
    { day: "Суббота", hours: "11:00 – 18:00" },
    { day: "Воскресенье", hours: "по договорённости" },
  ] : [
    { day: "Понеділок–П'ятниця", hours: "10:00 – 20:00" },
    { day: "Субота", hours: "11:00 – 18:00" },
    { day: "Неділя", hours: "за домовленістю" },
  ];

  return (
    <>
      <section className="pt-36 pb-16 bg-[#FDFBF7] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(196,169,122,0.1),transparent)]" />
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <AnimatedSection>
            <span className="tag mb-6 inline-block">
              {isRu ? "Связаться" : "Зв'язатись"}
            </span>
            <h1
              className="text-[clamp(2.5rem,5vw,5rem)] text-[#1C1512] mb-6 leading-[1.06]"
              style={{ fontFamily: "var(--font-cormorant)", fontWeight: 400 }}
            >
              {isRu ? "Записаться на консультацию" : "Записатись на консультацію"}
            </h1>
            <p className="text-xl text-[#7A6A58] leading-relaxed">
              {isRu
                ? "Оставьте заявку — и я свяжусь с вами в течение 24 часов."
                : "Залиште заявку — і я зв'яжуся з вами протягом 24 годин."}
            </p>
          </AnimatedSection>
        </div>
      </section>

      <GoldDivider />

      <section className="section-padding bg-[#FDFBF7]">
        <div className="max-w-6xl mx-auto px-6 lg:px-10">
          <div className="grid lg:grid-cols-[1fr_380px] gap-12">
            {/* Form */}
            <AnimatedSection>
              {submitted ? (
                <div className="card-luxury flex flex-col items-center justify-center text-center py-20">
                  <CheckCircle size={48} className="text-[#B8883A] mb-6" />
                  <h2
                    className="text-3xl text-[#1C1512] mb-4"
                    style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}
                  >
                    {isRu ? "Спасибо за заявку!" : "Дякую за заявку!"}
                  </h2>
                  <p className="text-[#7A6A58] max-w-sm">
                    {isRu
                      ? "Я получила ваше сообщение и свяжусь с вами в течение 24 часов. Если срочно — напишите в Telegram."
                      : "Я отримала ваше повідомлення і зв'яжуся з вами протягом 24 годин. Якщо термінова потреба — напишіть у Telegram."}
                  </p>
                </div>
              ) : (
                <div className="card-luxury">
                  <h2
                    className="text-2xl text-[#1C1512] mb-8"
                    style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}
                  >
                    {isRu ? "Форма запроса" : "Форма запиту"}
                  </h2>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label className="block text-xs text-[#7A6A58] mb-2 tracking-wide">
                        {isRu ? "Ваше имя" : "Ваше ім'я"} *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ellen Soul"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="input-luxury"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-[#7A6A58] mb-2 tracking-wide">
                        Telegram {isRu ? "или" : "або"} Instagram *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder={isRu ? "@username или номер телефона" : "@username або номер телефону"}
                        value={form.contact}
                        onChange={(e) => setForm({ ...form, contact: e.target.value })}
                        className="input-luxury"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-[#7A6A58] mb-2 tracking-wide">
                        {isRu ? "Тема запроса" : "Тема запиту"}
                      </label>
                      <select
                        value={form.topic}
                        onChange={(e) => setForm({ ...form, topic: e.target.value })}
                        className="input-luxury"
                      >
                        {TOPICS.map((topic) => (
                          <option key={topic} value={topic}>{topic}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs text-[#7A6A58] mb-2 tracking-wide">
                        {isRu ? "Сообщение (необязательно)" : "Повідомлення (необов'язково)"}
                      </label>
                      <textarea
                        rows={5}
                        placeholder={isRu
                          ? "Кратко опишите ситуацию или вопрос, с которым хотите обратиться..."
                          : "Коротко опишіть ситуацію або питання, з яким хочете звернутись..."}
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        className="input-luxury resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="btn-primary w-full"
                      disabled={loading}
                    >
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"/>
                          </svg>
                          {isRu ? "Отправляем..." : "Відправляємо..."}
                        </span>
                      ) : (
                        <>
                          <Send size={16} />
                          {isRu ? "Отправить заявку" : "Відправити заявку"}
                        </>
                      )}
                    </button>

                    <p className="text-xs text-[#7A6A58] text-center">
                      {isRu
                        ? "Отправляя форму, вы соглашаетесь на обработку данных для обратной связи."
                        : "Надсилаючи форму, ви погоджуєтесь на обробку даних для зворотного зв'язку."}
                    </p>
                  </form>
                </div>
              )}
            </AnimatedSection>

            {/* Sidebar info */}
            <AnimatedSection delay={0.1} direction="left">
              <div className="space-y-6">
                {/* Social CTA */}
                <div className="card-luxury">
                  <h3
                    className="text-2xl text-[#1C1512] mb-5"
                    style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}
                  >
                    {isRu ? "Быстрая связь" : "Швидший зв'язок"}
                  </h3>
                  <a
                    href="https://t.me/olena_tarot"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-4 rounded-xl border border-[rgba(196,169,122,0.3)] hover:border-[#D4A853] transition-all duration-300 hover:shadow-[0_4px_20px_rgba(212,168,83,0.12)] mb-3 group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[rgba(196,169,122,0.1)] flex items-center justify-center text-[#B8883A] group-hover:bg-[rgba(212,168,83,0.15)] transition-colors">
                      <TelegramIcon />
                    </div>
                    <div>
                      <p className="font-medium text-[#1C1512] text-sm">Telegram</p>
                      <p className="text-xs text-[#7A6A58]">@olena_tarot</p>
                    </div>
                  </a>
                  <a
                    href="https://instagram.com/olena_tarot"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-4 rounded-xl border border-[rgba(196,169,122,0.3)] hover:border-[#D4A853] transition-all duration-300 hover:shadow-[0_4px_20px_rgba(212,168,83,0.12)] group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[rgba(196,169,122,0.1)] flex items-center justify-center text-[#B8883A] group-hover:bg-[rgba(212,168,83,0.15)] transition-colors">
                      <InstagramIcon />
                    </div>
                    <div>
                      <p className="font-medium text-[#1C1512] text-sm">Instagram</p>
                      <p className="text-xs text-[#7A6A58]">@olena_tarot</p>
                    </div>
                  </a>
                </div>

                {/* Working hours */}
                <div className="card-luxury">
                  <h3
                    className="text-xl text-[#1C1512] mb-4"
                    style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}
                  >
                    {isRu ? "Рабочее время" : "Робочий час"}
                  </h3>
                  <div className="space-y-3">
                    {hours.map((item) => (
                      <div key={item.day} className="flex justify-between items-center py-2 border-b border-[rgba(196,169,122,0.15)]">
                        <span className="text-sm text-[#7A6A58]">{item.day}</span>
                        <span className="text-sm text-[#1C1512] font-medium">{item.hours}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-[#7A6A58] mt-4">
                    {isRu
                      ? "Время по Киевскому часовому поясу (UTC+2/UTC+3)"
                      : "Час за Київським часовим поясом (UTC+2/UTC+3)"}
                  </p>
                </div>

                {/* Guarantee */}
                <div className="card-luxury bg-[rgba(196,169,122,0.05)]">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl text-[#D4A853] mt-0.5">✦</span>
                    <div>
                      <p className="font-medium text-[#1C1512] mb-1" style={{ fontFamily: "var(--font-cormorant)", fontSize: "1.1rem" }}>
                        {isRu ? "Гарантия конфиденциальности" : "Гарантія конфіденційності"}
                      </p>
                      <p className="text-xs text-[#7A6A58] leading-relaxed">
                        {isRu
                          ? "Всё, что вы рассказываете — остаётся между нами. Я не передаю данные третьим лицам."
                          : "Усе, що ви розповідаєте — залишається між нами. Я не передаю дані третім особам."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>
    </>
  );
}
