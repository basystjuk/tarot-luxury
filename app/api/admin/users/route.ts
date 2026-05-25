/**
 * GET /api/admin/users
 *
 * Admin-only list of all registered users.
 * Joins profiles + notification_prefs + counts the user's card draws.
 *
 * Query params:
 *   ?q=<search>     — match email, display_name, full_name, telegram_username
 *   ?limit=<n>      — page size (default 50, max 200)
 *   ?offset=<n>     — pagination offset
 *   ?sort=<field>   — created_at_desc (default) | created_at_asc | last_seen_desc
 *
 * Auth: preview cookie (ellen_preview) OR CRON_SECRET bearer.
 *
 * Bypass RLS via service-role client — RLS protects regular user APIs
 * but admin work needs cross-row reads.
 */

import { NextRequest, NextResponse } from "next/server";
import { isPreviewFromRequest } from "@/lib/preview";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

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

  const url     = new URL(req.url);
  const q       = (url.searchParams.get("q") ?? "").trim();
  const limit   = Math.min(200, Math.max(1, parseInt(url.searchParams.get("limit") ?? "50", 10) || 50));
  const offset  = Math.max(0, parseInt(url.searchParams.get("offset") ?? "0", 10) || 0);
  const sort    = url.searchParams.get("sort") ?? "created_at_desc";

  // Build query. Use the profiles view-style projection + select count for paging.
  let query = admin
    .from("profiles")
    .select("*", { count: "exact" });

  if (q) {
    // PostgREST `or` filter — case-insensitive contains across 4 cols.
    const safe = q.replace(/[%_]/g, ""); // strip wildcards from user input
    query = query.or(`email.ilike.%${safe}%,display_name.ilike.%${safe}%,full_name.ilike.%${safe}%,telegram_username.ilike.%${safe}%`);
  }

  // Sort
  if (sort === "created_at_asc") {
    query = query.order("created_at", { ascending: true });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;
  if (error) {
    console.error("admin users list error:", error);
    return NextResponse.json({ error: "db_error", detail: error.message }, { status: 500 });
  }

  // Enrich with per-user stats (small N for now — single-digit users in early days)
  const userIds = (data ?? []).map(p => p.id);
  const stats: Record<string, { cards: number; notifications: number }> = {};
  if (userIds.length > 0) {
    const [cardsRes, notifRes] = await Promise.all([
      admin.from("tarot_history").select("user_id", { count: "exact", head: false }).in("user_id", userIds),
      admin.from("notification_log").select("user_id", { count: "exact", head: false }).in("user_id", userIds),
    ]);
    for (const id of userIds) stats[id] = { cards: 0, notifications: 0 };
    for (const row of cardsRes.data ?? []) stats[row.user_id].cards++;
    for (const row of notifRes.data ?? []) stats[row.user_id].notifications++;
  }

  return NextResponse.json({
    total: count ?? 0,
    limit, offset,
    users: (data ?? []).map(p => ({
      ...p,
      stats: stats[p.id] ?? { cards: 0, notifications: 0 },
    })),
  });
}
