import { type NextRequest } from 'next/server';
import { z } from 'zod';
import { apiUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { ok, fail, zodFail } from '../../_lib';

const schema = z.object({ theme: z.enum(['classic', 'light', 'dark']) });

/** Saves the signed-in user's theme. Works for students and admins; RLS limits the update to their own row. */
export async function POST(req: NextRequest) {
  try {
    const user = await apiUser();
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) return zodFail(parsed.error.issues);
    const { error } = await createClient().from('profiles').update({ theme: parsed.data.theme } as never).eq('id', user.id);
    // If the optional `theme` column has not been added yet, the browser still remembers the choice.
    if (error) return ok({ ok: true, persisted: false });
    return ok({ ok: true, persisted: true });
  } catch (e) { return fail(e); }
}
