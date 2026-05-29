/**
 * GET /api/push/vapid-public-key
 *
 * Returns the VAPID public key the browser needs to register a push
 * subscription. Public by design — the matching private key never
 * leaves the server.
 */

import { NextResponse } from "next/server";

export async function GET() {
  const key = process.env.VAPID_PUBLIC_KEY;
  if (!key) return NextResponse.json({ error: "not_configured" }, { status: 503 });
  return NextResponse.json({ key });
}
