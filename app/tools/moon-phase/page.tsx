"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import AnimatedSection from "@/components/ui/AnimatedSection";
import GoldDivider from "@/components/ui/GoldDivider";
import { dateToJD, moonLongitudeFull } from "@/lib/astro/calculations";

interface MoonData {
  phase: string;
  phaseAngle: number;
  illumination: number;
  emoji: string;
  advice: string;
  nextFull: string;
  nextNew: string;
}

function calcMoonPhase(year: number, month: number, day: number): MoonData {
  const jd = dateToJD(year, month, day, 12, 0, 0);
  // Approximate new moon reference: JD 2451550.1 (Jan 6, 2000)
  const synodicMonth = 29.53058867;
  const phase = ((jd - 2451550.1) / synodicMonth) % 1;
  const phaseAngle = ((phase + 1) % 1) * 360;
  const illumination = Math.round(((1 - Math.cos((phaseAngle * Math.PI) / 180)) / 2) * 100);

  // Determine phase name
  let phaseName: string;
  let emoji: string;
  let advice: string;

  if (phaseAngle < 22.5 || phaseAngle >= 337.5) {
    phaseName = "Новий Місяць";
    emoji = "🌑";
    advice = "Час нових починань і намірів. Посійте насіння бажань.";
  } else if (phaseAngle < 67.5) {
    phaseName = "Серп, що росте";
    emoji = "🌒";
    advice = "Ідеальний час для старту та руху вперед. Дійте.";
  } else if (phaseAngle < 112.5) {
    phaseName = "Перша чверть";
    emoji = "🌓";
    advice = "Долайте перешкоди. Прийшов час рішень і дій.";
  } else if (phaseAngle < 157.5) {
    phaseName = "Прибуваючий горбатий Місяць";
    emoji = "🌔";
    advice = "Тонка настройка та вдосконалення. Зосередьтесь на деталях.";
  } else if (phaseAngle < 202.5) {
    phaseName = "Повний Місяць";
    emoji = "🌕";
    advice = "Кульмінація та завершення. Відпустіть те, що більше не служить.";
  } else if (phaseAngle < 247.5) {
    phaseName = "Спадаючий горбатий Місяць";
    emoji = "🌖";
    advice = "Час подяки та рефлексії. Поділіться мудрістю.";
  } else if (phaseAngle < 292.5) {
    phaseName = "Остання чверть";
    emoji = "🌗";
    advice = "Відпустіть та очистіть. Звільніть простір для нового.";
  } else {
    phaseName = "Серп, що спадає";
    emoji = "🌘";
    advice = "Час відпочинку та підготовки до нового циклу.";
  }

  // Next full and new moon (approximate)
  const daysToFull = ((0.5 - ((phase + 1) % 1)) * synodicMonth + synodicMonth) % synodicMonth;
  const daysToNew = ((1 - ((phase + 1) % 1)) * synodicMonth + synodicMonth) % synodicMonth;

  const fullDate = new Date(year, month - 1, day);
  fullDate.setDate(fullDate.getDate() + Math.round(daysToFull));
  const newDate = new Date(year, month - 1, day);
  newDate.setDate(newDate.getDate() + Math.round(daysToNew));

  const UA_MONTHS = [
    "січня","лютого","березня","квітня","травня","червня",
    "липня","серпня","вересня","жовтня","листопада","грудня",
  ];

  const fmt = (d: Date) => `${d.getDate()} ${UA_MONTHS[d.getMonth()]}`;

  void moonLongitudeFull; // used in calculations

  return {
    phase: phaseName,
    phaseAngle,
    illumination,
    emoji,
    advice,
    nextFull: fmt(fullDate),
    nextNew: fmt(newDate),
  };
}

function MoonVisual({ illumination, phaseAngle }: { illumination: number; phaseAngle: number }) {
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
        {/* Dark circle */}
        <circle cx="60" cy="60" r="52" fill="#2D2218" />
        {/* Illuminated part */}
        <clipPath id="moonClip">
          <circle cx="60" cy="60" r="52" />
        </clipPath>
        <g clipPath="url(#moonClip)">
          <circle cx="60" cy="60" r="52" fill={`url(#${gradientId})`} />
          {/* Shadow ellipse */}
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
        {/* Rim */}
        <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(196,169,122,0.3)" strokeWidth="0.5" />
      </svg>
      <div className="text-center">
        <p className="text-4xl text-[#B8883A] mb-1" style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}>
          {illumination}%
        </p>
        <p className="text-sm text-[#7A6A58]">освітлення</p>
      </div>
    </div>
  );
}

export default function MoonPhasePage() {
  const today = new Date();
  const [form, setForm] = useState({
    year: today.getFullYear().toString(),
    month: (today.getMonth() + 1).toString(),
    day: today.getDate().toString(),
  });
  const [result, setResult] = useState<MoonData | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = calcMoonPhase(parseInt(form.year), parseInt(form.month), parseInt(form.day));
    setResult(data);
  };

  // Auto-calculate for today on first render
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
            <span className="tag mb-6 inline-block">Місячний</span>
            <h1
              className="text-[clamp(2.5rem,5vw,4.5rem)] text-[#1C1512] mb-6 leading-[1.06]"
              style={{ fontFamily: "var(--font-cormorant)", fontWeight: 400 }}
            >
              Місячний гороскоп
            </h1>
            <p className="text-xl text-[#7A6A58] leading-relaxed">
              Дізнайтесь поточну фазу Місяця та її вплив на ваш день.
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
                Оберіть дату
              </h2>
              <form onSubmit={handleSubmit} className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-[#7A6A58] mb-2 tracking-wide">День</label>
                  <input
                    type="number" min={1} max={31}
                    value={form.day}
                    onChange={(e) => setForm({ ...form, day: e.target.value })}
                    className="input-luxury"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#7A6A58] mb-2 tracking-wide">Місяць</label>
                  <input
                    type="number" min={1} max={12}
                    value={form.month}
                    onChange={(e) => setForm({ ...form, month: e.target.value })}
                    className="input-luxury"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#7A6A58] mb-2 tracking-wide">Рік</label>
                  <input
                    type="number" min={1970} max={2050}
                    value={form.year}
                    onChange={(e) => setForm({ ...form, year: e.target.value })}
                    className="input-luxury"
                  />
                </div>
                <button type="submit" className="btn-primary col-span-3">
                  <ArrowRight size={16} />
                  Розрахувати
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
                  {result.phase}
                </h2>

                <MoonVisual illumination={result.illumination} phaseAngle={result.phaseAngle} />

                <div className="mt-8 p-6 bg-[rgba(196,169,122,0.06)] rounded-2xl border border-[rgba(196,169,122,0.15)]">
                  <p
                    className="text-xl text-[#5C4530] italic"
                    style={{ fontFamily: "var(--font-cormorant)" }}
                  >
                    "{result.advice}"
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="text-center p-4 rounded-xl bg-[rgba(196,169,122,0.06)]">
                    <p className="text-xs text-[#7A6A58] mb-1 tracking-wide uppercase">Повний місяць</p>
                    <p className="text-[#B8883A] font-medium" style={{ fontFamily: "var(--font-cormorant)", fontSize: "1.2rem" }}>
                      {result.nextFull}
                    </p>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-[rgba(196,169,122,0.06)]">
                    <p className="text-xs text-[#7A6A58] mb-1 tracking-wide uppercase">Новомісяцяч</p>
                    <p className="text-[#B8883A] font-medium" style={{ fontFamily: "var(--font-cormorant)", fontSize: "1.2rem" }}>
                      {result.nextNew}
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
