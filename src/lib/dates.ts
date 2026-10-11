import { addDays, differenceInCalendarDays, endOfWeek, format, isAfter, isBefore, startOfDay } from 'date-fns';
import type { Duration } from './brand';
import { todayInTz } from './tz';

/**
 * Week engine. Every date in The Internora is derived from one stored start_date.
 * Nothing is hard-coded: week 1 is days 0-6, week 2 is days 7-13, and so on.
 */
/** Parses 'yyyy-MM-dd' as a plain calendar date (no timezone shift); other inputs use normal Date parsing. */
export function parseDate(d: Date | string): Date {
  if (d instanceof Date) return d;
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(d);
  return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : new Date(d);
}

export type WeekWindow = { weekNumber: number; startDate: Date; endDate: Date };

export function weekWindows(startDate: Date | string, duration: Duration): WeekWindow[] {
  const start = startOfDay(parseDate(startDate));
  return Array.from({ length: duration }, (_, i) => ({
    weekNumber: i + 1,
    startDate: addDays(start, i * 7),
    endDate: addDays(start, i * 7 + 6),
  }));
}

export function internshipEndDate(startDate: Date | string, duration: Duration): Date {
  return addDays(startOfDay(parseDate(startDate)), duration * 7 - 1);
}

export function totalDays(duration: Duration) {
  return duration * 7;
}

/** "Day 10 of 56" — day 1 is the start date itself. */
export function dayOfInternship(startDate: Date | string, on: Date = new Date()) {
  return differenceInCalendarDays(startOfDay(on), startOfDay(parseDate(startDate))) + 1;
}

export function daysRemaining(endDate: Date | string, on: Date = new Date()) {
  return Math.max(0, differenceInCalendarDays(startOfDay(parseDate(endDate)), startOfDay(on)));
}

export function currentWeekNumber(startDate: Date | string, duration: Duration, on: Date = new Date()) {
  const day = dayOfInternship(startDate, on);
  if (day < 1) return 0;
  return Math.min(duration, Math.ceil(day / 7));
}

export function isWithin(d: Date, start: Date | string, end: Date | string) {
  const day = startOfDay(d);
  return !isBefore(day, startOfDay(parseDate(start))) && !isAfter(day, startOfDay(parseDate(end)));
}

/** "Sunday, 20 September 2026" — always rendered from the live system date. */
export const longDate = (d: Date | string = new Date()) => format(parseDate(d), 'EEEE, d MMMM yyyy');
/** e.g. 10 October 2026 (used on official documents) */
export const fullDate = (d: Date | string) => format(parseDate(d), 'd MMMM yyyy');
export const shortDate = (d: Date | string) => format(parseDate(d), 'd MMM yyyy');
export const isoDate = (d: Date | string) => format(parseDate(d), 'yyyy-MM-dd');
/** Overdue = today (in the app timezone) is after the deadline date. A task due Sunday stays open until 11:59 PM Sunday. */
export const isOverdue = (deadline: Date | string, on: Date = new Date()) =>
  todayInTz(undefined, on) > isoDate(deadline);
export const isMonday = (d: Date | string) => parseDate(d).getDay() === 1;

/** Calendar Sunday cutoff for a task/week. The deadline is the Sunday that
 * falls on or after the task's week start, so students see a clear Sunday
 * submission deadline while the actual internship start date remains intact.
 */
export const sundayDeadline = (weekStart: Date | string) => endOfWeek(startOfDay(parseDate(weekStart)), { weekStartsOn: 1 });


