import type { MetadataRoute } from 'next';

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.theinternora.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/dashboard', '/api', '/auth', '/login', '/register'] }],
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}
