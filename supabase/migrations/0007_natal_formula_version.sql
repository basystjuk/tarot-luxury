-- ============================================================================
-- Natal formula version (2026-08-13).
--
-- profiles.natal_moon_lon is a CACHE: the Moon's tropical longitude at birth,
-- computed once when the user saves their birth data so the Moon Guide does
-- not redo the work on every render. The cache has no idea which version of
-- the formulas produced it.
--
-- The 2026-08-13 audit is about to change lib/astro/*: the Ascendant was
-- returning the Descendant, the Placidus cusps 2/3 and 8/9 were swapped, the
-- planets carried no precession correction, and Lilith was the perigee. After
-- those land, a value cached in May and a value computed tomorrow can differ
-- with nothing in the row to explain why — old users on one ephemeris, new
-- users on another, silently.
--
-- This column stamps each cached value with lib/astro/version.ts's
-- EPHEMERIS_VERSION. The client recomputes whenever the stamp is lower.
--
-- Nullable on purpose: every existing row reads as version 0, i.e. stale, so
-- the first visit after deploy recomputes and restamps. No backfill needed
-- and no notification behaviour changes on its own.
--
-- RLS: no new policies needed. public.profiles already has row-scoped
-- policies from 0001_profiles.sql —
--   "profiles read own"   select using (auth.uid() = id)
--   "profiles update own" update using (auth.uid() = id) with check (...)
--   "profiles insert own" insert with check (auth.uid() = id)
-- Row-level policies cover every column of the row, new ones included, so a
-- user can read and write only their own stamp. Verify after applying:
--   select relrowsecurity from pg_class where relname = 'profiles';  -- t
--   select policyname, cmd from pg_policies where tablename = 'profiles';
--
-- Apply via Supabase Dashboard → SQL Editor → paste & Run. Idempotent.
-- ============================================================================

alter table public.profiles
  add column if not exists natal_formula_version integer;

comment on column public.profiles.natal_formula_version is
  'EPHEMERIS_VERSION (lib/astro/version.ts) that produced natal_moon_lon. NULL or lower than the current constant means the cached value is stale and the client recomputes it.';
