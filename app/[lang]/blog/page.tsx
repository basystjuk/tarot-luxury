"use client";

import { useState, useEffect } from "react";
import AnimatedSection from "@/components/ui/AnimatedSection";
import GoldDivider from "@/components/ui/GoldDivider";
import { useLanguage } from '@/hooks/useLanguage';

const DEFAULT_BLOG = {
  title_ru: "Telegram-канал", desc_ru: "Там я регулярно публикую расклады, пишу о картах и делюсь мыслями.", btn_ru: "Перейти в канал",
  title_uk: "Telegram-канал", desc_uk: "Там я регулярно публікую розклади, пишу про карти та ділюся думками.", btn_uk: "Перейти в канал",
  link: "https://t.me/ellen_soul_taro",
};

export default function BlogPage() {
  const { language } = useLanguage();
  const isRu = language === 'ru';
  const isEn = language === 'en';

  const [blog, setBlog] = useState(DEFAULT_BLOG);

  useEffect(() => {
    fetch("/api/content").then(r => r.json()).then(d => { if (d.blog) setBlog(d.blog); }).catch(() => {});
  }, []);

  const title = isRu ? blog.title_ru : blog.title_uk;
  const desc = isRu ? blog.desc_ru : blog.desc_uk;
  const btn = isRu ? blog.btn_ru : blog.btn_uk;

  return (
    <>
      <section className="pt-36 pb-16 bg-[#FDFBF7] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(196,169,122,0.1),transparent)]" />
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <AnimatedSection>
            <span className="tag mb-6 inline-block">
              {isRu ? "Дневник таролога" : isEn ? "Tarot Journal" : "Щоденник таролога"}
            </span>
            <h1
              className="text-[clamp(2.5rem,5vw,5rem)] text-[#1C1512] mb-6 leading-[1.06]"
              style={{ fontFamily: "var(--font-cormorant)", fontWeight: 400 }}
            >
              {isRu ? "Скоро здесь" : isEn ? "Coming Soon" : "Незабаром тут"}
            </h1>
            <p className="text-xl text-[#7A6A58] leading-relaxed max-w-xl mx-auto">
              {isRu
                ? "Готовлю статьи о таро, психологии отношений и женской мудрости. Следите за обновлениями в Telegram."
                : isEn
                ? "Preparing articles about tarot, relationship psychology and feminine wisdom. Follow updates on Telegram."
                : "Готую статті про таро, психологію стосунків та жіночу мудрість. Стежте за оновленнями в Telegram."}
            </p>
          </AnimatedSection>
        </div>
      </section>

      <GoldDivider />

      <section className="section-padding bg-[#FDFBF7]">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <AnimatedSection>
            <div className="card-luxury py-16">
              <div className="text-6xl text-[#D4A853] mb-6 select-none" style={{ fontFamily: "var(--font-cormorant)" }}>✦</div>
              <h2 className="text-3xl text-[#1C1512] mb-4" style={{ fontFamily: "var(--font-cormorant)", fontWeight: 400 }}>
                {title}
              </h2>
              <p className="text-[#7A6A58] mb-8 leading-relaxed">{desc}</p>
              <a href={blog.link} target="_blank" rel="noopener noreferrer" className="btn-primary inline-flex">
                {btn}
              </a>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
