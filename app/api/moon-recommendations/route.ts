import { NextRequest, NextResponse } from "next/server";
import { isPreviewFromRequest } from "@/lib/preview";
import { renderTemplate, resolvePrompt, getLanguageName, type PromptOverrides } from "@/lib/ai-prompts";
import { loadPromptOverrides } from "@/lib/server-content";
import { requireAiAuth, checkPerUserDailyRate } from "@/lib/auth/gate";

export const maxDuration = 30;

// Per-user daily limit (Phase В policy: AI = signed-in only). Separate
// bucket from /api/moon-reading so a user can still pull a reading after
// using recommendations.
const userMap = new Map<string, { day: string }>();

interface Recommendation {
  name: string;
  why: string;
}
interface RecPayload {
  crystals: Recommendation[];
  oils: Recommendation[];
  teas: Recommendation[];
}

/** Strip optional ```json fences if the model wrapped the JSON. */
function stripFences(s: string): string {
  return s.trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();
}

/** Light validator — keeps the response shape predictable for the UI. */
function isValidPayload(x: unknown): x is RecPayload {
  if (!x || typeof x !== "object") return false;
  const r = x as Record<string, unknown>;
  const ok = (arr: unknown) =>
    Array.isArray(arr) &&
    arr.length > 0 &&
    arr.every(it =>
      it && typeof it === "object" &&
      typeof (it as Record<string, unknown>).name === "string" &&
      typeof (it as Record<string, unknown>).why === "string"
    );
  return ok(r.crystals) && ok(r.oils) && ok(r.teas);
}

export async function POST(req: NextRequest) {
  // ── Auth gate (Phase В) ─────────────────────────────────────────────────
  if (!isPreviewFromRequest(req)) {
    const gate = await requireAiAuth();
    if (gate.deny) return gate.deny;
    if (!checkPerUserDailyRate(userMap, gate.user!.id)) {
      return NextResponse.json(
        { error: "rate_limit", message: "Ліміт 1 запит на добу вичерпано." },
        { status: 429 }
      );
    }
  }

  const { language, moonSign, moonSignEn, element } = await req.json();

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "not_configured" }, { status: 500 });
  }

  // Localise the element name into the response language. We accept either
  // the English key ("fire" | ...) from the client or an already-localised
  // string. Falls back gracefully.
  const ELEMENT_LOCAL: Record<string, { uk: string; ru: string; en: string }> = {
    fire:  { uk: "Вогонь",  ru: "Огонь",   en: "Fire"  },
    earth: { uk: "Земля",   ru: "Земля",   en: "Earth" },
    air:   { uk: "Повітря", ru: "Воздух",  en: "Air"   },
    water: { uk: "Вода",    ru: "Вода",    en: "Water" },
  };
  const elementLoc =
    ELEMENT_LOCAL[element]?.[language === "ru" ? "ru" : language === "en" ? "en" : "uk"]
    ?? String(element ?? "");
  const moonSignResolved = language === "en" ? (moonSignEn ?? moonSign) : moonSign;

  const overrides = (await loadPromptOverrides()) as PromptOverrides | null;
  const tpl = resolvePrompt("moon-recommendations", overrides);
  const vars = {
    language_name: getLanguageName(language),
    moonSign: moonSignResolved,
    element: elementLoc,
  };
  const SYSTEM_PROMPT = renderTemplate(tpl.system, vars);
  const prompt = renderTemplate(tpl.user, vars);

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: prompt },
        ],
        max_tokens: 700,
        temperature: 0.7,
        // ask for JSON-only — most Groq llama-3.3 deployments honour this
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Groq error (recommendations):", err);
      return NextResponse.json({ error: "groq_error" }, { status: 500 });
    }

    const data = await res.json();
    const text: string = data.choices?.[0]?.message?.content ?? "";

    let parsed: unknown = null;
    try {
      parsed = JSON.parse(stripFences(text));
    } catch (parseErr) {
      console.error("Recommendations JSON parse failed:", parseErr, "\nRaw:", text);
      return NextResponse.json({ error: "parse_error" }, { status: 500 });
    }

    if (!isValidPayload(parsed)) {
      console.error("Recommendations payload invalid shape:", parsed);
      return NextResponse.json({ error: "shape_error" }, { status: 500 });
    }

    return NextResponse.json(parsed);
  } catch (e) {
    console.error("moon-recommendations error:", e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
