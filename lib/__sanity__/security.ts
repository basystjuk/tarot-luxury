/**
 * Sanity checks for the security primitives — not a real test runner; runs as
 * part of `npm test`. Sets process.exitCode = 1 on any mismatch.
 */

import {
  ADMIN_SESSION_MAX_AGE_SECONDS,
  createAdminSessionToken,
  deriveSecret,
  isValidAdminSessionToken,
  safeEqual,
  usableAdminPassword,
} from "../admin-session";
import { isAllowedPushEndpoint, isValidPushKey } from "../push/endpoint";
import { consumeMemoryLimit } from "../rate-limit-memory";
import { escapeHtml } from "../telegram/bot";

function eq(label: string, actual: unknown, expected: unknown) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) {
    console.error(`FAIL ${label}\n  expected: ${e}\n  actual:   ${a}`);
    process.exitCode = 1;
  } else {
    console.log(`OK   ${label}`);
  }
}

// ── Admin password rules ──────────────────────────────────────────────────
const PASSWORD = "sanity-check-password-1";
eq("missing password refused", usableAdminPassword(undefined), null);
eq("blank password refused", usableAdminPassword("                    "), null);
eq("short password refused", usableAdminPassword("fifteen-chars-x"), null);
eq("long password accepted", usableAdminPassword(PASSWORD), PASSWORD);
eq("equal strings match", safeEqual("same", "same"), true);
eq("different strings differ", safeEqual("same", "other"), false);
eq("derived secrets are purpose-bound", deriveSecret(PASSWORD, "a") === deriveSecret(PASSWORD, "b"), false);

// ── Admin session tokens ──────────────────────────────────────────────────
const NOW = 1_800_000_000_000;
const token = createAdminSessionToken(PASSWORD, NOW);
const [expires, signature] = token.split(".");
eq("fresh token valid", isValidAdminSessionToken(PASSWORD, token, NOW), true);
eq("valid just before expiry", isValidAdminSessionToken(PASSWORD, token, NOW + (ADMIN_SESSION_MAX_AGE_SECONDS - 1) * 1000), true);
eq("expired token refused", isValidAdminSessionToken(PASSWORD, token, NOW + ADMIN_SESSION_MAX_AGE_SECONDS * 1000), false);
eq("new password invalidates sessions", isValidAdminSessionToken("another-long-password-2", token, NOW), false);
eq("extended expiry refused", isValidAdminSessionToken(PASSWORD, `${Number(expires) + 9999}.${signature}`, NOW), false);
eq("forged signature refused", isValidAdminSessionToken(PASSWORD, `${expires}.${"0".repeat(64)}`, NOW), false);
eq("empty token refused", isValidAdminSessionToken(PASSWORD, undefined, NOW), false);
eq("garbage token refused", isValidAdminSessionToken(PASSWORD, "admin=true", NOW), false);

// ── Push endpoints ────────────────────────────────────────────────────────
for (const ok of [
  "https://fcm.googleapis.com/fcm/send/abc",
  "https://web.push.apple.com/QAbc",
  "https://updates.push.services.mozilla.com/wpush/v2/abc",
  "https://wns2-par02p.notify.windows.com/w/?token=abc",
]) eq(`push allowed: ${new URL(ok).hostname}`, isAllowedPushEndpoint(ok), true);

for (const bad of [
  "http://fcm.googleapis.com/fcm/send/abc",
  "https://fcm.googleapis.com:8443/fcm/send/abc",
  "https://user:pass@fcm.googleapis.com/fcm/send/abc",
  "https://fcm.googleapis.com.evil.example/x",
  "https://evilpush.apple.com/x",
  "https://push.apple.com.evil.example/x",
  "https://169.254.169.254/latest/meta-data",
  "https://localhost/x",
  "not a url",
  42,
]) eq(`push refused: ${String(bad).slice(0, 44)}`, isAllowedPushEndpoint(bad), false);

eq("push endpoint length capped", isAllowedPushEndpoint(`https://fcm.googleapis.com/${"a".repeat(1100)}`), false);
eq("push key accepted", isValidPushKey("BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4YfYCA_0QTpQ"), true);
eq("push key with markup refused", isValidPushKey("<script>"), false);
eq("oversized push key refused", isValidPushKey("a".repeat(129)), false);

// ── Fallback rate limiter ─────────────────────────────────────────────────
const store = new Map<string, { count: number; resetAt: number }>();
eq("limit: 1st allowed", consumeMemoryLimit(store, "k", 2, 1000, 0), true);
eq("limit: 2nd allowed", consumeMemoryLimit(store, "k", 2, 1000, 10), true);
eq("limit: 3rd blocked", consumeMemoryLimit(store, "k", 2, 1000, 20), false);
eq("limit: other key independent", consumeMemoryLimit(store, "other", 2, 1000, 20), true);
eq("limit: resets after window", consumeMemoryLimit(store, "k", 2, 1000, 1000), true);
const crowded = new Map<string, { count: number; resetAt: number }>();
for (let i = 0; i < 6000; i++) consumeMemoryLimit(crowded, `k${i}`, 1, 60_000, 0);
eq("limit: memory stays bounded", crowded.size <= 5000, true);

// ── Telegram text ─────────────────────────────────────────────────────────
eq(
  "display name cannot inject a link",
  escapeHtml('<a href="https://evil.example">Ellen</a>'),
  '&lt;a href="https://evil.example"&gt;Ellen&lt;/a&gt;',
);

console.log("\nsecurity sanity checks done");
