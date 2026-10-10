import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from './types';
import { publicEnv } from '../env';

/**
 * Request-scoped client. Runs as the signed-in user, so RLS applies.
 *
 * Next 15: cookies() is async. createClient() stays synchronous (so existing
 * callers don't change) and the cookie store is awaited lazily inside the
 * getAll / setAll handlers.
 */
export function createClient() {
  const { url, anonKey } = publicEnv('server database access');
  return createServerClient<Database>(
    url,
    anonKey,
    {
      cookies: {
        getAll: async () => {
          const store = await cookies();
          return store.getAll();
        },
        setAll: async (list: { name: string; value: string; options?: Record<string, unknown> }[]) => {
          try {
            const store = await cookies();
            list.forEach(({ name, value, options }) => store.set(name, value, options));
          } catch { /* called from a Server Component — middleware refreshes the session */ }
        },
      },
    },
  );
}