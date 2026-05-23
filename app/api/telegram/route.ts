/**
 * Telegram webhook endpoint.
 *
 * Handles two types of updates:
 * 1. Private messages to the bot (from TELEGRAM_CHAT_IDS) — admin commands
 * 2. channel_post from TELEGRAM_CHANNEL_ID — saves video/photo metadata to Vercel Blob
 */
import { NextRequest, NextResponse } from "next/server";
import { put, list } from "@vercel/blob";

const TG_VIDEOS_BLOB = "tg-videos.json";

// ── Types ─────────────────────────────────────────────────────────────────

interface TgPhotoSize {
  file_id: string;
  file_unique_id: string;
  width: number;
  height: number;
  file_size?: number;
}

interface TgVideo {
  file_id: string;
  file_unique_id: string;
  width: number;
  height: number;
  duration: number;
  thumbnail?: TgPhotoSize;
  file_name?: string;
  mime_type?: string;
  file_size?: number;
}

interface TgChannelPost {
  message_id: number;
  chat: { id: number; type: string; title?: string };
  date: number;
  caption?: string;
  video?: TgVideo;
  photo?: TgPhotoSize[];
}

export interface VideoEntry {
  id: number;
  date: number;
  caption: string;
  file_id: string;
  duration: number;
  width: number;
  height: number;
  file_size?: number;
  thumb_url: string;  // Vercel Blob permanent URL for thumbnail
  type: "video" | "photo";
}

// ── Helpers ───────────────────────────────────────────────────────────────

function allowedIds(): Set<string> {
  const raw = process.env.TELEGRAM_CHAT_IDS ?? process.env.TELEGRAM_CHAT_ID ?? "";
  return new Set(raw.split(",").map(s => s.trim()).filter(Boolean));
}

function channelId(): string {
  return (process.env.TELEGRAM_CHANNEL_ID ?? "").trim();
}

async function getTgFileUrl(token: string, fileId: string): Promise<string | null> {
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/getFile?file_id=${encodeURIComponent(fileId)}`);
    const data = await res.json();
    if (!data.ok || !data.result?.file_path) return null;
    return `https://api.telegram.org/file/bot${token}/${data.result.file_path}`;
  } catch {
    return null;
  }
}

async function downloadThumbnail(token: string, thumbFileId: string): Promise<Blob | null> {
  const url = await getTgFileUrl(token, thumbFileId);
  if (!url) return null;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.blob();
  } catch {
    return null;
  }
}

async function loadVideoList(): Promise<VideoEntry[]> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return [];
  try {
    const { blobs } = await list({ prefix: TG_VIDEOS_BLOB });
    if (!blobs.length) return [];
    const res = await fetch(blobs[0].url, { cache: "no-store" });
    return await res.json();
  } catch {
    return [];
  }
}

async function saveVideoList(videos: VideoEntry[]): Promise<void> {
  await put(TG_VIDEOS_BLOB, JSON.stringify(videos), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
  });
}

async function processChannelPost(post: TgChannelPost): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token || !blobToken) return;

  const caption = post.caption ?? "";

  // ── Handle video ────────────────────────────────────────────────────────
  if (post.video) {
    const vid = post.video;
    const thumbFileId = vid.thumbnail?.file_id ?? "";

    let thumbUrl = "";
    if (thumbFileId) {
      const thumbBlob = await downloadThumbnail(token, thumbFileId);
      if (thumbBlob) {
        const uploaded = await put(`tg-thumb-${post.message_id}.jpg`, thumbBlob, {
          access: "public",
          contentType: "image/jpeg",
          addRandomSuffix: false,
        });
        thumbUrl = uploaded.url;
      }
    }

    const entry: VideoEntry = {
      id: post.message_id,
      date: post.date,
      caption,
      file_id: vid.file_id,
      duration: vid.duration,
      width: vid.width,
      height: vid.height,
      file_size: vid.file_size,
      thumb_url: thumbUrl,
      type: "video",
    };

    const videos = await loadVideoList();
    // Deduplicate by id
    const filtered = videos.filter(v => v.id !== entry.id);
    await saveVideoList([entry, ...filtered]);
    return;
  }

  // ── Handle photo ─────────────────────────────────────────────────────────
  if (post.photo && post.photo.length > 0) {
    // Use the largest photo
    const photo = post.photo[post.photo.length - 1];

    let thumbUrl = "";
    // For photo, use the medium size as thumb if available
    const mediumPhoto = post.photo[Math.min(1, post.photo.length - 1)];
    const thumbBlob = await downloadThumbnail(token, mediumPhoto.file_id);
    if (thumbBlob) {
      const uploaded = await put(`tg-thumb-${post.message_id}.jpg`, thumbBlob, {
        access: "public",
        contentType: "image/jpeg",
        addRandomSuffix: false,
      });
      thumbUrl = uploaded.url;
    }

    const entry: VideoEntry = {
      id: post.message_id,
      date: post.date,
      caption,
      file_id: photo.file_id,
      duration: 0,
      width: photo.width,
      height: photo.height,
      file_size: photo.file_size,
      thumb_url: thumbUrl,
      type: "photo",
    };

    const videos = await loadVideoList();
    const filtered = videos.filter(v => v.id !== entry.id);
    await saveVideoList([entry, ...filtered]);
  }
}

// ── Main handler ──────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // Verify webhook secret
  const expectedSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
  const incomingSecret = req.headers.get("x-telegram-bot-api-secret-token");
  if (!expectedSecret || incomingSecret !== expectedSecret) {
    return NextResponse.json({ ok: true });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: true });
  }

  // ── Channel post (videos/photos from the channel) ─────────────────────
  const channelPost = body.channel_post as TgChannelPost | undefined;
  if (channelPost) {
    const postChatId = String(channelPost.chat.id);
    const allowedChannelId = channelId();
    // Accept if TELEGRAM_CHANNEL_ID is configured and matches, or if not configured (dev mode)
    if (!allowedChannelId || postChatId === allowedChannelId) {
      if (channelPost.video || channelPost.photo) {
        // Fire-and-forget — don't block the 200 response to Telegram
        processChannelPost(channelPost).catch(console.error);
      }
    }
    return NextResponse.json({ ok: true });
  }

  // ── Private message / bot command ────────────────────────────────────────
  const msg = body.message as
    | { chat: { id: number }; text?: string }
    | undefined;

  if (!msg) return NextResponse.json({ ok: true });

  const senderChatId = String(msg.chat.id);
  if (!allowedIds().has(senderChatId)) {
    return NextResponse.json({ ok: true });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (token && msg.text === "/status") {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: senderChatId,
        text: "✅ Бот працює. Відео з каналу автоматично з'являються на сайті.",
      }),
    });
  }

  return NextResponse.json({ ok: true });
}
