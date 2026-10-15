import { SOCIAL_LINKS } from '@/lib/brand';
import { Card, SectionHead, Button, Alert } from '@/components/ui';
import { getBrand } from '@/lib/settings';

export const metadata = { title: 'Contact' };

export default async function ContactPage() {
  const brand = await getBrand();
  return (
    <div className="wrap py-16">
      <SectionHead
        eyebrow="Get in touch"
        title="Contact The Internora"
        body="WhatsApp is the fastest route for anything before you apply. Once you are enrolled, open a support ticket from your dashboard so your question is attached to your record."
      />

      <div className="mt-10 grid gap-5 md:grid-cols-2">
        <Card className="p-7">
          <h2 className="font-display text-lg font-bold">HR</h2>
          <p className="mt-3 text-[17px] font-semibold text-ink">{brand.hrName}</p>
          <p className="mt-4 text-[13px] font-semibold text-slate-light">WhatsApp</p>
          <p className="text-[15px] text-slate">Use the button below to chat with HR directly.</p>
          <p className="mt-4 text-[13px] font-semibold text-slate-light">Support email</p>
          <p className="text-[17px] font-semibold text-ink">
            <a href={`mailto:${brand.supportEmail}`} className="underline decoration-amber/60 underline-offset-4">{brand.supportEmail}</a>
          </p>
          <Button href={brand.hrWhatsappLink} className="mt-6 w-full">Open WhatsApp chat</Button>
          <p className="mt-5 text-[13px] font-semibold text-slate-light">Follow us</p>
          <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[15px] font-semibold">
            {SOCIAL_LINKS.map((l) => (
              <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" className="text-signal underline underline-offset-4">{l.label}</a>
            ))}
          </p>
        </Card>

        <Card className="p-7">
          <h2 className="font-display text-lg font-bold">Already enrolled?</h2>
          <p className="mt-2 text-[15px] leading-relaxed text-slate">
            Open a support ticket from your dashboard. Tickets are linked to your student ID and
            internship, so you do not have to explain your situation from scratch. You can attach a
            screenshot, and you will see every reply in one thread.
          </p>
          <p className="mt-3 text-[14px] text-slate">
            Or email us at{' '}
            <a href={`mailto:${brand.supportEmail}`} className="font-semibold text-ink underline decoration-amber/60 underline-offset-4">{brand.supportEmail}</a>.
          </p>
          <Button href="/dashboard/support" variant="secondary" className="mt-6 w-full">Go to support</Button>
        </Card>
      </div>

      <Alert tone="warn" title="One payment account only">
        <p className="mt-1">
          {brand.name} collects fees at a single Bank Transfer account: {brand.accountName},
          {brand.bankName}, IBAN {brand.iban}. If anyone asks you to send money anywhere else, it is not us.
          We never ask for your password, OTP or PIN.
        </p>
      </Alert>
    </div>
  );
}


