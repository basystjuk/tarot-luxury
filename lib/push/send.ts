/**
 * Server-side Web Push helper (Phase M12).
 *
 * Wraps the `web-push` library so callers don't have to know about VAPID,
 * payload size limits, or stale-subscription cleanup. Used by:
 *   - /api/push/test            (one-off "test" send to the current user)
 *   - /api/cron/notifications   (daily fan-out alongside Telegram)
 *
 * Env vars (set in Vercel):
 *   VAPID_PUBLIC_KEY    — base64url, also shipped to the client
 *   VAPID_PRIVATE_KEY   — base64url, server only
 *   VAPID_SUBJECT       — mailto:owner@ellen-soul.com (RFC 8292)
 */

import webpush, { type PushSubscription as WebPushSubscription } from "web-push";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export interface PushPayload {
  title: string;
  body: string;
  url?: string;       // where to navigate on click
  tag?: string;       // collapses duplicates of the same kind
  icon?: string;
}

let configured = false;
function ensureConfigured(): boolean {
  if (configured) return true;
  const pub = process.env.VAPID_PUBLIC_KEY;
  const prv = process.env.VAPID_PRIVATE_KEY;
  const sub = process.env.VAPID_SUBJECT || "mailto:owner@ellen-soul.com";
  if (!pub || !prv) return false;
  webpush.setVapidDetails(sub, pub, prv);
  configured = true;
  return true;
}

export function isPushConfigured(): boolean {
  return Boolean(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY);
}

interface SubRow {
  endpoint: string;
  p256dh: string;
  auth: string;
}

/**
 * Send the same payload to every subscription belonging to `userId`.
 * Stale subscriptions (410 Gone / 404) are deleted automatically.
 * Returns the number of successfully delivered messages.
 */
export async function sendPushToUser(userId: string, payload: PushPayload): Promise<number> {
  if (!ensureConfigured()) return 0;
  const admin = getSupabaseAdmin();
  if (!admin) return 0;

  const { data: subs } = await admin
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth")
    .eq("user_id", userId);

  if (!subs || subs.length === 0) return 0;

  const json = JSON.stringify(payload);
  let delivered = 0;
  const stale: string[] = [];

  await Promise.all((subs as SubRow[]).map(async (s) => {
    const subscription: WebPushSubscription = {
      endpoint: s.endpoint,
      keys: { p256dh: s.p256dh, auth: s.auth },
    };
    try {
      await webpush.sendNotification(subscription, json, { TTL: 24 * 3600 });
      delivered++;
    } catch (e: unknown) {
      const code = (e as { statusCode?: number })?.statusCode;
      if (code === 404 || code === 410) {
        stale.push(s.endpoint);
      } else {
        console.error("push send error", code, e);
      }
    }
  }));

  if (stale.length > 0) {
    await admin.from("push_subscriptions").delete().in("endpoint", stale);
  }
  return delivered;
}
