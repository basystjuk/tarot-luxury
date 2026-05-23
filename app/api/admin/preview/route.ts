import { NextRequest, NextResponse } from "next/server";
import {
  PREVIEW_COOKIE,
  PREVIEW_UI_COOKIE,
  getPreviewSecret,
} from "@/lib/preview";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "ellensoul2025";
// 90 days — long enough that the owner doesn't have to re-enable every visit,
// short enough that an abandoned device eventually loses access.
const MAX_AGE_SECONDS = 60 * 60 * 24 * 90;

export async function POST(req: NextRequest) {
  const password = req.headers.get("x-admin-password");
  if (password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { enabled?: boolean } = {};
  try {
    body = await req.json();
  } catch {
    // empty body → treat as enable
  }
  const enable = body.enabled !== false;

  const res = NextResponse.json({ ok: true, preview: enable });

  if (enable) {
    res.cookies.set(PREVIEW_COOKIE, getPreviewSecret(), {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: MAX_AGE_SECONDS,
    });
    res.cookies.set(PREVIEW_UI_COOKIE, "1", {
      httpOnly: false,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: MAX_AGE_SECONDS,
    });
  } else {
    res.cookies.delete(PREVIEW_COOKIE);
    res.cookies.delete(PREVIEW_UI_COOKIE);
  }

  return res;
}
