/**
 * Admin API access check shared by the admin routes added with the redesigned
 * panel. Same rule the older admin routes use (x-admin-password header) —
 * kept in one place so replacing it with per-person accounts touches one file.
 */

import { NextResponse, type NextRequest } from "next/server";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "ellensoul2025";

export function isAdminRequest(req: NextRequest): boolean {
  return req.headers.get("x-admin-password") === ADMIN_PASSWORD;
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
