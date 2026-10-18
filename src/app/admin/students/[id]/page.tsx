import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { shortDate, longDate } from '@/lib/dates';
import { formatPKR } from '@/lib/brand';
import { Avatar } from '@/components/portal/Avatar';
import { ActionButton, ActionForm } from '@/components/admin/Actions';
import { Card, StatCard, Table, StatusBadge, Badge, Progress } from '@/components/ui';

export const dynamic = 'force-dynamic';

export default async function StudentDetail(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  await requireAdmin();
  const db = createAdminClient();

  const { data: student } = await db.from('profiles')
    .select('id, full_name, email, student_id, username, phone, whatsapp, city, country, education_level, university, field_of_study, avatar_url, public_profile, is_demo, created_at')
    .eq('id', params.id).maybeSingle();

  if (!student) notFound();

  const [{ data: applications }, { data: payments }, { data: internship }] = await Promise.all([
    db.from('applications')
      .select('id, duration, fee_pkr, status, applied_at, admin_note, internship_fields(name)')
      .eq('student_id', student.id).order('applied_at', { ascending: false }),
    db.from('payments')
      .select('id, method, transaction_id, amount_pkr, payment_date, status, screenshot_url, created_at')
      .eq('student_id', student.id).order('created_at', { ascending: false }),
    db.from('internships')
      .select('id, duration, status, start_date, end_date, current_week, weekly_score, final_project_score, overall_score, internship_fields(name)')
      .eq('student_id', student.id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
  ]);

  const [{ data: weeks }, { data: tasks }] = internship
    ? await Promise.all([
        db.from('internship_weeks').select('id, week_number, title, status, is_final, start_date, end_date')
          .eq('internship_id', internship.id).order('week_number'),
        db.from('internship_tasks').select('id, status, points, is_required, week_id')
          .eq('internship_id', internship.id),
      ])
    : [{ data: [] as any[] }, { data: [] as any[] }];

  const approved = (tasks ?? []).filter((t) => t.status === 'approved').length;
  const percent = tasks?.length ? Math.round((approved / tasks.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <Avatar url={student.avatar_url} name={student.full_name} size={56} />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-2xl font-bold text-ink">{student.full_name}</h1>
            {student.is_demo && <Badge tone="warn">Demo record</Badge>}
            {student.public_profile && student.username && (
              <Link href={`/profile/${student.username}`} className="text-[13px] font-semibold text-signal">
                Public page
              </Link>
            )}
          </div>
          <p className="mt-1 font-mono text-[13px] text-slate-light">{student.student_id ?? 'No student ID yet'}</p>
        </div>
      </div>

      <Card className="grid gap-4 p-5 sm:grid-cols-3">
        {([
          ['Email', student.email],
          ['Phone', student.phone ?? '—'],
          ['WhatsApp', student.whatsapp ?? '—'],
          ['Location', [student.city, student.country].filter(Boolean).join(', ') || '—'],
          ['Education', [student.education_level, student.university].filter(Boolean).join(' · ') || '—'],
          ['Registered', longDate(student.created_at)],
        ] as const).map(([label, value]) => (
          <div key={label}>
            <p className="text-[12px] font-semibold uppercase tracking-wide text-slate-light">{label}</p>
            <p className="mt-1 break-words text-[14px] font-semibold text-ink">{value}</p>
          </div>
        ))}
      </Card>

      {internship ? (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Field" value={(internship as any).internship_fields?.name ?? '—'} />
            <StatCard label="Track" value={`${internship.duration} weeks`} hint={internship.status} />
            <StatCard label="Overall score" value={internship.overall_score != null ? Number(internship.overall_score).toFixed(1) : '—'} tone="accent" />
            <StatCard label="Current week" value={internship.current_week} hint={`Tasks approved ${approved}/${tasks?.length ?? 0}`} />
          </div>

          <Card className="p-5">
            <h2 className="font-display text-[15px] font-bold text-ink">Progress</h2>
            <div className="mt-4"><Progress value={percent} label={`${percent}% of tasks approved`} /></div>
            <p className="mt-3 text-[13.5px] text-slate-light">
              {internship.start_date
                ? `${shortDate(internship.start_date)} — ${internship.end_date ? shortDate(internship.end_date) : '—'}`
                : 'Dates not set'}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <ActionButton url={`/api/admin/internships/${internship.id}`} body={{ action: 'recompute' }} label="Recompute scores" />
              <ActionButton url={`/api/admin/internships/${internship.id}`} body={{ action: 'refresh_overdue' }} label="Refresh overdue" />
              <ActionButton url={`/api/admin/internships/${internship.id}`} body={{ action: 'complete' }}
                            label="Mark completed" variant="primary" confirm="Mark this internship as completed?" />
            </div>
          </Card>

          <Card className="overflow-hidden">
            <div className="border-b border-mist px-5 py-4">
              <h2 className="font-display text-[15px] font-bold text-ink">Weeks</h2>
            </div>
            <Table head={['Week', 'Title', 'Window', 'Status', 'Action']}>
              {(weeks ?? []).map((w) => (
                <tr key={w.id} className="border-t border-mist">
                  <td className="px-4 py-3 text-[13.5px] font-semibold text-ink">{w.is_final ? 'Final' : w.week_number}</td>
                  <td className="px-4 py-3 text-[13.5px] text-slate">{w.title}</td>
                  <td className="px-4 py-3 text-[13px] text-slate-light">{shortDate(w.start_date)} — {shortDate(w.end_date)}</td>
                  <td className="px-4 py-3"><StatusBadge status={w.status === 'locked' ? 'pending' : w.status} /></td>
                  <td className="px-4 py-3">
                    {w.status === 'locked' && (
                      <ActionButton url={`/api/admin/internships/${internship.id}`}
                                    body={{ action: 'unlock_week', week_number: w.week_number }}
                                    label={`Allow ${w.is_final ? 'final project' : `Week ${w.week_number}`}`}
                                    variant="primary"
                                    confirm="Open this week's tasks for the student?" />
                    )}
                  </td>
                </tr>
              ))}
            </Table>
          </Card>

          {internship.status !== 'active' && (
            <Card className="p-5">
              <h2 className="font-display text-[15px] font-bold text-ink">Internship is {internship.status}</h2>
              <p className="mt-1.5 text-[13.5px] text-slate-light">
                The student cannot submit tasks while the internship is not active. Reactivate it to let them submit again.
              </p>
              <div className="mt-4">
                <ActionButton url={`/api/admin/internships/${internship.id}`} body={{ action: 'reactivate' }} variant="primary" size="md"
                              label="Reactivate internship" busyLabel="Working…"
                              confirm="Make this internship active again so the student can submit tasks?" />
              </div>
            </Card>
          )}

          <Card className="p-5">
            <h2 className="font-display text-[15px] font-bold text-ink">Change internship dates (your decision)</h2>
            <p className="mt-1.5 text-[13.5px] text-slate-light">
              Pick a new start date (any day). All weekly unlock dates and deadlines are recalculated. The student&apos;s submissions and scores are not changed.
              Current start date: {shortDate(internship.start_date)}.
            </p>
            <div className="mt-4 max-w-xs">
              <ActionForm
                url={`/api/admin/internships/${internship.id}`}
                extra={{ action: 'set_dates' }}
                submitLabel="Save new dates"
                successMessage="Dates updated."
                fields={[{ name: 'start_date', label: 'New start date', type: 'date', required: true }]}
              />
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="font-display text-[15px] font-bold text-ink">Issue documents now (your decision)</h2>
            <p className="mt-1.5 text-[13.5px] text-slate-light">
              You can give this student a certificate and/or a letter of recommendation at any time, even if they have not
              submitted every task. The student gets it on their dashboard and by email. The internship is marked completed.
            </p>
            <div className="mt-4 flex flex-wrap gap-2.5">
              <ActionButton url={`/api/admin/internships/${internship.id}`} body={{ action: 'force_certificate' }} variant="primary" size="md"
                            label="Issue certificate now" busyLabel="Issuing…"
                            confirm="Issue the certificate to this student now? This marks the internship as completed." />
              <ActionButton url={`/api/admin/internships/${internship.id}`} body={{ action: 'force_lor' }} variant="secondary" size="md"
                            label="Issue LOR now" busyLabel="Issuing…"
                            confirm="Issue the letter of recommendation to this student now? This marks the internship as completed." />
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="font-display text-[15px] font-bold text-ink">Record final evaluation</h2>
            <p className="mt-1.5 text-[13.5px] text-slate-light">
              The overall score is computed from the published weights, not typed by hand.
            </p>
            <div className="mt-4 max-w-md">
              <ActionForm
                url="/api/admin/evaluations"
                extra={{ internship_id: internship.id }}
                submitLabel="Save evaluation"
                successMessage="Evaluation recorded."
                fields={[
                  { name: 'weekly_score', label: 'Weekly performance (0–100)', type: 'number', required: true, defaultValue: Number(internship.weekly_score ?? 0) },
                  { name: 'final_project_score', label: 'Final project (0–100)', type: 'number', required: true, defaultValue: Number(internship.final_project_score ?? 0) },
                  { name: 'remarks', label: 'Remarks', type: 'textarea' },
                ]}
              />
            </div>
          </Card>
        </>
      ) : (
        <Card className="p-5">
          <h2 className="font-display text-[15px] font-bold text-ink">Offer letter &amp; internship</h2>
          <p className="mt-1.5 text-[13.5px] text-slate-light">
            One click creates the offer letter from this student&rsquo;s name and chosen field, starts the 4-week internship
            from today, and prepares Week 1 as <strong>pending</strong>. You then press &ldquo;Allow Week 1&rdquo; to open the tasks for the student.
            The payment must be verified first.
          </p>
          <div className="mt-4">
            <ActionButton url={`/api/admin/students/${student.id}/start`} body={{}} variant="primary" size="md"
                          label="Generate offer letter & start internship"
                          busyLabel="Generating…"
                          confirm="Generate the offer letter and start this student's 4-week internship from today?" />
          </div>
        </Card>
      )}

      <Card className="overflow-hidden">
        <div className="border-b border-mist px-5 py-4">
          <h2 className="font-display text-[15px] font-bold text-ink">Applications</h2>
        </div>
        <Table head={['Field', 'Duration', 'Fee', 'Applied', 'Status']}>
          {(applications ?? []).map((a) => (
            <tr key={a.id} className="border-t border-mist">
              <td className="px-4 py-3 text-[13.5px] text-slate">{(a as any).internship_fields?.name ?? '—'}</td>
              <td className="px-4 py-3 text-[13.5px] text-slate">{a.duration} weeks</td>
              <td className="px-4 py-3 text-[13.5px] text-slate">{formatPKR(a.fee_pkr)}</td>
              <td className="px-4 py-3 text-[13.5px] text-slate">{shortDate(a.applied_at)}</td>
              <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
            </tr>
          ))}
          {!applications?.length && (
            <tr><td className="px-4 py-6 text-[14px] text-slate-light" colSpan={5}>No applications.</td></tr>
          )}
        </Table>
      </Card>

      <Card className="overflow-hidden">
        <div className="border-b border-mist px-5 py-4">
          <h2 className="font-display text-[15px] font-bold text-ink">Payments</h2>
        </div>
        <Table head={['Method', 'Transaction ID', 'Amount', 'Date', 'Status']}>
          {(payments ?? []).map((p) => (
            <tr key={p.id} className="border-t border-mist">
              <td className="px-4 py-3 text-[13.5px] text-slate">{p.method}</td>
              <td className="px-4 py-3 font-mono text-[12.5px] text-slate">{p.transaction_id}</td>
              <td className="px-4 py-3 text-[13.5px] text-slate">{formatPKR(p.amount_pkr)}</td>
              <td className="px-4 py-3 text-[13.5px] text-slate">{shortDate(p.payment_date)}</td>
              <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
            </tr>
          ))}
          {!payments?.length && (
            <tr><td className="px-4 py-6 text-[14px] text-slate-light" colSpan={5}>No payments.</td></tr>
          )}
        </Table>
      </Card>
    </div>
  );
}


