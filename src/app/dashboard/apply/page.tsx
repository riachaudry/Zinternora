import { requireStudent } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { loadStudentState, stageOf } from '@/lib/services/student';
import { SectionHead, Alert, Button } from '@/components/ui';
import { getBrand } from '@/lib/settings';
import { ApplyForm } from './ApplyForm';

export const dynamic = 'force-dynamic';

export default async function ApplyPage(props: { searchParams: Promise<{ field?: string }> }) {
  const sp = await props.searchParams;
  const profile = await requireStudent();
  const state = await loadStudentState(profile.id);
  const stage = stageOf(state);
  const brand = await getBrand();

  const { data: fields } = await createClient()
    .from('internship_fields')
    .select('id, slug, name, short_description, skills, evaluation_criteria, certificate_criteria')
    .eq('is_active', true).order('sort_order');

  if (stage !== 'no_application') {
    return (
      <div className="space-y-5">
        <SectionHead title="Apply for an internship" />
        <Alert tone="info" title="You already have an application in progress">
          The Internora runs one internship per account at a time. Finish or cancel the current one before applying again.
        </Alert>
        <Button href="/dashboard">Back to dashboard</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionHead
        eyebrow="Step 1 of 2"
        title="Apply for an internship"
        body="Pick one internship field for the 1-month program. Attach your payment screenshot as proof while applying (or on the next page); once payment is verified, your offer letter and Week 1 appear automatically."
      />
      <ApplyForm fields={fields ?? []} preselect={sp.field} userId={profile.id}
                 brand={{ accountName: brand.accountName, bankName: brand.bankName, iban: brand.iban }} />
    </div>
  );
}


