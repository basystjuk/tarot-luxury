"use client";

/**
 * Admin "Відео" tab.
 *
 * - Lists every synced YouTube video (incl. hidden).
 * - Per video: tag editor, "Tool of the day" picker, hide toggle.
 * - "Re-sync now" button triggers /api/admin/videos/resync immediately.
 */

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { RefreshCw, Loader2, Eye, EyeOff, ExternalLink } from "lucide-react";
import { ALL_TOOL_IDS, TOOL_LABELS, type ToolId } from "@/lib/tools-config";
import { THEME_LABELS, type ThemeTag } from "@/lib/youtube/tags";

interface AdminVideo {
  id: string;
  title: string;
  description: string | null;
  thumb_url: string;
  duration_seconds: number | null;
  published_at: string;
  view_count: number | null;
  tags: string[];
  tool_pick: string | null;
  hidden: boolean;
  synced_at: string;
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("uk-UA", { day: "numeric", month: "short", year: "numeric" });
}
function fmtDuration(s: number | null | undefined): string {
  if (!s || s <= 0) return "";
  const m = Math.floor(s / 60), sec = s % 60;
  return `${m}:${String(sec).padStart(2, "0")}`;
}

export default function VideosTab() {
  const [videos, setVideos] = useState<AdminVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [resyncing, setResyncing] = useState(false);
  const [resyncMsg, setResyncMsg] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/videos", { cache: "no-store" });
      const j = await res.json();
      setVideos((j.videos as AdminVideo[]) ?? []);
    } catch { setVideos([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function patch(id: string, body: Partial<{ hidden: boolean; tool_pick: string | null; tags: string[] }>) {
    setSavingId(id);
    try {
      const res = await fetch("/api/admin/videos", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...body }),
      });
      if (res.ok) {
        // Optimistic local update so the UI feels instant.
        setVideos((prev) => prev.map((v) => (v.id === id ? { ...v, ...body, tool_pick: "tool_pick" in body ? (body.tool_pick ?? null) : v.tool_pick } as AdminVideo : v)));
      }
    } finally { setSavingId(null); }
  }

  async function resync() {
    setResyncing(true); setResyncMsg(null);
    try {
      const res = await fetch("/api/admin/videos/resync", { method: "POST" });
      const j = await res.json();
      if (res.ok) { setResyncMsg(`OK · ${j.upserted} відео`); await load(); }
      else setResyncMsg(`Помилка: ${j.error ?? res.status}`);
    } catch (e) { setResyncMsg(`Помилка: ${String(e)}`); }
    finally { setResyncing(false); setTimeout(() => setResyncMsg(null), 5000); }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl mb-1" style={{ fontFamily: "var(--font-cormorant)" }}>Відео</h2>
          <p className="text-white/40 text-sm">
            Тягнуться автоматично з YouTube-каналу щогодини. Тут можеш сховати, додати теги і вибрати «інструмент дня».
          </p>
        </div>
        <button
          type="button" onClick={resync} disabled={resyncing}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[rgba(212,168,83,0.15)] text-[#D4A853] border border-[rgba(212,168,83,0.35)] hover:bg-[rgba(212,168,83,0.25)] transition-colors disabled:opacity-60"
        >
          {resyncing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
          {resyncing ? "Синхронізую…" : "Синхронізувати зараз"}
        </button>
      </div>
      {resyncMsg && <p className="text-xs text-[#D4A853]">{resyncMsg}</p>}

      {loading ? (
        <div className="text-center py-10 text-white/40"><Loader2 size={20} className="animate-spin inline" /></div>
      ) : videos.length === 0 ? (
        <div className="text-center py-10 text-white/40 text-sm">
          Поки немає відео. Перевір YOUTUBE_API_KEY / YOUTUBE_CHANNEL_ID у Vercel env або натисни «Синхронізувати зараз».
        </div>
      ) : (
        <div className="space-y-4">
          {videos.map((v) => (
            <VideoRow key={v.id} v={v} saving={savingId === v.id} onPatch={patch} />
          ))}
        </div>
      )}
    </div>
  );
}

function VideoRow({ v, saving, onPatch }: {
  v: AdminVideo; saving: boolean; onPatch: (id: string, body: Partial<{ hidden: boolean; tool_pick: string | null; tags: string[] }>) => void;
}) {
  return (
    <div className={`flex gap-4 p-4 rounded-xl border border-white/10 bg-white/[0.02] ${v.hidden ? "opacity-55" : ""}`}>
      <div className="relative w-40 aspect-video rounded-lg overflow-hidden flex-shrink-0 bg-black">
        <Image src={v.thumb_url} alt={v.title} fill className="object-cover" sizes="160px" unoptimized />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3 mb-1">
          <h3 className="text-white/90 text-sm leading-snug line-clamp-2">{v.title}</h3>
          <div className="flex items-center gap-2 flex-shrink-0">
            {saving && <Loader2 size={14} className="animate-spin text-white/40" />}
            <button
              type="button" onClick={() => onPatch(v.id, { hidden: !v.hidden })}
              title={v.hidden ? "Показати на сайті" : "Сховати"}
              className="text-white/40 hover:text-[#D4A853] transition-colors"
            >
              {v.hidden ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
            <a href={`https://youtu.be/${v.id}`} target="_blank" rel="noopener noreferrer" title="Відкрити на YouTube" className="text-white/40 hover:text-[#D4A853] transition-colors">
              <ExternalLink size={14} />
            </a>
          </div>
        </div>
        <p className="text-[11px] text-white/35 mb-3">
          {fmtDate(v.published_at)} · {fmtDuration(v.duration_seconds)} · {(v.view_count ?? 0).toLocaleString()} перегл.
        </p>

        {/* Tags */}
        <div className="flex items-center gap-2 flex-wrap mb-3">
          {(Object.keys(THEME_LABELS) as ThemeTag[]).map((t) => {
            const on = v.tags.includes(t);
            return (
              <button
                key={t} type="button"
                onClick={() => onPatch(v.id, { tags: on ? v.tags.filter(x => x !== t) : [...v.tags, t] })}
                className={`text-[11px] px-2 py-0.5 rounded-full border transition-colors ${
                  on
                    ? "bg-[rgba(212,168,83,0.2)] border-[rgba(212,168,83,0.5)] text-[#D4A853]"
                    : "bg-transparent border-white/10 text-white/30 hover:text-white/60 hover:border-white/20"
                }`}
              >
                {THEME_LABELS[t].glyph} {THEME_LABELS[t].uk}
              </button>
            );
          })}
        </div>

        {/* Tool pick */}
        <div className="flex items-center gap-2 flex-wrap text-[12px]">
          <span className="text-white/40">Інструмент дня:</span>
          <select
            value={v.tool_pick ?? ""}
            onChange={(e) => onPatch(v.id, { tool_pick: e.target.value === "" ? null : (e.target.value as ToolId) })}
            className="bg-white/5 border border-white/10 rounded px-2 py-1 text-white/80 text-[12px] focus:outline-none focus:border-[#D4A853]"
          >
            <option value="" className="bg-[#1C1512]">— не показувати —</option>
            {ALL_TOOL_IDS.map((tid) => (
              <option key={tid} value={tid} className="bg-[#1C1512]">{TOOL_LABELS[tid].uk}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
