-- =============================================================
-- DeutschMaroc — initial schema
-- Run via Supabase SQL editor (copy/paste) or `supabase db push`.
-- =============================================================

-- -----------------------------------------------------------------
-- Core tables
-- -----------------------------------------------------------------

create table if not exists public.allowed_users (
  id           uuid primary key references auth.users(id) on delete cascade,
  email        text unique not null,
  display_name text,
  status       text not null default 'pending'
               check (status in ('pending', 'active', 'revoked')),
  is_admin     boolean not null default false,
  invited_at   timestamptz default now(),
  activated_at timestamptz,
  invited_by   uuid references auth.users(id)
);

create index if not exists allowed_users_status_idx on public.allowed_users(status);
create index if not exists allowed_users_email_idx on public.allowed_users(lower(email));

create table if not exists public.courses (
  id           uuid primary key default gen_random_uuid(),
  slug         text unique not null,
  title        text not null,
  description  text,
  level        text not null check (level in ('A1.1', 'A1.2', 'A2.1', 'A2.2')),
  order_index  integer default 0,
  is_published boolean not null default false,
  created_at   timestamptz default now()
);

create index if not exists courses_level_idx on public.courses(level);
create index if not exists courses_published_idx on public.courses(is_published);

create table if not exists public.lessons (
  id                  uuid primary key default gen_random_uuid(),
  course_id           uuid references public.courses(id) on delete cascade,
  title               text not null,
  description         text,
  cloudflare_video_id text,
  duration_seconds    integer,
  thumbnail_url       text,
  order_index         integer default 0,
  is_published        boolean not null default false,
  created_at          timestamptz default now()
);

create index if not exists lessons_course_idx on public.lessons(course_id, order_index);
create index if not exists lessons_published_idx on public.lessons(is_published);
create index if not exists lessons_cf_video_idx on public.lessons(cloudflare_video_id);

create table if not exists public.watch_progress (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  lesson_id        uuid not null references public.lessons(id) on delete cascade,
  watched_seconds  integer not null default 0,
  completed        boolean not null default false,
  last_watched_at  timestamptz default now(),
  unique (user_id, lesson_id)
);

create index if not exists watch_progress_user_idx on public.watch_progress(user_id, last_watched_at desc);

create table if not exists public.lesson_notes (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  lesson_id  uuid not null references public.lessons(id) on delete cascade,
  content    text not null default '',
  updated_at timestamptz default now(),
  unique (user_id, lesson_id)
);

create table if not exists public.notifications (
  id         uuid primary key default gen_random_uuid(),
  title      text not null,
  body       text not null,
  created_by uuid references auth.users(id),
  created_at timestamptz default now()
);

create index if not exists notifications_created_idx on public.notifications(created_at desc);

create table if not exists public.notification_reads (
  user_id         uuid not null references auth.users(id) on delete cascade,
  notification_id uuid not null references public.notifications(id) on delete cascade,
  read_at         timestamptz default now(),
  primary key (user_id, notification_id)
);

create table if not exists public.certificates (
  id        uuid primary key default gen_random_uuid(),
  user_id   uuid not null references auth.users(id) on delete cascade,
  level     text not null check (level in ('A1.1', 'A1.2', 'A2.1', 'A2.2')),
  issued_at timestamptz default now(),
  unique (user_id, level)
);

-- -----------------------------------------------------------------
-- Helper functions (SECURITY DEFINER to bypass recursive RLS)
-- -----------------------------------------------------------------

create or replace function public.is_active_user(uid uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.allowed_users
    where id = uid and status = 'active'
  );
$$;

create or replace function public.is_platform_admin(uid uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.allowed_users
    where id = uid and status = 'active' and is_admin = true
  );
$$;

grant execute on function public.is_active_user(uuid) to authenticated, anon;
grant execute on function public.is_platform_admin(uuid) to authenticated, anon;

-- -----------------------------------------------------------------
-- Certificate trigger — issued when all published lessons in a level
-- are complete for the user.
-- -----------------------------------------------------------------

create or replace function public.maybe_issue_certificate()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.completed is not true then
    return new;
  end if;

  -- Insert a certificate iff every published lesson in this course's level
  -- is completed for this user. Pure SQL, no local variables.
  insert into public.certificates (user_id, level)
  select new.user_id, target.level
  from (
    select c.level
    from public.courses c
    join public.lessons l on l.course_id = c.id
    where l.id = new.lesson_id
    limit 1
  ) as target
  where (
    select count(*) from public.lessons l2
    join public.courses c2 on c2.id = l2.course_id
    where c2.level = target.level
      and c2.is_published = true
      and l2.is_published = true
  ) > 0
  and (
    select count(*) from public.watch_progress wp
    join public.lessons l3 on l3.id = wp.lesson_id
    join public.courses c3 on c3.id = l3.course_id
    where wp.user_id = new.user_id
      and wp.completed = true
      and c3.level = target.level
      and c3.is_published = true
      and l3.is_published = true
  ) >= (
    select count(*) from public.lessons l4
    join public.courses c4 on c4.id = l4.course_id
    where c4.level = target.level
      and c4.is_published = true
      and l4.is_published = true
  )
  on conflict (user_id, level) do nothing;

  return new;
end;
$$;

drop trigger if exists trg_maybe_issue_certificate on public.watch_progress;
create trigger trg_maybe_issue_certificate
  after insert or update of completed on public.watch_progress
  for each row execute function public.maybe_issue_certificate();

-- -----------------------------------------------------------------
-- RLS
-- -----------------------------------------------------------------

alter table public.allowed_users     enable row level security;
alter table public.courses           enable row level security;
alter table public.lessons           enable row level security;
alter table public.watch_progress    enable row level security;
alter table public.lesson_notes      enable row level security;
alter table public.notifications     enable row level security;
alter table public.notification_reads enable row level security;
alter table public.certificates      enable row level security;

-- allowed_users ----------------------------------------------------
drop policy if exists "allowed_users_select_self" on public.allowed_users;
create policy "allowed_users_select_self"
  on public.allowed_users for select
  using (auth.uid() = id);

drop policy if exists "allowed_users_admin_all" on public.allowed_users;
create policy "allowed_users_admin_all"
  on public.allowed_users for all
  using (public.is_platform_admin(auth.uid()))
  with check (public.is_platform_admin(auth.uid()));

-- courses ---------------------------------------------------------
drop policy if exists "courses_select_published_active" on public.courses;
create policy "courses_select_published_active"
  on public.courses for select
  using (is_published = true and public.is_active_user(auth.uid()));

drop policy if exists "courses_admin_all" on public.courses;
create policy "courses_admin_all"
  on public.courses for all
  using (public.is_platform_admin(auth.uid()))
  with check (public.is_platform_admin(auth.uid()));

-- lessons ---------------------------------------------------------
drop policy if exists "lessons_select_published_active" on public.lessons;
create policy "lessons_select_published_active"
  on public.lessons for select
  using (
    is_published = true
    and public.is_active_user(auth.uid())
    and exists (
      select 1 from public.courses c
      where c.id = course_id and c.is_published = true
    )
  );

drop policy if exists "lessons_admin_all" on public.lessons;
create policy "lessons_admin_all"
  on public.lessons for all
  using (public.is_platform_admin(auth.uid()))
  with check (public.is_platform_admin(auth.uid()));

-- watch_progress --------------------------------------------------
drop policy if exists "watch_progress_own" on public.watch_progress;
create policy "watch_progress_own"
  on public.watch_progress for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid() and public.is_active_user(auth.uid()));

-- lesson_notes ----------------------------------------------------
drop policy if exists "lesson_notes_own" on public.lesson_notes;
create policy "lesson_notes_own"
  on public.lesson_notes for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid() and public.is_active_user(auth.uid()));

-- notifications ---------------------------------------------------
drop policy if exists "notifications_select_active" on public.notifications;
create policy "notifications_select_active"
  on public.notifications for select
  using (public.is_active_user(auth.uid()));

drop policy if exists "notifications_admin_all" on public.notifications;
create policy "notifications_admin_all"
  on public.notifications for all
  using (public.is_platform_admin(auth.uid()))
  with check (public.is_platform_admin(auth.uid()));

-- notification_reads ----------------------------------------------
drop policy if exists "notification_reads_own" on public.notification_reads;
create policy "notification_reads_own"
  on public.notification_reads for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- certificates ----------------------------------------------------
drop policy if exists "certificates_select_own" on public.certificates;
create policy "certificates_select_own"
  on public.certificates for select
  using (user_id = auth.uid());

drop policy if exists "certificates_admin_all" on public.certificates;
create policy "certificates_admin_all"
  on public.certificates for all
  using (public.is_platform_admin(auth.uid()))
  with check (public.is_platform_admin(auth.uid()));
