-- =============================================================
-- DeutschMaroc — trial access tier
-- =============================================================
-- Adds `access_level` to allowed_users:
--   'trial' → can watch only the first lesson of the first course
--   'full'  → can watch everything (default for existing rows)
--
-- Safe to run multiple times.
-- =============================================================

alter table public.allowed_users
  add column if not exists access_level text not null default 'trial'
  check (access_level in ('trial', 'full'));

-- Existing users (admins + anyone pre-trial) keep full access.
update public.allowed_users
set access_level = 'full'
where invited_at < now() - interval '1 minute'
  and access_level = 'trial';

create index if not exists allowed_users_access_level_idx
  on public.allowed_users(access_level);
