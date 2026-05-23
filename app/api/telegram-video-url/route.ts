import { NextRequest, NextResponse } from "next/server";

/**
 * Returns a short-lived redirect to the Telegram CDN for a given file_id.
 * The bot token stays server-side; the client just gets a 302 to the CDN.
 */
export async function GET(req: NextRequest) {
  const fileId = req.nextUrl.searchParams.get("file_id");
  if (!fileId) {
    return NextResponse.json({ error: "missing file_id" }, { status: 400 });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "not_configured" }, { status: 500 });
  }

  try {
    const res = await fetch(
      `https://api.telegram.org/bot${token}/getFile?file_id=${encodeURIComponent(fileId)}`,
      { next: { revalidate: 3000 } } // cache resolved path for ~50 min (URLs last ~1h)
    );
    const data = await res.json();

    if (!data.ok || !data.result?.file_path) {
      return NextResponse.json({ error: "file_not_found" }, { status: 404 });
    }

    const cdnUrl = `https://api.telegram.org/file/bot${token}/${data.result.file_path}`;

    // 302 redirect — browser/video element follows automatically
    return NextResponse.redirect(cdnUrl, {
      status: 302,
      headers: {
        "Cache-Control": "private, max-age=2700", // 45 min — safe before 1h expiry
      },
    });
  } catch {
    return NextResponse.json({ error: "telegram_error" }, { status: 502 });
  }
}
