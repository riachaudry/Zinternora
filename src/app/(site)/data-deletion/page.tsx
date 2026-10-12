import { SectionHead, Button } from '@/components/ui';
import { getBrand } from '@/lib/settings';

export const metadata = { title: 'Data Deletion' };

export default async function DataDeletionPage() {
  const brand = await getBrand();
  return (
    <div className="wrap py-16">
      <SectionHead eyebrow="Your data" title="Delete your data" body="You can ask us to delete your account and all information linked to it." />
      <div className="prose-narrow mt-8 space-y-3">
        <p>To delete your data, email <a className="font-semibold text-signal underline" href={`mailto:${brand.supportEmail}?subject=Delete%20my%20account`}>{brand.supportEmail}</a> from the email address of your account with the subject &ldquo;Delete my account&rdquo;. We will delete your profile, applications and uploaded files within 30 days and confirm by email.</p>
        <p>If you signed in with Facebook or Google, you can also remove {brand.name} from the connected apps in your Facebook or Google account settings. Please also email us so we can delete the data we hold.</p>
        <Button href="/contact" className="mt-4">Contact us</Button>
      </div>
    </div>
  );
}
