-- =====================================================================
--  ASCEND 2026  ·  C-DAC Mumbai  ·  Supabase schema  (v2)
--  Roles: staff (executive / upskilling) · trainer (faculty) · admin
--  Run this whole file once in:  Supabase Dashboard → SQL Editor → New query
--  Safe to re-run: everything uses "if not exists" / "on conflict".
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
  role        text not null default 'staff' check (role in ('staff','trainer','admin')),
  team        text default '',
  designation text default '',
  emp_no      text default '',
  must_change_password boolean not null default false,
  created_at  timestamptz not null default now()
);
-- Upgrade older installs in place:
alter table public.profiles add column if not exists designation text default '';
alter table public.profiles add column if not exists emp_no text default '';
alter table public.profiles add column if not exists must_change_password boolean not null default false;

-- If upgrading from v1 (role check allowed only staff/admin), relax the constraint.
do $$
begin
  alter table public.profiles drop constraint if exists profiles_role_check;
  alter table public.profiles add constraint profiles_role_check
    check (role in ('staff','trainer','admin'));
exception when others then null;
end $$;

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

-- Helper: is the current user a content manager? (trainer OR admin)
create or replace function public.is_manager()
returns boolean
language sql
stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('trainer','admin')
  );
$$;

-- Prevent staff/trainers from promoting themselves: only an admin may change a role.
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

-- =====================================================================
--  COURSES  (a.k.a. tracks / modules)
-- =====================================================================
create table if not exists public.courses (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  summary      text default '',
  syllabus     text default '',              -- multi-line syllabus / outline
  instructor   text default '',
  accent       text default 'navy',          -- navy | violet | flame | teal
  sort_order   int  default 0,
  is_published boolean not null default true,
  created_at   timestamptz not null default now()
);
alter table public.courses add column if not exists syllabus text default '';

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
--  NOTES  (faculty / trainer notes attached to a course)
-- =====================================================================
create table if not exists public.notes (
  id             uuid primary key default gen_random_uuid(),
  course_id      uuid references public.courses(id) on delete cascade,
  title          text not null,
  body           text default '',             -- the note (plain text / light markdown)
  attachment_url text default '',             -- optional linked PDF / Drive doc
  author         text default '',
  created_at     timestamptz not null default now()
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
--  SUBMISSIONS  (one per user per assignment)
--  Accepts a Git link, a Google Drive link and/or a recording link.
-- =====================================================================
create table if not exists public.submissions (
  id            uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.assignments(id) on delete cascade,
  user_id       uuid not null references public.profiles(id) on delete cascade,
  git_url       text default '',
  drive_url     text default '',
  recording_url text default '',
  notes         text default '',
  status        text not null default 'submitted'
                  check (status in ('submitted','reviewed','returned')),
  grade         int,
  feedback      text default '',
  submitted_at  timestamptz not null default now(),
  reviewed_at   timestamptz,
  unique (assignment_id, user_id)
);
-- Upgrade from v1: add the extra link columns if the table already existed.
alter table public.submissions add column if not exists drive_url text default '';
alter table public.submissions add column if not exists recording_url text default '';
alter table public.submissions alter column git_url drop not null;

-- =====================================================================
--  QUIZZES  (auto-graded practice quizzes)
-- =====================================================================
create table if not exists public.quizzes (
  id           uuid primary key default gen_random_uuid(),
  course_id    uuid references public.courses(id) on delete set null,
  title        text not null,
  description  text default '',
  pass_pct     int default 60,
  is_published boolean not null default true,
  sort_order   int default 0,
  created_at   timestamptz not null default now()
);

create table if not exists public.quiz_questions (
  id            uuid primary key default gen_random_uuid(),
  quiz_id       uuid not null references public.quizzes(id) on delete cascade,
  prompt        text not null,
  options       jsonb not null default '[]'::jsonb,  -- array of answer strings
  correct_index int not null default 0,
  explanation   text default '',
  points        int default 1,
  sort_order    int default 0,
  created_at    timestamptz not null default now()
);

create table if not exists public.quiz_attempts (
  id           uuid primary key default gen_random_uuid(),
  quiz_id      uuid not null references public.quizzes(id) on delete cascade,
  user_id      uuid not null references public.profiles(id) on delete cascade,
  score        int not null default 0,
  total        int not null default 0,
  pct          int not null default 0,
  passed       boolean not null default false,
  answers      jsonb default '[]'::jsonb,
  submitted_at timestamptz not null default now()
);

-- =====================================================================
--  CAPSTONE PROJECTS  (major end-of-programme project + submission)
-- =====================================================================
create table if not exists public.capstones (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  brief       text default '',
  guidelines  text default '',
  due_at      timestamptz,
  points      int default 200,
  is_open     boolean not null default true,
  sort_order  int default 0,
  created_at  timestamptz not null default now()
);

create table if not exists public.capstone_submissions (
  id            uuid primary key default gen_random_uuid(),
  capstone_id   uuid not null references public.capstones(id) on delete cascade,
  user_id       uuid not null references public.profiles(id) on delete cascade,
  project_title text default '',
  summary       text default '',
  git_url       text default '',
  drive_url     text default '',
  recording_url text default '',
  status        text not null default 'submitted'
                  check (status in ('submitted','reviewed','returned')),
  grade         int,
  feedback      text default '',
  submitted_at  timestamptz not null default now(),
  reviewed_at   timestamptz,
  unique (capstone_id, user_id)
);

-- =====================================================================
--  DISCUSSION FORUM  (ask doubts, get answers)
-- =====================================================================
create table if not exists public.threads (
  id          uuid primary key default gen_random_uuid(),
  course_id   uuid references public.courses(id) on delete set null,
  author_id   uuid not null references public.profiles(id) on delete cascade,
  title       text not null,
  body        text default '',
  is_resolved boolean not null default false,
  is_pinned   boolean not null default false,
  reply_count int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.thread_replies (
  id         uuid primary key default gen_random_uuid(),
  thread_id  uuid not null references public.threads(id) on delete cascade,
  author_id  uuid not null references public.profiles(id) on delete cascade,
  body       text not null,
  is_answer  boolean not null default false,
  created_at timestamptz not null default now()
);

-- keep reply_count + updated_at fresh
create or replace function public.bump_thread()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (tg_op = 'INSERT') then
    update public.threads set reply_count = reply_count + 1, updated_at = now() where id = new.thread_id;
  elsif (tg_op = 'DELETE') then
    update public.threads set reply_count = greatest(reply_count - 1, 0) where id = old.thread_id;
  end if;
  return null;
end;$$;
drop trigger if exists trg_bump_thread on public.thread_replies;
create trigger trg_bump_thread after insert or delete on public.thread_replies
  for each row execute procedure public.bump_thread();

-- =====================================================================
--  ROW LEVEL SECURITY
-- =====================================================================
alter table public.profiles             enable row level security;
alter table public.courses              enable row level security;
alter table public.sessions             enable row level security;
alter table public.materials            enable row level security;
alter table public.notes                enable row level security;
alter table public.assignments          enable row level security;
alter table public.submissions          enable row level security;
alter table public.quizzes              enable row level security;
alter table public.quiz_questions       enable row level security;
alter table public.quiz_attempts        enable row level security;
alter table public.capstones            enable row level security;
alter table public.capstone_submissions enable row level security;
alter table public.threads              enable row level security;
alter table public.thread_replies       enable row level security;

-- ----- profiles -----
-- Any signed-in member can read the staff directory (names/roles) — needed for the
-- forum, reviews and "who submitted". Emails are internal (empno@ascend.cdac.in).
drop policy if exists "read own or admin reads all" on public.profiles;
drop policy if exists "authenticated read profiles" on public.profiles;
create policy "authenticated read profiles" on public.profiles
  for select to authenticated using ( true );

drop policy if exists "update own profile" on public.profiles;
create policy "update own profile" on public.profiles
  for update using ( id = auth.uid() ) with check ( id = auth.uid() );

drop policy if exists "admin manages profiles" on public.profiles;
create policy "admin manages profiles" on public.profiles
  for all using ( public.is_admin() ) with check ( public.is_admin() );

-- ----- content tables: everyone signed in reads; managers (trainer/admin) write -----
do $$
declare t text;
begin
  foreach t in array array['courses','sessions','materials','notes','assignments','quizzes','quiz_questions','capstones'] loop
    execute format('drop policy if exists "read for authenticated" on public.%I;', t);
    execute format('create policy "read for authenticated" on public.%I for select to authenticated using (true);', t);
    execute format('drop policy if exists "manager writes" on public.%I;', t);
    execute format('create policy "manager writes" on public.%I for all using (public.is_manager()) with check (public.is_manager());', t);
  end loop;
end $$;

-- ----- assignment submissions -----
drop policy if exists "read own or manager" on public.submissions;
create policy "read own or manager" on public.submissions
  for select using ( user_id = auth.uid() or public.is_manager() );

drop policy if exists "insert own" on public.submissions;
create policy "insert own" on public.submissions
  for insert with check ( user_id = auth.uid() );

drop policy if exists "update own or manager" on public.submissions;
create policy "update own or manager" on public.submissions
  for update using ( user_id = auth.uid() or public.is_manager() )
  with check ( user_id = auth.uid() or public.is_manager() );

drop policy if exists "delete own or manager" on public.submissions;
create policy "delete own or manager" on public.submissions
  for delete using ( user_id = auth.uid() or public.is_manager() );

-- ----- capstone submissions (same shape as submissions) -----
drop policy if exists "cap read own or manager" on public.capstone_submissions;
create policy "cap read own or manager" on public.capstone_submissions
  for select using ( user_id = auth.uid() or public.is_manager() );

drop policy if exists "cap insert own" on public.capstone_submissions;
create policy "cap insert own" on public.capstone_submissions
  for insert with check ( user_id = auth.uid() );

drop policy if exists "cap update own or manager" on public.capstone_submissions;
create policy "cap update own or manager" on public.capstone_submissions
  for update using ( user_id = auth.uid() or public.is_manager() )
  with check ( user_id = auth.uid() or public.is_manager() );

drop policy if exists "cap delete own or manager" on public.capstone_submissions;
create policy "cap delete own or manager" on public.capstone_submissions
  for delete using ( user_id = auth.uid() or public.is_manager() );

-- ----- quiz attempts (a member sees their own; managers see all) -----
drop policy if exists "attempt read own or manager" on public.quiz_attempts;
create policy "attempt read own or manager" on public.quiz_attempts
  for select using ( user_id = auth.uid() or public.is_manager() );

drop policy if exists "attempt insert own" on public.quiz_attempts;
create policy "attempt insert own" on public.quiz_attempts
  for insert with check ( user_id = auth.uid() );

drop policy if exists "attempt delete own or manager" on public.quiz_attempts;
create policy "attempt delete own or manager" on public.quiz_attempts
  for delete using ( user_id = auth.uid() or public.is_manager() );

-- ----- forum threads (everyone signed in reads; authors write their own; managers moderate) -----
drop policy if exists "threads read" on public.threads;
create policy "threads read" on public.threads for select to authenticated using (true);
drop policy if exists "threads insert own" on public.threads;
create policy "threads insert own" on public.threads for insert with check (author_id = auth.uid());
drop policy if exists "threads update own or manager" on public.threads;
create policy "threads update own or manager" on public.threads
  for update using (author_id = auth.uid() or public.is_manager())
  with check (author_id = auth.uid() or public.is_manager());
drop policy if exists "threads delete own or manager" on public.threads;
create policy "threads delete own or manager" on public.threads
  for delete using (author_id = auth.uid() or public.is_manager());

drop policy if exists "replies read" on public.thread_replies;
create policy "replies read" on public.thread_replies for select to authenticated using (true);
drop policy if exists "replies insert own" on public.thread_replies;
create policy "replies insert own" on public.thread_replies for insert with check (author_id = auth.uid());
drop policy if exists "replies update own or manager" on public.thread_replies;
create policy "replies update own or manager" on public.thread_replies
  for update using (author_id = auth.uid() or public.is_manager())
  with check (author_id = auth.uid() or public.is_manager());
drop policy if exists "replies delete own or manager" on public.thread_replies;
create policy "replies delete own or manager" on public.thread_replies
  for delete using (author_id = auth.uid() or public.is_manager());

-- =====================================================================
--  STORAGE  (optional: a bucket for uploading slides/docs/notes directly)
-- =====================================================================
insert into storage.buckets (id, name, public)
values ('materials', 'materials', true)
on conflict (id) do nothing;

drop policy if exists "public read materials" on storage.objects;
create policy "public read materials" on storage.objects
  for select using ( bucket_id = 'materials' );

drop policy if exists "manager writes materials" on storage.objects;
create policy "manager writes materials" on storage.objects
  for all using ( bucket_id = 'materials' and public.is_manager() )
  with check ( bucket_id = 'materials' and public.is_manager() );

-- =====================================================================
--  SEED CONTENT  (a starter ASCEND 2026 catalogue — safe to delete later)
-- =====================================================================
insert into public.courses (title, summary, instructor, accent, sort_order) values
  ('Git & Version Control Fundamentals', 'Branching, pull requests, and collaborative workflows every ASCEND submission relies on.', 'C-DAC Faculty', 'navy', 1),
  ('Python for Automation', 'Scripting, data handling, and building small tools to remove repetitive work.', 'C-DAC Faculty', 'violet', 2),
  ('Cloud & Containers', 'Docker, images, and deploying services — from laptop to production.', 'C-DAC Faculty', 'flame', 3)
on conflict do nothing;

do $$
declare c uuid; q uuid;
begin
  select id into c from public.courses order by sort_order limit 1;
  if c is not null then
    insert into public.sessions (course_id, title, description, scheduled_at, platform, recording_url, sort_order)
    values (c, 'ASCEND Inauguration — Kickstarting Our Journey',
            'Programme overview and how to use this platform.',
            '2026-09-01 16:30:00+05:30', 'Zoom', '', 1)
    on conflict do nothing;

    insert into public.materials (course_id, title, kind, url)
    values (c, 'Git cheat-sheet (PDF)', 'doc', 'https://education.github.com/git-cheat-sheet-education.pdf')
    on conflict do nothing;

    insert into public.notes (course_id, title, body, author)
    values (c, 'Welcome note — how ASCEND works',
            E'Welcome to ASCEND 2026!\n\n• Watch each session (live or the recording).\n• Read the faculty notes for each topic.\n• Submit assignments as a Git repo link (Drive / recording optional).\n• Try the practice quiz to check your understanding.\n• Finish with the capstone project.\n\nAscend. Empower. Achieve.',
            'Programme Office')
    on conflict do nothing;

    insert into public.assignments (course_id, title, brief, due_at, points)
    values (c, 'Set up your Git repository',
            'Create a public Git repo named ascend-<your-name>, add a README describing yourself, and submit the repository link below.',
            '2026-09-08 23:59:00+05:30', 100)
    on conflict do nothing;

    insert into public.quizzes (course_id, title, description, pass_pct, sort_order)
    values (c, 'Git basics — quick check', 'A short 3-question quiz on core Git concepts.', 60, 1)
    returning id into q;

    if q is not null then
      insert into public.quiz_questions (quiz_id, prompt, options, correct_index, explanation, sort_order) values
        (q, 'Which command creates a new branch and switches to it?',
            '["git branch new","git checkout -b new","git switch main","git merge new"]'::jsonb, 1,
            'git checkout -b <name> creates the branch and moves onto it in one step.', 1),
        (q, 'What does "git clone" do?',
            '["Deletes a repository","Copies a remote repository to your machine","Pushes local commits","Creates a pull request"]'::jsonb, 1,
            'Clone downloads a full copy of a remote repository locally.', 2),
        (q, 'A pull request is used to…',
            '["Delete branches automatically","Propose and review changes before merging","Rename the repository","Undo the last commit"]'::jsonb, 1,
            'PRs let others review your proposed changes before they merge.', 3);
    end if;
  end if;
end $$;

-- A single programme-wide capstone.
insert into public.capstones (title, brief, guidelines, due_at, points, sort_order)
values ('ASCEND 2026 Capstone Project',
        'Apply everything you learned across the programme to build one meaningful project — a tool, automation, or service that solves a real problem in your team.',
        E'Deliverables:\n1. A public Git repository with clean, documented code and a README.\n2. A short write-up / slides on Google Drive explaining the problem and your solution.\n3. A recording (5–8 min) demoing the project.\n\nEvaluation: problem clarity, technical execution, documentation, and demo quality.',
        '2026-10-31 23:59:00+05:30', 200, 1)
on conflict do nothing;

-- =====================================================================
--  DONE.  Next:
--   1) Sign up once in the app with your own email.
--   2) Promote yourself to admin by running (replace the email):
--        update public.profiles set role='admin' where email='you@cdac.in';
--   3) Make a colleague a trainer:
--        update public.profiles set role='trainer' where email='trainer@cdac.in';
-- =====================================================================
