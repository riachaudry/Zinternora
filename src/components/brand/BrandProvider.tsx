'use client';
import * as React from 'react';
import { BRAND } from '@/lib/brand';

export type BrandPublic = { name: string; legalName: string; tagline: string; logoUrl: string | null };
const fallback: BrandPublic = { name: BRAND.name, legalName: BRAND.legalName, tagline: BRAND.tagline, logoUrl: null };
const Ctx = React.createContext<BrandPublic>(fallback);

/** Gives client components (logo, install card) the editable brand name and logo from Admin -> Settings. */
export function BrandProvider({ brand, children }: { brand: BrandPublic; children: React.ReactNode }) {
  return <Ctx.Provider value={brand}>{children}</Ctx.Provider>;
}
export const useBrand = () => React.useContext(Ctx);
