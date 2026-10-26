-- =====================================================================
--  ASCEND 2026  ·  C-DAC Mumbai  ·  Supabase schema
--  Run this whole file once in:  Supabase Dashboard → SQL Editor → New query
-- =====================================================================

-- ---------- extensions ----------
create extension if not exists "pgcrypto";

-- =====================================================================
--  PROFILES  (one row per auth user; holds name + role)
-- =====================================================================
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text not null default '',
  email       text not null default '',
  role        text not null default 'staff' check (role in ('staff','admin')),
  team        text default '',
  created_at  timestamptz not null default now()
);

-- Auto-create a profile whenever a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.email, '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Prevent staff from promoting themselves: only an existing admin may change a role.
create or replace function public.guard_profile_role()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  if new.role is distinct from old.role and not public.is_admin() then
    new.role := old.role;   -- silently keep the previous role for non-admins
  end if;
  return new;
end;
$$;

drop trigger if exists trg_guard_role on public.profiles;
create trigger trg_guard_role
  before update on public.profiles
  for each row execute procedure public.guard_profile_role();

-- Helper: is the current user an admin?  (SECURITY DEFINER avoids RLS recursion)
create or replace function public.is_admin()
returns boolean
language sql
stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- =====================================================================
--  COURSES  (a.k.a. tracks / modules)
-- =====================================================================
create table if not exists public.courses (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  summary      text default '',
  instructor   text default '',
  accent       text default 'navy',          -- navy | violet | flame | teal
  sort_order   int  default 0,
  is_published boolean not null default true,
  created_at   timestamptz not null default now()
);

-- =====================================================================
--  SESSIONS  (live/recorded classes inside a course)
-- =====================================================================
create table if not exists public.sessions (
  id            uuid primary key default gen_random_uuid(),
  course_id     uuid not null references public.courses(id) on delete cascade,
  title         text not null,
  description   text default '',
  scheduled_at  timestamptz,
  duration_mins int default 60,
  platform      text default 'Zoom',
  join_url      text default '',              -- live link
  recording_url text default '',              -- filled in after the class
  sort_order    int default 0,
  created_at    timestamptz not null default now()
);

-- =====================================================================
--  MATERIALS  (slides, docs, links attached to a course)
-- =====================================================================
create table if not exists public.materials (
  id         uuid primary key default gen_random_uuid(),
  course_id  uuid not null references public.courses(id) on delete cascade,
  title      text not null,
  kind       text default 'link',            -- link | slides | doc | code | video
  url        text not null,
  created_at timestamptz not null default now()
);

-- =====================================================================
--  ASSIGNMENTS
-- =====================================================================
create table if not exists public.assignments (
  id          uuid primary key default gen_random_uuid(),
  course_id   uuid references public.courses(id) on delete set null,
  title       text not null,
  brief       text default '',
  due_at      timestamptz,
  points      int default 100,
  is_open     boolean not null default true,
  created_at  timestamptz not null default now()
);

-- =====================================================================
--  SUBMISSIONS  (one per user per assignment — submitted as a Git link)
-- =====================================================================
create table if not exists public.submissions (
  id            uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.assignments(id) on delete cascade,
  user_id       uuid not null references public.profiles(id) on delete cascade,
  git_url       text not null,
  notes         text default '',
  status        text not null default 'submitted'
                  check (status in ('submitted','reviewed','returned')),
  grade         int,
  feedback      text default '',
  submitted_at  timestamptz not null default now(),
  reviewed_at   timestamptz,
  unique (assignment_id, user_id)
);

-- =====================================================================
--  ROW LEVEL SECURITY
-- =====================================================================
alter table public.profiles    enable row level security;
alter table public.courses     enable row level security;
alter table public.sessions    enable row level security;
alter table public.materials   enable row level security;
alter table public.assignments enable row level security;
alter table public.submissions enable row level security;

-- ----- profiles -----
drop policy if exists "read own or admin reads all" on public.profiles;
create policy "read own or admin reads all" on public.profiles
  for select using ( id = auth.uid() or public.is_admin() );

drop policy if exists "update own profile" on public.profiles;
create policy "update own profile" on public.profiles
  for update using ( id = auth.uid() ) with check ( id = auth.uid() );

drop policy if exists "admin manages profiles" on public.profiles;
create policy "admin manages profiles" on public.profiles
  for all using ( public.is_admin() ) with check ( public.is_admin() );

-- ----- courses / sessions / materials / assignments -----
-- Everyone signed in can read; only admins can write.
do $$
declare t text;
begin
  foreach t in array array['courses','sessions','materials','assignments'] loop
    execute format('drop policy if exists "read for authenticated" on public.%I;', t);
    execute format('create policy "read for authenticated" on public.%I for select to authenticated using (true);', t);
    execute format('drop policy if exists "admin writes" on public.%I;', t);
    execute format('create policy "admin writes" on public.%I for all using (public.is_admin()) with check (public.is_admin());', t);
  end loop;
end $$;

-- ----- submissions -----
drop policy if exists "read own or admin" on public.submissions;
create policy "read own or admin" on public.submissions
  for select using ( user_id = auth.uid() or public.is_admin() );

drop policy if exists "insert own" on public.submissions;
create policy "insert own" on public.submissions
  for insert with check ( user_id = auth.uid() );

drop policy if exists "update own or admin" on public.submissions;
create policy "update own or admin" on public.submissions
  for update using ( user_id = auth.uid() or public.is_admin() )
  with check ( user_id = auth.uid() or public.is_admin() );

drop policy if exists "delete own or admin" on public.submissions;
create policy "delete own or admin" on public.submissions
  for delete using ( user_id = auth.uid() or public.is_admin() );

-- =====================================================================
--  STORAGE  (optional: a bucket for uploading slides/docs directly)
-- =====================================================================
insert into storage.buckets (id, name, public)
values ('materials', 'materials', true)
on conflict (id) do nothing;

drop policy if exists "public read materials" on storage.objects;
create policy "public read materials" on storage.objects
  for select using ( bucket_id = 'materials' );

drop policy if exists "admin writes materials" on storage.objects;
create policy "admin writes materials" on storage.objects
  for all using ( bucket_id = 'materials' and public.is_admin() )
  with check ( bucket_id = 'materials' and public.is_admin() );

-- =====================================================================
--  SEED CONTENT  (a starter ASCEND 2026 catalogue — safe to delete later)
-- =====================================================================
insert into public.courses (title, summary, instructor, accent, sort_order) values
  ('Git & Version Control Fundamentals', 'Branching, pull requests, and collaborative workflows every ASCEND submission relies on.', 'C-DAC Faculty', 'navy', 1),
  ('Python for Automation', 'Scripting, data handling, and building small tools to remove repetitive work.', 'C-DAC Faculty', 'violet', 2),
  ('Cloud & Containers', 'Docker, images, and deploying services — from laptop to production.', 'C-DAC Faculty', 'flame', 3)
on conflict do nothing;

-- Attach a kickoff session + assignment to the first course.
do $$
declare c uuid;
begin
  select id into c from public.courses order by sort_order limit 1;
  if c is not null then
    insert into public.sessions (course_id, title, description, scheduled_at, platform, recording_url, sort_order)
    values (c, 'ASCEND Inauguration — Kickstarting Our Journey',
            'Programme overview and how to use this platform.',
            '2026-09-01 16:30:00+05:30', 'Zoom', '', 1)
    on conflict do nothing;

    insert into public.assignments (course_id, title, brief, due_at, points)
    values (c, 'Set up your Git repository',
            'Create a public Git repo named ascend-<your-name>, add a README describing yourself, and submit the repository link below.',
            '2026-09-08 23:59:00+05:30', 100)
    on conflict do nothing;
  end if;
end $$;

-- =====================================================================
--  DONE.  Next:
--   1) Sign up once in the app with your own email.
--   2) Promote yourself to admin by running (replace the email):
--        update public.profiles set role='admin' where email='you@cdac.in';
-- =====================================================================
