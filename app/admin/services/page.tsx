"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Plus, X } from "lucide-react";
import { DEFAULT_ORG, DEFAULT_SERVICES, type OrgItem, type ServiceItem } from "@/lib/data/services";
import { useContentKey } from "@/components/admin/content-context";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  IconButton,
  LangTabs,
  MoveDeleteControls,
  PageHeader,
  TextAreaField,
  TextField,
  moveItem,
  useConfirm,
  type Lang,
} from "@/components/admin/ui";

const LANG_LABEL: Record<Lang, string> = { uk: "UK", ru: "RU", en: "EN" };
const blank = (v: unknown) => typeof v !== "string" || v.trim() === "";

function missingLangs(s: ServiceItem): Partial<Record<Lang, boolean>> {
  return {
    uk: blank(s.title_uk) || blank(s.desc_uk),
    ru: blank(s.title_ru) || blank(s.desc_ru),
    en: blank(s.title_en) || blank(s.desc_en),
  };
}

function newService(): ServiceItem {
  return {
    id: Date.now().toString(),
    title_uk: "", title_ru: "", title_en: "",
    subtitle_uk: "", subtitle_ru: "", subtitle_en: "",
    price: "",
    desc_uk: "", desc_ru: "", desc_en: "",
    includes_uk: [], includes_ru: [], includes_en: [],
  };
}

/** Bullet points as a list of fields — Enter never eats a line. */
function IncludesEditor({ items, onChange, lang }: { items: string[]; onChange: (next: string[]) => void; lang: Lang }) {
  return (
    <div>
      <p className="mb-1.5 text-sm font-medium">Що входить ({LANG_LABEL[lang]})</p>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-2">
            <input
              value={item}
              aria-label={`Пункт ${i + 1}`}
              onChange={(e) => onChange(items.map((x, j) => (j === i ? e.target.value : x)))}
              className="w-full rounded-xl border border-[var(--sand-200)] bg-white px-3.5 py-2 text-base focus:border-[var(--sand-400)] focus:outline-none focus:ring-2 focus:ring-[var(--gold-400)]/40 sm:text-sm"
            />
            <IconButton label={`Прибрати пункт ${i + 1}`} onClick={() => onChange(items.filter((_, j) => j !== i))}>
              <X size={16} />
            </IconButton>
          </li>
        ))}
      </ul>
      <Button variant="ghost" size="sm" className="mt-2" onClick={() => onChange([...items, ""])}>
        <Plus size={16} aria-hidden /> Додати пункт
      </Button>
    </div>
  );
}

function ServiceEditor({ service, onChange }: { service: ServiceItem; onChange: (s: ServiceItem) => void }) {
  const [lang, setLang] = useState<Lang>("uk");
  const k = <F extends "title" | "subtitle" | "desc">(f: F) => `${f}_${lang}` as `${F}_${Lang}`;
  const includesKey = `includes_${lang}` as const;

  return (
    <div className="space-y-5 border-t border-[var(--sand-100)] pt-5">
      <div className="grid gap-4 sm:grid-cols-[1fr_180px]">
        <div className="flex flex-wrap items-center gap-3">
          <LangTabs value={lang} onChange={setLang} missing={missingLangs(service)} />
          <span className="text-xs text-[var(--muted)]">Тексти окремо для кожної мови сайту</span>
        </div>
        <TextField
          label="Ціна"
          value={service.price}
          onChange={(price) => onChange({ ...service, price })}
          placeholder="$30"
          required
          error={blank(service.price) ? "Вкажіть ціну" : null}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label={`Назва (${LANG_LABEL[lang]})`}
          value={service[k("title")] ?? ""}
          onChange={(v) => onChange({ ...service, [k("title")]: v })}
          required={lang === "uk"}
          error={lang === "uk" && blank(service.title_uk) ? "Назва українською обовʼязкова" : null}
          maxLength={60}
        />
        <TextField
          label={`Підзаголовок (${LANG_LABEL[lang]})`}
          value={service[k("subtitle")] ?? ""}
          onChange={(v) => onChange({ ...service, [k("subtitle")]: v })}
          hint="Напр. «2 питання», «Детальний розбір»"
          maxLength={40}
        />
      </div>
      <TextAreaField
        label={`Опис (${LANG_LABEL[lang]})`}
        value={service[k("desc")] ?? ""}
        onChange={(v) => onChange({ ...service, [k("desc")]: v })}
        rows={3}
        maxLength={300}
      />
      <IncludesEditor
        lang={lang}
        items={service[includesKey] ?? []}
        onChange={(items) => onChange({ ...service, [includesKey]: items })}
      />
    </div>
  );
}

export default function ServicesPage() {
  const [services, setServices] = useContentKey<ServiceItem[]>("services", DEFAULT_SERVICES);
  const [org, setOrg] = useContentKey<OrgItem[]>("org", DEFAULT_ORG);
  const [open, setOpen] = useState<string | null>(null);
  const [orgLang, setOrgLang] = useState<Lang>("uk");
  const confirm = useConfirm();

  const updateService = (s: ServiceItem) => setServices(services.map((x) => (x.id === s.id ? s : x)));
  const removeService = async (s: ServiceItem) => {
    const ok = await confirm({
      title: "Видалити послугу?",
      description: `«${s.title_uk || "Без назви"}» зникне зі сторінки послуг після збереження.`,
      confirmLabel: "Видалити",
    });
    if (ok) setServices(services.filter((x) => x.id !== s.id));
  };
  const addService = () => {
    const s = newService();
    setServices([...services, s]);
    setOpen(s.id);
  };

  const orgMissing: Partial<Record<Lang, boolean>> = {
    uk: org.some((o) => blank(o.text_uk)),
    ru: org.some((o) => blank(o.text_ru)),
    en: org.some((o) => blank(o.text_en)),
  };

  return (
    <>
      <PageHeader
        title="Послуги та ціни"
        description="Картки на сторінці «Послуги» і варіанти у формі запису. Зміни потрапляють на сайт після збереження."
        siteHref="/uk/services"
        actions={
          <Button onClick={addService}>
            <Plus size={16} aria-hidden /> Додати послугу
          </Button>
        }
      />

      <div className="space-y-3">
        {services.length === 0 && (
          <EmptyState title="Послуг немає" action={<Button onClick={addService}><Plus size={16} aria-hidden /> Додати послугу</Button>}>
            Поки список порожній, сайт показує стандартні послуги.
          </EmptyState>
        )}
        {services.map((s, i) => {
          const expanded = open === s.id;
          const missing = Object.entries(missingLangs(s)).filter(([, m]) => m).map(([l]) => l.toUpperCase());
          return (
            <Card key={s.id} className="p-0 sm:p-0">
              <div className="flex flex-wrap items-center justify-end gap-x-2 gap-y-1 p-3 sm:flex-nowrap sm:p-4">
                <button
                  type="button"
                  onClick={() => setOpen(expanded ? null : s.id)}
                  aria-expanded={expanded}
                  className="flex min-h-11 min-w-0 flex-1 basis-56 items-center gap-3 rounded-xl px-1 text-left"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{s.title_uk || <em className="text-[var(--muted)]">Без назви</em>}</span>
                    <span className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-[var(--muted)]">
                      {s.subtitle_uk && <span>{s.subtitle_uk}</span>}
                      {missing.length > 0 && <Badge tone="gold">Не перекладено: {missing.join(", ")}</Badge>}
                    </span>
                  </span>
                  <Badge tone={blank(s.price) ? "danger" : "neutral"}>{s.price || "без ціни"}</Badge>
                  {expanded ? <ChevronUp size={18} aria-hidden /> : <ChevronDown size={18} aria-hidden />}
                </button>
                <MoveDeleteControls
                  index={i}
                  count={services.length}
                  onMove={(from, to) => setServices(moveItem(services, from, to))}
                  onDelete={() => void removeService(s)}
                  deleteLabel="Видалити послугу"
                />
              </div>
              {expanded && (
                <div className="px-3 pb-4 sm:px-4 sm:pb-5">
                  <ServiceEditor service={s} onChange={updateService} />
                </div>
              )}
            </Card>
          );
        })}
      </div>

      <Card
        className="mt-8"
        title="Організаційні питання"
        description="Блок під картками послуг: оплата, тривалість, формат."
        actions={<LangTabs value={orgLang} onChange={setOrgLang} missing={orgMissing} />}
      >
        <ul className="space-y-4">
          {org.map((o, i) => (
            <li key={o.id} className="flex items-start gap-2">
              <div className="min-w-0 flex-1">
                <TextAreaField
                  label={`Пункт ${i + 1} (${LANG_LABEL[orgLang]})`}
                  value={o[`text_${orgLang}`] ?? ""}
                  onChange={(v) => setOrg(org.map((x) => (x.id === o.id ? { ...x, [`text_${orgLang}`]: v } : x)))}
                  rows={2}
                  error={orgLang === "uk" && blank(o.text_uk) ? "Текст українською обовʼязковий" : null}
                />
              </div>
              <div className="pt-7">
                <MoveDeleteControls
                  index={i}
                  count={org.length}
                  onMove={(from, to) => setOrg(moveItem(org, from, to))}
                  onDelete={async () => {
                    const ok = await confirm({ title: "Видалити пункт?", confirmLabel: "Видалити" });
                    if (ok) setOrg(org.filter((x) => x.id !== o.id));
                  }}
                  deleteLabel="Видалити пункт"
                />
              </div>
            </li>
          ))}
        </ul>
        <Button
          variant="secondary"
          className="mt-4"
          onClick={() => setOrg([...org, { id: Date.now().toString(), text_uk: "", text_ru: "", text_en: "" }])}
        >
          <Plus size={16} aria-hidden /> Додати пункт
        </Button>
      </Card>
    </>
  );
}
