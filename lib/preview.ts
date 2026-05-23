/**
 * Preview mode — lets the site owner browse disabled tools and bypass
 * AI-route rate limits without exposing them to the public.
 *
 * Implementation:
 *   - `ellen_preview`      — httpOnly cookie. Value = PREVIEW_SECRET. Server
 *                            routes trust this for gating (visibility + rate
 *                            limit bypass).
 *   - `ellen_preview_ui`   — non-httpOnly mirror, value "1". Lets the client
 *                            know preview is on without exposing the secret.
 *
 * Toggling is done from the admin panel via `/api/admin/preview`.
 */

export const PREVIEW_COOKIE = "ellen_preview";
export const PREVIEW_UI_COOKIE = "ellen_preview_ui";

/** The cookie value the server checks against. Override via env in production. */
export function getPreviewSecret(): string {
  return (
    process.env.PREVIEW_SECRET ||
    // Stable fallback — different from ADMIN_PASSWORD so the admin secret never
    // leaves the server. If you ever need to invalidate, set PREVIEW_SECRET.
    "ellen-preview-2026"
  );
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
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${PREVIEW_COOKIE}=([^;]+)`));
  if (!match) return false;
  try {
    return decodeURIComponent(match[1]) === getPreviewSecret();
  } catch {
    return false;
  }
}

/** Client-side hint: presence of the UI mirror cookie (safe to read in JS). */
export function isPreviewFromDocument(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie
    .split(";")
    .map((c) => c.trim())
    .some((c) => c === `${PREVIEW_UI_COOKIE}=1`);
}
