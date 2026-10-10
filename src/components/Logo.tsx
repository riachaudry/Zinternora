'use client';
import * as React from 'react';
import { useBrand } from '@/components/brand/BrandProvider';

/** Premium Zinternora mark: graduation cap + open book/leaf, representing learning, building and growth. */
export function LogoMark({ size = 36, variant = 'color' }: { size?: number; variant?: 'color' | 'light' | 'dark' }) {
  const navy = variant === 'light' ? '#FFFFFF' : '#0B2D5B';
  const gold = '#D4AF37';
  const paper = variant === 'light' ? '#0B2D5B' : '#F8F5EF';
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" role="img" aria-label="Logo">
      <rect x="2" y="2" width="60" height="60" rx="16" fill={variant === 'light' ? '#FFFFFF' : navy}/>
      <path d="M12 24L32 14L52 24L32 34L12 24Z" fill={gold}/>
      <path d="M16 27V36L32 45L48 36V27L32 36L16 27Z" fill={paper}/>
      <path d="M32 36L43 29.8V42.2L32 49L21 42.2V29.8L32 36Z" fill={gold} opacity=".95"/>
      <path d="M32 36C35.5 32.5 40 29.8 45 28.5C43.8 35.2 39.7 41.4 32 45.5" stroke={variant === 'light' ? '#0B2D5B' : '#FFFFFF'} strokeWidth="2.4" strokeLinecap="round"/>
      <path d="M49 20V28" stroke={gold} strokeWidth="2" strokeLinecap="round"/>
      <circle cx="49" cy="30.5" r="2" fill={gold}/>
    </svg>
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
