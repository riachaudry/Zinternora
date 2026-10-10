/**
 * Central, safe access to environment variables.
 *
 * Only the NEXT_PUBLIC_ names below are allowed in browser code. The service
 * role key is read on the server only and is never sent to the browser.
 * Names match .env.example exactly.
 */
export class EnvError extends Error {
  constructor(public missing: string[], where: string) {
    super(
      `Missing environment variable${missing.length > 1 ? 's' : ''}: ${missing.join(', ')}. ` +
      `Add ${missing.length > 1 ? 'them' : 'it'} to your .env.local file (on your computer) or to your ` +
      `hosting dashboard (Netlify/Vercel), then restart. Needed by: ${where}.`,
    );
    this.name = 'EnvError';
  }
}

const clean = (v: string | undefined) => (v ?? '').trim();

/** Public values: safe for browser and server. Must be read as literal process.env.NEXT_PUBLIC_* for Next.js to inline them. */
export function publicEnv(where = 'Supabase') {
  const url = clean(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const anonKey = clean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const missing: string[] = [];
  if (!url) missing.push('NEXT_PUBLIC_SUPABASE_URL');
  if (!anonKey) missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  if (missing.length) throw new EnvError(missing, where);
  return { url, anonKey };
}

/** Server-only. Never import this from a 'use client' file. */
export function serviceRoleEnv(where = 'admin database access') {
  const { url } = publicEnv(where);
  const serviceKey = clean(process.env.SUPABASE_SERVICE_ROLE_KEY);
  if (!serviceKey) throw new EnvError(['SUPABASE_SERVICE_ROLE_KEY'], where);
  return { url, serviceKey };
}

/** IANA timezone used for deadlines and the calendar. Defaults to the value in .env.example. */
export const appTimezone = () => clean(process.env.APP_TIMEZONE) || 'Asia/Karachi';
