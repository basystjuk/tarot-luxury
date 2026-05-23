import { list } from "@vercel/blob";
import { NextResponse } from "next/server";

const GALLERY_PREFIX = "gallery/";
const META_PATHNAME = "gallery-meta.json";

type GalleryMeta = Record<string, { position?: "top" | "center" | "bottom" }>;

// One list() call — returns both gallery/* images AND gallery-meta.json
export async function GET() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ items: [] });
  }
  try {
    // prefix "gallery" matches "gallery/*.jpg" AND "gallery-meta.json"
    const { blobs } = await list({ prefix: "gallery" });

    const metaBlob = blobs.find((b) => b.pathname === META_PATHNAME);
    const imageBlobs = blobs.filter((b) => b.pathname.startsWith(GALLERY_PREFIX));

    let meta: GalleryMeta = {};
    if (metaBlob) {
      try {
        const res = await fetch(metaBlob.url, { next: { revalidate: 3600 } });
        if (res.ok) meta = await res.json();
      } catch {}
    }

    const items = imageBlobs
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
      .map((b) => ({
        url: b.url,
        pathname: b.pathname,
        position: (meta[b.pathname]?.position ?? "top") as "top" | "center" | "bottom",
      }));

    return NextResponse.json(
      { items },
      {
        headers: {
          // Edge cache: serve from CDN for 1 hour, stale up to 24h while revalidating
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      }
    );
  } catch {
    return NextResponse.json({ items: [] });
  }
}
