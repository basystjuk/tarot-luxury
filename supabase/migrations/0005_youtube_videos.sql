-- ============================================================================
-- Phase В1 — YouTube journal.
--
-- Mirror of the latest videos from Ellen's YouTube channel. Synced hourly by
-- /api/cron/youtube-sync via the YouTube Data API. The site shows these on
-- /blog (journal layout); video files themselves stay on YouTube — we keep
-- only metadata + a thumbnail URL pointing at i.ytimg.com.
--
-- tags TEXT[]    — auto-detected themes (love / money / future / ...) plus
--                  any owner overrides.
-- tool_pick      — manual "tool of the day" CTA shown under the video card,
--                  picked by the owner in admin (compatibility / moon-phase /…).
-- hidden         — owner can hide a video from the public journal without
--                  deleting it (e.g. wrong upload, takedown).
--
-- Apply via Supabase Dashboard → SQL Editor. Idempotent.
-- ============================================================================

create table if not exists public.youtube_videos (
  id                 text primary key,                -- YouTube video id (11 chars)
  title              text not null,
  description        text,
  thumb_url          text not null,                   -- maxresdefault.jpg
  duration_seconds   int,
  published_at       timestamptz not null,
  view_count         bigint default 0,
  tags               text[] default '{}',
  tool_pick          text,                            -- ToolId slug or null
  tool_pick_set_at   timestamptz,
  hidden             boolean default false,
  synced_at          timestamptz default now()
);

create index if not exists idx_yt_videos_published on public.youtube_videos (published_at desc);
create index if not exists idx_yt_videos_hidden    on public.youtube_videos (hidden) where hidden = false;
create index if not exists idx_yt_videos_tags      on public.youtube_videos using gin (tags);

alter table public.youtube_videos enable row level security;

-- Public read: anyone can see non-hidden videos. Writes are owner-only via
-- service-role (cron sync + admin moderation), so no insert/update/delete
-- policies for anon are added.
drop policy if exists "yt videos public read" on public.youtube_videos;
create policy  "yt videos public read"
  on public.youtube_videos for select
  using (hidden = false);
