import type { Metadata, Viewport } from 'next';
import '@fontsource/plus-jakarta-sans/600.css';
import '@fontsource/plus-jakarta-sans/700.css';
import '@fontsource/plus-jakarta-sans/800.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/playfair-display/600.css';
import '@fontsource/playfair-display/700.css';
import '@fontsource/playfair-display/800.css';
import '@fontsource/great-vibes/400.css';
import './globals.css';
import { getBrand, brandPublic } from '@/lib/settings';
import { BrandProvider } from '@/components/brand/BrandProvider';
import { THEME_INIT_SCRIPT } from '@/lib/theme';
import { SOCIAL_LINKS } from '@/lib/brand';
import { PwaRegister } from '@/components/pwa/PwaRegister';

export async function generateMetadata(): Promise<Metadata> {
  const brand = await getBrand();
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.theinternora.com'),
    title: { default: `${brand.legalName} — ${brand.tagline}`, template: `%s · ${brand.legalName}` },
    description: 'Join The Internora: project-based virtual internships in 16 fields with a mentor-reviewed 4-week program, offer letter, certificate and letter of recommendation. Apply online.',
    keywords: ['virtual internship','online internship with certificate','remote internship','internship Pakistan','The Internora'],
    alternates: { canonical: '/' },
    robots: { index: true, follow: true },
    icons: { icon: [{ url: '/favicon.png?v=3', sizes: '64x64', type: 'image/png' }, { url: '/icons/icon-192.png?v=3', sizes: '192x192', type: 'image/png' }], apple: '/apple-touch-icon.png?v=3' },
    applicationName: brand.name,
    appleWebApp: { capable: true, title: brand.name, statusBarStyle: 'black-translucent' },
    formatDetection: { telephone: false },
    openGraph: { title: brand.legalName, description: brand.tagline, type: 'website', siteName: brand.name, url: '/', images: [{ url: '/icons/icon-512.png', width: 512, height: 512, alt: brand.name }] },
    twitter: { card: 'summary', title: brand.legalName, description: brand.tagline, images: ['/icons/icon-512.png'] },
  };
}

export const viewport: Viewport = { themeColor: '#0B2D5B', width: 'device-width', initialScale: 1, viewportFit: 'cover' };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const brand = await getBrand();
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.theinternora.com';
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'EducationalOrganization', '@id': `${site}/#org`, name: 'The Internora', url: site, logo: { '@type': 'ImageObject', url: `${site}/icons/icon-512.png`, width: 512, height: 512 }, image: `${site}/icons/icon-512.png`, email: brand.supportEmail, sameAs: SOCIAL_LINKS.map((l) => l.href) },
      { '@type': 'WebSite', '@id': `${site}/#website`, url: site, name: 'The Internora', publisher: { '@id': `${site}/#org` } },
    ],
  };
  return (
    <html lang="en" data-theme="classic" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body><BrandProvider brand={brandPublic(brand)}>{children}</BrandProvider><PwaRegister /></body>
    </html>
  );
}