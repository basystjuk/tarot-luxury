"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import AnimatedSection from "@/components/ui/AnimatedSection";
import GoldDivider from "@/components/ui/GoldDivider";
import { useLanguage } from '@/hooks/useLanguage';

export default function FAQPage() {
  const { language } = useLanguage();
  const isRu = language === 'ru';
  const isEn = language === 'en';

  type FaqItem = { id: string; category: string; q: string; a: string };

  const [faqItems, setFaqItems] = useState<FaqItem[]>([]);
  const cachedData = useRef<{ faq_uk?: FaqItem[]; faq_ru?: FaqItem[]; faq_en?: FaqItem[] } | null>(null);

  const [activeCategory, setActiveCategory] = useState<string>(() => isRu ? "Все" : isEn ? "All" : "Всі");
  const [openItem, setOpenItem] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/content")
      .then(r => r.json())
      .then(data => {
        cachedData.current = data;
        const items = isRu ? data.faq_ru : isEn ? data.faq_en : data.faq_uk;
        if (items) setFaqItems(items);
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!cachedData.current) return;
    const data = cachedData.current;
    const items = isRu ? data.faq_ru : isEn ? data.faq_en : data.faq_uk;
    if (items) setFaqItems(items);
    setActiveCategory(isRu ? "Все" : isEn ? "All" : "Всі");
    setOpenItem(null);
  }, [language, isRu, isEn]);

  const ALL_LABEL = isRu ? "Все" : isEn ? "All" : "Всі";
  const uniqueCategories = Array.from(new Set(faqItems.map(f => f.category)));
  const categories = [ALL_LABEL, ...uniqueCategories];

  const filtered = activeCategory === ALL_LABEL ? faqItems : faqItems.filter(f => f.category === activeCategory);

  return (
    <>
      <section className="pt-36 pb-16 bg-[#FDFBF7] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(196,169,122,0.1),transparent)]" />
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <AnimatedSection>
            <span className="tag mb-6 inline-block">
              {isRu ? "Вопросы и ответы" : isEn ? "Questions & Answers" : "Питання та відповіді"}
            </span>
            <h1 className="text-[clamp(2.5rem,5vw,5rem)] text-[#1C1512] mb-6 leading-[1.06]" style={{ fontFamily: "var(--font-cormorant)", fontWeight: 400 }}>
              {isRu ? "Твоя подсказка" : isEn ? "Your Guide" : "Твоя підказка"}
            </h1>
            <p className="text-xl text-[#7A6A58] leading-relaxed">
              {isRu ? "Ответы на самые частые вопросы." : isEn ? "Answers to the most common questions." : "Відповіді на найпоширеніші запитання."}
            </p>
          </AnimatedSection>
        </div>
      </section>

      <GoldDivider />

      <section className="py-8 bg-[#FDFBF7]">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map(cat => (
              <button key={cat} onClick={() => { setActiveCategory(cat); setOpenItem(null); }}
                className={`px-5 py-2 rounded-full text-sm transition-all duration-300 ${activeCategory === cat ? "bg-[#D4A853] text-white shadow-[0_4px_16px_rgba(212,168,83,0.3)]" : "border border-[rgba(196,169,122,0.4)] text-[#7A6A58] hover:border-[#D4A853] hover:text-[#B8883A]"}`}
                style={{ fontFamily: "var(--font-jost)", fontWeight: 500 }}>
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-section bg-[#FDFBF7] pt-2">
        <div className="max-w-3xl mx-auto px-6">
          <AnimatedSection>
            <div className="space-y-3">
              {filtered.map((faq, i) => (
                <div key={i} className="card-luxury !p-0 overflow-hidden">
                  <button onClick={() => setOpenItem(openItem === i ? null : i)} className="w-full flex items-center justify-between px-6 py-5 text-left group">
                    <div>
                      <span className="text-xs text-[#C4A97A] tracking-widest uppercase block mb-1" style={{ fontFamily: "var(--font-jost)" }}>{faq.category}</span>
                      <span className="text-xl text-[#1C1512] group-hover:text-[#B8883A] transition-colors" style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}>{faq.q}</span>
                    </div>
                    <ChevronDown size={18} className={`text-[#C4A97A] flex-shrink-0 ml-4 transition-transform duration-300 ${openItem === i ? "rotate-180" : ""}`} />
                  </button>
                  {openItem === i && (
                    <div className="px-6 pb-5 text-[#7A6A58] text-sm leading-relaxed border-t border-[rgba(196,169,122,0.1)] pt-4">{faq.a}</div>
                  )}
                </div>
              ))}
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.2} className="mt-16 mb-16 text-center">
            <div className="card-luxury">
              <h2 className="text-2xl text-[#1C1512] mb-3" style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}>
                {isRu ? "Не нашли ответ?" : isEn ? "Didn't find an answer?" : "Не знайшли відповідь?"}
              </h2>
              <p className="text-[#7A6A58] mb-6">
                {isRu ? "Напишите мне напрямую — я отвечу на любой вопрос."
                  : isEn ? "Write to me directly — I will answer any question."
                  : "Напишіть мені напряму — я відповім на будь-яке питання."}
              </p>
              <Link href={`/${language}/contacts`} className="btn-primary">
                {isRu ? "Написать мне" : isEn ? "Write to Me" : "Написати мені"}
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
