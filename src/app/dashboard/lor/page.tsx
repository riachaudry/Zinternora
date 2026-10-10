import { requireStudent } from '@/lib/auth';
import { loadStudentState } from '@/lib/services/student';
import { Lor } from '@/components/documents/Lor';
import { PrintButton } from '@/components/documents/DocumentShell';
import { SectionHead, Card, Button, StatusBadge } from '@/components/ui';

export const dynamic = 'force-dynamic';

export default async function LorPage() {
  const profile = await requireStudent();
  const { internship, docs } = await loadStudentState(profile.id);
  const lor = docs?.lor;

  if (!lor || lor.status !== 'issued') {
    return (
      <div className="space-y-5">
        <SectionHead title="Letter of recommendation" />
        <Card className="p-6">
          <h2 className="font-display text-lg font-bold">
            {lor ? 'Being prepared' : 'Not issued yet'}
          </h2>
          <p className="prose-narrow mt-2 text-[15px]">
            LORs are issued after internship completion and eligibility review. Every letter is written and approved by an admin before it is issued.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="no-print flex flex-wrap items-center justify-between gap-4">
        <SectionHead title="Letter of recommendation" body={`LOR ID ${lor.public_id}`} />
        <div className="flex items-center gap-3">
          <StatusBadge status={lor.status} />
          <PrintButton />
        </div>
      </div>

      <Lor data={{
        publicId: lor.public_id,
        issueDate: lor.issue_date ?? new Date().toISOString(),
        studentName: profile.full_name,
        studentCode: profile.student_id ?? '—',
        field: (internship!.internship_fields as any)?.name ?? '—',
        duration: internship!.duration,
        completionDate: internship!.completed_at ?? lor.issue_date ?? '',
        performance: lor.performance ?? '',
        skills: lor.skills ?? [],
        achievements: lor.achievements ?? '',
        recommendation: lor.recommendation ?? '',
      }} />
    </div>
  );
}


