import { NextRequest, NextResponse } from "next/server";
import { adminPassword, setAdminSessionCookie } from "@/lib/admin-auth";
import { safeEqual } from "@/lib/admin-session";
import { clientIp, consumeRateLimit } from "@/lib/rate-limit";
import { readJsonBody } from "@/lib/request-limits";

const MAX_ATTEMPTS = 10;
const WINDOW_SECONDS = 15 * 60;
const NO_STORE = { "Cache-Control": "no-store" };

/** POST { password } — checks the password on the server and opens a session. */
export async function POST(req: NextRequest) {
  const password = adminPassword();
  if (!password) {
    return NextResponse.json({ error: "admin_not_configured" }, { status: 503, headers: NO_STORE });
  }

  if (!(await consumeRateLimit("admin-login", clientIp(req), MAX_ATTEMPTS, WINDOW_SECONDS))) {
    return NextResponse.json(
      { error: "rate_limit" },
      { status: 429, headers: { ...NO_STORE, "Retry-After": String(WINDOW_SECONDS) } },
    );
  }

  const parsed = await readJsonBody<{ password?: unknown }>(req, 1024);
  if (parsed.deny) return parsed.deny;

  const given = parsed.data.password;
  if (typeof given !== "string" || !safeEqual(given, password)) {
    return NextResponse.json({ error: "wrong_password" }, { status: 401, headers: NO_STORE });
  }

  const res = NextResponse.json({ ok: true }, { headers: NO_STORE });
  setAdminSessionCookie(res, password);
  return res;
}
