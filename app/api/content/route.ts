import { list, head } from "@vercel/blob";
import { NextResponse } from "next/server";
import { DEFAULT_SERVICES, DEFAULT_ORG } from "@/lib/data/services";
import { testimonials as DEFAULT_TESTIMONIALS } from "@/lib/data/testimonials";

const CONTENT_BLOB = "site-content.json";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(defaults(), { headers: { "Cache-Control": "no-store" } });
  }

  try {
    const { blobs } = await list({ prefix: CONTENT_BLOB });
    const blob = blobs[0];
    if (!blob) {
      return NextResponse.json(defaults(), { headers: { "Cache-Control": "no-store" } });
    }
    const res = await fetch(blob.url, { cache: "no-store" });
    const data = await res.json();
    return NextResponse.json({ ...defaults(), ...data }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json(defaults(), { headers: { "Cache-Control": "no-store" } });
  }
}

function defaults() {
  return {
    services: DEFAULT_SERVICES,
    org: DEFAULT_ORG,
    testimonials: DEFAULT_TESTIMONIALS,
    blog: {
      title_ru: "Telegram-канал",
      desc_ru: "Там я регулярно публикую расклады, пишу о картах и делюсь мыслями.",
      btn_ru: "Перейти в канал",
      title_uk: "Telegram-канал",
      desc_uk: "Там я регулярно публікую розклади, пишу про карти та ділюся думками.",
      btn_uk: "Перейти в канал",
      link: "https://t.me/ellen_soul_taro",
    },
  };
}
