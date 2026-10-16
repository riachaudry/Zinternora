import type { MetadataRoute } from 'next';
import { ROADMAPS } from '@/lib/roadmaps';

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.theinternora.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ['', '/internships', '/pricing', '/how-it-works', '/about', '/faq', '/contact', '/verify', '/privacy', '/terms'];
  const now = new Date();
  return [
    ...pages.map((p) => ({ url: `${SITE}${p}`, lastModified: now, changeFrequency: 'weekly' as const, priority: p === '' ? 1 : 0.7 })),
    ...ROADMAPS.map((f) => ({ url: `${SITE}/internships/${f.slug}`, lastModified: now, changeFrequency: 'weekly' as const, priority: 0.8 })),
  ];
}
