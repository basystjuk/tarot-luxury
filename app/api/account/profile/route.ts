/**
 * GET  /api/account/profile  — returns the current user's profile row (or 401)
 * POST /api/account/profile  — updates the current user's profile from JSON body
 *
 * RLS on `public.profiles` keeps users from touching other users' rows; this
 * endpoint is therefore "auto-scoped" by the auth.uid() of the cookie.
 */

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

type ProfilePatch = {
  display_name?: string | null;
  full_name?: string | null;
  birth_date?: string | null;      // YYYY-MM-DD
  birth_time?: string | null;      // HH:MM
  birth_place?: string | null;
  birth_lat?: number | null;
  birth_lon?: number | null;
  birth_tz?: string | null;
  natal_moon_lon?: number | null;
  telegram_username?: string | null;
};

const ALLOWED_FIELDS = new Set<keyof ProfilePatch>([
  "display_name", "full_name",
  "birth_date", "birth_time", "birth_place",
  "birth_lat", "birth_lon", "birth_tz",
  "natal_moon_lon", "telegram_username",
]);

export async function GET() {
  const supa = await getSupabaseServer();
  if (!supa) return NextResponse.json({ error: "not_configured" }, { status: 503 });
  const { data: { user } } = await supa.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const { data, error } = await supa
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();
  if (error) {
    console.error("profile read error:", error);
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }
  return NextResponse.json({ profile: data ?? null });
}

export async function POST(req: NextRequest) {
  const supa = await getSupabaseServer();
  if (!supa) return NextResponse.json({ error: "not_configured" }, { status: 503 });
  const { data: { user } } = await supa.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "bad_json" }, { status: 400 }); }
  if (!body || typeof body !== "object") return NextResponse.json({ error: "bad_body" }, { status: 400 });

  // Whitelist + trim — never trust the client to send only allowed fields.
  const patch: ProfilePatch = {};
  for (const [k, v] of Object.entries(body)) {
    if (ALLOWED_FIELDS.has(k as keyof ProfilePatch)) {
      (patch as Record<string, unknown>)[k] = typeof v === "string" ? v.trim() || null : v;
    }
  }

  // Telegram username — strip leading @ if present, no other validation here.
  if (typeof patch.telegram_username === "string") {
    patch.telegram_username = patch.telegram_username.replace(/^@/, "") || null;
  }

  const { data, error } = await supa
    .from("profiles")
    .update(patch)
    .eq("id", user.id)
    .select("*")
    .maybeSingle();
  if (error) {
    console.error("profile update error:", error);
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }
  return NextResponse.json({ profile: data });
}
