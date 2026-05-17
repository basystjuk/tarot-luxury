"use client";

import { useState } from "react";
import { ArrowRight, Heart } from "lucide-react";
import AnimatedSection from "@/components/ui/AnimatedSection";
import GoldDivider from "@/components/ui/GoldDivider";
import { SIGNS_UA, SIGN_GLYPHS } from "@/lib/astro/calculations";

interface CompatibilityData {
  score: number;
  title: string;
  description: string;
  strengths: string[];
  challenges: string[];
  element1: string;
  element2: string;
}

const ELEMENTS = ["Вогонь", "Земля", "Повітря", "Вода", "Вогонь", "Земля", "Повітря", "Вода", "Вогонь", "Земля", "Повітря", "Вода"];
const ELEMENT_COLORS: Record<string, string> = {
  "Вогонь": "text-orange-600",
  "Земля": "text-green-700",
  "Повітря": "text-sky-600",
  "Вода": "text-blue-600",
};

// Compatibility matrix (0-11 sign indices)
// Score 1-5 based on elemental + modal compatibility
function getCompatibility(s1: number, s2: number): CompatibilityData {
  const diff = Math.abs(s1 - s2);
  const minDiff = Math.min(diff, 12 - diff);
  const el1 = ELEMENTS[s1];
  const el2 = ELEMENTS[s2];

  // Same sign
  if (s1 === s2) {
    return {
      score: 4,
      title: "Дзеркало",
      description: `Дві ${SIGNS_UA[s1]} — це як дивитись у дзеркало. Ви чудово розумієте один одного, але важливо не загубитись у схожості.`,
      strengths: ["Повне взаєморозуміння", "Спільні цінності та пріоритети", "Синхронна комунікація"],
      challenges: ["Схожі слабкі сторони", "Конкуренція замість партнерства", "Відсутність балансуючих якостей"],
      element1: el1,
      element2: el2,
    };
  }

  // Trine (120°) - same element
  if (minDiff === 4) {
    return {
      score: 5,
      title: "Гармонія стихій",
      description: `${SIGNS_UA[s1]} та ${SIGNS_UA[s2]} — класичне тригональне з'єднання. Ви дихаєте одним повітрям і відчуваєте природний потік між собою.`,
      strengths: ["Природна гармонія", "Легкість спілкування", "Схожий погляд на світ", "Взаємна підтримка"],
      challenges: ["Може бракувати динаміки", "Рутина замість пристрасті"],
      element1: el1,
      element2: el2,
    };
  }

  // Sextile (60°)
  if (minDiff === 2) {
    return {
      score: 4,
      title: "Приємна сумісність",
      description: `${SIGNS_UA[s1]} та ${SIGNS_UA[s2]} утворюють гармонійний секстиль. У вас є природна взаємодоповнюваність та легкість у стосунках.`,
      strengths: ["Взаємне доповнення", "Цікавий обмін ідеями", "Природний ритм"],
      challenges: ["Потрібно докладати зусиль для глибини"],
      element1: el1,
      element2: el2,
    };
  }

  // Opposition (180°)
  if (minDiff === 6) {
    return {
      score: 3,
      title: "Магнетичне притяжіння",
      description: `${SIGNS_UA[s1]} та ${SIGNS_UA[s2]} — протилежні знаки. Між вами є неймовірна притягальна сила, але й серйозні виклики.`,
      strengths: ["Сильне початкове притяжіння", "Взаємне навчання", "Цікавість одне до одного"],
      challenges: ["Конфлікт цінностей", "Різні підходи до життя", "Потребує роботи та компромісів"],
      element1: el1,
      element2: el2,
    };
  }

  // Square (90°)
  if (minDiff === 3) {
    return {
      score: 2,
      title: "Пристрасна напруга",
      description: `${SIGNS_UA[s1]} та ${SIGNS_UA[s2]} створюють квадратний кут — це енергія зіткнення та трансформації. Вогонь є, але і виклики значні.`,
      strengths: ["Сильна пристрасть", "Взаємне зростання через труднощі", "Ніколи не нудьгуєте"],
      challenges: ["Часті конфлікти", "Різне бачення ситуацій", "Потребує великої роботи"],
      element1: el1,
      element2: el2,
    };
  }

  // Quincunx (150°) or other
  if (minDiff === 5) {
    return {
      score: 2,
      title: "Складна гармонія",
      description: `${SIGNS_UA[s1]} та ${SIGNS_UA[s2]} — неоднозначне поєднання. Вам потрібно докладати зусиль, щоб знайти спільну мову.`,
      strengths: ["Унікальна взаємодія", "Можливість для росту"],
      challenges: ["Різні потреби", "Непросте порозуміння", "Потрібна велика терпимість"],
      element1: el1,
      element2: el2,
    };
  }

  // Conjunct nearby / semi-sextile
  return {
    score: 3,
    title: "Нейтральна енергія",
    description: `${SIGNS_UA[s1]} та ${SIGNS_UA[s2]} — нейтральне поєднання. Ваші стосунки залежать від особистих карт та свідомих зусиль.`,
    strengths: ["Свіжий погляд одне на одного", "Багато чого навчитись"],
    challenges: ["Потрібна свідома робота", "Менше природної гармонії"],
    element1: el1,
    element2: el2,
  };
}

function ScoreBar({ score }: { score: number }) {
  const labels = ["", "Складно", "Виклик", "Нейтрально", "Добре", "Відмінно"];
  return (
    <div>
      <div className="flex gap-1.5 mb-2">
        {[1, 2, 3, 4, 5].map((s) => (
          <div
            key={s}
            className="flex-1 h-2.5 rounded-full transition-all duration-500"
            style={{ background: s <= score ? "#D4A853" : "rgba(196,169,122,0.2)" }}
          />
        ))}
      </div>
      <p className="text-sm text-[#B8883A] font-medium">{labels[score]}</p>
    </div>
  );
}

export default function CompatibilityPage() {
  const [sign1, setSign1] = useState(0);
  const [sign2, setSign2] = useState(6);
  const [result, setResult] = useState<CompatibilityData | null>(null);

  const handleCheck = () => {
    setResult(getCompatibility(sign1, sign2));
  };

  return (
    <>
      <section className="pt-36 pb-16 bg-[#FDFBF7] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(196,169,122,0.1),transparent)]" />
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <AnimatedSection>
            <span className="tag mb-6 inline-block">Астрологія</span>
            <h1
              className="text-[clamp(2.5rem,5vw,4.5rem)] text-[#1C1512] mb-6 leading-[1.06]"
              style={{ fontFamily: "var(--font-cormorant)", fontWeight: 400 }}
            >
              Сумісність знаків
            </h1>
            <p className="text-xl text-[#7A6A58] leading-relaxed">
              Перевірте астрологічну сумісність двох знаків Зодіаку.
            </p>
          </AnimatedSection>
        </div>
      </section>

      <GoldDivider />

      <section className="section-padding bg-[#FDFBF7]">
        <div className="max-w-2xl mx-auto px-6">
          <AnimatedSection>
            <div className="card-luxury mb-8">
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="block text-xs text-[#7A6A58] mb-3 tracking-wide uppercase">Перший знак</label>
                  <select
                    value={sign1}
                    onChange={(e) => setSign1(parseInt(e.target.value))}
                    className="input-luxury"
                  >
                    {SIGNS_UA.map((sign, i) => (
                      <option key={i} value={i}>{SIGN_GLYPHS[i]} {sign}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-[#7A6A58] mb-3 tracking-wide uppercase">Другий знак</label>
                  <select
                    value={sign2}
                    onChange={(e) => setSign2(parseInt(e.target.value))}
                    className="input-luxury"
                  >
                    {SIGNS_UA.map((sign, i) => (
                      <option key={i} value={i}>{SIGN_GLYPHS[i]} {sign}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Preview pair */}
              <div className="flex items-center justify-center gap-6 mb-8">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#E8C98A] to-[#C4A97A] flex items-center justify-center text-2xl mb-2">
                    {SIGN_GLYPHS[sign1]}
                  </div>
                  <p className="text-sm text-[#5C4530]">{SIGNS_UA[sign1]}</p>
                </div>
                <Heart size={24} className="text-[#D4A853]" />
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#D4A853] to-[#9A6E28] flex items-center justify-center text-2xl mb-2">
                    {SIGN_GLYPHS[sign2]}
                  </div>
                  <p className="text-sm text-[#5C4530]">{SIGNS_UA[sign2]}</p>
                </div>
              </div>

              <button onClick={handleCheck} className="btn-primary w-full">
                <ArrowRight size={16} />
                Перевірити сумісність
              </button>
            </div>
          </AnimatedSection>

          {result && (
            <AnimatedSection delay={0.1}>
              <div className="card-luxury space-y-6">
                <div>
                  <h2
                    className="text-3xl text-[#1C1512] mb-2"
                    style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}
                  >
                    {result.title}
                  </h2>
                  <ScoreBar score={result.score} />
                </div>

                <div className="flex gap-4">
                  <span className={`tag text-xs ${ELEMENT_COLORS[result.element1]}`}>{result.element1}</span>
                  <span className={`tag text-xs ${ELEMENT_COLORS[result.element2]}`}>{result.element2}</span>
                </div>

                <p className="text-[#7A6A58] leading-relaxed">{result.description}</p>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3
                      className="text-lg text-[#1C1512] mb-3"
                      style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}
                    >
                      Сильні сторони
                    </h3>
                    <ul className="space-y-2">
                      {result.strengths.map((s, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-[#5C4530]">
                          <span className="text-[#B8883A] mt-0.5">✓</span>
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3
                      className="text-lg text-[#1C1512] mb-3"
                      style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}
                    >
                      Виклики
                    </h3>
                    <ul className="space-y-2">
                      {result.challenges.map((c, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-[#5C4530]">
                          <span className="text-[#C4A97A] mt-0.5">△</span>
                          {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-4 border-t border-[rgba(196,169,122,0.2)]">
                  <p className="text-xs text-[#7A6A58] text-center">
                    Астрологія — лише один із вимірів. Для глибокого аналізу пари потрібна синастрія натальних карт.
                  </p>
                </div>
              </div>
            </AnimatedSection>
          )}
        </div>
      </section>
    </>
  );
}
