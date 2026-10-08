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
        // This response is CDN-cached already; don't add a second hour-long cache.
        const res = await fetch(metaBlob.url, { cache: "no-store" });
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
          // Edge cache 60 s (like the rest of the admin-edited content) so a new
          // or removed photo reaches the About page within a minute.
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=600",
        },
      }
    );
  } catch {
    return NextResponse.json({ items: [] });
  }
}
