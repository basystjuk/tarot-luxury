import { NextRequest, NextResponse } from "next/server";
import { loadPublicContent } from "@/lib/public-content";
import { isPreviewFromRequest } from "@/lib/preview";

// Short edge cache so admin tool-toggles propagate within ~60s.
// Preview-mode callers always bypass cache (per-request cookie).
const PUBLIC_CACHE = "public, s-maxage=60, stale-while-revalidate=300";
const PREVIEW_CACHE = "private, no-store";

// Public content for client pages. AI prompts and save metadata are
// server-only and never included (see lib/public-content.ts).
export async function GET(req: NextRequest) {
  const preview = isPreviewFromRequest(req);
  const content = await loadPublicContent();
  return NextResponse.json(
    { ...content, preview },
    { headers: { "Cache-Control": preview ? PREVIEW_CACHE : PUBLIC_CACHE } },
  );
}
