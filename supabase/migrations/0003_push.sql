-- ============================================================================
-- Phase M12 — Web Push subscriptions.
--
-- One row per browser/device the user has granted Notification permission on.
-- The endpoint URL is unique (the browser refuses to expose the same one
-- twice), so we use it as the natural key for upsert/delete.
--
-- Apply via Supabase Dashboard → SQL Editor → paste & Run. Idempotent.
-- ============================================================================

create table if not exists public.push_subscriptions (
  endpoint    text primary key,
  user_id     uuid not null references auth.users(id) on delete cascade,
  p256dh      text not null,
  auth        text not null,
  ua          text,                          -- user-agent for debugging stale subs
  created_at  timestamptz default now(),
  last_seen_at timestamptz default now()
);

create index if not exists idx_push_subs_user on public.push_subscriptions (user_id);

alter table public.push_subscriptions enable row level security;

-- Users can only see/manage their own subscriptions.
drop policy if exists "push read own"   on public.push_subscriptions;
drop policy if exists "push insert own" on public.push_subscriptions;
drop policy if exists "push update own" on public.push_subscriptions;
drop policy if exists "push delete own" on public.push_subscriptions;

create policy "push read own"   on public.push_subscriptions for select  using (auth.uid() = user_id);
create policy "push insert own" on public.push_subscriptions for insert  with check (auth.uid() = user_id);
create policy "push update own" on public.push_subscriptions for update  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "push delete own" on public.push_subscriptions for delete  using (auth.uid() = user_id);

-- ── Extend notification_prefs with two new channels ───────────────────────
-- daily_horoscope  — morning ping from the new H1 tool
-- push_enabled     — master switch; if false, cron skips web-push for the user
alter table public.notification_prefs
  add column if not exists daily_horoscope boolean default true,
  add column if not exists push_enabled    boolean default true;
