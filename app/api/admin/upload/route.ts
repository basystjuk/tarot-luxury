import { put, list, del } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "ellensoul2025";
const PHOTO_PREFIX = "ellen-soul-taro-konsultant";

export async function POST(req: NextRequest) {
  // Auth check
  const password = req.headers.get("x-admin-password");
  if (password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Blob storage configured?
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "Blob storage not configured. See setup instructions." },
      { status: 503 }
    );
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "File must be an image" }, { status: 400 });
  }

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 400 });
  }

  // Upload with unique suffix → new URL every time (avoids CDN cache issues)
  const blob = await put(`${PHOTO_PREFIX}.jpg`, file, {
    access: "public",
    addRandomSuffix: true,
    contentType: "image/jpeg",
  });

  // Delete all previous versions (keep only the new one)
  try {
    const { blobs } = await list({ prefix: PHOTO_PREFIX });
    const old = blobs.filter((b) => b.url !== blob.url);
    if (old.length > 0) {
      await del(old.map((b) => b.url));
    }
  } catch {
    // non-critical — old blobs will just sit there
  }

  return NextResponse.json({ url: blob.url });
}
