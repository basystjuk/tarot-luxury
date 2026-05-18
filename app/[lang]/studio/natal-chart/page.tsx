"use client";

import { useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import AnimatedSection from "@/components/ui/AnimatedSection";
import GoldDivider from "@/components/ui/GoldDivider";
import { useLanguage } from "@/hooks/useLanguage";
import {
  calcNatalChart,
  formatDegree,
  PLANET_NAMES_UA,
  PLANET_GLYPHS,
  SIGN_GLYPHS,
  SIGNS_UA,
  SIGNS_EN,
  degToSign,
  type NatalChartData,
} from "@/lib/astro/calculations";

const SIGNS_RU = [
  "Овен", "Телец", "Близнецы", "Рак",
  "Лев", "Дева", "Весы", "Скорпион",
  "Стрелец", "Козерог", "Водолей", "Рыбы",
];

const PLANET_NAMES_RU = ["Солнце", "Луна", "Меркурий", "Венера", "Марс", "Юпитер", "Сатурн", "Уран", "Нептун", "Плутон"];
const PLANET_NAMES_EN = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"];

const PLANET_KEYS: (keyof NatalChartData)[] = [
  "sun", "moon", "mercury", "venus", "mars",
  "jupiter", "saturn", "uranus", "neptune", "pluto",
];

const CITIES: Record<string, { lat: number; lon: number; tz: number }> = {
  "Київ": { lat: 50.45, lon: 30.52, tz: 2 },
  "Харків": { lat: 49.99, lon: 36.23, tz: 2 },
  "Одеса": { lat: 46.48, lon: 30.73, tz: 2 },
  "Дніпро": { lat: 48.46, lon: 35.05, tz: 2 },
  "Львів": { lat: 49.84, lon: 24.03, tz: 2 },
  "Запоріжжя": { lat: 47.82, lon: 35.19, tz: 2 },
  "Вінниця": { lat: 49.23, lon: 28.47, tz: 2 },
  "Чернівці": { lat: 48.29, lon: 25.94, tz: 2 },
  "Варшава": { lat: 52.23, lon: 21.01, tz: 1 },
  "Прага": { lat: 50.08, lon: 14.42, tz: 1 },
  "Берлін": { lat: 52.52, lon: 13.41, tz: 1 },
  "Відень": { lat: 48.21, lon: 16.37, tz: 1 },
};

function SignWheel({ chart }: { chart: NatalChartData }) {
  const cx = 120, cy = 120, r = 90, rp = 60;
  const toXY = (deg: number, radius: number) => {
    const a = (deg - 90) * (Math.PI / 180);
    return { x: cx + radius * Math.cos(a), y: cy + radius * Math.sin(a) };
  };

  return (
    <svg viewBox="0 0 240 240" className="w-full max-w-[280px] mx-auto">
      {/* Outer ring */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(196,169,122,0.3)" strokeWidth="1" />
      <circle cx={cx} cy={cy} r={rp} fill="none" stroke="rgba(196,169,122,0.15)" strokeWidth="0.5" />

      {/* Sign divisions */}
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i * 30 - 90) * (Math.PI / 180);
        const inner = toXY(i * 30, rp + 2);
        const outer = toXY(i * 30, r - 2);
        const label = toXY(i * 30 + 15, (r + rp) / 2 + 2);
        return (
          <g key={i}>
            <line x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y}
              stroke="rgba(196,169,122,0.25)" strokeWidth="0.5" />
            <text x={label.x} y={label.y} textAnchor="middle" dominantBaseline="middle"
              fontSize="7" fill="rgba(196,169,122,0.8)" style={{ fontFamily: "var(--font-cormorant)" }}>
              {SIGN_GLYPHS[i]}
            </text>
          </g>
        );
      })}

      {/* ASC line */}
      {(() => {
        const inner2 = toXY(chart.asc, rp);
        const outer2 = toXY(chart.asc, r);
        return <line x1={inner2.x} y1={inner2.y} x2={outer2.x} y2={outer2.y}
          stroke="#D4A853" strokeWidth="1.5" />;
      })()}

      {/* Planets */}
      {PLANET_KEYS.slice(0, 7).map((key, i) => {
        const deg = chart[key] as number;
        const pos = toXY(deg, rp - 15);
        return (
          <g key={key}>
            <circle cx={pos.x} cy={pos.y} r="8" fill="rgba(253,251,247,0.9)" stroke="rgba(196,169,122,0.4)" strokeWidth="0.5" />
            <text x={pos.x} y={pos.y} textAnchor="middle" dominantBaseline="middle"
              fontSize="7" fill="#B8883A" style={{ fontFamily: "var(--font-cormorant)" }}>
              {PLANET_GLYPHS[i]}
            </text>
          </g>
        );
      })}

      {/* Center */}
      <circle cx={cx} cy={cy} r="10" fill="rgba(212,168,83,0.1)" stroke="rgba(196,169,122,0.4)" strokeWidth="0.5" />
    </svg>
  );
}

export default function NatalChartPage() {
  const { language } = useLanguage();
  const isRu = language === "ru";
  const isEn = language === "en";

  const signs = isRu ? SIGNS_RU : isEn ? SIGNS_EN : SIGNS_UA;
  const planetNames = isRu ? PLANET_NAMES_RU : isEn ? PLANET_NAMES_EN : PLANET_NAMES_UA;

  const degToSignLocalized = (deg: number) => signs[degToSign(deg)];

  const [form, setForm] = useState({
    year: "", month: "", day: "",
    hour: "12", minute: "0",
    city: "Київ",
  });
  const [result, setResult] = useState<NatalChartData | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      const city = CITIES[form.city] || CITIES["Київ"];
      const chart = calcNatalChart(
        parseInt(form.year), parseInt(form.month), parseInt(form.day),
        parseInt(form.hour), parseInt(form.minute), city.tz,
        city.lat, city.lon
      );
      setResult(chart);
      setLoading(false);
    }, 500);
  };

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
              {isRu ? "Натальная карта" : isEn ? "Natal Chart" : "Натальна карта"}
            </h1>
            <p className="text-xl text-[#7A6A58] leading-relaxed">
              {isRu
                ? "Рассчитайте положение планет на момент вашего рождения."
                : isEn
                ? "Calculate the positions of the planets at the moment of your birth."
                : "Розрахуйте положення планет на момент вашого народження."}
            </p>
          </AnimatedSection>
        </div>
      </section>

      <GoldDivider />

      <section className="section-padding bg-[#FDFBF7]">
        <div className="max-w-4xl mx-auto px-6">
          <AnimatedSection>
            <div className="card-luxury mb-10">
              <h2
                className="text-2xl text-[#1C1512] mb-8"
                style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}
              >
                {isRu ? "Введите данные рождения" : isEn ? "Enter birth data" : "Введіть дані народження"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-[#7A6A58] mb-2 tracking-wide">
                      {isRu ? "День" : isEn ? "Day" : "День"}
                    </label>
                    <input
                      type="number" min={1} max={31} required
                      placeholder="14"
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
                      type="number" min={1} max={12} required
                      placeholder="3"
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
                      type="number" min={1900} max={2025} required
                      placeholder="1990"
                      value={form.year}
                      onChange={(e) => setForm({ ...form, year: e.target.value })}
                      className="input-luxury"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-[#7A6A58] mb-2 tracking-wide">
                      {isRu ? "Час (0-23)" : isEn ? "Hour (0-23)" : "Година (0-23)"}
                    </label>
                    <input
                      type="number" min={0} max={23}
                      value={form.hour}
                      onChange={(e) => setForm({ ...form, hour: e.target.value })}
                      className="input-luxury"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#7A6A58] mb-2 tracking-wide">
                      {isRu ? "Минута" : isEn ? "Minute" : "Хвилина"}
                    </label>
                    <input
                      type="number" min={0} max={59}
                      value={form.minute}
                      onChange={(e) => setForm({ ...form, minute: e.target.value })}
                      className="input-luxury"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-[#7A6A58] mb-2 tracking-wide">
                    {isRu ? "Город рождения" : isEn ? "Birth city" : "Місто народження"}
                  </label>
                  <select
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="input-luxury"
                  >
                    {Object.keys(CITIES).map((city) => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>

                <button type="submit" className="btn-primary w-full" disabled={loading}>
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
                  {loading
                    ? (isRu ? "Рассчитываем..." : isEn ? "Calculating..." : "Розраховуємо...")
                    : (isRu ? "Рассчитать натальную карту" : isEn ? "Calculate Natal Chart" : "Розрахувати натальну карту")}
                </button>
              </form>
            </div>
          </AnimatedSection>

          {result && (
            <AnimatedSection delay={0.1}>
              <div className="space-y-6">
                {/* Wheel + Key placements */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="card-luxury flex items-center justify-center">
                    <SignWheel chart={result} />
                  </div>

                  <div className="card-luxury">
                    <h3
                      className="text-2xl text-[#1C1512] mb-6"
                      style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}
                    >
                      {isRu ? "Ключевые позиции" : isEn ? "Key Placements" : "Ключові позиції"}
                    </h3>
                    <div className="space-y-4">
                      {[
                        { label: isRu ? "Солнце ☉" : isEn ? "Sun ☉" : "Сонце ☉", value: degToSignLocalized(result.sun), deg: result.sun },
                        { label: isRu ? "Луна ☽" : isEn ? "Moon ☽" : "Місяць ☽", value: degToSignLocalized(result.moon), deg: result.moon },
                        { label: isRu ? "Асцендент" : isEn ? "Ascendant" : "Асцендент", value: degToSignLocalized(result.asc), deg: result.asc },
                        { label: isRu ? "МС (Зенит)" : isEn ? "MC (Midheaven)" : "МС (Зеніт)", value: degToSignLocalized(result.mc), deg: result.mc },
                      ].map((item) => (
                        <div key={item.label} className="flex justify-between items-center py-2 border-b border-[rgba(196,169,122,0.15)]">
                          <span className="text-sm text-[#7A6A58]">{item.label}</span>
                          <div className="text-right">
                            <p className="font-medium text-[#1C1512] text-sm">{item.value}</p>
                            <p className="text-xs text-[#C4A97A]">{formatDegree(item.deg)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Full planet table */}
                <div className="card-luxury">
                  <h3
                    className="text-2xl text-[#1C1512] mb-6"
                    style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}
                  >
                    {isRu ? "Положение планет" : isEn ? "Planet Positions" : "Положення планет"}
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-[rgba(196,169,122,0.2)]">
                          <th className="text-left py-2 text-[#7A6A58] font-normal pr-4">
                            {isRu ? "Планета" : isEn ? "Planet" : "Планета"}
                          </th>
                          <th className="text-left py-2 text-[#7A6A58] font-normal pr-4">
                            {isRu ? "Знак" : isEn ? "Sign" : "Знак"}
                          </th>
                          <th className="text-left py-2 text-[#7A6A58] font-normal">
                            {isRu ? "Градус" : isEn ? "Degree" : "Градус"}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {PLANET_KEYS.map((key, i) => {
                          const deg = result[key] as number;
                          const signIdx = degToSign(deg);
                          return (
                            <tr key={key} className="border-b border-[rgba(196,169,122,0.08)] hover:bg-[rgba(196,169,122,0.04)]">
                              <td className="py-2.5 pr-4">
                                <span className="text-[#B8883A] mr-2">{PLANET_GLYPHS[i]}</span>
                                <span className="text-[#1C1512]">{planetNames[i]}</span>
                              </td>
                              <td className="py-2.5 pr-4 text-[#5C4530]">
                                {SIGN_GLYPHS[signIdx]} {signs[signIdx]}
                              </td>
                              <td className="py-2.5 text-[#7A6A58] font-mono text-xs">
                                {formatDegree(deg)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Houses */}
                <div className="card-luxury">
                  <h3
                    className="text-2xl text-[#1C1512] mb-6"
                    style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}
                  >
                    {isRu ? "Куспиды домов (Плацидус)" : isEn ? "House Cusps (Placidus)" : "Куспіди будинків (Плацідус)"}
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {result.houses.map((cusp, i) => (
                      <div key={i} className="text-sm py-2 px-3 rounded-lg bg-[rgba(196,169,122,0.06)] border border-[rgba(196,169,122,0.12)]">
                        <span className="text-[#C4A97A] font-medium mr-2">{i + 1}</span>
                        <span className="text-[#5C4530]">{formatDegree(cusp)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <p className="text-xs text-[#7A6A58] text-center">
                  {isRu
                    ? "Расчёты используют упрощённые формулы Миуса (точность ±1°). Для детального анализа обратитесь к консультанту."
                    : isEn
                    ? "Calculations use simplified Meeus formulas (accuracy ±1°). For a detailed analysis, consult a professional."
                    : "Розрахунки використовують спрощені формули Міуса (точність ±1°). Для детального аналізу зверніться до консультанта."}
                </p>
              </div>
            </AnimatedSection>
          )}
        </div>
      </section>
    </>
  );
}
