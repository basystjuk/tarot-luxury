"use client";

import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { ALL_TOOL_IDS, DEFAULT_TOOLS_ENABLED, TOOL_LABELS, type ToolId } from "@/lib/tools-config";
import { adminFetch, responseError } from "@/components/admin/admin-fetch";
import { useAdminContent, useContentKey } from "@/components/admin/content-context";
import { Card, PageHeader, SwitchRow, useToast } from "@/components/admin/ui";

export default function ToolsPage() {
  const [enabled, setEnabled] = useContentKey<Record<ToolId, boolean>>("tools_enabled", DEFAULT_TOOLS_ENABLED);
  const { preview: previewLoaded } = useAdminContent();
  const [preview, setPreview] = useState<boolean | null>(null);
  const [previewBusy, setPreviewBusy] = useState(false);
  const toast = useToast();
  const previewOn = preview ?? previewLoaded;

  const togglePreview = async (next: boolean) => {
    setPreviewBusy(true);
    try {
      const res = await adminFetch("/api/admin/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: next }),
      });
      if (!res.ok) throw new Error(await responseError(res));
      setPreview(Boolean((await res.json()).preview));
      toast({ title: next ? "Режим перегляду увімкнено" : "Режим перегляду вимкнено" });
    } catch (e) {
      toast({ tone: "danger", title: "Не вдалося змінити режим", description: e instanceof Error ? e.message : String(e) });
    } finally {
      setPreviewBusy(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Доступ до інструментів"
        description="Вимкнений інструмент зникає зі Студії та головної, а за прямим посиланням показує «Скоро». Зміни потрапляють на сайт після збереження."
        siteHref="/uk/studio"
      />
      <div className="grid gap-4 lg:grid-cols-[1fr_340px] lg:gap-6">
        <Card title="Інструменти Soul Studio">
          <div className="divide-y divide-[var(--sand-100)]">
            {ALL_TOOL_IDS.map((id) => (
              <SwitchRow
                key={id}
                label={TOOL_LABELS[id].uk}
                description={
                  <a href={`/uk/studio/${id}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:underline">
                    /studio/{id} <ArrowUpRight size={12} aria-hidden />
                  </a>
                }
                checked={enabled[id] ?? DEFAULT_TOOLS_ENABLED[id]}
                onChange={(next) => setEnabled({ ...enabled, [id]: next })}
              />
            ))}
          </div>
        </Card>
        <Card title="Режим перегляду">
          <p className="text-sm leading-relaxed text-[var(--muted)]">
            Лише в цьому браузері: видно вимкнені інструменти, а денні ліміти AI знято — щоб перевірити інструмент до
            відкриття. Відвідувачі цього не бачать. Діє 90 днів, застосовується одразу.
          </p>
          <div className="mt-2 border-t border-[var(--sand-100)]">
            <SwitchRow
              label="Режим перегляду в цьому браузері"
              description={previewOn ? "Зараз увімкнено" : "Зараз вимкнено"}
              checked={previewOn}
              disabled={previewBusy}
              onChange={(next) => void togglePreview(next)}
            />
          </div>
          <p className="mt-2 text-xs text-[var(--muted)]">
            Розділи «Користувачі» та «Відео» вмикають цей режим автоматично — доступ до них поки працює через нього.
          </p>
        </Card>
      </div>
    </>
  );
}
