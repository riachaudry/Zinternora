'use client';
import Link from 'next/link';
import { useBrand } from '@/components/brand/BrandProvider';

/** Gold serif wordmark with a small cap icon, shown at the top of the navy sidebar. */
export function SidebarBrand({ href }: { href: string }) {
  const brand = useBrand();
  return (
    <Link href={href} className="flex items-center gap-2.5">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/internora-emblem-gold.png" alt="" width={34} height={34} style={{ width: 34, height: 34 }} className="object-contain" />
      <span className="leading-none">
        <span className="block font-[family-name:var(--font-doc-serif)] text-[21px] font-bold tracking-tight text-[#E6C75A]">{brand.name}</span>
        <span className="mt-1 block text-[8.5px] font-semibold tracking-[.28em] text-[#E6C75A]/80">LEARN · BUILD · GROW</span>
      </span>
    </Link>
  );
}
