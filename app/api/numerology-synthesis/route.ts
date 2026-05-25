import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { isPreviewFromRequest } from "@/lib/preview";
import { requireAiAuth, checkPerUserDailyRate } from "@/lib/auth/gate";
import { renderTemplate, resolvePrompt, getLanguageName, type PromptOverrides } from "@/lib/ai-prompts";
import { loadPromptOverrides } from "@/lib/server-content";

export const maxDuration = 30;

// Rate limit: 1 synthesis per IP per Kyiv calendar day
// Per-user daily limit (Phase В policy: AI = signed-in only).
const userMap = new Map<string, { day: string }>();

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

// ── Request shape ──────────────────────────────────────────────────────────
// Backward-compatible: old fields stay required. New fields are optional so
// older clients keep working until Phase 3 ships the new UI.

interface PinnacleData  { number: number; startAge: number; endAge: number | null }
interface ChallengeData { number: number; startAge: number; endAge: number | null }
interface LetterData    { letter: string; value: number }
interface PlaneData     { physical: number; mental: number; emotional: number; intuitive: number; dominant: string }

interface SynthesisRequest {
  language: "uk" | "ru" | "en";
  name: string;
  birthYear: number;
  age: number;
  // Core 10 numbers
  lifePath: number;     lifePathKeyword: string;
  destiny: number;      destinyKeyword: string;
  soul: number;         soulKeyword: string;
  personality: number;  personalityKeyword: string;
  birthday: number;     birthdayKeyword: string;
  personalYear: number; personalYearKeyword: string;
  maturity: number;     maturityKeyword: string;
  balance: number;      balanceKeyword: string;
  karmicLessons: number[];
  hiddenPassion: number;
  hiddenPassionKeyword: string;
  // Phase 2 extensions (optional for backward compat)
  pinnacles?:  [PinnacleData, PinnacleData, PinnacleData, PinnacleData];
  challenges?: [ChallengeData, ChallengeData, ChallengeData, ChallengeData];
  cornerstone?: LetterData;
  capstone?:    LetterData;
  firstVowel?:  LetterData;
  planeOfExpression?: PlaneData;
  masterPhase?: { masterNumber: 11 | 22 | 33; baseNumber: 2 | 4 | 6; activationAge: number; currentlyActive: boolean } | null;
}

// ── Active-cycle pickers — find which pinnacle/challenge is active for current age
function activeCycle<T extends { startAge: number; endAge: number | null }>(arr: T[] | undefined, age: number): T | null {
  if (!arr) return null;
  return arr.find(c => age >= c.startAge && (c.endAge === null || age <= c.endAge)) ?? null;
}

/**
 * Build the {{numbersBlock}} and {{extrasBlock}} variables passed into the
 * editable template. These strings are already localized — admin only edits
 * the surrounding instructions, never the data shape.
 */
function buildPromptVars(d: SynthesisRequest): { numbersBlock: string; extrasBlock: string } {
  const { language: l, age } = d;
  const karmicArr = d.karmicLessons;

  const karmic = karmicArr.length > 0
    ? karmicArr.join(", ")
    : (l === "ru" ? "нет — все вибрации 1–9 присутствуют" : l === "en" ? "none — all 1–9 vibrations present" : "немає — всі вібрації 1–9 присутні");

  const activePinnacle  = activeCycle(d.pinnacles,  age);
  const activeChallenge = activeCycle(d.challenges, age);

  // Build extended block only if Phase 2 data is present
  const ext: string[] = [];
  if (d.cornerstone || d.capstone || d.firstVowel) {
    const cornerLbl = l === "ru" ? "Краеугольный камень (первая буква имени)" : l === "en" ? "Cornerstone (first letter of first name)" : "Наріжний камінь (перша літера імені)";
    const capLbl    = l === "ru" ? "Венчающий камень (последняя буква имени)" : l === "en" ? "Capstone (last letter of first name)" : "Замковий камінь (остання літера імені)";
    const vowLbl    = l === "ru" ? "Первая гласная (первый эмоциональный отклик)" : l === "en" ? "First vowel (first emotional response)" : "Перша голосна (перша емоційна реакція)";
    if (d.cornerstone) ext.push(`- ${cornerLbl}: "${d.cornerstone.letter}" (${d.cornerstone.value})`);
    if (d.capstone)    ext.push(`- ${capLbl}: "${d.capstone.letter}" (${d.capstone.value})`);
    if (d.firstVowel)  ext.push(`- ${vowLbl}: "${d.firstVowel.letter}" (${d.firstVowel.value})`);
  }
  if (d.planeOfExpression) {
    const p = d.planeOfExpression;
    const lbl = l === "ru" ? "Плоскость выражения (тип души по буквам имени)" : l === "en" ? "Plane of Expression (soul type by name letters)" : "Площина вираження (тип душі за літерами імені)";
    ext.push(`- ${lbl}: physical=${p.physical}, mental=${p.mental}, emotional=${p.emotional}, intuitive=${p.intuitive} — dominant: ${p.dominant}`);
  }
  if (activePinnacle) {
    const lbl = l === "ru" ? "Активная Вершина" : l === "en" ? "Active Pinnacle" : "Активна Вершина";
    ext.push(`- ${lbl}: ${activePinnacle.number} (вік/age ${activePinnacle.startAge}–${activePinnacle.endAge ?? "∞"})`);
  }
  if (activeChallenge) {
    const lbl = l === "ru" ? "Активный Вызов" : l === "en" ? "Active Challenge" : "Активний Виклик";
    ext.push(`- ${lbl}: ${activeChallenge.number}`);
  }
  if (d.masterPhase) {
    const mp = d.masterPhase;
    const lbl = l === "ru" ? "Мастер-число" : l === "en" ? "Master number" : "Майстер-число";
    const stateRu = mp.currentlyActive ? "активировано" : `активируется в ${mp.activationAge} лет`;
    const stateEn = mp.currentlyActive ? "activated" : `activates at age ${mp.activationAge}`;
    const stateUk = mp.currentlyActive ? "активоване" : `активується у ${mp.activationAge} років`;
    const state = l === "ru" ? stateRu : l === "en" ? stateEn : stateUk;
    ext.push(`- ${lbl} ${mp.masterNumber}/${mp.baseNumber} — ${state}`);
  }
  const extrasBlock = ext.length > 0
    ? (l === "ru" ? "\n\nДополнительные числа:\n" : l === "en" ? "\n\nAdditional numbers:\n" : "\n\nДодаткові числа:\n") + ext.join("\n")
    : "";

  // Build the {{numbersBlock}} (already localized) for the editable template.
  const numbersBlock = l === "ru"
    ? `- Жизненный путь: ${d.lifePath} (${d.lifePathKeyword})
- Судьба: ${d.destiny} (${d.destinyKeyword})
- Число Души: ${d.soul} (${d.soulKeyword})
- Личность: ${d.personality} (${d.personalityKeyword})
- День рождения: ${d.birthday} (${d.birthdayKeyword})
- Личный год: ${d.personalYear} (${d.personalYearKeyword})
- Число Зрелости: ${d.maturity} (${d.maturityKeyword}) — раскрывается после 35
- Число Баланса: ${d.balance} (${d.balanceKeyword}) — стратегия в кризисе
- Кармические уроки: ${karmic}
- Дар Стихии (Hidden Passion): ${d.hiddenPassion} (${d.hiddenPassionKeyword}) — самая частая цифра в имени, врождённый талант`
    : l === "en"
    ? `- Life Path: ${d.lifePath} (${d.lifePathKeyword})
- Destiny: ${d.destiny} (${d.destinyKeyword})
- Soul: ${d.soul} (${d.soulKeyword})
- Personality: ${d.personality} (${d.personalityKeyword})
- Birthday: ${d.birthday} (${d.birthdayKeyword})
- Personal Year: ${d.personalYear} (${d.personalYearKeyword})
- Maturity Number: ${d.maturity} (${d.maturityKeyword}) — awakens after 35
- Balance Number: ${d.balance} (${d.balanceKeyword}) — stress strategy
- Karmic Lessons: ${karmic}
- Gift of the Element (Hidden Passion): ${d.hiddenPassion} (${d.hiddenPassionKeyword}) — most frequent digit in the name, innate talent`
    : `- Шлях: ${d.lifePath} (${d.lifePathKeyword})
- Доля: ${d.destiny} (${d.destinyKeyword})
- Душа: ${d.soul} (${d.soulKeyword})
- Особистість: ${d.personality} (${d.personalityKeyword})
- День народження: ${d.birthday} (${d.birthdayKeyword})
- Особистий рік: ${d.personalYear} (${d.personalYearKeyword})
- Число Зрілості: ${d.maturity} (${d.maturityKeyword}) — розкривається після 35
- Число Балансу: ${d.balance} (${d.balanceKeyword}) — стратегія у кризі
- Карматичні уроки: ${karmic}
- Дар Стихії (Hidden Passion): ${d.hiddenPassion} (${d.hiddenPassionKeyword}) — найчастіша цифра в імені, вроджений талант`;

  return { numbersBlock, extrasBlock };
}

// ── Split AI response into intro + portrait sections ───────────────────────
function splitSections(raw: string): { intro: string; portrait: string } {
  // Remove labels like "intro:" / "portrait:" the model sometimes echoes
  const cleaned = raw
    .replace(/^\s*(intro|introduction)\s*[:：]\s*/im, "")
    .trim();
  // Primary split: --- on its own line (most common with the new prompt)
  const parts = cleaned.split(/\n\s*-{3,}\s*\n/);
  if (parts.length >= 2) {
    return {
      intro:    parts[0].trim(),
      portrait: parts.slice(1).join("\n\n").replace(/^\s*portrait\s*[:：]\s*/i, "").trim(),
    };
  }
  // Fallback: first paragraph = intro, rest = portrait
  const paras = cleaned.split(/\n{2,}/).filter(p => p.trim());
  if (paras.length >= 2) {
    return { intro: paras[0].trim(), portrait: paras.slice(1).join("\n\n").trim() };
  }
  // Last resort: whole thing is portrait, no intro
  return { intro: "", portrait: cleaned };
}

export async function POST(req: NextRequest) {
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for")?.split(",")[0] ?? "unknown";

  // ── Auth gate (Phase В policy) ──────────────────────────────────────────
  // Preview-cookie bypasses the gate entirely (owner iteration).
  // Anonymous users → 401 with auth_required so the UI can offer sign-in.
  // Signed-in users → per-user daily rate limit (not per-IP).
  if (!isPreviewFromRequest(req)) {
    const gate = await requireAiAuth();
    if (gate.deny) return gate.deny;
    if (!checkPerUserDailyRate(userMap, gate.user!.id)) {
      return NextResponse.json(
        { error: "rate_limit", message: "Ліміт 1 синтез на добу вичерпано. Повертайтесь завтра 🌙" },
        { status: 429 }
      );
    }
    void ip; // keep parameter for legacy logging analysis
  }

  try {
    const data = (await req.json()) as SynthesisRequest;

    const { numbersBlock, extrasBlock } = buildPromptVars(data);
    const overrides = (await loadPromptOverrides()) as PromptOverrides | null;
    const tpl = resolvePrompt("numerology-synthesis", overrides);
    const vars = {
      language_name: getLanguageName(data.language),
      name: data.name,
      birthYear: data.birthYear,
      age: data.age,
      numbersBlock,
      extrasBlock,
    };

    const res = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: renderTemplate(tpl.system, vars) },
          { role: "user",   content: renderTemplate(tpl.user, vars) },
        ],
        max_tokens: 1200,
        temperature: 0.8,
      }),
    });

    const json = await res.json();
    const text = (json.choices?.[0]?.message?.content ?? "").trim();
    const { intro, portrait } = splitSections(text);

    // Backward-compat: include `synthesis` = intro+portrait so older UI keeps working.
    const synthesis = intro ? `${intro}\n\n${portrait}` : portrait;
    return NextResponse.json({ intro, portrait, synthesis });
  } catch {
    return NextResponse.json({ error: "synthesis_failed" }, { status: 500 });
  }
}
