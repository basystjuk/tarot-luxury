"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import HeroPhoto from "@/components/ui/HeroPhoto";
import { ArrowRight, ChevronDown } from "lucide-react";
import AnimatedSection from "@/components/ui/AnimatedSection";
import GoldDivider from "@/components/ui/GoldDivider";
import { TodayWidget } from "./_today-widget";
import * as Accordion from "@radix-ui/react-accordion";
import { useLanguage } from '@/hooks/useLanguage';
import { isToolEnabled, type ToolId } from "@/lib/tools-config";

export default function HomePageClient({ photoUrl }: { photoUrl: string }) {
  const { language } = useLanguage();
  const isRu = language === 'ru';
  const isEn = language === 'en';

  const [apiAbout, setApiAbout] = React.useState<{
    story_text_uk: string; story_text_ru: string; story_text_en: string;
    quote_uk: string; quote_ru: string; quote_en: string;
  } | null>(null);
  const [toolsEnabled, setToolsEnabled] = React.useState<Partial<Record<ToolId, boolean>> | null>(null);
  const [previewMode, setPreviewMode] = React.useState(false);

  React.useEffect(() => {
    fetch("/api/content")
      .then(r => r.json())
      .then(d => {
        if (d.about) setApiAbout(d.about);
        if (d.tools_enabled) setToolsEnabled(d.tools_enabled);
        setPreviewMode(Boolean(d.preview));
      })
      .catch(() => {});
  }, []);

  const bioText = apiAbout
    ? (isRu ? apiAbout.story_text_ru : isEn ? apiAbout.story_text_en : apiAbout.story_text_uk)
    : isRu
    ? "Практикую Таро больше 5 лет. Для меня Таро — это не «волшебная пилюля», а разговор. С вами, с вашей ситуацией, с тем, что вы в глубине уже знаете. Главное направление — любовь и отношения."
    : isEn
    ? "I have been practising Tarot for over 5 years. Tarot is not a magic pill — it is a conversation with you and your situation. My main focus is love and relationships."
    : "Практикую Таро більше 5 років. Для мене Таро — це не «чарівна таблетка», а розмова. З вами, з вашою ситуацією, з тим, що ви в глибині вже знаєте. Головний напрям — любов і стосунки.";

  const quoteText = apiAbout
    ? (isRu ? apiAbout.quote_ru : isEn ? apiAbout.quote_en : apiAbout.quote_uk)
    : isRu ? "Таро расклады с душой." : isEn ? "Tarot readings with soul." : "Таро розклади з душею.";

  const trustItems = isRu
    ? ["5+ лет практики", "Клиенты из 12 стран"]
    : isEn
    ? ["5+ years of practice", "Clients from 12 countries"]
    : ["5+ років практики", "Клієнти з 12 країн"];

  const studioTools = isRu ? [
    {
      href: `/${language}/studio/daily-card`,
      glyph: "✦",
      accent: "from-[#B8883A] to-[#9A6E28]",
      title: "Карта дня",
      subtitle: "Таро",
      desc: "Ежедневная карта Таро — персональное предсказание и медитация на сегодня.",
    },
    {
      href: `/${language}/studio/numerology`,
      glyph: "∞",
      accent: "from-[#D4A853] to-[#C4A97A]",
      title: "Нумерология",
      subtitle: "Нумерология",
      desc: "Ваше число Судьбы, Пути, Души и Личности по имени и дате рождения.",
    },
    {
      href: `/${language}/studio/compatibility`,
      glyph: "♡",
      accent: "from-[#E8C98A] to-[#C4A97A]",
      title: "Карта совместимости",
      subtitle: "Астрология · Нумерология",
      desc: "Знаки зодиака и числа судьбы двух людей — полный анализ совместимости пары.",
    },
    {
      href: `/${language}/studio/moon-phase`,
      glyph: "🌙",
      accent: "from-[#C4A97A] to-[#9A6E28]",
      title: "Лунный проводник",
      subtitle: "Луна · Астрология",
      desc: "Точная фаза, знак и градус Луны на любую дату. Тёмная Луна, Void of Course, узлы, Лилит — личное лунное послание.",
    },
    {
      href: `/${language}/studio/natal-chart`,
      glyph: "✺",
      accent: "from-[#9A6E28] to-[#5A3E18]",
      title: "Натальная карта",
      subtitle: "Астрология",
      desc: "Полный астрологический портрет: планеты, дома, аспекты — ваш космический паспорт с колесом карты.",
    },
    {
      href: `/${language}/studio/horoscope`,
      glyph: "☉",
      accent: "from-[#E8C98A] to-[#9A6E28]",
      title: "Гороскоп дня",
      subtitle: "Астрология + Нумерология",
      desc: "Персональный гороскоп на сегодня: конвергенция транзитов, окна удачи с точностью до минуты.",
    },
    {
      href: `/${language}/studio/year-forecast`,
      glyph: "❂",
      accent: "from-[#D4A853] to-[#9A6E28]",
      title: "Прогноз года",
      subtitle: "Соляр · Прогрессии",
      desc: "Прогноз на год: соляр задаёт тему, прогрессивная Луна — вашу эмоциональную пору. С колесом солнечного возвращения.",
    },
  ] : isEn ? [
    {
      href: `/${language}/studio/daily-card`,
      glyph: "✦",
      accent: "from-[#B8883A] to-[#9A6E28]",
      title: "Card of the Day",
      subtitle: "Tarot",
      desc: "Daily Tarot card — your personal reading and meditation for today.",
    },
    {
      href: `/${language}/studio/numerology`,
      glyph: "∞",
      accent: "from-[#D4A853] to-[#C4A97A]",
      title: "Numerology",
      subtitle: "Numerology",
      desc: "Your Destiny, Life Path, Soul and Personality numbers by name and date of birth.",
    },
    {
      href: `/${language}/studio/compatibility`,
      glyph: "♡",
      accent: "from-[#E8C98A] to-[#C4A97A]",
      title: "Compatibility Map",
      subtitle: "Astrology · Numerology",
      desc: "Zodiac signs and destiny numbers of two people — full couple compatibility analysis.",
    },
    {
      href: `/${language}/studio/moon-phase`,
      glyph: "🌙",
      accent: "from-[#C4A97A] to-[#9A6E28]",
      title: "Moon Guide",
      subtitle: "Moon · Astrology",
      desc: "The precise Moon phase, sign and degree for any date. Dark Moon, Void of Course, nodes, Lilith — a personal lunar message.",
    },
    {
      href: `/${language}/studio/natal-chart`,
      glyph: "✺",
      accent: "from-[#9A6E28] to-[#5A3E18]",
      title: "Natal Chart",
      subtitle: "Astrology",
      desc: "A full astrological portrait: planets, houses, aspects — your cosmic passport with a chart wheel.",
    },
    {
      href: `/${language}/studio/horoscope`,
      glyph: "☉",
      accent: "from-[#E8C98A] to-[#9A6E28]",
      title: "Daily Horoscope",
      subtitle: "Astrology + Numerology",
      desc: "Your personal horoscope for today: transit convergence, windows of luck down to the minute.",
    },
    {
      href: `/${language}/studio/year-forecast`,
      glyph: "❂",
      accent: "from-[#D4A853] to-[#9A6E28]",
      title: "Year Forecast",
      subtitle: "Solar Return · Progressions",
      desc: "Your year ahead: the Solar Return sets the theme, the progressed Moon your emotional season. With a solar-return wheel.",
    },
  ] : [
    {
      href: `/${language}/studio/daily-card`,
      glyph: "✦",
      accent: "from-[#B8883A] to-[#9A6E28]",
      title: "Карта дня",
      subtitle: "Таро",
      desc: "Щоденна карта Таро — персональне передбачення та медитація на сьогодні.",
    },
    {
      href: `/${language}/studio/numerology`,
      glyph: "∞",
      accent: "from-[#D4A853] to-[#C4A97A]",
      title: "Нумерологія",
      subtitle: "Нумерологія",
      desc: "Ваше число Долі, Шляху, Душі та Особистості за ім'ям і датою народження.",
    },
    {
      href: `/${language}/studio/compatibility`,
      glyph: "♡",
      accent: "from-[#E8C98A] to-[#C4A97A]",
      title: "Карта сумісності",
      subtitle: "Астрологія · Нумерологія",
      desc: "Знаки зодіаку та числа долі двох людей — повний аналіз сумісності пари.",
    },
    {
      href: `/${language}/studio/moon-phase`,
      glyph: "🌙",
      accent: "from-[#C4A97A] to-[#9A6E28]",
      title: "Місячний провідник",
      subtitle: "Місяць · Астрологія",
      desc: "Точна фаза, знак і градус Місяця на будь-яку дату. Темний Місяць, Void of Course, вузли, Ліліт — особисте місячне послання.",
    },
    {
      href: `/${language}/studio/natal-chart`,
      glyph: "✺",
      accent: "from-[#9A6E28] to-[#5A3E18]",
      title: "Натальна карта",
      subtitle: "Астрологія",
      desc: "Повний астрологічний портрет: планети, доми, аспекти — твій космічний паспорт з колесом карти.",
    },
    {
      href: `/${language}/studio/horoscope`,
      glyph: "☉",
      accent: "from-[#E8C98A] to-[#9A6E28]",
      title: "Гороскоп дня",
      subtitle: "Астрологія + Нумерологія",
      desc: "Персональний гороскоп на сьогодні: конвергенція транзитів, вікна удачі з точністю до хвилини.",
    },
    {
      href: `/${language}/studio/year-forecast`,
      glyph: "❂",
      accent: "from-[#D4A853] to-[#9A6E28]",
      title: "Прогноз року",
      subtitle: "Соляр · Прогресії",
      desc: "Прогноз на рік: соляр задає тему, прогресивний Місяць — твою емоційну пору. З колесом сонячного повернення.",
    },
  ];

  const services = isRu ? [
    { icon: "❓", title: "Один вопрос", description: "Детальный анализ одного волнующего вопроса через призму карт таро.", price: "$20", href: `/${language}/services#question` },
    { icon: "💕", title: "Расклад Амур", description: "Специализированный расклад на любовь и отношения — шесть ключевых аспектов.", price: "$60", href: `/${language}/services#amor` },
    { icon: "✨", title: "Онлайн таро сессия", description: "Общение, после которого становится легче и обретается внутреннее спокойствие.", price: "$100", href: `/${language}/services#session` },
  ] : isEn ? [
    { icon: "❓", title: "One Question", description: "Detailed analysis of one burning question through the lens of tarot cards.", price: "$20", href: `/${language}/services#question` },
    { icon: "💕", title: "Amour Spread", description: "A specialised spread for love and relationships — six key aspects.", price: "$60", href: `/${language}/services#amor` },
    { icon: "✨", title: "Online Tarot Session", description: "A conversation after which you feel lighter and find inner peace.", price: "$100", href: `/${language}/services#session` },
  ] : [
    { icon: "❓", title: "Одне питання", description: "Детальний аналіз одного хвилюючого питання через призму карт таро.", price: "$20", href: `/${language}/services#question` },
    { icon: "💕", title: "Розклад Амур", description: "Спеціалізований розклад на любов і стосунки — шість ключових аспектів.", price: "$60", href: `/${language}/services#amor` },
    { icon: "✨", title: "Онлайн таро сесія", description: "Спілкування, після якого стає легше і знаходиш внутрішній спокій.", price: "$100", href: `/${language}/services#session` },
  ];

  const faqs = isRu ? [
    { q: "Как проходит онлайн-консультация?", a: "Через Zoom или Telegram в удобное для вас время. Качество и глубина — такие же, как при личной встрече. Расстояние не влияет на работу с картами." },
    { q: "Нужно ли что-то подготовить к сессии?", a: "Желательно сформулировать 1–3 вопроса заранее. Но если нет конкретного запроса — это тоже нормально, вместе найдём фокус." },
    { q: "Гарантируете ли вы точность предсказаний?", a: "Таро — это не предсказание, а инструмент осознания. Карты показывают тенденции и ресурсы. Окончательный выбор всегда за вами." },
  ] : isEn ? [
    { q: "How does an online consultation work?", a: "Via Zoom or Telegram at a time convenient for you. The quality and depth are the same as an in-person meeting. Distance does not affect the card reading." },
    { q: "Do I need to prepare anything for the session?", a: "It's helpful to formulate 1–3 questions in advance. But if you have no specific request — that's fine too, we'll find the focus together." },
    { q: "Do you guarantee the accuracy of predictions?", a: "Tarot is not a prediction, but a tool for awareness. Cards show tendencies and resources. The final choice is always yours." },
  ] : [
    { q: "Як відбувається онлайн-консультація?", a: "Через Zoom або Telegram у зручний для вас час. Якість та глибина — такі ж, як і при особистій зустрічі. Відстань не впливає на роботу з картами." },
    { q: "Чи потрібно щось підготувати до сесії?", a: "Бажано сформулювати 1–3 питання заздалегідь. Але якщо немає конкретного запиту — це теж нормально, разом знайдемо фокус." },
    { q: "Чи гарантуєте ви точність передбачень?", a: "Таро — це не передбачення, а інструмент усвідомлення. Карти показують тенденції та ресурси. Кінцевий вибір завжди за вами." },
  ];

  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section data-nav-section="hero" className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[#FDFBF7]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(196,169,122,0.18),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_40%_at_80%_80%,rgba(212,168,83,0.08),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_30%_30%_at_20%_60%,rgba(196,169,122,0.06),transparent)]" />

        <div className="absolute top-1/4 left-[8%] w-48 h-48 rounded-full bg-gradient-to-br from-[#E8C98A]/20 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/3 right-[10%] w-64 h-64 rounded-full bg-gradient-to-br from-[#C4A97A]/12 to-transparent blur-3xl pointer-events-none" />

        {/* Decorative rotating circle — pure CSS animation (no JS) */}
        <div className="absolute top-[12%] right-[6%] w-36 h-36 pointer-events-none opacity-20 animate-slow-spin">
          <svg viewBox="0 0 160 160" fill="none"><circle cx="80" cy="80" r="76" stroke="#C4A97A" strokeWidth="0.75" strokeDasharray="4 8" /><circle cx="80" cy="80" r="60" stroke="#C4A97A" strokeWidth="0.5" /><circle cx="80" cy="4" r="3" fill="#C4A97A" /></svg>
        </div>

        <div className="absolute bottom-[18%] left-[7%] pointer-events-none opacity-15 animate-float">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none"><path d="M24 2 L24 46 M2 24 L46 24" stroke="#C4A97A" strokeWidth="0.75"/><circle cx="24" cy="24" r="8" stroke="#C4A97A" strokeWidth="0.75"/></svg>
        </div>

        <div className="relative z-10 w-full max-w-6xl mx-auto px-6 lg:px-10 pt-28 pb-20">
          {/* Tag — NO motion: above-the-fold, must render synchronously */}
          <div className="text-center mb-10">
            <span className="tag inline-block">
              {isRu ? "Таро проводник" : isEn ? "Tarot Guide" : "Таро провідник"}
            </span>
          </div>

          {/* Two-column: text + photo */}
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left — text (order-2 on mobile so photo appears first). NO motion: LCP critical */}
            <div className="order-2 lg:order-1">
              <h1
                className="text-[clamp(2.4rem,5vw,4.5rem)] leading-[1.08] tracking-[-0.02em] mb-6 text-[#1C1512] text-center lg:text-left"
                style={{ fontFamily: "var(--font-cormorant)", fontWeight: 400 }}
              >
                {isRu
                  ? "Проводник, который помогает найти правильную дорогу"
                  : isEn
                  ? "A guide who helps you find the right path"
                  : "Провідник, який допомагає знайти правильну дорогу"}
              </h1>

              <blockquote
                className="lg:border-l-2 lg:border-[#C4A97A] lg:pl-5 mb-6 text-xl text-[#5C4530] text-center lg:text-left"
                style={{ fontFamily: "var(--font-cormorant)", fontStyle: "italic" }}
              >
                {isRu
                  ? "«Карты не отвечают на вопросы — они помогают вам услышать собственное сердце.»"
                  : isEn
                  ? "\"Cards don't answer questions — they help you hear your own heart.\""
                  : "«Карти не відповідають на запитання — вони допомагають вам почути власне серце.»"}
              </blockquote>

              <p className="text-[#7A6A58] leading-relaxed mb-8 text-base lg:text-lg text-center lg:text-left">
                {isRu
                  ? "Сотни консультаций и постоянное обучение — я сочетаю традиционную работу с таро и современные психологические подходы, чтобы дать вам не только ответ, но и понимание."
                  : isEn
                  ? "Hundreds of consultations and continuous learning — I combine traditional tarot with modern psychological approaches to give you not just an answer, but understanding."
                  : "Сотні консультацій та постійне навчання — я поєдную традиційну роботу з таро та сучасні психологічні підходи, щоб дати вам не лише відповідь, але й розуміння."}
              </p>

              <div className="flex flex-wrap gap-4 mb-10 justify-center lg:justify-start">
                <Link href={`/${language}/about`} className="btn-primary">
                  {isRu ? "Узнать больше обо мне" : isEn ? "Learn more about me" : "Дізнатись більше про мене"}
                </Link>
              </div>

              {/* Trust stats */}
              <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-[#7A6A58] justify-center lg:justify-start">
                {trustItems.map((item, i) => (
                  <span key={i} className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-[#C4A97A] inline-block" />
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Right — photo (order-1 on mobile so it appears first). NO motion wrapper: LCP must render immediately */}
            <div className="relative flex justify-center order-1 lg:order-2">
              {/* Decorative rings — hidden on mobile */}
              <div className="hidden lg:flex absolute inset-0 items-center justify-center pointer-events-none">
                <div className="w-[350px] h-[350px] rounded-full border border-[rgba(196,169,122,0.2)]" />
              </div>
              <div className="hidden lg:flex absolute inset-0 items-center justify-center pointer-events-none">
                <div className="w-[290px] h-[290px] rounded-full border border-[rgba(196,169,122,0.1)]" />
              </div>

              {/* Photo */}
              <div className="flex flex-col items-center gap-3">
                <div className="relative w-[280px] h-[370px] lg:w-[310px] lg:h-[410px] rounded-3xl overflow-hidden shadow-[0_24px_80px_rgba(196,169,122,0.3)] bg-[#EDE5D4]">
                  <HeroPhoto
                    photoUrl={photoUrl}
                    alt="Ellen Soul — таролог онлайн"
                    width={310}
                    height={410}
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[rgba(28,21,18,0.1)]" />
                </div>
                {/* Badge under photo */}
                <div className="px-5 py-2 rounded-full border border-[rgba(196,169,122,0.35)] bg-white/60 backdrop-blur-sm">
                  <p className="text-[#C4A97A] text-xs tracking-[0.18em] uppercase">Ellen Soul · Tarot</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator — pure CSS bounce, no JS */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[#C4A97A] animate-bounce-soft">
          <ChevronDown size={20} />
        </div>
      </section>

      <GoldDivider />

      {/* ── Today widget (Bonus 1) — single-glance combined daily state ──
           Auto-switches between anonymous teaser and personalised view
           depending on whether the visitor is signed in with natal data. */}
      <TodayWidget />

      {/* ── Soul Studio ──────────────────────────────────────────────── */}
      <section data-nav-section="studio" className="section-padding relative overflow-hidden bg-[#F2EBD9]">
        {/* Subtle inner glow top */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(196,169,122,0.13),transparent)] pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(196,169,122,0.4)] to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(196,169,122,0.4)] to-transparent" />

        <div className="max-w-7xl mx-auto px-6 lg:px-10 relative z-10">
          <AnimatedSection className="text-center mb-14">
            <span className="tag mb-5 inline-block">Soul Studio</span>
            <h2
              className="text-[clamp(2rem,4vw,3.5rem)] text-[#1C1512] mb-4 leading-tight"
              style={{ fontFamily: "var(--font-cormorant)", fontWeight: 400 }}
            >
              {isRu ? "Инструменты для самопознания" : isEn ? "Tools for Self-Discovery" : "Інструменти для самопізнання"}
            </h2>
            <p className="text-[#7A6A58] max-w-xl mx-auto text-base">
              {isRu ? "Таро, астрология и нумерология" : isEn ? "Tarot, astrology and numerology" : "Таро, астрологія та нумерологія"}
            </p>
          </AnimatedSection>

          {/* Mobile: horizontal scroll carousel / Desktop: 4-column grid */}
          <div className="-mx-6 lg:mx-0">
            <div className="flex gap-5 overflow-x-auto snap-x snap-mandatory px-6 pb-4 lg:grid lg:grid-cols-4 lg:gap-6 lg:overflow-visible lg:pb-0" style={{ scrollbarWidth: "none" }}>
              {studioTools
                .filter((tool) => {
                  const id = tool.href.split('/').pop() as ToolId;
                  return previewMode || isToolEnabled(id, toolsEnabled);
                })
                .map((tool, i) => (
                <AnimatedSection key={tool.href} delay={i * 0.1} className="snap-start flex-shrink-0 w-[78vw] sm:w-[56vw] lg:w-auto">
                  <Link href={tool.href} className="group block h-full">
                    <div className="h-full flex flex-col p-7 rounded-2xl border border-[rgba(196,169,122,0.2)] bg-white/60 hover:bg-white/90 hover:border-[rgba(196,169,122,0.4)] transition-all duration-300 shadow-sm">
                      <div
                        className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${tool.accent} flex items-center justify-center text-white text-2xl mb-5 transition-transform duration-300 group-hover:scale-110`}
                        style={{ fontFamily: "var(--font-cormorant)" }}
                      >
                        {tool.glyph}
                      </div>
                      <span className="text-xs text-[#C4A97A] tracking-[0.15em] uppercase mb-2" style={{ fontFamily: "var(--font-jost)" }}>
                        {tool.subtitle}
                      </span>
                      <h3
                        className="text-2xl text-[#1C1512] mb-3 group-hover:text-[#B8883A] transition-colors"
                        style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}
                      >
                        {tool.title}
                      </h3>
                      <p className="text-[#7A6A58] text-sm leading-relaxed flex-1 mb-5">{tool.desc}</p>
                      <div className="flex items-center gap-2 text-[#C4A97A] text-sm mt-auto">
                        {isRu ? "Открыть" : isEn ? "Open" : "Відкрити"}
                        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                </AnimatedSection>
              ))}
            </div>
          </div>

          <AnimatedSection delay={0.35} className="text-center mt-10">
            <Link
              href={`/${language}/studio`}
              className="inline-flex items-center px-7 py-3 rounded-full border border-[rgba(196,169,122,0.35)] text-[#C4A97A] text-sm tracking-wide hover:bg-[rgba(196,169,122,0.08)] transition-colors"
            >
              {isRu ? "Все инструменты Soul Studio" : isEn ? "All Soul Studio tools" : "Всі інструменти Soul Studio"}
            </Link>
          </AnimatedSection>
        </div>
      </section>

      <GoldDivider />

      {/* ── Services Preview ──────────────────────────────────────────── */}
      <section data-nav-section="services" className="section-padding bg-[#F2EBD9]">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <AnimatedSection className="text-center mb-14">
            <span className="tag mb-4 inline-block">{isRu ? "Услуги" : isEn ? "Services" : "Послуги"}</span>
            <h2 className="text-[clamp(2rem,4vw,3.5rem)] text-[#1C1512]" style={{ fontFamily: "var(--font-cormorant)" }}>
              {isRu ? "Чем я могу помочь" : isEn ? "How I can help" : "Чим я можу допомогти"}
            </h2>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-6">
            {services.map((svc, i) => (
              <AnimatedSection key={i} delay={i * 0.1}>
                <Link href={svc.href} className="group block h-full">
                  <div className="card-luxury h-full flex flex-col items-center text-center">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#E8C98A] to-[#C4A97A] flex items-center justify-center text-2xl mb-6 transition-transform duration-300 group-hover:scale-110">
                      {svc.icon}
                    </div>
                    <h3 className="text-2xl mb-3 text-[#1C1512]" style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}>
                      {svc.title}
                    </h3>
                    <p className="text-[#7A6A58] text-sm leading-relaxed mb-6 flex-1">{svc.description}</p>
                    <div className="mt-auto pt-4 border-t border-[rgba(196,169,122,0.2)] w-full text-center">
                      <span className="text-[#B8883A] font-medium text-2xl">{svc.price}</span>
                    </div>
                  </div>
                </Link>
              </AnimatedSection>
            ))}
          </div>

          <AnimatedSection delay={0.35} className="text-center mt-10">
            <Link href={`/${language}/services`} className="btn-outline">
              {isRu ? "Все услуги и цены" : isEn ? "All services & prices" : "Всі послуги та ціни"}
            </Link>
          </AnimatedSection>
        </div>
      </section>

      <GoldDivider />

      {/* ── FAQ Preview ───────────────────────────────────────────────── */}
      <section data-nav-section="faq" className="section-padding bg-[#FDFBF7]">
        <div className="max-w-3xl mx-auto px-6 lg:px-10">
          <AnimatedSection className="text-center mb-12">
            <span className="tag mb-4 inline-block">
              {isRu ? "Вопросы и ответы" : isEn ? "Questions & Answers" : "Питання та відповіді"}
            </span>
            <h2 className="text-[clamp(2rem,4vw,3.5rem)]" style={{ fontFamily: "var(--font-cormorant)" }}>
              {isRu ? "Часто задаваемые вопросы" : isEn ? "Frequently asked questions" : "Найчастіші запитання"}
            </h2>
          </AnimatedSection>

          <AnimatedSection delay={0.1}>
            <Accordion.Root type="single" collapsible className="space-y-3">
              {faqs.map((faq, i) => (
                <Accordion.Item key={i} value={`faq-${i}`} className="card-luxury !p-0 overflow-hidden">
                  <Accordion.Trigger className="w-full flex items-center justify-between px-6 py-5 text-left group">
                    <span className="text-xl text-[#1C1512] group-data-[state=open]:text-[#B8883A] transition-colors" style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}>
                      {faq.q}
                    </span>
                    <ChevronDown size={18} className="text-[#C4A97A] flex-shrink-0 ml-4 transition-transform duration-300 group-data-[state=open]:rotate-180" />
                  </Accordion.Trigger>
                  <Accordion.Content className="px-6 pb-5 text-[#7A6A58] text-sm leading-relaxed">
                    {faq.a}
                  </Accordion.Content>
                </Accordion.Item>
              ))}
            </Accordion.Root>
          </AnimatedSection>

          <AnimatedSection delay={0.2} className="text-center mt-10">
            <Link href={`/${language}/faq`} className="btn-outline">
              {isRu ? "Все вопросы" : isEn ? "All questions" : "Всі питання"}
            </Link>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
