import { SectionHead } from '@/components/ui';
import { getBrand } from '@/lib/settings';

export const metadata = { title: 'Terms of Service' };

export default async function TermsPage() {
  const brand = await getBrand();
  const h = 'mt-8 font-display text-lg font-bold text-ink';
  return (
    <div className="wrap py-16">
      <SectionHead eyebrow="Legal" title="Terms of Service" body={`The rules for using ${brand.name}. Last updated: October 2026.`} />
      <div className="prose-narrow mt-8 space-y-3">
        <h2 className={h}>The program</h2>
        <p>{brand.name} offers project-based virtual internships. It is an independent private program. We do not pay a stipend or salary and we do not guarantee employment.</p>
        <h2 className={h}>Fees and verification</h2>
        <p>The program fee is shown when you apply. Every payment is verified manually by an admin. Your internship starts only after your payment is verified.</p>
        <h2 className={h}>Your work</h2>
        <p>You agree to submit your own original work. Plagiarised or copied work may be rejected and can lead to removal from the program and withdrawal of any certificate.</p>
        <h2 className={h}>Certificates and letters</h2>
        <p>Certificates and letters of recommendation are issued only after you complete the required tasks and meet the evaluation criteria. Each certificate can be verified on our website.</p>
        <h2 className={h}>Contact</h2>
        <p>Questions: <a className="font-semibold text-signal underline" href={`mailto:${brand.supportEmail}`}>{brand.supportEmail}</a>.</p>
      </div>
    </div>
  );
}
