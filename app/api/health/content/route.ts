import { NextResponse } from "next/server";
import { getContentStore } from "@/lib/content-store";
import { loadStoredContent } from "@/lib/public-content";

/**
 * GET /api/health/content — can the site read what the admin saved?
 *
 * The public pages fall back to code defaults when the content store can't be
 * read, so a broken read looks like a working site with old texts and prices
 * (that hid a 400 from Vercel Blob for seven weeks, RETROSPECTIVE 2026-11-26).
 * This endpoint answers 503 in that case, for an uptime monitor to alert on.
 * Only a status word leaves here: no content, no error details.
 */
export async function GET() {
  const headers = { "Cache-Control": "no-store" };
  if (!getContentStore()) {
    return NextResponse.json({ ok: false, reason: "not_configured" }, { status: 503, headers });
  }
  try {
    const stored = await loadStoredContent();
    if (!stored) return NextResponse.json({ ok: false, reason: "missing" }, { status: 503, headers });
    return NextResponse.json({ ok: true }, { headers });
  } catch (err) {
    console.error("[health] content store unreadable:", err);
    return NextResponse.json({ ok: false, reason: "read_failed" }, { status: 503, headers });
  }
}
