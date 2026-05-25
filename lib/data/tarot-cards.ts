export interface TarotCard {
  index: number;   // 0–77
  nameEn: string;  // shown on card face
  suit: string;    // major | wands | cups | swords | pentacles
  image: string;   // /tarot/00.webp …
}

export const TAROT_CARDS: TarotCard[] = [
  // ── Major Arcana ──────────────────────────────────────────────────────────
  { index: 0,  nameEn: "The Fool",             suit: "major",     image: "/tarot/00.webp" },
  { index: 1,  nameEn: "The Magician",         suit: "major",     image: "/tarot/01.webp" },
  { index: 2,  nameEn: "The High Priestess",   suit: "major",     image: "/tarot/02.webp" },
  { index: 3,  nameEn: "The Empress",          suit: "major",     image: "/tarot/03.webp" },
  { index: 4,  nameEn: "The Emperor",          suit: "major",     image: "/tarot/04.webp" },
  { index: 5,  nameEn: "The Hierophant",       suit: "major",     image: "/tarot/05.webp" },
  { index: 6,  nameEn: "The Lovers",           suit: "major",     image: "/tarot/06.webp" },
  { index: 7,  nameEn: "The Chariot",          suit: "major",     image: "/tarot/07.webp" },
  { index: 8,  nameEn: "Strength",             suit: "major",     image: "/tarot/08.webp" },
  { index: 9,  nameEn: "The Hermit",           suit: "major",     image: "/tarot/09.webp" },
  { index: 10, nameEn: "Wheel of Fortune",     suit: "major",     image: "/tarot/10.webp" },
  { index: 11, nameEn: "Justice",              suit: "major",     image: "/tarot/11.webp" },
  { index: 12, nameEn: "The Hanged Man",       suit: "major",     image: "/tarot/12.webp" },
  { index: 13, nameEn: "Death",                suit: "major",     image: "/tarot/13.webp" },
  { index: 14, nameEn: "Temperance",           suit: "major",     image: "/tarot/14.webp" },
  { index: 15, nameEn: "The Devil",            suit: "major",     image: "/tarot/15.webp" },
  { index: 16, nameEn: "The Tower",            suit: "major",     image: "/tarot/16.webp" },
  { index: 17, nameEn: "The Star",             suit: "major",     image: "/tarot/17.webp" },
  { index: 18, nameEn: "The Moon",             suit: "major",     image: "/tarot/18.webp" },
  { index: 19, nameEn: "The Sun",              suit: "major",     image: "/tarot/19.webp" },
  { index: 20, nameEn: "Judgement",            suit: "major",     image: "/tarot/20.webp" },
  { index: 21, nameEn: "The World",            suit: "major",     image: "/tarot/21.webp" },
  // ── Wands ─────────────────────────────────────────────────────────────────
  { index: 22, nameEn: "Ace of Wands",         suit: "wands",     image: "/tarot/22.webp" },
  { index: 23, nameEn: "Two of Wands",         suit: "wands",     image: "/tarot/23.webp" },
  { index: 24, nameEn: "Three of Wands",       suit: "wands",     image: "/tarot/24.webp" },
  { index: 25, nameEn: "Four of Wands",        suit: "wands",     image: "/tarot/25.webp" },
  { index: 26, nameEn: "Five of Wands",        suit: "wands",     image: "/tarot/26.webp" },
  { index: 27, nameEn: "Six of Wands",         suit: "wands",     image: "/tarot/27.webp" },
  { index: 28, nameEn: "Seven of Wands",       suit: "wands",     image: "/tarot/28.webp" },
  { index: 29, nameEn: "Eight of Wands",       suit: "wands",     image: "/tarot/29.webp" },
  { index: 30, nameEn: "Nine of Wands",        suit: "wands",     image: "/tarot/30.webp" },
  { index: 31, nameEn: "Ten of Wands",         suit: "wands",     image: "/tarot/31.webp" },
  { index: 32, nameEn: "Page of Wands",        suit: "wands",     image: "/tarot/32.webp" },
  { index: 33, nameEn: "Knight of Wands",      suit: "wands",     image: "/tarot/33.webp" },
  { index: 34, nameEn: "Queen of Wands",       suit: "wands",     image: "/tarot/34.webp" },
  { index: 35, nameEn: "King of Wands",        suit: "wands",     image: "/tarot/35.webp" },
  // ── Cups ──────────────────────────────────────────────────────────────────
  { index: 36, nameEn: "Ace of Cups",          suit: "cups",      image: "/tarot/36.webp" },
  { index: 37, nameEn: "Two of Cups",          suit: "cups",      image: "/tarot/37.webp" },
  { index: 38, nameEn: "Three of Cups",        suit: "cups",      image: "/tarot/38.webp" },
  { index: 39, nameEn: "Four of Cups",         suit: "cups",      image: "/tarot/39.webp" },
  { index: 40, nameEn: "Five of Cups",         suit: "cups",      image: "/tarot/40.webp" },
  { index: 41, nameEn: "Six of Cups",          suit: "cups",      image: "/tarot/41.webp" },
  { index: 42, nameEn: "Seven of Cups",        suit: "cups",      image: "/tarot/42.webp" },
  { index: 43, nameEn: "Eight of Cups",        suit: "cups",      image: "/tarot/43.webp" },
  { index: 44, nameEn: "Nine of Cups",         suit: "cups",      image: "/tarot/44.webp" },
  { index: 45, nameEn: "Ten of Cups",          suit: "cups",      image: "/tarot/45.webp" },
  { index: 46, nameEn: "Page of Cups",         suit: "cups",      image: "/tarot/46.webp" },
  { index: 47, nameEn: "Knight of Cups",       suit: "cups",      image: "/tarot/47.webp" },
  { index: 48, nameEn: "Queen of Cups",        suit: "cups",      image: "/tarot/48.webp" },
  { index: 49, nameEn: "King of Cups",         suit: "cups",      image: "/tarot/49.webp" },
  // ── Swords ────────────────────────────────────────────────────────────────
  { index: 50, nameEn: "Ace of Swords",        suit: "swords",    image: "/tarot/50.webp" },
  { index: 51, nameEn: "Two of Swords",        suit: "swords",    image: "/tarot/51.webp" },
  { index: 52, nameEn: "Three of Swords",      suit: "swords",    image: "/tarot/52.webp" },
  { index: 53, nameEn: "Four of Swords",       suit: "swords",    image: "/tarot/53.webp" },
  { index: 54, nameEn: "Five of Swords",       suit: "swords",    image: "/tarot/54.webp" },
  { index: 55, nameEn: "Six of Swords",        suit: "swords",    image: "/tarot/55.webp" },
  { index: 56, nameEn: "Seven of Swords",      suit: "swords",    image: "/tarot/56.webp" },
  { index: 57, nameEn: "Eight of Swords",      suit: "swords",    image: "/tarot/57.webp" },
  { index: 58, nameEn: "Nine of Swords",       suit: "swords",    image: "/tarot/58.webp" },
  { index: 59, nameEn: "Ten of Swords",        suit: "swords",    image: "/tarot/59.webp" },
  { index: 60, nameEn: "Page of Swords",       suit: "swords",    image: "/tarot/60.webp" },
  { index: 61, nameEn: "Knight of Swords",     suit: "swords",    image: "/tarot/61.webp" },
  { index: 62, nameEn: "Queen of Swords",      suit: "swords",    image: "/tarot/62.webp" },
  { index: 63, nameEn: "King of Swords",       suit: "swords",    image: "/tarot/63.webp" },
  // ── Pentacles ─────────────────────────────────────────────────────────────
  { index: 64, nameEn: "Ace of Pentacles",     suit: "pentacles", image: "/tarot/64.webp" },
  { index: 65, nameEn: "Two of Pentacles",     suit: "pentacles", image: "/tarot/65.webp" },
  { index: 66, nameEn: "Three of Pentacles",   suit: "pentacles", image: "/tarot/66.webp" },
  { index: 67, nameEn: "Four of Pentacles",    suit: "pentacles", image: "/tarot/67.webp" },
  { index: 68, nameEn: "Five of Pentacles",    suit: "pentacles", image: "/tarot/68.webp" },
  { index: 69, nameEn: "Six of Pentacles",     suit: "pentacles", image: "/tarot/69.webp" },
  { index: 70, nameEn: "Seven of Pentacles",   suit: "pentacles", image: "/tarot/70.webp" },
  { index: 71, nameEn: "Eight of Pentacles",   suit: "pentacles", image: "/tarot/71.webp" },
  { index: 72, nameEn: "Nine of Pentacles",    suit: "pentacles", image: "/tarot/72.webp" },
  { index: 73, nameEn: "Ten of Pentacles",     suit: "pentacles", image: "/tarot/73.webp" },
  { index: 74, nameEn: "Page of Pentacles",    suit: "pentacles", image: "/tarot/74.webp" },
  { index: 75, nameEn: "Knight of Pentacles",  suit: "pentacles", image: "/tarot/75.webp" },
  { index: 76, nameEn: "Queen of Pentacles",   suit: "pentacles", image: "/tarot/76.webp" },
  { index: 77, nameEn: "King of Pentacles",    suit: "pentacles", image: "/tarot/77.webp" },
];

export function getZodiacSign(day: number, month: number): string {
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return "Aries";
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return "Taurus";
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return "Gemini";
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return "Cancer";
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return "Leo";
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return "Virgo";
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return "Libra";
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return "Scorpio";
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return "Sagittarius";
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return "Capricorn";
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return "Aquarius";
  return "Pisces";
}

/**
 * Cryptographically-secure card draw (Phase A overhaul).
 *
 * The previous implementation summed date+time components modulo 78, which
 * is deterministic and biased — two users drawing in the same second got
 * identical cards. Real tarot relies on the entropy of the shuffle itself,
 * so we use `crypto.getRandomValues` (Web Crypto API, available in browsers
 * and modern Node runtimes alike). Falls back to `Math.random` only if
 * `crypto` is somehow unavailable, with a console warning.
 *
 * Optionally returns a `reversed` flag. When `withReversed` is true, each
 * card has a 50% chance of being drawn upside-down — the second half of
 * the RWS tradition we were missing.
 */
export interface PickedCard {
  card: TarotCard;
  reversed: boolean;
}

function secureRandomInt(maxExclusive: number): number {
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    // Rejection sampling to avoid modulo bias.
    const limit = Math.floor(0x100000000 / maxExclusive) * maxExclusive;
    const buf = new Uint32Array(1);
    let n: number;
    do {
      crypto.getRandomValues(buf);
      n = buf[0];
    } while (n >= limit);
    return n % maxExclusive;
  }
  if (typeof console !== "undefined") {
    console.warn("crypto.getRandomValues unavailable — falling back to Math.random");
  }
  return Math.floor(Math.random() * maxExclusive);
}

/** Backwards-compatible single-card pick (upright always). */
export function pickCard(): TarotCard {
  return TAROT_CARDS[secureRandomInt(78)];
}

/**
 * Draw a card with optional reversed orientation.
 *
 * @param withReversed when true (default), 50% chance the card is reversed.
 */
export function drawCard(withReversed: boolean = true): PickedCard {
  return {
    card: TAROT_CARDS[secureRandomInt(78)],
    reversed: withReversed ? secureRandomInt(2) === 1 : false,
  };
}

/** Cryptographic Fisher-Yates shuffle of the deck — returns ordered indices. */
export function shuffleDeck(): number[] {
  const deck = Array.from({ length: 78 }, (_, i) => i);
  for (let i = 77; i > 0; i--) {
    const j = secureRandomInt(i + 1);
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

// ── Localised card names ──────────────────────────────────────────────────────

const MAJOR_NAMES: Record<number, { uk: string; ru: string }> = {
  0:  { uk: "Блазень",          ru: "Шут" },
  1:  { uk: "Маг",              ru: "Маг" },
  2:  { uk: "Верховна Жриця",   ru: "Верховная Жрица" },
  3:  { uk: "Імператриця",      ru: "Императрица" },
  4:  { uk: "Імператор",        ru: "Император" },
  5:  { uk: "Ієрофант",         ru: "Иерофант" },
  6:  { uk: "Закохані",         ru: "Влюблённые" },
  7:  { uk: "Колісниця",        ru: "Колесница" },
  8:  { uk: "Сила",             ru: "Сила" },
  9:  { uk: "Відлюдник",        ru: "Отшельник" },
  10: { uk: "Колесо Фортуни",   ru: "Колесо Фортуны" },
  11: { uk: "Справедливість",   ru: "Справедливость" },
  12: { uk: "Повішений",        ru: "Повешенный" },
  13: { uk: "Смерть",           ru: "Смерть" },
  14: { uk: "Поміркованість",   ru: "Умеренность" },
  15: { uk: "Диявол",           ru: "Дьявол" },
  16: { uk: "Вежа",             ru: "Башня" },
  17: { uk: "Зірка",            ru: "Звезда" },
  18: { uk: "Місяць",           ru: "Луна" },
  19: { uk: "Сонце",            ru: "Солнце" },
  20: { uk: "Суд",              ru: "Суд" },
  21: { uk: "Світ",             ru: "Мир" },
};

const RANK_NAMES: Record<string, { uk: string; ru: string }> = {
  Ace:    { uk: "Туз",       ru: "Туз" },
  Two:    { uk: "Двійка",    ru: "Двойка" },
  Three:  { uk: "Трійка",    ru: "Тройка" },
  Four:   { uk: "Четвірка",  ru: "Четвёрка" },
  Five:   { uk: "П'ятірка",  ru: "Пятёрка" },
  Six:    { uk: "Шістка",    ru: "Шестёрка" },
  Seven:  { uk: "Сімка",     ru: "Семёрка" },
  Eight:  { uk: "Вісімка",   ru: "Восьмёрка" },
  Nine:   { uk: "Дев'ятка",  ru: "Девятка" },
  Ten:    { uk: "Десятка",   ru: "Десятка" },
  Page:   { uk: "Паж",       ru: "Паж" },
  Knight: { uk: "Лицар",     ru: "Рыцарь" },
  Queen:  { uk: "Королева",  ru: "Королева" },
  King:   { uk: "Король",    ru: "Король" },
};

const SUIT_NAMES: Record<string, { uk: string; ru: string }> = {
  Wands:     { uk: "Жезлів",     ru: "Жезлов" },
  Cups:      { uk: "Кубків",     ru: "Кубков" },
  Swords:    { uk: "Мечів",      ru: "Мечей" },
  Pentacles: { uk: "Пентаклів",  ru: "Пентаклей" },
};

export function getCardName(card: TarotCard, lang: string): string {
  if (lang === "en") return card.nameEn;
  if (card.suit === "major") {
    const n = MAJOR_NAMES[card.index];
    return n ? (lang === "ru" ? n.ru : n.uk) : card.nameEn;
  }
  const [rank, suit] = card.nameEn.split(" of ");
  const r = RANK_NAMES[rank];
  const s = SUIT_NAMES[suit];
  if (!r || !s) return card.nameEn;
  return lang === "ru" ? `${r.ru} ${s.ru}` : `${r.uk} ${s.uk}`;
}
