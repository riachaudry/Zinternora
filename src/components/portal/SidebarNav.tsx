'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon, NAV_ICON } from './Icon';

export type NavItem = { href: string; label: string; badge?: number };

/** Navy sidebar navigation: icon + label, gold highlight on the active page. */
export function SidebarNav({ nav, onNavigate }: {
  nav: { group: string; items: NavItem[] }[];
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  return (
    <nav className="space-y-5">
      {nav.map((section) => (
        <div key={section.group}>
          <p className="px-3 pb-1.5 text-[10.5px] font-semibold uppercase tracking-[.14em] text-white/40">
            {section.group}
          </p>
          <ul className="space-y-0.5">
            {section.items.map((item) => {
              const active = pathname === item.href
                || (item.href !== '/dashboard' && item.href !== '/admin' && pathname.startsWith(`${item.href}/`));
              return (
                <li key={item.href}>
                  <Link
                    style={active ? { background: 'linear-gradient(90deg,#E6C75A,#C9A13B)' } : undefined}
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? 'page' : undefined}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium transition ${
                      active
                        ? 'font-bold text-[#0B2D5B] shadow-md'
                        : 'text-white/75 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <Icon name={NAV_ICON[item.label] ?? 'layers'} size={18} />
                    <span className="flex-1">{item.label}</span>
                    {!!item.badge && (
                      <span className="rounded-full bg-[rgb(var(--accent-gold))] px-1.5 py-0.5 text-[11px] font-bold text-[#101C33]">
                        {item.badge > 99 ? '99+' : item.badge}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
