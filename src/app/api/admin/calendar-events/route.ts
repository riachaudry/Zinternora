import { type NextRequest } from 'next/server';
import { apiAdmin } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { notify } from '@/lib/notifications';
import { audit } from '@/lib/audit';
import { eventSchema } from '@/lib/validation';
import { ok, fail, zodFail } from '../../_lib';

/** Create an admin-managed calendar event (admin only). */
export async function POST(req: NextRequest) {
  try {
    const admin = await apiAdmin();
    const parsed = eventSchema.safeParse(await req.json());
    if (!parsed.success) return zodFail(parsed.error.issues);
    const v = parsed.data;
    const db = createAdminClient();
    const { data, error } = await db.from('calendar_events').insert({
      title: v.title, description: v.description || null, event_date: v.event_date,
      end_date: v.end_date || null, event_time: v.event_time || null,
      audience: v.audience, student_id: v.audience === 'student' ? v.student_id : null, created_by: admin.id,
    }).select('id').single();
    if (error) return fail(new Error(error.message.includes('calendar_events')
      ? 'The calendar database table is missing. Run the calendar SQL migration first.' : error.message));
    if (v.audience === 'student' && v.student_id) {
      await notify(v.student_id, 'task_assigned', `New calendar event: ${v.title} on ${v.event_date}.`, '/dashboard/calendar');
    }
    await audit(admin.id, 'calendar.create', 'calendar_event', data.id);
    return ok({ id: data.id });
  } catch (e) { return fail(e); }
}
