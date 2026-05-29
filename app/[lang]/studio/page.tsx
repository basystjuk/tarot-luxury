'use client';

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import AnimatedSection from "@/components/ui/AnimatedSection";
import GoldDivider from "@/components/ui/GoldDivider";
import { useLanguage } from '@/hooks/useLanguage';
import { isToolEnabled, type ToolId } from "@/lib/tools-config";

export default function StudioPage() {
  const { language } = useLanguage();
  const isRu = language === 'ru';
  const isEn = language === 'en';

  type ApiTool = { id: string; title_uk: string; title_ru: string; title_en: string; desc_uk: string; desc_ru: string; desc_en: string };
  const [apiTools, setApiTools] = useState<ApiTool[] | null>(null);
  const [toolsEnabled, setToolsEnabled] = useState<Partial<Record<ToolId, boolean>> | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    fetch("/api/content")
      .then(r => r.json())
      .then(d => {
        if (d.studio_tools?.length) setApiTools(d.studio_tools);
        if (d.tools_enabled) setToolsEnabled(d.tools_enabled);
        setPreviewMode(Boolean(d.preview));
      })
      .catch(() => {});
  }, []);

  // Порядок: Карта дня → Нумерологія → Карта сумісності → Місячний провідник → Натальна карта
  // Натальна карта вимкнена за замовчуванням і з'являється тільки коли admin
  // увімкне її через адмінку (або у preview-режимі).
  const tools = isRu ? [
    { href: `/${language}/studio/daily-card`,   title: "Карта дня",              subtitle: "Таро",          description: "Ежедневная карта Таро — ваш ориентир и медитация на сегодня. Персональное предсказание от Ellen Soul.", glyph: "✦", accent: "from-[#B8883A] to-[#9A6E28]" },
    { href: `/${language}/studio/numerology`,    title: "Нумерология",            subtitle: "Нумерология",   description: "Ваше число Судьбы, число Пути, Душа, Личность и карматические уроки по имени и дате рождения.", glyph: "∞", accent: "from-[#D4A853] to-[#C4A97A]" },
    { href: `/${language}/studio/compatibility`, title: "Карта совместимости",    subtitle: "Астрология · Нумерология", description: "Знаки зодиака и числа судьбы двух людей — полный анализ совместимости пары.", glyph: "♡", accent: "from-[#E8C98A] to-[#C4A97A]" },
    { href: `/${language}/studio/moon-phase`,    title: "Лунный проводник",       subtitle: "Луна · Астрология", description: "Точная фаза, знак и градус Луны на любую дату. Тёмная Луна, Void of Course, узлы, Лилит — личное лунное послание.", glyph: "🌙", accent: "from-[#C4A97A] to-[#9A6E28]" },
    { href: `/${language}/studio/natal-chart`,   title: "Натальная карта",        subtitle: "Астрология",       description: "Полный астрологический портрет: планеты, дома, аспекты — ваш космический паспорт.", glyph: "✺", accent: "from-[#9A6E28] to-[#5A3E18]" },
    { href: `/${language}/studio/horoscope`,     title: "Гороскоп дня",           subtitle: "Астрология + Нумерология", description: "Персональный гороскоп на сегодня: конвергенция транзитов к вашей натальной карте, окна удачи с точностью до минуты.", glyph: "☉", accent: "from-[#E8C98A] to-[#9A6E28]" },
    { href: `/${language}/studio/year-forecast`, title: "Прогноз года",           subtitle: "Соляр · Прогрессии", description: "Прогноз на год: соляр задаёт тему, прогрессивная Луна — вашу эмоциональную пору. С колесом солнечного возвращения.", glyph: "❂", accent: "from-[#D4A853] to-[#9A6E28]" },
  ] : isEn ? [
    { href: `/${language}/studio/daily-card`,   title: "Card of the Day",         subtitle: "Tarot",         description: "Daily Tarot card — your guide and meditation for today. Personal reading from Ellen Soul.", glyph: "✦", accent: "from-[#B8883A] to-[#9A6E28]" },
    { href: `/${language}/studio/numerology`,    title: "Numerology",              subtitle: "Numerology",    description: "Your Destiny, Life Path, Soul, Personality numbers and karmic lessons by name and date of birth.", glyph: "∞", accent: "from-[#D4A853] to-[#C4A97A]" },
    { href: `/${language}/studio/compatibility`, title: "Compatibility Map",        subtitle: "Astrology · Numerology", description: "Zodiac signs and destiny numbers of two people — full couple compatibility analysis.", glyph: "♡", accent: "from-[#E8C98A] to-[#C4A97A]" },
    { href: `/${language}/studio/moon-phase`,    title: "Moon Guide",              subtitle: "Moon · Astrology", description: "The precise Moon phase, sign and degree for any date. Dark Moon, Void of Course, nodes, Lilith — a personal lunar message.", glyph: "🌙", accent: "from-[#C4A97A] to-[#9A6E28]" },
    { href: `/${language}/studio/natal-chart`,   title: "Natal Chart",             subtitle: "Astrology",        description: "A full astrological portrait: planets, houses, aspects — your cosmic passport.", glyph: "✺", accent: "from-[#9A6E28] to-[#5A3E18]" },
    { href: `/${language}/studio/horoscope`,     title: "Daily Horoscope",          subtitle: "Astrology + Numerology", description: "Your personal horoscope for today: transit convergence to your natal chart, windows of luck down to the minute.", glyph: "☉", accent: "from-[#E8C98A] to-[#9A6E28]" },
    { href: `/${language}/studio/year-forecast`, title: "Year Forecast",            subtitle: "Solar Return · Progressions", description: "Your year ahead: the Solar Return sets the theme, the progressed Moon your emotional season. With a solar-return wheel.", glyph: "❂", accent: "from-[#D4A853] to-[#9A6E28]" },
  ] : [
    { href: `/${language}/studio/daily-card`,   title: "Карта дня",              subtitle: "Таро",          description: "Щоденна карта Таро — ваш орієнтир та медитація на сьогодні. Персональне передбачення від Ellen Soul.", glyph: "✦", accent: "from-[#B8883A] to-[#9A6E28]" },
    { href: `/${language}/studio/numerology`,    title: "Нумерологія",            subtitle: "Нумерологія",   description: "Ваше число Долі, число Шляху, Душа, Особистість та карматичні уроки за ім'ям і датою народження.", glyph: "∞", accent: "from-[#D4A853] to-[#C4A97A]" },
    { href: `/${language}/studio/compatibility`, title: "Карта сумісності",       subtitle: "Астрологія · Нумерологія", description: "Знаки зодіаку та числа долі двох людей — повний аналіз сумісності пари.", glyph: "♡", accent: "from-[#E8C98A] to-[#C4A97A]" },
    { href: `/${language}/studio/moon-phase`,    title: "Місячний провідник",     subtitle: "Місяць · Астрологія", description: "Точна фаза, знак і градус Місяця на будь-яку дату. Темний Місяць, Void of Course, вузли, Ліліт — особисте місячне послання.", glyph: "🌙", accent: "from-[#C4A97A] to-[#9A6E28]" },
    { href: `/${language}/studio/natal-chart`,   title: "Натальна карта",         subtitle: "Астрологія",          description: "Повний астрологічний портрет: планети, доми, аспекти — ваш космічний паспорт.", glyph: "✺", accent: "from-[#9A6E28] to-[#5A3E18]" },
    { href: `/${language}/studio/horoscope`,     title: "Гороскоп дня",           subtitle: "Астрологія + Нумерологія", description: "Персональний гороскоп на сьогодні: конвергенція транзитів до твоєї натальної карти, вікна удачі з точністю до хвилини.", glyph: "☉", accent: "from-[#E8C98A] to-[#9A6E28]" },
    { href: `/${language}/studio/year-forecast`, title: "Прогноз року",           subtitle: "Соляр · Прогресії", description: "Прогноз на рік: соляр задає тему, прогресивний Місяць — твою емоційну пору. З колесом сонячного повернення.", glyph: "❂", accent: "from-[#D4A853] to-[#9A6E28]" },
  ];

  return (
    <>
      <section className="pt-36 pb-16 bg-[#FDFBF7] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(196,169,122,0.1),transparent)]" />
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <AnimatedSection>
            <span className="tag mb-6 inline-block">
              {isRu ? "С любовью" : isEn ? "With love" : "З любов'ю"}
            </span>
            <h1 className="text-[clamp(2.5rem,5vw,5rem)] text-[#1C1512] mb-6 leading-[1.06]" style={{ fontFamily: "var(--font-cormorant)", fontWeight: 400 }}>
              Soul Studio
            </h1>
            <p className="text-xl text-[#7A6A58] leading-relaxed">
              {isRu
                ? "Таро, астрология и нумерология — всё в одном месте."
                : isEn
                ? "Tarot, astrology and numerology — all in one place."
                : "Таро, астрологія та нумерологія — все в одному місці."}
            </p>
          </AnimatedSection>
        </div>
      </section>

      <GoldDivider />

      <section className="section-padding bg-[#FDFBF7]">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-7">
            {tools
              .filter((tool) => {
                const id = tool.href.split('/').pop() as ToolId;
                // In preview mode show everything (with badge); otherwise hide
                // tools the admin has disabled.
                return previewMode || isToolEnabled(id, toolsEnabled);
              })
              .map((tool, i) => {
              const id = tool.href.split('/').pop() as ToolId;
              const disabled = !isToolEnabled(id, toolsEnabled);
              const apiTool = apiTools?.find(t => t.id === id);
              const title = apiTool ? (isRu ? apiTool.title_ru : isEn ? apiTool.title_en : apiTool.title_uk) : tool.title;
              const description = apiTool ? (isRu ? apiTool.desc_ru : isEn ? apiTool.desc_en : apiTool.desc_uk) : tool.description;
              return (
              <AnimatedSection key={tool.href} delay={i * 0.1}>
                <Link href={tool.href} className="group block h-full">
                  <div className={`card-luxury h-full flex flex-col relative ${disabled ? 'ring-1 ring-[#C4A97A]/40' : ''}`}>
                    {disabled && previewMode && (
                      <span className="absolute top-3 right-3 text-[9px] tracking-[0.18em] uppercase bg-[#1C1512] text-[#C4A97A] px-2 py-0.5 rounded-full">
                        {isRu ? "Превью" : isEn ? "Preview" : "Прев'ю"}
                      </span>
                    )}
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${tool.accent} flex items-center justify-center text-white text-3xl mb-6 transition-transform duration-300 group-hover:scale-110`} style={{ fontFamily: "var(--font-cormorant)" }}>
                      {tool.glyph}
                    </div>
                    <span className="text-xs text-[#C4A97A] tracking-[0.12em] uppercase mb-2" style={{ fontFamily: "var(--font-jost)" }}>{tool.subtitle}</span>
                    <h2 className="text-2xl text-[#1C1512] mb-3 group-hover:text-[#B8883A] transition-colors" style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}>{title}</h2>
                    <p className="text-[#7A6A58] text-sm leading-relaxed flex-1 mb-6">{description}</p>
                    <div className="flex items-center gap-2 text-[#B8883A] text-sm mt-auto">
                      {isRu ? "Открыть" : isEn ? "Open" : "Відкрити"}
                      <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </AnimatedSection>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
