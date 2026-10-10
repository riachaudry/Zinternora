'use client';
import * as React from 'react';
import { useRouter } from 'next/navigation';
import { PLANS, formatPKR } from '@/lib/brand';
import { Card, Button, Alert } from '@/components/ui';
import { postJson } from '@/components/portal/form';

type Field = {
  id: string; slug: string; name: string; short_description: string; skills: string[];
  evaluation_criteria: string; certificate_criteria: string;
};

export function ApplyForm({ fields }: { fields: Field[] }) {
  const router = useRouter();
  const [slug, setSlug] = React.useState('');
  const duration = 4 as const;
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const selected = fields.find((f) => f.slug === slug);
  const plan = PLANS[duration];

  async function submit() {
    setError(null); setBusy(true);
    try {
      await postJson('/api/applications', { field_slug: slug, duration });
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
            This is a project-based virtual internship. Zinternora does not pay a stipend or salary and does not guarantee employment.
          </p>

          {error && <div className="mt-4"><Alert tone="bad">{error}</Alert></div>}

          <Button onClick={submit} disabled={!slug || busy} className="mt-5 w-full">
            {busy ? 'Submitting…' : 'Submit application'}
          </Button>
          <p className="mt-2 text-center text-[12px] text-slate-light">Next: pay the fee and upload your receipt.</p>
        </Card>
      </div>
    </div>
  );
}


