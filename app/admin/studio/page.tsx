"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";
import {
  STUDIO_TOOL_CARDS,
  studioOverridesFrom,
  studioToolTexts,
  type StudioToolOverride,
  type StudioToolTexts,
} from "@/lib/data/studio-tools";
import { TOOL_LABELS } from "@/lib/tools-config";
import { useContentKey } from "@/components/admin/content-context";
import { Badge, Button, Card, LangTabs, PageHeader, TextAreaField, TextField, type Lang } from "@/components/admin/ui";

const LANG_LABEL: Record<Lang, string> = { uk: "UK", ru: "RU", en: "EN" };
const TEXT_KEYS = ["title_uk", "title_ru", "title_en", "desc_uk", "desc_ru", "desc_en"] as const;

export default function StudioTextsPage() {
  const [overrides, setOverrides] = useContentKey<StudioToolOverride[]>("studio_tools", []);
  const [lang, setLang] = useState<Lang>("uk");

  // Texts as edited: a stored override is shown as-is (an emptied field stays
  // empty while typing — the site then falls back to the default text).
  // Saving keeps only the tools whose texts differ from the defaults.
  const texts: Record<string, StudioToolTexts> = {};
  for (const card of STUDIO_TOOL_CARDS) {
    const ov = overrides.find((o) => o.id === card.id);
    const own = {} as StudioToolTexts;
    for (const k of TEXT_KEYS) own[k] = ov ? (ov[k] ?? card[k]) : card[k];
    texts[card.id] = own;
  }
  const changed = new Set(studioOverridesFrom(texts).map((o) => o.id));

  const update = (id: string, patch: Partial<StudioToolTexts>) => {
    setOverrides(studioOverridesFrom({ ...texts, [id]: { ...texts[id], ...patch } }));
  };
  const reset = (id: string) => setOverrides(studioOverridesFrom({ ...texts, [id]: studioToolTexts(STUDIO_TOOL_CARDS.find((c) => c.id === id)!, null) }));

  return (
    <>
      <PageHeader
        title="Тексти Студії"
        description="Назви та описи карток усіх 8 інструментів на сторінці Soul Studio. Змінені тексти позначено; «Повернути стандартний» скидає до тексту з коду."
        siteHref={`/${lang}/studio`}
      />
      <div className="mb-5">
        <LangTabs value={lang} onChange={setLang} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {STUDIO_TOOL_CARDS.map((card) => {
          const t = texts[card.id];
          const titleKey = `title_${lang}` as keyof StudioToolTexts;
          const descKey = `desc_${lang}` as keyof StudioToolTexts;
          return (
            <Card
              key={card.id}
              title={
                <span className="flex items-center gap-2">
                  <span aria-hidden>{card.glyph}</span>
                  {TOOL_LABELS[card.id].uk}
                </span>
              }
              actions={
                changed.has(card.id) ? (
                  <>
                    <Badge tone="gold">Змінено</Badge>
                    <Button variant="ghost" size="sm" onClick={() => reset(card.id)}>
                      <RotateCcw size={14} aria-hidden /> Повернути стандартний
                    </Button>
                  </>
                ) : (
                  <Badge tone="muted">Стандартний текст</Badge>
                )
              }
              className="space-y-4"
            >
              <TextField
                label={`Назва (${LANG_LABEL[lang]})`}
                value={t[titleKey]}
                onChange={(v) => update(card.id, { [titleKey]: v })}
                maxLength={40}
                hint="Порожнє поле — на сайті буде стандартний текст"
              />
              <TextAreaField
                label={`Опис (${LANG_LABEL[lang]})`}
                value={t[descKey]}
                onChange={(v) => update(card.id, { [descKey]: v })}
                rows={3}
                maxLength={220}
              />
            </Card>
          );
        })}
      </div>
    </>
  );
}
