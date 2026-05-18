"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import AnimatedSection from "@/components/ui/AnimatedSection";
import GoldDivider from "@/components/ui/GoldDivider";
import { useLanguage } from "@/hooks/useLanguage";
import { dateToJD, moonLongitudeFull } from "@/lib/astro/calculations";

type PhaseKey = "new" | "waxing_crescent" | "first_quarter" | "waxing_gibbous" | "full" | "waning_gibbous" | "last_quarter" | "waning_crescent";

interface MoonData {
  phaseKey: PhaseKey;
  phaseAngle: number;
  illumination: number;
  emoji: string;
  nextFull: Date;
  nextNew: Date;
}

function calcMoonPhase(year: number, month: number, day: number): MoonData {
  const jd = dateToJD(year, month, day, 12, 0, 0);
  const synodicMonth = 29.53058867;
  const phase = ((jd - 2451550.1) / synodicMonth) % 1;
  const phaseAngle = ((phase + 1) % 1) * 360;
  const illumination = Math.round(((1 - Math.cos((phaseAngle * Math.PI) / 180)) / 2) * 100);

  let phaseKey: PhaseKey;
  let emoji: string;

  if (phaseAngle < 22.5 || phaseAngle >= 337.5) { phaseKey = "new"; emoji = "🌑"; }
  else if (phaseAngle < 67.5) { phaseKey = "waxing_crescent"; emoji = "🌒"; }
  else if (phaseAngle < 112.5) { phaseKey = "first_quarter"; emoji = "🌓"; }
  else if (phaseAngle < 157.5) { phaseKey = "waxing_gibbous"; emoji = "🌔"; }
  else if (phaseAngle < 202.5) { phaseKey = "full"; emoji = "🌕"; }
  else if (phaseAngle < 247.5) { phaseKey = "waning_gibbous"; emoji = "🌖"; }
  else if (phaseAngle < 292.5) { phaseKey = "last_quarter"; emoji = "🌗"; }
  else { phaseKey = "waning_crescent"; emoji = "🌘"; }

  const daysToFull = ((0.5 - ((phase + 1) % 1)) * synodicMonth + synodicMonth) % synodicMonth;
  const daysToNew = ((1 - ((phase + 1) % 1)) * synodicMonth + synodicMonth) % synodicMonth;

  const fullDate = new Date(year, month - 1, day);
  fullDate.setDate(fullDate.getDate() + Math.round(daysToFull));
  const newDate = new Date(year, month - 1, day);
  newDate.setDate(newDate.getDate() + Math.round(daysToNew));

  void moonLongitudeFull;

  return { phaseKey, phaseAngle, illumination, emoji, nextFull: fullDate, nextNew: newDate };
}

const PHASE_CONTENT = {
  uk: {
    new: { name: "Новий Місяць", advice: "Час нових починань і намірів. Посійте насіння бажань." },
    waxing_crescent: { name: "Серп, що росте", advice: "Ідеальний час для старту та руху вперед. Дійте." },
    first_quarter: { name: "Перша чверть", advice: "Долайте перешкоди. Прийшов час рішень і дій." },
    waxing_gibbous: { name: "Прибуваючий горбатий Місяць", advice: "Тонка настройка та вдосконалення. Зосередьтесь на деталях." },
    full: { name: "Повний Місяць", advice: "Кульмінація та завершення. Відпустіть те, що більше не служить." },
    waning_gibbous: { name: "Спадаючий горбатий Місяць", advice: "Час подяки та рефлексії. Поділіться мудрістю." },
    last_quarter: { name: "Остання чверть", advice: "Відпустіть та очистіть. Звільніть простір для нового." },
    waning_crescent: { name: "Серп, що спадає", advice: "Час відпочинку та підготовки до нового циклу." },
  },
  ru: {
    new: { name: "Новолуние", advice: "Время новых начинаний и намерений. Посейте семена желаний." },
    waxing_crescent: { name: "Растущий серп", advice: "Идеальное время для старта и движения вперёд. Действуйте." },
    first_quarter: { name: "Первая четверть", advice: "Преодолевайте препятствия. Пришло время решений и действий." },
    waxing_gibbous: { name: "Растущая горбатая Луна", advice: "Тонкая настройка и совершенствование. Сосредоточьтесь на деталях." },
    full: { name: "Полнолуние", advice: "Кульминация и завершение. Отпустите то, что больше не служит." },
    waning_gibbous: { name: "Убывающая горбатая Луна", advice: "Время благодарности и рефлексии. Поделитесь мудростью." },
    last_quarter: { name: "Последняя четверть", advice: "Отпустите и очистите. Освободите пространство для нового." },
    waning_crescent: { name: "Убывающий серп", advice: "Время отдыха и подготовки к новому циклу." },
  },
  en: {
    new: { name: "New Moon", advice: "A time for new beginnings and intentions. Plant the seeds of your desires." },
    waxing_crescent: { name: "Waxing Crescent", advice: "The perfect time to start and move forward. Take action." },
    first_quarter: { name: "First Quarter", advice: "Overcome obstacles. The time for decisions and action has come." },
    waxing_gibbous: { name: "Waxing Gibbous", advice: "Fine-tuning and refinement. Focus on the details." },
    full: { name: "Full Moon", advice: "Culmination and completion. Release what no longer serves you." },
    waning_gibbous: { name: "Waning Gibbous", advice: "A time of gratitude and reflection. Share your wisdom." },
    last_quarter: { name: "Last Quarter", advice: "Let go and cleanse. Clear space for what is new." },
    waning_crescent: { name: "Waning Crescent", advice: "A time of rest and preparation for a new cycle." },
  },
};

const UA_MONTHS = ["січня","лютого","березня","квітня","травня","червня","липня","серпня","вересня","жовтня","листопада","грудня"];
const RU_MONTHS = ["января","февраля","марта","апреля","мая","июня","июля","августа","сентября","октября","ноября","декабря"];
const EN_MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function fmtDate(d: Date, lang: string): string {
  if (lang === "en") return `${EN_MONTHS[d.getMonth()]} ${d.getDate()}`;
  if (lang === "ru") return `${d.getDate()} ${RU_MONTHS[d.getMonth()]}`;
  return `${d.getDate()} ${UA_MONTHS[d.getMonth()]}`;
}

function MoonVisual({ illumination, phaseAngle, label }: { illumination: number; phaseAngle: number; label: string }) {
  const isWaning = phaseAngle > 180;
  const gradientId = "moonGrad";

  return (
    <div className="flex flex-col items-center gap-4">
      <svg viewBox="0 0 120 120" className="w-32 h-32">
        <defs>
          <radialGradient id={gradientId} cx="40%" cy="35%">
            <stop offset="0%" stopColor="#E8C98A" />
            <stop offset="100%" stopColor="#B8883A" />
          </radialGradient>
        </defs>
        <circle cx="60" cy="60" r="52" fill="#2D2218" />
        <clipPath id="moonClip">
          <circle cx="60" cy="60" r="52" />
        </clipPath>
        <g clipPath="url(#moonClip)">
          <circle cx="60" cy="60" r="52" fill={`url(#${gradientId})`} />
          {illumination < 100 && illumination > 0 && (
            <ellipse
              cx={isWaning ? 60 - (1 - illumination / 100) * 52 : 60 + (1 - illumination / 100) * 52}
              cy="60"
              rx={Math.abs((1 - illumination / 50) * 52)}
              ry="52"
              fill="#2D2218"
            />
          )}
        </g>
        <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(196,169,122,0.3)" strokeWidth="0.5" />
      </svg>
      <div className="text-center">
        <p className="text-4xl text-[#B8883A] mb-1" style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}>
          {illumination}%
        </p>
        <p className="text-sm text-[#7A6A58]">{label}</p>
      </div>
    </div>
  );
}

export default function MoonPhasePage() {
  const { language } = useLanguage();
  const isRu = language === "ru";
  const isEn = language === "en";

  const today = new Date();
  const [form, setForm] = useState({
    year: today.getFullYear().toString(),
    month: (today.getMonth() + 1).toString(),
    day: today.getDate().toString(),
  });
  const [result, setResult] = useState<MoonData | null>(null);

  const phaseContent = isRu ? PHASE_CONTENT.ru : isEn ? PHASE_CONTENT.en : PHASE_CONTENT.uk;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setResult(calcMoonPhase(parseInt(form.year), parseInt(form.month), parseInt(form.day)));
  };

  const [initialized, setInitialized] = useState(false);
  if (!initialized) {
    setInitialized(true);
    setResult(calcMoonPhase(today.getFullYear(), today.getMonth() + 1, today.getDate()));
  }

  return (
    <>
      <section className="pt-36 pb-16 bg-[#FDFBF7] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(196,169,122,0.1),transparent)]" />
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <AnimatedSection>
            <span className="tag mb-6 inline-block">
              {isRu ? "Лунный" : isEn ? "Lunar" : "Місячний"}
            </span>
            <h1
              className="text-[clamp(2.5rem,5vw,4.5rem)] text-[#1C1512] mb-6 leading-[1.06]"
              style={{ fontFamily: "var(--font-cormorant)", fontWeight: 400 }}
            >
              {isRu ? "Лунный гороскоп" : isEn ? "Moon Horoscope" : "Місячний гороскоп"}
            </h1>
            <p className="text-xl text-[#7A6A58] leading-relaxed">
              {isRu
                ? "Узнайте текущую фазу Луны и её влияние на ваш день."
                : isEn
                ? "Find the current Moon phase and its influence on your day."
                : "Дізнайтесь поточну фазу Місяця та її вплив на ваш день."}
            </p>
          </AnimatedSection>
        </div>
      </section>

      <GoldDivider />

      <section className="section-padding bg-[#FDFBF7]">
        <div className="max-w-2xl mx-auto px-6">
          <AnimatedSection>
            <div className="card-luxury mb-8">
              <h2
                className="text-2xl text-[#1C1512] mb-6"
                style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}
              >
                {isRu ? "Выберите дату" : isEn ? "Select a date" : "Оберіть дату"}
              </h2>
              <form onSubmit={handleSubmit} className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-[#7A6A58] mb-2 tracking-wide">
                    {isRu ? "День" : isEn ? "Day" : "День"}
                  </label>
                  <input
                    type="number" min={1} max={31}
                    value={form.day}
                    onChange={(e) => setForm({ ...form, day: e.target.value })}
                    className="input-luxury"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#7A6A58] mb-2 tracking-wide">
                    {isRu ? "Месяц" : isEn ? "Month" : "Місяць"}
                  </label>
                  <input
                    type="number" min={1} max={12}
                    value={form.month}
                    onChange={(e) => setForm({ ...form, month: e.target.value })}
                    className="input-luxury"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#7A6A58] mb-2 tracking-wide">
                    {isRu ? "Год" : isEn ? "Year" : "Рік"}
                  </label>
                  <input
                    type="number" min={1970} max={2050}
                    value={form.year}
                    onChange={(e) => setForm({ ...form, year: e.target.value })}
                    className="input-luxury"
                  />
                </div>
                <button type="submit" className="btn-primary col-span-3">
                  <ArrowRight size={16} />
                  {isRu ? "Рассчитать" : isEn ? "Calculate" : "Розрахувати"}
                </button>
              </form>
            </div>
          </AnimatedSection>

          {result && (
            <AnimatedSection delay={0.1}>
              <div className="card-luxury text-center">
                <div className="text-6xl mb-4">{result.emoji}</div>

                <h2
                  className="text-3xl text-[#1C1512] mb-6"
                  style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}
                >
                  {phaseContent[result.phaseKey].name}
                </h2>

                <MoonVisual
                  illumination={result.illumination}
                  phaseAngle={result.phaseAngle}
                  label={isRu ? "освещение" : isEn ? "illumination" : "освітлення"}
                />

                <div className="mt-8 p-6 bg-[rgba(196,169,122,0.06)] rounded-2xl border border-[rgba(196,169,122,0.15)]">
                  <p
                    className="text-xl text-[#5C4530] italic"
                    style={{ fontFamily: "var(--font-cormorant)" }}
                  >
                    &ldquo;{phaseContent[result.phaseKey].advice}&rdquo;
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="text-center p-4 rounded-xl bg-[rgba(196,169,122,0.06)]">
                    <p className="text-xs text-[#7A6A58] mb-1 tracking-wide uppercase">
                      {isRu ? "Полнолуние" : isEn ? "Full Moon" : "Повний місяць"}
                    </p>
                    <p className="text-[#B8883A] font-medium" style={{ fontFamily: "var(--font-cormorant)", fontSize: "1.2rem" }}>
                      {fmtDate(result.nextFull, language)}
                    </p>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-[rgba(196,169,122,0.06)]">
                    <p className="text-xs text-[#7A6A58] mb-1 tracking-wide uppercase">
                      {isRu ? "Новолуние" : isEn ? "New Moon" : "Новомісяць"}
                    </p>
                    <p className="text-[#B8883A] font-medium" style={{ fontFamily: "var(--font-cormorant)", fontSize: "1.2rem" }}>
                      {fmtDate(result.nextNew, language)}
                    </p>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          )}
        </div>
      </section>
    </>
  );
}
