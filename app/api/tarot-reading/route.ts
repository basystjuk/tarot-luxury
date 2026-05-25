import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { isPreviewFromRequest } from "@/lib/preview";
import { renderTemplate, resolvePrompt, getLanguageName, type PromptOverrides } from "@/lib/ai-prompts";
import { loadPromptOverrides } from "@/lib/server-content";
import { getMeaning } from "@/lib/data/tarot-meanings";

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

  // Preview mode (admin cookie) bypasses rate limit so the owner can keep
  // iterating on prompts without burning the public daily quota.
  if (!isPreviewFromRequest(req) && !checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "rate_limit", message: "Ліміт 1 запит на добу вичерпано." },
      { status: 429 }
    );
  }

  const {
    cardName,
    language,
    arcanaType,
    suitElement,
    reversed = false,
    userQuestion = "",
  } = await req.json();

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "not_configured" }, { status: 500 });
  }

  // ── Pull canonical RWS meaning ─────────────────────────────────────────────
  // This is the authoritative anchor — AI contextualises it but cannot
  // invent contradicting interpretations. Major upgrade vs. the previous
  // "AI knows RWS" assumption.
  const canon = getMeaning(cardName);
  const orientation = reversed ? "reversed" : "upright";
  const facet = canon?.[orientation] ?? null;

  const canonicalCore        = facet?.core ?? "";
  const canonicalPsychology  = facet?.psychology ?? "";
  const canonicalAdvice      = facet?.advice ?? "";
  const canonicalKeywords    = facet?.keywords.join(", ") ?? "";

  // Pre-render the arcana-context sentence in the response language. The
  // admin-editable template only sees the final string — it doesn't know
  // about uk/ru/en branches.
  const isMajor = arcanaType === "major";
  const arcanaContext = language === "en"
    ? (isMajor
        ? "This is a Major Arcana card — archetypal power, a great life theme, spiritual lesson or turning point."
        : `This is a Minor Arcana card of the ${suitElement ?? ""} suit — everyday energy, concrete situation, sphere: ${suitElement === "Fire" ? "action, will, projects" : suitElement === "Water" ? "emotions, feelings, relationships" : suitElement === "Air" ? "thoughts, decisions, communication" : "matter, body, resources"}.`)
    : language === "ru"
    ? (isMajor
        ? "Это карта Старших Арканов — архетипическая сила, большая тема жизни, духовный урок или поворотный момент."
        : `Это карта Младших Арканов масти ${suitElement ?? ""} — повседневная энергия, конкретная ситуация, сфера: ${suitElement === "Fire" ? "действие, воля, проекты" : suitElement === "Water" ? "эмоции, чувства, отношения" : suitElement === "Air" ? "мысли, решения, коммуникация" : "материя, тело, ресурсы"}.`)
    : (isMajor
        ? "Це карта Старших Арканів — архетипічна сила, велика тема життя, духовний урок або поворотний момент."
        : `Це карта Молодших Арканів масті ${suitElement ?? ""} — повсякденна енергія, конкретна ситуація, сфера: ${suitElement === "Fire" ? "дія, воля, проєкти" : suitElement === "Water" ? "емоції, почуття, стосунки" : suitElement === "Air" ? "думки, рішення, комунікація" : "матерія, тіло, ресурси"}.`);

  // Resolve admin overrides (cached 30s) and render template.
  const overrides = (await loadPromptOverrides()) as PromptOverrides | null;
  const tpl = resolvePrompt("tarot-reading", overrides);
  const vars = {
    language_name: getLanguageName(language),
    cardName,
    orientation,
    arcanaContext,
    canonicalCore,
    canonicalPsychology,
    canonicalAdvice,
    canonicalKeywords,
    userQuestion: typeof userQuestion === "string" ? userQuestion.trim() : "",
  };
  const SYSTEM_PROMPT = renderTemplate(tpl.system, vars);
  const prompt = renderTemplate(tpl.user, vars);

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
        max_tokens: 700,
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
