import { type NextRequest } from 'next/server';
import { todayInTz } from '@/lib/tz';
import { apiAdmin } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { reviewSchema } from '@/lib/validation';
import { evaluateWeekProgress, recomputeScores } from '@/lib/services/internship';
import { notify } from '@/lib/notifications';
import { sendEmail } from '@/lib/email';
import { audit } from '@/lib/audit';
import { ok, fail, zodFail } from '../../../_lib';

/**
 * Reviewing a submission is what drives progression: approving enough of a
 * week's required points completes the week and unlocks the next one.
 */
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await apiAdmin();
    const raw = await req.json();

    const db = createAdminClient();

    // Admin exception: reopen a task after its deadline or after a revision/rejection.
    if (raw?.action === 'reopen') {
      const { data: submission } = await db.from('submissions')
        .select('id, task_id, internship_id, student_id, internship_tasks(title)')
        .eq('id', params.id).single();
      if (!submission) return fail(new Error('Submission not found.'));
      const today = todayInTz();
      const { error } = await db.from('internship_tasks')
        .update({ status: 'available', deadline: today })
        .eq('id', submission.task_id);
      if (error) return fail(new Error(error.message));
      await notify(submission.student_id, 'task_assigned',
        `The task "${(submission as any).internship_tasks?.title ?? 'your task'}" has been reopened. You can submit it again today.`,
        `/dashboard/tasks/${submission.task_id}`);
      await audit(admin.id, 'submission.reopen', 'submission', submission.id, { task_id: submission.task_id });
      return ok();
    }

    const parsed = reviewSchema.safeParse(raw);
    if (!parsed.success) return zodFail(parsed.error.issues);
    const { status, score, feedback } = parsed.data;
    const { data: submission } = await db.from('submissions')
      .select('id, task_id, internship_id, student_id, internship_tasks(title, week_id), profiles!submissions_student_id_fkey(full_name,email)')
      .eq('id', params.id).single();
    if (!submission) return fail(new Error('Submission not found.'));

    await db.from('submissions').update({
      status, score: score ?? null, feedback: feedback ?? null,
      reviewed_by: admin.id, reviewed_at: new Date().toISOString(),
    }).eq('id', submission.id);

    const taskStatus = status === 'approved' ? 'approved'
      : status === 'revision_required' ? 'revision_required' : 'rejected';
    await db.from('internship_tasks')
      .update({ status: taskStatus, score: status === 'approved' ? (score ?? 100) : null })
      .eq('id', submission.task_id);

    const task = (submission as any).internship_tasks;
    const student = (submission as any).profiles;

    await notify(submission.student_id,
      status === 'approved' ? 'task_approved' : 'revision_requested',
      status === 'approved'
        ? `"${task.title}" approved with ${score ?? 100}/100.`
        : `"${task.title}" needs another pass.${feedback ? ` ${feedback}` : ''}`,
      '/dashboard/feedback');

    if (student?.email) {
      await sendEmail(student.email, 'task_reviewed', {
        name: student.full_name, task: task.title, status, score, feedback,
      });
    }

    let progression: { completed: boolean; unlockedWeek?: number | null } = { completed: false };
    if (status === 'approved') {
      progression = await evaluateWeekProgress(submission.internship_id, task.week_id);
    }
    // Always refresh the scores after a review, even when the week was already closed.
    await recomputeScores(submission.internship_id);

    await audit(admin.id, `submission.${status}`, 'submission', submission.id, { score });
    return ok({ progression });
  } catch (e) { return fail(e); }
}


