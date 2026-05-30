/**
 * /api/admin/videos
 *
 *   GET  — list ALL videos (including hidden), newest first
 *   PATCH — { id, hidden?, tool_pick?, tags? } update moderation fields
 *
 * Auth: preview cookie OR CRON_SECRET bearer (same pattern as users admin).
 * Service-role client bypasses RLS so we can see hidden rows too.
 */

import { NextRequest, NextResponse } from "next/server";
import { isPreviewFromRequest } from "@/lib/preview";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { ALL_TOOL_IDS, type ToolId } from "@/lib/tools-config";

function authorised(req: NextRequest): boolean {
  if (isPreviewFromRequest(req)) return true;
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") === `Bearer ${secret}`) return true;
  return false;
}

export async function GET(req: NextRequest) {
  if (!authorised(req)) return new NextResponse("Not found", { status: 404 });
  const admin = getSupabaseAdmin();
  if (!admin) return NextResponse.json({ error: "no_admin_client" }, { status: 503 });

  const { data, error } = await admin
    .from("youtube_videos")
    .select("id,title,description,thumb_url,duration_seconds,published_at,view_count,tags,tool_pick,tool_pick_set_at,hidden,synced_at")
    .order("published_at", { ascending: false })
    .limit(200);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ videos: data ?? [] });
}

export async function PATCH(req: NextRequest) {
  if (!authorised(req)) return new NextResponse("Not found", { status: 404 });
  const admin = getSupabaseAdmin();
  if (!admin) return NextResponse.json({ error: "no_admin_client" }, { status: 503 });

  let body: { id?: string; hidden?: boolean; tool_pick?: string | null; tags?: string[] };
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "bad_json" }, { status: 400 }); }

  if (!body.id) return NextResponse.json({ error: "id_required" }, { status: 400 });

  const patch: Record<string, unknown> = {};
  if (typeof body.hidden === "boolean") patch.hidden = body.hidden;
  if (Array.isArray(body.tags)) patch.tags = body.tags.filter((t) => typeof t === "string").slice(0, 10);
  if (body.tool_pick === null) {
    patch.tool_pick = null;
    patch.tool_pick_set_at = null;
  } else if (typeof body.tool_pick === "string") {
    if (!(ALL_TOOL_IDS as string[]).includes(body.tool_pick)) {
      return NextResponse.json({ error: "invalid_tool" }, { status: 400 });
    }
    patch.tool_pick = body.tool_pick as ToolId;
    patch.tool_pick_set_at = new Date().toISOString();
  }
  if (Object.keys(patch).length === 0) return NextResponse.json({ ok: true, noop: true });

  const { data, error } = await admin
    .from("youtube_videos").update(patch).eq("id", body.id).select("*").maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, video: data });
}
