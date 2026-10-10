/** Single source of truth for every piece of official Zinternora information. */
export const BRAND = {
  name: 'Zinternora',
  legalName: 'ZINTERNORA',
  tagline: 'Virtual Internships. Real Experience.',
  motto: 'LEARN | BUILD | GROW',
  // Owner-supplied rose-gold emblem. `logoMark` = the Z symbol only (used next to the name); `logoSealMark` = navy version for the gold seal.
  logoMark: '/brand/zinternora-mark.png',
  logoSealMark: '/brand/zinternora-mark-navy.png',
  logoEmblem: '/brand/zinternora-emblem.png',
  website: 'www.internora.com',
  supportEmail: 'zinternorasupport@gmail.com',
  description: 'Project-Based Virtual Internships & Career Experience',
  // Real signature images supplied by the owners (public/signatures). Set a value to null to leave the line blank for a wet signature.
  founder: { name: 'Faree Chaudhry', title: 'Founder & CEO', signatureImage: '/signatures/faree-chaudhry.png' as string | null },
  hrManager: { name: 'Ria Chaudhry', title: 'HR Manager', signatureImage: '/signatures/ria-chaudhry.png' as string | null },
  hr: { name: 'Ria Chaudhry', whatsapp: '+966 54 786 0296', whatsappLink: 'https://wa.me/966547860296' },
  payment: {
    accountName: 'Farkhanda',
    bankName: 'Bank Alfalah',
    iban: 'PK86BAHL0016098101818801',
    // Bank transfer is the only payment method (JazzCash was removed).
    methods: [
      { id: 'bank_transfer', label: 'Bank Transfer' },
    ] as const,
  },
} as const;

export const TRUST_STATEMENTS = [
  'This is a project-based virtual internship program.',
  'Certificates are issued after meeting the published completion criteria.',
  'LORs are issued after successful completion and admin review.',
  'Zinternora does not pay a stipend or salary and does not guarantee employment.',
] as const;

export type Duration = 4;

export const PLANS: Record<Duration, { duration: Duration; fee: number; label: string }> = {
  4: { duration: 4, fee: 700, label: '1 Month · 4 Weeks' },
};
export const DURATIONS: Duration[] = [4];
export const isDuration = (v: unknown): v is Duration => v === 4;
export const feeFor = (d: Duration) => PLANS[d].fee;
export const formatPKR = (n: number) => `PKR ${n.toLocaleString('en-PK')}`;

/** Weights used for the final score. Weekly work 70%, final project 30%. */
export const SCORE_WEIGHTS = { weekly: 0.7, finalProject: 0.3 } as const;

/** A week counts as complete once this share of required task points is approved. */
export const WEEK_COMPLETION_THRESHOLD = 0.7;


