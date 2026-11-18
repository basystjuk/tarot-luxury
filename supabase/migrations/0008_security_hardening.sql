-- ============================================================================
-- Security hardening (2026-11-18 audit).
--
-- 1. profiles: users may edit only their own personal fields. The row-level
--    policy alone let a signed-in user rewrite ANY column of their row through
--    the public API, including telegram_chat_id, which pointed the bot at
--    somebody else's chat. telegram_chat_id, email and the channel subscription
--    fields are now written by the server only.
--
-- 2. rate_limits: counters shared by all server instances. In-memory counters
--    reset on every cold start and differ between instances.
--
-- APPLY AFTER deploying the code that ships with this migration, because
-- /api/telegram/verify-subscription must already write through the service role.
--
-- Apply via Supabase Dashboard → SQL Editor → paste & Run. Idempotent.
-- Requires migrations 0006 and 0007.
-- ============================================================================

-- ── 1. profiles: column-level write access ────────────────────────────────
-- Rows are created by the handle_new_user trigger, never by clients.
drop policy if exists "profiles insert own" on public.profiles;
revoke insert, update on public.profiles from anon, authenticated;

grant update (
  display_name,
  full_name,
  birth_date,
  birth_time,
  birth_place,
  birth_lat,
  birth_lon,
  birth_tz,
  natal_moon_lon,
  natal_formula_version,
  telegram_username,
  tz
) on public.profiles to authenticated;

-- ── 2. Shared rate limits ─────────────────────────────────────────────────
create table if not exists public.rate_limits (
  key       text primary key,              -- scope + HMAC of the subject, no raw IPs or ids
  count     integer not null default 0,
  reset_at  timestamptz not null
);

create index if not exists idx_rate_limits_reset on public.rate_limits (reset_at);

alter table public.rate_limits enable row level security;

-- Service role only: clients can neither read nor change the counters.
drop policy if exists "rate limits no client access" on public.rate_limits;
create policy "rate limits no client access" on public.rate_limits
  for all to anon, authenticated
  using (false) with check (false);

revoke all on public.rate_limits from anon, authenticated;

-- Atomically counts one attempt. Returns true while within the limit.
create or replace function public.consume_rate_limit(
  p_key text,
  p_limit integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_count integer;
begin
  insert into public.rate_limits as r (key, count, reset_at)
  values (p_key, 1, now() + make_interval(secs => p_window_seconds))
  on conflict (key) do update
    set count    = case when r.reset_at <= now() then 1 else r.count + 1 end,
        reset_at = case when r.reset_at <= now()
                        then now() + make_interval(secs => p_window_seconds)
                        else r.reset_at end
  returning count into v_count;

  -- Occasional housekeeping, so the table stays small without a cron job.
  if random() < 0.01 then
    delete from public.rate_limits where reset_at < now() - interval '1 day';
  end if;

  return v_count <= p_limit;
end;
$$;

revoke all on function public.consume_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.consume_rate_limit(text, integer, integer) to service_role;
grant select, insert, update, delete on public.rate_limits to service_role;
