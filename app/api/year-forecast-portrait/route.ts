/**
 * POST /api/year-forecast-portrait
 *
 * Takes the engine-computed Solar Return + progression context and asks the
 * AI to write the year synthesis — theme / season / focus.
 *
 * Auth-gated per Phase В. 1 request/Kyiv-day/user. The AI does NOT recompute
 * astrology — it only interprets the supplied points.
 */

import { NextRequest, NextResponse } from "next/server";
import { isPreviewFromRequest } from "@/lib/preview";
import { renderTemplate, resolvePrompt, getLanguageName, type PromptOverrides } from "@/lib/ai-prompts";
import { loadPromptOverrides } from "@/lib/server-content";
import { requireAiAuth, checkPerUserDailyRate } from "@/lib/auth/gate";

export const maxDuration = 30;
const userMap = new Map<string, { day: string }>();

interface Body {
  language: string;
  name?: string;
  age: number;
  srAscSign?: string;
  srSunHouse?: string;
  progSunSign: string;
  progMoonSign: string;
  progMoonChange?: string;
  progAspects?: string;
}

export async function POST(req: NextRequest) {
  if (!isPreviewFromRequest(req)) {
    const gate = await requireAiAuth();
    if (gate.deny) return gate.deny;
    if (!checkPerUserDailyRate(userMap, gate.user!.id)) {
      return NextResponse.json(
        { error: "rate_limit", message: "1 прогноз року на добу. Повертайся завтра ✨" },
        { status: 429 }
      );
    }
  }

  let body: Body;
  try { body = (await req.json()) as Body; }
  catch { return NextResponse.json({ error: "bad_json" }, { status: 400 }); }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "not_configured" }, { status: 500 });

  const overrides = (await loadPromptOverrides()) as PromptOverrides | null;
  const tpl = resolvePrompt("year-forecast-portrait", overrides);
  const vars: Record<string, string | number | undefined> = {
    language_name: getLanguageName(body.language),
    name: body.name?.trim() || "",
    age: Math.round(body.age),
    srAscSign: body.srAscSign || "—",
    srSunHouse: body.srSunHouse || "—",
    progSunSign: body.progSunSign,
    progMoonSign: body.progMoonSign,
    progMoonChange: body.progMoonChange || "—",
    progAspects: body.progAspects || "—",
  };

  const SYSTEM_PROMPT = renderTemplate(tpl.system, vars);
  const prompt        = renderTemplate(tpl.user, vars);

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
        max_tokens: 700,
        temperature: 0.75,
      }),
    });
    if (!res.ok) {
      console.error("groq error:", await res.text());
      return NextResponse.json({ error: "groq_error" }, { status: 500 });
    }
    const data = await res.json();
    const text = data.choices?.[0]?.message?.content ?? "";
    const [theme, season, focus] = text.split(/^---\s*$/m).map((s: string) => s.trim());
    return NextResponse.json({ theme, season, focus });
  } catch (e) {
    console.error("year-forecast-portrait error:", e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
