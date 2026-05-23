import { put, del, list } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "ellensoul2025";
const GALLERY_PREFIX = "gallery/";
const META_PATHNAME = "gallery-meta.json";

type GalleryMeta = Record<string, { position?: "top" | "center" | "bottom" }>;

function auth(req: NextRequest): boolean {
  return req.headers.get("x-admin-password") === ADMIN_PASSWORD;
}

// Reuse an existing list result to extract meta — avoids extra list() call
async function readMetaFromBlobs(blobs: { url: string; pathname: string }[]): Promise<GalleryMeta> {
  try {
    const metaBlob = blobs.find((b) => b.pathname === META_PATHNAME);
    if (!metaBlob) return {};
    const res = await fetch(metaBlob.url, { cache: "no-store" });
    if (!res.ok) return {};
    return (await res.json()) as GalleryMeta;
  } catch {
    return {};
  }
}

async function writeMeta(meta: GalleryMeta): Promise<void> {
  const json = JSON.stringify(meta);
  await put(META_PATHNAME, json, {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
  });
}

// POST — upload a new gallery image
export async function POST(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!process.env.BLOB_READ_WRITE_TOKEN)
    return NextResponse.json({ error: "Blob not configured" }, { status: 503 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });
  if (!file.type.startsWith("image/"))
    return NextResponse.json({ error: "Not an image" }, { status: 400 });
  if (file.size > 8 * 1024 * 1024)
    return NextResponse.json({ error: "Max 8 MB" }, { status: 400 });

  const ext = file.name.split(".").pop() ?? "jpg";
  const filename = `${GALLERY_PREFIX}${Date.now()}.${ext}`;
  const blob = await put(filename, file, {
    access: "public",
    addRandomSuffix: false,
    contentType: file.type,
  });
  return NextResponse.json({ url: blob.url, pathname: blob.pathname });
}

// PATCH — update photo position metadata
export async function PATCH(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!process.env.BLOB_READ_WRITE_TOKEN)
    return NextResponse.json({ error: "Blob not configured" }, { status: 503 });

  const body = await req.json() as { pathname: string; position: "top" | "center" | "bottom" };
  const { pathname, position } = body;
  if (!pathname || !["top", "center", "bottom"].includes(position))
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  // One list() call for both gallery items and meta
  const { blobs } = await list({ prefix: "gallery" });
  const meta = await readMetaFromBlobs(blobs);
  meta[pathname] = { ...meta[pathname], position };
  await writeMeta(meta);
  return NextResponse.json({ ok: true });
}

// DELETE — remove a gallery image by pathname query param
export async function DELETE(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!process.env.BLOB_READ_WRITE_TOKEN)
    return NextResponse.json({ error: "Blob not configured" }, { status: 503 });

  const url = new URL(req.url);
  const pathname = url.searchParams.get("pathname");
  if (!pathname) return NextResponse.json({ error: "Missing pathname" }, { status: 400 });

  try {
    // One list() call for both image and meta
    const { blobs } = await list({ prefix: "gallery" });
    const match = blobs.find((b) => b.pathname === pathname);
    if (match) await del(match.url);

    // Clean up meta entry using already-fetched blobs
    const meta = await readMetaFromBlobs(blobs);
    if (meta[pathname]) {
      delete meta[pathname];
      await writeMeta(meta);
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
