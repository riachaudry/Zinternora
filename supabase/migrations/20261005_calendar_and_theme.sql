-- Zinternora: calendar events, saved theme, tighter submission rule.
-- ADDITIVE and SAFE: nothing is dropped, no rows are deleted or changed.
-- Run once in Supabase -> SQL Editor. Safe to run twice.

-- 1) Remember each user's chosen theme (classic = Navy & Gold, light, dark).
alter table public.profiles add column if not exists theme text not null default 'classic';
do $$ begin
  alter table public.profiles add constraint profiles_theme_check check (theme in ('classic','light','dark'));
exception when duplicate_object then null; end $$;

-- 2) Admin-managed calendar events (real dates only; no seeded/fake events).
create table if not exists public.calendar_events (
  id          uuid primary key default gen_random_uuid(),
  title       text not null check (char_length(title) between 3 and 120),
  description text,
  event_date  date not null,
  end_date    date check (end_date is null or end_date >= event_date),
  event_time  time,
  audience    text not null default 'all' check (audience in ('all','student')),
  student_id  uuid references public.profiles(id) on delete cascade,
  created_by  uuid references public.profiles(id) on delete set null,
  created_at  timestamptz not null default now(),
  check (audience = 'all' or student_id is not null)
);
create index if not exists calendar_events_date_idx on public.calendar_events (event_date);
alter table public.calendar_events enable row level security;

drop policy if exists "cal: read" on public.calendar_events;
create policy "cal: read" on public.calendar_events for select
  using (public.is_admin() or audience = 'all' or student_id = auth.uid());
drop policy if exists "cal: admin write" on public.calendar_events;
create policy "cal: admin write" on public.calendar_events for all
  using (public.is_admin()) with check (public.is_admin());

-- 3) Submissions can only be inserted for a task the student may actually work on now.
--    (The API already checks this; this makes the database enforce it too, so a student
--    cannot bypass task locking or the deadline by calling the database directly.)
--    The deadline check uses Asia/Karachi; change it here if you set a different APP_TIMEZONE.
drop policy if exists "sub: insert own" on public.submissions;
create policy "sub: insert own" on public.submissions for insert
  with check (
    student_id = auth.uid()
    and exists (
      select 1
      from public.internship_tasks t
      join public.internships i on i.id = t.internship_id
      where t.id = task_id
        and i.student_id = auth.uid()
        and i.status = 'active'
        and t.status not in ('locked', 'approved', 'under_review', 'submitted', 'overdue')
        and t.deadline >= (now() at time zone 'Asia/Karachi')::date
    )
  );
