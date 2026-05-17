"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ChevronDown, Heart, Star, Calendar } from "lucide-react";
import AnimatedSection from "@/components/ui/AnimatedSection";
import GoldDivider from "@/components/ui/GoldDivider";
import Testimonials from "@/components/sections/Testimonials";
import * as Accordion from "@radix-ui/react-accordion";
import { useLanguage } from '@/hooks/useLanguage';

const services = [
  {
    icon: <Heart size={28} strokeWidth={1.5} />,
    title: "Особиста консультація",
    description: "Глибокий аналіз вашої ситуації з використанням таро та психологічних технік. Відповіді на найважливіші питання.",
    price: "від 800 грн",
    href: "/services#personal",
  },
  {
    icon: <Star size={28} strokeWidth={1.5} />,
    title: "Аналіз відносин",
    description: "Розклад для пар та одиночних запитів про партнерство. Зрозуміти динаміку, перешкоди та потенціал стосунків.",
    price: "від 1200 грн",
    href: "/services#couple",
  },
  {
    icon: <Calendar size={28} strokeWidth={1.5} />,
    title: "Картка місяця",
    description: "Короткий прогностичний розклад на наступний місяць. Орієнтири, акценти, рекомендації.",
    price: "від 400 грн",
    href: "/services#month",
  },
];

const steps = [
  { num: "01", title: "Запит", desc: "Ви формулюєте питання або тему — я допомагаю його прояснити." },
  { num: "02", title: "Консультація", desc: "Живий діалог онлайн або особисто. Карти, інтуїція, психологія." },
  { num: "03", title: "Інтерпретація", desc: "Детальне розкриття кожного аркану у контексті вашої ситуації." },
  { num: "04", title: "Підтримка", desc: "Запис сесії та письмовий підсумок. Я на звʼязку після консультації." },
];

const faqs = [
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

export default function HomePage() {
  const { t } = useLanguage();

  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
        {/* Background layers */}
        <div className="absolute inset-0 bg-[#FDFBF7]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(196,169,122,0.18),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_40%_at_80%_80%,rgba(212,168,83,0.08),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_30%_30%_at_20%_60%,rgba(196,169,122,0.06),transparent)]" />

        {/* Decorative bokeh circles */}
        <div className="absolute top-1/4 left-[8%] w-48 h-48 rounded-full bg-gradient-to-br from-[#E8C98A]/20 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/3 right-[10%] w-64 h-64 rounded-full bg-gradient-to-br from-[#C4A97A]/12 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 right-1/4 w-32 h-32 rounded-full bg-gradient-to-br from-[#D4A853]/10 to-transparent blur-2xl pointer-events-none" />

        {/* Rotating decorative circle SVG */}
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

        {/* Floating ornament bottom-left */}
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

        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center pt-32 pb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.19, 1, 0.22, 1] }}
          >
            <span className="tag mb-8 inline-block">Таро · Психологія · Відносини</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.19, 1, 0.22, 1] }}
            className="text-[clamp(2.4rem,6vw,5.5rem)] leading-[1.06] tracking-[-0.025em] mb-8 text-[#1C1512]"
            style={{ fontFamily: "var(--font-cormorant)", fontWeight: 400 }}
          >
            Коли слова не допомагають —{" "}
            <em className="gradient-text not-italic">карти розкажуть правду</em>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.19, 1, 0.22, 1] }}
            className="text-lg text-[#7A6A58] max-w-xl mx-auto mb-10 leading-relaxed"
          >
            Ellen Soul — сертифікований таро-консультант і психолог з 4-річним досвідом роботи з темами кохання, самопізнання та жіночих стосунків.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.19, 1, 0.22, 1] }}
            className="flex flex-wrap gap-4 justify-center mb-16"
          >
            <Link href="/contacts" className="btn-primary">
              {t('home.hero.cta.primary')}
              <ArrowRight size={16} />
            </Link>
            <Link href="/about" className="btn-outline">
              {t('home.hero.cta.secondary')}
            </Link>
          </motion.div>

          {/* Trust row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-[#7A6A58]"
          >
            {["500+ консультацій", "4 роки практики", "98% задоволених"].map((item, i) => (
              <span key={i} className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-[#C4A97A] inline-block" />
                {item}
              </span>
            ))}
          </motion.div>
        </div>

        {/* Scroll indicator */}
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
            <span className="tag mb-4 inline-block">Послуги</span>
            <h2
              className="text-[clamp(2rem,4vw,3.5rem)] text-[#1C1512]"
              style={{ fontFamily: "var(--font-cormorant)" }}
            >
              Чим я можу допомогти
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
              Всі послуги та ціни
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
              <span className="tag mb-6 inline-block">Про мене</span>
              <h2
                className="text-[clamp(2rem,4vw,3.5rem)] mb-6 text-[#1C1512] leading-[1.1]"
                style={{ fontFamily: "var(--font-cormorant)" }}
              >
                Практик, який відчуває — і допомагає відчути вам
              </h2>
              <blockquote
                className="border-l-2 border-[#C4A97A] pl-6 mb-8 text-xl text-[#5C4530]"
                style={{ fontFamily: "var(--font-cormorant)", fontStyle: "italic" }}
              >
                "Карти не відповідають на запитання — вони допомагають вам почути власне серце."
              </blockquote>
              <p className="text-[#7A6A58] leading-relaxed mb-8">
                Чотири роки практики, сотні консультацій і постійне навчання — я поєдную традиційну роботу з таро та сучасні психологічні підходи, щоб дати вам не лише відповідь, але й розуміння.
              </p>
              <Link href="/about" className="btn-outline">
                {t('home.hero.cta.secondary')} про мене
                <ArrowRight size={16} />
              </Link>
            </AnimatedSection>

            {/* Visual placeholder */}
            <AnimatedSection direction="left" delay={0.1}>
              <div className="relative flex justify-center">
                {/* Outer decorative ring */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-[340px] h-[340px] rounded-full border border-[rgba(196,169,122,0.2)]" />
                </div>
                {/* Portrait oval */}
                <div className="relative w-[280px] h-[360px] rounded-[50%] bg-gradient-to-b from-[#E8DCC5] via-[#D4B88A] to-[#C4A97A] shadow-[0_20px_80px_rgba(196,169,122,0.3)]">
                  {/* Subtle inner gradient for depth */}
                  <div className="absolute inset-0 rounded-[50%] bg-gradient-to-b from-transparent via-transparent to-[rgba(28,21,18,0.15)]" />
                  {/* Monogram */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span
                      className="text-7xl text-white/60"
                      style={{ fontFamily: "var(--font-cormorant)", fontWeight: 300 }}
                    >
                      О
                    </span>
                  </div>
                </div>
                {/* Small floating badge */}
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute bottom-4 -right-4 card-luxury !p-4 !rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.1)]"
                >
                  <p className="text-xs text-[#7A6A58] mb-1">Досвід</p>
                  <p
                    className="text-2xl text-[#B8883A]"
                    style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}
                  >
                    4 роки
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
            <span className="tag mb-4 inline-block">Як це відбувається</span>
            <h2
              className="text-[clamp(2rem,4vw,3.5rem)]"
              style={{ fontFamily: "var(--font-cormorant)" }}
            >
              4 кроки до ясності
            </h2>
          </AnimatedSection>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {/* Connector line (desktop) */}
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
            <span className="tag mb-4 inline-block">Питання та відповіді</span>
            <h2
              className="text-[clamp(2rem,4vw,3.5rem)]"
              style={{ fontFamily: "var(--font-cormorant)" }}
            >
              Найчастіші запитання
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
              Всі питання
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
              Готова зробити перший крок?
            </span>
            <h2
              className="text-[clamp(2.5rem,5vw,4.5rem)] text-white mb-8 leading-[1.08]"
              style={{ fontFamily: "var(--font-cormorant)", fontWeight: 300 }}
            >
              Готова дізнатись правду?
            </h2>
            <p className="text-white/50 mb-10 text-lg max-w-md mx-auto">
              Запишись на консультацію — і вже через годину матимеш ясність там, де зараз туман.
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
