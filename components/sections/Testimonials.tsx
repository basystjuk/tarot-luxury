"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import AnimatedSection from "@/components/ui/AnimatedSection";
import { testimonials } from "@/lib/data/testimonials";
import { useLanguage } from "@/hooks/useLanguage";

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5 mb-4">
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} width="16" height="16" viewBox="0 0 16 16" fill="#D4A853">
          <path d="M8 1l1.8 3.6L14 5.3l-3 2.9.7 4.1L8 10.4l-3.7 1.9.7-4.1-3-2.9 4.2-.7z"/>
        </svg>
      ))}
    </div>
  );
}

export default function Testimonials() {
  const { language } = useLanguage();
  const isRu = language === "ru";

  const visible = testimonials.filter((t) => t.visible);

  // If no testimonials yet — render nothing
  if (visible.length === 0) return null;

  const stats = isRu
    ? [
        { value: "500+", label: "консультаций" },
        { value: "5+", label: "лет практики" },
        { value: "98%", label: "довольных клиенток" },
        { value: "12", label: "стран" },
      ]
    : [
        { value: "500+", label: "консультацій" },
        { value: "5+", label: "років практики" },
        { value: "98%", label: "задоволених клієнток" },
        { value: "12", label: "країн" },
      ];

  return (
    <section className="section-padding bg-[#F2EBD9]">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <AnimatedSection className="text-center mb-16">
          <span className="tag mb-4 inline-block">
            {isRu ? "Отзывы" : "Відгуки"}
          </span>
          <h2 className="text-4xl lg:text-5xl" style={{ fontFamily: "var(--font-cormorant)" }}>
            {isRu ? "Что говорят клиентки" : "Що кажуть клієнтки"}
          </h2>
        </AnimatedSection>

        <div className="grid md:grid-cols-3 gap-6">
          {visible.slice(0, 3).map((review, i) => (
            <AnimatedSection key={review.id} delay={i * 0.1}>
              <motion.div
                whileHover={{ y: -4 }}
                className="card-luxury relative h-full flex flex-col"
              >
                <span
                  className="text-6xl text-[#D4A853] leading-none mb-2 select-none"
                  style={{ fontFamily: "var(--font-cormorant)", lineHeight: 1 }}
                  aria-hidden="true"
                >
                  &ldquo;
                </span>

                <StarRating count={review.rating} />

                <p className="text-[#5C4530] leading-relaxed flex-1 mb-6 text-base">
                  {isRu ? review.text_ru : review.text_uk}
                </p>

                <div className="flex items-center gap-3 mt-auto pt-4 border-t border-[rgba(196,169,122,0.2)]">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#E8C98A] to-[#C4A97A] flex items-center justify-center text-white font-semibold text-sm">
                    {review.name[0]}
                  </div>
                  <div>
                    <p className="font-medium text-[#1C1512] text-sm">{review.name}</p>
                    <p className="text-xs text-[#7A6A58]">{review.city}</p>
                  </div>
                </div>
              </motion.div>
            </AnimatedSection>
          ))}
        </div>

        {/* Trust stats */}
        <AnimatedSection delay={0.3} className="mt-16">
          <div className="flex flex-wrap justify-center gap-x-12 gap-y-6 text-center">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p
                  className="text-3xl text-[#B8883A] mb-1"
                  style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}
                >
                  {stat.value}
                </p>
                <p className="text-sm text-[#7A6A58] tracking-wide">{stat.label}</p>
              </div>
            ))}
          </div>
        </AnimatedSection>

        {visible.length > 3 && (
          <AnimatedSection delay={0.4} className="text-center mt-10">
            <Link href="/reviews" className="btn-outline">
              {isRu ? "Все отзывы" : "Всі відгуки"}
            </Link>
          </AnimatedSection>
        )}
      </div>
    </section>
  );
}
