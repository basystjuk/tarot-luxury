/**
 * POST /api/natal-chart-portrait
 *
 * Generates a 3-section AI natal portrait (essence / gifts / work) from
 * the user's natal snapshot. Auth-gated per Phase В — anonymous → 401.
 * 1 request per Kyiv-day per user.
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
  name: string;
  sunSign: string;
  moonSign: string;
  ascSign: string;
  mcSign: string;
  venusSign: string;
  marsSign: string;
  stelliums?: string;
  majorAspects?: string;
}

export async function POST(req: NextRequest) {
  if (!isPreviewFromRequest(req)) {
    const gate = await requireAiAuth();
    if (gate.deny) return gate.deny;
    if (!checkPerUserDailyRate(userMap, gate.user!.id)) {
      return NextResponse.json(
        { error: "rate_limit", message: "1 натальний портрет на добу. Повертайся завтра ✨" },
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
  const tpl = resolvePrompt("natal-chart-portrait", overrides);
  const vars: Record<string, string | number | undefined> = {
    language_name: getLanguageName(body.language),
    name: body.name?.trim() || "—",
    sunSign:  body.sunSign,
    moonSign: body.moonSign,
    ascSign:  body.ascSign,
    mcSign:   body.mcSign,
    venusSign: body.venusSign,
    marsSign:  body.marsSign,
    stelliums: body.stelliums || "—",
    majorAspects: body.majorAspects || "—",
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
        max_tokens: 900,
        temperature: 0.75,
      }),
    });
    if (!res.ok) {
      console.error("groq error:", await res.text());
      return NextResponse.json({ error: "groq_error" }, { status: 500 });
    }
    const data = await res.json();
    const text = data.choices?.[0]?.message?.content ?? "";
    const [essence, gifts, work] = text.split(/^---\s*$/m).map((s: string) => s.trim());
    return NextResponse.json({ essence, gifts, work });
  } catch (e) {
    console.error("natal-chart-portrait error:", e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
