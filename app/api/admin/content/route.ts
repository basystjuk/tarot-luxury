import { put, list, del } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "ellensoul2025";
const CONTENT_BLOB = "site-content.json";

export async function POST(req: NextRequest) {
  const password = req.headers.get("x-admin-password");
  if (password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: "Blob storage not configured" }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Delete old content blob
  try {
    const { blobs } = await list({ prefix: CONTENT_BLOB });
    if (blobs.length > 0) await del(blobs.map((b) => b.url));
  } catch {}

  // Write new blob
  const blob = await put(
    CONTENT_BLOB,
    JSON.stringify(body),
    { access: "public", addRandomSuffix: false, contentType: "application/json" }
  );

  return NextResponse.json({ ok: true, url: blob.url });
}
