import { put } from "@vercel/blob";
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

  // In @vercel/blob v2, putting a fixed-name blob requires allowOverwrite.
  // (The previous del-then-put dance was racy: Blob storage is eventually
  // consistent, so list/del after a recent write sometimes still saw the
  // old blob and the put would fail with BlobAlreadyExistsError.)
  try {
    const blob = await put(CONTENT_BLOB, JSON.stringify(body), {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/json",
    });
    return NextResponse.json({ ok: true, url: blob.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown blob error";
    return NextResponse.json({ error: "blob_write_failed", message }, { status: 500 });
  }
}
