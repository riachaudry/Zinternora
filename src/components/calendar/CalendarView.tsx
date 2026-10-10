'use client';
import * as React from 'react';
import Link from 'next/link';
import {
  addDays, addMonths, addWeeks, eachDayOfInterval, endOfMonth, endOfWeek, format, isSameMonth,
  startOfMonth, startOfWeek,
} from 'date-fns';
import { parseDate } from '@/lib/dates';
import { todayInTz } from '@/lib/tz';
import type { CalEvent, CalStatus } from '@/lib/services/calendar';
import { Button, Alert, Card } from '@/components/ui';

type View = 'month' | 'week' | 'day';
type Student = { id: string; name: string };

const ymd = (d: Date) => format(d, 'yyyy-MM-dd');
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const STATUS_STYLE: Record<CalStatus, { chip: string; label: string }> = {
  upcoming: { chip: 'bg-signal-light text-signal-dark border-signal/30', label: 'Upcoming' },
  overdue: { chip: 'bg-danger-light text-danger border-danger/30', label: 'Overdue' },
  completed: { chip: 'bg-mist text-slate border-mist-deep', label: 'Completed' },
  submitted: { chip: 'bg-amber-light text-amber-dark border-amber/30', label: 'Submitted' },
  locked: { chip: 'bg-mist text-slate-light border-mist-deep border-dashed', label: 'Locked' },
  info: { chip: 'bg-ink/5 text-ink border-mist-deep', label: 'Scheduled' },
};

/** Which calendar days an event covers (multi-day events span from date to endDate). */
const covers = (e: CalEvent, day: string) => day >= e.date && day <= (e.endDate ?? e.date);

export function CalendarView({ timezone, isAdmin = false, students = [] }: {
  timezone: string; isAdmin?: boolean; students?: Student[];
}) {
  const [today, setToday] = React.useState(() => todayInTz(timezone));
  const [view, setView] = React.useState<View>('month');
  const [cursor, setCursor] = React.useState<Date>(() => parseDate(todayInTz(timezone)));
  const [selectedDay, setSelectedDay] = React.useState<string>(() => todayInTz(timezone));
  const [events, setEvents] = React.useState<CalEvent[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [tableMissing, setTableMissing] = React.useState(false);
  const [active, setActive] = React.useState<CalEvent | null>(null);
  const [form, setForm] = React.useState<{ mode: 'create' | 'edit'; event?: CalEvent } | null>(null);
  const [tick, setTick] = React.useState(0);

  // Keep "today" correct if the tab stays open past midnight (in the app timezone).
  React.useEffect(() => {
    const id = window.setInterval(() => setToday(todayInTz(timezone)), 60_000);
    return () => window.clearInterval(id);
  }, [timezone]);

  // The range we need to load: the full month grid around the cursor (covers month, week and day views).
  const range = React.useMemo(() => {
    const from = startOfWeek(startOfMonth(addDays(cursor, view === 'month' ? 0 : -7)), { weekStartsOn: 1 });
    const to = endOfWeek(endOfMonth(addDays(cursor, view === 'month' ? 0 : 7)), { weekStartsOn: 1 });
    return { from: ymd(from), to: ymd(to) };
  }, [cursor, view]);

  React.useEffect(() => {
    let cancelled = false;
    setLoading(true); setError(null);
    fetch(`/api/calendar?from=${range.from}&to=${range.to}`)
      .then(async (r) => {
        const data = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(data?.error ?? 'Could not load the calendar.');
        return data as { events: CalEvent[]; eventsTableMissing?: boolean };
      })
      .then((d) => { if (!cancelled) { setEvents(d.events); setTableMissing(!!d.eventsTableMissing); } })
      .catch((e) => { if (!cancelled) setError(e instanceof Error ? e.message : 'Could not load the calendar.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [range.from, range.to, tick]);

  const byDay = React.useCallback((day: string) => events.filter((e) => covers(e, day)), [events]);

  function step(dir: -1 | 1) {
    setCursor((c) => view === 'month' ? addMonths(c, dir) : view === 'week' ? addWeeks(c, dir) : addDays(c, dir));
  }
  function goToday() {
    const t = parseDate(today); setCursor(t); setSelectedDay(today);
  }

  const heading = view === 'month' ? format(cursor, 'MMMM yyyy')
    : view === 'week'
      ? `${format(startOfWeek(cursor, { weekStartsOn: 1 }), 'd MMM')} – ${format(endOfWeek(cursor, { weekStartsOn: 1 }), 'd MMM yyyy')}`
      : format(cursor, 'EEEE, d MMMM yyyy');

  const monthDays = React.useMemo(() => eachDayOfInterval({
    start: startOfWeek(startOfMonth(cursor), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(cursor), { weekStartsOn: 1 }),
  }), [cursor]);
  const weekDays = React.useMemo(() => eachDayOfInterval({
    start: startOfWeek(cursor, { weekStartsOn: 1 }), end: endOfWeek(cursor, { weekStartsOn: 1 }),
  }), [cursor]);

  const visibleEvents = view === 'month'
    ? events.filter((e) => e.date <= ymd(endOfMonth(cursor)) && (e.endDate ?? e.date) >= ymd(startOfMonth(cursor)))
    : view === 'week'
      ? events.filter((e) => e.date <= ymd(weekDays[6]) && (e.endDate ?? e.date) >= ymd(weekDays[0]))
      : byDay(ymd(cursor));

  const dayList = byDay(selectedDay);

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button size="sm" variant="secondary" onClick={() => step(-1)} aria-label={`Previous ${view}`}>‹ Prev</Button>
          <Button size="sm" variant="secondary" onClick={goToday}>Today</Button>
          <Button size="sm" variant="secondary" onClick={() => step(1)} aria-label={`Next ${view}`}>Next ›</Button>
        </div>
        <h2 className="font-display text-xl font-extrabold text-ink" aria-live="polite">{heading}</h2>
        <div className="flex items-center gap-2">
          <div role="group" aria-label="Calendar view" className="inline-flex overflow-hidden rounded-xl border border-mist-deep">
            {(['month', 'week', 'day'] as View[]).map((v) => (
              <button key={v} type="button" aria-pressed={view === v} onClick={() => setView(v)}
                      className={`h-9 px-3.5 text-[13px] font-semibold capitalize ${view === v ? 'bg-ink text-white' : 'bg-white text-slate hover:bg-mist'}`}>
                {v}
              </button>
            ))}
          </div>
          {isAdmin && <Button size="sm" onClick={() => setForm({ mode: 'create' })}>Add event</Button>}
        </div>
      </div>

      <p className="text-[12.5px] text-slate-light">
        All dates and deadlines use the {timezone.replace(/_/g, ' ')} timezone. Normal task deadlines are Sunday at 11:59 PM.
      </p>

      {error && <Alert tone="danger" title="Calendar unavailable">{error}</Alert>}
      {isAdmin && tableMissing && (
        <Alert tone="warn" title="Calendar events table not found">
          Admin events cannot be saved yet. Run the calendar SQL migration (supabase/migrations/20261005_calendar_and_theme.sql), then refresh.
        </Alert>
      )}

      {/* Legend */}
      <ul className="flex flex-wrap gap-2 text-[12px]" aria-label="Legend">
        {(Object.keys(STATUS_STYLE) as CalStatus[]).map((k) => (
          <li key={k} className={`rounded-full border px-2.5 py-1 font-semibold ${STATUS_STYLE[k].chip}`}>{STATUS_STYLE[k].label}</li>
        ))}
        <li className="rounded-full border border-amber/40 px-2.5 py-1 font-semibold text-amber-dark">★ Admin event</li>
      </ul>

      {view === 'month' && (
        <Card className="overflow-hidden">
          <table className="w-full table-fixed border-collapse" aria-label={`Calendar for ${heading}`}>
            <thead>
              <tr>{WEEKDAYS.map((d) => (
                <th key={d} scope="col" className="border-b border-mist-deep bg-mist/50 py-2 text-[11.5px] font-semibold uppercase tracking-wide text-slate-light">{d}</th>
              ))}</tr>
            </thead>
            <tbody>
              {Array.from({ length: monthDays.length / 7 }, (_, w) => (
                <tr key={w}>
                  {monthDays.slice(w * 7, w * 7 + 7).map((d) => {
                    const key = ymd(d); const list = byDay(key);
                    const isToday = key === today; const inMonth = isSameMonth(d, cursor); const isSel = key === selectedDay;
                    return (
                      <td key={key} className={`h-[84px] align-top border-b border-r border-mist-deep p-1 sm:h-[112px] sm:p-1.5 ${inMonth ? '' : 'bg-mist/40'}`}>
                        <button type="button" onClick={() => { setSelectedDay(key); }}
                                aria-label={`${format(d, 'EEEE d MMMM yyyy')}${isToday ? ', today' : ''}, ${list.length} event${list.length === 1 ? '' : 's'}`}
                                aria-current={isToday ? 'date' : undefined}
                                className={`mb-1 grid h-7 min-w-7 place-items-center rounded-full px-1 text-[12.5px] font-semibold ${
                                  isToday ? 'accent-gold-bg text-ink-deep ring-2 ring-amber/40' : isSel ? 'bg-ink text-white' : inMonth ? 'text-ink' : 'text-slate-light'}`}>
                          {format(d, 'd')}
                        </button>
                        {/* wide screens: titled chips; phones: coloured dots (details are in the day list below) */}
                        <div className="hidden space-y-0.5 sm:block">
                          {list.slice(0, 3).map((e) => (
                            <button key={e.id} type="button" onClick={() => setActive(e)} title={e.title}
                                    className={`block w-full truncate rounded border px-1.5 py-0.5 text-left text-[11.5px] font-medium ${STATUS_STYLE[e.status].chip} ${e.kind === 'admin' ? 'ring-1 ring-amber/50' : ''}`}>
                              {e.kind === 'admin' ? '★ ' : ''}{e.title}
                            </button>
                          ))}
                          {list.length > 3 && (
                            <button type="button" onClick={() => setSelectedDay(key)} className="px-1 text-[11.5px] font-semibold text-signal">
                              +{list.length - 3} more
                            </button>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-0.5 sm:hidden" aria-hidden="true">
                          {list.slice(0, 4).map((e) => (
                            <span key={e.id} className={`h-1.5 w-1.5 rounded-full ${e.status === 'overdue' ? 'bg-danger' : e.kind === 'admin' ? 'accent-gold-bg' : 'bg-signal'}`} />
                          ))}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {view === 'week' && (
        <div className="grid gap-3 md:grid-cols-7">
          {weekDays.map((d) => {
            const key = ymd(d); const list = byDay(key); const isToday = key === today;
            return (
              <Card key={key} className={`p-3 ${isToday ? 'ring-2 ring-amber/50' : ''}`}>
                <p className={`text-[12px] font-semibold ${isToday ? 'text-amber-dark' : 'text-slate-light'}`} aria-current={isToday ? 'date' : undefined}>
                  {format(d, 'EEE d MMM')}{isToday ? ' · Today' : ''}
                </p>
                <ul className="mt-2 space-y-1.5">
                  {list.map((e) => <EventChip key={e.id} e={e} onOpen={setActive} />)}
                  {!list.length && <li className="text-[12px] text-slate-light">Nothing scheduled</li>}
                </ul>
              </Card>
            );
          })}
        </div>
      )}

      {view === 'day' && (
        <Card className="p-5">
          <p className="text-[13px] font-semibold text-slate-light" aria-current={ymd(cursor) === today ? 'date' : undefined}>
            {ymd(cursor) === today ? 'Today' : format(cursor, 'EEEE')}
          </p>
          <ul className="mt-3 space-y-2">
            {byDay(ymd(cursor)).map((e) => <EventChip key={e.id} e={e} onOpen={setActive} wide />)}
          </ul>
          {!byDay(ymd(cursor)).length && <p className="text-[14px] text-slate-light">Nothing scheduled for this day.</p>}
        </Card>
      )}

      {/* Day list (always visible under the month grid; essential on phones) */}
      {view === 'month' && (
        <Card className="p-5">
          <h3 className="font-display text-[15px] font-bold text-ink">{format(parseDate(selectedDay), 'EEEE, d MMMM yyyy')}{selectedDay === today ? ' · Today' : ''}</h3>
          <ul className="mt-3 space-y-2">
            {dayList.map((e) => <EventChip key={e.id} e={e} onOpen={setActive} wide />)}
          </ul>
          {!dayList.length && <p className="mt-1 text-[14px] text-slate-light">No events on this day.</p>}
        </Card>
      )}

      {!loading && !error && visibleEvents.length === 0 && (
        <Card className="px-6 py-8 text-center">
          <h3 className="font-display text-[16px] font-bold text-ink">No events {view === 'month' ? 'this month' : view === 'week' ? 'this week' : 'today'}</h3>
          <p className="mx-auto mt-1 max-w-md text-[14px] text-slate">
            {isAdmin
              ? 'Internship dates, deadlines and events you add will appear here.'
              : 'Your task deadlines and important dates appear here once your internship has started and tasks are assigned.'}
          </p>
        </Card>
      )}
      {loading && <p role="status" className="text-[13px] text-slate-light">Loading calendar…</p>}

      {active && (
        <EventDialog event={active} isAdmin={isAdmin} onClose={() => setActive(null)}
                     onEdit={() => { setForm({ mode: 'edit', event: active }); setActive(null); }}
                     onDeleted={() => { setActive(null); setTick((t) => t + 1); }} />
      )}
      {form && (
        <EventForm mode={form.mode} event={form.event} students={students} defaultDate={selectedDay}
                   onClose={() => setForm(null)} onSaved={() => { setForm(null); setTick((t) => t + 1); }} />
      )}
    </div>
  );
}

function EventChip({ e, onOpen, wide = false }: { e: CalEvent; onOpen: (e: CalEvent) => void; wide?: boolean }) {
  return (
    <li>
      <button type="button" onClick={() => onOpen(e)}
              className={`w-full rounded-lg border px-2.5 py-1.5 text-left ${STATUS_STYLE[e.status].chip} ${e.kind === 'admin' ? 'ring-1 ring-amber/50' : ''}`}>
        <span className="block text-[12.5px] font-semibold leading-snug">{e.kind === 'admin' ? '★ ' : ''}{e.title}</span>
        <span className="block text-[11.5px] opacity-80">
          {STATUS_STYLE[e.status].label}{e.time ? ` · ${e.time}` : ''}{wide && e.who ? ` · ${e.who}` : ''}
        </span>
      </button>
    </li>
  );
}

function EventDialog({ event, isAdmin, onClose, onEdit, onDeleted }: {
  event: CalEvent; isAdmin: boolean; onClose: () => void; onEdit: () => void; onDeleted: () => void;
}) {
  const closeRef = React.useRef<HTMLButtonElement>(null);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  async function remove() {
    if (!window.confirm('Delete this event?')) return;
    setBusy(true); setError(null);
    const res = await fetch(`/api/admin/calendar-events/${event.id.replace(/^ev-/, '')}`, { method: 'DELETE' });
    if (!res.ok) { const d = await res.json().catch(() => ({})); setError(d?.error ?? 'Could not delete.'); setBusy(false); return; }
    onDeleted();
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-labelledby="event-title"
           className="card w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3">
          <h3 id="event-title" className="font-display text-lg font-extrabold text-ink">{event.title}</h3>
          <button ref={closeRef} type="button" onClick={onClose} aria-label="Close details"
                  className="rounded-lg border border-mist-deep px-2.5 py-1 text-[13px] font-semibold text-slate hover:bg-mist">✕</button>
        </div>
        <dl className="mt-4 space-y-2 text-[14px]">
          <Row k="Date" v={event.endDate && event.endDate !== event.date
            ? `${format(parseDate(event.date), 'EEE d MMM yyyy')} – ${format(parseDate(event.endDate), 'EEE d MMM yyyy')}`
            : format(parseDate(event.date), 'EEEE d MMMM yyyy')} />
          {event.time && <Row k={event.kind === 'deadline' ? 'Due by' : 'Time'} v={event.time} />}
          <Row k="Status" v={STATUS_STYLE[event.status].label} />
          {event.who && <Row k={event.kind === 'admin' ? 'For' : 'Student'} v={event.who} />}
          {event.description && <Row k="Details" v={event.description} />}
        </dl>
        {error && <div className="mt-3"><Alert tone="danger">{error}</Alert></div>}
        <div className="mt-5 flex flex-wrap gap-2">
          {event.href && <Link href={event.href} className="inline-flex h-9 items-center rounded-xl bg-signal px-3.5 text-[13px] font-semibold text-white">Open</Link>}
          {isAdmin && event.editable && (
            <>
              <Button size="sm" variant="secondary" onClick={onEdit}>Edit</Button>
              <Button size="sm" variant="danger" onClick={remove} disabled={busy}>Delete</Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const Row = ({ k, v }: { k: string; v: string }) => (
  <div className="flex gap-3"><dt className="w-20 shrink-0 text-slate-light">{k}</dt><dd className="font-medium text-ink">{v}</dd></div>
);

function EventForm({ mode, event, students, defaultDate, onClose, onSaved }: {
  mode: 'create' | 'edit'; event?: CalEvent; students: Student[]; defaultDate: string;
  onClose: () => void; onSaved: () => void;
}) {
  const [f, setF] = React.useState({
    title: event?.title ?? '', description: event?.description ?? '',
    event_date: event?.date ?? defaultDate, end_date: event?.endDate ?? '',
    event_time: toTime24(event?.time), audience: (event?.audience ?? 'all') as 'all' | 'student', student_id: event?.studentId ?? '',
  });
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setF((v) => ({ ...v, [k]: e.target.value }));

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  async function save(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setError(null);
    try {
      const url = mode === 'edit' ? `/api/admin/calendar-events/${event!.id.replace(/^ev-/, '')}` : '/api/admin/calendar-events';
      const res = await fetch(url, {
        method: mode === 'edit' ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(f),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d?.error ?? 'Could not save the event.');
      onSaved();
    } catch (err) { setError(err instanceof Error ? err.message : 'Could not save the event.'); setBusy(false); }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/50 p-4" onClick={onClose}>
      <form role="dialog" aria-modal="true" aria-labelledby="form-title" onSubmit={save}
            className="card w-full max-w-lg space-y-4 p-6" onClick={(e) => e.stopPropagation()}>
        <h3 id="form-title" className="font-display text-lg font-extrabold text-ink">{mode === 'edit' ? 'Edit event' : 'Add calendar event'}</h3>
        <label className="form-row"><span>Title</span><input required minLength={3} maxLength={120} value={f.title} onChange={set('title')} /></label>
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="form-row"><span>Date</span><input type="date" required value={f.event_date} onChange={set('event_date')} /></label>
          <label className="form-row"><span>End date (optional)</span><input type="date" value={f.end_date} min={f.event_date} onChange={set('end_date')} /></label>
          <label className="form-row"><span>Time (optional)</span><input type="time" value={f.event_time} onChange={set('event_time')} /></label>
        </div>
        <label className="form-row"><span>Details (optional)</span><textarea rows={3} maxLength={1000} value={f.description} onChange={set('description')} /></label>
        <label className="form-row"><span>Visible to</span>
          <select value={f.audience} onChange={set('audience')}>
            <option value="all">All students</option><option value="student">One student</option>
          </select></label>
        {f.audience === 'student' && (
          <label className="form-row"><span>Student</span>
            <select required value={f.student_id} onChange={set('student_id')}>
              <option value="">Choose a student…</option>
              {students.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select></label>
        )}
        {error && <Alert tone="danger">{error}</Alert>}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save event'}</Button>
        </div>
      </form>
    </div>
  );
}

/** "3:30 PM" -> "15:30" for <input type="time">. */
function toTime24(t?: string | null) {
  if (!t) return '';
  const m = /^(\d{1,2}):(\d{2}) (AM|PM)$/.exec(t);
  if (!m) return '';
  let h = Number(m[1]) % 12; if (m[3] === 'PM') h += 12;
  return `${String(h).padStart(2, '0')}:${m[2]}`;
}
