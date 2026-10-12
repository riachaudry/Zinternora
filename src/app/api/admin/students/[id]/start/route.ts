import { type NextRequest } from 'next/server';
import { apiAdmin } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { activateInternship } from '@/lib/services/internship';
import { todayInTz } from '@/lib/tz';
import { ok, fail } from '../../../../_lib';

/**
 * Admin only. One click from the student's profile:
 * generates the offer letter from the student's name and chosen field, starts the
 * 4-week internship today, builds all weeks/tasks, and keeps Week 1 pending until
 * an admin presses "Allow this week".
 */
export async function POST(_req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const admin = await apiAdmin();
    const db = createAdminClient();

    const { data: existing } = await db.from('internships').select('id').eq('student_id', params.id)
      .in('status', ['active', 'completed']).limit(1).maybeSingle();
    if (existing) return fail(new Error('This student already has an internship and offer letter.'));

    const { data: application } = await db.from('applications').select('id')
      .eq('student_id', params.id).not('status', 'in', '("rejected","cancelled")')
      .order('applied_at', { ascending: false }).limit(1).maybeSingle();
    if (!application) return fail(new Error('This student has not applied for an internship yet.'));

    const result = await activateInternship({
      applicationId: application.id, startDate: todayInTz(), adminId: admin.id,
      anyDay: true, holdWeekOne: true,
    });
    return ok(result);
  } catch (e) { return fail(e); }
}
