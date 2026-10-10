import { Button, Card, SectionHead, Alert } from '@/components/ui';
import { BRAND } from '@/lib/brand';

export const metadata = { title: 'How it works' };

const STEPS = [
  ['Register', 'Create an account with your real details, upload a profile photo and complete your profile. Your student ID is generated automatically.'],
  ['Choose a field', 'Pick one of 16 internship fields for the 1-month (4-week) program. The published fee appears on the payment page automatically.'],
  ['Submit your payment', 'Send the exact fee by Bank Transfer to the account shown, then upload the transaction ID, date, amount and screenshot.'],
  ['Wait for verification', 'An admin checks the payment manually against the receipt. Nothing is verified automatically. You will be notified either way.'],
  ['Receive your offer letter', 'Once your payment is verified and the real start date is confirmed by an admin, your internship activates, your weekly dates are calculated, and your offer letter is issued with its own ID.'],
  ['Work through the weeks', 'Only Week 1, Task 1 opens at first. Each week lists objectives, tasks and deadlines calculated from your start date. Normal deadlines are Sunday at 11:59 PM.'],
  ['Submit and get reviewed', 'Upload files, paste links or write your response. An evaluator approves, scores, or asks for a revision with written feedback.'],
  ['Unlock the next week', 'Tasks unlock one after another. After the last task of a week is submitted, the next week opens. This is enforced on the server.'],
  ['Final project and evaluation', 'The final week is a complete project. Your work is reviewed and you receive written feedback.'],
  ['Certificate and LOR', 'Once all four weeks are successfully completed, your certificate is issued with a public verification link, and a letter of recommendation can be issued after admin review.'],
];

export default function HowItWorksPage() {
  return (
    <div className="wrap py-16">
      <SectionHead
        eyebrow="End to end"
        title="How an Zinternora internship actually runs"
        body="Ten steps from registration to a verifiable certificate. Every date in the program is calculated from your own start date."
      />

      <ol className="mt-10 space-y-3">
        {STEPS.map(([title, body], i) => (
          <li key={title} className="card flex gap-4 p-5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ink font-display text-[13px] font-bold text-white">
              {i + 1}
            </span>
            <div>
              <h3 className="font-display text-[16px] font-bold">{title}</h3>
              <p className="mt-1.5 text-[15px] leading-relaxed text-slate">{body}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-10 grid gap-5 md:grid-cols-2">
        <Card className="p-6">
          <h3 className="font-display text-lg font-bold">How weeks unlock</h3>
          <p className="mt-2 text-[15px] leading-relaxed text-slate">
            A week completes when at least 70% of its required task points have been approved by an
            evaluator. Only then does the next week open. Skipping ahead is not possible —
            locked weeks are enforced by the database, not hidden in the browser.
          </p>
        </Card>
        <Card className="p-6">
          <h3 className="font-display text-lg font-bold">How scoring works</h3>
          <p className="mt-2 text-[15px] leading-relaxed text-slate">
            Each task carries points. Your weekly score is the share of task points earned across
            the progression weeks, worth 70%. The final project is worth 30%. Together they form
            your completed internship work and evaluations.
          </p>
        </Card>
      </div>

      <Alert tone="info" title="Before you apply" >
        <p className="mt-1">
          This is a project-based virtual internship program. It is not a job, an accredited
          qualification, or a guarantee of employment. Certificates and letters are issued
          only after the published completion criteria are met.
        </p>
      </Alert>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button href="/register" size="lg">Apply now</Button>
        <Button href={BRAND.hr.whatsappLink} variant="secondary" size="lg">Ask HR on WhatsApp</Button>
      </div>
    </div>
  );
}


