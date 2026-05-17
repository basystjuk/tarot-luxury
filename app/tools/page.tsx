'use client';

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import AnimatedSection from "@/components/ui/AnimatedSection";
import GoldDivider from "@/components/ui/GoldDivider";
import { useLanguage } from '@/hooks/useLanguage';

export const metadata: Metadata = {
  title: "Інструменти — Ellen Soul Таро",
  description:
    "Безкоштовні астрологічні інструменти: натальна карта, місячний гороскоп, сумісність знаків, карта дня, нумерологія.",
};

const tools = [
  {
    href: "/tools/natal-chart",
    title: "Натальна карта",
    subtitle: "Астрологічний",
    description:
      "Розрахуйте своє натальне небо. Позиції планет, знак Сонця, Місяця та Асцендента, будинки — все в одному місці.",
    glyph: "☽",
    accent: "from-[#D4A853] to-[#B8883A]",
  },
  {
    href: "/tools/moon-phase",
    title: "Місячний гороскоп",
    subtitle: "Місячний",
    description:
      "Дізнайтесь поточну фазу Місяця, відсоток освітлення та дату наступного новомісяця і повного місяця.",
    glyph: "🌙",
    accent: "from-[#C4A97A] to-[#9A6E28]",
  },
  {
    href: "/tools/compatibility",
    title: "Сумісність знаків",
    subtitle: "Астрологічний",
    description:
      "Перевірте астрологічну сумісність двох знаків Зодіаку. Сильні сторони, виклики та загальна оцінка пари.",
    glyph: "♡",
    accent: "from-[#E8C98A] to-[#C4A97A]",
  },
  {
    href: "/tools/daily-card",
    title: "{t('tools.card_of_day.title')}",
    subtitle: "Таро",
    description:
      "Щоденна карта Старшого Аркану — ваш орієнтир та медитація на сьогодні. Оновлюється щодня.",
    glyph: "✦",
    accent: "from-[#B8883A] to-[#9A6E28]",
  },
  {
    href: "/tools/numerology",
    title: "Нумерологія",
    subtitle: "Нумерологія",
    description:
      "Ваше число Долі та число Життєвого Шляху за ім'ям і датою народження. З детальною інтерпретацією.",
    glyph: "∞",
    accent: "from-[#D4A853] to-[#C4A97A]",
  },
];

export default function ToolsPage() {
  const { t } = useLanguage();

  return (
    <>
      {/* Hero */}
      <section className="pt-36 pb-16 bg-[#FDFBF7] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(196,169,122,0.1),transparent)]" />
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <AnimatedSection>
            <span className="tag mb-6 inline-block">Безкоштовно</span>
            <h1
              className="text-[clamp(2.5rem,5vw,5rem)] text-[#1C1512] mb-6 leading-[1.06]"
              style={{ fontFamily: "var(--font-cormorant)", fontWeight: 400 }}
            >
              Інструменти
            </h1>
            <p className="text-xl text-[#7A6A58] leading-relaxed">
              Астрологія, таро та нумерологія — у вашому браузері. Безкоштовно та без реєстрації.
            </p>
          </AnimatedSection>
        </div>
      </section>

      <GoldDivider />

      <section className="section-padding bg-[#FDFBF7]">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-7">
            {tools.map((tool, i) => (
              <AnimatedSection key={tool.href} delay={i * 0.1}>
                <Link href={tool.href} className="group block h-full">
                  <div className="card-luxury h-full flex flex-col">
                    {/* Icon */}
                    <div
                      className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${tool.accent} flex items-center justify-center text-white text-3xl mb-6 transition-transform duration-300 group-hover:scale-110`}
                      style={{ fontFamily: "var(--font-cormorant)" }}
                    >
                      {tool.glyph}
                    </div>

                    <span className="text-xs text-[#C4A97A] tracking-[0.12em] uppercase mb-2"
                      style={{ fontFamily: "var(--font-jost)" }}>
                      {tool.subtitle}
                    </span>
                    <h2
                      className="text-2xl text-[#1C1512] mb-3 group-hover:text-[#B8883A] transition-colors"
                      style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}
                    >
                      {tool.title}
                    </h2>
                    <p className="text-[#7A6A58] text-sm leading-relaxed flex-1 mb-6">
                      {tool.description}
                    </p>

                    <div className="flex items-center gap-2 text-[#B8883A] text-sm mt-auto">
                      Відкрити
                      <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
