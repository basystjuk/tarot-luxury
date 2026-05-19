import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";

// Simple in-memory rate limiter: max 3 requests per IP per 24h
const ipMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = ipMap.get(ip);
  if (!entry || now > entry.resetAt) {
    ipMap.set(ip, { count: 1, resetAt: now + 24 * 60 * 60 * 1000 });
    return true;
  }
  if (entry.count >= 3) return false;
  entry.count++;
  return true;
}

export async function POST(req: NextRequest) {
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for")?.split(",")[0] ?? "unknown";

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "rate_limit", message: "Ліміт 3 запити на добу вичерпано." },
      { status: 429 }
    );
  }

  const { name, cardName, zodiac, language } = await req.json();

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "not_configured" }, { status: 500 });
  }

  const langLabel = language === "ru" ? "русском" : language === "en" ? "English" : "українській";
  const prompt =
    language === "en"
      ? `You are a wise and mystical tarot reader. The person's name is ${name}, their zodiac sign is ${zodiac}. The drawn card is "${cardName}". Give a personal tarot reading in English. Structure: 1) Meaning (2-3 sentences, personal and specific to their sign), 2) Advice (1-2 sentences), 3) Affirmation (one powerful sentence starting with "I"). Be mystical, warm, and insightful. No headers, just flowing text separated by line breaks.`
      : language === "ru"
      ? `Ты — мудрая и мистическая таролог. Имя человека: ${name}, знак зодиака: ${zodiac}. Выпавшая карта: «${cardName}». Дай личное предсказание на русском языке. Структура: 1) Значение (2-3 предложения, личное и с учётом знака), 2) Совет (1-2 предложения), 3) Аффирмация (одно сильное предложение, начинающееся с «Я»). Будь мистической, тёплой и проницательной. Без заголовков, просто текст разделённый переносами.`
      : `Ти — мудра і містична таролог. Ім'я людини: ${name}, знак зодіаку: ${zodiac}. Витягнута карта: «${cardName}». Дай особисте передбачення українською мовою. Структура: 1) Значення (2-3 речення, особисте з урахуванням знаку), 2) Порада (1-2 речення), 3) Аффірмація (одне сильне речення, що починається з «Я»). Будь містичною, теплою та проникливою. Без заголовків, просто текст розділений переносами.`;

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 400,
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

    // Split into 3 parts: meaning, advice, affirmation
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
