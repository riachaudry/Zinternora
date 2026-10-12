import { SectionHead } from '@/components/ui';
import { getBrand } from '@/lib/settings';

export const metadata = { title: 'Privacy Policy' };

export default async function PrivacyPage() {
  const brand = await getBrand();
  const h = 'mt-8 font-display text-lg font-bold text-ink';
  return (
    <div className="wrap py-16">
      <SectionHead eyebrow="Legal" title="Privacy Policy" body={`How ${brand.name} collects, uses and protects your information. Last updated: October 2026.`} />
      <div className="prose-narrow mt-8 space-y-3">
        <h2 className={h}>What we collect</h2>
        <p>When you create an account or sign in with email, Google or Facebook, we receive your name and email address. You may also give us your WhatsApp number, city, education details and a payment screenshot when you apply.</p>
        <h2 className={h}>How we use it</h2>
        <p>We use your information only to run your internship: creating your account, verifying your payment, issuing your offer letter, certificate and letter of recommendation, and contacting you about your program. We do not sell your information.</p>
        <h2 className={h}>Sign in with Google or Facebook</h2>
        <p>If you sign in with Google or Facebook, we only receive your public profile name and email address. We never post on your behalf and never see your social-media password.</p>
        <h2 className={h}>Storage and security</h2>
        <p>Your data is stored with our service providers (Supabase for the database and file storage, Cloudflare for hosting) and is protected by access controls. Payment screenshots are visible only to you and our admins.</p>
        <h2 className={h}>Your choices</h2>
        <p>You can update your profile at any time from your dashboard. To delete your account and data, see our <a className="font-semibold text-signal underline" href="/data-deletion">data deletion page</a>.</p>
        <h2 className={h}>Contact</h2>
        <p>Questions about this policy: <a className="font-semibold text-signal underline" href={`mailto:${brand.supportEmail}`}>{brand.supportEmail}</a>.</p>
      </div>
    </div>
  );
}
