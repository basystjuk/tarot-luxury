import { list } from "@vercel/blob";
import { NextResponse } from "next/server";
import { DEFAULT_CELEBRATION, normalizeCelebration, type CelebrationConfig } from "@/lib/celebration";

/**
 * GET /api/celebration
 *
 * Tiny, always-on endpoint the overlay polls on every page load. Returns just
 * the celebration config (a few bytes) rather than the full site-content blob,
 * so the year-round network cost is negligible. Edge-cached ~60s like the rest
 * of the content pipeline.
 */

const CONTENT_BLOB = "site-content.json";
const CACHE = "public, s-maxage=60, stale-while-revalidate=300";

export async function GET() {
  const respond = (celebration: CelebrationConfig) =>
    NextResponse.json({ celebration }, { headers: { "Cache-Control": CACHE } });

  if (!process.env.BLOB_READ_WRITE_TOKEN) return respond(DEFAULT_CELEBRATION);

  try {
    const { blobs } = await list({ prefix: CONTENT_BLOB });
    const blob = blobs[0];
    if (!blob) return respond(DEFAULT_CELEBRATION);
    const res = await fetch(blob.url, { cache: "no-store" });
    const data = await res.json();
    return respond(normalizeCelebration(data?.celebration));
  } catch {
    return respond(DEFAULT_CELEBRATION);
  }
}
