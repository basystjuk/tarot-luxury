import { NextResponse } from "next/server";
import { normalizeCelebration } from "@/lib/celebration";
import { loadPublicContent } from "@/lib/public-content";

/**
 * GET /api/celebration
 *
 * Tiny, always-on endpoint the overlay polls on every page load. Returns just
 * the celebration config (a few bytes) rather than the full site-content blob,
 * so the year-round network cost is negligible. Edge-cached ~60s like the rest
 * of the content pipeline.
 */

const CACHE = "public, s-maxage=60, stale-while-revalidate=300";

export async function GET() {
  const content = await loadPublicContent();
  return NextResponse.json(
    { celebration: normalizeCelebration(content.celebration) },
    { headers: { "Cache-Control": CACHE } },
  );
}
