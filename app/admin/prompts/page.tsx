"use client";

import { useState } from "react";
import { Copy, RotateCcw } from "lucide-react";
import {
  ALL_PROMPT_TOOL_IDS,
  DEFAULT_PROMPTS,
  validatePromptOverride,
  type PromptOverride,
  type PromptOverrides,
  type PromptToolId,
} from "@/lib/ai-prompts";
import { useContentKey } from "@/components/admin/content-context";
import { Badge, Button, Card, Notice, PageHeader, SelectField, TextAreaField, useToast } from "@/components/admin/ui";
import { cn } from "@/lib/utils";

const isCustom = (ov: PromptOverride | undefined) => Boolean(ov?.system?.trim() || ov?.user?.trim());

export default function PromptsPage() {
  const [prompts, setPrompts] = useContentKey<PromptOverrides>("ai_prompts", {});
  const [active, setActive] = useState<PromptToolId>(ALL_PROMPT_TOOL_IDS[0]);
  const toast = useToast();

  const def = DEFAULT_PROMPTS[active];
  const ov = prompts[active] ?? {};
  const update = (patch: { system?: string; user?: string }) => setPrompts({ ...prompts, [active]: { ...ov, ...patch } });
  const { ok, missing } = validatePromptOverride(active, {
    system: ov.system?.trim() ? ov.system : def.defaultSystem,
    user: ov.user?.trim() ? ov.user : def.defaultUser,
  });

  const copyVar = async (name: string) => {
    try {
      await navigator.clipboard.writeText(`{{${name}}}`);
      toast({ tone: "info", title: `Скопійовано {{${name}}}` });
    } catch {
      toast({ tone: "danger", title: "Не вдалося скопіювати" });
    }
  };

  return (
    <>
      <PageHeader
        title="AI-промти"
        description="Інструкції для AI в кожному інструменті. Порожнє поле — працює стандартний промт з коду. Після збереження нові запити підхоплюють зміни приблизно за 30 секунд."
      />

      <div className="grid gap-4 lg:grid-cols-[240px_1fr] lg:gap-6">
        <div>
          <div className="lg:hidden">
            <SelectField
              label="Інструмент"
              value={active}
              onChange={(v) => setActive(v as PromptToolId)}
              options={ALL_PROMPT_TOOL_IDS.map((id) => ({ value: id, label: DEFAULT_PROMPTS[id].label + (isCustom(prompts[id]) ? " · змінено" : "") }))}
            />
          </div>
          <nav aria-label="Інструменти" className="hidden lg:block">
            <ul className="space-y-1">
              {ALL_PROMPT_TOOL_IDS.map((id) => (
                <li key={id}>
                  <button
                    type="button"
                    onClick={() => setActive(id)}
                    aria-current={active === id ? "true" : undefined}
                    className={cn(
                      "flex min-h-10 w-full items-center gap-2 rounded-xl px-3 text-left text-sm transition-colors",
                      active === id ? "bg-[var(--sand-100)] font-medium" : "text-[var(--warm-600)] hover:bg-[var(--cream-100)]",
                    )}
                  >
                    <span className="flex-1">{DEFAULT_PROMPTS[id].label}</span>
                    {isCustom(prompts[id]) && <Badge tone="gold">змінено</Badge>}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="min-w-0 space-y-4">
          <Card title={def.label} description={def.description}>
            <p className="mb-2 text-sm font-medium">Змінні (натисніть, щоб скопіювати)</p>
            <ul className="flex flex-wrap gap-2">
              {def.variables.map((v) => (
                <li key={v.name}>
                  <button
                    type="button"
                    onClick={() => void copyVar(v.name)}
                    title={v.description}
                    className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-[var(--sand-200)] bg-[var(--cream-100)] px-2.5 font-mono text-xs hover:border-[var(--sand-400)]"
                  >
                    {`{{${v.name}}}`}
                    {v.required && <span className="font-sans text-[10px] text-[var(--danger)]">обовʼязкова</span>}
                    <Copy size={12} className="text-[var(--muted)]" aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
            {!ok && (
              <Notice tone="warning" className="mt-4">
                Бракує обовʼязкових змінних: {missing.map((m) => `{{${m}}}`).join(", ")} — AI може відповісти не тією мовою або без потрібних даних.
              </Notice>
            )}
          </Card>

          <Card
            title="System"
            actions={
              ov.system?.trim() ? (
                <Button variant="ghost" size="sm" onClick={() => update({ system: "" })}>
                  <RotateCcw size={14} aria-hidden /> Стандартний
                </Button>
              ) : (
                <Badge tone="muted">стандартний</Badge>
              )
            }
          >
            <TextAreaField
              label="System-промт"
              value={ov.system ?? ""}
              onChange={(system) => update({ system })}
              placeholder={def.defaultSystem}
              rows={7}
              mono
              hint={ov.system?.trim() ? undefined : "Зараз працює стандартний текст (показано сірим)."}
            />
          </Card>

          <Card
            title="User"
            actions={
              ov.user?.trim() ? (
                <Button variant="ghost" size="sm" onClick={() => update({ user: "" })}>
                  <RotateCcw size={14} aria-hidden /> Стандартний
                </Button>
              ) : (
                <Badge tone="muted">стандартний</Badge>
              )
            }
          >
            <TextAreaField
              label="User-промт"
              value={ov.user ?? ""}
              onChange={(user) => update({ user })}
              placeholder={def.defaultUser}
              rows={14}
              mono
              hint={ov.user?.trim() ? undefined : "Зараз працює стандартний текст (показано сірим)."}
            />
          </Card>
        </div>
      </div>
    </>
  );
}
