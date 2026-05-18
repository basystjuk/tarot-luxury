'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import AnimatedSection from "@/components/ui/AnimatedSection";
import GoldDivider from "@/components/ui/GoldDivider";
import { useLanguage } from '@/hooks/useLanguage';
import { DEFAULT_SERVICES, DEFAULT_ORG, type ServiceItem, type OrgItem } from "@/lib/data/services";

function subtitleWithJostNums(text: string) {
  return text.split(/(\d+)/).map((part, i) =>
    /^\d+$/.test(part)
      ? <span key={i} style={{ fontFamily: "var(--font-jost)", fontVariantNumeric: "lining-nums", letterSpacing: "-0.02em", fontWeight: 300 }}>{part}</span>
      : part
  );
}

export default function ServicesPage() {
  const { language } = useLanguage();
  const isRu = language === 'ru';
  const isEn = language === 'en';

  const [services, setServices] = useState<ServiceItem[]>(DEFAULT_SERVICES);
  const [orgItems, setOrgItems] = useState<OrgItem[]>(DEFAULT_ORG);

  useEffect(() => {
    fetch("/api/content")
      .then((r) => r.json())
      .then((d) => {
        if (d.services?.length) setServices(d.services);
        if (d.org?.length) setOrgItems(d.org);
      })
      .catch(() => {});
  }, []);

  return (
    <>
      <section className="pt-36 pb-16 bg-[#FDFBF7] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(196,169,122,0.1),transparent)]" />
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <AnimatedSection>
            <span className="tag mb-6 inline-block">
              {isRu ? 'Услуги и цены' : isEn ? 'Services & Prices' : 'Послуги та ціни'}
            </span>
            <h1
              className="text-[clamp(2.5rem,5vw,5rem)] text-[#1C1512] mb-6 leading-[1.06]"
              style={{ fontFamily: "var(--font-cormorant)", fontWeight: 400 }}
            >
              {isRu ? 'Что я предлагаю' : isEn ? 'What I Offer' : 'Що я пропоную'}
            </h1>
            <p className="text-xl text-[#7A6A58] leading-relaxed">
              {isRu
                ? 'Каждая сессия — это уникальное пространство для вас. Без шаблонов, без спешки.'
                : isEn
                ? 'Each session is a unique space created just for you. No templates, no rush.'
                : 'Кожна сесія — це унікальний простір для вас. Без шаблонів, без поспіху.'}
            </p>
          </AnimatedSection>
        </div>
      </section>

      <GoldDivider />

      <section className="section-padding bg-[#FDFBF7]">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 space-y-8">
          {services.map((svc, i) => {
            const title = isRu ? svc.title_ru : svc.title_uk;
            const subtitle = isRu ? svc.subtitle_ru : svc.subtitle_uk;
            const desc = isRu ? svc.desc_ru : svc.desc_uk;
            const includes = isRu ? svc.includes_ru : svc.includes_uk;

            return (
              <AnimatedSection key={svc.id} delay={i * 0.06}>
                <div id={svc.id} className="card-luxury scroll-mt-28">
                  <div className="grid lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-2">
                      <h2
                        className="text-3xl lg:text-4xl text-[#1C1512] mb-5"
                        style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}
                      >
                        {title}
                        {subtitle && (
                          <span className="text-[#9A7040]" style={{ fontSize: "0.72em", fontWeight: 400 }}>
                            {" "}({subtitleWithJostNums(subtitle.charAt(0).toLowerCase() + subtitle.slice(1))})
                          </span>
                        )}
                      </h2>
                      <p className="text-[#7A6A58] leading-relaxed mb-6">{desc}</p>
                      <ul className="space-y-3">
                        {includes.map((item, j) => (
                          <li key={j} className="flex items-start gap-3 text-sm text-[#5C4530]">
                            <Check size={16} className="text-[#B8883A] mt-0.5 flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex flex-col items-center justify-center gap-6 text-center">
                      <div>
                        <p className="text-xs text-[#7A6A58] tracking-widest uppercase mb-3">
                          {isRu ? 'Стоимость' : isEn ? 'Price' : 'Вартість'}
                        </p>
                        <p className="text-[2.75rem] leading-none text-[#B8883A]"
                          style={{ fontFamily: "var(--font-jost)", fontWeight: 300, fontVariantNumeric: "lining-nums", letterSpacing: "-0.02em" }}>
                          {svc.price}
                        </p>
                      </div>
                      <div className="h-px w-full bg-[rgba(196,169,122,0.3)]" />
                      <Link href={`/${language}/contacts`} className="btn-primary w-full text-center justify-center">
                        {isRu ? 'Записаться' : isEn ? 'Book Now' : 'Записатись'}
                      </Link>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            );
          })}
        </div>
      </section>

      <GoldDivider />

      <section className="section-padding bg-[#F2EBD9]">
        <div className="max-w-3xl mx-auto px-6">
          <AnimatedSection className="text-center mb-10">
            <h2 className="text-[clamp(1.8rem,3vw,2.5rem)] text-[#1C1512]" style={{ fontFamily: "var(--font-cormorant)" }}>
              {isRu ? 'Организационные вопросы' : isEn ? 'Practical Information' : 'Організаційні питання'}
            </h2>
          </AnimatedSection>
          <div className="space-y-4">
            {orgItems.map((item, i) => (
              <AnimatedSection key={item.id} delay={i * 0.1}>
                <div className="card-luxury">
                  <p className="text-[#5C4530] leading-relaxed text-sm">
                    {isRu ? item.text_ru : item.text_uk}
                  </p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

    </>
  );
}
