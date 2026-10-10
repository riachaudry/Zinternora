import type { MetadataRoute } from 'next';
import { getBrand } from '@/lib/settings';

/** Web app manifest: makes Zinternora installable on phones (Add to Home Screen) and on laptops (Chrome/Edge "Install"). */
export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const brand = await getBrand();
  return {
    name: `${brand.legalName} — ${brand.tagline}`,
    short_name: brand.name,
    description: brand.description,
    id: '/',
    start_url: '/dashboard',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait-primary',
    background_color: '#FFFFFF',
    theme_color: '#0B2D5B',
    categories: ['education', 'productivity'],
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    shortcuts: [
      { name: 'My tasks', url: '/dashboard/tasks' },
      { name: 'Calendar', url: '/dashboard/calendar' },
    ],
  };
}
