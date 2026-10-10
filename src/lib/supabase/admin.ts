import 'server-only';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { serviceRoleEnv } from '../env';

/**
 * Service-role client. Bypasses RLS, so it is only ever imported by server
 * code that has already checked the caller is an admin (see lib/auth.ts).
 * Throws a clear message if SUPABASE_SERVICE_ROLE_KEY is not configured.
 */
export const createAdminClient = () => {
  const { url, serviceKey } = serviceRoleEnv();
  return createSupabaseClient<Database>(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
};
