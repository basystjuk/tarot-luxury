import { NextRequest, NextResponse } from "next/server";
import { renderTemplate, resolvePrompt, getLanguageName, type PromptOverrides } from "@/lib/ai-prompts";
import { loadPromptOverrides } from "@/lib/server-content";

export const maxDuration = 30;

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

interface CompatibilityRequest {
  language: "uk" | "ru" | "en";
  // Person 1
  name1: string; sign1: string; element1: string; modality1: string; birthDate1: string;
  lifePath1: number; lpKeyword1: string;
  destiny1: number; destKeyword1: string;
  soul1: number; soulKeyword1: string;
  moonSign1?: string;   // optional, if birth time provided
  venusSign1?: string;
  marsSign1?: string;
  // Person 2
  name2: string; sign2: string; element2: string; modality2: string; birthDate2: string;
  lifePath2: number; lpKeyword2: string;
  destiny2: number; destKeyword2: string;
  soul2: number; soulKeyword2: string;
  moonSign2?: string;
  venusSign2?: string;
  marsSign2?: string;
  // Pair-level
  zodiacAspect: string; zodiacScore: number;
  elemInteraction: string;
  modalityInteraction: string;
  relType: "romantic" | "business" | "friendship";
  birthTimeProvided: boolean;
  // Composite
  compositeSunSign?: string;
  compositeMoonSign?: string;
  // Soul mate / karmic
  soulMateAspects?: string[];
  karmicMatch?: string;
  // Lo Shu
  loShuPair?: string;
}

/**
 * Build localized `dataBlock` + `relDirective` for the editable template.
 * Admin tweaks the surrounding instructions; the data structure stays here.
 */
function buildPromptVars(d: CompatibilityRequest): { dataBlock: string; relDirective: string } {
  const { language: l } = d;
  const relTypeRu = d.relType === "romantic" ? "романтическая пара" : d.relType === "business" ? "деловые партнёры" : "друзья";
  const relTypeUk = d.relType === "romantic" ? "романтична пара" : d.relType === "business" ? "ділові партнери" : "друзі";
  const relTypeEn = d.relType === "romantic" ? "romantic couple" : d.relType === "business" ? "business partners" : "friends";

  // Destiny match
  const destCompareRu = d.destiny1 === d.destiny2
    ? `Числа Судьбы совпадают (${d.destiny1}) — схожие жизненные задачи и ценности`
    : `Числа Судьбы: ${d.name1} — ${d.destiny1} (${d.destKeyword1}), ${d.name2} — ${d.destiny2} (${d.destKeyword2})`;
  const destCompareUk = d.destiny1 === d.destiny2
    ? `Числа Долі збігаються (${d.destiny1}) — схожі життєві задачі та цінності`
    : `Числа Долі: ${d.name1} — ${d.destiny1} (${d.destKeyword1}), ${d.name2} — ${d.destiny2} (${d.destKeyword2})`;
  const destCompareEn = d.destiny1 === d.destiny2
    ? `Destiny numbers match (${d.destiny1}) — similar life tasks and values`
    : `Destiny numbers: ${d.name1} — ${d.destiny1} (${d.destKeyword1}), ${d.name2} — ${d.destiny2} (${d.destKeyword2})`;

  // Moon / Venus / Mars blocks — only when time provided
  const moonBlockUk = d.birthTimeProvided && d.moonSign1 && d.moonSign2 ? `\nМісяці (емоції): ${d.name1} — ${d.moonSign1}, ${d.name2} — ${d.moonSign2}` : "";
  const moonBlockRu = d.birthTimeProvided && d.moonSign1 && d.moonSign2 ? `\nЛуны (эмоции): ${d.name1} — ${d.moonSign1}, ${d.name2} — ${d.moonSign2}` : "";
  const moonBlockEn = d.birthTimeProvided && d.moonSign1 && d.moonSign2 ? `\nMoons (emotion): ${d.name1} — ${d.moonSign1}, ${d.name2} — ${d.moonSign2}` : "";

  const venusBlockUk = d.venusSign1 && d.venusSign2 ? `\nВенери (як любить): ${d.name1} — ${d.venusSign1}, ${d.name2} — ${d.venusSign2}` : "";
  const venusBlockRu = d.venusSign1 && d.venusSign2 ? `\nВенеры (как любит): ${d.name1} — ${d.venusSign1}, ${d.name2} — ${d.venusSign2}` : "";
  const venusBlockEn = d.venusSign1 && d.venusSign2 ? `\nVenuses (how they love): ${d.name1} — ${d.venusSign1}, ${d.name2} — ${d.venusSign2}` : "";

  const marsBlockUk = d.marsSign1 && d.marsSign2 ? `\nМарси (як діє/жадає): ${d.name1} — ${d.marsSign1}, ${d.name2} — ${d.marsSign2}` : "";
  const marsBlockRu = d.marsSign1 && d.marsSign2 ? `\nМарсы (как действует/желает): ${d.name1} — ${d.marsSign1}, ${d.name2} — ${d.marsSign2}` : "";
  const marsBlockEn = d.marsSign1 && d.marsSign2 ? `\nMarses (how they act/desire): ${d.name1} — ${d.marsSign1}, ${d.name2} — ${d.marsSign2}` : "";

  const compositeBlockUk = d.compositeSunSign ? `\nКомпозит (карта пари як єдиної сутності): Сонце — ${d.compositeSunSign}${d.compositeMoonSign ? `, Місяць — ${d.compositeMoonSign}` : ""}` : "";
  const compositeBlockRu = d.compositeSunSign ? `\nКомпозит (карта пары как единой сущности): Солнце — ${d.compositeSunSign}${d.compositeMoonSign ? `, Луна — ${d.compositeMoonSign}` : ""}` : "";
  const compositeBlockEn = d.compositeSunSign ? `\nComposite (the pair as a single entity): Sun — ${d.compositeSunSign}${d.compositeMoonSign ? `, Moon — ${d.compositeMoonSign}` : ""}` : "";

  const soulMateBlockUk = d.soulMateAspects && d.soulMateAspects.length > 0 ? `\nSoul Mate аспекти (за Liндою Goodman): ${d.soulMateAspects.join(", ")}` : "";
  const soulMateBlockRu = d.soulMateAspects && d.soulMateAspects.length > 0 ? `\nSoul Mate аспекты (по Линде Гудман): ${d.soulMateAspects.join(", ")}` : "";
  const soulMateBlockEn = d.soulMateAspects && d.soulMateAspects.length > 0 ? `\nSoul Mate aspects (Linda Goodman): ${d.soulMateAspects.join(", ")}` : "";

  const karmicBlockUk = d.karmicMatch ? `\nКарматичний матч: ${d.karmicMatch}` : "";
  const karmicBlockRu = d.karmicMatch ? `\nКармический матч: ${d.karmicMatch}` : "";
  const karmicBlockEn = d.karmicMatch ? `\nKarmic match: ${d.karmicMatch}` : "";

  const loShuBlockUk = d.loShuPair ? `\nКитайська Ло Шу (квадрат пари): ${d.loShuPair}` : "";
  const loShuBlockRu = d.loShuPair ? `\nКитайская Ло Шу (квадрат пары): ${d.loShuPair}` : "";
  const loShuBlockEn = d.loShuPair ? `\nChinese Lo Shu (couple square): ${d.loShuPair}` : "";

  // Rel-type specific directives
  const relDirectiveUk = d.relType === "romantic"
    ? "ОБОВ'ЯЗКОВО згадай динаміку Венери та Марса в термінах «вона дає — він приймає» або навпаки, хто ініціатор, хто магнетизує."
    : d.relType === "business"
    ? "ОБОВ'ЯЗКОВО назви хто з них керівник, хто виконавець — спираючись на модальності (Кардинальний = ініціатива, Фіксований = стабільність/реалізація, Мутабельний = адаптація/координація)."
    : "Підкресли що їх єднає на рівні цінностей і чим вони збагачують одне одного.";
  const relDirectiveRu = d.relType === "romantic"
    ? "ОБЯЗАТЕЛЬНО упомяни динамику Венеры и Марса в терминах «она даёт — он принимает» или наоборот, кто инициатор, кто магнетизирует."
    : d.relType === "business"
    ? "ОБЯЗАТЕЛЬНО назови кто из них руководитель, кто исполнитель — опираясь на модальности (Кардинальный = инициатива, Фиксированный = стабильность/реализация, Мутабельный = адаптация/координация)."
    : "Подчеркни что их объединяет на уровне ценностей и чем они обогащают друг друга.";
  const relDirectiveEn = d.relType === "romantic"
    ? "MUST mention the Venus–Mars dynamic in terms of 'she gives — he receives' or vice versa, who initiates, who magnetises."
    : d.relType === "business"
    ? "MUST name which of them is the leader and which is the executor — based on modalities (Cardinal = initiative, Fixed = stability/execution, Mutable = adaptation/coordination)."
    : "Emphasise what unites them at the level of values and how they enrich each other.";

  const dataBlock = l === "ru"
    ? `${d.name1} (д.р. ${d.birthDate1}): ${d.sign1} (${d.element1}, ${d.modality1}), Жизненный путь ${d.lifePath1} (${d.lpKeyword1}), Душа ${d.soul1} (${d.soulKeyword1})
${d.name2} (д.р. ${d.birthDate2}): ${d.sign2} (${d.element2}, ${d.modality2}), Жизненный путь ${d.lifePath2} (${d.lpKeyword2}), Душа ${d.soul2} (${d.soulKeyword2})

${destCompareRu}${moonBlockRu}${venusBlockRu}${marsBlockRu}${compositeBlockRu}${soulMateBlockRu}${karmicBlockRu}${loShuBlockRu}

Астрологический аспект Солнц: ${d.zodiacAspect} (оценка ${d.zodiacScore}/5)
Взаимодействие стихий: ${d.elemInteraction}
Модальности: ${d.modalityInteraction}
Тип связи: ${relTypeRu}`
    : l === "en"
    ? `${d.name1} (born ${d.birthDate1}): ${d.sign1} (${d.element1}, ${d.modality1}), Life Path ${d.lifePath1} (${d.lpKeyword1}), Soul ${d.soul1} (${d.soulKeyword1})
${d.name2} (born ${d.birthDate2}): ${d.sign2} (${d.element2}, ${d.modality2}), Life Path ${d.lifePath2} (${d.lpKeyword2}), Soul ${d.soul2} (${d.soulKeyword2})

${destCompareEn}${moonBlockEn}${venusBlockEn}${marsBlockEn}${compositeBlockEn}${soulMateBlockEn}${karmicBlockEn}${loShuBlockEn}

Sun aspect: ${d.zodiacAspect} (score ${d.zodiacScore}/5)
Elemental interaction: ${d.elemInteraction}
Modalities: ${d.modalityInteraction}
Type of connection: ${relTypeEn}`
    : `${d.name1} (н.д. ${d.birthDate1}): ${d.sign1} (${d.element1}, ${d.modality1}), Шлях ${d.lifePath1} (${d.lpKeyword1}), Душа ${d.soul1} (${d.soulKeyword1})
${d.name2} (н.д. ${d.birthDate2}): ${d.sign2} (${d.element2}, ${d.modality2}), Шлях ${d.lifePath2} (${d.lpKeyword2}), Душа ${d.soul2} (${d.soulKeyword2})

${destCompareUk}${moonBlockUk}${venusBlockUk}${marsBlockUk}${compositeBlockUk}${soulMateBlockUk}${karmicBlockUk}${loShuBlockUk}

Астрологічний аспект Сонць: ${d.zodiacAspect} (оцінка ${d.zodiacScore}/5)
Взаємодія стихій: ${d.elemInteraction}
Модальності: ${d.modalityInteraction}
Тип зв'язку: ${relTypeUk}`;

  const relDirective = l === "ru" ? relDirectiveRu : l === "en" ? relDirectiveEn : relDirectiveUk;
  return { dataBlock, relDirective };
}

export async function POST(req: NextRequest) {
  try {
    const data = (await req.json()) as CompatibilityRequest;

    const { dataBlock, relDirective } = buildPromptVars(data);
    const overrides = (await loadPromptOverrides()) as PromptOverrides | null;
    const tpl = resolvePrompt("compatibility-reading", overrides);
    const vars = {
      language_name: getLanguageName(data.language),
      name1: data.name1,
      name2: data.name2,
      relType: data.relType,
      dataBlock,
      relDirective,
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
        max_tokens: 800,
        temperature: 0.85,
      }),
    });

    const json = await res.json();
    const text = json.choices?.[0]?.message?.content?.trim() ?? "";
    return NextResponse.json({ analysis: text });
  } catch {
    return NextResponse.json({ error: "analysis_failed" }, { status: 500 });
  }
}
