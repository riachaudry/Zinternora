import { requireAdmin } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { shortDate } from '@/lib/dates';
import { SectionHead, Card, StatusBadge, Alert } from '@/components/ui';
import { LorEditor } from './LorEditor';

export const dynamic = 'force-dynamic';

export default async function AdminLorPage() {
  await requireAdmin();
  const db = createAdminClient();

  const { data: records } = await db.from('lor_records')
    .select(`id, internship_id, public_id, performance, skills, achievements, recommendation, status, issue_date,
             internships(duration, internship_fields(name), profiles!internships_student_id_fkey(full_name, student_id))`)
    .order('created_at', { ascending: false }).limit(100);

  // Eligible = internships that were successfully completed (all four weeks) and have no letter drafted yet.
  const { data: eligible } = await db.from('internships')
    .select(`id, duration, completed_at, internship_fields(name),
             profiles!internships_student_id_fkey(full_name, student_id)`)
    .eq('status', 'completed').order('completed_at', { ascending: false }).limit(100);

  const drafted = new Set((records ?? []).map((r) => r.internship_id));
  const queue = (eligible ?? []).filter((r) => !drafted.has(r.id));

  return (
    <div className="space-y-6">
      <SectionHead title="Letters of recommendation"
                   body="Prepare and review recommendation letters for eligible interns. Letters should reflect the student’s actual work, skills, and completed internship." />

      {!!queue.length && (
        <div>
          <h2 className="font-display text-lg font-bold">Eligible, not yet drafted</h2>
          <div className="mt-3 space-y-3">
            {queue.map((r) => {
              const s = (r as any).profiles;
              return (
                <Card key={r.id} className="p-5">
                  <p className="font-display text-[16px] font-bold text-ink">{s?.full_name}</p>
                  <p className="mt-0.5 text-[13px] text-slate-light">
                    <span className="font-mono">{s?.student_id}</span> · {(r as any).internship_fields?.name} · {r.duration} weeks
                    {r.completed_at && ` · completed ${shortDate(r.completed_at)}`}
                  </p>
                  <LorEditor internshipId={r.id} />
                </Card>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <h2 className="font-display text-lg font-bold">Drafts and issued letters</h2>
        <div className="mt-3 space-y-3">
          {(records ?? []).map((r) => {
            const i = (r as any).internships;
            const s = i?.profiles;
            return (
              <Card key={r.id} className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-[16px] font-bold text-ink">{s?.full_name}</p>
                    <p className="mt-0.5 text-[13px] text-slate-light">
                      <span className="font-mono">{r.public_id}</span> · {i?.internship_fields?.name}
                      {r.issue_date && ` · issued ${shortDate(r.issue_date)}`}
                    </p>
                  </div>
                  <StatusBadge status={r.status} />
                </div>
                <LorEditor
                  internshipId={r.internship_id}
                  initial={{
                    performance: r.performance ?? '',
                    skills: (r.skills ?? []).join(', '),
                    achievements: r.achievements ?? '',
                    recommendation: r.recommendation ?? '',
                  }}
                  status={r.status}
                />
              </Card>
            );
          })}
          {!records?.length && !queue.length && (
            <Alert tone="info">No eligible students are queued for a letter yet. Complete the internship and confirm eligibility before drafting a letter.</Alert>
          )}
        </div>
      </div>
    </div>
  );
}


