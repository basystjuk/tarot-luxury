/**
 * Tarot clarification endpoint (Phase A).
 *
 * Used when the user wants to dig deeper into the SAME card already
 * drawn today — separate from the main `/api/tarot-reading` quota, so
 * a user can: (1) draw their daily card, get the primary reading, then
 * (2) ask a clarifying question once and receive a follow-up. Each
 * gets its own 1-per-IP-per-Kyiv-day budget.
 *
 * Replaces the "new card" button request: the magic of one card per day
 * is preserved, but the user gets a second AI pass for nuance.
 */

import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { isPreviewFromRequest } from "@/lib/preview";
import { renderTemplate, resolvePrompt, getLanguageName, type PromptOverrides } from "@/lib/ai-prompts";
import { loadPromptOverrides } from "@/lib/server-content";
import { getMeaning } from "@/lib/data/tarot-meanings";

export const maxDuration = 30;

const ipMap = new Map<string, { day: string }>();
function getKyivDay(): string {
  return new Date().toLocaleDateString("uk-UA", { timeZone: "Europe/Kiev" });
}
function checkRateLimit(ip: string): boolean {
  const today = getKyivDay();
  const entry = ipMap.get(ip);
  if (!entry || entry.day !== today) { ipMap.set(ip, { day: today }); return true; }
  return false;
}

export async function POST(req: NextRequest) {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
  if (!isPreviewFromRequest(req) && !checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "rate_limit", message: "Ліміт 1 уточнення на добу вичерпано." },
      { status: 429 }
    );
  }

  const { cardName, language, reversed = false, previousReading = "", userQuestion = "" } = await req.json();
  if (!userQuestion.trim()) {
    return NextResponse.json({ error: "no_question" }, { status: 400 });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "not_configured" }, { status: 500 });

  const canon = getMeaning(cardName);
  const orientation = reversed ? "reversed" : "upright";
  const canonicalCore = canon?.[orientation].core ?? "";

  const overrides = (await loadPromptOverrides()) as PromptOverrides | null;
  const tpl = resolvePrompt("tarot-clarify", overrides);
  const vars = {
    language_name: getLanguageName(language),
    cardName, orientation,
    previousReading,
    userQuestion: userQuestion.trim(),
    canonicalCore,
  };
  const SYSTEM_PROMPT = renderTemplate(tpl.system, vars);
  const prompt = renderTemplate(tpl.user, vars);

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: prompt },
        ],
        max_tokens: 500,
        temperature: 0.85,
      }),
    });
    if (!res.ok) {
      console.error("Groq clarify error:", await res.text());
      return NextResponse.json({ error: "groq_error" }, { status: 500 });
    }
    const data = await res.json();
    const text = data.choices?.[0]?.message?.content ?? "";
    return NextResponse.json({ clarification: text });
  } catch (e) {
    console.error("tarot-clarify error:", e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
