'use client';

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import AnimatedSection from "@/components/ui/AnimatedSection";
import GoldDivider from "@/components/ui/GoldDivider";
import { useLanguage } from '@/hooks/useLanguage';

export default function StudioPage() {
  const { language } = useLanguage();
  const isRu = language === 'ru';
  const isEn = language === 'en';

  type ApiTool = { id: string; title_uk: string; title_ru: string; title_en: string; desc_uk: string; desc_ru: string; desc_en: string };
  const [apiTools, setApiTools] = useState<ApiTool[] | null>(null);

  useEffect(() => {
    fetch("/api/content")
      .then(r => r.json())
      .then(d => { if (d.studio_tools?.length) setApiTools(d.studio_tools); })
      .catch(() => {});
  }, []);

  const tools = isRu ? [
    { href: `/${language}/studio/moon-phase`, title: "Лунный гороскоп", subtitle: "Лунный", description: "Узнайте текущую фазу Луны, процент освещения и дату следующего новолуния и полнолуния.", glyph: "🌙", accent: "from-[#C4A97A] to-[#9A6E28]" },
    { href: `/${language}/studio/compatibility`, title: "Совместимость знаков", subtitle: "Астрология", description: "Проверьте астрологическую совместимость двух знаков Зодиака. Сильные стороны, вызовы и общая оценка пары.", glyph: "♡", accent: "from-[#E8C98A] to-[#C4A97A]" },
    { href: `/${language}/studio/daily-card`, title: "Карта дня", subtitle: "Таро", description: "Ежедневная карта Старшего Аркана — ваш ориентир и медитация на сегодня. Обновляется каждый день.", glyph: "✦", accent: "from-[#B8883A] to-[#9A6E28]" },
    { href: `/${language}/studio/numerology`, title: "Нумерология", subtitle: "Нумерология", description: "Ваше число Судьбы и число Жизненного Пути по имени и дате рождения. С детальной интерпретацией.", glyph: "∞", accent: "from-[#D4A853] to-[#C4A97A]" },
  ] : isEn ? [
    { href: `/${language}/studio/moon-phase`, title: "Moon Horoscope", subtitle: "Lunar", description: "Find the current Moon phase, illumination percentage and dates of the next new moon and full moon.", glyph: "🌙", accent: "from-[#C4A97A] to-[#9A6E28]" },
    { href: `/${language}/studio/compatibility`, title: "Sign Compatibility", subtitle: "Astrology", description: "Check the astrological compatibility of two Zodiac signs. Strengths, challenges and overall couple rating.", glyph: "♡", accent: "from-[#E8C98A] to-[#C4A97A]" },
    { href: `/${language}/studio/daily-card`, title: "Card of the Day", subtitle: "Tarot", description: "Daily Major Arcana card — your guide and meditation for today. Updated every day.", glyph: "✦", accent: "from-[#B8883A] to-[#9A6E28]" },
    { href: `/${language}/studio/numerology`, title: "Numerology", subtitle: "Numerology", description: "Your Destiny number and Life Path number by name and date of birth. With a detailed interpretation.", glyph: "∞", accent: "from-[#D4A853] to-[#C4A97A]" },
  ] : [
    { href: `/${language}/studio/moon-phase`, title: "Місячний гороскоп", subtitle: "Місячний", description: "Дізнайтесь поточну фазу Місяця, відсоток освітлення та дату наступного новомісяця і повного місяця.", glyph: "🌙", accent: "from-[#C4A97A] to-[#9A6E28]" },
    { href: `/${language}/studio/compatibility`, title: "Сумісність знаків", subtitle: "Астрологічний", description: "Перевірте астрологічну сумісність двох знаків Зодіаку. Сильні сторони, виклики та загальна оцінка пари.", glyph: "♡", accent: "from-[#E8C98A] to-[#C4A97A]" },
    { href: `/${language}/studio/daily-card`, title: "Карта дня", subtitle: "Таро", description: "Щоденна карта Старшого Аркану — ваш орієнтир та медитація на сьогодні. Оновлюється щодня.", glyph: "✦", accent: "from-[#B8883A] to-[#9A6E28]" },
    { href: `/${language}/studio/numerology`, title: "Нумерологія", subtitle: "Нумерологія", description: "Ваше число Долі та число Життєвого Шляху за ім'ям і датою народження. З детальною інтерпретацією.", glyph: "∞", accent: "from-[#D4A853] to-[#C4A97A]" },
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
            {tools.map((tool, i) => {
              const apiTool = apiTools?.find(t => t.id === tool.href.split('/').pop());
              const title = apiTool ? (isRu ? apiTool.title_ru : isEn ? apiTool.title_en : apiTool.title_uk) : tool.title;
              const description = apiTool ? (isRu ? apiTool.desc_ru : isEn ? apiTool.desc_en : apiTool.desc_uk) : tool.description;
              return (
              <AnimatedSection key={tool.href} delay={i * 0.1}>
                <Link href={tool.href} className="group block h-full">
                  <div className="card-luxury h-full flex flex-col">
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
