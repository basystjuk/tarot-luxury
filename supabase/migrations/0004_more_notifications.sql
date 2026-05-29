-- ============================================================================
-- Phase M12+ — more notification categories.
--
-- Adds two new per-user toggles to notification_prefs:
--   solar_return       — your astrological birthday (the Sun returns to your
--                        natal Sun degree). Rare → default ON.
--   mercury_retrograde — Mercury stations (goes retrograde / direct). Rare,
--                        widely-anticipated → default ON.
--
-- (daily_horoscope was added in migration 0003. It only fires on STANDOUT
--  days — a clearly flowing or clearly turbulent reading — never on ordinary
--  days, so it stays ON by default without becoming noise.)
--
-- Apply via Supabase Dashboard → SQL Editor → paste & Run. Idempotent.
-- ============================================================================

alter table public.notification_prefs
  add column if not exists solar_return       boolean default true,
  add column if not exists mercury_retrograde boolean default true;
