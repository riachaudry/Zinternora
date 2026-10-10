import 'server-only';
import { unstable_cache } from 'next/cache';
import { createClient as createSupabase } from '@supabase/supabase-js';
import { BRAND } from './brand';
import { publicEnv } from './env';

/**
 * Editable site settings (Admin -> Settings). The defaults come from src/lib/brand.ts; anything an admin
 * saves in the database replaces the default. If the table does not exist yet, or the database is
 * unreachable, the defaults are used, so the website never breaks because of settings.
 */
export type Signatory = { name: string; title: string; signatureImage: string | null };

export type BrandSettings = {
  name: string; legalName: string; tagline: string; motto: string; description: string;
  website: string; supportEmail: string; logoUrl: string | null;
  hrName: string; hrWhatsapp: string; hrWhatsappLink: string;
  accountName: string; bankName: string; iban: string;
  founder: Signatory; hrManager: Signatory;
  /** Issue the Certificate automatically the moment an internship is successfully completed (default on). */
  autoCertificate: boolean;
  /** Also issue a standard Letter of Recommendation automatically (default off: admins normally write it). */
  autoLor: boolean;
};

/** What is stored in the database (flat, all optional). */
export type StoredBrand = Partial<{
  name: string; tagline: string; motto: string; website: string; supportEmail: string; logoUrl: string | null;
  hrName: string; hrWhatsapp: string; accountName: string; bankName: string; iban: string;
  founderName: string; founderTitle: string; founderSignature: string | null;
  hrManagerName: string; hrManagerTitle: string; hrManagerSignature: string | null;
  autoCertificate: boolean; autoLor: boolean;
}>;

const whatsappLink = (n: string) => `https://wa.me/${n.replace(/\D/g, '')}`;

export function brandDefaults(): BrandSettings {
  return {
    name: BRAND.name, legalName: BRAND.legalName, tagline: BRAND.tagline, motto: BRAND.motto, description: BRAND.description,
    website: BRAND.website, supportEmail: BRAND.supportEmail, logoUrl: BRAND.logoMark,
    hrName: BRAND.hr.name, hrWhatsapp: BRAND.hr.whatsapp, hrWhatsappLink: BRAND.hr.whatsappLink,
    accountName: BRAND.payment.accountName, bankName: BRAND.payment.bankName, iban: BRAND.payment.iban,
    founder: { ...BRAND.founder }, hrManager: { ...BRAND.hrManager },
    autoCertificate: true, autoLor: false,
  };
}

const str = (v: unknown, fallback: string) => (typeof v === 'string' && v.trim() ? v.trim() : fallback);
const img = (o: StoredBrand, k: keyof StoredBrand, fallback: string | null) =>
  k in o ? (typeof o[k] === 'string' && (o[k] as string).trim() ? (o[k] as string).trim() : null) : fallback;

export function mergeBrand(o: StoredBrand | null): BrandSettings {
  const d = brandDefaults();
  if (!o) return d;
  const name = str(o.name, d.name);
  const hrWhatsapp = str(o.hrWhatsapp, d.hrWhatsapp);
  return {
    ...d,
    name, legalName: name.toUpperCase(),
    tagline: str(o.tagline, d.tagline), motto: str(o.motto, d.motto),
    website: str(o.website, d.website), supportEmail: str(o.supportEmail, d.supportEmail),
    logoUrl: img(o, 'logoUrl', d.logoUrl),
    hrName: str(o.hrName, d.hrName), hrWhatsapp, hrWhatsappLink: whatsappLink(hrWhatsapp),
    accountName: str(o.accountName, d.accountName), bankName: str(o.bankName, d.bankName), iban: str(o.iban, d.iban),
    founder: { name: str(o.founderName, d.founder.name), title: str(o.founderTitle, d.founder.title), signatureImage: img(o, 'founderSignature', d.founder.signatureImage) },
    hrManager: { name: str(o.hrManagerName, d.hrManager.name), title: str(o.hrManagerTitle, d.hrManager.title), signatureImage: img(o, 'hrManagerSignature', d.hrManager.signatureImage) },
    autoCertificate: typeof o.autoCertificate === 'boolean' ? o.autoCertificate : d.autoCertificate,
    autoLor: typeof o.autoLor === 'boolean' ? o.autoLor : d.autoLor,
  };
}

async function fetchStored(): Promise<StoredBrand | null> {
  try {
    const { url, anonKey } = publicEnv('site settings');
    const sb = createSupabase(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data, error } = await sb.from('site_settings').select('value').eq('key', 'brand').maybeSingle();
    if (error || !data) return null;           // table missing or no row yet -> defaults
    return data.value as StoredBrand;
  } catch {
    return null;
  }
}

// Cached for 2 minutes and refreshed immediately when an admin saves (tag "brand").
const cachedStored = unstable_cache(fetchStored, ['site-settings-brand'], { tags: ['brand'], revalidate: 120 });

/** The effective brand/contact settings. Call from server components, route handlers and metadata functions. */
export async function getBrand(): Promise<BrandSettings> {
  return mergeBrand(await cachedStored());
}

/** The small, public part passed to client components (logo, name). */
export type BrandPublic = Pick<BrandSettings, 'name' | 'legalName' | 'tagline' | 'logoUrl'>;
export const brandPublic = (b: BrandSettings): BrandPublic => ({ name: b.name, legalName: b.legalName, tagline: b.tagline, logoUrl: b.logoUrl });
