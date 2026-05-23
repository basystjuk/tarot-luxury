import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";

export const maxDuration = 30;

// Rate limit: 1 reading per IP per Kyiv calendar day
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

export async function POST(req: NextRequest) {
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for")?.split(",")[0] ?? "unknown";

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "rate_limit", message: "Ліміт 1 запит на добу вичерпано." },
      { status: 429 }
    );
  }

  const { cardName, language, arcanaType, suitElement } = await req.json();

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "not_configured" }, { status: 500 });
  }

  // System: Rider-Waite expert, no Ellen Soul mention in output, strict language
  const SYSTEM_PROMPT =
    language === "en"
      ? "You are an expert tarot reader with deep knowledge of Rider-Waite-Smith symbolism and classical Tarot interpretation. Your style is warm, feminine, poetic and intimate. Write exclusively in English — not a single word, hieroglyph or character from any other language or script."
      : language === "ru"
      ? "Ты — эксперт-таролог с глубоким знанием символизма колоды Райдера-Уайта и её классических трактовок. Стиль: тёплый, женственный, поэтичный, интимный. Пиши исключительно на русском языке — ни единого иероглифа, латинского слова или символа из другого алфавита, кроме названия карты."
      : "Ти — експерт-таролог з глибоким знанням символізму колоди Райдера-Уайта та її класичних трактувань. Стиль: тепло, жіночно, поетично, інтимно. Пиши виключно українською мовою — жодного ієрогліфа, латинського слова або символу іншого алфавіту, крім назви карти.";

  // Arcana + suit element context block
  const isMajor = arcanaType === "major";
  const arcanaBlockUk = isMajor
    ? "Це карта Старших Арканів — архетипічна сила, велика тема життя, духовний урок або поворотний момент."
    : `Це карта Молодших Арканів масті ${suitElement ?? ""} — повсякденна енергія, конкретна ситуація, сфера: ${suitElement === "Fire" ? "дія, воля, проєкти" : suitElement === "Water" ? "емоції, почуття, стосунки" : suitElement === "Air" ? "думки, рішення, комунікація" : "матерія, тіло, ресурси"}.`;
  const arcanaBlockRu = isMajor
    ? "Это карта Старших Арканов — архетипическая сила, большая тема жизни, духовный урок или поворотный момент."
    : `Это карта Младших Арканов масти ${suitElement ?? ""} — повседневная энергия, конкретная ситуация, сфера: ${suitElement === "Fire" ? "действие, воля, проекты" : suitElement === "Water" ? "эмоции, чувства, отношения" : suitElement === "Air" ? "мысли, решения, коммуникация" : "материя, тело, ресурсы"}.`;
  const arcanaBlockEn = isMajor
    ? "This is a Major Arcana card — archetypal power, a great life theme, spiritual lesson or turning point."
    : `This is a Minor Arcana card of the ${suitElement ?? ""} suit — everyday energy, concrete situation, sphere: ${suitElement === "Fire" ? "action, will, projects" : suitElement === "Water" ? "emotions, feelings, relationships" : suitElement === "Air" ? "thoughts, decisions, communication" : "matter, body, resources"}.`;

  const prompt =
    language === "en"
      ? `The drawn card is "${cardName}" (upright). ${arcanaBlockEn}

Interpret it using the classical Rider-Waite-Smith symbolism — the imagery, colours and figures in the card. Write EXCLUSIVELY in English — absolutely no other language, script or hieroglyphs. Card name always in its original English: "${cardName}". Structure — three paragraphs separated by blank lines, no headers, no greetings:
1) Meaning (2–3 sentences — the card's classical Rider-Waite energy, begin directly with the interpretation, do NOT start with "This card tells me" or "This card speaks" or similar preamble; honour the arcana type above)
2) Advice (1–2 sentences maximum — a soulful, concrete nudge for today)
3) Affirmation (ONE short, powerful sentence starting with the word "I", NO MORE THAN 15 WORDS, directly connected to this card's energy)

Style: intimate, poetic, mystical.`
      : language === "ru"
      ? `Выпавшая карта: «${cardName}» (прямое положение). ${arcanaBlockRu}

Интерпретируй её, опираясь на классический символизм колоды Райдера-Уайта — образы, цвета и фигуры на карте. Пиши ИСКЛЮЧИТЕЛЬНО на русском языке — абсолютно никаких иероглифов, латиницы или других алфавитов, кроме названия карты. Название карты всегда в оригинале: «${cardName}». Структура — три абзаца, разделённых пустыми строками, без заголовков, без вступления:
1) Значение (2–3 предложения — классическая энергия карты Райдера-Уайта; начинай СРАЗУ с трактовки, без «Эта карта говорит мне»; учитывай тип аркана выше)
2) Совет (максимум 1–2 предложения — душевный конкретный совет на сегодня)
3) Аффирмация (ОДНО короткое мощное предложение, начинается со слова «Я», НЕ БОЛЕЕ 15 СЛОВ, связано с энергией ${cardName})

Стиль: интимный, поэтичный, мистический.`
      : `Витягнута карта: «${cardName}» (пряме положення). ${arcanaBlockUk}

Інтерпретуй її, спираючись на класичний символізм колоди Райдера-Уайта — образи, кольори та фігури на карті. Пиши ВИКЛЮЧНО українською мовою — абсолютно жодних ієрогліфів, латиниці або інших алфавітів, крім назви карти. Назву карти завжди в оригіналі: «${cardName}». Структура — три абзаци, розділені порожніми рядками, без заголовків, без вступу:
1) Значення (2–3 речення — класична енергія карти Райдера-Уайта; починай ОДРАЗУ з трактовки, без «Ця карта говорить мені»; враховуй тип аркана вище)
2) Порада (максимум 1–2 речення — душевна конкретна порада на сьогодні)
3) Аффірмація (ОДНЕ коротке потужне речення, починається зі слова «Я», НЕ БІЛЬШЕ 15 СЛІВ, пов'язане з енергією ${cardName})

Стиль: інтимний, поетичний, містичний.`;

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: prompt },
        ],
        max_tokens: 650,
        temperature: 0.85,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Groq error:", err);
      return NextResponse.json({ error: "groq_error" }, { status: 500 });
    }

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content ?? "";

    const parts = text.split(/\n\n+/).filter((s: string) => s.trim());
    return NextResponse.json({
      meaning:     parts[0] ?? text,
      advice:      parts[1] ?? "",
      affirmation: parts[2] ?? "",
    });
  } catch (e) {
    console.error("tarot-reading error:", e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
