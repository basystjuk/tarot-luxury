/**
 * GET /api/admin/analytics-status
 *
 * Admin-only diagnostic. Returns whether PostHog is wired up:
 *   - posthog_key_present     — the public key is non-empty
 *   - posthog_host            — what the SDK is pointed at
 *   - posthog_reachable       — can we hit the EU ingest from the server?
 *
 * Protected by the admin preview cookie. If you don't have the cookie,
 * the route 404s (no info leak about its existence).
 */

import { NextRequest, NextResponse } from "next/server";
import { isPreviewFromRequest } from "@/lib/preview";

export const maxDuration = 15;

export async function GET(req: NextRequest) {
  if (!isPreviewFromRequest(req)) {
    return new NextResponse("Not found", { status: 404 });
  }

  const key  = process.env.NEXT_PUBLIC_POSTHOG_KEY  ?? "";
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "";

  // Quick reachability ping to the EU ingest. We hit /decide?v=3 which is
  // a small JSON endpoint and respects POSTs but accepts GETs in the SDK
  // path; 200 means PostHog can be reached even if the project key is wrong.
  let posthog_reachable = false;
  let posthog_ms: number | null = null;
  if (key) {
    try {
      const t0 = Date.now();
      const probe = await fetch("https://eu.i.posthog.com/decide?v=3", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ api_key: key, distinct_id: "admin-diagnostic" }),
        signal: AbortSignal.timeout(5000),
      });
      posthog_ms = Date.now() - t0;
      posthog_reachable = probe.ok;
    } catch {
      posthog_reachable = false;
    }
  }

  return NextResponse.json({
    posthog_key_present: Boolean(key),
    posthog_key_prefix:  key ? `${key.slice(0, 8)}…` : null,
    posthog_host:        host || null,
    posthog_reachable,
    posthog_ms,
    region: "eu",
  });
}
