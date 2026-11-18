/**
 * Admin API access. Every admin route goes through this file.
 *
 * Sign-in happens on the server (/api/admin/login) and leaves an httpOnly,
 * signed session cookie. The password never reaches browser code, and there is
 * no built-in fallback: without a strong ADMIN_PASSWORD admin stays closed.
 */

import { NextResponse, type NextRequest } from "next/server";
import {
  ADMIN_SESSION_MAX_AGE_SECONDS,
  createAdminSessionToken,
  isValidAdminSessionToken,
  safeEqual,
  usableAdminPassword,
} from "@/lib/admin-session";

export const ADMIN_SESSION_COOKIE = "ellen_admin";

const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  // Only the admin API ever needs to see this cookie.
  path: "/api/admin",
} as const;

export function adminPassword(): string | null {
  return usableAdminPassword(process.env.ADMIN_PASSWORD);
}

export function isAdminRequest(req: NextRequest): boolean {
  const password = adminPassword();
  if (!password) return false;
  return isValidAdminSessionToken(password, req.cookies.get(ADMIN_SESSION_COOKIE)?.value);
}

/** Admin session, or the cron bearer secret for scripts. */
export function isAdminOrCronRequest(req: NextRequest): boolean {
  if (isAdminRequest(req)) return true;
  const secret = process.env.CRON_SECRET;
  return Boolean(secret) && safeEqual(req.headers.get("authorization") ?? "", `Bearer ${secret}`);
}

export function adminUnauthorized(): NextResponse {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: { "Cache-Control": "no-store" } });
}

export function setAdminSessionCookie(res: NextResponse, password: string): void {
  res.cookies.set(ADMIN_SESSION_COOKIE, createAdminSessionToken(password), {
    ...SESSION_COOKIE_OPTIONS,
    maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
  });
}

export function clearAdminSessionCookie(res: NextResponse): void {
  res.cookies.set(ADMIN_SESSION_COOKIE, "", { ...SESSION_COOKIE_OPTIONS, maxAge: 0 });
}

/**
 * Preview deployments use the same storage as the live site (Blob, Supabase)
 * until separate preview stores exist — an admin save there would change
 * production. So previews are read-only unless ALLOW_PREVIEW_WRITES=1.
 */
export function isPreviewReadOnly(): boolean {
  return process.env.VERCEL_ENV === "preview" && process.env.ALLOW_PREVIEW_WRITES !== "1";
}

/** 403 for admin writes on a read-only preview, or null to proceed. */
export function previewWriteBlocked(): NextResponse | null {
  if (!isPreviewReadOnly()) return null;
  return NextResponse.json(
    {
      error: "preview_read_only",
      message: "Це прев'ю-деплой: зміни вимкнено, бо сховище спільне з живим сайтом.",
    },
    { status: 403 },
  );
}
