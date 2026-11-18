/**
 * Rate limits shared by every server instance (Supabase, migration 0008).
 *
 * Keys are hashed before storage, so the table holds no IP addresses or user
 * ids. Falls back to per-instance memory if the database call fails.
 */

import { createHmac } from "node:crypto";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { consumeMemoryLimit } from "@/lib/rate-limit-memory";
import { studioDayISO } from "@/lib/time/day";

const memory = new Map<string, { count: number; resetAt: number }>();
let warned = false;

function storageKey(scope: string, subject: string): string {
  const salt = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "local-rate-limit";
  return `${scope}:${createHmac("sha256", salt).update(subject).digest("hex").slice(0, 40)}`;
}

/** Counts one attempt. Returns false once `limit` is exceeded within the window. */
export async function consumeRateLimit(
  scope: string,
  subject: string,
  limit: number,
  windowSeconds: number,
): Promise<boolean> {
  const key = storageKey(scope, subject);
  const admin = getSupabaseAdmin();
  if (admin) {
    const { data, error } = await admin.rpc("consume_rate_limit", {
      p_key: key,
      p_limit: limit,
      p_window_seconds: windowSeconds,
    });
    if (!error && typeof data === "boolean") return data;
    if (!warned) {
      warned = true;
      console.warn("[rate-limit] shared limiter unavailable, using memory (migration 0008 applied?)", error?.code);
    }
  }
  return consumeMemoryLimit(memory, key, limit, windowSeconds * 1000);
}

/** One use per subject per Kyiv calendar day, per tool. */
export function consumeDailyQuota(tool: string, subject: string): Promise<boolean> {
  return consumeRateLimit(`${tool}:${studioDayISO()}`, subject, 1, 2 * 24 * 60 * 60);
}

/** The visitor's address as reported by the platform's proxy. */
export function clientIp(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}
