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

interface SynthesisRequest {
  language: "uk" | "ru" | "en";
  name: string;
  birthYear: number;
  age: number;
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
}

const SYSTEM: Record<string, string> = {
  uk: "Ти — нумеролог. Пишеш персональні нумерологічні портрети. Стиль: тепло, проникливо, конкретно. Шукай протиріччя та гармонії між числами. Звертайся напряму на 'ти'. Без загальних фраз. Без рекомендацій звертатись до спеціалістів. Пиши виключно українською мовою — жодних ієрогліфів, латиниці або символів інших алфавітів.",
  ru: "Ты — нумеролог. Пишешь персональные нумерологические портреты. Стиль: тепло, проницательно, конкретно. Ищи противоречия и гармонии между числами. Обращайся напрямую на 'ты'. Без общих фраз. Без рекомендаций. Пиши исключительно на русском языке — никаких иероглифов, латиницы или символов других алфавитов.",
  en: "You are a numerologist. Write personalised numerological portraits. Style: warm, insightful, specific. Look for tensions and harmonies between the numbers. Address the person directly as 'you'. No generic phrases. No advice to seek professional help. Write exclusively in English — no hieroglyphs, no characters from other scripts or alphabets.",
};

function buildPrompt(d: SynthesisRequest): string {
  const { language: l, name, birthYear, age } = d;
  const karmicArr = d.karmicLessons;

  const karmicUk = karmicArr.length > 0
    ? `${karmicArr.join(", ")} — відсутні вібрації в імені (незасвоєний досвід)`
    : "немає — всі вібрації 1–9 присутні в імені";
  const karmicRu = karmicArr.length > 0
    ? `${karmicArr.join(", ")} — отсутствующие вибрации в имени (незасвоенный опыт)`
    : "нет — все вибрации 1–9 присутствуют в имени";
  const karmicEn = karmicArr.length > 0
    ? `${karmicArr.join(", ")} — missing vibrations in the name (unlearned experience)`
    : "none — all vibrations 1–9 are present in the name";

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
- Кармические уроки (числа): ${karmicRu}
- Скрытая страсть (Hidden Passion): ${d.hiddenPassion} (${d.hiddenPassionKeyword}) — самая частая цифра в имени, врождённый талант

Напиши персональный нумерологический портрет (6–8 предложений). Создай живую историю, где числа — герои, которые взаимодействуют между собой. Учти возраст (${age} лет) — что актуально именно сейчас. Обращай внимание на повторяющиеся цифры между числами — это усиление вибрации. Обращайся напрямую к человеку на 'ты'. Пиши исключительно на русском языке — никаких иероглифов или других алфавитов.`;
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
- Karmic Lessons (numbers): ${karmicEn}
- Hidden Passion: ${d.hiddenPassion} (${d.hiddenPassionKeyword}) — the most frequent digit in the name, innate talent

Write a personal numerological portrait (6–8 sentences). Create a living story where the numbers are characters interacting with each other. Consider their age (${age}) — what is relevant right now. Pay attention to repeating digits across the numbers — this amplifies that vibration. Address the person directly as 'you'. Write exclusively in English — no hieroglyphs or other scripts.`;
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
- Карматичні уроки (числа): ${karmicUk}
- Прихована пристрасть (Hidden Passion): ${d.hiddenPassion} (${d.hiddenPassionKeyword}) — найчастіша цифра в імені, вроджений талант

Напиши персональний нумерологічний портрет (6–8 речень). Створи живу історію, де числа — герої, що взаємодіють між собою. Врахуй вік (${age} років) — що актуально саме зараз. Звертай увагу на повторювані цифри між числами — це підсилення цієї вібрації. Звертайся напряму до людини на 'ти'. Пиши виключно українською мовою — жодних ієрогліфів або символів інших алфавітів.`;
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
        max_tokens: 700,
        temperature: 0.8,
      }),
    });

    const json = await res.json();
    const text = json.choices?.[0]?.message?.content?.trim() ?? "";
    return NextResponse.json({ synthesis: text });
  } catch {
    return NextResponse.json({ error: "synthesis_failed" }, { status: 500 });
  }
}
