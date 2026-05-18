import { list } from "@vercel/blob";
import { NextResponse } from "next/server";

const FALLBACK = "/images/ellen-soul-taro-konsultant.jpg";

export async function GET() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ url: FALLBACK });
  }

  try {
    const { blobs } = await list({ prefix: "ellen-soul-taro-konsultant" });
    // Sort by uploadedAt descending → always get the newest
    const sorted = blobs.sort((a, b) =>
      new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    );
    const url = sorted[0]?.url ?? FALLBACK;
    return NextResponse.json({ url }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ url: FALLBACK });
  }
}
