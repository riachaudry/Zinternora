import { requireAdmin } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { feeFor, type Duration } from '@/lib/brand';
import { getBrand } from '@/lib/settings';
import { SectionHead, Card, Alert, Button } from '@/components/ui';
import { PaymentReview, type PaymentRow } from './PaymentReview';
import { StartDateForm } from './StartDateForm';

export const dynamic = 'force-dynamic';

const FILTERS = [
  { value: 'pending', label: 'Awaiting verification' },
  { value: 'verified', label: 'Verified' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'all', label: 'All' },
];

export default async function AdminPaymentsPage({ searchParams }: { searchParams: { status?: string } }) {
  const brand = await getBrand();
  await requireAdmin();
  const filter = searchParams.status ?? 'pending';
  const db = createAdminClient();

  let query = db.from('payments')
    .select('id, method, transaction_id, amount_pkr, payment_date, screenshot_url, status, admin_note, created_at, profiles!payments_student_id_fkey(full_name, student_id), applications(duration, internship_fields(name))')
    .order('created_at', { ascending: false })
    .limit(100);

  if (filter === 'pending') query = query.in('status', ['submitted', 'under_verification']);
  else if (filter === 'verified') query = query.eq('status', 'verified');
  else if (filter === 'rejected') query = query.in('status', ['rejected', 'correction_requested', 'refunded']);

  const { data } = await query;

  // Students whose payment is verified but who still have no internship (no real start date yet).
  const { data: verifiedPayments } = await db.from('payments')
    .select('application_id, profiles!payments_student_id_fkey(full_name, student_id), applications(id, internship_fields(name))')
    .eq('status', 'verified').limit(200);
  const { data: activated } = await db.from('internships').select('application_id');
  const activatedIds = new Set((activated ?? []).map((i: any) => i.application_id));
  const awaitingStart = (verifiedPayments ?? []).filter((p: any) => !activatedIds.has(p.application_id));

  const rows: PaymentRow[] = (data ?? []).map((p) => {
    const student = (p as any).profiles;
    const application = (p as any).applications;
    const duration = (application?.duration ?? 4) as Duration;
    return {
      id: p.id, method: p.method, transaction_id: p.transaction_id, amount_pkr: p.amount_pkr,
      payment_date: p.payment_date, screenshot_url: p.screenshot_url, status: p.status,
      admin_note: p.admin_note, created_at: p.created_at,
      expected_fee: feeFor(duration),
      student_name: student?.full_name ?? 'Unknown student',
      student_code: student?.student_id ?? null,
      field_name: application?.internship_fields?.name ?? '—',
      duration,
    };
  });

  return (
    <div className="space-y-6">
      <SectionHead title="Payments"
                   body="Only an admin can verify a payment, and a receipt upload never verifies it automatically. Check the transaction ID against the account statement first." />

      <Alert tone="info" title="Official payment details">
        <p className="mt-1">
          Bank Transfer · Account name {brand.accountName} ·
          {brand.bankName} · IBAN {brand.iban}. Any proof naming a different account should be rejected.
        </p>
      </Alert>

      {awaitingStart.length > 0 && (
        <Card className="space-y-3 p-5">
          <h2 className="font-display text-[16px] font-bold text-ink">Verified, awaiting start date ({awaitingStart.length})</h2>
          <p className="text-[13.5px] text-slate">
            These students have paid and been verified. Their offer letter and Week 1 open only after you set the
            real start date (a Monday). No placeholder dates are ever shown.
          </p>
          <ul className="divide-y divide-mist">
            {awaitingStart.map((p: any) => (
              <li key={p.application_id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="font-semibold text-ink">{p.profiles?.full_name}</p>
                  <p className="text-[12.5px] text-slate-light">
                    {p.profiles?.student_id} · {p.applications?.internship_fields?.name}
                  </p>
                </div>
                <StartDateForm applicationId={p.application_id} />
              </li>
            ))}
          </ul>
        </Card>
      )}

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Button key={f.value} size="sm" href={`/admin/payments?status=${f.value}`}
                  variant={filter === f.value ? 'primary' : 'secondary'}>
            {f.label}
          </Button>
        ))}
      </div>

      {!rows.length ? (
        <Card className="p-8 text-center text-[14px] text-slate-light">
          Nothing here right now.
        </Card>
      ) : (
        <div className="space-y-4">
          {rows.map((p) => <PaymentReview key={p.id} payment={p} />)}
        </div>
      )}
    </div>
  );
}


