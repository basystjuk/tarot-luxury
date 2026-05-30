/**
 * POST /api/admin/videos/resync
 *
 * Triggers a YouTube → Supabase sync on demand from the admin panel
 * (same logic as the hourly cron). Useful right after publishing a new
 * video and not wanting to wait an hour for it to surface.
 *
 * Auth: preview cookie OR CRON_SECRET bearer.
 */

import { NextRequest, NextResponse } from "next/server";
import { isPreviewFromRequest } from "@/lib/preview";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { syncChannel } from "@/lib/youtube/sync";

export const maxDuration = 30;

function authorised(req: NextRequest): boolean {
  if (isPreviewFromRequest(req)) return true;
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") === `Bearer ${secret}`) return true;
  return false;
}

export async function POST(req: NextRequest) {
  if (!authorised(req)) return new NextResponse("Not found", { status: 404 });
  const apiKey = process.env.YOUTUBE_API_KEY;
  const channelId = process.env.YOUTUBE_CHANNEL_ID;
  if (!apiKey || !channelId) {
    return NextResponse.json({ error: "not_configured", missing: { apiKey: !apiKey, channelId: !channelId } }, { status: 500 });
  }
  const supa = getSupabaseAdmin();
  if (!supa) return NextResponse.json({ error: "no_admin_client" }, { status: 503 });
  try {
    const result = await syncChannel(supa as never, channelId, apiKey, 30);
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    return NextResponse.json({ error: "sync_failed", detail: String(e) }, { status: 500 });
  }
}
