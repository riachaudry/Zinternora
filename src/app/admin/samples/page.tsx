import { requireAdmin } from '@/lib/auth';
import { SectionHead, Alert } from '@/components/ui';
import { OfferLetter } from '@/components/documents/OfferLetter';
import { Certificate } from '@/components/documents/Certificate';
import { Lor } from '@/components/documents/Lor';
import { PrintButton } from '@/components/documents/PrintButton';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Sample documents' };

/**
 * Admin-only preview of the three official documents using a clearly-marked SAMPLE student.
 * Nothing here is stored in the database and none of these documents is valid for a real student.
 */
const base = { studentName: 'Ria Chaudhry', studentCode: 'INT-STU-SAMPLE', field: 'Web Development', duration: 4 };

export default async function SampleDocumentsPage() {
  await requireAdmin();
  return (
    <div className="space-y-6">
      <div className="no-print space-y-4">
        <SectionHead title="Sample documents"
                     body="This is how the Offer Letter, Certificate and Letter of Recommendation look. Real documents are created automatically for each student with their own name, domain, dates and document ID." />
        <Alert tone="warn" title="Sample only">
          These pages use the sample student “Ria Chaudhry”, example dates and sample IDs. They are not saved anywhere and carry The Internora watermark.
          They are not valid documents. Signatures come from Admin → Settings, or the built-in ones
          if none are set.
        </Alert>
        <PrintButton label="Print / Save sample as PDF" />
      </div>

      <OfferLetter sample data={{ ...base, publicId: 'INT-OL-SAMPLE', issueDate: '2026-10-07', startDate: '2026-10-12', endDate: '2026-11-08' }} />
      <Certificate sample data={{ ...base, publicId: 'INT-CERT-SAMPLE', issueDate: '2026-11-09', startDate: '2026-10-12', endDate: '2026-11-08', completionDate: '2026-11-08', overallScore: 0, status: 'issued' }} />
      <Lor sample data={{
        ...base, publicId: 'INT-LOR-SAMPLE', issueDate: '2026-11-09', completionDate: '2026-11-08',
        performance: 'During the internship, Ria demonstrated a strong willingness to learn, excellent problem-solving skills and a proactive approach towards completing all assigned tasks and the final project. Their dedication, consistency and positive attitude were truly commendable.',
        skills: [],
        achievements: 'Ria showed good understanding of core concepts, practical implementation and the ability to apply knowledge in real-world scenarios. We are confident that they will continue to grow and excel in their future academic and professional journey.',
        recommendation: 'We highly recommend Ria Chaudhry for future opportunities and wish them continued success.',
      }} />
    </div>
  );
}
