/**
 * POST /api/numerology-activation
 *
 * Phase Н2 — concrete actions for today / week / month based on the
 * user's numerology profile.
 *
 * AUTH-GATED (Phase В soft-gating rule): requires a signed-in user.
 * Anonymous browsers get a 401 + a hint to sign in. The Daily Card AI
 * remains anonymous-accessible — only secondary AI tools (this one,
 * Moon reading, Moon recs, future tools) follow the new policy.
 *
 * Rate limit: 1 request per Kyiv-day per user (not per IP). The user
 * already paid the cost of signing in, so we trust their session
 * for the quota key.
 */

import { NextRequest, NextResponse } from "next/server";
import { renderTemplate, resolvePrompt, getLanguageName, type PromptOverrides } from "@/lib/ai-prompts";
import { loadPromptOverrides } from "@/lib/server-content";
import { getSupabaseServer } from "@/lib/supabase/server";

export const maxDuration = 30;

// Per-user, per-Kyiv-day in-memory rate limiting. Restored across cold
// starts via DB lookup of "numerology_activation:<day>" in notification_log
// would be more robust — kept in-memory for now (single Vercel instance
// regional dominance + low traffic = good enough).
const userMap = new Map<string, { day: string }>();
function getKyivDay(): string {
  return new Date().toLocaleDateString("uk-UA", { timeZone: "Europe/Kiev" });
}
function checkRate(userId: string): boolean {
  const today = getKyivDay();
  const e = userMap.get(userId);
  if (!e || e.day !== today) { userMap.set(userId, { day: today }); return true; }
  return false;
}

interface Body {
  name: string;
  lifePath: number;
  destiny: number;
  personalYear: number;
  personalMonth?: number;
  personalDay?: number;
  activePinnacle?: number;
  activeChallenge?: number;
  hiddenPassion?: number;
  karmicLessons?: number[];
  language: string;
}

export async function POST(req: NextRequest) {
  const supa = await getSupabaseServer();
  if (!supa) return NextResponse.json({ error: "not_configured" }, { status: 503 });
  const { data: { user } } = await supa.auth.getUser();
  if (!user) {
    return NextResponse.json(
      { error: "auth_required", message: "Sign in to receive your activation plan." },
      { status: 401 }
    );
  }

  if (!checkRate(user.id)) {
    return NextResponse.json(
      { error: "rate_limit", message: "Ліміт 1 активація на добу." },
      { status: 429 }
    );
  }

  let body: Body;
  try { body = (await req.json()) as Body; }
  catch { return NextResponse.json({ error: "bad_json" }, { status: 400 }); }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "not_configured" }, { status: 500 });

  const overrides = (await loadPromptOverrides()) as PromptOverrides | null;
  const tpl = resolvePrompt("numerology-activation", overrides);

  const vars: Record<string, string | number | undefined> = {
    language_name: getLanguageName(body.language),
    name: body.name?.trim() || "—",
    lifePath: body.lifePath,
    destiny:  body.destiny,
    personalYear:  body.personalYear,
    personalMonth: body.personalMonth ?? "—",
    personalDay:   body.personalDay ?? "—",
    activePinnacle:  body.activePinnacle ?? "—",
    activeChallenge: body.activeChallenge ?? "—",
    hiddenPassion:   body.hiddenPassion ?? "—",
    karmicLessons:   (body.karmicLessons && body.karmicLessons.length > 0)
                       ? body.karmicLessons.join(", ")
                       : "—",
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
        temperature: 0.7,
      }),
    });
    if (!res.ok) {
      console.error("groq error:", await res.text());
      return NextResponse.json({ error: "groq_error" }, { status: 500 });
    }
    const data = await res.json();
    const text = data.choices?.[0]?.message?.content ?? "";

    const [today, this_week, this_month] = text.split(/^---\s*$/m).map((s: string) => s.trim());
    return NextResponse.json({ today, this_week, this_month });
  } catch (e) {
    console.error("activation error:", e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
