"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Plus, Star } from "lucide-react";
import type { Testimonial } from "@/lib/data/testimonials";
import InactiveNotice from "@/components/admin/InactiveNotice";
import { useContentKey } from "@/components/admin/content-context";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  LangTabs,
  MoveDeleteControls,
  PageHeader,
  SelectField,
  Switch,
  TextAreaField,
  TextField,
  moveItem,
  useConfirm,
  type Lang,
} from "@/components/admin/ui";

const blank = (v: unknown) => typeof v !== "string" || v.trim() === "";

export default function TestimonialsPage() {
  const [items, setItems] = useContentKey<Testimonial[]>("testimonials", []);
  const [open, setOpen] = useState<string | null>(null);
  const [lang, setLang] = useState<Lang>("uk");
  const confirm = useConfirm();

  const update = (t: Testimonial) => setItems(items.map((x) => (x.id === t.id ? t : x)));
  const add = () => {
    const t: Testimonial = { id: Date.now().toString(), text_uk: "", text_ru: "", text_en: "", name: "", city: "", rating: 5, visible: true };
    setItems([...items, t]);
    setOpen(t.id);
  };

  return (
    <>
      <PageHeader
        title="Відгуки"
        badge={<Badge tone="muted">Не відображається на сайті</Badge>}
        actions={<Button onClick={add}><Plus size={16} aria-hidden /> Додати відгук</Button>}
      />
      <InactiveNotice>Секцію відгуків прибрали з головної сторінки 23.05.2026.</InactiveNotice>

      {items.length === 0 ? (
        <EmptyState icon={<Star size={32} />} title="Відгуків ще немає" action={<Button onClick={add}><Plus size={16} aria-hidden /> Додати відгук</Button>} />
      ) : (
        <div className="space-y-3">
          {items.map((t, i) => {
            const expanded = open === t.id;
            const textKey = `text_${lang}` as "text_uk" | "text_ru" | "text_en";
            return (
              <Card key={t.id} className="p-0 sm:p-0">
                <div className="flex flex-wrap items-center justify-end gap-x-2 gap-y-1 p-3 sm:flex-nowrap sm:p-4">
                  <button
                    type="button"
                    onClick={() => setOpen(expanded ? null : t.id)}
                    aria-expanded={expanded}
                    className="flex min-h-11 min-w-0 flex-1 basis-56 items-center gap-3 rounded-xl px-1 text-left"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">{t.name || <em className="text-[var(--muted)]">Без імені</em>}</span>
                      <span className="block truncate text-xs text-[var(--muted)]">{"★".repeat(t.rating)} {t.city}</span>
                    </span>
                    {!t.visible && <Badge tone="muted">Сховано</Badge>}
                    {expanded ? <ChevronUp size={18} aria-hidden /> : <ChevronDown size={18} aria-hidden />}
                  </button>
                  <Switch checked={t.visible} onChange={(visible) => update({ ...t, visible })} label="Показувати відгук" />
                  <MoveDeleteControls
                    index={i}
                    count={items.length}
                    onMove={(from, to) => setItems(moveItem(items, from, to))}
                    onDelete={async () => {
                      const ok = await confirm({ title: "Видалити відгук?", description: t.name ? `Відгук від ${t.name}` : undefined, confirmLabel: "Видалити" });
                      if (ok) setItems(items.filter((x) => x.id !== t.id));
                    }}
                    deleteLabel="Видалити відгук"
                  />
                </div>
                {expanded && (
                  <div className="space-y-4 border-t border-[var(--sand-100)] px-3 pb-4 pt-4 sm:px-4 sm:pb-5">
                    <div className="grid gap-4 sm:grid-cols-3">
                      <TextField label="Імʼя" value={t.name} onChange={(name) => update({ ...t, name })} required error={blank(t.name) ? "Вкажіть імʼя" : null} placeholder="Марія К." />
                      <TextField label="Місто" value={t.city} onChange={(city) => update({ ...t, city })} placeholder="Київ" />
                      <SelectField
                        label="Оцінка"
                        value={String(t.rating)}
                        onChange={(v) => update({ ...t, rating: Number(v) })}
                        options={[5, 4, 3, 2, 1].map((n) => ({ value: String(n), label: `${"★".repeat(n)} (${n})` }))}
                      />
                    </div>
                    <LangTabs
                      value={lang}
                      onChange={setLang}
                      missing={{ uk: blank(t.text_uk), ru: blank(t.text_ru), en: blank(t.text_en) }}
                    />
                    <TextAreaField
                      label={`Текст відгуку (${lang.toUpperCase()})`}
                      value={t[textKey] ?? ""}
                      onChange={(v) => update({ ...t, [textKey]: v })}
                      rows={4}
                      maxLength={600}
                      hint={lang === "en" ? "Якщо порожньо — англомовні відвідувачі побачать український текст." : undefined}
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
