import { type NextRequest } from 'next/server';
import { z } from 'zod';
import { apiAdmin } from '@/lib/auth';
import { activateInternship, rescheduleInternship } from '@/lib/services/internship';
import { ok, fail, zodFail } from '../../_lib';

const schema = z.object({
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Choose a start date.'),
  application_id: z.string().uuid().optional(),
  internship_id: z.string().uuid().optional(),
}).refine((v) => v.application_id || v.internship_id, { message: 'Choose a student.' });

/**
 * Admin only. Sets the real internship start date:
 *  - for a student whose payment is verified but who has no internship yet (activates it and issues the offer letter), or
 *  - changes the date of an active internship that has no submissions yet.
 */
export async function POST(req: NextRequest) {
  try {
    const admin = await apiAdmin();
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) return zodFail(parsed.error.issues);
    const { start_date, application_id, internship_id } = parsed.data;

    if (internship_id) return ok(await rescheduleInternship(internship_id, start_date, admin.id));
    return ok(await activateInternship({ applicationId: application_id!, startDate: start_date, adminId: admin.id }));
  } catch (e) { return fail(e); }
}
