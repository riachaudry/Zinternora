import 'server-only';
import { createAdminClient } from '../supabase/admin';
import { isoDate, weekWindows, internshipEndDate, shortDate, sundayDeadline, isMonday, parseDate } from '../dates';
import { todayInTz } from '../tz';
import { autoIssueDocuments } from './documents';
import { getBrand } from '../settings';
import { taskCode } from '../ids';
import { computeScores, isWeekComplete } from '../scoring';
import { notify } from '../notifications';
import { sendEmail } from '../email';
import { audit } from '../audit';
import { WEEK_COMPLETION_THRESHOLD, type Duration } from '../brand';

/**
 * Activates an internship after an admin verifies payment.
 *
 * Builds every week window and every task row from the stored roadmap, so the
 * timeline is real data rather than anything computed in the browser. Dates are
 * derived from the chosen start date — nothing here is hard-coded.
 */
export async function activateInternship(opts: {
  applicationId: string;
  startDate: Date | string;   // admin picks "today" or a scheduled date
  adminId: string;
  /** One-click mode: any weekday is fine and Week 1 stays pending until an admin allows it. */
  anyDay?: boolean;
  holdWeekOne?: boolean;
}) {
  const db = createAdminClient();
  const { applicationId, startDate, adminId, anyDay = false, holdWeekOne = false } = opts;

  const { data: app, error: appErr } = await db
    .from('applications')
    .select('id, student_id, field_id, duration, status, profiles!applications_student_id_fkey(full_name,email), internship_fields(name, slug)')
    .eq('id', applicationId)
    .single();
  if (appErr || !app) throw new Error('Application not found.');

  const { data: payment } = await db
    .from('payments').select('status').eq('application_id', applicationId)
    .order('created_at', { ascending: false }).limit(1).single();
  if (payment?.status !== 'verified') throw new Error('Payment must be verified before activation.');

  const { data: existing } = await db.from('internships').select('id').eq('application_id', applicationId).maybeSingle();
  if (existing) return { internshipId: existing.id, alreadyActive: true };

  const duration = app.duration as Duration;
  const start = parseDate(startDate);
  if (Number.isNaN(start.getTime())) throw new Error('Choose a valid start date.');
  // Weeks run Monday to Sunday so every weekly deadline is a full Sunday 11:59 PM cutoff.
  if (!anyDay && !isMonday(start)) throw new Error('The internship start date must be a Monday, so each week ends on Sunday.');
  const end = internshipEndDate(start, duration);

  const { data: internship, error: intErr } = await db.from('internships').insert({
    application_id: applicationId,
    student_id: app.student_id,
    field_id: app.field_id,
    duration,
    status: 'active',
    start_date: isoDate(start),
    end_date: isoDate(end),
    current_week: 1,
  }).select('id').single();
  if (intErr || !internship) throw new Error(intErr?.message ?? 'Could not create the internship.');

  await buildWeeksAndTasks(internship.id, app.field_id, duration, start, holdWeekOne);

  await db.from('applications').update({
    status: 'approved', reviewed_at: new Date().toISOString(), reviewed_by: adminId,
  }).eq('id', applicationId);

  const offer = await issueOfferLetter(internship.id);

  const field = (app as any).internship_fields?.name ?? 'your field';
  const student = (app as any).profiles;

  await notify(app.student_id, 'internship_activated',
    holdWeekOne
      ? `Your ${duration}-week ${field} internship runs from ${shortDate(start)} to ${shortDate(end)}. HR will open your Week 1 tasks shortly.`
      : `Your ${duration}-week ${field} internship runs from ${shortDate(start)} to ${shortDate(end)}. Week 1 is open.`,
    '/dashboard/roadmap');
  await notify(app.student_id, 'offer_letter_issued',
    `Offer letter ${offer.publicId} has been issued.`, '/dashboard/offer-letter');

  if (student?.email) {
    await sendEmail(student.email, 'payment_verified', {
      name: student.full_name, startDate: shortDate(start), endDate: shortDate(end),
    });
    await sendEmail(student.email, 'offer_letter', {
      name: student.full_name, offerId: offer.publicId, field, duration,
    });
  }

  await audit(adminId, 'internship.activate', 'internship', internship.id, { duration, start: isoDate(start) });
  return { internshipId: internship.id, offerLetterId: offer.publicId, alreadyActive: false };
}

/** Copies roadmap templates into per-student week and task rows with real dates. */
async function buildWeeksAndTasks(internshipId: string, fieldId: string, duration: Duration, start: Date, holdFirst = false) {
  const db = createAdminClient();

  const { data: templateWeeks, error } = await db
    .from('roadmap_weeks')
    .select('id, week_number, title, summary, objectives, is_final, roadmap_tasks(*)')
    .eq('field_id', fieldId).eq('duration', duration)
    .order('week_number');
  if (error || !templateWeeks?.length) throw new Error('No roadmap found for this field and duration. Run the roadmap seed.');

  const windows = weekWindows(start, duration);

  for (const tw of templateWeeks as any[]) {
    const win = windows[tw.week_number - 1];
    const isFirst = tw.week_number === 1 && !holdFirst;

    const { data: week } = await db.from('internship_weeks').insert({
      internship_id: internshipId,
      week_number: tw.week_number,
      title: tw.title,
      summary: tw.summary,
      objectives: tw.objectives,
      is_final: tw.is_final,
      start_date: isoDate(win.startDate),
      end_date: isoDate(win.endDate),
      status: isFirst ? 'active' : 'locked',
      unlocked_at: isFirst ? new Date().toISOString() : null,
    }).select('id').single();
    if (!week) continue;

    const tasks = (tw.roadmap_tasks ?? []).sort((a: any, b: any) => a.task_number - b.task_number);
    if (!tasks.length) continue;

    await db.from('internship_tasks').insert(tasks.map((rt: any) => ({
      internship_id: internshipId,
      week_id: week.id,
      roadmap_task_id: rt.id,
      task_code: taskCode(tw.week_number, rt.task_number),
      task_number: rt.task_number,
      title: rt.title,
      description: rt.description,
      instructions: rt.instructions,
      objective: rt.objective,
      deliverable: rt.deliverable,
      points: rt.points,
      is_required: rt.is_required,
      submission_type: rt.submission_type,
      allowed_file_types: rt.allowed_file_types,
      unlock_date: isoDate(win.startDate),
      deadline: isoDate(win.endDate),
      status: isFirst && tasks.length ? 'available' : 'locked',
    })));
  }
}

export async function issueOfferLetter(internshipId: string) {
  const db = createAdminClient();
  const { data: existing } = await db.from('offer_letters').select('public_id').eq('internship_id', internshipId).maybeSingle();
  if (existing) return { publicId: existing.public_id };

  const { data: pid } = await db.rpc('next_public_id', { p_prefix: 'INT-OL', p_scope: 'offer_letter' });
  const { data, error } = await db.from('offer_letters')
    .insert({ internship_id: internshipId, public_id: pid as unknown as string })
    .select('public_id').single();
  if (error) throw new Error(error.message);
  return { publicId: data.public_id };
}

/**
 * Called after an admin reviews a submission. Enforces progression server-side:
 * a week only completes when enough required task points are approved, and the
 * next week only unlocks after that.
 */

/**
 * Task-by-task progression for the 1-month student experience.
 * A student submits Task 1 -> Task 2 unlocks, etc. After the final task of a
 * week is submitted, the next week and its first task unlock automatically.
 * Admin review/scoring can happen separately.
 */
export async function advanceAfterTaskSubmission(taskId: string, internshipId: string) {
  const db = createAdminClient();

  const { data: task } = await db.from('internship_tasks')
    .select('id, task_number, week_id, internship_weeks!inner(id, week_number, internship_id)')
    .eq('id', taskId).eq('internship_id', internshipId).single();
  if (!task) return;

  const week = (task as any).internship_weeks;

  const { data: nextTask } = await db.from('internship_tasks')
    .select('id, title, task_number')
    .eq('week_id', task.week_id)
    .eq('task_number', task.task_number + 1)
    .maybeSingle();

  if (nextTask) {
    await db.from('internship_tasks')
      .update({ status: 'available' })
      .eq('id', nextTask.id).eq('status', 'locked');
    await db.from('internships').update({ current_week: week.week_number }).eq('id', internshipId);
    return { nextTaskId: nextTask.id, nextWeek: week.week_number };
  }

  // Last task of this week. If there is no later week this is the final project:
  // the internship is only completed when an admin approves enough of the work
  // (see evaluateWeekProgress), never merely because the last task was submitted.
  const { data: laterWeek } = await db.from('internship_weeks')
    .select('id').eq('internship_id', internshipId).eq('week_number', week.week_number + 1).maybeSingle();
  if (!laterWeek) return { nextTaskId: null, nextWeek: null };

  // Close this week and open the next one, exactly once (a re-submission after a revision must not repeat it).
  const { data: closed } = await db.from('internship_weeks').update({
    status: 'completed',
    completed_at: new Date().toISOString(),
  }).eq('id', task.week_id).eq('status', 'active').select('id');
  if (!closed?.length) return { nextTaskId: null, nextWeek: null };

  const next = await unlockNextWeek(internshipId, week.week_number);
  return { nextTaskId: null, nextWeek: next?.week_number ?? null };
}

/**
 * True when every week is finished and enough of the required work is approved.
 * This is the completion-eligibility rule behind the Certificate and LOR.
 */
export async function isInternshipEligible(internshipId: string) {
  const db = createAdminClient();
  const { data: weeks } = await db.from('internship_weeks').select('status').eq('internship_id', internshipId);
  if (!weeks?.length || weeks.some((w: any) => w.status !== 'completed')) return false;
  const { data: tasks } = await db.from('internship_tasks')
    .select('points, is_required, status').eq('internship_id', internshipId);
  const required = (tasks ?? []).filter((t: any) => t.is_required);
  const total = required.reduce((n: number, t: any) => n + t.points, 0);
  const approved = required.filter((t: any) => t.status === 'approved').reduce((n: number, t: any) => n + t.points, 0);
  return total > 0 && approved / total >= WEEK_COMPLETION_THRESHOLD;
}

export async function evaluateWeekProgress(internshipId: string, weekId: string) {
  const db = createAdminClient();

  const { data: tasks } = await db.from('internship_tasks')
    .select('points, is_required, status').eq('week_id', weekId);
  if (!tasks?.length) return { completed: false };
  if (!isWeekComplete(tasks as any)) return { completed: false };

  const { data: week } = await db.from('internship_weeks')
    .select('id, week_number, status, internship_id').eq('id', weekId).single();
  if (!week || week.status === 'completed') return { completed: false };

  await db.from('internship_weeks')
    .update({ status: 'completed', completed_at: new Date().toISOString() }).eq('id', weekId);

  const { data: internship } = await db.from('internships')
    .select('id, student_id, duration, profiles!internships_student_id_fkey(full_name,email)')
    .eq('id', internshipId).single();

  await notify(internship!.student_id, 'week_completed', `Week ${week.week_number} is complete.`, '/dashboard/roadmap');

  const next = await unlockNextWeek(internshipId, week.week_number);
  if (!next && (await isInternshipEligible(internshipId))) await completeInternship(internshipId);

  await recomputeScores(internshipId);
  return { completed: true, unlockedWeek: next?.week_number ?? null };
}

export async function unlockNextWeek(internshipId: string, afterWeek: number) {
  const db = createAdminClient();
  const { data: next } = await db.from('internship_weeks')
    .select('id, week_number, title, is_final, end_date')
    .eq('internship_id', internshipId).eq('week_number', afterWeek + 1).maybeSingle();
  if (!next) return null;

  await db.from('internship_weeks')
    .update({ status: 'active', unlocked_at: new Date().toISOString() }).eq('id', next.id);
  // Open only the first task of the new week. Remaining tasks stay locked
  // and are unlocked one-by-one after the student submits the previous task.
  await db.from('internship_tasks')
    .update({ status: 'available' })
    .eq('week_id', next.id)
    .eq('task_number', 1)
    .eq('status', 'locked');
  await db.from('internships')
    .update({ current_week: next.week_number }).eq('id', internshipId);

  const { count } = await db.from('internship_tasks')
    .select('id', { count: 'exact', head: true }).eq('week_id', next.id);

  const { data: internship } = await db.from('internships')
    .select('student_id, profiles!internships_student_id_fkey(full_name,email)')
    .eq('id', internshipId).single();

  await notify(internship!.student_id,
    next.is_final ? 'final_project_unlocked' : 'week_unlocked',
    next.is_final
      ? `Your final project is unlocked. Deadline ${shortDate(next.end_date)}.`
      : `Week ${next.week_number}: ${next.title} is now open.`,
    '/dashboard/roadmap');

  const student = (internship as any)?.profiles;
  if (student?.email) {
    await sendEmail(student.email, 'new_task', {
      name: student.full_name, week: next.week_number, title: next.title,
      taskCount: count ?? 0, deadline: shortDate(next.end_date),
    });
  }
  return next;
}

export async function recomputeScores(internshipId: string) {
  const db = createAdminClient();
  const { data: tasks } = await db.from('internship_tasks')
    .select('points, is_required, score, status, internship_weeks!inner(is_final)')
    .eq('internship_id', internshipId);
  if (!tasks) return null;

  const scored = (tasks as any[]).map((t) => ({
    points: t.points, is_required: t.is_required, score: t.score, status: t.status,
    is_final_week: t.internship_weeks?.is_final ?? false,
  }));
  const { weeklyScore, finalProjectScore, overallScore } = computeScores(scored);

  await db.from('internships').update({
    weekly_score: weeklyScore, final_project_score: finalProjectScore, overall_score: overallScore,
  }).eq('id', internshipId);

  return { weeklyScore, finalProjectScore, overallScore };
}

export async function completeInternship(internshipId: string) {
  const db = createAdminClient();
  const scores = await recomputeScores(internshipId);
  await db.from('internships').update({
    status: 'completed', completed_at: new Date().toISOString(),
  }).eq('id', internshipId);

  const { data: internship } = await db.from('internships')
    .select('student_id, duration').eq('id', internshipId).single();
  if (internship) {
    const brand = await getBrand();
    await notify(internship.student_id, 'internship_completed',
      `All weeks are complete. Final score ${scores?.overallScore ?? 0}. ` +
        (brand.autoCertificate ? 'Your certificate is being generated.' : 'Your certificate is being reviewed.'),
      '/dashboard/certificate');
  }
  // Issue the certificate (and optionally the LOR) automatically if enabled in Admin -> Settings.
  try { await autoIssueDocuments(internshipId); } catch (e) { console.error('[auto documents]', e); }
  return scores;
}

/** Marks past-deadline tasks as overdue. Safe to run on every dashboard load. */
export async function refreshOverdueTasks(internshipId: string) {
  const db = createAdminClient();
  await db.from('internship_tasks')
    .update({ status: 'overdue' })
    .eq('internship_id', internshipId)
    .in('status', ['available', 'in_progress'])
    .lt('deadline', todayInTz());
}


/**
 * Changes the real start date of an internship that has not received any
 * submissions yet. Week windows, task unlock dates and Sunday deadlines are
 * recalculated from the new date. Student work is never altered.
 */
export async function rescheduleInternship(internshipId: string, startDate: Date | string, adminId: string) {
  const db = createAdminClient();
  const start = parseDate(startDate);
  if (Number.isNaN(start.getTime())) throw new Error('Choose a valid start date.');
  if (!isMonday(start)) throw new Error('The internship start date must be a Monday, so each week ends on Sunday.');

  const { data: internship } = await db.from('internships')
    .select('id, duration, status').eq('id', internshipId).single();
  if (!internship) throw new Error('Internship not found.');
  if (internship.status !== 'active') throw new Error('Only an active internship can be rescheduled.');

  const { count } = await db.from('submissions')
    .select('id', { count: 'exact', head: true }).eq('internship_id', internshipId);
  if ((count ?? 0) > 0) throw new Error('This student has already submitted work, so the start date can no longer be changed.');

  const duration = internship.duration as Duration;
  const windows = weekWindows(start, duration);
  await db.from('internships').update({
    start_date: isoDate(start), end_date: isoDate(internshipEndDate(start, duration)),
  }).eq('id', internshipId);

  const { data: weeks } = await db.from('internship_weeks').select('id, week_number').eq('internship_id', internshipId);
  for (const w of weeks ?? []) {
    const win = windows[w.week_number - 1];
    if (!win) continue;
    await db.from('internship_weeks').update({
      start_date: isoDate(win.startDate), end_date: isoDate(win.endDate),
    }).eq('id', w.id);
    await db.from('internship_tasks').update({
      unlock_date: isoDate(win.startDate), deadline: isoDate(win.endDate),
    }).eq('week_id', w.id);
  }
  await audit(adminId, 'internship.reschedule', 'internship', internshipId, { start: isoDate(start) });
  return { startDate: isoDate(start) };
}
