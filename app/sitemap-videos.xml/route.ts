/**
 * GET /sitemap-videos.xml
 *
 * Google Video sitemap — one <url> per published video with full
 * <video:video> metadata. Lets Google index the YouTube journal into
 * Google Videos search and surface video rich results in regular SERP.
 *
 * Spec: https://developers.google.com/search/docs/crawling-indexing/sitemaps/video-sitemaps
 */

import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

export const revalidate = 3600; // refresh hourly at edge

const SITE = "https://ellen-soul.com";

function xmlEscape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function isoDuration(seconds: number | null | undefined): string {
  if (!seconds || seconds <= 0) return "PT0S";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `PT${h ? `${h}H` : ""}${m ? `${m}M` : ""}${s}S`;
}

export async function GET() {
  const supa = await getSupabaseServer();
  let videos: Array<{
    id: string; title: string; description: string | null; thumb_url: string;
    duration_seconds: number | null; published_at: string; view_count: number | null;
  }> = [];
  if (supa) {
    const { data } = await supa
      .from("youtube_videos")
      .select("id,title,description,thumb_url,duration_seconds,published_at,view_count")
      .eq("hidden", false)
      .order("published_at", { ascending: false })
      .limit(500);
    videos = data ?? [];
  }

  const urls = videos.map((v) => {
    const loc = `${SITE}/uk/blog#${v.id}`;
    const player = `https://www.youtube.com/embed/${v.id}`;
    const watch  = `https://www.youtube.com/watch?v=${v.id}`;
    const desc = xmlEscape(((v.description ?? v.title) || "").slice(0, 2048));
    return `
  <url>
    <loc>${xmlEscape(loc)}</loc>
    <lastmod>${v.published_at}</lastmod>
    <video:video>
      <video:thumbnail_loc>${xmlEscape(v.thumb_url)}</video:thumbnail_loc>
      <video:title>${xmlEscape(v.title.slice(0, 100))}</video:title>
      <video:description>${desc}</video:description>
      <video:player_loc allow_embed="yes">${xmlEscape(player)}</video:player_loc>
      <video:content_loc>${xmlEscape(watch)}</video:content_loc>
      <video:duration>${Math.max(1, Math.min(28800, v.duration_seconds ?? 0))}</video:duration>
      <video:publication_date>${v.published_at}</video:publication_date>
      <video:family_friendly>yes</video:family_friendly>
      <video:requires_subscription>no</video:requires_subscription>
      <video:live>no</video:live>
      ${v.view_count ? `<video:view_count>${v.view_count}</video:view_count>` : ""}
      <video:uploader info="https://www.youtube.com/channel/UChGlgY6oZj9ttZ_GQfI9lKw">Ellen Soul</video:uploader>
      <video:platform relationship="allow">web mobile tv</video:platform>
    </video:video>
  </url>`;
  }).join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">${urls}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600",
    },
  });
}
