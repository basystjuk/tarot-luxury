/**
 * Admin session primitives: password check and signed session tokens.
 *
 * No framework imports, so `npm test` can exercise them directly. The request
 * wrappers live in lib/admin-auth.ts.
 *
 * A token is `<expiry in unix seconds>.<HMAC of the expiry>`. The signing key
 * is derived from ADMIN_PASSWORD, so changing the password signs everyone out.
 */

import { createHash, createHmac, timingSafeEqual } from "node:crypto";

/** Shorter passwords are refused outright: admin sign-in stays closed. */
export const ADMIN_PASSWORD_MIN_LENGTH = 16;
export const ADMIN_SESSION_MAX_AGE_SECONDS = 60 * 60 * 12;

/** The configured password, or null when it is missing or too weak to accept. */
export function usableAdminPassword(raw: string | undefined): string | null {
  const password = raw?.trim();
  return password && password.length >= ADMIN_PASSWORD_MIN_LENGTH ? password : null;
}

const sha256 = (value: string) => createHash("sha256").update(value).digest();

/** Constant-time string comparison (hashing first evens out the lengths). */
export function safeEqual(a: string, b: string): boolean {
  return timingSafeEqual(sha256(a), sha256(b));
}

/** Derives a purpose-bound secret, so one value never serves two jobs. */
export function deriveSecret(password: string, purpose: string): string {
  return createHmac("sha256", password).update(purpose).digest("hex");
}

function signature(password: string, expires: string): string {
  return createHmac("sha256", deriveSecret(password, "admin-session-v1")).update(expires).digest("hex");
}

export function createAdminSessionToken(password: string, nowMs: number = Date.now()): string {
  const expires = String(Math.floor(nowMs / 1000) + ADMIN_SESSION_MAX_AGE_SECONDS);
  return `${expires}.${signature(password, expires)}`;
}

export function isValidAdminSessionToken(
  password: string,
  token: string | undefined,
  nowMs: number = Date.now(),
): boolean {
  if (!token) return false;
  const match = /^(\d{1,12})\.([0-9a-f]{64})$/.exec(token);
  if (!match) return false;
  const [, expires, given] = match;
  if (!safeEqual(given, signature(password, expires))) return false;
  return Number(expires) * 1000 > nowMs;
}
