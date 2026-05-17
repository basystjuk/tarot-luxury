"use client";

import { motion } from "framer-motion";
import AnimatedSection from "@/components/ui/AnimatedSection";

const reviews = [
  {
    text: "Ellen Soul — це не просто таро. Це глибокий аналіз ситуації, тактовні запитання та дивовижно точні відповіді. Після нашої сесії я нарешті зрозуміла, чому так довго трималась за стосунки, які мене руйнували.",
    name: "Марія К.",
    city: "Київ",
    rating: 5,
  },
  {
    text: "Дуже рекомендую! Запис проходить швидко, консультація онлайн — зручно та комфортно. Карти допомогли побачити картину відносин ніби збоку. Ellen Soul пояснює м'яко, без осуду.",
    name: "Вікторія Л.",
    city: "Харків",
    rating: 5,
  },
  {
    text: "Я скептично ставилась до таро, але подруга переконала спробувати. Тепер я сама рекомендую Олену всім своїм знайомим. Неймовірно точно і при цьому дуже психологічно обґрунтовано.",
    name: "Олеся Т.",
    city: "Львів",
    rating: 5,
  },
  {
    text: "Картка місяця — мій маленький ритуал тепер. Кожен місяць Ellen Soul дає такий чіткий орієнтир на наступні тижні, що я вже планую своє життя разом із її консультаціями.",
    name: "Даша М.",
    city: "Одеса",
    rating: 5,
  },
  {
    text: "Прийшла на аналіз пари з дуже болісним питанням. Ellen Soul не просто розклала карти — вона допомогла мені самій дійти до відповіді. Я вийшла із сесії легкою і з ясним розумінням, що робити.",
    name: "Ірина С.",
    city: "Дніпро",
    rating: 5,
  },
];

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
  return (
    <section className="section-padding bg-[#F2EBD9]">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <AnimatedSection className="text-center mb-16">
          <span className="tag mb-4 inline-block">Відгуки</span>
          <h2 className="text-4xl lg:text-5xl" style={{ fontFamily: "var(--font-cormorant)" }}>
            Що кажуть клієнтки
          </h2>
        </AnimatedSection>

        <div className="grid md:grid-cols-3 gap-6">
          {reviews.slice(0, 3).map((review, i) => (
            <AnimatedSection key={i} delay={i * 0.1}>
              <motion.div
                whileHover={{ y: -4 }}
                className="card-luxury relative h-full flex flex-col"
              >
                {/* Gold quote mark */}
                <span
                  className="text-6xl text-[#D4A853] leading-none mb-2 select-none"
                  style={{ fontFamily: "var(--font-cormorant)", lineHeight: 1 }}
                  aria-hidden="true"
                >
                  "
                </span>

                <StarRating count={review.rating} />

                <p className="text-[#5C4530] leading-relaxed flex-1 mb-6 text-base">
                  {review.text}
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
            {[
              { value: "500+", label: "консультацій" },
              { value: "4 роки", label: "практики" },
              { value: "98%", label: "задоволених клієнток" },
              { value: "12", label: "країн присутності" },
            ].map((stat) => (
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
      </div>
    </section>
  );
}
