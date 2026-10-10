import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from './types';
import { publicEnv } from '../env';

/** Request-scoped client. Runs as the signed-in user, so RLS applies. */
export function createClient() {
  const store = cookies();
  const { url, anonKey } = publicEnv('server database access');
  return createServerClient<Database>(
    url,
    anonKey,
    {
      cookies: {
        getAll: () => store.getAll(),
        setAll: (list: { name: string; value: string; options?: Record<string, unknown> }[]) => {
          try { list.forEach(({ name, value, options }) => store.set(name, value, options)); }
          catch { /* called from a Server Component — middleware refreshes the session */ }
        },
      },
    },
  );
}


