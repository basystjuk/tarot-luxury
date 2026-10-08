"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowUpRight, Clapperboard, RefreshCw } from "lucide-react";
import { ALL_TOOL_IDS, TOOL_LABELS } from "@/lib/tools-config";
import { THEME_LABELS, type ThemeTag } from "@/lib/youtube/tags";
import { adminFetch, ensureAdminCookie, responseError } from "@/components/admin/admin-fetch";
import { formatDateTime } from "@/components/admin/format";
import { Button, Card, EmptyState, Notice, PageHeader, Skeleton, Switch, useToast } from "@/components/admin/ui";
import { cn } from "@/lib/utils";

interface AdminVideo {
  id: string;
  title: string;
  thumb_url: string;
  duration_seconds: number | null;
  published_at: string;
  view_count: number | null;
  tags: string[];
  tool_pick: string | null;
  hidden: boolean;
}
type VideoPatch = Partial<Pick<AdminVideo, "hidden" | "tool_pick" | "tags">>;

const duration = (s: number | null) => (s && s > 0 ? `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}` : "");

export default function VideosPage() {
  const toast = useToast();
  const [videos, setVideos] = useState<AdminVideo[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  // One request at a time per video, so quick clicks apply in order.
  const queues = useRef(new Map<string, Promise<void>>());

  const load = useCallback(async () => {
    try {
      await ensureAdminCookie();
      const res = await adminFetch("/api/admin/videos");
      if (!res.ok) throw new Error(await responseError(res));
      setVideos((await res.json()).videos ?? []);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setVideos([]);
    }
  }, []);

  useEffect(() => {
    // Deferred so state updates happen after the effect, not inside it.
    void Promise.resolve().then(load);
  }, [load]);

  const patch = (video: AdminVideo, change: VideoPatch) => {
    const before = video;
    setVideos((all) => all?.map((v) => (v.id === video.id ? { ...v, ...change } : v)) ?? null);
    const run = async () => {
      const res = await adminFetch("/api/admin/videos", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: video.id, ...change }),
      }).catch(() => null);
      if (!res?.ok) {
        setVideos((all) => all?.map((v) => (v.id === video.id ? { ...v, ...before } : v)) ?? null);
        toast({ tone: "danger", title: "Зміну не збережено", description: res ? await responseError(res) : "Мережа недоступна" });
      }
    };
    const prev = queues.current.get(video.id) ?? Promise.resolve();
    const next = prev.then(run);
    queues.current.set(video.id, next);
  };

  const resync = async () => {
    setSyncing(true);
    try {
      await ensureAdminCookie();
      const res = await adminFetch("/api/admin/videos/resync", { method: "POST" });
      if (!res.ok) throw new Error(await responseError(res));
      const j = await res.json();
      toast({ title: "Синхронізовано з YouTube", description: `Оновлено відео: ${j.upserted ?? 0}` });
      await load();
    } catch (e) {
      toast({ tone: "danger", title: "Синхронізація не вдалася", description: e instanceof Error ? e.message : String(e) });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Відео"
        description="Відео з YouTube-каналу (оновлюються автоматично щодоби). Тут можна сховати відео, додати теми і обрати «інструмент дня». Зміни застосовуються одразу."
        siteHref="/uk/blog"
        actions={
          <Button variant="secondary" loading={syncing} onClick={() => void resync()}>
            {!syncing && <RefreshCw size={16} aria-hidden />} Синхронізувати зараз
          </Button>
        }
      />

      {error && (
        <Notice tone="danger" className="mb-5" title="Відео не завантажились">
          {error}
        </Notice>
      )}

      {videos === null ? (
        <div className="space-y-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-32" />)}</div>
      ) : videos.length === 0 && !error ? (
        <EmptyState icon={<Clapperboard size={32} />} title="Відео ще немає" action={<Button onClick={() => void resync()} loading={syncing}>Синхронізувати зараз</Button>}>
          Якщо після синхронізації список порожній — перевірте налаштування YouTube у розділі «Налаштування і стан».
        </EmptyState>
      ) : (
        <ul className="space-y-3">
          {videos.map((v) => (
            <li key={v.id}>
              <Card className={cn("p-3 sm:p-4", v.hidden && "opacity-70")}>
                <div className="flex flex-col gap-4 sm:flex-row">
                  <div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-xl bg-[var(--sand-100)] sm:w-44">
                    <Image src={v.thumb_url} alt="" fill sizes="(min-width: 640px) 176px, 100vw" className="object-cover" unoptimized />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="text-base font-medium leading-snug" style={{ fontFamily: "var(--font-jost)" }}>{v.title}</h2>
                      <a
                        href={`https://youtu.be/${v.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Відкрити на YouTube"
                        className="shrink-0 p-1 text-[var(--muted)] hover:text-[var(--warm-900)]"
                      >
                        <ArrowUpRight size={16} />
                      </a>
                    </div>
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      {formatDateTime(v.published_at)} · {duration(v.duration_seconds)} · {(v.view_count ?? 0).toLocaleString("uk-UA")} переглядів
                    </p>

                    <div className="mt-3 flex flex-wrap gap-1.5" role="group" aria-label="Теми відео">
                      {(Object.keys(THEME_LABELS) as ThemeTag[]).map((t) => {
                        const on = v.tags.includes(t);
                        return (
                          <button
                            key={t}
                            type="button"
                            aria-pressed={on}
                            onClick={() => patch(v, { tags: on ? v.tags.filter((x) => x !== t) : [...v.tags, t] })}
                            className={cn(
                              "min-h-9 rounded-full border px-3 text-xs transition-colors",
                              on
                                ? "border-[var(--gold-400)] bg-[var(--gold-300)]/30 text-[var(--gold-600)]"
                                : "border-[var(--sand-200)] text-[var(--muted)] hover:border-[var(--sand-400)]",
                            )}
                          >
                            {THEME_LABELS[t].glyph} {THEME_LABELS[t].uk}
                          </button>
                        );
                      })}
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-3">
                      <label className="flex items-center gap-2 text-sm">
                        <span className="text-[var(--muted)]">Інструмент дня:</span>
                        <select
                          value={v.tool_pick ?? ""}
                          onChange={(e) => patch(v, { tool_pick: e.target.value || null })}
                          className="min-h-9 rounded-lg border border-[var(--sand-200)] bg-white px-2 text-base sm:text-sm"
                        >
                          <option value="">— не показувати —</option>
                          {ALL_TOOL_IDS.map((id) => (
                            <option key={id} value={id}>{TOOL_LABELS[id].uk}</option>
                          ))}
                        </select>
                      </label>
                      <span className="flex items-center gap-2 text-sm">
                        <Switch checked={!v.hidden} onChange={(show) => patch(v, { hidden: !show })} label="Показувати на сайті" />
                        <span className={v.hidden ? "text-[var(--muted)]" : undefined}>{v.hidden ? "Сховано" : "На сайті"}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
