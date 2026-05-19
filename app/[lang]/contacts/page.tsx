"use client";

import AnimatedSection from "@/components/ui/AnimatedSection";
import GoldDivider from "@/components/ui/GoldDivider";
import { useLanguage } from '@/hooks/useLanguage';
import BookingFormContent from "@/components/ui/BookingFormContent";
import QuickContactLinks from "@/components/ui/QuickContactLinks";

export default function ContactsPage() {
  const { language } = useLanguage();
  const isRu = language === 'ru';
  const isEn = language === 'en';

  const hours = isRu
    ? [
        { day: "Понедельник–Суббота", hours: "10:00 – 20:00" },
        { day: "Воскресенье", hours: "По договорённости" },
      ]
    : isEn
    ? [
        { day: "Monday–Saturday", hours: "10:00 – 20:00" },
        { day: "Sunday", hours: "By arrangement" },
      ]
    : [
        { day: "Понеділок–Субота", hours: "10:00 – 20:00" },
        { day: "Неділя", hours: "За домовленістю" },
      ];

  return (
    <>
      <section className="pt-36 pb-16 bg-[#FDFBF7] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(196,169,122,0.1),transparent)]" />
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <AnimatedSection>
            <span className="tag mb-6 inline-block">
              {isRu ? "Связаться" : isEn ? "Get in Touch" : "Зв'язатись"}
            </span>
            <h1
              className="text-[clamp(2.5rem,5vw,5rem)] text-[#1C1512] mb-6 leading-[1.06]"
              style={{ fontFamily: "var(--font-cormorant)", fontWeight: 400 }}
            >
              {isRu ? "Записаться на консультацию" : isEn ? "Book a Consultation" : "Записатись на консультацію"}
            </h1>
            <p className="text-xl text-[#7A6A58] leading-relaxed">
              {isRu
                ? "Оставьте заявку — и я свяжусь с вами в течение 24 часов."
                : isEn
                ? "Leave a request — and I will contact you within 24 hours."
                : "Залиште заявку — і я зв'яжуся з вами протягом 24 годин."}
            </p>
          </AnimatedSection>
        </div>
      </section>

      <GoldDivider />

      <section className="section-padding bg-[#FDFBF7]">
        <div className="max-w-6xl mx-auto px-6 lg:px-10">
          <div className="grid lg:grid-cols-[1fr_380px] gap-12">

            {/* ── Booking form (shared component) ── */}
            <AnimatedSection>
              <div className="card-luxury">
                <h2
                  className="text-2xl text-[#1C1512] mb-8 text-center"
                  style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}
                >
                  {isRu ? "Форма запроса" : isEn ? "Request Form" : "Форма запиту"}
                </h2>
                <BookingFormContent />
              </div>
            </AnimatedSection>

            {/* ── Right sidebar ── */}
            <AnimatedSection delay={0.1} direction="left">
              <div className="space-y-6">

                {/* Quick contact (shared component) */}
                <div className="card-luxury">
                  <QuickContactLinks />
                </div>

                {/* Working hours */}
                <div className="card-luxury">
                  <h3
                    className="text-xl text-[#1C1512] mb-4 text-center"
                    style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}
                  >
                    {isRu ? "Рабочее время" : isEn ? "Working Hours" : "Робочий час"}
                  </h3>
                  <div className="space-y-3">
                    {hours.map(item => (
                      <div
                        key={item.day}
                        className="flex justify-between items-center py-2 border-b border-[rgba(196,169,122,0.15)]"
                      >
                        <span className="text-sm text-[#7A6A58]">{item.day}</span>
                        <span className="text-sm text-[#1C1512] font-medium">{item.hours}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-[#7A6A58] mt-4">
                    {isRu
                      ? "Время по Киевскому часовому поясу (UTC+2/UTC+3)"
                      : isEn
                      ? "Kyiv time zone (UTC+2/UTC+3)"
                      : "Час за Київським часовим поясом (UTC+2/UTC+3)"}
                  </p>
                </div>

                {/* Confidentiality */}
                <div className="card-luxury bg-[rgba(196,169,122,0.05)]">
                  <div className="text-center">
                    <p
                      className="font-medium text-[#1C1512] mb-2 text-center"
                      style={{ fontFamily: "var(--font-cormorant)", fontSize: "1.5rem", fontWeight: 600 }}
                    >
                      {isRu
                        ? "Гарантия конфиденциальности"
                        : isEn
                        ? "Confidentiality Guarantee"
                        : "Гарантія конфіденційності"}
                    </p>
                    <p className="text-base text-[#7A6A58] leading-relaxed text-center">
                      {isRu
                        ? "Всё, что вы рассказываете — остаётся между нами."
                        : isEn
                        ? "Everything you share stays between us. I never pass data to third parties."
                        : "Усе, що ви розповідаєте — залишається між нами."}
                    </p>
                  </div>
                </div>

              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>
    </>
  );
}
