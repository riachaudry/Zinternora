import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { TRUST_STATEMENTS, SOCIAL_LINKS } from '@/lib/brand';
import { getBrand } from '@/lib/settings';

const COLUMNS = [
  { title: 'Program', links: [['Internships', '/internships'], ['How it works', '/how-it-works'], ['Pricing', '/pricing']] },
  { title: 'Verify', links: [['Verify a certificate', '/verify/certificate'], ['Verify an offer letter', '/verify/offer-letter'], ['FAQ', '/faq']] },
  { title: 'Company', links: [['About', '/about'], ['Contact', '/contact'], ['Sign in', '/login'], ['Apply now', '/register'], ['Privacy Policy', '/privacy'], ['Terms of Service', '/terms']] },
];

export async function Footer() {
  const brand = await getBrand();
  return (
    <footer className="mt-24 bg-ink text-white/70">
      <div className="wrap grid gap-10 py-14 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <Logo size={32} variant="light" showTagline />
          <p className="mt-4 max-w-xs text-[14px] leading-relaxed">{brand.description}</p>
          <div className="mt-5 text-[14px]">
            <p className="font-semibold text-white">HR: {brand.hrName}</p>
            <a href={brand.hrWhatsappLink} className="mt-1 inline-block hover:text-white">
              Chat with HR on WhatsApp
            </a>
          </div>
          <div className="mt-5">
            <p className="text-[13px] font-semibold text-white">Follow The Internora</p>
            <ul className="mt-2 flex flex-wrap gap-2">
              {SOCIAL_LINKS.map((l) => (
                <li key={l.label}>
                  <a href={l.href} target="_blank" rel="noopener noreferrer"
                     className="inline-block rounded-full border border-white/25 px-3.5 py-1.5 text-[13px] font-semibold text-white hover:bg-white/10">{l.label}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {COLUMNS.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <h3 className="text-[13px] font-semibold text-white">{col.title}</h3>
            <ul className="mt-3 space-y-2 text-[14px]">
              {col.links.map(([label, href]) => (
                <li key={href}><Link href={href} className="hover:text-white">{label}</Link></li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="border-t border-white/10">
        <div className="wrap py-7 text-[13px] leading-relaxed">
          <ul className="grid gap-1.5 sm:grid-cols-2">
            {TRUST_STATEMENTS.map((s) => <li key={s}>{s}</li>)}
          </ul>
          <p className="mt-5 text-white/45">
            © {new Date().getFullYear()} {brand.legalName}. {brand.name} is an independent
            private training program. It is not affiliated with any government body or
            university, and it does not offer accredited qualifications or guaranteed employment.
          </p>
        </div>
      </div>
    </footer>
  );
}


