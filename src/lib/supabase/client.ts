'use client';
import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './types';
import { publicEnv } from '../env';

export const createClient = () => {
  const { url, anonKey } = publicEnv('the sign-in form');
  return createBrowserClient<Database>(url, anonKey);
};
