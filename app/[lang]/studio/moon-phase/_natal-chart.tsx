"use client";

/**
 * Natal Chart + Transit Aspects block (Phase М8 + М9).
 *
 * Surfaces in the Moon Guide when the user has saved a full natal
 * profile (birth_date + time + lat + lon + tz). Shows:
 *   1. Natal planet table (Sun..Pluto + ASC + MC) with sign + house
 *      under whole-sign houses (simpler than Placidus, works at any lat)
 *   2. Active transit aspects matrix: every transiting Sun/Mercury/Venus/
 *      Mars/Jupiter/Saturn → every natal Sun/Moon/Mercury/Venus/Mars/
 *      Jupiter/Saturn/ASC/MC, filtered to tight per-planet orbs
 *   3. 12-house list with planets occupying each house
 *
 * The user can switch zodiac (tropical / sidereal Lahiri) — affects
 * sign + house labels only; aspect angles are zodiac-independent.
 */

import { useMemo } from "react";
import { SIGN_GLYPHS, SIGNS_UA, SIGNS_EN, calcPlanetDeg, dateToJD } from "@/lib/astro/calculations";
import {
  computeNatalSnapshot, detectTransitAspects, buildWholeSignHouses,
  whichWholeSignHouse, signOf,
  type AspectKey, type NatalSnapshot, type TransitPoint, type NatalPoint, type ZodiacMode,
} from "@/lib/astro/natal-snapshot";
import type { Profile } from "@/hooks/useProfile";

const SIGNS_RU = [
  "Овен", "Телец", "Близнецы", "Рак", "Лев", "Дева",
  "Весы", "Скорпион", "Стрелец", "Козерог", "Водолей", "Рыбы",
];

const ASPECT_GLYPH: Record<AspectKey, string> = {
  conjunction: "☌", sextile: "⚹", square: "□", trine: "△", opposition: "☍",
};

const ASPECT_COLOR: Record<AspectKey, string> = {
  conjunction: "#B8883A",
  trine:       "#3F6A35",
  sextile:     "#5A8A65",
  square:      "#9A6E28",
  opposition:  "#7A3E18",
};

const PLANET_GLYPH: Record<string, string> = {
  Sun: "☉", Moon: "☽", Mercury: "☿", Venus: "♀", Mars: "♂",
  Jupiter: "♃", Saturn: "♄", Uranus: "♅", Neptune: "♆", Pluto: "♇",
  ASC: "ASC", MC: "MC",
};

const T = {
  uk: {
    heading_natal:   "Твоя натальна карта",
    heading_trans:   "Транзитні аспекти зараз",
    heading_houses:  "Будинки (whole-sign)",
    natal_required:  "Збережи натальні дані (дата, час, місце народження) у кабінеті — побачиш повну карту з ASC, MC, будинками й транзитними аспектами.",
    sign_label:      "знак",
    house_label:     "будинок",
    in_sign:         "у",
    no_aspects:      "Зараз немає сильних транзитних аспектів до твоїх ядрових точок. Спокійний день.",
    natal_caption:   "Whole-sign будинки. Placidus буде в окремому інструменті Натальної карти.",
    zodiac_label:    "Зодіак",
    tropical:        "Тропічний",
    sidereal:        "Сидеричний (Lahiri)",
    house_n:         (n: number) => `${n}-й`,
  },
  ru: {
    heading_natal:   "Твоя натальная карта",
    heading_trans:   "Транзитные аспекты сейчас",
    heading_houses:  "Дома (whole-sign)",
    natal_required:  "Сохрани натальные данные (дата, время, место рождения) в кабинете — увидишь полную карту с ASC, MC, домами и транзитными аспектами.",
    sign_label:      "знак",
    house_label:     "дом",
    in_sign:         "в",
    no_aspects:      "Сейчас нет сильных транзитных аспектов к твоим ядровым точкам. Спокойный день.",
    natal_caption:   "Whole-sign дома. Placidus будет в отдельном инструменте Натальной карты.",
    zodiac_label:    "Зодиак",
    tropical:        "Тропический",
    sidereal:        "Сидерический (Lahiri)",
    house_n:         (n: number) => `${n}-й`,
  },
  en: {
    heading_natal:   "Your natal chart",
    heading_trans:   "Transit aspects right now",
    heading_houses:  "Houses (whole-sign)",
    natal_required:  "Save your birth data (date, time, place) in the cabinet — you'll see the full chart with ASC, MC, houses and transit aspects.",
    sign_label:      "sign",
    house_label:     "house",
    in_sign:         "in",
    no_aspects:      "No strong transit aspects to your core points right now. A quiet day.",
    natal_caption:   "Whole-sign houses. Placidus comes with the dedicated Natal Chart tool.",
    zodiac_label:    "Zodiac",
    tropical:        "Tropical",
    sidereal:        "Sidereal (Lahiri)",
    house_n:         (n: number) => `${n}${n === 1 ? "st" : n === 2 ? "nd" : n === 3 ? "rd" : "th"}`,
  },
};

const PLANET_LABEL_RU: Record<string, string> = {
  Sun: "Солнце", Moon: "Луна", Mercury: "Меркурий", Venus: "Венера",
  Mars: "Марс", Jupiter: "Юпитер", Saturn: "Сатурн", Uranus: "Уран",
  Neptune: "Нептун", Pluto: "Плутон", ASC: "АСЦ", MC: "МС",
};
const PLANET_LABEL_UK: Record<string, string> = {
  Sun: "Сонце", Moon: "Місяць", Mercury: "Меркурій", Venus: "Венера",
  Mars: "Марс", Jupiter: "Юпітер", Saturn: "Сатурн", Uranus: "Уран",
  Neptune: "Нептун", Pluto: "Плутон", ASC: "АСЦ", MC: "МС",
};
const PLANET_LABEL_EN: Record<string, string> = {
  Sun: "Sun", Moon: "Moon", Mercury: "Mercury", Venus: "Venus",
  Mars: "Mars", Jupiter: "Jupiter", Saturn: "Saturn", Uranus: "Uranus",
  Neptune: "Neptune", Pluto: "Pluto", ASC: "ASC", MC: "MC",
};

function planetLabel(name: string, lang: "uk" | "ru" | "en"): string {
  return (lang === "ru" ? PLANET_LABEL_RU : lang === "en" ? PLANET_LABEL_EN : PLANET_LABEL_UK)[name] ?? name;
}

interface Props {
  language: string;
  profile: Profile | null;
  zodiac: ZodiacMode;
  onZodiacChange: (z: ZodiacMode) => void;
}

export function NatalChartBlock({ language, profile, zodiac, onZodiacChange }: Props) {
  const lang: "uk" | "ru" | "en" = language === "ru" ? "ru" : language === "en" ? "en" : "uk";
  const t = T[lang];
  const signNames = lang === "ru" ? SIGNS_RU : lang === "en" ? SIGNS_EN : SIGNS_UA;

  // Build snapshots once per profile (memoised at the React level — small
  // payload, but Kepler iteration × 10 is a few μs not worth re-running on
  // every render of the parent page).
  const natal = useMemo<NatalSnapshot | null>(() => {
    if (!profile) return null;
    return computeNatalSnapshot({
      birth_date: profile.birth_date ?? "",
      birth_time: profile.birth_time ?? "",
      birth_lat:  profile.birth_lat ?? 0,
      birth_lon:  profile.birth_lon ?? 0,
      birth_tz:   profile.birth_tz ?? "",
    });
  }, [profile]);

  // Transit positions are recomputed each render — they're meant to be live.
  const transit = useMemo(() => {
    const now = new Date();
    const tzOffset = -now.getTimezoneOffset() / 60;
    const jd = dateToJD(
      now.getFullYear(), now.getMonth() + 1, now.getDate(),
      now.getHours(), now.getMinutes(), tzOffset,
    );
    return {
      jd,
      Sun:     calcPlanetDeg(0, jd),
      Moon:    calcPlanetDeg(1, jd),
      Mercury: calcPlanetDeg(2, jd),
      Venus:   calcPlanetDeg(3, jd),
      Mars:    calcPlanetDeg(4, jd),
      Jupiter: calcPlanetDeg(5, jd),
      Saturn:  calcPlanetDeg(6, jd),
    } as Record<TransitPoint, number> & { jd: number };
  }, []);

  if (!profile?.birth_date || !natal) {
    return (
      <div className="card-luxury">
        <h3 className="text-xl text-[#1C1512] mb-2" style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}>
          {t.heading_natal}
        </h3>
        <p className="text-sm text-[#7A6A58] leading-relaxed">{t.natal_required}</p>
      </div>
    );
  }

  const houses = buildWholeSignHouses(natal.asc);
  const natalPoints: Partial<Record<NatalPoint, number>> = {
    Sun: natal.sun, Moon: natal.moon, Mercury: natal.mercury, Venus: natal.venus,
    Mars: natal.mars, Jupiter: natal.jupiter, Saturn: natal.saturn,
    ASC: natal.asc, MC: natal.mc,
  };
  const transitPoints: Record<TransitPoint, number> = {
    Sun: transit.Sun, Moon: transit.Moon, Mercury: transit.Mercury,
    Venus: transit.Venus, Mars: transit.Mars, Jupiter: transit.Jupiter, Saturn: transit.Saturn,
  };
  const aspects = detectTransitAspects(transitPoints, natalPoints);

  const ZODIAC_HELP_JD = natal.jd; // sign-of for natal points uses natal jd
  function lonInfo(lon: number, jd: number): { signIdx: number; deg: number; min: number } {
    const adjustedSign = signOf(lon, jd, zodiac);
    const inSign = ((lon - 30 * adjustedSign) % 360 + 360) % 360;
    // ^ when sidereal, lon is still tropical; sign index already accounts for
    // ayanamsa, so we recompute the degrees inside the (sidereal) sign:
    const inSignSidereal = zodiac === "sidereal"
      ? (() => {
          const shifted = (lon - (jd - 2415020.5) / 36525 * 1.396042 - 22.46);
          const norm = ((shifted % 360) + 360) % 360;
          return norm - adjustedSign * 30;
        })()
      : inSign;
    const finalInSign = zodiac === "sidereal" ? inSignSidereal : inSign;
    const deg = Math.floor(finalInSign);
    const min = Math.floor((finalInSign - deg) * 60);
    return { signIdx: adjustedSign, deg, min };
  }

  // ── Render ───────────────────────────────────────────────────────────────
  const natalRows: Array<{ name: string; lon: number }> = [
    { name: "Sun", lon: natal.sun }, { name: "Moon", lon: natal.moon },
    { name: "Mercury", lon: natal.mercury }, { name: "Venus", lon: natal.venus },
    { name: "Mars", lon: natal.mars }, { name: "Jupiter", lon: natal.jupiter },
    { name: "Saturn", lon: natal.saturn }, { name: "Uranus", lon: natal.uranus },
    { name: "Neptune", lon: natal.neptune }, { name: "Pluto", lon: natal.pluto },
    { name: "ASC", lon: natal.asc }, { name: "MC", lon: natal.mc },
  ];

  return (
    <div className="space-y-5">
      {/* ── Zodiac toggle ── */}
      <div className="card-luxury">
        <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
          <h3 className="text-xl text-[#1C1512]" style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}>
            {t.heading_natal}
          </h3>
          <div role="tablist" aria-label={t.zodiac_label}
               className="flex p-1 rounded-2xl bg-[rgba(196,169,122,0.08)] border border-[rgba(196,169,122,0.2)]">
            {(["tropical", "sidereal"] as ZodiacMode[]).map(z => {
              const active = zodiac === z;
              return (
                <button key={z} type="button" role="tab" aria-selected={active}
                        onClick={() => onZodiacChange(z)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                          active ? "bg-white text-[#1C1512] shadow-sm" : "text-[#7A6A58] hover:text-[#5C4530]"
                        }`}>
                  {z === "tropical" ? t.tropical : t.sidereal}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Natal planet table ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {natalRows.map(({ name, lon }) => {
            const info = lonInfo(lon, ZODIAC_HELP_JD);
            const house = name === "ASC" || name === "MC"
              ? null
              : whichWholeSignHouse(applyZodiacForHouse(lon, ZODIAC_HELP_JD, zodiac), houses);
            return (
              <div key={name} className="flex items-center justify-between gap-3 px-3 py-1.5 rounded-lg bg-[rgba(196,169,122,0.05)] border border-[rgba(196,169,122,0.12)] text-sm">
                <span className="flex items-center gap-2 text-[#5C4530]">
                  <span className="w-6 text-center text-[#C4A97A] text-base">{PLANET_GLYPH[name]}</span>
                  <span className="font-medium" style={{ fontFamily: "var(--font-cormorant)" }}>{planetLabel(name, lang)}</span>
                </span>
                <span className="text-xs text-[#7A6A58] flex items-center gap-1.5">
                  {SIGN_GLYPHS[info.signIdx]}
                  <span className="text-[#1C1512]">{signNames[info.signIdx]}</span>
                  <span className="text-[#9A8A78] tabular-nums">{info.deg}°{info.min.toString().padStart(2, "0")}′</span>
                  {house != null && (
                    <span className="ml-1 text-[#B8883A] text-[10px]">· {t.house_n(house)}</span>
                  )}
                </span>
              </div>
            );
          })}
        </div>
        <p className="text-[10px] text-[#9A8A78] italic mt-3 text-center">{t.natal_caption}</p>
      </div>

      {/* ── Transit aspects ── */}
      <div className="card-luxury">
        <h3 className="text-xl text-[#1C1512] mb-3" style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}>
          {t.heading_trans}
        </h3>
        {aspects.length === 0 ? (
          <p className="text-sm text-[#7A6A58] italic leading-relaxed">{t.no_aspects}</p>
        ) : (
          <ul className="space-y-1.5">
            {aspects.map((a, i) => (
              <li key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[rgba(196,169,122,0.05)] border border-[rgba(196,169,122,0.12)] text-sm">
                <span className="text-[#5C4530] flex-1 flex items-center gap-1.5">
                  <span className="text-base text-[#C4A97A]">{PLANET_GLYPH[a.transit]}</span>
                  <span style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}>
                    {planetLabel(a.transit, lang)}
                  </span>
                </span>
                <span style={{ color: ASPECT_COLOR[a.kind] }} className="text-base">{ASPECT_GLYPH[a.kind]}</span>
                <span className="text-[#5C4530] flex-1 text-right flex items-center justify-end gap-1.5">
                  <span style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}>
                    {planetLabel(a.natal, lang)}
                  </span>
                  <span className="text-base text-[#C4A97A]">{PLANET_GLYPH[a.natal]}</span>
                </span>
                <span className="text-[10px] text-[#9A8A78] tabular-nums ml-2 w-12 text-right">
                  ±{Math.abs(a.orb).toFixed(2)}°
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ── Houses list ── */}
      <div className="card-luxury">
        <h3 className="text-xl text-[#1C1512] mb-3" style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}>
          {t.heading_houses}
        </h3>
        <div className="grid grid-cols-2 gap-1.5">
          {houses.cusps.map((signIdx, i) => {
            // Sign index from buildWholeSignHouses is already in tropical
            // because ASC was tropical. For sidereal display we apply the
            // shift here only to the label.
            const displayIdx = zodiac === "sidereal"
              ? signOf(signIdx * 30, transit.jd, "sidereal")
              : signIdx;
            // Which natal planets live in this house?
            const occupants = natalRows
              .filter(r => r.name !== "ASC" && r.name !== "MC")
              .filter(r => {
                const h = whichWholeSignHouse(applyZodiacForHouse(r.lon, ZODIAC_HELP_JD, zodiac), houses);
                return h === i + 1;
              })
              .map(r => PLANET_GLYPH[r.name]);
            return (
              <div key={i} className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg bg-[rgba(196,169,122,0.05)] border border-[rgba(196,169,122,0.12)] text-sm">
                <span className="text-[#9A8A78] w-8 text-xs">{t.house_n(i + 1)}</span>
                <span className="text-[#5C4530] flex-1 flex items-center gap-1.5">
                  {SIGN_GLYPHS[displayIdx]} <span style={{ fontFamily: "var(--font-cormorant)" }}>{signNames[displayIdx]}</span>
                </span>
                <span className="text-[#B8883A] text-sm">{occupants.join(" ")}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/** Apply zodiac transform for house lookup. The natal planet lon stays
 *  tropical; we map it to the same zodiac space the houses are computed
 *  in (here: tropical, with whole-sign defaulting to tropical sign idx). */
function applyZodiacForHouse(lon: number, jd: number, mode: ZodiacMode): number {
  // We keep houses in tropical because ASC is tropical. So the planet
  // lon stays tropical too — the function is here to mark the boundary
  // where future sidereal-house schemes would diverge.
  void jd; void mode;
  return lon;
}
