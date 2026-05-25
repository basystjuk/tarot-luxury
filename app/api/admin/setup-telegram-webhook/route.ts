/**
 * POST /api/admin/setup-telegram-webhook
 *
 * One-shot bootstrap that calls Telegram's setWebhook with our handler URL
 * and the secret token from env. Admin-only (preview cookie gate).
 *
 * Why a route and not a manual curl: we never expose TELEGRAM_BOT_TOKEN
 * to the developer's laptop (Vercel encrypts production secrets and
 * `vercel env pull` strips their values). This route runs on Vercel
 * where the token is available, so the secret never leaves the server.
 *
 * Idempotent: safe to call multiple times. Telegram simply overwrites
 * the previous webhook config.
 */

import { NextRequest, NextResponse } from "next/server";
import { isPreviewFromRequest } from "@/lib/preview";

export const maxDuration = 15;

interface SetupResult {
  configured: boolean;
  webhook_url?: string;
  set_response?: unknown;
  current_info?: unknown;
  error?: string;
}

function authorised(req: NextRequest): boolean {
  // Two auth paths: admin preview cookie (browser) OR CRON_SECRET bearer
  // (CLI / scripts). The bearer is the same secret used by Vercel Cron,
  // so it's already in env and rotated alongside cron auth.
  if (isPreviewFromRequest(req)) return true;
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

export async function POST(req: NextRequest): Promise<NextResponse<SetupResult>> {
  if (!authorised(req)) {
    return NextResponse.json({ configured: false, error: "unauthorized" }, { status: 404 });
  }

  const token  = process.env.TELEGRAM_BOT_TOKEN;
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!token) return NextResponse.json({ configured: false, error: "no_token" }, { status: 503 });

  // Resolve the public origin for the webhook callback.
  // Prefer VERCEL_URL when present (gives the canonical deploy URL),
  // else hardcode the production domain.
  const origin = process.env.VERCEL_URL ? `https://ellen-soul.com` : "https://ellen-soul.com";
  const webhook_url = `${origin}/api/telegram/webhook`;

  try {
    const setRes = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: webhook_url,
        secret_token: secret ?? undefined,
        drop_pending_updates: true,
        allowed_updates: ["message"],
      }),
    });
    const setJson = await setRes.json();

    // Fetch current webhook info for confirmation
    const infoRes = await fetch(`https://api.telegram.org/bot${token}/getWebhookInfo`);
    const infoJson = await infoRes.json();

    return NextResponse.json({
      configured: setJson?.ok === true,
      webhook_url,
      set_response: setJson,
      current_info: infoJson,
    });
  } catch (e) {
    return NextResponse.json({
      configured: false,
      error: e instanceof Error ? e.message : "unknown",
    }, { status: 500 });
  }
}

// Also expose GET that just reports current state (no mutation)
export async function GET(req: NextRequest) {
  if (!authorised(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 404 });
  }
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return NextResponse.json({ error: "no_token" }, { status: 503 });
  const me  = await fetch(`https://api.telegram.org/bot${token}/getMe`).then(r => r.json());
  const wh  = await fetch(`https://api.telegram.org/bot${token}/getWebhookInfo`).then(r => r.json());
  return NextResponse.json({ getMe: me, getWebhookInfo: wh });
}
