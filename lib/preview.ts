/**
 * Preview mode — lets the signed-in site owner browse disabled tools and bypass
 * AI-route rate limits without exposing them to the public.
 *
 * Implementation:
 *   - `ellen_preview`      — httpOnly cookie. Value = the preview secret. Server
 *                            routes trust this for gating (visibility + rate
 *                            limit bypass). It never grants admin API access.
 *   - `ellen_preview_ui`   — non-httpOnly mirror, value "1". Lets the client
 *                            know preview is on without exposing the secret.
 *
 * Toggled from the admin panel via `/api/admin/preview`, cleared at admin sign-out.
 */

import { deriveSecret, safeEqual, usableAdminPassword } from "./admin-session";

export const PREVIEW_COOKIE = "ellen_preview";
export const PREVIEW_UI_COOKIE = "ellen_preview_ui";

/**
 * The cookie value the server checks against: PREVIEW_SECRET when it is long
 * enough, otherwise derived from ADMIN_PASSWORD. Null keeps preview mode off.
 */
export function getPreviewSecret(): string | null {
  const explicit = usableAdminPassword(process.env.PREVIEW_SECRET);
  if (explicit) return explicit;
  const password = usableAdminPassword(process.env.ADMIN_PASSWORD);
  return password ? deriveSecret(password, "preview-cookie-v1") : null;
}

/** Server-side check based on a Request's `Cookie` header. */
export function isPreviewFromRequest(req: Request): boolean {
  const cookieHeader = req.headers.get("cookie") || "";
  return cookieMatches(cookieHeader);
}

/** Server-side check from a raw cookie string (e.g. `next/headers`). */
export function isPreviewFromCookieString(cookieHeader: string | null | undefined): boolean {
  return cookieMatches(cookieHeader || "");
}

function cookieMatches(cookieHeader: string): boolean {
  const secret = getPreviewSecret();
  if (!secret) return false;
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${PREVIEW_COOKIE}=([^;]+)`));
  if (!match) return false;
  try {
    return safeEqual(decodeURIComponent(match[1]), secret);
  } catch {
    return false;
  }
}
