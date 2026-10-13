'use client';
import * as React from 'react';
import { useBrand } from '@/components/brand/BrandProvider';

/** Premium The Internora mark: graduation cap + open book/leaf, representing learning, building and growth. */
export function LogoMark({ size = 36 }: { size?: number; variant?: 'color' | 'light' | 'dark' }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/brand/zinternora-mark.png" alt="The Internora" width={size} height={size} style={{ width: size, height: size }} className="rounded-lg object-contain" />
  );
}

export function Logo({
  size = 36, variant = 'color', showTagline = false, className = '',
}: { size?: number; variant?: 'color' | 'light' | 'dark'; showTagline?: boolean; className?: string }) {
  const brand = useBrand();
  const text = variant === 'light' ? 'text-white' : 'text-ink';
  const sub = variant === 'light' ? 'text-white/65' : 'text-slate-light';
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      {brand.logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={brand.logoUrl} alt="" width={size} height={size} style={{ width: size, height: size }} className="brand-mark rounded-lg object-contain" />
      ) : (
        <LogoMark size={size} variant={variant} />
      )}
      <span className="leading-none">
        <span className={`block font-display font-extrabold tracking-[-.025em] ${text}`}
              style={{ fontSize: size * 0.58 }}>
          {brand.name}
        </span>
        {showTagline && (
          <span className={`block mt-1 text-[11px] font-medium ${sub}`}>{brand.tagline}</span>
        )}
      </span>
    </span>
  );
}
