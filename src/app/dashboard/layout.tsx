import type { Metadata } from 'next';
import { requireStudent } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { PortalShell } from '@/components/portal/PortalShell';
import { getBrand } from '@/lib/settings';
import { ThemeSync } from '@/components/theme/ThemeSync';

export const metadata: Metadata = { title: 'Student Dashboard · The Internora' };
export const dynamic = 'force-dynamic';

const NAV = [
  {
    group: 'Overview',
    items: [
      { href: '/dashboard', label: 'Dashboard' },
      { href: '/dashboard/profile', label: 'My Profile' },
      { href: '/dashboard/internship', label: 'My Internship' },
      { href: '/dashboard/offer-letter', label: 'Offer Letter' },
      { href: '/dashboard/timeline', label: 'Timeline' },
      { href: '/dashboard/calendar', label: 'Calendar' },
    ],
  },
  {
    group: 'Work',
    items: [
      { href: '/dashboard/roadmap', label: 'Weekly Roadmap' },
      { href: '/dashboard/tasks', label: 'Tasks' },
      { href: '/dashboard/submissions', label: 'Submissions' },
      { href: '/dashboard/feedback', label: 'Feedback' },
      { href: '/dashboard/progress', label: 'Progress' },
      { href: '/dashboard/projects', label: 'Projects' },
    ],
  },
  {
    group: 'Outcomes',
    items: [
      { href: '/dashboard/certificate', label: 'Certificate' },
      { href: '/dashboard/lor', label: 'LOR' },
    ],
  },
  {
    group: 'Account',
    items: [
      { href: '/dashboard/notifications', label: 'Notifications' },
      { href: '/dashboard/support', label: 'Support' },
      { href: 'HR_LINK', label: 'Contact HR', external: true },
      { href: '/dashboard/settings', label: 'Settings' },
    ],
  },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireStudent();
  const brand = await getBrand();
  const supabase = createClient();
  // Both lookups run at the same time (one round trip instead of two). The theme lookup tolerates the optional `theme` column not existing yet.
  const [{ count }, { data: themeRow }] = await Promise.all([
    supabase.from('notifications').select('id', { count: 'exact', head: true }).eq('user_id', profile.id).eq('is_read', false),
    supabase.from('profiles').select('theme' as never).eq('id', profile.id).maybeSingle(),
  ]);
  const savedTheme = ((themeRow as { theme?: string } | null)?.theme) ?? null;

  const nav = NAV.map((section) => ({
    ...section,
    items: section.items.map((item) =>
      item.href === '/dashboard/notifications' ? { ...item, badge: count ?? 0 }
      : item.href === 'HR_LINK' ? { ...item, href: brand.hrWhatsappLink, label: `Contact HR ${brand.hrName.split(' ')[0]}` }
      : item),
  }));

  return (
    <PortalShell profile={profile} nav={nav} unread={count ?? 0} base="/dashboard">
      <ThemeSync saved={savedTheme} />
      {children}
    </PortalShell>
  );
}


