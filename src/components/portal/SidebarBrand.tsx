'use client';
import Link from 'next/link';
import { useBrand } from '@/components/brand/BrandProvider';

/** Gold serif wordmark with a small cap icon, shown at the top of the navy sidebar. */
export function SidebarBrand({ href }: { href: string }) {
  const brand = useBrand();
  return (
    <Link href={href} className="flex items-center gap-2.5">
      <svg width="30" height="30" viewBox="0 0 64 64" fill="none" aria-hidden="true">
        <path d="M8 26 32 14l24 12-24 12L8 26Z" fill="#D4AF37" />
        <path d="M16 31v10l16 8 16-8V31l-16 8-16-8Z" fill="#D4AF37" opacity=".75" />
        <path d="M54 28v12" stroke="#D4AF37" strokeWidth="3" strokeLinecap="round" />
      </svg>
      <span className="leading-none">
        <span className="block font-[family-name:var(--font-doc-serif)] text-[21px] font-bold tracking-tight text-[#E6C75A]">{brand.name}</span>
        <span className="mt-1 block text-[8.5px] font-semibold tracking-[.28em] text-[#E6C75A]/80">LEARN · BUILD · GROW</span>
      </span>
    </Link>
  );
}
