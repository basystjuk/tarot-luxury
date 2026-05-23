import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";

export const maxDuration = 30;

// Rate limit: 1 synthesis per IP per Kyiv calendar day
const ipMap = new Map<string, { day: string }>();

function getKyivDay(): string {
  return new Date().toLocaleDateString("uk-UA", { timeZone: "Europe/Kiev" });
}

function checkRateLimit(ip: string): boolean {
  const today = getKyivDay();
  const entry = ipMap.get(ip);
  if (!entry || entry.day !== today) {
    ipMap.set(ip, { day: today });
    return true;
  }
  return false;
}

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

// ── Request shape ──────────────────────────────────────────────────────────
// Backward-compatible: old fields stay required. New fields are optional so
// older clients keep working until Phase 3 ships the new UI.

interface PinnacleData  { number: number; startAge: number; endAge: number | null }
interface ChallengeData { number: number; startAge: number; endAge: number | null }
interface LetterData    { letter: string; value: number }
interface PlaneData     { physical: number; mental: number; emotional: number; intuitive: number; dominant: string }

interface SynthesisRequest {
  language: "uk" | "ru" | "en";
  name: string;
  birthYear: number;
  age: number;
  // Core 10 numbers
  lifePath: number;     lifePathKeyword: string;
  destiny: number;      destinyKeyword: string;
  soul: number;         soulKeyword: string;
  personality: number;  personalityKeyword: string;
  birthday: number;     birthdayKeyword: string;
  personalYear: number; personalYearKeyword: string;
  maturity: number;     maturityKeyword: string;
  balance: number;      balanceKeyword: string;
  karmicLessons: number[];
  hiddenPassion: number;
  hiddenPassionKeyword: string;
  // Phase 2 extensions (optional for backward compat)
  pinnacles?:  [PinnacleData, PinnacleData, PinnacleData, PinnacleData];
  challenges?: [ChallengeData, ChallengeData, ChallengeData, ChallengeData];
  cornerstone?: LetterData;
  capstone?:    LetterData;
  firstVowel?:  LetterData;
  planeOfExpression?: PlaneData;
  masterPhase?: { masterNumber: 11 | 22 | 33; baseNumber: 2 | 4 | 6; activationAge: number; currentlyActive: boolean } | null;
}

const SYSTEM: Record<string, string> = {
  uk: "Ти — нумеролог. Пишеш персональні нумерологічні портрети. Стиль: тепло, проникливо, конкретно. Шукай протиріччя та гармонії між числами. Звертайся напряму на 'ти'. Без загальних фраз. Без рекомендацій звертатись до спеціалістів. ВАЖЛИВО: відповідь має дві секції, розділені рядком ---. Перша секція (intro): рівно 2 короткі речення у форматі: \"{Ім'я}, ти прийшла/прийшов у цей світ як [архетип]. Сьогодні актуально: [3 ключові тези через кому].\" Друга секція (portrait): 6-8 речень живого нумерологічного портрета. Пиши виключно українською мовою — жодних ієрогліфів, латиниці або символів інших алфавітів.",
  ru: "Ты — нумеролог. Пишешь персональные нумерологические портреты. Стиль: тепло, проницательно, конкретно. Ищи противоречия и гармонии между числами. Обращайся напрямую на 'ты'. Без общих фраз. Без рекомендаций. ВАЖНО: ответ имеет две секции, разделённые строкой ---. Первая секция (intro): ровно 2 коротких предложения в формате: \"{Имя}, ты пришла/пришёл в этот мир как [архетип]. Сегодня актуально: [3 ключевые тезиса через запятую].\" Вторая секция (portrait): 6-8 предложений живого нумерологического портрета. Пиши исключительно на русском языке — никаких иероглифов, латиницы или символов других алфавитов.",
  en: "You are a numerologist. Write personalised numerological portraits. Style: warm, insightful, specific. Look for tensions and harmonies between the numbers. Address the person directly as 'you'. No generic phrases. No advice to seek professional help. IMPORTANT: your response has two sections separated by the line ---. First section (intro): exactly 2 short sentences in the format: \"{Name}, you came into this world as [archetype]. Today is the time for: [3 key themes, comma-separated].\" Second section (portrait): 6-8 sentences of a living numerological portrait. Write exclusively in English — no hieroglyphs, no characters from other scripts or alphabets.",
};

// ── Active-cycle pickers — find which pinnacle/challenge is active for current age
function activeCycle<T extends { startAge: number; endAge: number | null }>(arr: T[] | undefined, age: number): T | null {
  if (!arr) return null;
  return arr.find(c => age >= c.startAge && (c.endAge === null || age <= c.endAge)) ?? null;
}

function buildPrompt(d: SynthesisRequest): string {
  const { language: l, name, birthYear, age } = d;
  const karmicArr = d.karmicLessons;

  const karmic = karmicArr.length > 0
    ? karmicArr.join(", ")
    : (l === "ru" ? "нет — все вибрации 1–9 присутствуют" : l === "en" ? "none — all 1–9 vibrations present" : "немає — всі вібрації 1–9 присутні");

  const activePinnacle  = activeCycle(d.pinnacles,  age);
  const activeChallenge = activeCycle(d.challenges, age);

  // Build extended block only if Phase 2 data is present
  const ext: string[] = [];
  if (d.cornerstone || d.capstone || d.firstVowel) {
    const cornerLbl = l === "ru" ? "Краеугольный камень (первая буква имени)" : l === "en" ? "Cornerstone (first letter of first name)" : "Наріжний камінь (перша літера імені)";
    const capLbl    = l === "ru" ? "Венчающий камень (последняя буква имени)" : l === "en" ? "Capstone (last letter of first name)" : "Замковий камінь (остання літера імені)";
    const vowLbl    = l === "ru" ? "Первая гласная (первый эмоциональный отклик)" : l === "en" ? "First vowel (first emotional response)" : "Перша голосна (перша емоційна реакція)";
    if (d.cornerstone) ext.push(`- ${cornerLbl}: "${d.cornerstone.letter}" (${d.cornerstone.value})`);
    if (d.capstone)    ext.push(`- ${capLbl}: "${d.capstone.letter}" (${d.capstone.value})`);
    if (d.firstVowel)  ext.push(`- ${vowLbl}: "${d.firstVowel.letter}" (${d.firstVowel.value})`);
  }
  if (d.planeOfExpression) {
    const p = d.planeOfExpression;
    const lbl = l === "ru" ? "Плоскость выражения (тип души по буквам имени)" : l === "en" ? "Plane of Expression (soul type by name letters)" : "Площина вираження (тип душі за літерами імені)";
    ext.push(`- ${lbl}: physical=${p.physical}, mental=${p.mental}, emotional=${p.emotional}, intuitive=${p.intuitive} — dominant: ${p.dominant}`);
  }
  if (activePinnacle) {
    const lbl = l === "ru" ? "Активная Вершина" : l === "en" ? "Active Pinnacle" : "Активна Вершина";
    ext.push(`- ${lbl}: ${activePinnacle.number} (вік/age ${activePinnacle.startAge}–${activePinnacle.endAge ?? "∞"})`);
  }
  if (activeChallenge) {
    const lbl = l === "ru" ? "Активный Вызов" : l === "en" ? "Active Challenge" : "Активний Виклик";
    ext.push(`- ${lbl}: ${activeChallenge.number}`);
  }
  if (d.masterPhase) {
    const mp = d.masterPhase;
    const lbl = l === "ru" ? "Мастер-число" : l === "en" ? "Master number" : "Майстер-число";
    const stateRu = mp.currentlyActive ? "активировано" : `активируется в ${mp.activationAge} лет`;
    const stateEn = mp.currentlyActive ? "activated" : `activates at age ${mp.activationAge}`;
    const stateUk = mp.currentlyActive ? "активоване" : `активується у ${mp.activationAge} років`;
    const state = l === "ru" ? stateRu : l === "en" ? stateEn : stateUk;
    ext.push(`- ${lbl} ${mp.masterNumber}/${mp.baseNumber} — ${state}`);
  }
  const extBlock = ext.length > 0
    ? (l === "ru" ? "\n\nДополнительные числа:\n" : l === "en" ? "\n\nAdditional numbers:\n" : "\n\nДодаткові числа:\n") + ext.join("\n")
    : "";

  if (l === "ru") {
    return `Проанализируй нумерологический портрет человека по имени ${name} (год рождения: ${birthYear}, возраст: ${age} лет).

Числа:
- Жизненный путь: ${d.lifePath} (${d.lifePathKeyword})
- Судьба: ${d.destiny} (${d.destinyKeyword})
- Число Души: ${d.soul} (${d.soulKeyword})
- Личность: ${d.personality} (${d.personalityKeyword})
- День рождения: ${d.birthday} (${d.birthdayKeyword})
- Личный год: ${d.personalYear} (${d.personalYearKeyword})
- Число Зрелости: ${d.maturity} (${d.maturityKeyword}) — раскрывается после 35
- Число Баланса: ${d.balance} (${d.balanceKeyword}) — стратегия в кризисе
- Кармические уроки: ${karmic}
- Дар Стихии (Hidden Passion): ${d.hiddenPassion} (${d.hiddenPassionKeyword}) — самая частая цифра в имени, врождённый талант${extBlock}

Структура ответа (СТРОГО):
intro: 2 предложения в формате "${name}, ты пришла/пришёл в этот мир как [архетип]. Сегодня актуально: [3 тезиса через запятую]."
---
portrait: 6-8 предложений живого портрета. Учитывай возраст (${age}), активную Вершину и Вызов, мастер-числа. Обращайся на 'ты'. Пиши исключительно на русском — никаких иероглифов или других алфавитов.`;
  }

  if (l === "en") {
    return `Analyse the numerological portrait of ${name} (birth year: ${birthYear}, age: ${age}).

Numbers:
- Life Path: ${d.lifePath} (${d.lifePathKeyword})
- Destiny: ${d.destiny} (${d.destinyKeyword})
- Soul: ${d.soul} (${d.soulKeyword})
- Personality: ${d.personality} (${d.personalityKeyword})
- Birthday: ${d.birthday} (${d.birthdayKeyword})
- Personal Year: ${d.personalYear} (${d.personalYearKeyword})
- Maturity Number: ${d.maturity} (${d.maturityKeyword}) — awakens after 35
- Balance Number: ${d.balance} (${d.balanceKeyword}) — stress strategy
- Karmic Lessons: ${karmic}
- Gift of the Element (Hidden Passion): ${d.hiddenPassion} (${d.hiddenPassionKeyword}) — most frequent digit in the name, innate talent${extBlock}

Response structure (STRICT):
intro: 2 sentences in the format "${name}, you came into this world as [archetype]. Today is the time for: [3 themes, comma-separated]."
---
portrait: 6-8 sentences of a living portrait. Honour the age (${age}), the active Pinnacle and Challenge, master numbers. Address as 'you'. Write exclusively in English — no hieroglyphs or other scripts.`;
  }

  return `Проаналізуй нумерологічний портрет людини на ім'я ${name} (рік народження: ${birthYear}, вік: ${age} років).

Числа:
- Шлях: ${d.lifePath} (${d.lifePathKeyword})
- Доля: ${d.destiny} (${d.destinyKeyword})
- Душа: ${d.soul} (${d.soulKeyword})
- Особистість: ${d.personality} (${d.personalityKeyword})
- День народження: ${d.birthday} (${d.birthdayKeyword})
- Особистий рік: ${d.personalYear} (${d.personalYearKeyword})
- Число Зрілості: ${d.maturity} (${d.maturityKeyword}) — розкривається після 35
- Число Балансу: ${d.balance} (${d.balanceKeyword}) — стратегія у кризі
- Карматичні уроки: ${karmic}
- Дар Стихії (Hidden Passion): ${d.hiddenPassion} (${d.hiddenPassionKeyword}) — найчастіша цифра в імені, вроджений талант${extBlock}

Структура відповіді (СТРОГО):
intro: 2 речення у форматі "${name}, ти прийшла/прийшов у цей світ як [архетип]. Сьогодні актуально: [3 тези через кому]."
---
portrait: 6-8 речень живого портрета. Враховуй вік (${age}), активну Вершину та Виклик, майстер-числа. Звертайся на 'ти'. Пиши виключно українською — жодних ієрогліфів або символів інших алфавітів.`;
}

// ── Split AI response into intro + portrait sections ───────────────────────
function splitSections(raw: string): { intro: string; portrait: string } {
  // Remove labels like "intro:" / "portrait:" the model sometimes echoes
  const cleaned = raw
    .replace(/^\s*(intro|introduction)\s*[:：]\s*/im, "")
    .trim();
  // Primary split: --- on its own line (most common with the new prompt)
  const parts = cleaned.split(/\n\s*-{3,}\s*\n/);
  if (parts.length >= 2) {
    return {
      intro:    parts[0].trim(),
      portrait: parts.slice(1).join("\n\n").replace(/^\s*portrait\s*[:：]\s*/i, "").trim(),
    };
  }
  // Fallback: first paragraph = intro, rest = portrait
  const paras = cleaned.split(/\n{2,}/).filter(p => p.trim());
  if (paras.length >= 2) {
    return { intro: paras[0].trim(), portrait: paras.slice(1).join("\n\n").trim() };
  }
  // Last resort: whole thing is portrait, no intro
  return { intro: "", portrait: cleaned };
}

export async function POST(req: NextRequest) {
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for")?.split(",")[0] ?? "unknown";

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "rate_limit", message: "Ліміт 1 синтез на добу вичерпано. Повертайтесь завтра 🌙" },
      { status: 429 }
    );
  }

  try {
    const data = (await req.json()) as SynthesisRequest;

    const res = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: SYSTEM[data.language] ?? SYSTEM.uk },
          { role: "user",   content: buildPrompt(data) },
        ],
        max_tokens: 1200,
        temperature: 0.8,
      }),
    });

    const json = await res.json();
    const text = (json.choices?.[0]?.message?.content ?? "").trim();
    const { intro, portrait } = splitSections(text);

    // Backward-compat: include `synthesis` = intro+portrait so older UI keeps working.
    const synthesis = intro ? `${intro}\n\n${portrait}` : portrait;
    return NextResponse.json({ intro, portrait, synthesis });
  } catch {
    return NextResponse.json({ error: "synthesis_failed" }, { status: 500 });
  }
}
