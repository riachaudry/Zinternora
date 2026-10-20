import { apiAdmin } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendEmail } from '@/lib/email';
import { audit } from '@/lib/audit';
import { PLANS } from '@/lib/brand';
import { ok, fail } from '../../_lib';

const MAX_PER_CLICK = 40;       // keeps one request short and stays inside email-provider limits
const REPEAT_AFTER_DAYS = 3;    // nobody is emailed again sooner than this

/** Students who registered but never submitted a payment, and were not reminded recently. */
async function pending() {
  const db = createAdminClient();
  const { data: students } = await db.from('profiles')
    .select('id, full_name, email')
    .eq('role', 'student').eq('is_demo', false)
    .order('created_at', { ascending: false }).limit(500);
  const list = students ?? [];
  if (!list.length) return [];

  const ids = list.map((s) => s.id);
  const { data: paid } = await db.from('payments').select('student_id').in('student_id', ids);
  const { data: interns } = await db.from('internships').select('student_id').in('student_id', ids);
  const skip = new Set([...(paid ?? []), ...(interns ?? [])].map((r: any) => r.student_id));

  const since = new Date(Date.now() - REPEAT_AFTER_DAYS * 86400000).toISOString();
  const { data: recent } = await db.from('email_log').select('to_email')
    .eq('template', 'payment_reminder').eq('status', 'sent').gte('created_at', since);
  const recentSet = new Set((recent ?? []).map((r: any) => String(r.to_email).toLowerCase()));

  return list.filter((s) => !skip.has(s.id) && s.email && !recentSet.has(String(s.email).toLowerCase()));
}

export async function GET() {
  try {
    await apiAdmin();
    return ok({ count: (await pending()).length });
  } catch (e) { return fail(e); }
}

export async function POST() {
  try {
    const admin = await apiAdmin();
    const targets = (await pending()).slice(0, MAX_PER_CLICK);
    let sent = 0, failed = 0;
    for (const s of targets) {
      const r = await sendEmail(s.email, 'payment_reminder', { name: s.full_name, fee: PLANS[4].fee });
      if (r.status === 'sent') sent++; else failed++;
    }
    const remaining = Math.max(0, (await pending()).length);
    await audit(admin.id, 'students.payment_reminders', 'profiles', undefined, { sent, failed });
    return ok({ sent, failed, remaining });
  } catch (e) { return fail(e); }
}
