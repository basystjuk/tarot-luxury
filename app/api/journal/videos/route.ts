/**
 * GET /api/journal/videos
 *
 * Public list of journal videos for the /blog page. No auth — RLS on
 * youtube_videos allows anon reads of non-hidden rows.
 *
 * Returns videos sorted by published_at desc.
 */

import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

export const revalidate = 300; // 5 min CDN cache — sync runs hourly anyway

export interface JournalVideo {
  id: string;
  title: string;
  description: string | null;
  thumb_url: string;
  duration_seconds: number | null;
  published_at: string;
  view_count: number | null;
  tags: string[];
  tool_pick: string | null;
}

export async function GET() {
  const supa = await getSupabaseServer();
  if (!supa) return NextResponse.json({ videos: [] });

  const { data, error } = await supa
    .from("youtube_videos")
    .select("id,title,description,thumb_url,duration_seconds,published_at,view_count,tags,tool_pick")
    .eq("hidden", false)
    .order("published_at", { ascending: false })
    .limit(60);
  if (error) return NextResponse.json({ videos: [], error: error.message }, { status: 500 });
  return NextResponse.json({ videos: (data ?? []) as JournalVideo[] });
}
