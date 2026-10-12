import { z } from 'zod';

export const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;
export const ALLOWED_UPLOAD_EXT = ['pdf', 'docx', 'jpg', 'jpeg', 'png', 'zip', 'txt'];
export const ALLOWED_IMAGE_EXT = ['jpg', 'jpeg', 'png', 'webp'];

export function checkFile(name: string, size: number, allowed = ALLOWED_UPLOAD_EXT, maxBytes = MAX_UPLOAD_BYTES) {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  if (!allowed.includes(ext)) return { ok: false as const, error: `Only ${allowed.join(', ')} files are accepted.` };
  if (size > maxBytes) return { ok: false as const, error: `Files must be under ${Math.round(maxBytes / 1048576)} MB.` };
  return { ok: true as const, ext };
}

export const registerSchema = z.object({
  full_name: z.string().min(3, 'Enter your full name.').max(80),
  email: z.string().email('Enter a valid email address.'),
  phone: z.string().min(7, 'Enter a valid phone number.').max(20),
  whatsapp: z.string().max(20).optional(),
  field_slug: z.string().max(80).optional(),
  password: z.string().min(8, 'Use at least 8 characters.')
    .regex(/[a-z]/, 'Include a lowercase letter.')
    .regex(/[A-Z]/, 'Include an uppercase letter.')
    .regex(/[0-9]/, 'Include a number.'),
  date_of_birth: z.string().optional(),
  gender: z.string().optional(),
  city: z.string().max(60).optional(),
  country: z.string().max(60).optional(),
  education_level: z.string().max(60).optional(),
  university: z.string().max(120).optional(),
  field_of_study: z.string().max(120).optional(),
  bio: z.string().max(600).optional(),
  skills: z.array(z.string().max(40)).max(20).optional(),
  linkedin_url: z.string().url().optional().or(z.literal('')),
  portfolio_url: z.string().url().optional().or(z.literal('')),
  invite_token: z.string().optional(),
});

export const applicationSchema = z.object({
  field_slug: z.string().min(2),
  duration: z.literal(4),
});

export const paymentSchema = z.object({
  application_id: z.string().uuid(),
  method: z.enum(['bank_transfer']),
  transaction_id: z.string().min(4, 'Enter the transaction ID from your receipt.').max(60),
  payment_date: z.string(),
  amount_pkr: z.number().int().positive(),
  screenshot_url: z.string().min(4, 'Upload your payment screenshot.'),
});

export const submissionSchema = z.object({
  task_id: z.string().uuid(),
  file_url: z.string().optional(),
  file_name: z.string().optional(),
  file_size: z.number().optional(),
  url: z.string().url('Enter a valid link.').optional().or(z.literal('')),
  text_response: z.string().max(20000).optional(),
  comments: z.string().max(2000).optional(),
}).refine((v) => v.file_url || v.url || v.text_response, {
  message: 'Attach a file, paste a link, or write your response.',
});

export const reviewSchema = z.object({
  status: z.enum(['approved', 'rejected', 'revision_required']),
  score: z.number().int().min(0).max(100).optional(),
  feedback: z.string().max(4000).optional(),
});

export const ticketSchema = z.object({
  subject: z.string().min(4).max(120),
  message: z.string().min(10).max(4000),
  attachment_url: z.string().optional(),
});

export const inviteSchema = z.object({
  full_name: z.string().min(3).max(80),
  email: z.string().email(),
});



/** Admin-managed calendar event (used by the create and edit API routes). */
export const eventSchema = z.object({
  title: z.string().trim().min(3, 'Enter a title.').max(120),
  description: z.string().trim().max(1000).optional().or(z.literal('')),
  event_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Choose a date.'),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal('')),
  event_time: z.string().regex(/^\d{2}:\d{2}$/).optional().or(z.literal('')),
  audience: z.enum(['all', 'student']),
  student_id: z.string().uuid().optional().or(z.literal('')),
}).refine((v) => v.audience === 'all' || !!v.student_id, { message: 'Choose which student this event is for.' })
  .refine((v) => !v.end_date || v.end_date >= v.event_date, { message: 'The end date cannot be before the start date.' });



/** Editable brand / contact settings (Admin -> Settings). Images must be our own storage files or bundled /signatures files. */
const imageUrl = z.string().trim().max(500).refine((v) => {
  if (!v) return true;
  if (v.startsWith('/signatures/') || v.startsWith('/brand/')) return true;
  try {
    const host = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').host;
    const u = new URL(v);
    return u.protocol === 'https:' && u.host === host && u.pathname.includes('/branding/');
  } catch { return false; }
}, 'Upload the image using the Upload button.');

export const brandSchema = z.object({
  name: z.string().trim().min(2, 'Enter the brand name.').max(40),
  tagline: z.string().trim().min(2).max(90),
  motto: z.string().trim().min(2).max(40),
  website: z.string().trim().min(4).max(80).regex(/^[A-Za-z0-9.\-/]+$/, 'Website like www.example.com (no https://).'),
  supportEmail: z.string().trim().email('Enter a valid support email.').max(120),
  logoUrl: imageUrl.optional().or(z.literal('')),
  hrName: z.string().trim().min(2).max(60),
  hrWhatsapp: z.string().trim().min(6).max(25).regex(/^[+0-9 ()\-]+$/, 'Digits, spaces and + only.'),
  accountName: z.string().trim().min(2).max(60),
  bankName: z.string().trim().min(2).max(60),
  iban: z.string().trim().min(15).max(34).regex(/^[A-Za-z0-9 ]+$/, 'Letters and digits only.'),
  founderName: z.string().trim().min(2).max(60),
  founderTitle: z.string().trim().min(2).max(60),
  founderSignature: imageUrl.optional().or(z.literal('')),
  hrManagerName: z.string().trim().min(2).max(60),
  hrManagerTitle: z.string().trim().min(2).max(60),
  hrManagerSignature: imageUrl.optional().or(z.literal('')),
  autoCertificate: z.boolean(),
  autoLor: z.boolean(),
});
