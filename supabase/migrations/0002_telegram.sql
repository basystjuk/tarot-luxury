-- ============================================================================
-- Phase Д — Telegram link tokens, notification preferences, send log.
--
-- Apply via Supabase Dashboard → SQL Editor → paste & Run.
-- Idempotent.
-- ============================================================================

-- ── 1. One-time link tokens ────────────────────────────────────────────────
-- A short random token issued by the cabinet's "Connect Telegram" button.
-- User opens t.me/<bot>?start=<token> — the bot's /start handler reads
-- the token, looks up which user it belongs to, and writes their chat_id
-- back to public.profiles. Tokens expire after 10 minutes for safety.
create table if not exists public.telegram_link_tokens (
  token       text primary key,
  user_id     uuid not null references auth.users(id) on delete cascade,
  created_at  timestamptz default now(),
  expires_at  timestamptz default (now() + interval '10 minutes'),
  consumed_at timestamptz
);

alter table public.telegram_link_tokens enable row level security;

drop policy if exists "tg-tokens insert own" on public.telegram_link_tokens;
drop policy if exists "tg-tokens read own"   on public.telegram_link_tokens;

create policy "tg-tokens insert own" on public.telegram_link_tokens
  for insert with check (auth.uid() = user_id);
create policy "tg-tokens read own"   on public.telegram_link_tokens
  for select using  (auth.uid() = user_id);

-- ── 2. Notification preferences ────────────────────────────────────────────
-- Per-user toggles for the categories of Telegram messages we may send.
-- One row per user; auto-created with sensible defaults when /start lands.
create table if not exists public.notification_prefs (
  user_id          uuid primary key references auth.users(id) on delete cascade,
  daily_card       boolean default false,  -- "Your daily card is waiting"
  weekly_card      boolean default true,   -- Monday morning weekly draw
  eclipse_alerts   boolean default true,   -- 24h before any eclipse
  lunar_return     boolean default true,   -- 24h before user's Lunar Return
  moon_phase_peaks boolean default false,  -- New / Full Moon every cycle
  ellen_news       boolean default true,   -- Special promos / Ellen broadcasts
  updated_at       timestamptz default now()
);

alter table public.notification_prefs enable row level security;

drop policy if exists "prefs read own"   on public.notification_prefs;
drop policy if exists "prefs upsert own" on public.notification_prefs;
drop policy if exists "prefs update own" on public.notification_prefs;

create policy "prefs read own"   on public.notification_prefs for select  using (auth.uid() = user_id);
create policy "prefs upsert own" on public.notification_prefs for insert  with check (auth.uid() = user_id);
create policy "prefs update own" on public.notification_prefs for update  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Auto-touch updated_at
create or replace function public.handle_prefs_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_prefs_updated_at on public.notification_prefs;
create trigger trg_prefs_updated_at
  before update on public.notification_prefs
  for each row execute function public.handle_prefs_updated_at();

-- Auto-create prefs row when a new profile appears.
create or replace function public.handle_new_profile_prefs()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.notification_prefs (user_id)
  values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists trg_profile_prefs on public.profiles;
create trigger trg_profile_prefs
  after insert on public.profiles
  for each row execute function public.handle_new_profile_prefs();

-- Back-fill prefs for any profiles that pre-date this migration.
insert into public.notification_prefs (user_id)
  select id from public.profiles
  on conflict (user_id) do nothing;

-- ── 3. Notification send log ───────────────────────────────────────────────
-- We log every Telegram message we send so the cron can avoid duplicate
-- deliveries (e.g. "we already alerted this user about the May 25 eclipse").
create table if not exists public.notification_log (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  kind        text not null,              -- "eclipse" | "lunar_return" | "weekly_card" | ...
  key         text not null,              -- dedup key, e.g. "eclipse:2026-08-12"
  sent_at     timestamptz default now(),
  payload     jsonb,                      -- snapshot of what we sent (debugging)
  unique (user_id, kind, key)
);

alter table public.notification_log enable row level security;
-- Users may read their own log (for "what notifications did I get?" view later).
drop policy if exists "notiflog read own" on public.notification_log;
create policy "notiflog read own" on public.notification_log
  for select using (auth.uid() = user_id);
-- Inserts come from the service role (cron worker) only — no client policy needed.

create index if not exists idx_notif_log_user_kind on public.notification_log (user_id, kind);
