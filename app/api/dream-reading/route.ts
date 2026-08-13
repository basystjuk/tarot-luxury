/**
 * POST /api/dream-reading
 *
 * Deep dream analysis. Symbols are detected deterministically server-side
 * (so the AI gets a clean seed and can't hallucinate the symbol list),
 * then the AI writes the interpretation / messages / affirmation /
 * reflection questions as strict JSON.
 *
 * Auth-gated per Phase В (preview bypass, 1 request/Kyiv-day/user).
 * Folds in tonight's Moon context (phase + whether dreams are "vivid /
 * prophetic" near the full moon) — the bridge to the Moon Guide tool.
 */

import { NextRequest, NextResponse } from "next/server";
import { isPreviewFromRequest } from "@/lib/preview";
import { renderTemplate, resolvePrompt, getLanguageName, type PromptOverrides } from "@/lib/ai-prompts";
import { loadPromptOverrides } from "@/lib/server-content";
import { requireAiAuth, checkPerUserDailyRate } from "@/lib/auth/gate";
import { detectSymbols, analyzeDream } from "@/lib/dreams/analyze";
import { symbolName } from "@/lib/dreams/symbols";
import { lunarState } from "@/lib/astro/moon-state";

export const maxDuration = 30;
const userMap = new Map<string, { day: string }>();

interface Body {
  language: "uk" | "ru" | "en";
  name?: string;
  dream: string;
}

/**
 * Compact Moon context for tonight: phase + a "vivid/prophetic" flag near the
 * full moon (folk tradition: full-moon dreams are the most telling).
 *
 * Two things used to be wrong here. The instant came from
 * `now.getTimezoneOffset()`, which on Vercel is UTC, so a dream logged at
 * 01:00 in Kyiv was read against the sky of 22:00 the previous evening. And
 * the phase was bucketed at 45° while every other surface used 22.5°, so on
 * 90 days of 2026 the Moon Guide said "waxing" and this said "full".
 *
 * The instant is now genuinely instantaneous (JD straight from epoch millis,
 * no wall-clock round trip) and the phase comes from the shared lunar state.
 */
function moonContext(lang: "uk" | "ru" | "en"): string {
  const jd = Date.now() / 86_400_000 + 2440587.5;
  const state = lunarState(jd);
  const elong = state.elongation;
  const illum = state.illumination;
  const phase = state.phase;
  const prophetic = elong >= 160 && elong <= 200; // near full
  const phaseLbl = {
    uk: { new: "новий місяць", waxing: "місяць росте", full: "повний місяць", waning: "місяць спадає" },
    ru: { new: "новолуние", waxing: "растущая луна", full: "полнолуние", waning: "убывающая луна" },
    en: { new: "new moon", waxing: "waxing moon", full: "full moon", waning: "waning moon" },
  }[lang][phase];
  const propheticLbl = prophetic
    ? (lang === "ru" ? " — у полнолуния сны особенно яркие и вещие"
      : lang === "en" ? " — near the full moon dreams are especially vivid and telling"
      : " — біля повні сни особливо яскраві та віщі")
    : "";
  return `${phaseLbl} (${illum}%)${propheticLbl}`;
}

export async function POST(req: NextRequest) {
  if (!isPreviewFromRequest(req)) {
    const gate = await requireAiAuth();
    if (gate.deny) return gate.deny;
    if (!checkPerUserDailyRate(userMap, gate.user!.id)) {
      return NextResponse.json(
        { error: "rate_limit", message: "1 глибокий аналіз сну на добу. Повертайся завтра ✨" },
        { status: 429 }
      );
    }
  }

  let body: Body;
  try { body = (await req.json()) as Body; }
  catch { return NextResponse.json({ error: "bad_json" }, { status: 400 }); }

  const dream = (body.dream ?? "").trim();
  if (dream.length < 8) return NextResponse.json({ error: "too_short" }, { status: 400 });

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "not_configured" }, { status: 500 });

  const lang = body.language === "ru" ? "ru" : body.language === "en" ? "en" : "uk";

  // Deterministic seed.
  const analysis = analyzeDream(dream);
  const detected = detectSymbols(dream);
  const symbolsStr = detected.length
    ? detected.map((s) => `${s.emoji} ${symbolName(s, lang)}`).join(", ")
    : (lang === "ru" ? "явных символов не найдено" : lang === "en" ? "no obvious symbols" : "явних символів не знайдено");

  const overrides = (await loadPromptOverrides()) as PromptOverrides | null;
  const tpl = resolvePrompt("dream-reading", overrides);
  const vars: Record<string, string | undefined> = {
    language_name: getLanguageName(lang),
    name: body.name?.trim() || "",
    dreamText: dream.slice(0, 2500),
    symbols: symbolsStr,
    tone: analysis.tone,
    moonContext: moonContext(lang),
  };

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: renderTemplate(tpl.system, vars) },
          { role: "user", content: renderTemplate(tpl.user, vars) },
        ],
        max_tokens: 1100,
        temperature: 0.8,
        response_format: { type: "json_object" },
      }),
    });
    if (!res.ok) {
      console.error("groq error:", await res.text());
      return NextResponse.json({ error: "groq_error" }, { status: 500 });
    }
    const data = await res.json();
    const raw = data.choices?.[0]?.message?.content ?? "{}";
    let parsed: Record<string, unknown> = {};
    try { parsed = JSON.parse(raw); } catch { /* fall through */ }

    return NextResponse.json({
      symbols: detected.map((s) => ({ slug: s.slug, emoji: s.emoji, name: symbolName(s, lang) })),
      tone: analysis.tone,
      positivityPercent: analysis.positivityPercent,
      archetypes: analysis.archetypes,
      interpretation: parsed.interpretation ?? "",
      emotionalMessage: parsed.emotionalMessage ?? "",
      subconsciousMessage: parsed.subconsciousMessage ?? "",
      affirmation: parsed.affirmation ?? "",
      reflectionQuestions: Array.isArray(parsed.reflectionQuestions) ? parsed.reflectionQuestions.slice(0, 3) : [],
      moon: moonContext(lang),
    });
  } catch (e) {
    console.error("dream-reading error:", e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
