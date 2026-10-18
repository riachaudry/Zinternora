import { type NextRequest } from 'next/server';
import { apiAdmin } from '@/lib/auth';
import { audit } from '@/lib/audit';
import { sendEmail } from '@/lib/email';
import { pdfBrand, offerLetterPdf, certificatePdf, lorPdf } from '@/lib/pdf';
import { shortDate } from '@/lib/dates';
import { z } from 'zod';
import { ok, fail, zodFail } from '../../_lib';

const schema = z.object({
  name: z.string().trim().min(2, 'Enter the name.').max(80),
  email: z.string().trim().email('Enter a valid email.'),
  field: z.string().trim().min(2, 'Enter the domain.').max(80),
  doc: z.enum(['offer', 'certificate', 'lor']),
  duration: z.coerce.number().int().min(1).max(52).default(4),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
});

const LABEL = { offer: 'Offer Letter', certificate: 'Certificate of Completion', lor: 'Letter of Recommendation' } as const;

/** Owner tool: build a document for any person and email it as a PDF. No internship or tasks required. */
export async function POST(req: NextRequest) {
  try {
    const admin = await apiAdmin();
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) return zodFail(parsed.error.issues);
    const d = parsed.data;

    const today = new Date();
    const plus = new Date(today.getTime() + d.duration * 7 * 86400000);
    const start = d.start_date ? shortDate(d.start_date) : shortDate(today);
    const end = d.end_date ? shortDate(d.end_date) : shortDate(plus);
    const pb = await pdfBrand();
    const base = { issueDate: shortDate(today), studentName: d.name, field: d.field, duration: d.duration };

    let bytes: Uint8Array;
    if (d.doc === 'offer') bytes = await offerLetterPdf(pb, { ...base, startDate: start, endDate: end });
    else if (d.doc === 'certificate') bytes = await certificatePdf(pb, { ...base, completionDate: d.end_date ? shortDate(d.end_date) : shortDate(today) });
    else bytes = await lorPdf(pb, { ...base, completionDate: d.end_date ? shortDate(d.end_date) : shortDate(today) });

    const label = LABEL[d.doc];
    const filename = `${label.replace(/ /g, '-')}-${d.name.replace(/[^A-Za-z0-9]+/g, '-')}.pdf`;
    const res = await sendEmail(d.email, 'document_issued', { name: d.name, docLabel: label, field: d.field }, [{ filename, content: bytes }]);
    if (res.status !== 'sent') throw new Error(`Email could not be sent: ${res.error ?? 'unknown error'}. Check Resend settings.`);

    await audit(admin.id, 'document.manual_send', 'document', undefined, { doc: d.doc, to: d.email, name: d.name });
    return ok({ ok: true });
  } catch (e) { return fail(e); }
}
