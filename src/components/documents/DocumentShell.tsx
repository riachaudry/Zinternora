import * as React from 'react';
import { LogoMark } from '@/components/Logo';
import { BRAND } from '@/lib/brand';

/** Shared A4 sheet used by the offer letter, certificate and LOR. */
export function DocumentSheet({
  docTitle, docId, issueDate, children, footerNote,
}: {
  docTitle: string; docId: string; issueDate: string;
  children: React.ReactNode; footerNote?: string;
}) {
  return (
    <article data-theme="classic" className="doc-sheet mx-auto w-full max-w-[820px] bg-white p-8 shadow-card sm:p-12"
             style={{ border: '1px solid #DDE5EF' }}>
      <header className="flex flex-wrap items-start justify-between gap-6 border-b-2 border-ink pb-6">
        <div className="flex items-center gap-3">
          <LogoMark size={46} />
          <div>
            <p className="font-display text-2xl font-extrabold tracking-[-.02em] text-ink">THE INTERNORA</p>
            <p className="text-[12px] font-medium text-slate-light">{BRAND.tagline}</p>
            <p className="text-[10.5px] font-bold tracking-[.18em] text-amber-dark">{BRAND.motto}</p>
          </div>
        </div>
        <div className="text-right text-[12px] leading-relaxed">
          <p className="font-display text-[15px] font-bold text-ink">{docTitle}</p>
          <p className="mt-1 text-slate-light">ID</p>
          <p className="font-mono font-semibold text-ink">{docId}</p>
          <p className="mt-1.5 text-slate-light">Issued</p>
          <p className="font-semibold text-ink">{issueDate}</p>
        </div>
      </header>

      <div className="py-8">{children}</div>

      <footer className="border-t border-mist-deep pt-6">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <div className="text-[13px] leading-relaxed">
            <p className="font-semibold text-ink">HR contact</p>
            <p className="text-slate">{BRAND.hr.name}</p>
            <p className="mt-2 font-semibold text-ink">Website</p>
            <p className="text-slate">{BRAND.website}</p>
          </div>
          <div className="flex flex-wrap items-end justify-end gap-8">
            <Signatory person={BRAND.founder} />
            <Signatory person={BRAND.hrManager} />
          </div>
        </div>
        <p className="mt-6 text-[11px] leading-relaxed text-slate-light">
          {footerNote ?? 'This document records participation in a project-based virtual internship program. The Internora is an independent private program and is not affiliated with any government body or university.'}
        </p>
      </footer>
    </article>
  );
}

/**
 * One signatory. A real handwritten signature is shown ONLY if the owner has supplied an image
 * and set its path in BRAND (lib/brand.ts). Otherwise a blank line is left for a wet signature.
 * The Internora never draws or generates a signature.
 */
function Signatory({ person }: { person: { name: string; title: string; signatureImage: string | null } }) {
  return (
    <div className="w-52 text-right">
      <div className="mb-1.5 flex h-16 items-end justify-center border-b border-ink">
        {person.signatureImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={person.signatureImage} alt={`Signature of ${person.name}`} className="max-h-14 w-auto object-contain" />
        )}
      </div>
      <p className="text-[11px] text-slate-light">{person.title}</p>
      <p className="text-[11px] text-slate-light">The Internora</p>
    </div>
  );
}

export function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[11px] font-semibold text-slate-light">{label}</dt>
      <dd className="mt-0.5 text-[15px] font-semibold text-ink">{value}</dd>
    </div>
  );
}

export { PrintButton } from './PrintButton';
