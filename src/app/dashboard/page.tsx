import Link from 'next/link';
import { requireStudent } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { loadStudentState, stageOf, taskProgress } from '@/lib/services/student';
import { longDate, shortDate, isOverdue } from '@/lib/dates';
import { formatPKR, PLANS, type Duration } from '@/lib/brand';
import { Card, Badge, StatusBadge, Progress, Button, Alert, EmptyState } from '@/components/ui';
import { Hero, PastelStat, MiniCalendar, QuickAction, ProgressRing } from '@/components/portal/widgets';
import { Icon } from '@/components/portal/Icon';
import { getBrand } from '@/lib/settings';

export const dynamic = 'force-dynamic';

export default async function DashboardHome({ searchParams }: { searchParams?: Promise<{ m?: string }> }) {
  const sp = (await searchParams) ?? {};
  const monthOffset = Math.max(-24, Math.min(24, parseInt(sp.m ?? '0', 10) || 0));
  const profile = await requireStudent();
  const state = await loadStudentState(profile.id);
  const stage = stageOf(state);
  const brand = await getBrand();
  const { internship, weeks, tasks, docs, clock, application, payment } = state;
  const field = (internship?.internship_fields as any)?.name
    ?? (application?.internship_fields as any)?.name
    ?? null;
  const progress = taskProgress(tasks);

  const supabase = createClient();
  const { data: recent } = await supabase.from('notifications')
    .select('id, title, message, link, created_at, is_read')
    .eq('user_id', profile.id).order('created_at', { ascending: false }).limit(4);

  const activeWeek = weeks.find((w) => w.status === 'active');
  const dueSoon = tasks
    .filter((t) => !['approved', 'locked'].includes(t.status))
    .sort((a, b) => a.deadline.localeCompare(b.deadline))
    .slice(0, 4);
  const deadlineDays = tasks.map((t) => t.deadline);
  const firstName = profile.full_name.split(' ')[0];
  const doc = (ok: boolean) => (ok ? 'Issued' : 'Not yet');

  return (
    <div className="space-y-6">
      <Hero
        title={`Welcome back, ${firstName}!`}
        body="Your journey to a brighter future continues. Stay consistent and keep building amazing skills!"
        action={{ href: '/dashboard/internship', label: 'View My Internship' }}
      />

      {stage === 'no_application' && (
        <EmptyState
          title="You haven't applied yet"
          body="Choose an internship field for the 1-month (4-week) program. Your fee and four-week roadmap follow from that choice."
          action={<Button href="/dashboard/apply">Browse internships</Button>}
        />
      )}

      {stage === 'awaiting_payment' && application && (
        <Alert tone="warn" title="Next step: submit your fee">
          Your application for {field} ({application.duration} weeks) is recorded. Send{' '}
          <strong>{formatPKR(application.fee_pkr)}</strong> to the Bank Transfer account shown on the
          payment page, then submit your transaction ID and screenshot.{' '}
          <Link href="/dashboard/payment" className="font-semibold underline">Go to payment</Link>
        </Alert>
      )}

      {stage === 'awaiting_verification' && (
        <Alert tone="info" title="Payment under verification">
          Every payment is checked by hand — it is never verified automatically. Once it clears and an admin
          confirms the real start date, your internship activates, your offer letter is issued and Week 1, Task 1 unlocks.
        </Alert>
      )}

      {stage === 'awaiting_start_date' && (
        <Alert tone="good" title="Payment verified — waiting for your start date">
          Your payment is confirmed. Your offer letter and Week 1 open as soon as an admin sets the real internship
          start date. You will get a notification.
        </Alert>
      )}

      {stage === 'payment_problem' && payment && (
        <Alert tone="bad" title={`Payment ${payment.status.replace(/_/g, ' ')}`}>
          {payment.admin_note ?? 'Check your payment details and submit again.'}{' '}
          <Link href="/dashboard/payment" className="font-semibold underline">Open payment page</Link>
        </Alert>
      )}

      {internship && weeks.length > 0 && !activeWeek && progress.approved === 0 && (
        <Alert tone="good" title="Your offer letter is ready — Week 1 opens soon">
          Your internship is confirmed. HR will open your Week 1 tasks shortly and you will get a notification.
          Meanwhile you can read your <Link href="/dashboard/offer-letter" className="font-semibold underline">offer letter</Link>.
        </Alert>
      )}

      {/* Pastel stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <PastelStat color="blue" icon="cap" href="/dashboard/internship" label="Internship Status"
                    value={internship ? internship.status.replace(/^\w/, (c: string) => c.toUpperCase()) : 'Not Started'}
                    hint={internship ? (field ?? undefined) : 'Apply to begin your journey'} />
        <PastelStat color="pink" icon="check" href="/dashboard/tasks" label="Total Tasks"
                    value={`${progress.approved} / ${progress.total || 16}`}
                    hint={`Tasks across ${weeks.length || 4} weeks`} />
        <PastelStat color="green" icon="clock" href="/dashboard/roadmap" label="Days Remaining"
                    value={clock ? `${clock.remaining} Days` : `${(application?.duration ?? 4) * 7} Days`}
                    hint="Until completion" />
        <PastelStat color="purple" icon="chart" href="/dashboard/roadmap" label="Progress"
                    value={`${progress.percent}%`}
                    hint={progress.percent ? 'Keep going!' : 'Keep going!'} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Journey stepper */}
          <Card className="p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-display text-[16px] font-bold text-ink"><Icon name="calendar" size={18} className="text-[#1D4ED8]" /> {weeks.length || 4}-Week Internship Journey</h2>
              <Link href="/dashboard/roadmap" className="text-[13px] font-semibold text-signal">Roadmap</Link>
            </div>
            {weeks.length ? (
              <ol className="mt-6 grid gap-5" style={{ gridTemplateColumns: `repeat(${weeks.length}, minmax(0,1fr))` }}>
                {weeks.map((w, i) => {
                  const done = w.status === 'completed', active = w.status === 'active';
                  return (
                    <li key={w.id} className="relative text-center">
                      {i < weeks.length - 1 && (
                        <span aria-hidden="true" className="absolute left-1/2 top-5 h-0.5 w-full"
                              style={{ background: done ? '#16A34A' : 'rgb(var(--mist-deep))' }} />
                      )}
                      <span className="relative mx-auto grid h-10 w-10 place-items-center rounded-full text-[14px] font-bold"
                            style={done ? { background: '#16A34A', color: '#fff' }
                              : active ? { background: '#0B2D5B', color: '#fff', boxShadow: '0 0 0 4px #D4AF3755' }
                              : { background: 'rgb(var(--mist))', color: 'rgb(var(--slate-light))' }}>
                        {done ? <Icon name="check" size={16} /> : w.is_final ? <Icon name="award" size={16} /> : w.week_number}
                      </span>
                      <p className="mt-2 text-[12.5px] font-semibold text-ink">{w.is_final ? 'Final project' : `Week ${w.week_number}`}</p>
                      <p className="line-clamp-2 text-[11.5px] text-slate">{w.title}</p>
                    </li>
                  );
                })}
              </ol>
            ) : (
              <p className="mt-3 text-[14px] text-slate-light">Your weekly roadmap appears here once your internship starts.</p>
            )}
            <p className="mt-6 text-center text-[12.5px] text-slate-light">Weekly Tasks • Real Projects • Certificate &amp; LOR on Completion</p>
          </Card>

          {/* Upcoming deadlines */}
          <Card className="p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-[16px] font-bold text-ink">Upcoming deadlines</h2>
              <Link href="/dashboard/tasks" className="text-[13px] font-semibold text-signal">All tasks</Link>
            </div>
            {internship && dueSoon.length ? (
              <ul className="mt-3 divide-y divide-mist">
                {dueSoon.map((t, i) => (
                  <li key={t.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                    <Link href={`/dashboard/tasks/${t.id}`} className="flex min-w-0 items-center gap-3">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl" style={{ background: ['#FDE3D3', '#DDF5E6', '#DFEAFD', '#EBDDFB'][i % 4], color: ['#C2410C', '#15803D', '#1D4ED8', '#6D28D9'][i % 4] }}><Icon name="clock" size={16} /></span>
                      <span className="min-w-0">
                        <span className="block truncate text-[14px] font-semibold text-ink">{t.title}</span>
                        <span className="font-mono text-[12px] text-slate-light">{t.task_code}</span>
                      </span>
                    </Link>
                    <div className="flex items-center gap-2">
                      <span className={`text-[13px] ${isOverdue(t.deadline) ? 'font-semibold text-danger' : 'text-slate'}`}>{shortDate(t.deadline)}</span>
                      <StatusBadge status={isOverdue(t.deadline) && t.status !== 'approved' ? 'overdue' : t.status} />
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-[14px] text-slate-light">
                {internship ? 'Nothing outstanding right now.' : 'Your deadlines appear here once the internship is active.'}
              </p>
            )}
          </Card>

          {/* Quick actions */}
          <div>
            <h2 className="mb-3 font-display text-[16px] font-bold text-ink">Quick actions</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <QuickAction color="blue" href="/dashboard/tasks" icon="file" label="View Tasks" />
              <QuickAction color="cyan" href="/dashboard/submissions" icon="upload" label="Submit Work" />
              <QuickAction color="purple" href="/dashboard/calendar" icon="calendar" label="View Calendar" />
              <QuickAction color="peach" href={brand.hrWhatsappLink} external icon="chat" label={`Contact HR ${brand.hrName.split(' ')[0]}`} />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <ProgressRing percent={progress.percent} started={!!internship && progress.percent > 0}
                        caption={internship ? `${progress.approved} of ${progress.total || 0} tasks approved.` : 'Start your internship to view your progress.'}
                        href="/dashboard/roadmap" />
          <MiniCalendar marked={deadlineDays} href="/dashboard/calendar" offset={monthOffset} basePath="/dashboard" />

          <Card className="p-5">
            <h2 className="font-display text-[15px] font-bold text-ink">Completion Documents</h2>
            <ul className="mt-3 space-y-2.5">
              {[
                { label: 'Offer letter', ok: !!docs?.offer, href: '/dashboard/offer-letter', icon: 'file' },
                { label: 'Certificate', ok: !!docs?.certificate, href: '/dashboard/certificate', icon: 'award' },
                { label: 'Letter of recommendation', ok: docs?.lor?.status === 'issued', href: '/dashboard/lor', icon: 'mail' },
              ].map((d) => (
                <li key={d.label}>
                  <Link href={d.href} className="flex items-center gap-3 rounded-xl border border-mist-deep p-3 hover:bg-mist/60">
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-[#E8F0FE] text-[#1D4ED8]"><Icon name={d.icon} size={16} /></span>
                    <span className="flex-1 text-[13.5px] font-semibold text-ink">{d.label}</span>
                    <Badge tone={d.ok ? 'good' : 'neutral'}>{doc(d.ok)}</Badge>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-[15px] font-bold text-ink">Notifications</h2>
              <Link href="/dashboard/notifications" className="text-[13px] font-semibold text-signal">All</Link>
            </div>
            {recent?.length ? (
              <ul className="mt-3 space-y-3">
                {recent.map((n) => (
                  <li key={n.id}>
                    <Link href={n.link ?? '/dashboard/notifications'} className="block">
                      <p className="text-[13.5px] font-semibold text-ink">
                        {!n.is_read && <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-signal align-middle" />}
                        {n.title}
                      </p>
                      <p className="mt-0.5 line-clamp-2 text-[13px] text-slate-light">{n.message}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-[14px] text-slate-light">Nothing yet.</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[12px] font-semibold text-slate-light">{label}</dt>
      <dd className="mt-0.5 text-[14.5px] font-semibold text-ink">{value}</dd>
    </div>
  );
}


