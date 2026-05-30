/**
 * GET /api/cron/youtube-sync
 *
 * Pulls the latest videos from the configured YouTube channel and upserts
 * their metadata into Supabase. Runs hourly via Vercel Cron.
 *
 * Auth: same Bearer CRON_SECRET as the notifications cron.
 *
 * Env required:
 *   YOUTUBE_API_KEY     — Google Cloud API key (YouTube Data API v3 enabled)
 *   YOUTUBE_CHANNEL_ID  — UCxxxx... channel id
 *   CRON_SECRET         — already set
 */

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { syncChannel } from "@/lib/youtube/sync";
import { indexNowSubmit, journalUrls } from "@/lib/seo/indexnow";

export const maxDuration = 30;

function isAuthorised(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(req: NextRequest) {
  if (!isAuthorised(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const apiKey = process.env.YOUTUBE_API_KEY;
  const channelId = process.env.YOUTUBE_CHANNEL_ID;
  if (!apiKey || !channelId) {
    return NextResponse.json({ error: "not_configured", missing: { apiKey: !apiKey, channelId: !channelId } }, { status: 500 });
  }
  const supa = getSupabaseAdmin();
  if (!supa) return NextResponse.json({ error: "supabase_unavailable" }, { status: 503 });

  try {
    // 30 latest covers ~10 days at 2-3 uploads/day — plenty to keep the
    // journal current without burning quota.
    const result = await syncChannel(supa as never, channelId, apiKey, 30);
    // Best-effort IndexNow ping so Bing/Yandex see new videos within minutes
    // rather than waiting for their own crawl cycle.
    const ping = await indexNowSubmit(journalUrls());
    return NextResponse.json({ ok: true, ...result, indexnow: ping });
  } catch (e) {
    console.error("youtube-sync error:", e);
    return NextResponse.json({ error: "sync_failed", detail: String(e) }, { status: 500 });
  }
}
