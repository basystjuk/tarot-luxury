/**
 * YouTube → Supabase sync.
 *
 * Pulls the latest uploads from Ellen's channel, classifies them by theme
 * (lib/youtube/tags) and upserts metadata into public.youtube_videos.
 *
 * Why playlistItems, not search.list:
 *   - search.list costs 100 units per call and is the heavy way to enum a
 *     channel; uploads playlist is 1 unit per page and is the canonical
 *     "show me this channel's videos in order" endpoint.
 *
 * Conventions:
 *   - Reads the channel's "uploads" playlist id (UCxxx → UUxxx) deterministically:
 *     uploadsPlaylistId = "UU" + channelId.slice(2). Confirmed in YouTube docs.
 *   - duration_seconds parsed from ISO-8601 PT#H#M#S returned by videos.list.
 *   - tool_pick is preserved across re-syncs (admin choice never overwritten).
 *   - tags are merged: classifier output + any owner overrides (admin can
 *     add a manual tag; sync won't remove it).
 */

import { classifyVideo, type ThemeTag } from "./tags";

const API = "https://www.googleapis.com/youtube/v3";

export interface YTVideoMeta {
  id: string;
  title: string;
  description: string;
  thumb_url: string;
  duration_seconds: number;
  published_at: string;
  view_count: number;
  detected_tags: ThemeTag[];
}

/** Resolve the channel's uploads-playlist id (UC → UU). */
export function uploadsPlaylistOf(channelId: string): string {
  // Channel ids always start with "UC"; the corresponding uploads playlist
  // swaps the prefix to "UU". This avoids a 1-unit channels.list call.
  return "UU" + channelId.slice(2);
}

/** Parse ISO-8601 PT#H#M#S duration into seconds. */
export function parseIsoDuration(iso: string): number {
  const m = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec(iso ?? "");
  if (!m) return 0;
  const [, h, mi, s] = m;
  return (parseInt(h ?? "0", 10) * 3600) + (parseInt(mi ?? "0", 10) * 60) + parseInt(s ?? "0", 10);
}

interface PlaylistItem {
  contentDetails?: { videoId?: string; videoPublishedAt?: string };
  snippet?: { resourceId?: { videoId?: string } };
}
interface VideoResource {
  id: string;
  snippet?: { title?: string; description?: string; publishedAt?: string; thumbnails?: Record<string, { url: string }> };
  contentDetails?: { duration?: string };
  statistics?: { viewCount?: string };
}

/** Fetch the most recent N video ids from the channel's uploads playlist. */
export async function fetchRecentVideoIds(
  channelId: string, apiKey: string, max = 50,
): Promise<string[]> {
  const uploads = uploadsPlaylistOf(channelId);
  const ids: string[] = [];
  let pageToken: string | undefined = undefined;
  while (ids.length < max) {
    const url = new URL(`${API}/playlistItems`);
    url.searchParams.set("part", "contentDetails");
    url.searchParams.set("playlistId", uploads);
    url.searchParams.set("maxResults", String(Math.min(50, max - ids.length)));
    url.searchParams.set("key", apiKey);
    if (pageToken) url.searchParams.set("pageToken", pageToken);
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`playlistItems ${res.status}: ${await res.text()}`);
    const json = await res.json() as { items?: PlaylistItem[]; nextPageToken?: string };
    for (const it of json.items ?? []) {
      const id = it.contentDetails?.videoId ?? it.snippet?.resourceId?.videoId;
      if (id) ids.push(id);
    }
    pageToken = json.nextPageToken;
    if (!pageToken) break;
  }
  return ids;
}

/** Fetch full metadata (title, description, duration, views, thumb) for video ids. */
export async function fetchVideoMetas(ids: string[], apiKey: string): Promise<YTVideoMeta[]> {
  if (ids.length === 0) return [];
  // videos.list accepts up to 50 ids per call.
  const chunks: string[][] = [];
  for (let i = 0; i < ids.length; i += 50) chunks.push(ids.slice(i, i + 50));
  const out: YTVideoMeta[] = [];
  for (const chunk of chunks) {
    const url = new URL(`${API}/videos`);
    url.searchParams.set("part", "snippet,contentDetails,statistics");
    url.searchParams.set("id", chunk.join(","));
    url.searchParams.set("key", apiKey);
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`videos.list ${res.status}: ${await res.text()}`);
    const json = await res.json() as { items?: VideoResource[] };
    for (const v of json.items ?? []) {
      const title = v.snippet?.title ?? "";
      const description = v.snippet?.description ?? "";
      const th = v.snippet?.thumbnails ?? {};
      const thumb_url = th.maxres?.url ?? th.standard?.url ?? th.high?.url ?? th.medium?.url ?? th.default?.url ?? "";
      out.push({
        id: v.id,
        title,
        description,
        thumb_url,
        duration_seconds: parseIsoDuration(v.contentDetails?.duration ?? ""),
        published_at: v.snippet?.publishedAt ?? new Date().toISOString(),
        view_count: parseInt(v.statistics?.viewCount ?? "0", 10),
        detected_tags: classifyVideo(title, description),
      });
    }
  }
  return out;
}

export interface SyncResult { found: number; upserted: number; errors: string[] }

/**
 * Full sync: fetch recent videos and upsert. Pure function over its arguments
 * — takes the Supabase admin client by dependency injection so the cron route
 *  stays a thin wrapper.
 */
export async function syncChannel(
  supa: { from: (t: string) => { select: (c: string) => { in: (col: string, vals: string[]) => Promise<{ data: Array<{ id: string; tags: string[] }> | null; error: unknown }> } } & { upsert: (rows: unknown[], opts?: unknown) => Promise<{ error: unknown }> } },
  channelId: string, apiKey: string, max = 30,
): Promise<SyncResult> {
  const errors: string[] = [];
  const ids = await fetchRecentVideoIds(channelId, apiKey, max);
  const metas = await fetchVideoMetas(ids, apiKey);

  // Preserve owner-added tags across re-syncs. Pull existing tags for the
  // ids we're about to upsert and merge with detected ones.
  const existing = await supa.from("youtube_videos").select("id,tags").in("id", ids);
  const existingTags = new Map<string, string[]>();
  for (const row of existing.data ?? []) existingTags.set(row.id, row.tags ?? []);

  const rows = metas.map((m) => {
    const detected = m.detected_tags as string[];
    const prior = existingTags.get(m.id) ?? [];
    // Union, preserving order: detected first (most relevant), then any
    // owner overrides not already present.
    const merged = [...detected, ...prior.filter((t) => !detected.includes(t))];
    return {
      id: m.id,
      title: m.title,
      description: m.description,
      thumb_url: m.thumb_url,
      duration_seconds: m.duration_seconds,
      published_at: m.published_at,
      view_count: m.view_count,
      tags: merged,
      synced_at: new Date().toISOString(),
      // Intentionally NOT setting tool_pick / tool_pick_set_at / hidden —
      // upsert ignores omitted columns so existing owner values stay.
    };
  });

  const ups = await supa.from("youtube_videos").upsert(rows, { onConflict: "id" });
  if (ups.error) errors.push(`upsert: ${String(ups.error)}`);

  return { found: metas.length, upserted: rows.length, errors };
}
