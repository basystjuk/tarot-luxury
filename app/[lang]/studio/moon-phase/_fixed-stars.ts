/**
 * Major fixed stars — when the transiting Moon comes within ~1° of one of
 * these points, classical astrology gives the day a distinctive flavour.
 *
 * Longitudes are tropical, epoch J2000.0. Precession is ≈ 1° / 72 years —
 * we ignore it for a ~1° orb tolerance window over a few decades. The
 * "Royal Stars of Persia" (Aldebaran / Regulus / Antares / Fomalhaut)
 * are the headliners; the rest cover the most frequently cited stars in
 * lunar interpretation.
 *
 * Each star's `meaning` is one short line written for a curious reader,
 * NOT for an astrologer — no jargon, no astro-shorthand.
 */

export interface FixedStar {
  key: string;          // stable identifier (uk transliteration of the popular name)
  ecliptic: number;     // tropical longitude in degrees, J2000
  /** uk/ru/en label + meaning, surfaced in tooltip + AI prompt. */
  i18n: {
    uk: { name: string; meaning: string };
    ru: { name: string; meaning: string };
    en: { name: string; meaning: string };
  };
}

/** Sign-relative helper — keeps the table readable. 0 = Aries. */
function sign(signIdx: number, deg: number): number {
  return signIdx * 30 + deg;
}

export const FIXED_STARS: readonly FixedStar[] = [
  // ─── Royal Stars of Persia ────────────────────────────────────────────
  {
    key: "aldebaran",
    ecliptic: sign(2, 9.78), // 9°47' ♊ Gemini
    i18n: {
      uk: { name: "Альдебаран",  meaning: "Око Бика, страж Сходу. Сила витривалості та сміливості; чесний шлях винагороджується, чесолюбні спокуси — ні." },
      ru: { name: "Альдебаран", meaning: "Глаз Тельца, страж Востока. Сила выносливости и смелости; честный путь вознаграждается, нечестные искушения — нет." },
      en: { name: "Aldebaran",  meaning: "The Bull's Eye, guardian of the East. Endurance and courage; the honest path is rewarded, unjust ambition is not." },
    },
  },
  {
    key: "regulus",
    ecliptic: sign(4, 0.00), // 0°00' ♌ Leo (slowly precessing toward ♍ Virgo; using leadership star tradition)
    i18n: {
      uk: { name: "Регул",   meaning: "Серце Лева, страж Півночі. Лідерство, гідність, шляхетний шлях; падіння — лише через помсту." },
      ru: { name: "Регул",   meaning: "Сердце Льва, страж Севера. Лидерство, достоинство, благородный путь; падение — только через месть." },
      en: { name: "Regulus", meaning: "The Lion's Heart, guardian of the North. Leadership, dignity, the noble way; the only fall comes through vengeance." },
    },
  },
  {
    key: "antares",
    ecliptic: sign(8, 9.77), // 9°46' ♐ Sagittarius
    i18n: {
      uk: { name: "Антарес", meaning: "Серце Скорпіона, страж Заходу. Інтенсивність, пристрасть, безстрашшя перед темним; вимагає трансформації, не відступу." },
      ru: { name: "Антарес", meaning: "Сердце Скорпиона, страж Запада. Интенсивность, страсть, бесстрашие перед тёмным; требует трансформации, не отступления." },
      en: { name: "Antares", meaning: "The Scorpion's Heart, guardian of the West. Intensity, passion, fearlessness before the dark; demands transformation, not retreat." },
    },
  },
  {
    key: "fomalhaut",
    ecliptic: sign(10, 3.87), // 3°52' ♓ Pisces
    i18n: {
      uk: { name: "Фомальгаут", meaning: "Уста Південної Риби, страж Півдня. Поетична велич, духовний дар; вимагає чистоти намірів, інакше — самообман." },
      ru: { name: "Фомальгаут", meaning: "Уста Южной Рыбы, страж Юга. Поэтическое величие, духовный дар; требует чистоты намерений, иначе — самообман." },
      en: { name: "Fomalhaut",  meaning: "The mouth of the Southern Fish, guardian of the South. Poetic grandeur, a spiritual gift; demands pure intent, otherwise self-deception." },
    },
  },
  // ─── Other frequently cited stars ─────────────────────────────────────
  {
    key: "algol",
    ecliptic: sign(1, 26.17), // 26°10' ♉ Taurus — Medusa's head
    i18n: {
      uk: { name: "Алголь", meaning: "Голова Медузи. Найвідоміша «небезпечна» зірка: дикі емоції, втрата самовладання. Гнів попроси у тіла, не несе у світ." },
      ru: { name: "Алголь", meaning: "Голова Медузы. Самая известная «опасная» звезда: дикие эмоции, потеря самообладания. Гнев попроси у тела, не неси в мир." },
      en: { name: "Algol",  meaning: "The head of Medusa. The most notorious 'dangerous' star: wild emotions, loss of composure. Let the body process the anger — don't carry it outward." },
    },
  },
  {
    key: "spica",
    ecliptic: sign(6, 23.83), // 23°50' ♎ Libra — colos Virginis
    i18n: {
      uk: { name: "Спіка",  meaning: "Колос Діви. Дар, який зрів довго: успіх, плідність, благословення наукою чи мистецтвом. Один із найдобріших днів." },
      ru: { name: "Спика",  meaning: "Колос Девы. Дар, зревший долго: успех, плодородие, благословение наукой или искусством. Один из самых добрых дней." },
      en: { name: "Spica",  meaning: "The Virgin's ear of grain. A gift long ripened: success, fertility, the blessing of science or art. One of the kindest days." },
    },
  },
  {
    key: "sirius",
    ecliptic: sign(3, 14.13), // 14°08' ♋ Cancer
    i18n: {
      uk: { name: "Сіріус", meaning: "Альфа Великого Пса, найяскравіша зірка нічного неба. Слава, видимість, висока ціль; вимагає вірності собі під сильним зовнішнім світлом." },
      ru: { name: "Сириус", meaning: "Альфа Большого Пса, ярчайшая звезда ночного неба. Слава, видимость, высокая цель; требует верности себе под сильным внешним светом." },
      en: { name: "Sirius", meaning: "Alpha Canis Majoris, the brightest star in the night sky. Fame, visibility, a high aim; demands loyalty to oneself under bright external light." },
    },
  },
  {
    key: "pleiades",
    ecliptic: sign(1, 29.93), // 29°56' ♉ Taurus — Alcyone (brightest)
    i18n: {
      uk: { name: "Плеяди", meaning: "Сім сестер, шлюзи туги і пророчих сліз. День глибокого почуття, ясного бачення, плачу від краси; не для ділових рішень." },
      ru: { name: "Плеяды", meaning: "Семь сестёр, шлюзы тоски и пророческих слёз. День глубокого чувства, ясного видения, плача от красоты; не для деловых решений." },
      en: { name: "Pleiades", meaning: "The Seven Sisters — the gateway of longing and prophetic tears. A day of deep feeling, clear seeing, weeping from beauty; not for business decisions." },
    },
  },
];

/** Half-orb tolerance in degrees — Moon within ±1° of star counts as conjunction. */
export const FIXED_STAR_ORB_DEG = 1.0;

// ── Precession adjustment (Phase М5) ───────────────────────────────────────
// Fixed-star ecliptic longitudes drift due to the precession of the
// equinoxes at ≈ 50.290966″ / year. Our table holds J2000 values; without
// adjustment, by year 2100 every star is shifted ~1.4° from its true
// longitude — past our 1° conjunction orb. Below we apply a simple linear
// precession term, which is sufficient to ±1″ for any year inside the
// 1900-2100 working range.
const PRECESSION_DEG_PER_DAY = 50.290966 / 3600 / 365.25;

/** Adjust J2000 longitude for precession to a given Julian Day. */
function precessedLon(j2000Lon: number, jd: number): number {
  const lon = j2000Lon + (jd - 2451545.0) * PRECESSION_DEG_PER_DAY;
  return ((lon % 360) + 360) % 360;
}

/** Smallest absolute angular distance (deg) between two ecliptic longitudes. */
function angDist(a: number, b: number): number {
  let d = Math.abs(((a - b) % 360 + 360) % 360);
  if (d > 180) d = 360 - d;
  return d;
}

/** If the Moon at moonLon is within FIXED_STAR_ORB_DEG of any star (using
 *  precession-adjusted longitudes for the given JD), return the closest. */
export function findMoonStarConjunction(moonLon: number, jd: number = 2451545.0): { star: FixedStar; orb: number } | null {
  let best: { star: FixedStar; orb: number } | null = null;
  for (const star of FIXED_STARS) {
    const starLon = precessedLon(star.ecliptic, jd);
    const orb = angDist(moonLon, starLon);
    if (orb <= FIXED_STAR_ORB_DEG && (!best || orb < best.orb)) {
      best = { star, orb };
    }
  }
  return best;
}
