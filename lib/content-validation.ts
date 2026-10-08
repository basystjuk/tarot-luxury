/**
 * Checks on the site content document before it is saved from the admin.
 *
 * "error"   — would visibly break the site (empty service name, FAQ entry
 *             without an answer, a link that can't open) → blocks saving.
 * "warning" — worth fixing but not broken (missing translation, prompt
 *             without a required variable) → shown, doesn't block.
 * Pure — used by the admin editor and its dashboard.
 */

import type { OrgItem, ServiceItem } from "./data/services";
import { ALL_PROMPT_TOOL_IDS, DEFAULT_PROMPTS, validatePromptOverride, type PromptOverrides } from "./ai-prompts";

export type ContentSection = "services" | "faq" | "about" | "contacts" | "celebration" | "prompts" | "testimonials";

export interface ContentIssue {
  severity: "error" | "warning";
  section: ContentSection;
  message: string;
}

type FaqItem = { id: string; category: string; q: string; a: string };
type Testimonial = { name?: string; text_uk?: string; text_ru?: string; text_en?: string; visible?: boolean };

const blank = (v: unknown) => typeof v !== "string" || v.trim() === "";
const LANG_NAME = { uk: "українською", ru: "російською", en: "англійською" } as const;

function isOpenableUrl(v: string): boolean {
  try {
    const u = new URL(v);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}

export function validateContent(doc: Record<string, unknown>): ContentIssue[] {
  const issues: ContentIssue[] = [];
  const add = (severity: ContentIssue["severity"], section: ContentSection, message: string) =>
    issues.push({ severity, section, message });

  // Services & prices
  const services = (Array.isArray(doc.services) ? doc.services : []) as ServiceItem[];
  services.forEach((s, i) => {
    const name = s.title_uk?.trim() || `Послуга №${i + 1}`;
    if (blank(s.title_uk)) add("error", "services", `Послуга №${i + 1}: немає назви українською`);
    if (blank(s.price)) add("error", "services", `«${name}»: не вказана ціна`);
    for (const lang of ["ru", "en"] as const) {
      if (blank(s[`title_${lang}`]) || blank(s[`desc_${lang}`])) add("warning", "services", `«${name}»: не перекладено ${LANG_NAME[lang]}`);
    }
  });
  const org = (Array.isArray(doc.org) ? doc.org : []) as OrgItem[];
  org.forEach((o, i) => {
    if (blank(o.text_uk)) add("error", "services", `Організаційний пункт №${i + 1}: порожній текст українською`);
  });

  // FAQ (separate list per language)
  const faq = {
    uk: (Array.isArray(doc.faq_uk) ? doc.faq_uk : []) as FaqItem[],
    ru: (Array.isArray(doc.faq_ru) ? doc.faq_ru : []) as FaqItem[],
    en: (Array.isArray(doc.faq_en) ? doc.faq_en : []) as FaqItem[],
  };
  for (const lang of ["uk", "ru", "en"] as const) {
    faq[lang].forEach((f, i) => {
      if (blank(f.q) || blank(f.a)) add("error", "faq", `FAQ (${lang.toUpperCase()}) №${i + 1}: потрібні і питання, і відповідь`);
    });
  }
  if (faq.ru.length !== faq.uk.length || faq.en.length !== faq.uk.length) {
    add("warning", "faq", `Різна кількість питань: UK ${faq.uk.length} · RU ${faq.ru.length} · EN ${faq.en.length}`);
  }

  // About (the home page and About page show these texts as-is)
  const about = (doc.about ?? {}) as Record<string, unknown>;
  for (const lang of ["uk", "ru", "en"] as const) {
    if (blank(about[`story_text_${lang}`])) add("warning", "about", `«Моя історія»: порожній текст ${LANG_NAME[lang]}`);
  }

  // Contacts
  const contacts = (doc.contacts ?? {}) as Record<string, unknown>;
  for (const key of ["telegram_url", "whatsapp_url", "instagram_url"] as const) {
    const v = contacts[key];
    if (typeof v === "string" && v.trim() && !isOpenableUrl(v.trim())) {
      add("error", "contacts", `Посилання «${key.replace("_url", "")}» має починатися з https://`);
    }
  }

  // Celebration window
  const cel = (doc.celebration ?? {}) as { startDate?: string; endDate?: string };
  if (cel.startDate && cel.endDate && cel.startDate > cel.endDate) {
    add("error", "celebration", "Свято: дата початку пізніше за дату кінця");
  }

  // AI prompts — required variables
  const prompts = (doc.ai_prompts ?? {}) as PromptOverrides;
  for (const id of ALL_PROMPT_TOOL_IDS) {
    const ov = prompts[id];
    if (!ov || (blank(ov.system) && blank(ov.user))) continue;
    const def = DEFAULT_PROMPTS[id];
    const { ok, missing } = validatePromptOverride(id, {
      system: ov.system?.trim() ? ov.system : def.defaultSystem,
      user: ov.user?.trim() ? ov.user : def.defaultUser,
    });
    if (!ok) add("warning", "prompts", `Промт «${def.label}»: бракує ${missing.map((m) => `{{${m}}}`).join(", ")}`);
  }

  // Testimonials (not shown on the site at the moment, but keep them sane)
  const testimonials = (Array.isArray(doc.testimonials) ? doc.testimonials : []) as Testimonial[];
  testimonials.forEach((t, i) => {
    if (blank(t.name)) add("error", "testimonials", `Відгук №${i + 1}: немає імені`);
    if (blank(t.text_uk) && blank(t.text_ru)) add("error", "testimonials", `Відгук №${i + 1}: немає тексту`);
  });

  return issues;
}
