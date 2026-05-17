"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import AnimatedSection from "@/components/ui/AnimatedSection";
import GoldDivider from "@/components/ui/GoldDivider";
import { useLanguage } from '@/hooks/useLanguage';

const posts = [
  {
    slug: "znaky-karti-vidnosyny",
    title: "Що карти кажуть про ваші стосунки: 5 знаків",
    excerpt:
      "Таро може розкрити те, про що партнер мовчить, а ви боїтесь запитати. Ось п'ять аркану, які точно вказують на стан ваших відносин.",
    category: "Таро",
    readTime: "7 хв",
    date: "12 травня 2025",
  },
  {
    slug: "taro-zakohanykh-arkan",
    title: "Таро Закоханих — глибокий розбір аркану",
    excerpt:
      "VI аркан — один із найбільш неправильно розтлумачених у колоді. Це не лише про романтику. Читайте, що насправді означають Закохані.",
    category: "Таро",
    readTime: "10 хв",
    date: "28 квітня 2025",
  },
  {
    slug: "chy-vartyi-vin-vashykh-slez",
    title: "Як зрозуміти, чи вартий він ваших сліз",
    excerpt:
      "{t('blog.categories.psychology')} та таро разом дають дуже чітку відповідь на це питання. Не те, яке ми хочемо почути — а те, яке нам потрібно.",
    category: "Відносини",
    readTime: "8 хв",
    date: "15 квітня 2025",
  },
  {
    slug: "misyats-emotsiyi-astrolohiya",
    title: "Місяць і емоції: астрологічний погляд",
    excerpt:
      "Чому у певні дні ми плачемо без причини, а в інші — відчуваємо неймовірний підйом? Місяць відповідає за наш емоційний фон більше, ніж ми думаємо.",
    category: "Астрологія",
    readTime: "6 хв",
    date: "3 квітня 2025",
  },
  {
    slug: "pytannya-taro-pro-lyubov",
    title: "7 питань до таро про любов, які реально працюють",
    excerpt:
      "«Чи він мене любить?» — не найкраще питання до карт. Ось сім формулювань, які дадуть вам справді корисні відповіді.",
    category: "Таро",
    readTime: "5 хв",
    date: "22 березня 2025",
  },
  {
    slug: "koly-vidpustyty",
    title: "Коли відпустити: коли карти кажуть «досить»",
    excerpt:
      "Є комбінації карт, які не можна ігнорувати. Якщо вони з'являються знову і знову — це не випадковість. Це відповідь.",
    category: "{t('blog.categories.psychology')}",
    readTime: "9 хв",
    date: "10 березня 2025",
  },
];

const categories = ["{t('blog.categories.all')}", "Таро", "Відносини", "{t('blog.categories.psychology')}", "Астрологія"];

export default function BlogPage() {
  const { t } = useLanguage();

  const [activeCategory, setActiveCategory] = useState("{t('blog.categories.all')}");

  const filtered =
    activeCategory === "{t('blog.categories.all')}"
      ? posts
      : posts.filter((p) => p.category === activeCategory);

  return (
    <>
      {/* Hero */}
      <section className="pt-36 pb-16 bg-[#FDFBF7] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(196,169,122,0.1),transparent)]" />
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <AnimatedSection>
            <span className="tag mb-6 inline-block">Блог</span>
            <h1
              className="text-[clamp(2.5rem,5vw,5rem)] text-[#1C1512] mb-6 leading-[1.06]"
              style={{ fontFamily: "var(--font-cormorant)", fontWeight: 400 }}
            >
              Думки та розбори
            </h1>
            <p className="text-xl text-[#7A6A58] leading-relaxed">
              Статті про таро, психологію стосунків та жіночу мудрість.
            </p>
          </AnimatedSection>
        </div>
      </section>

      <GoldDivider />

      {/* Filters */}
      <section className="py-8 bg-[#FDFBF7]">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
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

      {/* Grid */}
      <section className="pb-section bg-[#FDFBF7] pt-4">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-7">
            {filtered.map((post, i) => (
              <AnimatedSection key={post.slug} delay={i * 0.08}>
                <Link href={`/blog/${post.slug}`} className="group block h-full">
                  <div className="card-luxury h-full flex flex-col">
                    {/* Category + date */}
                    <div className="flex items-center justify-between mb-5">
                      <span className="tag text-xs">{post.category}</span>
                      <span className="text-xs text-[#7A6A58]">{post.date}</span>
                    </div>

                    {/* Decorative image placeholder */}
                    <div className="w-full h-40 rounded-xl bg-gradient-to-br from-[#E8DCC5] to-[#C4A97A] mb-6 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[rgba(28,21,18,0.3)]" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span
                          className="text-6xl text-white/30"
                          style={{ fontFamily: "var(--font-cormorant)" }}
                        >
                          {i + 1}
                        </span>
                      </div>
                    </div>

                    <h2
                      className="text-2xl text-[#1C1512] mb-3 group-hover:text-[#B8883A] transition-colors leading-tight"
                      style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}
                    >
                      {post.title}
                    </h2>
                    <p className="text-[#7A6A58] text-sm leading-relaxed mb-6 flex-1">
                      {post.excerpt}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-[rgba(196,169,122,0.2)] mt-auto">
                      <span className="flex items-center gap-1.5 text-xs text-[#7A6A58]">
                        <Clock size={12} className="text-[#C4A97A]" />
                        {post.readTime}
                      </span>
                      <span className="flex items-center gap-1 text-sm text-[#B8883A] group-hover:gap-2 transition-all">
                        Читати
                        <ArrowRight size={14} />
                      </span>
                    </div>
                  </div>
                </Link>
              </AnimatedSection>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-16 text-[#7A6A58]">
              Статей у цій категорії поки немає.
            </div>
          )}
        </div>
      </section>
    </>
  );
}
