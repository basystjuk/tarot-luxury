"use client";

/**
 * Version history: copies taken before saves (at most every 10 min, newest 30
 * kept). Preview what differs from the current version and restore — the
 * current version is copied first, so a restore can itself be undone.
 */

import { useCallback, useEffect, useState } from "react";
import { History, RotateCcw } from "lucide-react";
import { adminFetch, responseError } from "@/components/admin/admin-fetch";
import { useAdminContent } from "@/components/admin/content-context";
import { formatAgo, formatBytes, formatDateTime } from "@/components/admin/format";
import { Badge, Button, Card, EmptyState, Notice, PageHeader, Skeleton, useConfirm, useToast } from "@/components/admin/ui";
import { cn } from "@/lib/utils";

type Backup = { id: string; at: string; size: number };
type Snapshot = { id: string; savedAt: string | null; content: Record<string, unknown>; aiPrompts: unknown };

const KEY_LABELS: Record<string, string> = {
  services: "Послуги та ціни",
  org: "Організаційні питання",
  faq_uk: "FAQ (українською)",
  faq_ru: "FAQ (російською)",
  faq_en: "FAQ (англійською)",
  about: "Про мене",
  contacts: "Контакти",
  studio_tools: "Тексти Студії",
  tools_enabled: "Доступ до інструментів",
  celebration: "Святкова анімація",
  ai_prompts: "AI-промти",
  testimonials: "Відгуки",
  home: "Головна (hero)",
  blog: "Блог",
};

function differences(current: Record<string, unknown>, snap: Snapshot): string[] {
  const other: Record<string, unknown> = { ...snap.content, ai_prompts: snap.aiPrompts ?? undefined };
  const keys = new Set([...Object.keys(current), ...Object.keys(other)].filter((k) => k !== "_meta"));
  return [...keys].filter((k) => JSON.stringify(current[k] ?? null) !== JSON.stringify(other[k] ?? null)).map((k) => KEY_LABELS[k] ?? k);
}

export default function HistoryPage() {
  const { doc, dirty, version, reload } = useAdminContent();
  const toast = useToast();
  const confirm = useConfirm();
  const [backups, setBackups] = useState<Backup[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Snapshot | null>(null);
  const [opening, setOpening] = useState<string | null>(null);
  const [restoring, setRestoring] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await adminFetch("/api/admin/content/history");
      if (!res.ok) throw new Error(await responseError(res));
      setBackups((await res.json()).backups);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setBackups([]);
    }
  }, []);

  useEffect(() => {
    // Deferred so state updates happen after the effect, not inside it.
    void Promise.resolve().then(load);
  }, [load]);

  const open = async (b: Backup) => {
    setOpening(b.id);
    try {
      const res = await adminFetch(`/api/admin/content/history?id=${encodeURIComponent(b.id)}`);
      if (!res.ok) throw new Error(await responseError(res));
      setSelected(await res.json());
    } catch (e) {
      toast({ tone: "danger", title: "Не вдалося відкрити копію", description: e instanceof Error ? e.message : String(e) });
    } finally {
      setOpening(null);
    }
  };

  const restore = async (snap: Snapshot, at: string) => {
    const ok = await confirm({
      title: "Відновити цю версію?",
      description: `Сайт повернеться до стану на ${formatDateTime(at)}. Поточну версію буде збережено в історії — її теж можна буде відновити.`,
      confirmLabel: "Відновити",
      tone: "primary",
    });
    if (!ok) return;
    setRestoring(true);
    try {
      const res = await adminFetch("/api/admin/content/history", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-content-version": version() ?? "none" },
        body: JSON.stringify({ action: "restore", id: snap.id }),
      });
      if (!res.ok) throw new Error(await responseError(res));
      await reload();
      await load();
      setSelected(null);
      toast({ title: "Версію відновлено", description: "Сайт оновиться протягом хвилини." });
    } catch (e) {
      toast({ tone: "danger", title: "Не вдалося відновити", description: e instanceof Error ? e.message : String(e) });
    } finally {
      setRestoring(false);
    }
  };

  const selectedAt = backups?.find((b) => b.id === selected?.id)?.at ?? selected?.savedAt ?? "";
  const changes = selected && doc ? differences(doc, selected) : [];

  return (
    <>
      <PageHeader
        title="Історія версій"
        description="Копія контенту зберігається перед змінами (не частіше ніж раз на 10 хвилин, останні 30 копій). Можна переглянути, що відрізняється, і повернути будь-яку."
      />
      {dirty && (
        <Notice tone="warning" className="mb-5">
          Є незбережені зміни — спершу збережіть або скасуйте їх, щоб відновлення не змішалось із ними.
        </Notice>
      )}
      {error && <Notice tone="danger" className="mb-5">Історію не вдалося завантажити: {error}</Notice>}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,340px)_1fr] lg:gap-6">
        <Card title="Збережені копії" className="p-3 sm:p-4">
          {backups === null ? (
            <div className="space-y-2">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-12" />)}</div>
          ) : backups.length === 0 ? (
            <EmptyState icon={<History size={28} />} title="Копій ще немає">
              Перша копія зʼявиться під час наступного збереження.
            </EmptyState>
          ) : (
            <ul className="space-y-1">
              {backups.map((b) => (
                <li key={b.id}>
                  <button
                    type="button"
                    onClick={() => void open(b)}
                    aria-current={selected?.id === b.id ? "true" : undefined}
                    className={cn(
                      "flex min-h-12 w-full items-center justify-between gap-3 rounded-xl px-3 text-left text-sm hover:bg-[var(--cream-100)]",
                      selected?.id === b.id && "bg-[var(--sand-100)]",
                    )}
                  >
                    <span>
                      <span className="block font-medium">{formatDateTime(b.at)}</span>
                      <span className="block text-xs text-[var(--muted)]">{formatAgo(b.at)} · {formatBytes(b.size)}</span>
                    </span>
                    {opening === b.id && <span className="text-xs text-[var(--muted)]">…</span>}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <div className="min-w-0">
          {!selected ? (
            <EmptyState icon={<History size={32} />} title="Оберіть копію зліва">
              Покажемо, які розділи відрізняються від поточної версії.
            </EmptyState>
          ) : (
            <Card
              title={`Копія від ${formatDateTime(selectedAt)}`}
              actions={
                <Button onClick={() => void restore(selected, selectedAt)} loading={restoring} disabled={dirty}>
                  {!restoring && <RotateCcw size={16} aria-hidden />} Відновити цю версію
                </Button>
              }
            >
              {changes.length === 0 ? (
                <p className="text-sm text-[var(--success)]">Ця копія збігається з поточною версією.</p>
              ) : (
                <>
                  <p className="mb-3 text-sm text-[var(--muted)]">Відрізняються розділи:</p>
                  <ul className="flex flex-wrap gap-2">
                    {changes.map((c) => <li key={c}><Badge tone="gold">{c}</Badge></li>)}
                  </ul>
                </>
              )}
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
