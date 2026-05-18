"use client";

import { useState } from "react";
import { ArrowRight, Heart } from "lucide-react";
import AnimatedSection from "@/components/ui/AnimatedSection";
import GoldDivider from "@/components/ui/GoldDivider";
import { useLanguage } from "@/hooks/useLanguage";
import { SIGNS_UA, SIGNS_EN, SIGN_GLYPHS } from "@/lib/astro/calculations";

const SIGNS_RU = [
  "Овен", "Телец", "Близнецы", "Рак",
  "Лев", "Дева", "Весы", "Скорпион",
  "Стрелец", "Козерог", "Водолей", "Рыбы",
];

const ELEMENTS_UA = ["Вогонь", "Земля", "Повітря", "Вода", "Вогонь", "Земля", "Повітря", "Вода", "Вогонь", "Земля", "Повітря", "Вода"];
const ELEMENTS_RU = ["Огонь", "Земля", "Воздух", "Вода", "Огонь", "Земля", "Воздух", "Вода", "Огонь", "Земля", "Воздух", "Вода"];
const ELEMENTS_EN = ["Fire", "Earth", "Air", "Water", "Fire", "Earth", "Air", "Water", "Fire", "Earth", "Air", "Water"];

const ELEMENT_COLORS: Record<string, string> = {
  "Вогонь": "text-orange-600", "Огонь": "text-orange-600", "Fire": "text-orange-600",
  "Земля": "text-green-700", "Earth": "text-green-700",
  "Повітря": "text-sky-600", "Воздух": "text-sky-600", "Air": "text-sky-600",
  "Вода": "text-blue-600", "Вода_ru": "text-blue-600", "Water": "text-blue-600",
};

type CompatType = "same" | "trine" | "sextile" | "opposition" | "square" | "quincunx" | "neutral";

interface CompatibilityData {
  score: number;
  type: CompatType;
  element1: string;
  element2: string;
}

function getCompatibility(s1: number, s2: number, elements: string[]): CompatibilityData {
  const diff = Math.abs(s1 - s2);
  const minDiff = Math.min(diff, 12 - diff);
  const el1 = elements[s1];
  const el2 = elements[s2];

  if (s1 === s2) return { score: 4, type: "same", element1: el1, element2: el2 };
  if (minDiff === 4) return { score: 5, type: "trine", element1: el1, element2: el2 };
  if (minDiff === 2) return { score: 4, type: "sextile", element1: el1, element2: el2 };
  if (minDiff === 6) return { score: 3, type: "opposition", element1: el1, element2: el2 };
  if (minDiff === 3) return { score: 2, type: "square", element1: el1, element2: el2 };
  if (minDiff === 5) return { score: 2, type: "quincunx", element1: el1, element2: el2 };
  return { score: 3, type: "neutral", element1: el1, element2: el2 };
}

const CONTENT = {
  uk: {
    same: {
      title: "Дзеркало",
      desc: (s: string) => `Дві ${s} — це як дивитись у дзеркало. Ви чудово розумієте один одного, але важливо не загубитись у схожості.`,
      strengths: ["Повне взаєморозуміння", "Спільні цінності та пріоритети", "Синхронна комунікація"],
      challenges: ["Схожі слабкі сторони", "Конкуренція замість партнерства", "Відсутність балансуючих якостей"],
    },
    trine: {
      title: "Гармонія стихій",
      desc: (s1: string, s2: string) => `${s1} та ${s2} — класичне тригональне з'єднання. Ви дихаєте одним повітрям і відчуваєте природний потік між собою.`,
      strengths: ["Природна гармонія", "Легкість спілкування", "Схожий погляд на світ", "Взаємна підтримка"],
      challenges: ["Може бракувати динаміки", "Рутина замість пристрасті"],
    },
    sextile: {
      title: "Приємна сумісність",
      desc: (s1: string, s2: string) => `${s1} та ${s2} утворюють гармонійний секстиль. У вас є природна взаємодоповнюваність та легкість у стосунках.`,
      strengths: ["Взаємне доповнення", "Цікавий обмін ідеями", "Природний ритм"],
      challenges: ["Потрібно докладати зусиль для глибини"],
    },
    opposition: {
      title: "Магнетичне притяжіння",
      desc: (s1: string, s2: string) => `${s1} та ${s2} — протилежні знаки. Між вами є неймовірна притягальна сила, але й серйозні виклики.`,
      strengths: ["Сильне початкове притяжіння", "Взаємне навчання", "Цікавість одне до одного"],
      challenges: ["Конфлікт цінностей", "Різні підходи до життя", "Потребує роботи та компромісів"],
    },
    square: {
      title: "Пристрасна напруга",
      desc: (s1: string, s2: string) => `${s1} та ${s2} створюють квадратний кут — це енергія зіткнення та трансформації. Вогонь є, але і виклики значні.`,
      strengths: ["Сильна пристрасть", "Взаємне зростання через труднощі", "Ніколи не нудьгуєте"],
      challenges: ["Часті конфлікти", "Різне бачення ситуацій", "Потребує великої роботи"],
    },
    quincunx: {
      title: "Складна гармонія",
      desc: (s1: string, s2: string) => `${s1} та ${s2} — неоднозначне поєднання. Вам потрібно докладати зусиль, щоб знайти спільну мову.`,
      strengths: ["Унікальна взаємодія", "Можливість для росту"],
      challenges: ["Різні потреби", "Непросте порозуміння", "Потрібна велика терпимість"],
    },
    neutral: {
      title: "Нейтральна енергія",
      desc: (s1: string, s2: string) => `${s1} та ${s2} — нейтральне поєднання. Ваші стосунки залежать від особистих карт та свідомих зусиль.`,
      strengths: ["Свіжий погляд одне на одного", "Багато чого навчитись"],
      challenges: ["Потрібна свідома робота", "Менше природної гармонії"],
    },
  },
  ru: {
    same: {
      title: "Зеркало",
      desc: (s: string) => `Два ${s} — это как смотреть в зеркало. Вы прекрасно понимаете друг друга, но важно не потеряться в схожести.`,
      strengths: ["Полное взаимопонимание", "Общие ценности и приоритеты", "Синхронная коммуникация"],
      challenges: ["Схожие слабые стороны", "Конкуренция вместо партнёрства", "Нет балансирующих качеств"],
    },
    trine: {
      title: "Гармония стихий",
      desc: (s1: string, s2: string) => `${s1} и ${s2} — классическое тригональное соединение. Вы дышите одним воздухом и ощущаете естественный поток между собой.`,
      strengths: ["Природная гармония", "Лёгкость общения", "Схожий взгляд на мир", "Взаимная поддержка"],
      challenges: ["Может не хватать динамики", "Рутина вместо страсти"],
    },
    sextile: {
      title: "Приятная совместимость",
      desc: (s1: string, s2: string) => `${s1} и ${s2} образуют гармоничный секстиль. У вас есть природная взаимодополняемость и лёгкость в отношениях.`,
      strengths: ["Взаимное дополнение", "Интересный обмен идеями", "Природный ритм"],
      challenges: ["Нужно прикладывать усилия для глубины"],
    },
    opposition: {
      title: "Магнетическое притяжение",
      desc: (s1: string, s2: string) => `${s1} и ${s2} — противоположные знаки. Между вами есть невероятная притягательная сила, но и серьёзные вызовы.`,
      strengths: ["Сильное начальное притяжение", "Взаимное обучение", "Интерес друг к другу"],
      challenges: ["Конфликт ценностей", "Разные подходы к жизни", "Требует работы и компромиссов"],
    },
    square: {
      title: "Страстное напряжение",
      desc: (s1: string, s2: string) => `${s1} и ${s2} создают квадратный угол — это энергия столкновения и трансформации. Огонь есть, но и вызовы значительны.`,
      strengths: ["Сильная страсть", "Взаимный рост через трудности", "Никогда не скучно"],
      challenges: ["Частые конфликты", "Разное видение ситуаций", "Требует большой работы"],
    },
    quincunx: {
      title: "Сложная гармония",
      desc: (s1: string, s2: string) => `${s1} и ${s2} — неоднозначное сочетание. Вам нужно прикладывать усилия, чтобы найти общий язык.`,
      strengths: ["Уникальное взаимодействие", "Возможность для роста"],
      challenges: ["Разные потребности", "Непростое понимание", "Нужна большая терпимость"],
    },
    neutral: {
      title: "Нейтральная энергия",
      desc: (s1: string, s2: string) => `${s1} и ${s2} — нейтральное сочетание. Ваши отношения зависят от личных карт и осознанных усилий.`,
      strengths: ["Свежий взгляд друг на друга", "Многому можно научиться"],
      challenges: ["Нужна осознанная работа", "Меньше природной гармонии"],
    },
  },
  en: {
    same: {
      title: "Mirror Match",
      desc: (s: string) => `Two ${s} — it's like looking in a mirror. You understand each other perfectly, but it's important not to get lost in your similarities.`,
      strengths: ["Complete mutual understanding", "Shared values and priorities", "Synchronised communication"],
      challenges: ["Shared weaknesses", "Competition instead of partnership", "Lack of balancing qualities"],
    },
    trine: {
      title: "Elemental Harmony",
      desc: (s1: string, s2: string) => `${s1} and ${s2} — a classic trine connection. You breathe the same air and feel a natural flow between you.`,
      strengths: ["Natural harmony", "Easy communication", "Shared worldview", "Mutual support"],
      challenges: ["May lack dynamism", "Routine instead of passion"],
    },
    sextile: {
      title: "Pleasant Compatibility",
      desc: (s1: string, s2: string) => `${s1} and ${s2} form a harmonious sextile. You have natural complementarity and ease in your relationship.`,
      strengths: ["Mutual complementarity", "Stimulating exchange of ideas", "Natural rhythm"],
      challenges: ["Need effort to achieve depth"],
    },
    opposition: {
      title: "Magnetic Attraction",
      desc: (s1: string, s2: string) => `${s1} and ${s2} — opposite signs. There is an incredible pull between you, but also serious challenges.`,
      strengths: ["Strong initial attraction", "Mutual learning", "Curiosity about each other"],
      challenges: ["Conflicting values", "Different approaches to life", "Requires work and compromise"],
    },
    square: {
      title: "Passionate Tension",
      desc: (s1: string, s2: string) => `${s1} and ${s2} form a square — this is the energy of friction and transformation. The spark is there, but so are the challenges.`,
      strengths: ["Strong passion", "Mutual growth through difficulty", "Never boring"],
      challenges: ["Frequent conflicts", "Different perspectives", "Requires considerable effort"],
    },
    quincunx: {
      title: "Complex Harmony",
      desc: (s1: string, s2: string) => `${s1} and ${s2} — an ambiguous combination. You need to make a conscious effort to find common ground.`,
      strengths: ["Unique dynamic", "Opportunity for growth"],
      challenges: ["Different needs", "Difficult mutual understanding", "Requires great tolerance"],
    },
    neutral: {
      title: "Neutral Energy",
      desc: (s1: string, s2: string) => `${s1} and ${s2} — a neutral combination. Your relationship depends on your individual charts and conscious effort.`,
      strengths: ["Fresh perspective on each other", "Much to learn together"],
      challenges: ["Requires conscious work", "Less natural harmony"],
    },
  },
};

function ScoreBar({ score, lang }: { score: number; lang: string }) {
  const labelsMap: Record<string, string[]> = {
    uk: ["", "Складно", "Виклик", "Нейтрально", "Добре", "Відмінно"],
    ru: ["", "Сложно", "Вызов", "Нейтрально", "Хорошо", "Отлично"],
    en: ["", "Difficult", "Challenge", "Neutral", "Good", "Excellent"],
  };
  const labels = labelsMap[lang] ?? labelsMap.en;
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
  const { language } = useLanguage();
  const isRu = language === "ru";
  const isEn = language === "en";

  const signs = isRu ? SIGNS_RU : isEn ? SIGNS_EN : SIGNS_UA;
  const elements = isRu ? ELEMENTS_RU : isEn ? ELEMENTS_EN : ELEMENTS_UA;
  const content = isRu ? CONTENT.ru : isEn ? CONTENT.en : CONTENT.uk;

  const [sign1, setSign1] = useState(0);
  const [sign2, setSign2] = useState(6);
  const [result, setResult] = useState<CompatibilityData | null>(null);

  const handleCheck = () => {
    setResult(getCompatibility(sign1, sign2, elements));
  };

  const resultContent = result ? content[result.type] : null;
  const s1Name = signs[sign1];
  const s2Name = signs[sign2];
  const resultTitle = resultContent?.title ?? "";
  const resultDesc = resultContent
    ? result!.type === "same"
      ? (resultContent.desc as (s: string) => string)(s1Name)
      : (resultContent.desc as (s1: string, s2: string) => string)(s1Name, s2Name)
    : "";
  const resultStrengths = resultContent?.strengths ?? [];
  const resultChallenges = resultContent?.challenges ?? [];

  return (
    <>
      <section className="pt-36 pb-16 bg-[#FDFBF7] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(196,169,122,0.1),transparent)]" />
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <AnimatedSection>
            <span className="tag mb-6 inline-block">
              {isRu ? "Астрология" : isEn ? "Astrology" : "Астрологія"}
            </span>
            <h1
              className="text-[clamp(2.5rem,5vw,4.5rem)] text-[#1C1512] mb-6 leading-[1.06]"
              style={{ fontFamily: "var(--font-cormorant)", fontWeight: 400 }}
            >
              {isRu ? "Совместимость знаков" : isEn ? "Sign Compatibility" : "Сумісність знаків"}
            </h1>
            <p className="text-xl text-[#7A6A58] leading-relaxed">
              {isRu
                ? "Проверьте астрологическую совместимость двух знаков Зодиака."
                : isEn
                ? "Check the astrological compatibility of two Zodiac signs."
                : "Перевірте астрологічну сумісність двох знаків Зодіаку."}
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
                  <label className="block text-xs text-[#7A6A58] mb-3 tracking-wide uppercase">
                    {isRu ? "Первый знак" : isEn ? "First sign" : "Перший знак"}
                  </label>
                  <select
                    value={sign1}
                    onChange={(e) => setSign1(parseInt(e.target.value))}
                    className="input-luxury"
                  >
                    {signs.map((sign, i) => (
                      <option key={i} value={i}>{SIGN_GLYPHS[i]} {sign}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-[#7A6A58] mb-3 tracking-wide uppercase">
                    {isRu ? "Второй знак" : isEn ? "Second sign" : "Другий знак"}
                  </label>
                  <select
                    value={sign2}
                    onChange={(e) => setSign2(parseInt(e.target.value))}
                    className="input-luxury"
                  >
                    {signs.map((sign, i) => (
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
                  <p className="text-sm text-[#5C4530]">{signs[sign1]}</p>
                </div>
                <Heart size={24} className="text-[#D4A853]" />
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#D4A853] to-[#9A6E28] flex items-center justify-center text-2xl mb-2">
                    {SIGN_GLYPHS[sign2]}
                  </div>
                  <p className="text-sm text-[#5C4530]">{signs[sign2]}</p>
                </div>
              </div>

              <button onClick={handleCheck} className="btn-primary w-full">
                <ArrowRight size={16} />
                {isRu ? "Проверить совместимость" : isEn ? "Check Compatibility" : "Перевірити сумісність"}
              </button>
            </div>
          </AnimatedSection>

          {result && resultContent && (
            <AnimatedSection delay={0.1}>
              <div className="card-luxury space-y-6">
                <div>
                  <h2
                    className="text-3xl text-[#1C1512] mb-2"
                    style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}
                  >
                    {resultTitle}
                  </h2>
                  <ScoreBar score={result.score} lang={language} />
                </div>

                <div className="flex gap-4">
                  <span className={`tag text-xs ${ELEMENT_COLORS[result.element1] ?? ""}`}>{result.element1}</span>
                  <span className={`tag text-xs ${ELEMENT_COLORS[result.element2] ?? ""}`}>{result.element2}</span>
                </div>

                <p className="text-[#7A6A58] leading-relaxed">{resultDesc}</p>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3
                      className="text-lg text-[#1C1512] mb-3"
                      style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}
                    >
                      {isRu ? "Сильные стороны" : isEn ? "Strengths" : "Сильні сторони"}
                    </h3>
                    <ul className="space-y-2">
                      {resultStrengths.map((s, i) => (
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
                      {isRu ? "Вызовы" : isEn ? "Challenges" : "Виклики"}
                    </h3>
                    <ul className="space-y-2">
                      {resultChallenges.map((c, i) => (
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
                    {isRu
                      ? "Астрология — лишь одно из измерений. Для глубокого анализа пары нужна синастрия натальных карт."
                      : isEn
                      ? "Astrology is just one dimension. A deep analysis of a couple requires synastry of their natal charts."
                      : "Астрологія — лише один із вимірів. Для глибокого аналізу пари потрібна синастрія натальних карт."}
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
