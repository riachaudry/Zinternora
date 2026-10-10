import { type NextRequest } from 'next/server';
import { apiAdmin } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { activateInternship } from '@/lib/services/internship';
import { isMonday, parseDate } from '@/lib/dates';
import { notify } from '@/lib/notifications';
import { audit } from '@/lib/audit';
import { z } from 'zod';
import { ok, fail, zodFail } from '../../../_lib';

const schema = z.object({
  action: z.enum(['verify', 'reject', 'request_correction', 'refund']),
  note: z.string().max(1000).optional(),
  // Optional on purpose: an admin may verify the money first and set the real start date later.
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use a valid start date.').optional().or(z.literal('')),
});

/**
 * Payment verification. Verifying is the single gate that activates an
 * internship — it is never automatic and never triggered by the student.
 */
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await apiAdmin();
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) return zodFail(parsed.error.issues);
    const { action, note, start_date } = parsed.data;

    const db = createAdminClient();
    const { data: payment } = await db.from('payments')
      .select('id, application_id, student_id, status').eq('id', params.id).single();
    if (!payment) return fail(new Error('Payment not found.'));

    if (action === 'verify') {
      if (payment.status === 'verified') return fail(new Error('This payment is already verified.'));
      if (!['submitted', 'under_verification', 'correction_requested'].includes(payment.status)) {
        return fail(new Error('Only a pending payment can be verified.'));
      }

      // Validate the start date BEFORE changing anything, so a bad date never leaves a half-finished state.
      if (start_date) {
        if (Number.isNaN(parseDate(start_date).getTime())) return fail(new Error('Choose a valid start date.'));
        if (!isMonday(start_date)) return fail(new Error('The start date must be a Monday, so each week ends on Sunday.'));
      }

      await db.from('payments').update({
        status: 'verified', verified_by: admin.id, verified_at: new Date().toISOString(), admin_note: note ?? null,
      }).eq('id', payment.id);

      if (!start_date) {
        // Money confirmed, real start date not decided yet: no offer letter and no tasks until an admin sets it.
        await notify(payment.student_id, 'payment_verified',
          'Your payment is verified. Your offer letter and Week 1 will open once the internship start date is confirmed.',
          '/dashboard/payment');
        await audit(admin.id, 'payment.verify', 'payment', payment.id, { start_date: null });
        return ok({ verified: true, activated: false });
      }

      try {
        const result = await activateInternship({
          applicationId: payment.application_id, startDate: start_date, adminId: admin.id,
        });
        await audit(admin.id, 'payment.verify', 'payment', payment.id, { start_date });
        return ok({ ...result, verified: true, activated: true });
      } catch (err) {
        // Roll the payment back to what it was so it can be retried.
        await db.from('payments').update({
          status: payment.status, verified_by: null, verified_at: null,
        }).eq('id', payment.id);
        throw err;
      }
    }

    const statusMap = {
      reject: 'rejected', request_correction: 'correction_requested', refund: 'refunded',
    } as const;
    const messageMap = {
      reject: 'Your payment could not be verified. Check the details below and contact HR on WhatsApp.',
      request_correction: 'We need a correction on your payment before it can be verified.',
      refund: 'Your payment has been marked as refunded.',
    } as const;

    await db.from('payments').update({
      status: statusMap[action], admin_note: note ?? null,
      verified_by: admin.id, verified_at: new Date().toISOString(),
    }).eq('id', payment.id);

    if (action === 'reject') {
      await db.from('applications').update({ status: 'rejected', reviewed_by: admin.id, admin_note: note ?? null })
        .eq('id', payment.application_id);
    }

    await notify(payment.student_id, 'payment_rejected',
      `${messageMap[action]}${note ? ` Note: ${note}` : ''}`, '/dashboard/payment');
    await audit(admin.id, `payment.${action}`, 'payment', payment.id, { note });
    return ok();
  } catch (e) { return fail(e); }
}


