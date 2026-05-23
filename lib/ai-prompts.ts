/**
 * AI prompt registry.
 *
 * Each Groq-backed tool has a System prompt + a User prompt template. Both
 * are admin-editable from the admin panel; defaults live here.
 *
 * IMPORTANT — split of concerns:
 *   - The TEMPLATE (system+user) controls AI voice, structure, instructions.
 *     Edited freely from admin.
 *   - The VARIABLES ({{cardName}}, {{numbersBlock}}, …) are assembled by the
 *     server route from request data. The route owns the data plumbing —
 *     admin cannot break it. If the admin removes a required variable from
 *     the template, the validator warns at save time.
 *
 * Output language is controlled by `{{language_name}}` ("Ukrainian" /
 * "Russian" / "English"). All static instructions live in the template; the
 * AI translates its response into `{{language_name}}` per the directive.
 */

export type PromptToolId =
  | "tarot-reading"
  | "numerology-synthesis"
  | "moon-reading"
  | "compatibility-reading";

export const ALL_PROMPT_TOOL_IDS: PromptToolId[] = [
  "tarot-reading",
  "numerology-synthesis",
  "moon-reading",
  "compatibility-reading",
];

export interface PromptDefinition {
  /** Human-readable label for admin UI. */
  label: string;
  /** What this prompt powers — shown above the editor. */
  description: string;
  /** Variables the route injects. Must appear in the template (warn if missing). */
  variables: { name: string; description: string; required: boolean }[];
  /** Default System message. */
  defaultSystem: string;
  /** Default User message template. */
  defaultUser: string;
}

export interface PromptOverride {
  system?: string;
  user?: string;
}

export type PromptOverrides = Partial<Record<PromptToolId, PromptOverride>>;

const LANG_NAME: Record<string, string> = {
  uk: "Ukrainian",
  ru: "Russian",
  en: "English",
};

export function getLanguageName(lang: string): string {
  return LANG_NAME[lang] || "Ukrainian";
}

/**
 * Replace `{{key}}` with `vars[key]`. Missing keys collapse to empty string
 * rather than leaving a literal `{{name}}` in the prompt — fail-soft so a
 * removed variable degrades gracefully.
 */
export function renderTemplate(template: string, vars: Record<string, string | number | undefined>): string {
  return template.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key) => {
    const v = vars[key];
    return v === undefined || v === null ? "" : String(v);
  });
}

/**
 * Pick the effective system+user, falling back to defaults for any missing piece.
 */
export function resolvePrompt(id: PromptToolId, overrides: PromptOverrides | undefined | null): { system: string; user: string } {
  const def = DEFAULT_PROMPTS[id];
  const ov = overrides?.[id];
  return {
    system: ov?.system?.trim() ? ov.system : def.defaultSystem,
    user: ov?.user?.trim() ? ov.user : def.defaultUser,
  };
}

/** Validate that an override keeps every required variable. */
export function validatePromptOverride(id: PromptToolId, override: PromptOverride): { ok: boolean; missing: string[] } {
  const def = DEFAULT_PROMPTS[id];
  const combined = `${override.system ?? ""}\n${override.user ?? ""}`;
  const missing = def.variables
    .filter((v) => v.required && !combined.includes(`{{${v.name}}}`))
    .map((v) => v.name);
  return { ok: missing.length === 0, missing };
}

// ──────────────────────────────────────────────────────────────────────────
// DEFAULTS — one prompt per tool, language directed by {{language_name}}.
// Editing here changes the fallback only — admin overrides win at runtime.
// ──────────────────────────────────────────────────────────────────────────

const COMMON_LANG = `Write your entire response in {{language_name}}. Do not use any other language, alphabet or script except where explicitly noted.`;

export const DEFAULT_PROMPTS: Record<PromptToolId, PromptDefinition> = {
  "tarot-reading": {
    label: "Карта дня (Таро)",
    description: "Інтерпретація однієї карти Рйадера-Уайта. Викликається коли користувач відкриває карту дня.",
    variables: [
      { name: "language_name", description: "Мова відповіді: Ukrainian / Russian / English.", required: true },
      { name: "cardName", description: "Назва карти в оригіналі (англ.), напр. \"The Empress\".", required: true },
      { name: "arcanaContext", description: "Готове речення про тип аркана (Старший/Молодший + масть/стихія) в мові відповіді.", required: true },
    ],
    defaultSystem: `You are an expert tarot reader with deep knowledge of Rider-Waite-Smith symbolism and classical Tarot interpretation. Your voice is warm, feminine, poetic and intimate.

${COMMON_LANG} The card name "{{cardName}}" stays in its original English form.`,
    defaultUser: `The drawn card is "{{cardName}}" (upright). {{arcanaContext}}

Interpret it using classical Rider-Waite-Smith symbolism — the imagery, colours and figures in the card.

Write your reply in {{language_name}}. Structure: three paragraphs separated by blank lines. No headers, no greetings, no preamble.

1) MEANING (2–3 sentences). The card's classical Rider-Waite energy. Begin directly with the interpretation — do NOT start with phrases like "this card tells me" or "this card speaks". Honour the arcana type stated above.
2) ADVICE (1–2 sentences). A soulful, concrete nudge for today.
3) AFFIRMATION (ONE short sentence, NO MORE THAN 15 WORDS, starts with the first-person pronoun in the response language — "I" / "Я" — directly tied to the energy of "{{cardName}}").

Style: intimate, poetic, mystical. The card name "{{cardName}}" stays in its original English form.`,
  },

  "numerology-synthesis": {
    label: "Нумерологія (синтез портрета)",
    description: "Цілісний нумерологічний портрет на основі 18+ чисел. Викликається після введення дати+ПІБ.",
    variables: [
      { name: "language_name", description: "Мова відповіді.", required: true },
      { name: "name", description: "Ім'я людини.", required: true },
      { name: "birthYear", description: "Рік народження.", required: true },
      { name: "age", description: "Вік (років).", required: true },
      { name: "numbersBlock", description: "Готовий список усіх чисел з ключовими словами в мові відповіді.", required: true },
      { name: "extrasBlock", description: "Додатковий блок (активна Вершина, Виклик, майстер-числа). Може бути порожнім.", required: false },
    ],
    defaultSystem: `You are a numerologist. Write personalised numerological portraits. Style: warm, insightful, specific. Look for tensions and harmonies between the numbers. Address the person directly as "you". No generic phrases. No advice to seek professional help.

${COMMON_LANG}

IMPORTANT: your response has two sections separated by a line containing only three dashes (\`---\`).
- First section (intro): exactly 2 short sentences in the format: "{Name}, you came into this world as [archetype]. Today is the time for: [3 key themes, comma-separated]."
- Second section (portrait): 6–8 sentences of a living numerological portrait.`,
    defaultUser: `Analyse the numerological portrait of {{name}} (birth year: {{birthYear}}, age: {{age}}).

Numbers:
{{numbersBlock}}{{extrasBlock}}

Response structure (STRICT, write in {{language_name}}):

intro: 2 sentences in the format: "{{name}}, you came into this world as [archetype]. Today is the time for: [3 themes, comma-separated]."
---
portrait: 6–8 sentences of a living portrait. Honour the age ({{age}}), the active Pinnacle and Challenge, master numbers if present. Address as "you". Do not list data — produce a unified portrait.`,
  },

  "moon-reading": {
    label: "Місячний провідник (послання)",
    description: "Поетичне послання за поточним станом Місяця для одного з трьох контекстів (natal / today / future).",
    variables: [
      { name: "language_name", description: "Мова відповіді.", required: true },
      { name: "moonDegree", description: "Градус Місяця в знаку.", required: true },
      { name: "moonSign", description: "Знак Місяця в мові відповіді.", required: true },
      { name: "phaseName", description: "Назва фази в мові відповіді (напр. \"Новий Місяць\").", required: true },
      { name: "illumination", description: "Відсоток освітлення (число).", required: true },
      { name: "contextDirective", description: "Готова директива для natal / today / future у мові відповіді.", required: true },
      { name: "sunBlock", description: "Опційний блок про Сонце (порожній якщо не задано).", required: false },
      { name: "extraBlock", description: "Опційний блок (темний місяць / void / вузли / Ліліт).", required: false },
    ],
    defaultSystem: `You are an expert lunar astrologer — perceptive, poetic, feminine, mystical. You know lunar astrology at professional depth: phases, signs, degrees, void of course, nodes, Lilith, dark moon. Your readings are never generic: search for nuance, avoid clichés, name the unexpected angle.

${COMMON_LANG}`,
    defaultUser: `The Moon is at {{moonDegree}}° {{moonSign}} in the {{phaseName}} phase ({{illumination}}% illumination).{{sunBlock}}{{extraBlock}}

{{contextDirective}}

Write the message in {{language_name}}, in 3 paragraphs (no headers, no bullet points, no greeting):

1) ENERGY (2 sentences — the precise quality of {{moonDegree}}° {{moonSign}} in this phase: name the specific archetype, tension or gift active right now; go deeper than "this is a time for…").
2) CONCRETE ADVICE (1–2 sentences — name ONE specific ritual or action appropriate exactly for this phase in this sign; AVOID banalities like "meditate", "journal", "breathe deeply").
3) AFFIRMATION (ONE short sentence, ≤15 words, starts with the first-person pronoun of the response language — "I" / "Я" — directly tied to {{moonDegree}}° {{moonSign}}).`,
  },

  "compatibility-reading": {
    label: "Карта сумісності",
    description: "Аналіз сумісності двох людей з усіма доступними астро+нумеро даними.",
    variables: [
      { name: "language_name", description: "Мова відповіді.", required: true },
      { name: "name1", description: "Ім'я першої людини.", required: true },
      { name: "name2", description: "Ім'я другої людини.", required: true },
      { name: "relType", description: "romantic / business / friendship.", required: true },
      { name: "dataBlock", description: "Готовий повний блок даних пари (знаки, числа, Венери, Марси, Ло Шу і т.д.) у мові відповіді.", required: true },
      { name: "relDirective", description: "Готова директива для типу зв'язку (Венера-Марс динаміка / лідер-виконавець / цінності).", required: true },
    ],
    defaultSystem: `You are a high-level astrologer and numerologist. You analyse the compatibility of two people holistically: western astrology (synastry, composite), Pythagorean numerology, Chinese Lo Shu, soul aspects. Style: specific, insightful, no clichés. Adapt depth and tone to the type of connection.

${COMMON_LANG}`,
    defaultUser: `Analyse the compatibility of two people. Type of connection: {{relType}}.

{{dataBlock}}

{{relDirective}}

Write a compatibility analysis in {{language_name}} (6–7 sentences). Show how their elements, modalities, numbers and (if present) Moons / Venuses / Marses interact. What strengthens the attraction, what creates tension, what is their strength as a pair. Address them directly. Give a unified portrait — do NOT list data back at the reader.`,
  },
};
