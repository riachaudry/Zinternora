import { appTimezone } from './env';

/**
 * Timezone helpers. Everything date-based in Zinternora (deadlines, "today" on
 * the calendar, overdue checks) uses the one timezone from APP_TIMEZONE
 * (default Asia/Karachi), not the server's or the browser's own clock zone.
 */

/** Today's calendar date as yyyy-MM-dd in the given timezone. */
export function todayInTz(tz: string = appTimezone(), now: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
  return `${get('year')}-${get('month')}-${get('day')}`;
}

/** Calendar date (yyyy-MM-dd) of a timestamp, as seen in the given timezone. */
export function dateInTz(ts: string | Date, tz: string = appTimezone()): string {
  return todayInTz(tz, new Date(ts));
}

/** Time of day like "11:59 PM" for a timestamp in the given timezone. */
export function timeInTz(ts: string | Date, tz: string = appTimezone()): string {
  return new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: 'numeric', minute: '2-digit' }).format(new Date(ts));
}

/** True once the deadline day has fully ended (i.e. after 11:59 PM on that date in the app timezone). */
export function isDeadlinePassed(deadline: string, now: Date = new Date(), tz: string = appTimezone()): boolean {
  return todayInTz(tz, now) > deadline.slice(0, 10);
}
