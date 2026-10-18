import { requireAdmin } from '@/lib/auth';
import { SectionHead, Card } from '@/components/ui';
import { ActionForm } from '@/components/admin/Actions';

export const dynamic = 'force-dynamic';

export default async function SendDocumentsPage() {
  await requireAdmin();
  return (
    <div className="space-y-6">
      <SectionHead title="Send documents"
                   body="Create an offer letter, certificate or letter of recommendation for any person and email it as a PDF. No internship or tasks are needed. Only issue documents that are accurate." />
      <Card>
        <div className="max-w-xl">
          <ActionForm
            url="/api/admin/send-documents"
            submitLabel="Generate and email PDF"
            successMessage="Sent. The PDF is in their inbox."
            fields={[
              { name: 'name', label: 'Student name', type: 'text', required: true, placeholder: 'Full name' },
              { name: 'email', label: 'Student email', type: 'text', required: true, placeholder: 'name@gmail.com' },
              { name: 'field', label: 'Domain', type: 'text', required: true, placeholder: 'e.g. Web Development' },
              { name: 'doc', label: 'Document', type: 'select', required: true, options: [
                { value: 'offer', label: 'Offer Letter' },
                { value: 'certificate', label: 'Certificate' },
                { value: 'lor', label: 'Letter of Recommendation (LOR)' },
              ] },
              { name: 'duration', label: 'Duration (weeks)', type: 'number', defaultValue: 4 },
              { name: 'start_date', label: 'Start date (offer letter, optional)', type: 'date' },
              { name: 'end_date', label: 'End / completion date (optional)', type: 'date' },
            ]}
          />
        </div>
      </Card>
    </div>
  );
}
