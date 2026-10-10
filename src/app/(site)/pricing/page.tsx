import { Button, Card, SectionHead, Alert } from '@/components/ui';
import { PLANS, DURATIONS, formatPKR } from '@/lib/brand';
import { getBrand } from '@/lib/settings';

export const metadata = { title: 'Pricing' };

export default async function PricingPage() {
  const brand = await getBrand();
  return (
    <div className="wrap py-16">
      <SectionHead
        eyebrow="One fee, no extras"
        title="Program fees"
        body="A single fee covers the whole program: weekly tasks, evaluator feedback, the offer letter, and the certificate on completion. There is no separate certificate charge."
      />

      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {DURATIONS.map((d) => {
          const plan = PLANS[d];
          return (
            <Card key={d} className="flex flex-col p-6">
              <h2 className="font-display text-lg font-bold">{plan.label}</h2>
              <p className="mt-3 font-display text-4xl font-extrabold">{formatPKR(plan.fee)}</p>
              <ul className="mt-6 space-y-2 border-t border-mist pt-5 text-[14px] text-slate">
                <li>{d - 1} progression weeks + final project</li>
                <li>Every submission reviewed and scored</li>
                <li>Offer letter on approval</li>
                <li>Verifiable certificate on completion</li>
                <li>Letter of recommendation after successful completion</li>
              </ul>
              <Button href={`/register?duration=${d}`} className="mt-6 w-full">Apply for {plan.label.toLowerCase()}</Button>
            </Card>
          );
        })}
      </div>

      <div className="mt-10 grid gap-5 lg:grid-cols-[1fr_1fr]">
        <Card className="p-6">
          <h3 className="font-display text-lg font-bold">Payment details</h3>
          <p className="mt-2 text-[15px] text-slate">
            Send the exact internship fee by Bank Transfer to the account below,
            then upload your receipt in the dashboard.
          </p>
          <dl className="mt-5 rounded-xl bg-mist/70 p-5 text-[15px]">
            <div className="flex justify-between gap-4 border-b border-mist-deep pb-2">
              <dt className="text-slate-light">Method</dt>
              <dd className="font-semibold text-ink">Bank Transfer</dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-mist-deep py-2">
              <dt className="text-slate-light">Account name</dt>
              <dd className="font-semibold text-ink">{brand.accountName}</dd>
            </div>
            <div className="flex justify-between gap-4 pt-2">
              <dt className="text-slate-light">Bank / IBAN</dt>
              <dd className="break-all text-right font-mono font-semibold text-ink">{brand.bankName}<br />{brand.iban}</dd>
            </div>
          </dl>
          <p className="mt-4 text-[13px] text-slate-light">
            Payments are verified manually against your transaction ID and screenshot. Never send
            your fee to any number other than the one shown here.
          </p>
        </Card>

        <Card className="p-6">
          <h3 className="font-display text-lg font-bold">What the fee is not</h3>
          <ul className="mt-3 space-y-2 text-[15px] leading-relaxed text-slate">
            <li>Not a placement fee — Zinternora does not guarantee employment.</li>
            <li>Not tuition for an accredited qualification.</li>
          </ul>
          <Alert tone="warn" title="Refunds">
            <p className="mt-1">
              If a payment is rejected as unverifiable, it is marked rejected and no internship is
              activated. Refund requests for verified payments are handled case by case by HR on
              WhatsApp before the internship start date.
            </p>
          </Alert>
        </Card>
      </div>
    </div>
  );
}


