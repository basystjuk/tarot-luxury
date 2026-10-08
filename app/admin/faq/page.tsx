"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Plus } from "lucide-react";
import { DEFAULT_FAQ_EN, DEFAULT_FAQ_RU, DEFAULT_FAQ_UK, type FaqItem } from "@/lib/data/faq";
import { useAdminContent } from "@/components/admin/content-context";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  LangTabs,
  MoveDeleteControls,
  Notice,
  PageHeader,
  TextAreaField,
  TextField,
  moveItem,
  useConfirm,
  type Lang,
} from "@/components/admin/ui";

const DEFAULTS: Record<Lang, FaqItem[]> = { uk: DEFAULT_FAQ_UK, ru: DEFAULT_FAQ_RU, en: DEFAULT_FAQ_EN };
const LANG_NAME: Record<Lang, string> = { uk: "українською", ru: "російською", en: "англійською" };
const blank = (v: unknown) => typeof v !== "string" || v.trim() === "";

export default function FaqPage() {
  const { doc, set } = useAdminContent();
  const [lang, setLang] = useState<Lang>("uk");
  const [open, setOpen] = useState<string | null>(null);
  const confirm = useConfirm();

  const listOf = (l: Lang) => ((doc?.[`faq_${l}`] as FaqItem[] | undefined) ?? DEFAULTS[l]);
  const items = listOf(lang);
  const setItems = (next: FaqItem[]) => set(`faq_${lang}`, next);
  const counts = { uk: listOf("uk").length, ru: listOf("ru").length, en: listOf("en").length };
  const uneven = counts.ru !== counts.uk || counts.en !== counts.uk;
  const categories = Array.from(new Set(items.map((f) => f.category).filter(Boolean)));

  const missing: Partial<Record<Lang, boolean>> = {};
  for (const l of ["uk", "ru", "en"] as const) {
    missing[l] = listOf(l).length === 0 || listOf(l).some((f) => blank(f.q) || blank(f.a));
  }

  const add = () => {
    const item: FaqItem = { id: Date.now().toString(), category: categories[0] ?? "", q: "", a: "" };
    setItems([...items, item]);
    setOpen(item.id);
  };

  return (
    <>
      <PageHeader
        title="Питання та відповіді"
        description="Сторінка «Підказки» і розмітка для Google. Для кожної мови — свій список."
        siteHref={`/${lang}/faq`}
        actions={
          <Button onClick={add}>
            <Plus size={16} aria-hidden /> Додати питання
          </Button>
        }
      />

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <LangTabs value={lang} onChange={(l) => { setLang(l); setOpen(null); }} missing={missing} />
        <span className="text-sm text-[var(--muted)]">
          UK {counts.uk} · RU {counts.ru} · EN {counts.en}
        </span>
      </div>

      {uneven && (
        <Notice tone="warning" className="mb-5">
          У мовах різна кількість питань — відвідувачі різними мовами бачать різний FAQ.
        </Notice>
      )}

      {items.length === 0 ? (
        <EmptyState title={`Немає питань ${LANG_NAME[lang]}`} action={<Button onClick={add}><Plus size={16} aria-hidden /> Додати питання</Button>} />
      ) : (
        <div className="space-y-3">
          {items.map((f, i) => {
            const expanded = open === f.id;
            const broken = blank(f.q) || blank(f.a);
            return (
              <Card key={f.id} className="p-0 sm:p-0">
                <div className="flex flex-wrap items-center justify-end gap-x-2 gap-y-1 p-3 sm:flex-nowrap sm:p-4">
                  <button
                    type="button"
                    onClick={() => setOpen(expanded ? null : f.id)}
                    aria-expanded={expanded}
                    className="flex min-h-11 min-w-0 flex-1 basis-56 items-center gap-3 rounded-xl px-1 text-left"
                  >
                    <span className="min-w-0 flex-1">
                      {f.category && <span className="block text-xs uppercase tracking-wider text-[var(--sand-400)]">{f.category}</span>}
                      <span className="block truncate font-medium">{f.q || <em className="text-[var(--muted)]">Без питання</em>}</span>
                    </span>
                    {broken && <Badge tone="danger">Не заповнено</Badge>}
                    {expanded ? <ChevronUp size={18} aria-hidden /> : <ChevronDown size={18} aria-hidden />}
                  </button>
                  <MoveDeleteControls
                    index={i}
                    count={items.length}
                    onMove={(from, to) => setItems(moveItem(items, from, to))}
                    onDelete={async () => {
                      const ok = await confirm({
                        title: "Видалити питання?",
                        description: f.q ? `«${f.q}»` : undefined,
                        confirmLabel: "Видалити",
                      });
                      if (ok) setItems(items.filter((x) => x.id !== f.id));
                    }}
                    deleteLabel="Видалити питання"
                  />
                </div>
                {expanded && (
                  <div className="space-y-4 border-t border-[var(--sand-100)] px-3 pb-4 pt-4 sm:px-4 sm:pb-5">
                    <TextField
                      label="Категорія"
                      value={f.category}
                      onChange={(category) => setItems(items.map((x) => (x.id === f.id ? { ...x, category } : x)))}
                      suggestions={categories}
                      hint="Питання з однаковою категорією групуються на сайті"
                    />
                    <TextField
                      label="Питання"
                      value={f.q}
                      onChange={(q) => setItems(items.map((x) => (x.id === f.id ? { ...x, q } : x)))}
                      required
                      error={blank(f.q) ? "Введіть питання" : null}
                      maxLength={140}
                    />
                    <TextAreaField
                      label="Відповідь"
                      value={f.a}
                      onChange={(a) => setItems(items.map((x) => (x.id === f.id ? { ...x, a } : x)))}
                      required
                      error={blank(f.a) ? "Введіть відповідь" : null}
                      rows={4}
                      maxLength={800}
                    />
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}
