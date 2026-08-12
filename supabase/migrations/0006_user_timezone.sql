-- ============================================================================
-- User timezone (2026-08-12).
--
-- Every notification we send renders its times through a hardcoded
-- "Europe/Kiev", so a user living anywhere else is told the wrong clock time
-- for an eclipse, a New Moon, a Mercury station or their window of luck.
-- This column stores the zone the user actually lives in.
--
-- NOT the same as profiles.birth_tz, which is the zone of the BIRTH PLACE and
-- feeds natal-chart math. People move; the natal chart does not.
--
-- Nullable on purpose: existing rows keep today's behaviour (the cron falls
-- back to Europe/Kiev) until the user picks a zone, so this migration cannot
-- change anyone's notifications by itself.
--
-- RLS: no new policies needed. public.profiles already has row-scoped
-- policies from 0001_profiles.sql —
--   "profiles read own"   select using (auth.uid() = id)
--   "profiles update own" update using (auth.uid() = id) with check (...)
--   "profiles insert own" insert with check (auth.uid() = id)
-- Row-level policies cover every column of the row, new ones included, so a
-- user can read and write only their own tz. Verified after applying with:
--   select relrowsecurity from pg_class where relname = 'profiles';  -- t
--   select policyname, cmd from pg_policies where tablename = 'profiles';
--
-- Apply via Supabase Dashboard → SQL Editor → paste & Run. Idempotent.
-- ============================================================================

alter table public.profiles
  add column if not exists tz text;

comment on column public.profiles.tz is
  'IANA timezone the user currently lives in, e.g. "Europe/Kyiv". Used to render notification times. Distinct from birth_tz, which is the birth place zone used for natal charts.';
