/**
 * /[lang]/dreams — dream dictionary index.
 *
 * SEO landing that lists every symbol (each linking to its own page) and
 * funnels visitors into the Сонник tool. Server-rendered for crawlers.
 */

import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import AnimatedSection from "@/components/ui/AnimatedSection";
import GoldDivider from "@/components/ui/GoldDivider";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import { DREAM_SYMBOLS, symbolName } from "@/lib/dreams/symbols";

const SITE = "https://ellen-soul.com";
const LANGS = ["uk", "ru", "en"] as const;

const T = {
  uk: {
    tag: "База сонника",
    title: "Сонник: тлумачення снів",
    sub: "Оберіть символ зі сну, щоб дізнатися його психологічне, духовне та народне значення. Або опишіть весь сон в AI-соннику.",
    cta: "Розтлумачити свій сон",
    all: "Усі символи",
  },
  ru: {
    tag: "База сонника",
    title: "Сонник: толкование снов",
    sub: "Выберите символ из сна, чтобы узнать его психологическое, духовное и народное значение. Или опишите весь сон в AI-соннике.",
    cta: "Растолковать свой сон",
    all: "Все символы",
  },
  en: {
    tag: "Dream dictionary",
    title: "Dream Dictionary: symbol meanings",
    sub: "Pick a symbol from your dream to learn its psychological, spiritual and folk meaning. Or describe the whole dream in the AI interpreter.",
    cta: "Interpret your dream",
    all: "All symbols",
  },
};

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang: raw } = await params;
  const lang = (LANGS.includes(raw as never) ? raw : "uk") as "uk" | "ru" | "en";
  const t = T[lang];
  return {
    title: `${t.title} — Ellen Soul`,
    description: t.sub,
    alternates: {
      canonical: `${SITE}/${lang}/dreams`,
      languages: { uk: `${SITE}/uk/dreams`, ru: `${SITE}/ru/dreams`, en: `${SITE}/en/dreams`, "x-default": `${SITE}/uk/dreams` },
    },
  };
}

export default async function DreamsIndex({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params;
  const lang = (LANGS.includes(raw as never) ? raw : "uk") as "uk" | "ru" | "en";
  const t = T[lang];
  const home = lang === "ru" ? "Главная" : lang === "en" ? "Home" : "Головна";

  return (
    <>
      <Breadcrumbs items={[
        { name: home, url: `${SITE}/${lang}` },
        { name: t.title, url: `${SITE}/${lang}/dreams` },
      ]} />

      <section className="pt-36 pb-12 bg-[#FDFBF7] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(196,169,122,0.12),transparent)]" />
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <AnimatedSection>
            <span className="tag mb-6 inline-block">{t.tag}</span>
            <h1 className="text-[clamp(2.4rem,5vw,4.2rem)] text-[#1C1512] mb-4 leading-[1.06]" style={{ fontFamily: "var(--font-cormorant)", fontWeight: 400 }}>
              {t.title}
            </h1>
            <p className="text-xl text-[#7A6A58] leading-relaxed max-w-xl mx-auto mb-7">{t.sub}</p>
            <Link href={`/${lang}/studio/dreams`} className="btn-primary inline-flex">
              <Sparkles size={16} /> {t.cta}
            </Link>
          </AnimatedSection>
        </div>
      </section>

      <GoldDivider />

      <section className="section-padding bg-[#FDFBF7]">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-2xl text-[#1C1512] mb-6 text-center" style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}>{t.all}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {DREAM_SYMBOLS.map((s) => (
              <Link key={s.slug} href={`/${lang}/dreams/${s.slug}`}
                className="group flex items-center gap-3 p-4 rounded-2xl bg-white/60 border border-[rgba(196,169,122,0.2)] hover:border-[rgba(196,169,122,0.45)] hover:shadow-md transition-all">
                <span className="text-2xl">{s.emoji}</span>
                <span className="text-[#1C1512] group-hover:text-[#B8883A] transition-colors" style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}>
                  {symbolName(s, lang)}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
