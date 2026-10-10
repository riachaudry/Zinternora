import 'server-only';
import { createClient } from '../supabase/server';
import { createAdminClient } from '../supabase/admin';
import { dateInTz, timeInTz, todayInTz } from '../tz';
import { appTimezone } from '../env';
import type { SessionProfile } from '../auth';

export type CalStatus = 'upcoming' | 'overdue' | 'completed' | 'submitted' | 'locked' | 'info';
export type CalKind = 'deadline' | 'week' | 'milestone' | 'submission' | 'admin';

export type CalEvent = {
  id: string;
  date: string;            // yyyy-MM-dd (calendar day, in the app timezone)
  endDate?: string | null; // for multi-day events
  title: string;
  kind: CalKind;
  status: CalStatus;
  description?: string | null;
  time?: string | null;    // e.g. "11:59 PM" or admin-set time
  who?: string | null;     // student name (admin view)
  href?: string | null;    // only set when the student may actually open it
  editable?: boolean;      // admin-created events only
  audience?: 'all' | 'student';
  studentId?: string | null;
};

const DEADLINE_TIME = '11:59 PM';
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
export const isDateStr = (v: unknown): v is string => typeof v === 'string' && DATE_RE.test(v);

/**
 * Loads real calendar events from the database for the given range.
 * Students only ever see their own data (row-level security does the filtering);
 * admins see platform-wide dates. Nothing here is invented: if there is no row, there is no event.
 */
export async function loadCalendarEvents(profile: SessionProfile, from: string, to: string) {
  const tz = appTimezone();
  const today = todayInTz(tz);
  const events: CalEvent[] = [];
  let eventsTableMissing = false;

  // ---- admin-managed events (both roles read them; RLS limits students to their own + global) ----
  {
    const db = profile.role === 'admin' ? createAdminClient() : createClient();
    const { data, error } = await db.from('calendar_events')
      .select('id, title, description, event_date, end_date, event_time, audience, student_id, profiles!calendar_events_student_id_fkey(full_name)')
      .lte('event_date', to).or(`end_date.gte.${from},and(end_date.is.null,event_date.gte.${from})`)
      .order('event_date');
    if (error) eventsTableMissing = true;
    for (const e of (data ?? []) as any[]) {
      events.push({
        id: `ev-${e.id}`, date: e.event_date, endDate: e.end_date, title: e.title, kind: 'admin',
        status: (e.end_date ?? e.event_date) < today ? 'completed' : 'upcoming',
        description: e.description, time: e.event_time ? formatTime(e.event_time) : null,
        who: e.audience === 'student' ? e.profiles?.full_name ?? 'One student' : 'All students',
        editable: profile.role === 'admin', audience: e.audience, studentId: e.student_id,
      });
    }
  }

  if (profile.role === 'admin') {
    const db = createAdminClient();
    const [{ data: starts }, { data: ends }, { data: tasks }] = await Promise.all([
      db.from('internships').select('id, start_date, internship_fields(name), profiles!internships_student_id_fkey(full_name)')
        .gte('start_date', from).lte('start_date', to),
      db.from('internships').select('id, end_date, internship_fields(name), profiles!internships_student_id_fkey(full_name)')
        .gte('end_date', from).lte('end_date', to),
      db.from('internship_tasks').select('id, deadline, status, internship_id, internship_weeks(week_number)')
        .gte('deadline', from).lte('deadline', to).limit(5000),
    ]);
    for (const i of (starts ?? []) as any[]) events.push({
      id: `start-${i.id}`, date: i.start_date, title: `Internship starts · ${i.internship_fields?.name ?? ''}`,
      kind: 'milestone', status: i.start_date < today ? 'completed' : 'upcoming', who: i.profiles?.full_name,
    });
    for (const i of (ends ?? []) as any[]) events.push({
      id: `end-${i.id}`, date: i.end_date, title: `Internship ends · ${i.internship_fields?.name ?? ''}`,
      kind: 'milestone', status: i.end_date < today ? 'completed' : 'upcoming', who: i.profiles?.full_name,
    });
    // One line per (deadline day, week): "Week 2 deadline — 14 open tasks · 5 students".
    const groups = new Map<string, { date: string; week: number; open: number; total: number; interns: Set<string> }>();
    for (const t of (tasks ?? []) as any[]) {
      const week = t.internship_weeks?.week_number ?? 0;
      const key = `${t.deadline}-${week}`;
      const g = groups.get(key) ?? { date: t.deadline, week, open: 0, total: 0, interns: new Set<string>() };
      g.total += 1; g.interns.add(t.internship_id);
      if (!['approved', 'submitted', 'under_review'].includes(t.status)) g.open += 1;
      groups.set(key, g);
    }
    for (const [key, g] of Array.from(groups)) events.push({
      id: `dl-${key}`, date: g.date, time: DEADLINE_TIME, kind: 'deadline',
      title: `Week ${g.week} deadline`, description: `${g.total} task${g.total === 1 ? '' : 's'} across ${g.interns.size} student${g.interns.size === 1 ? '' : 's'} · ${g.open} not yet submitted.`,
      status: g.date < today ? (g.open ? 'overdue' : 'completed') : 'upcoming',
    });
  } else {
    const supabase = createClient();
    const { data: internship } = await supabase.from('internships')
      .select('id, status, start_date, end_date, internship_fields(name)')
      .eq('student_id', profile.id).order('created_at', { ascending: false }).limit(1).maybeSingle();

    if (internship && ['active', 'completed'].includes(internship.status)) {
      const field = (internship as any).internship_fields?.name ?? 'Internship';
      if (internship.start_date >= from && internship.start_date <= to) events.push({
        id: 'i-start', date: internship.start_date, kind: 'milestone', title: `${field} internship starts`,
        status: internship.start_date < today ? 'completed' : 'upcoming',
        description: 'Week 1, Task 1 opens on the start date.',
      });
      if (internship.end_date >= from && internship.end_date <= to) events.push({
        id: 'i-end', date: internship.end_date, kind: 'milestone', title: `${field} internship ends`,
        status: internship.end_date < today ? 'completed' : 'upcoming',
      });

      const [{ data: weeks }, { data: tasks }, { data: subs }] = await Promise.all([
        supabase.from('internship_weeks').select('id, week_number, title, start_date, end_date, status')
          .eq('internship_id', internship.id).lte('start_date', to).gte('end_date', from),
        supabase.from('internship_tasks').select('id, task_code, title, deadline, status, instructions, week_id')
          .eq('internship_id', internship.id).gte('deadline', from).lte('deadline', to),
        supabase.from('submissions').select('id, created_at, status, task_id, internship_tasks(title)')
          .eq('internship_id', internship.id).order('created_at'),
      ]);

      for (const w of (weeks ?? []) as any[]) events.push({
        id: `w-${w.id}`, date: w.start_date, endDate: w.end_date, kind: 'week',
        title: `Week ${w.week_number}: ${w.title}`,
        status: w.status === 'locked' ? 'locked' : w.end_date < today ? 'completed' : 'info',
        description: w.status === 'locked'
          ? 'This week unlocks after you submit the last task of the previous week.' : null,
      });

      for (const t of (tasks ?? []) as any[]) {
        const status: CalStatus =
          t.status === 'approved' ? 'completed'
          : ['submitted', 'under_review'].includes(t.status) ? 'submitted'
          : t.status === 'locked' ? 'locked'
          : t.deadline < today ? 'overdue' : 'upcoming';
        events.push({
          id: `t-${t.id}`, date: t.deadline, time: DEADLINE_TIME, kind: 'deadline',
          title: `${t.task_code} · ${t.title}`, status,
          description: status === 'locked'
            ? 'Locked. It opens after you submit the previous task. This deadline does not unlock it.'
            : status === 'overdue'
              ? 'The deadline has passed. Contact the admin team if you need the task reopened.' : null,
          // Locked tasks get no link: the calendar can never bypass task locking.
          href: status === 'locked' ? null : `/dashboard/tasks/${t.id}`,
        });
      }

      for (const s of (subs ?? []) as any[]) {
        const date = dateInTz(s.created_at, tz);
        if (date < from || date > to) continue;
        events.push({
          id: `s-${s.id}`, date, time: timeInTz(s.created_at, tz), kind: 'submission', status: 'completed',
          title: `Submitted: ${s.internship_tasks?.title ?? 'task'}`,
          description: `Review status: ${String(s.status).replace(/_/g, ' ')}.`,
          href: s.task_id ? `/dashboard/tasks/${s.task_id}` : null,
        });
      }
    }
  }

  events.sort((a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title));
  return { events, today, timezone: tz, eventsTableMissing };
}

function formatTime(t: string) {
  const [h, m] = t.split(':').map(Number);
  const hh = ((h + 11) % 12) + 1;
  return `${hh}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
}
