'use client';
import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, Alert } from '@/components/ui';
import { Uploader } from '@/components/portal/Uploader';
import type { BrandSettings } from '@/lib/settings';

type Form = {
  name: string; tagline: string; motto: string; website: string; supportEmail: string; logoUrl: string;
  hrName: string; hrWhatsapp: string; accountName: string; bankName: string; iban: string;
  account2Name: string; bank2Name: string; iban2: string;
  founderName: string; founderTitle: string; founderSignature: string;
  hrManagerName: string; hrManagerTitle: string; hrManagerSignature: string;
  autoCertificate: boolean; autoLor: boolean;
};

const IMG_TYPES = { allowed: ['png', 'jpg', 'jpeg', 'webp'], accept: 'image/png,image/jpeg,image/webp', maxBytes: 2 * 1024 * 1024 };

/** Admin-only editor for the brand name, logo, contact details, bank details and document signatories. Saved to Supabase. */
export function BrandSettingsForm({ brand, adminId }: { brand: BrandSettings; adminId: string }) {
  const router = useRouter();
  const [f, setF] = React.useState<Form>({
    name: brand.name, tagline: brand.tagline, motto: brand.motto, website: brand.website, supportEmail: brand.supportEmail,
    logoUrl: brand.logoUrl ?? '', hrName: brand.hrName, hrWhatsapp: brand.hrWhatsapp,
    accountName: brand.accountName, bankName: brand.bankName, iban: brand.iban,
    account2Name: brand.account2Name, bank2Name: brand.bank2Name, iban2: brand.iban2,
    founderName: brand.founder.name, founderTitle: brand.founder.title, founderSignature: brand.founder.signatureImage ?? '',
    hrManagerName: brand.hrManager.name, hrManagerTitle: brand.hrManager.title, hrManagerSignature: brand.hrManager.signatureImage ?? '',
    autoCertificate: brand.autoCertificate, autoLor: brand.autoLor,
  });
  const [busy, setBusy] = React.useState(false);
  const [msg, setMsg] = React.useState<{ tone: 'good' | 'bad'; text: string } | null>(null);
  const set = (k: Exclude<keyof Form, 'autoCertificate' | 'autoLor'>) => (e: React.ChangeEvent<HTMLInputElement>) => setF((v) => ({ ...v, [k]: e.target.value }));
  const toggle = (k: 'autoCertificate' | 'autoLor') => (e: React.ChangeEvent<HTMLInputElement>) => setF((v) => ({ ...v, [k]: e.target.checked }));

  async function save(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setMsg(null);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(f),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? 'Could not save the settings.');
      setMsg({ tone: 'good', text: 'Saved. The website, documents and emails now use these details.' });
      router.refresh();
    } catch (err) {
      setMsg({ tone: 'bad', text: err instanceof Error ? err.message : 'Could not save the settings.' });
    } finally { setBusy(false); }
  }

  const Img = ({ k, label, size }: { k: 'logoUrl' | 'founderSignature' | 'hrManagerSignature'; label: string; size: number }) => (
    <div className="rounded-xl border border-mist-deep p-3">
      <p className="text-[13px] font-semibold text-ink">{label}</p>
      <div className="mt-2 flex items-center gap-3">
        <div className="grid shrink-0 place-items-center rounded-lg border border-mist-deep bg-white" style={{ width: size * 1.6, height: size }}>
          {f[k] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={f[k]} alt={label} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
          ) : <span className="px-2 text-[11px] text-slate-light">None</span>}
        </div>
        <div className="min-w-0 flex-1">
          <Uploader bucket="branding" userId={adminId} allowed={IMG_TYPES.allowed} accept={IMG_TYPES.accept}
                    maxBytes={IMG_TYPES.maxBytes} label="Upload image"
                    onDone={(u) => { if (u) setF((v) => ({ ...v, [k]: u.url })); }} />
          {f[k] && (
            <button type="button" className="mt-1.5 text-[12.5px] font-semibold text-danger underline"
                    onClick={() => setF((v) => ({ ...v, [k]: '' }))}>Remove image</button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <form onSubmit={save} className="space-y-5">
      <Card className="p-5">
        <h2 className="font-display text-lg font-bold text-ink">Brand and contact</h2>
        <p className="mt-1 text-[13px] text-slate-light">
          Used on the website, logo, footer, emails and the Offer Letter, Certificate and LOR.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="form-row"><span>Brand name</span><input value={f.name} onChange={set('name')} required maxLength={40} /></label>
          <label className="form-row"><span>Tagline</span><input value={f.tagline} onChange={set('tagline')} required maxLength={90} /></label>
          <label className="form-row"><span>Motto (on documents)</span><input value={f.motto} onChange={set('motto')} required maxLength={40} /></label>
          <label className="form-row"><span>Website (without https://)</span><input value={f.website} onChange={set('website')} required maxLength={80} /></label>
          <label className="form-row"><span>Support email</span><input type="email" value={f.supportEmail} onChange={set('supportEmail')} required maxLength={120} /></label>
          <label className="form-row"><span>HR contact name</span><input value={f.hrName} onChange={set('hrName')} required maxLength={60} /></label>
          <label className="form-row"><span>HR WhatsApp number</span><input value={f.hrWhatsapp} onChange={set('hrWhatsapp')} required maxLength={25} inputMode="tel" /></label>
        </div>
        <div className="mt-4"><Img k="logoUrl" label="Logo (PNG, JPG or WebP, max 2 MB)" size={64} /></div>
      </Card>

      <Card className="p-5">
        <h2 className="font-display text-lg font-bold text-ink">Fee payment account (Bank Transfer)</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="form-row"><span>Account name</span><input value={f.accountName} onChange={set('accountName')} required maxLength={60} /></label>
          <label className="form-row"><span>Bank name</span><input value={f.bankName} onChange={set('bankName')} required maxLength={60} /></label>
          <label className="form-row sm:col-span-2"><span>IBAN</span><input value={f.iban} onChange={set('iban')} required maxLength={34} className="font-mono" /></label>
        </div>
        <h3 className="mt-5 font-display text-[15px] font-bold text-ink">Second payment account (Easypaisa)</h3>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <label className="form-row"><span>Account name</span><input value={f.account2Name} onChange={set('account2Name')} required maxLength={60} /></label>
          <label className="form-row"><span>Bank / wallet name</span><input value={f.bank2Name} onChange={set('bank2Name')} required maxLength={60} /></label>
          <label className="form-row sm:col-span-2"><span>IBAN</span><input value={f.iban2} onChange={set('iban2')} required maxLength={34} className="font-mono" /></label>
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="font-display text-lg font-bold text-ink">Document signatories</h2>
        <p className="mt-1 text-[13px] text-slate-light">Names, titles and signature images printed on every Offer Letter, Certificate and LOR. Use only real signatures supplied by the signers.</p>
        <div className="mt-4 grid gap-5 lg:grid-cols-2">
          <div className="space-y-3">
            <label className="form-row"><span>First signatory name</span><input value={f.founderName} onChange={set('founderName')} required maxLength={60} /></label>
            <label className="form-row"><span>Title</span><input value={f.founderTitle} onChange={set('founderTitle')} required maxLength={60} /></label>
            <Img k="founderSignature" label="Signature image" size={56} />
          </div>
          <div className="space-y-3">
            <label className="form-row"><span>Second signatory name</span><input value={f.hrManagerName} onChange={set('hrManagerName')} required maxLength={60} /></label>
            <label className="form-row"><span>Title</span><input value={f.hrManagerTitle} onChange={set('hrManagerTitle')} required maxLength={60} /></label>
            <Img k="hrManagerSignature" label="Signature image" size={56} />
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="font-display text-lg font-bold text-ink">Automatic documents</h2>
        <p className="mt-1 text-[13px] text-slate-light">
          The Offer Letter is always created automatically when a payment is verified and the start date is set. Choose what is created when a student finishes all four weeks.
          Eligibility rules still apply (every week finished and enough required work approved).
        </p>
        <label className="mt-4 flex items-start gap-3 text-[14px] text-ink">
          <input type="checkbox" className="mt-1 h-4 w-4" checked={f.autoCertificate} onChange={toggle('autoCertificate')} />
          <span><b>Issue the Certificate automatically</b> with the student&apos;s name, domain and real completion date.</span>
        </label>
        <label className="mt-3 flex items-start gap-3 text-[14px] text-ink">
          <input type="checkbox" className="mt-1 h-4 w-4" checked={f.autoLor} onChange={toggle('autoLor')} />
          <span><b>Issue a standard Letter of Recommendation automatically.</b> It contains only real facts (name, domain, completion date) and the standard closing line. Leave this off if you want to write each LOR yourself.</span>
        </label>
      </Card>

      {msg && <Alert tone={msg.tone}>{msg.text}</Alert>}
      <Button type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save settings'}</Button>
    </form>
  );
}
