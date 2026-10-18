import 'server-only';
import { getBrand } from '../settings';
import { LINKEDIN_URL, FACEBOOK_URL, TIKTOK_URL } from '../brand';
import type { PdfBrand } from './documents';

export { offerLetterPdf, certificatePdf, lorPdf, weekTasksPdf } from './documents';
export type { PdfBrand, TaskSheetItem } from './documents';
export const SOCIAL = { linkedinUrl: LINKEDIN_URL, facebookUrl: FACEBOOK_URL, tiktokUrl: TIKTOK_URL };

/** Maps the live brand settings (admin-editable) to what the PDF builders need. */
export async function pdfBrand(): Promise<PdfBrand> {
  const b = await getBrand();
  return {
    name: b.name, tagline: b.tagline, website: b.website, supportEmail: b.supportEmail,
    founder: { name: b.founder.name, title: b.founder.title },
    hrManager: { name: b.hrManager.name, title: b.hrManager.title },
    hrWhatsappLink: b.hrWhatsappLink,
  };
}
