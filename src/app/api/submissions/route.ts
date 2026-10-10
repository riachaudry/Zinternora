import { type NextRequest } from 'next/server';
import { apiUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { advanceAfterTaskSubmission } from '@/lib/services/internship';
import { submissionSchema, checkFile } from '@/lib/validation';
import { notifyMany } from '@/lib/notifications';
import { audit } from '@/lib/audit';
import { isDeadlinePassed } from '@/lib/tz';
import { ok, fail, zodFail } from '../_lib';

export async function POST(req: NextRequest) {
  try {
    const user = await apiUser();
    const parsed = submissionSchema.safeParse(await req.json());
    if (!parsed.success) return zodFail(parsed.error.issues);
    const body = parsed.data;

    const supabase = createClient();

    const { data: task } = await supabase.from('internship_tasks')
      .select('id, internship_id, title, status, allowed_file_types, week_id, deadline, internship_weeks!inner(status, week_number)')
      .eq('id', body.task_id).single();
    if (!task) return fail(new Error('That task is not available to you.'));

    // Access rules, all enforced here on the server (the page UI is never trusted):
    // 1) the internship must be active (payment verified + start date set by an admin).
    const { data: internship } = await supabase.from('internships')
      .select('id, status').eq('id', task.internship_id).maybeSingle();
    if (!internship || internship.status !== 'active') {
      return fail(new Error('Your internship is not active, so tasks cannot be submitted.'));
    }

    // 2) the week and the task must be unlocked.
    const week = (task as any).internship_weeks;
    if (week.status === 'locked' || task.status === 'locked') {
      return fail(new Error('This task is still locked. Finish the previous task first.'));
    }
    if (task.status === 'approved') {
      return fail(new Error('This task is already approved.'));
    }
    if (['under_review', 'submitted'].includes(task.status)) {
      return fail(new Error('This task is already waiting for review. You can submit again if the reviewer asks for changes.'));
    }

    // 3) normal deadlines are Sunday 11:59 PM in the app timezone. Late work is blocked
    //    unless an admin reopens the task (which sets a new deadline).
    if (task.deadline && isDeadlinePassed(task.deadline)) {
      return fail(new Error('This task deadline has passed. Please contact the admin team to reopen it.'));
    }

    if (body.file_name && body.file_size) {
      const check = checkFile(body.file_name, body.file_size, task.allowed_file_types);
      if (!check.ok) return fail(new Error(check.error));
    }

    const { count } = await supabase.from('submissions')
      .select('id', { count: 'exact', head: true }).eq('task_id', task.id);

    const { error } = await supabase.from('submissions').insert({
      task_id: task.id, internship_id: task.internship_id, student_id: user.id,
      attempt: (count ?? 0) + 1,
      file_url: body.file_url || null, file_name: body.file_name || null, file_size: body.file_size || null,
      url: body.url || null, text_response: body.text_response || null, comments: body.comments || null,
      status: 'under_review',
    });
    if (error) return fail(new Error(error.message));

    // Students cannot write to internship_tasks (RLS), so the status change is made server-side, after the checks above.
    await createAdminClient().from('internship_tasks').update({ status: 'under_review' }).eq('id', task.id);

    // Unlock the next task immediately after submission. This is enforced
    // server-side so the student cannot skip ahead by changing the URL.
    await advanceAfterTaskSubmission(task.id, task.internship_id);

    const { data: admins } = await createAdminClient().from('profiles').select('id').eq('role', 'admin');
    await notifyMany((admins ?? []).map((a) => a.id), 'task_assigned',
      `${user.full_name} submitted "${task.title}" for review.`, '/admin/submissions');

    await audit(user.id, 'submission.create', 'task', task.id);
    return ok();
  } catch (e) { return fail(e); }
}


