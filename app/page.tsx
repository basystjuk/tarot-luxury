"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ChevronDown, Heart, Star, Calendar } from "lucide-react";
import AnimatedSection from "@/components/ui/AnimatedSection";
import GoldDivider from "@/components/ui/GoldDivider";
import Testimonials from "@/components/sections/Testimonials";
import * as Accordion from "@radix-ui/react-accordion";
import { useLanguage } from '@/hooks/useLanguage';

export default function HomePage() {
  const { language } = useLanguage();
  const isRu = language === 'ru';

  const services = isRu ? [
    {
      icon: <Heart size={28} strokeWidth={1.5} />,
      title: "Личная консультация",
      description: "Глубокий анализ вашей ситуации с использованием таро и психологических техник. Ответы на самые важные вопросы.",
      price: "от $20",
      href: "/services",
    },
    {
      icon: <Star size={28} strokeWidth={1.5} />,
      title: "Расклад на отношения",
      description: "Расклад для пар и одиночных запросов о партнёрстве. Понять динамику, препятствия и потенциал отношений.",
      price: "от $30",
      href: "/services",
    },
    {
      icon: <Calendar size={28} strokeWidth={1.5} />,
      title: "Прогноз на месяц",
      description: "Краткий прогностический расклад на следующий месяц. Ориентиры, акценты, рекомендации.",
      price: "$65",
      href: "/services",
    },
  ] : [
    {
      icon: <Heart size={28} strokeWidth={1.5} />,
      title: "Особиста консультація",
      description: "Глибокий аналіз вашої ситуації з використанням таро та психологічних технік. Відповіді на найважливіші питання.",
      price: "від $20",
      href: "/services",
    },
    {
      icon: <Star size={28} strokeWidth={1.5} />,
      title: "Розклад на відносини",
      description: "Розклад для пар та одиночних запитів про партнерство. Зрозуміти динаміку, перешкоди та потенціал стосунків.",
      price: "від $30",
      href: "/services",
    },
    {
      icon: <Calendar size={28} strokeWidth={1.5} />,
      title: "Прогноз на місяць",
      description: "Короткий прогностичний розклад на наступний місяць. Орієнтири, акценти, рекомендації.",
      price: "$65",
      href: "/services",
    },
  ];

  const steps = isRu ? [
    { num: "01", title: "Запрос", desc: "Вы формулируете вопрос или тему — я помогаю его прояснить." },
    { num: "02", title: "Консультация", desc: "Живой диалог онлайн или лично. Карты, интуиция, психология." },
    { num: "03", title: "Интерпретация", desc: "Детальное раскрытие каждого аркана в контексте вашей ситуации." },
    { num: "04", title: "Поддержка", desc: "Запись сессии и письменный итог. Я на связи после консультации." },
  ] : [
    { num: "01", title: "Запит", desc: "Ви формулюєте питання або тему — я допомагаю його прояснити." },
    { num: "02", title: "Консультація", desc: "Живий діалог онлайн або особисто. Карти, інтуїція, психологія." },
    { num: "03", title: "Інтерпретація", desc: "Детальне розкриття кожного аркану у контексті вашої ситуації." },
    { num: "04", title: "Підтримка", desc: "Запис сесії та письмовий підсумок. Я на зв'язку після консультації." },
  ];

  const faqs = isRu ? [
    {
      q: "Как проходит онлайн-консультация?",
      a: "Через Zoom или Telegram в удобное для вас время. Качество и глубина — такие же, как при личной встрече. Расстояние не влияет на работу с картами.",
    },
    {
      q: "Нужно ли что-то подготовить к сессии?",
      a: "Желательно сформулировать 1–3 вопроса заранее. Но если нет конкретного запроса — это тоже нормально, вместе найдём фокус.",
    },
    {
      q: "Гарантируете ли вы точность предсказаний?",
      a: "Таро — это не предсказание, а инструмент осознания. Карты показывают тенденции и ресурсы. Окончательный выбор всегда за вами.",
    },
  ] : [
    {
      q: "Як відбувається онлайн-консультація?",
      a: "Через Zoom або Telegram у зручний для вас час. Якість та глибина — такі ж, як і при особистій зустрічі. Відстань не впливає на роботу з картами.",
    },
    {
      q: "Чи потрібно щось підготувати до сесії?",
      a: "Бажано сформулювати 1–3 питання заздалегідь. Але якщо немає конкретного запиту — це теж нормально, разом знайдемо фокус.",
    },
    {
      q: "Чи гарантуєте ви точність передбачень?",
      a: "Таро — це не передбачення, а інструмент усвідомлення. Карти показують тенденції та ресурси. Кінцевий вибір завжди за вами.",
    },
  ];

  const trustItems = isRu
    ? ["500+ консультаций", "4 года практики", "98% довольных"]
    : ["500+ консультацій", "4 роки практики", "98% задоволених"];

  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[#FDFBF7]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(196,169,122,0.18),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_40%_at_80%_80%,rgba(212,168,83,0.08),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_30%_30%_at_20%_60%,rgba(196,169,122,0.06),transparent)]" />

        <div className="absolute top-1/4 left-[8%] w-48 h-48 rounded-full bg-gradient-to-br from-[#E8C98A]/20 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/3 right-[10%] w-64 h-64 rounded-full bg-gradient-to-br from-[#C4A97A]/12 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 right-1/4 w-32 h-32 rounded-full bg-gradient-to-br from-[#D4A853]/10 to-transparent blur-2xl pointer-events-none" />

        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[12%] right-[12%] w-40 h-40 pointer-events-none opacity-25"
        >
          <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="80" cy="80" r="76" stroke="#C4A97A" strokeWidth="0.75" strokeDasharray="4 8" />
            <circle cx="80" cy="80" r="60" stroke="#C4A97A" strokeWidth="0.5" />
            <circle cx="80" cy="4" r="3" fill="#C4A97A" />
          </svg>
        </motion.div>

        <motion.div
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[18%] left-[7%] pointer-events-none opacity-20"
        >
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <path d="M24 2 L24 46 M2 24 L46 24" stroke="#C4A97A" strokeWidth="0.75"/>
            <circle cx="24" cy="24" r="8" stroke="#C4A97A" strokeWidth="0.75"/>
          </svg>
        </motion.div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center pt-32 pb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.19, 1, 0.22, 1] }}
          >
            <span className="tag mb-8 inline-block">
              {isRu ? "Таро · Психология · Отношения" : "Таро · Психологія · Відносини"}
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.19, 1, 0.22, 1] }}
            className="text-[clamp(2.4rem,6vw,5.5rem)] leading-[1.06] tracking-[-0.025em] mb-8 text-[#1C1512]"
            style={{ fontFamily: "var(--font-cormorant)", fontWeight: 400 }}
          >
            {isRu ? (
              <>Когда слова не помогают —{" "}<em className="gradient-text not-italic">карты расскажут правду</em></>
            ) : (
              <>Коли слова не допомагають —{" "}<em className="gradient-text not-italic">карти розкажуть правду</em></>
            )}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.19, 1, 0.22, 1] }}
            className="text-lg text-[#7A6A58] max-w-xl mx-auto mb-10 leading-relaxed"
          >
            {isRu
              ? "Ellen Soul — сертифицированный таро-консультант и психолог с 4-летним опытом работы с темами любви, самопознания и женских отношений."
              : "Ellen Soul — сертифікований таро-консультант і психолог з 4-річним досвідом роботи з темами кохання, самопізнання та жіночих стосунків."}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.19, 1, 0.22, 1] }}
            className="flex flex-wrap gap-4 justify-center mb-16"
          >
            <Link href="/contacts" className="btn-primary">
              {isRu ? "Записаться на консультацию" : "Записатись на консультацію"}
              <ArrowRight size={16} />
            </Link>
            <Link href="/about" className="btn-outline">
              {isRu ? "Дізнатись більше" : "Дізнатись більше"}
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-[#7A6A58]"
          >
            {trustItems.map((item, i) => (
              <span key={i} className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-[#C4A97A] inline-block" />
                {item}
              </span>
            ))}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[#C4A97A]"
        >
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }}>
            <ChevronDown size={20} />
          </motion.div>
        </motion.div>
      </section>

      {/* ── Services Preview ──────────────────────────────────────────── */}
      <section className="section-padding bg-[#F2EBD9]">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <AnimatedSection className="text-center mb-14">
            <span className="tag mb-4 inline-block">{isRu ? "Услуги" : "Послуги"}</span>
            <h2
              className="text-[clamp(2rem,4vw,3.5rem)] text-[#1C1512]"
              style={{ fontFamily: "var(--font-cormorant)" }}
            >
              {isRu ? "Чем я могу помочь" : "Чим я можу допомогти"}
            </h2>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-6">
            {services.map((svc, i) => (
              <AnimatedSection key={i} delay={i * 0.1}>
                <Link href={svc.href} className="group block h-full">
                  <div className="card-luxury h-full flex flex-col">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#E8C98A] to-[#C4A97A] flex items-center justify-center text-white mb-6 transition-transform duration-300 group-hover:scale-110">
                      {svc.icon}
                    </div>
                    <h3
                      className="text-2xl mb-3 text-[#1C1512]"
                      style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}
                    >
                      {svc.title}
                    </h3>
                    <p className="text-[#7A6A58] text-sm leading-relaxed mb-6 flex-1">
                      {svc.description}
                    </p>
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-[rgba(196,169,122,0.2)]">
                      <span className="text-[#B8883A] font-medium text-sm">{svc.price}</span>
                      <ArrowRight
                        size={18}
                        className="text-[#C4A97A] group-hover:text-[#B8883A] group-hover:translate-x-1 transition-all"
                      />
                    </div>
                  </div>
                </Link>
              </AnimatedSection>
            ))}
          </div>

          <AnimatedSection delay={0.35} className="text-center mt-10">
            <Link href="/services" className="btn-outline">
              {isRu ? "Все услуги и цены" : "Всі послуги та ціни"}
              <ArrowRight size={16} />
            </Link>
          </AnimatedSection>
        </div>
      </section>

      <GoldDivider />

      {/* ── About Teaser ──────────────────────────────────────────────── */}
      <section className="section-padding bg-[#FDFBF7]">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <AnimatedSection direction="right">
              <span className="tag mb-6 inline-block">{isRu ? "Обо мне" : "Про мене"}</span>
              <h2
                className="text-[clamp(2rem,4vw,3.5rem)] mb-6 text-[#1C1512] leading-[1.1]"
                style={{ fontFamily: "var(--font-cormorant)" }}
              >
                {isRu
                  ? "Практик, который чувствует — и помогает почувствовать вам"
                  : "Практик, який відчуває — і допомагає відчути вам"}
              </h2>
              <blockquote
                className="border-l-2 border-[#C4A97A] pl-6 mb-8 text-xl text-[#5C4530]"
                style={{ fontFamily: "var(--font-cormorant)", fontStyle: "italic" }}
              >
                {isRu
                  ? '"Карты не отвечают на вопросы — они помогают вам услышать собственное сердце."'
                  : '"Карти не відповідають на запитання — вони допомагають вам почути власне серце."'}
              </blockquote>
              <p className="text-[#7A6A58] leading-relaxed mb-8">
                {isRu
                  ? "Четыре года практики, сотни консультаций и постоянное обучение — я сочетаю традиционную работу с таро и современные психологические подходы, чтобы дать вам не только ответ, но и понимание."
                  : "Чотири роки практики, сотні консультацій і постійне навчання — я поєдную традиційну роботу з таро та сучасні психологічні підходи, щоб дати вам не лише відповідь, але й розуміння."}
              </p>
              <Link href="/about" className="btn-outline">
                {isRu ? "Подробнее обо мне" : "Дізнатись більше про мене"}
                <ArrowRight size={16} />
              </Link>
            </AnimatedSection>

            <AnimatedSection direction="left" delay={0.1}>
              <div className="relative flex justify-center">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-[340px] h-[340px] rounded-full border border-[rgba(196,169,122,0.2)]" />
                </div>
                <div className="relative w-[280px] h-[360px] rounded-[50%] bg-gradient-to-b from-[#E8DCC5] via-[#D4B88A] to-[#C4A97A] shadow-[0_20px_80px_rgba(196,169,122,0.3)]">
                  <div className="absolute inset-0 rounded-[50%] bg-gradient-to-b from-transparent via-transparent to-[rgba(28,21,18,0.15)]" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span
                      className="text-7xl text-white/60"
                      style={{ fontFamily: "var(--font-cormorant)", fontWeight: 300 }}
                    >
                      О
                    </span>
                  </div>
                </div>
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute bottom-4 -right-4 card-luxury !p-4 !rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.1)]"
                >
                  <p className="text-xs text-[#7A6A58] mb-1">{isRu ? "Опыт" : "Досвід"}</p>
                  <p
                    className="text-2xl text-[#B8883A]"
                    style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}
                  >
                    {isRu ? "4 года" : "4 роки"}
                  </p>
                </motion.div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      <GoldDivider />

      {/* ── Process ───────────────────────────────────────────────────── */}
      <section className="section-padding bg-[#F2EBD9]">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <AnimatedSection className="text-center mb-16">
            <span className="tag mb-4 inline-block">
              {isRu ? "Как это происходит" : "Як це відбувається"}
            </span>
            <h2
              className="text-[clamp(2rem,4vw,3.5rem)]"
              style={{ fontFamily: "var(--font-cormorant)" }}
            >
              {isRu ? "4 шага к ясности" : "4 кроки до ясності"}
            </h2>
          </AnimatedSection>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            <div className="hidden lg:block absolute top-8 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-[#C4A97A] to-transparent" />

            {steps.map((step, i) => (
              <AnimatedSection key={i} delay={i * 0.1}>
                <div className="relative text-center pt-4">
                  <div className="w-16 h-16 rounded-full border-2 border-[#C4A97A] bg-[#FDFBF7] flex items-center justify-center mx-auto mb-6 relative z-10">
                    <span
                      className="text-xl text-[#B8883A]"
                      style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}
                    >
                      {step.num}
                    </span>
                  </div>
                  <h3
                    className="text-2xl mb-3 text-[#1C1512]"
                    style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}
                  >
                    {step.title}
                  </h3>
                  <p className="text-sm text-[#7A6A58] leading-relaxed max-w-[200px] mx-auto">
                    {step.desc}
                  </p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ──────────────────────────────────────────────── */}
      <Testimonials />

      {/* ── FAQ Preview ───────────────────────────────────────────────── */}
      <section className="section-padding bg-[#FDFBF7]">
        <div className="max-w-3xl mx-auto px-6 lg:px-10">
          <AnimatedSection className="text-center mb-12">
            <span className="tag mb-4 inline-block">
              {isRu ? "Вопросы и ответы" : "Питання та відповіді"}
            </span>
            <h2
              className="text-[clamp(2rem,4vw,3.5rem)]"
              style={{ fontFamily: "var(--font-cormorant)" }}
            >
              {isRu ? "Часто задаваемые вопросы" : "Найчастіші запитання"}
            </h2>
          </AnimatedSection>

          <AnimatedSection delay={0.1}>
            <Accordion.Root type="single" collapsible className="space-y-3">
              {faqs.map((faq, i) => (
                <Accordion.Item
                  key={i}
                  value={`faq-${i}`}
                  className="card-luxury !p-0 overflow-hidden"
                >
                  <Accordion.Trigger className="w-full flex items-center justify-between px-6 py-5 text-left group">
                    <span
                      className="text-xl text-[#1C1512] group-data-[state=open]:text-[#B8883A] transition-colors"
                      style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}
                    >
                      {faq.q}
                    </span>
                    <ChevronDown
                      size={18}
                      className="text-[#C4A97A] flex-shrink-0 ml-4 transition-transform duration-300 group-data-[state=open]:rotate-180"
                    />
                  </Accordion.Trigger>
                  <Accordion.Content className="px-6 pb-5 text-[#7A6A58] text-sm leading-relaxed">
                    {faq.a}
                  </Accordion.Content>
                </Accordion.Item>
              ))}
            </Accordion.Root>
          </AnimatedSection>

          <AnimatedSection delay={0.2} className="text-center mt-10">
            <Link href="/faq" className="btn-outline">
              {isRu ? "Все вопросы" : "Всі питання"}
              <ArrowRight size={16} />
            </Link>
          </AnimatedSection>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────────────── */}
      <section className="section-padding bg-[#2D2218] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_70%_at_50%_50%,rgba(196,169,122,0.08),transparent)]" />
        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <AnimatedSection>
            <span
              className="block text-[#C4A97A] text-sm tracking-[0.15em] uppercase mb-6"
              style={{ fontFamily: "var(--font-jost)" }}
            >
              {isRu ? "Готова сделать первый шаг?" : "Готова зробити перший крок?"}
            </span>
            <h2
              className="text-[clamp(2.5rem,5vw,4.5rem)] text-white mb-8 leading-[1.08]"
              style={{ fontFamily: "var(--font-cormorant)", fontWeight: 300 }}
            >
              {isRu ? "Готова узнать правду?" : "Готова дізнатись правду?"}
            </h2>
            <p className="text-white/50 mb-10 text-lg max-w-md mx-auto">
              {isRu
                ? "Запишись на консультацию — и уже через час получишь ясность там, где сейчас туман."
                : "Запишись на консультацію — і вже через годину матимеш ясність там, де зараз туман."}
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <a
                href="https://t.me/olena_tarot"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
              >
                Telegram
              </a>
              <a
                href="https://instagram.com/olena_tarot"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline !border-white/30 !text-white hover:!border-[#D4A853] hover:!text-[#D4A853]"
              >
                Instagram
              </a>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
