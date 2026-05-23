import { list } from "@vercel/blob";
import { NextResponse } from "next/server";

const TG_VIDEOS_BLOB = "tg-videos.json";

export const revalidate = 60; // ISR-like: revalidate every 60s

export async function GET() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json([], {
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
    });
  }

  try {
    const { blobs } = await list({ prefix: TG_VIDEOS_BLOB });
    if (!blobs.length) {
      return NextResponse.json([], {
        headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
      });
    }

    const res = await fetch(blobs[0].url, { cache: "no-store" });
    const data = await res.json();

    return NextResponse.json(Array.isArray(data) ? data : [], {
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
    });
  } catch {
    return NextResponse.json([], {
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
    });
  }
}
