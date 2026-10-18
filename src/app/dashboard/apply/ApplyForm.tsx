'use client';
import * as React from 'react';
import { useRouter } from 'next/navigation';
import { PLANS, formatPKR } from '@/lib/brand';
import { Card, Button, Alert } from '@/components/ui';
import { Uploader } from '@/components/portal/Uploader';
import { isoDate } from '@/lib/dates';
import { postJson } from '@/components/portal/form';

type Field = {
  id: string; slug: string; name: string; short_description: string; skills: string[];
  evaluation_criteria: string; certificate_criteria: string;
};

export function ApplyForm({ fields, userId, brand, preselect }: { fields: Field[]; userId: string; preselect?: string; brand: { accountName: string; bankName: string; iban: string; account2Name: string; bank2Name: string; iban2: string } }) {
  const [txn, setTxn] = React.useState('');
  const [payDate, setPayDate] = React.useState(isoDate(new Date()));
  const [screenshot, setScreenshot] = React.useState<string | null>(null);
  const router = useRouter();
  const [slug, setSlug] = React.useState(preselect && fields.some((f) => f.slug === preselect) ? preselect : '');
  const duration = 4 as const;
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const selected = fields.find((f) => f.slug === slug);
  const plan = PLANS[duration];

  async function submit() {
    setError(null); setBusy(true);
    try {
      if ((txn.trim() && !screenshot) || (!txn.trim() && screenshot)) {
        throw new Error('To send your payment proof now, enter the transaction ID and upload the screenshot — or leave both empty and do it on the next page.');
      }
      const res = await postJson('/api/applications', { field_slug: slug, duration });
      if (txn.trim() && screenshot) {
        try {
          await postJson('/api/payments', {
            application_id: res.applicationId, method: 'bank_transfer', transaction_id: txn.trim(),
            payment_date: payDate, amount_pkr: PLANS[duration].fee, screenshot_url: screenshot,
          });
        } catch { /* the application is saved; the student can finish on the payment page */ }
      }
      router.push('/dashboard/payment');
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not submit the application.');
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-5">
        <Card className="p-5">
          <h2 className="font-display text-lg font-bold">Internship field</h2>
          <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
            {fields.map((f) => (
              <label key={f.id}
                     className={`cursor-pointer rounded-xl border p-3.5 transition ${
                       slug === f.slug ? 'border-signal bg-signal-light/40' : 'border-mist-deep hover:border-slate-light'}`}>
                <input type="radio" name="field" value={f.slug} checked={slug === f.slug}
                       onChange={() => setSlug(f.slug)} className="sr-only" />
                <p className="text-[15px] font-semibold text-ink">{f.name}</p>
                <p className="mt-1 text-[13px] leading-relaxed text-slate-light">{f.short_description}</p>
              </label>
            ))}
          </div>
          {!fields.length && (
            <Alert tone="warn">
              No fields are loaded yet. Run <code>npm run seed:roadmaps</code> to publish the nine programs.
            </Alert>
          )}
        </Card>

        <Card className="p-5 border-signal/40 bg-signal-light/30">
          <h2 className="font-display text-lg font-bold">1 Month Internship</h2>
          <p className="mt-2 text-[14px] text-slate">
            A focused 4-week program. Week 1 opens after your payment is verified; each next task
            unlocks only after you submit the previous task.
          </p>
          <div className="mt-4 flex items-center justify-between rounded-xl bg-white px-4 py-3">
            <span className="font-semibold text-slate">Program fee</span>
            <span className="font-display text-xl font-extrabold text-ink">{formatPKR(PLANS[4].fee)}</span>
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="font-display text-lg font-bold">Payment proof</h2>
          <p className="mt-1 text-[14px] text-slate">
            Send exactly <strong>{formatPKR(PLANS[4].fee)}</strong> by bank transfer to the account below, then attach your
            payment screenshot as proof. You can also do this on the next page.
          </p>
          <dl className="mt-4 grid gap-3 rounded-xl bg-mist/60 p-4 text-[14px] sm:grid-cols-3">
            <div><dt className="text-[12px] font-semibold text-slate-light">Account name</dt><dd className="font-semibold text-ink">{brand.accountName}</dd></div>
            <div><dt className="text-[12px] font-semibold text-slate-light">Bank</dt><dd className="font-semibold text-ink">{brand.bankName}</dd></div>
            <div><dt className="text-[12px] font-semibold text-slate-light">IBAN</dt><dd className="break-all font-mono text-[13px] font-bold text-ink">{brand.iban}</dd></div>
            <div className="sm:col-span-3 border-t border-mist-deep pt-3">
              <dt className="text-[12px] font-semibold text-slate-light">Or pay to this 2nd account</dt>
              <dd className="font-semibold text-ink">{brand.account2Name} · {brand.bank2Name} · <span className="break-all font-mono text-[13px] font-bold">{brand.iban2}</span></dd>
            </div>
          </dl>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="form-row"><span>Transaction ID</span>
              <input value={txn} onChange={(e) => setTxn(e.target.value)} placeholder="From your transfer receipt" /></label>
            <label className="form-row"><span>Payment date</span>
              <input type="date" value={payDate} max={isoDate(new Date())} onChange={(e) => setPayDate(e.target.value)} /></label>
          </div>
          <div className="mt-4">
            <p className="mb-1.5 text-[13px] font-semibold text-ink">Payment screenshot (proof)</p>
            <Uploader bucket="payment-proofs" userId={userId} allowed={['jpg', 'jpeg', 'png', 'pdf']}
                      maxBytes={5 * 1024 * 1024} accept="image/png,image/jpeg,application/pdf"
                      onDone={(f) => setScreenshot(f?.url ?? null)} label="Upload screenshot" />
          </div>
        </Card>

        {selected && (
          <Card className="p-5">
            <h2 className="font-display text-lg font-bold">What you&rsquo;ll be assessed on</h2>
            <dl className="mt-4 space-y-4 text-[14px]">
              <div><dt className="font-semibold text-ink">Evaluation</dt>
                <dd className="mt-0.5 text-slate">{selected.evaluation_criteria}</dd></div>
              <div><dt className="font-semibold text-ink">Certificate criteria</dt>
                <dd className="mt-0.5 text-slate">{selected.certificate_criteria}</dd></div>
            </dl>
          </Card>
        )}
      </div>

      <div className="lg:sticky lg:top-24 lg:self-start">
        <Card className="p-5">
          <h2 className="font-display text-lg font-bold">Your selection</h2>
          <dl className="mt-4 space-y-3 text-[14px]">
            <div className="flex justify-between"><dt className="text-slate">Field</dt>
              <dd className="font-semibold text-ink">{selected?.name ?? '—'}</dd></div>
            <div className="flex justify-between"><dt className="text-slate">Duration</dt>
              <dd className="font-semibold text-ink">{duration} weeks</dd></div>
            <div className="flex justify-between border-t border-mist pt-3"><dt className="text-slate">Fee</dt>
              <dd className="font-display text-lg font-extrabold text-ink">{formatPKR(plan.fee)}</dd></div>
          </dl>

          <p className="mt-4 text-[12px] leading-relaxed text-slate-light">
            This is a project-based virtual internship. The Internora does not pay a stipend or salary and does not guarantee employment.
          </p>

          {error && <div className="mt-4"><Alert tone="bad">{error}</Alert></div>}

          <Button onClick={submit} disabled={!slug || busy} className="mt-5 w-full">
            {busy ? 'Submitting…' : 'Submit application'}
          </Button>
          <p className="mt-2 text-center text-[12px] text-slate-light">Attach your payment proof above, or add it on the next page.</p>
        </Card>
      </div>
    </div>
  );
}


