import { NextResponse } from "next/server";
import { clearAdminSessionCookie } from "@/lib/admin-auth";
import { PREVIEW_COOKIE, PREVIEW_UI_COOKIE } from "@/lib/preview";

/** POST — ends the admin session on this device. */
export async function POST() {
  const res = NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  clearAdminSessionCookie(res);
  res.cookies.delete(PREVIEW_COOKIE);
  res.cookies.delete(PREVIEW_UI_COOKIE);
  return res;
}
