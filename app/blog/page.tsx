"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import AnimatedSection from "@/components/ui/AnimatedSection";
import GoldDivider from "@/components/ui/GoldDivider";
import { useLanguage } from '@/hooks/useLanguage';

export default function BlogPage() {
  const { language } = useLanguage();
  const isRu = language === 'ru';

  return (
    <>
      <section className="pt-36 pb-16 bg-[#FDFBF7] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(196,169,122,0.1),transparent)]" />
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <AnimatedSection>
            <span className="tag mb-6 inline-block">
              {isRu ? "Дневник таролога" : "Щоденник таролога"}
            </span>
            <h1
              className="text-[clamp(2.5rem,5vw,5rem)] text-[#1C1512] mb-6 leading-[1.06]"
              style={{ fontFamily: "var(--font-cormorant)", fontWeight: 400 }}
            >
              {isRu ? "Скоро здесь" : "Незабаром тут"}
            </h1>
            <p className="text-xl text-[#7A6A58] leading-relaxed max-w-xl mx-auto">
              {isRu
                ? "Готовлю статьи о таро, психологии отношений и женской мудрости. Следите за обновлениями в Telegram."
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
              {/* Ornament */}
              <div className="text-6xl text-[#D4A853] mb-6 select-none" style={{ fontFamily: "var(--font-cormorant)" }}>
                ✦
              </div>
              <h2
                className="text-3xl text-[#1C1512] mb-4"
                style={{ fontFamily: "var(--font-cormorant)", fontWeight: 400 }}
              >
                {isRu
                  ? "Пока читайте мой Telegram-канал"
                  : "Поки читайте мій Telegram-канал"}
              </h2>
              <p className="text-[#7A6A58] mb-8 leading-relaxed">
                {isRu
                  ? "Там я регулярно пишу о картах, отношениях, и делюсь мыслями после консультаций."
                  : "Там я регулярно пишу про карти, відносини та ділюся думками після консультацій."}
              </p>
              <a
                href="https://t.me/ellen_soul_taro"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary inline-flex"
              >
                {isRu ? "Перейти в Telegram" : "Перейти в Telegram"}
                <ArrowRight size={16} />
              </a>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
