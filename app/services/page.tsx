'use client';

import type { Metadata } from "next";
import Link from "next/link";
import { Clock, Check, ArrowRight } from "lucide-react";
import AnimatedSection from "@/components/ui/AnimatedSection";
import GoldDivider from "@/components/ui/GoldDivider";
import { useLanguage } from '@/hooks/useLanguage';



const services = [
  {
    id: "personal",
    title: "Особиста консультація",
    subtitle: "Відповіді на ваші найважливіші питання",
    duration: "60 хв",
    price: "800 грн",
    description:
      "Індивідуальна сесія, де ми досліджуємо вашу конкретну ситуацію. Підходить для будь-яких запитів: любов, відносини, самопізнання, вибір, рішення.",
    includes: [
      "Попередня анкета для кращого розуміння запиту",
      "Розклад на вашу конкретну ситуацію",
      "Детальна інтерпретація кожного аркану",
      "Психологічний коментар та рекомендації",
      "Запис або фото розкладу після сесії",
      "Текстова підтримка 48 годин після консультації",
    ],
  },
  {
    id: "couple",
    title: "Аналіз пари",
    subtitle: "Глибоке розуміння динаміки стосунків",
    duration: "90 хв",
    price: "1 200 грн",
    description:
      "Спеціальний розклад для аналізу відносин між двома людьми. Ідеально, якщо хочете зрозуміти, що відбувається між вами та партнером — зараз і в перспективі.",
    includes: [
      "Аналіз характеру та мотивацій обох партнерів",
      "Розклад на поточну динаміку стосунків",
      "Виявлення основних перешкод та ресурсів",
      "Прогноз розвитку відносин",
      "Практичні рекомендації для покращення комунікації",
      "Запис сесії та письмовий підсумок",
    ],
  },
  {
    id: "month",
    title: "Картка місяця",
    subtitle: "Ваш провідник на наступні 30 днів",
    duration: "30 хв",
    price: "400 грн",
    description:
      "Короткий прогностичний розклад на наступний місяць. Дає загальний орієнтир, ключову тему та практичні поради. Ідеально для регулярної практики самопізнання.",
    includes: [
      "Головна карта місяця та її глибинне значення",
      "Ключові теми та акценти місяця",
      "Поради щодо любові та відносин",
      "Сфери уваги та можливості",
      "Фото розкладу та письмова інтерпретація",
    ],
  },
  {
    id: "year",
    title: "Річний прогноз",
    subtitle: "Стратегічний погляд на ваш рік",
    duration: "120 хв",
    price: "1 800 грн",
    description:
      "Розгорнутий розклад на 12 місяців уперед. Для кожного місяця — ключова тема, виклики та можливості. Великий контекст і стратегічне бачення вашого року.",
    includes: [
      "Карта на кожен місяць року",
      "Загальна тема та уроки року",
      "Ключові поворотні моменти",
      "Сфери особливої уваги та розвитку",
      "Детальний письмовий звіт (PDF)",
      "Запис сесії та текстова підтримка місяць",
    ],
  },
];

const faqs = [
  {
    q: "Чи можна замовити консультацію для іншої людини?",
    a: "Так, але потрібен дозвіл цієї людини. Я не практикую несанкціоновані розклади.",
  },
  {
    q: "Як відбувається оплата?",
    a: "Оплата до сесії через карту або Monobank. Реквізити надсилаю після підтвердження запису.",
  },
  {
    q: "Чи є можливість переносу або скасування?",
    a: "Перенос можливий не пізніше ніж за 24 години. Скасування менш ніж за 12 годин — 50% вартості.",
  },
];

export default function ServicesPage() {
  const { t } = useLanguage();

  return (
    <>
      {/* Hero */}
      <section className="pt-36 pb-16 bg-[#FDFBF7] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(196,169,122,0.1),transparent)]" />
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <AnimatedSection>
            <span className="tag mb-6 inline-block">Послуги та ціни</span>
            <h1
              className="text-[clamp(2.5rem,5vw,5rem)] text-[#1C1512] mb-6 leading-[1.06]"
              style={{ fontFamily: "var(--font-cormorant)", fontWeight: 400 }}
            >
              Що я пропоную
            </h1>
            <p className="text-xl text-[#7A6A58] leading-relaxed">
              Кожна сесія — це унікальний простір для вас. Без шаблонів, без поспіху.
            </p>
          </AnimatedSection>
        </div>
      </section>

      <GoldDivider />

      {/* Services */}
      <section className="section-padding bg-[#FDFBF7]">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 space-y-10">
          {services.map((svc, i) => (
            <AnimatedSection key={svc.id} delay={i * 0.08}>
              <div id={svc.id} className="card-luxury scroll-mt-28">
                <div className="grid lg:grid-cols-3 gap-10">
                  {/* Info */}
                  <div className="lg:col-span-2">
                    <div className="flex items-start gap-4 mb-4">
                      <div>
                        <p className="text-xs text-[#C4A97A] tracking-[0.15em] uppercase mb-1"
                          style={{ fontFamily: "var(--font-jost)" }}>
                          {svc.subtitle}
                        </p>
                        <h2
                          className="text-3xl lg:text-4xl text-[#1C1512]"
                          style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}
                        >
                          {svc.title}
                        </h2>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mb-5">
                      <span className="flex items-center gap-1.5 text-sm text-[#7A6A58]">
                        <Clock size={14} className="text-[#C4A97A]" />
                        {svc.duration}
                      </span>
                    </div>

                    <p className="text-[#7A6A58] leading-relaxed mb-8">{svc.description}</p>

                    <ul className="space-y-3">
                      {svc.includes.map((item, j) => (
                        <li key={j} className="flex items-start gap-3 text-sm text-[#5C4530]">
                          <Check size={16} className="text-[#B8883A] mt-0.5 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Price & CTA */}
                  <div className="flex flex-col justify-between">
                    <div>
                      <p className="text-xs text-[#7A6A58] tracking-widest uppercase mb-2">Вартість</p>
                      <p
                        className="text-5xl text-[#B8883A] mb-1"
                        style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}
                      >
                        {svc.price}
                      </p>
                      <div className="h-px bg-[rgba(196,169,122,0.3)] my-6" />
                    </div>
                    <Link href="/contacts" className="btn-primary text-center">
                      {t('services.book')}
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </section>

      <GoldDivider />

      {/* Mini FAQ */}
      <section className="section-padding bg-[#F2EBD9]">
        <div className="max-w-3xl mx-auto px-6">
          <AnimatedSection className="text-center mb-12">
            <h2
              className="text-[clamp(2rem,4vw,3rem)] text-[#1C1512]"
              style={{ fontFamily: "var(--font-cormorant)" }}
            >
              Організаційні питання
            </h2>
          </AnimatedSection>
          <div className="space-y-6">
            {faqs.map((faq, i) => (
              <AnimatedSection key={i} delay={i * 0.1}>
                <div className="card-luxury">
                  <h3
                    className="text-xl text-[#1C1512] mb-3"
                    style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}
                  >
                    {faq.q}
                  </h3>
                  <p className="text-[#7A6A58] text-sm leading-relaxed">{faq.a}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-[#2D2218] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_70%_at_50%_50%,rgba(196,169,122,0.07),transparent)]" />
        <div className="relative max-w-2xl mx-auto px-6 text-center">
          <AnimatedSection>
            <h2
              className="text-[clamp(2rem,4vw,3.5rem)] text-white mb-6"
              style={{ fontFamily: "var(--font-cormorant)", fontWeight: 300 }}
            >
              Готова записатись?
            </h2>
            <p className="text-white/50 mb-10 max-w-md mx-auto">
              Напишіть мені у Telegram або Instagram — і ми підберемо зручний час для вашої сесії.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <a href="https://t.me/olena_tarot" target="_blank" rel="noopener noreferrer" className="btn-primary">
                Telegram
              </a>
              <Link href="/contacts" className="btn-outline !border-white/30 !text-white hover:!border-[#D4A853] hover:!text-[#D4A853]">
                Форма запиту
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
