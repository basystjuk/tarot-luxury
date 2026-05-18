"use client";

import { useState, useEffect } from "react";
import { Send, CheckCircle } from "lucide-react";
import AnimatedSection from "@/components/ui/AnimatedSection";
import GoldDivider from "@/components/ui/GoldDivider";
import { useLanguage } from '@/hooks/useLanguage';

function InstagramIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4"/>
      <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none"/>
    </svg>
  );
}

function TelegramIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
    </svg>
  );
}

export default function ContactsPage() {
  const { language } = useLanguage();
  const isRu = language === 'ru';
  const isEn = language === 'en';

  const [contacts, setContacts] = useState({
    telegram_handle: "@ellen_soul_taro",
    telegram_url: "https://t.me/ellen_soul_taro",
    whatsapp_url: "https://wa.me/380000000000",
    instagram_handle: "@ellen_soul_taro",
    instagram_url: "https://instagram.com/ellen_soul_taro",
  });

  useEffect(() => {
    fetch("/api/content")
      .then(r => r.json())
      .then(data => { if (data.contacts) setContacts(data.contacts); })
      .catch(() => {});
  }, []);

  const TOPICS = isRu
    ? ["Один вопрос", "Расклад Амур", "Онлайн таро сессия", "Личный запрос"]
    : isEn
    ? ["One Question", "Amour Spread", "Online Tarot Session", "Personal Request"]
    : ["Одне питання", "Розклад Амур", "Онлайн таро сесія", "Особистий запит"];

  const [form, setForm] = useState({ name: "", contact: "", topic: TOPICS[0], message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); setSubmitted(true); }, 1200);
  };

  const hours = isRu
    ? [{ day: "Понедельник–Суббота", hours: "10:00 – 20:00" }]
    : isEn
    ? [{ day: "Monday–Saturday", hours: "10:00 – 20:00" }]
    : [{ day: "Понеділок–Субота", hours: "10:00 – 20:00" }];

  return (
    <>
      <section className="pt-36 pb-16 bg-[#FDFBF7] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(196,169,122,0.1),transparent)]" />
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <AnimatedSection>
            <span className="tag mb-6 inline-block">
              {isRu ? "Связаться" : isEn ? "Get in Touch" : "Зв'язатись"}
            </span>
            <h1 className="text-[clamp(2.5rem,5vw,5rem)] text-[#1C1512] mb-6 leading-[1.06]" style={{ fontFamily: "var(--font-cormorant)", fontWeight: 400 }}>
              {isRu ? "Записаться на консультацию" : isEn ? "Book a Consultation" : "Записатись на консультацію"}
            </h1>
            <p className="text-xl text-[#7A6A58] leading-relaxed">
              {isRu ? "Оставьте заявку — и я свяжусь с вами в течение 24 часов."
                : isEn ? "Leave a request — and I will contact you within 24 hours."
                : "Залиште заявку — і я зв'яжуся з вами протягом 24 годин."}
            </p>
          </AnimatedSection>
        </div>
      </section>

      <GoldDivider />

      <section className="section-padding bg-[#FDFBF7]">
        <div className="max-w-6xl mx-auto px-6 lg:px-10">
          <div className="grid lg:grid-cols-[1fr_380px] gap-12">
            <AnimatedSection>
              {submitted ? (
                <div className="card-luxury flex flex-col items-center justify-center text-center py-20">
                  <CheckCircle size={48} className="text-[#B8883A] mb-6" />
                  <h2 className="text-3xl text-[#1C1512] mb-4" style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}>
                    {isRu ? "Спасибо за заявку!" : isEn ? "Thank you for your request!" : "Дякую за заявку!"}
                  </h2>
                  <p className="text-[#7A6A58] max-w-sm">
                    {isRu ? "Я получила ваше сообщение и свяжусь с вами в течение 24 часов."
                      : isEn ? "I received your message and will get back to you within 24 hours."
                      : "Я отримала ваше повідомлення і зв'яжуся з вами протягом 24 годин."}
                  </p>
                </div>
              ) : (
                <div className="card-luxury">
                  <h2 className="text-2xl text-[#1C1512] mb-8 text-center" style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}>
                    {isRu ? "Форма запроса" : isEn ? "Request Form" : "Форма запиту"}
                  </h2>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label className="block text-xs text-[#7A6A58] mb-2 tracking-wide">
                        {isRu ? "Ваше имя" : isEn ? "Your name" : "Ваше ім'я"} *
                      </label>
                      <input type="text" required placeholder="Ellen Soul" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-luxury" />
                    </div>
                    <div>
                      <label className="block text-xs text-[#7A6A58] mb-2 tracking-wide">
                        Telegram, WhatsApp {isRu ? "или" : isEn ? "or" : "або"} Instagram *
                      </label>
                      <input type="text" required placeholder={isRu ? "@username или номер телефона" : isEn ? "@username or phone number" : "@username або номер телефону"} value={form.contact} onChange={e => setForm({ ...form, contact: e.target.value })} className="input-luxury" />
                    </div>
                    <div>
                      <label className="block text-xs text-[#7A6A58] mb-2 tracking-wide">
                        {isRu ? "Тема запроса" : isEn ? "Topic" : "Тема запиту"}
                      </label>
                      <select value={form.topic} required onChange={e => setForm({ ...form, topic: e.target.value })} className="input-luxury">
                        {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-[#7A6A58] mb-2 tracking-wide">
                        {isRu ? "Сообщение (необязательно)" : isEn ? "Message (optional)" : "Повідомлення (необов'язково)"}
                      </label>
                      <textarea rows={5} placeholder={isRu ? "Кратко опишите ситуацию..." : isEn ? "Briefly describe your situation..." : "Коротко опишіть ситуацію..."} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} className="input-luxury resize-none" />
                    </div>
                    <button type="submit" className="btn-primary w-full" disabled={loading}>
                      {loading
                        ? <span className="flex items-center gap-2"><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"/></svg>{isRu ? "Отправляем..." : isEn ? "Sending..." : "Відправляємо..."}</span>
                        : <><Send size={16} />{isRu ? "Отправить заявку" : isEn ? "Send Request" : "Відправити заявку"}</>}
                    </button>
                    <p className="text-xs text-[#7A6A58] text-center">
                      {isRu ? "Отправляя форму, вы соглашаетесь на обработку данных."
                        : isEn ? "By submitting the form, you agree to data processing for follow-up."
                        : "Надсилаючи форму, ви погоджуєтесь на обробку даних."}
                    </p>
                  </form>
                </div>
              )}
            </AnimatedSection>

            <AnimatedSection delay={0.1} direction="left">
              <div className="space-y-6">
                <div className="card-luxury">
                  <h3 className="text-2xl text-[#1C1512] mb-5 text-center" style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}>
                    {isRu ? "Быстрая связь" : isEn ? "Quick Contact" : "Швидкий зв'язок"}
                  </h3>
                  <a href={contacts.telegram_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 rounded-xl border border-[rgba(196,169,122,0.3)] hover:border-[#D4A853] transition-all duration-300 mb-3 group">
                    <div className="w-10 h-10 rounded-xl bg-[rgba(196,169,122,0.1)] flex items-center justify-center text-[#B8883A]"><TelegramIcon /></div>
                    <div><p className="font-medium text-[#1C1512] text-sm">Telegram</p><p className="text-xs text-[#7A6A58]">{contacts.telegram_handle}</p></div>
                  </a>
                  <a href={contacts.whatsapp_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 rounded-xl border border-[rgba(196,169,122,0.3)] hover:border-[#D4A853] transition-all duration-300 mb-3 group">
                    <div className="w-10 h-10 rounded-xl bg-[rgba(196,169,122,0.1)] flex items-center justify-center text-[#B8883A]"><WhatsAppIcon /></div>
                    <div><p className="font-medium text-[#1C1512] text-sm">WhatsApp</p><p className="text-xs text-[#7A6A58]">{contacts.telegram_handle}</p></div>
                  </a>
                  <a href={contacts.instagram_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 rounded-xl border border-[rgba(196,169,122,0.3)] hover:border-[#D4A853] transition-all duration-300 group">
                    <div className="w-10 h-10 rounded-xl bg-[rgba(196,169,122,0.1)] flex items-center justify-center text-[#B8883A]"><InstagramIcon /></div>
                    <div><p className="font-medium text-[#1C1512] text-sm">Instagram</p><p className="text-xs text-[#7A6A58]">{contacts.instagram_handle}</p></div>
                  </a>
                </div>

                <div className="card-luxury">
                  <h3 className="text-xl text-[#1C1512] mb-4" style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}>
                    {isRu ? "Рабочее время" : isEn ? "Working Hours" : "Робочий час"}
                  </h3>
                  <div className="space-y-3">
                    {hours.map(item => (
                      <div key={item.day} className="flex justify-between items-center py-2 border-b border-[rgba(196,169,122,0.15)]">
                        <span className="text-sm text-[#7A6A58]">{item.day}</span>
                        <span className="text-sm text-[#1C1512] font-medium">{item.hours}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-[#7A6A58] mt-4">
                    {isRu ? "Время по Киевскому часовому поясу (UTC+2/UTC+3)"
                      : isEn ? "Kyiv time zone (UTC+2/UTC+3)"
                      : "Час за Київським часовим поясом (UTC+2/UTC+3)"}
                  </p>
                </div>

                <div className="card-luxury bg-[rgba(196,169,122,0.05)]">
                  <div className="text-center">
                    <p className="font-medium text-[#1C1512] mb-2 text-center" style={{ fontFamily: "var(--font-cormorant)", fontSize: "1.2rem" }}>
                      {isRu ? "Гарантия конфиденциальности" : isEn ? "Confidentiality Guarantee" : "Гарантія конфіденційності"}
                    </p>
                    <p className="text-base text-[#7A6A58] leading-relaxed text-center">
                      {isRu ? "Всё, что вы рассказываете — остаётся между нами."
                        : isEn ? "Everything you share stays between us. I never pass data to third parties."
                        : "Усе, що ви розповідаєте — залишається між нами."}
                    </p>
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
