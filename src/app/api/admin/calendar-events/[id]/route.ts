import { type NextRequest } from 'next/server';
import { apiAdmin } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { audit } from '@/lib/audit';
import { ok, fail, zodFail } from '../../../_lib';
import { eventSchema } from '@/lib/validation';

/** Edit an admin-managed calendar event (admin only). */
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await apiAdmin();
    const parsed = eventSchema.safeParse(await req.json());
    if (!parsed.success) return zodFail(parsed.error.issues);
    const v = parsed.data;
    const { error } = await createAdminClient().from('calendar_events').update({
      title: v.title, description: v.description || null, event_date: v.event_date,
      end_date: v.end_date || null, event_time: v.event_time || null,
      audience: v.audience, student_id: v.audience === 'student' ? v.student_id : null,
    }).eq('id', params.id);
    if (error) return fail(new Error(error.message));
    await audit(admin.id, 'calendar.update', 'calendar_event', params.id);
    return ok();
  } catch (e) { return fail(e); }
}

/** Delete an admin-managed calendar event (admin only). */
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await apiAdmin();
    const { error } = await createAdminClient().from('calendar_events').delete().eq('id', params.id);
    if (error) return fail(new Error(error.message));
    await audit(admin.id, 'calendar.delete', 'calendar_event', params.id);
    return ok();
  } catch (e) { return fail(e); }
}
