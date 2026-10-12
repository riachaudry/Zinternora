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
import { PwaRegister } from '@/components/pwa/PwaRegister';

export async function generateMetadata(): Promise<Metadata> {
  const brand = await getBrand();
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
    title: { default: `${brand.legalName} — ${brand.tagline}`, template: `%s · ${brand.legalName}` },
    description: brand.description,
    icons: { icon: [{ url: '/favicon.png?v=2', sizes: '64x64', type: 'image/png' }, { url: '/icons/icon-192.png?v=2', sizes: '192x192', type: 'image/png' }], apple: '/apple-touch-icon.png?v=2' },
    applicationName: brand.name,
    appleWebApp: { capable: true, title: brand.name, statusBarStyle: 'black-translucent' },
    formatDetection: { telephone: false },
    openGraph: { title: brand.legalName, description: brand.tagline, type: 'website' },
  };
}

export const viewport: Viewport = { themeColor: '#0B2D5B', width: 'device-width', initialScale: 1, viewportFit: 'cover' };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const brand = await getBrand();
  return (
    <html lang="en" data-theme="classic" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} /></head>
      <body><BrandProvider brand={brandPublic(brand)}>{children}</BrandProvider><PwaRegister /></body>
    </html>
  );
}