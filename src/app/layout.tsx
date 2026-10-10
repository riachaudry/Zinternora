import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans, Inter, Playfair_Display, Great_Vibes } from 'next/font/google';
import './globals.css';
import { getBrand, brandPublic } from '@/lib/settings';
import { BrandProvider } from '@/components/brand/BrandProvider';
import { THEME_INIT_SCRIPT } from '@/lib/theme';
import { PwaRegister } from '@/components/pwa/PwaRegister';

const display = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-display', weight: ['600', '700', '800'] });
const docSerif = Playfair_Display({ subsets: ['latin'], variable: '--font-doc-serif', weight: ['600', '700', '800'] });
const docScript = Great_Vibes({ subsets: ['latin'], variable: '--font-doc-script', weight: ['400'] });
const body = Inter({ subsets: ['latin'], variable: '--font-body', weight: ['400', '500', '600'] });

export async function generateMetadata(): Promise<Metadata> {
  const brand = await getBrand();
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
    title: { default: `${brand.legalName} — ${brand.tagline}`, template: `%s · ${brand.legalName}` },
    description: brand.description,
    icons: { icon: [{ url: '/favicon.png', sizes: '64x64', type: 'image/png' }, { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' }], apple: '/apple-touch-icon.png' },
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
    <html lang="en" data-theme="classic" suppressHydrationWarning className={`${display.variable} ${body.variable} ${docSerif.variable} ${docScript.variable}`}>
      <head><script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} /></head>
      <body><BrandProvider brand={brandPublic(brand)}>{children}</BrandProvider><PwaRegister /></body>
    </html>
  );
}


