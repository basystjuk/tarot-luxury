/**
 * Server-side reader for site-content.json.
 *
 * AI routes call this to pick up admin prompt overrides. The blob fetch
 * adds ~50–150 ms; we cache module-level for 30 s so a burst of requests
 * doesn't repeatedly hit the blob store. Cache invalidates implicitly on
 * cold start (which happens often enough on serverless).
 */

import { list } from "@vercel/blob";

const CONTENT_BLOB = "site-content.json";
const CACHE_TTL_MS = 30_000;

interface CacheEntry {
  fetchedAt: number;
  data: Record<string, unknown> | null;
}

let cache: CacheEntry | null = null;

export async function loadSiteContent(): Promise<Record<string, unknown> | null> {
  const now = Date.now();
  if (cache && now - cache.fetchedAt < CACHE_TTL_MS) {
    return cache.data;
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    cache = { fetchedAt: now, data: null };
    return null;
  }

  try {
    const { blobs } = await list({ prefix: CONTENT_BLOB });
    const blob = blobs[0];
    if (!blob) {
      cache = { fetchedAt: now, data: null };
      return null;
    }
    const res = await fetch(blob.url, { cache: "no-store" });
    const data = (await res.json()) as Record<string, unknown>;
    cache = { fetchedAt: now, data };
    return data;
  } catch {
    // Fail-soft: never block AI generation on a blob hiccup.
    cache = { fetchedAt: now, data: null };
    return null;
  }
}

/** Convenience: grab just the AI prompts override map. */
export async function loadPromptOverrides(): Promise<Record<string, { system?: string; user?: string }> | null> {
  const content = await loadSiteContent();
  const ai = content?.ai_prompts;
  if (!ai || typeof ai !== "object") return null;
  return ai as Record<string, { system?: string; user?: string }>;
}
