import { type NextRequest } from 'next/server';
import { z } from 'zod';
import { apiAdmin } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { notify } from '@/lib/notifications';
import { audit } from '@/lib/audit';
import { ok, fail, zodFail } from '../../../_lib';

const schema = z.object({
  action: z.enum(['note', 'accept', 'reject', 'reopen', 'assign_batch']),
  note: z.string().max(1000).optional(),
  batch_id: z.string().uuid().nullable().optional(),
});

/**
 * Admin decisions on an application: accept, reject, reopen, notes and batching.
 * "Accepted" is recorded with reviewed_at/reviewed_by (status stays open until
 * payment is verified and the real start date is set, which activates it).
 */
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await apiAdmin();
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) return zodFail(parsed.error.issues);
    const { action, note, batch_id } = parsed.data;

    const db = createAdminClient();
    const { data: application } = await db.from('applications')
      .select('id, student_id, status').eq('id', params.id).maybeSingle();
    if (!application) return fail(new Error('Application not found.'));

    const base = { reviewed_by: admin.id, reviewed_at: new Date().toISOString() };

    if (action === 'assign_batch') {
      await db.from('applications').update({ batch_id: batch_id ?? null }).eq('id', application.id);
    } else if (action === 'accept') {
      if (!['submitted', 'payment_submitted', 'under_verification'].includes(application.status)) {
        return fail(new Error('Only an open application can be accepted.'));
      }
      await db.from('applications').update({ ...base, admin_note: note ?? null }).eq('id', application.id);
      await notify(application.student_id, 'application_accepted',
        'Your application was accepted. Complete the fee payment to continue.' + (note?.trim() ? ` Note: ${note.trim()}` : ''),
        '/dashboard/payment');
    } else if (action === 'reject') {
      if (application.status === 'approved') return fail(new Error('This internship is already active and cannot be rejected here.'));
      await db.from('applications').update({ ...base, status: 'rejected', admin_note: note ?? null }).eq('id', application.id);
      await notify(application.student_id, 'application_rejected',
        note?.trim() || 'Your application was not accepted. Open a support ticket if you need details.',
        '/dashboard/support');
    } else if (action === 'reopen') {
      if (application.status === 'approved') return fail(new Error('This internship is already active.'));
      await db.from('applications').update({ ...base, reviewed_at: null, reviewed_by: null, status: 'submitted', admin_note: note ?? null }).eq('id', application.id);
    } else {
      await db.from('applications').update({ admin_note: note ?? null }).eq('id', application.id);
    }

    await audit(admin.id, `application.${action}`, 'application', application.id);
    return ok();
  } catch (e) { return fail(e); }
}


