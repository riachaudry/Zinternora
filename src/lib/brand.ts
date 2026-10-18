/** Single source of truth for every piece of official The Internora information. */
export const BRAND = {
  name: 'The Internora',
  legalName: 'THE INTERNORA',
  tagline: 'Virtual Internships. Real Experience.',
  motto: 'LEARN | BUILD | GROW',
  // Navy & gold graduation-cap emblem. `logoMark` = the symbol only (used next to the name); `logoSealMark` = navy version for the gold seal.
  logoMark: '/brand/zinternora-mark.png',
  logoSealMark: '/brand/zinternora-mark-navy.png',
  logoEmblem: '/brand/zinternora-emblem.png',
  website: 'www.theinternora.com',
  supportEmail: 'theinternorasupport@gmail.com',
  description: 'Project-Based Virtual Internships & Career Experience',
  // Real signature images supplied by the owners (public/signatures). Set a value to null to leave the line blank for a wet signature.
  founder: { name: 'Alee Chaudhry', title: 'Founder & CEO', signatureImage: '/signatures/alee-chaudhry.png' as string | null },
  hrManager: { name: 'Ria Chaudhry', title: 'HR Manager', signatureImage: '/signatures/ria-chaudhry.png' as string | null },
  hr: { name: 'Ria Chaudhry', whatsapp: '+966 54 786 0296', whatsappLink: 'https://wa.me/966547860296' },
  payment: {
    accountName: 'Rahat Maqsood',
    bankName: 'Bank Islami',
    iban: 'PK33BKIP9999903049666343',
    // Second account (Easypaisa).
    account2Name: 'Rahat',
    bank2Name: 'Easypaisa',
    iban2: 'PK03TMFB0000000070379118',
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
  'The Internora does not pay a stipend or salary and does not guarantee employment.',
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



/** The Internora company page. Every student must follow it and tag it in their task post. */
export const LINKEDIN_URL = 'https://www.linkedin.com/company/the-internora/';
export const FACEBOOK_URL = 'https://www.facebook.com/share/1EsoR1ukqg/';
export const TIKTOK_URL = 'https://vm.tiktok.com/ZN8BwuqXs/';
/** Official The Internora pages, shown in the footer, contact page, task form and emails. */
export const SOCIAL_LINKS = [
  { label: 'LinkedIn', href: LINKEDIN_URL },
  { label: 'Facebook', href: FACEBOOK_URL },
  { label: 'TikTok', href: TIKTOK_URL },
] as const;
