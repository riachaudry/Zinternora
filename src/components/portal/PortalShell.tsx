import * as React from 'react';
import { SidebarNav, type NavItem } from './SidebarNav';
import { SidebarBrand } from './SidebarBrand';
import { PortalHeader } from './PortalHeader';
import type { SessionProfile } from '@/lib/auth';

/** Shared chrome for both portals: navy sidebar + top bar. */
export function PortalShell({
  profile, nav, unread, base, children,
}: {
  profile: SessionProfile;
  nav: { group: string; items: NavItem[] }[];
  unread: number;
  base: '/dashboard' | '/admin';
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-mist/60">
      <div className="flex w-full">
        <aside className="sticky top-0 hidden h-screen w-[256px] shrink-0 flex-col bg-ink-deep lg:flex">
          <div className="flex h-[72px] items-center px-6"><SidebarBrand href={base} /></div>
          <div className="flex-1 overflow-y-auto px-3 pb-4 pt-2">
            <SidebarNav nav={nav} />
          </div>
          <div className="relative m-3 overflow-hidden rounded-2xl p-4" style={{ background: 'linear-gradient(160deg,rgba(212,175,55,.18),rgba(255,255,255,.04))' }}>
            <svg aria-hidden="true" width="64" height="72" viewBox="0 0 64 72" fill="none" className="absolute bottom-0 right-2 opacity-80">
              <path d="M32 70V30" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" />
              <path d="M32 44C18 42 10 32 12 18c14 2 22 12 20 26ZM32 36c0-14 8-24 22-26 2 14-6 24-22 26ZM32 58c-10-1-16-8-15-18 10 1 16 8 15 18Z" fill="#D4AF37" opacity=".85" />
            </svg>
            <p className="relative font-[family-name:var(--font-doc-serif)] text-[15px] font-bold leading-snug text-[#E6C75A]">Grow Your Skills<br /><span className="text-white/80">Build Your Future</span></p>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <PortalHeader profile={profile} unread={unread} base={base} nav={nav} />
          <main className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6 lg:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
