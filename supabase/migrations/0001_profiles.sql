-- ============================================================================
-- Phase В — profiles table.
--
-- One row per authenticated user. Row id matches auth.users.id (1:1).
-- All three studio tools read from this table when a user is logged in.
--
-- HOW TO APPLY:
--   Option 1 (recommended): Supabase Dashboard → SQL Editor → paste this
--     whole file and Run. Idempotent: re-running is a no-op thanks to
--     "if not exists" guards.
--   Option 2: supabase CLI — `supabase db push` after `supabase link`.
--
-- After applying, no client code changes are needed — the Supabase JS
-- client picks the schema up automatically.
-- ============================================================================

-- ── Profiles ───────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id                     uuid primary key references auth.users(id) on delete cascade,
  email                  text,
  display_name           text,                       -- preferred name shown back to user
  full_name              text,                       -- "Olena Bilyk" — used for numerology
  birth_date             date,
  birth_time             time,                       -- local birth-place time
  birth_place            text,                       -- "Kyiv, Ukraine"
  birth_lat              double precision,
  birth_lon              double precision,
  birth_tz               text,                       -- IANA, e.g. "Europe/Kyiv"
  natal_moon_lon         double precision,           -- pre-computed tropical longitude (deg)
  telegram_username      text,                       -- "@ellen_user" (without @)
  telegram_chat_id       bigint,                     -- filled in Phase Д after bot deeplink
  subscribed_to_channel  boolean default false,      -- Phase Д auto-check
  channel_checked_at     timestamptz,                -- last successful subscription verify
  created_at             timestamptz default now(),
  updated_at             timestamptz default now()
);

comment on table  public.profiles is 'Per-user profile shared by all 3 studio tools.';
comment on column public.profiles.natal_moon_lon is 'Cached tropical longitude (deg) so the Moon Guide does not recompute on every render.';

-- ── Updated-at trigger ────────────────────────────────────────────────────
create or replace function public.handle_profile_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_profile_updated_at();

-- ── Auto-create profile row when a new auth.users row appears ─────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists trg_on_auth_user_created on auth.users;
create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── Row Level Security ─────────────────────────────────────────────────────
-- Users can only read/write their own row.
alter table public.profiles enable row level security;

drop policy if exists "profiles read own"   on public.profiles;
drop policy if exists "profiles update own" on public.profiles;
drop policy if exists "profiles insert own" on public.profiles;

create policy "profiles read own"   on public.profiles for select  using  (auth.uid() = id);
create policy "profiles update own" on public.profiles for update  using  (auth.uid() = id) with check (auth.uid() = id);
create policy "profiles insert own" on public.profiles for insert  with check (auth.uid() = id);

-- ── Daily card history (Phase В migration target — Phase А uses localStorage) ──
-- One row per Kyiv day per user. Carries the same shape as _history.ts.
create table if not exists public.tarot_history (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  day          date not null,            -- YYYY-MM-DD Kyiv calendar day
  card_index   smallint not null check (card_index between 0 and 77),
  reversed     boolean not null default false,
  question     text,
  reading      jsonb,                    -- { meaning, advice, affirmation } or null
  drawn_at     timestamptz default now(),
  unique (user_id, day)
);

alter table public.tarot_history enable row level security;

drop policy if exists "tarot read own"   on public.tarot_history;
drop policy if exists "tarot insert own" on public.tarot_history;
drop policy if exists "tarot update own" on public.tarot_history;
drop policy if exists "tarot delete own" on public.tarot_history;

create policy "tarot read own"   on public.tarot_history for select using (auth.uid() = user_id);
create policy "tarot insert own" on public.tarot_history for insert with check (auth.uid() = user_id);
create policy "tarot update own" on public.tarot_history for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "tarot delete own" on public.tarot_history for delete using (auth.uid() = user_id);

create index if not exists idx_tarot_history_user_day on public.tarot_history (user_id, day desc);
