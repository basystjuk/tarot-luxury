/**
 * POST /api/horoscope-portrait
 *
 * Takes the engine-computed horoscope context for today and asks the
 * AI to write the synthesis — essence / windows / do.
 *
 * Auth-gated per Phase В. 1 request/Kyiv-day/user.
 *
 * The engine's deterministic output (theme, signals, time windows) is
 * passed in directly — the AI does NOT recompute astrology. This keeps
 * the synthesis honest: it can only riff on the literal signals.
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
  quality: "flowing" | "mixed" | "turbulent" | "quiet";
  theme: string;
  topSignals: string;        // newline-separated, prebuilt by client
  windowsOfLuck?: string;    // newline-separated, prebuilt
  challenges?: string;       // newline-separated
  moonSign: string;
  moonPhase: string;
  personalDay?: string;      // string or "—"
}

export async function POST(req: NextRequest) {
  if (!isPreviewFromRequest(req)) {
    const gate = await requireAiAuth();
    if (gate.deny) return gate.deny;
    if (!checkPerUserDailyRate(userMap, gate.user!.id)) {
      return NextResponse.json(
        { error: "rate_limit", message: "1 гороскоп на добу. Повертайся завтра ✨" },
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
  const tpl = resolvePrompt("horoscope-portrait", overrides);
  const vars: Record<string, string | number | undefined> = {
    language_name: getLanguageName(body.language),
    name: body.name?.trim() || "",
    quality: body.quality,
    theme: body.theme,
    topSignals: body.topSignals,
    windowsOfLuck: body.windowsOfLuck || "—",
    challenges: body.challenges || "—",
    moonSign: body.moonSign,
    moonPhase: body.moonPhase,
    personalDay: body.personalDay || "—",
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
    const [essence, windows, doToday] = text.split(/^---\s*$/m).map((s: string) => s.trim());
    return NextResponse.json({ essence, windows, do: doToday });
  } catch (e) {
    console.error("horoscope-portrait error:", e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
