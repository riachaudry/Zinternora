'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type Provider = 'google' | 'facebook';

const ICON: Record<Provider, React.ReactNode> = {
  google: (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3A12 12 0 1 1 24 12c3.1 0 5.8 1.2 8 3l5.7-5.7A20 20 0 1 0 44 24c0-1.3-.1-2.7-.4-3.9Z"/>
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8A12 12 0 0 1 24 12c3.1 0 5.8 1.200 8 3l5.700-5.700A20 20 0 0 0 6.300 14.700Z"/>
      <path fill="#4CAF50" d="M24 44c5.200 0 9.900-2 13.400-5.200l-6.200-5.200A12 12 0 0 1 12.700 28l-6.500 5A20 20 0 0 0 24 44Z"/>
      <path fill="#1976D2" d="M43.600 20.100H42V20H24v8h11.300a12 12 0 0 1-4.100 5.600l6.200 5.200C37 39.200 44 34 44 24c0-1.300-.1-2.700-.4-3.900Z"/>
    </svg>
  ),
  facebook: (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#1877F2" d="M24 12a12 12 0 1 0-13.900 11.900v-8.400H7.100V12h3V9.400c0-3 1.800-4.700 4.500-4.700 1.300 0 2.700.2 2.700.2v3h-1.500c-1.500 0-2 .9-2 1.900V12h3.400l-.5 3.500h-2.900v8.400A12 12 0 0 0 24 12Z"/>
    </svg>
  ),
};

/** "Continue with Google / Facebook" — Supabase OAuth. The user's profile row is created by the auth trigger. */
export function SocialButtons({ next }: { next?: string }) {
  const [busy, setBusy] = useState<Provider | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function go(provider: Provider) {
    setError(null); setBusy(provider);
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next ?? '/dashboard')}`;
    const { error: e } = await createClient().auth.signInWithOAuth({ provider, options: { redirectTo } });
    if (e) { setError('Could not start sign-in. Try again or use email.'); setBusy(null); }
  }

  const btn = 'flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-mist-deep bg-white text-[15px] font-semibold text-ink transition hover:border-slate-light disabled:opacity-60';
  return (
    <div className="mt-8 space-y-3">
      <button type="button" className={btn} disabled={!!busy} onClick={() => go('google')}>
        {ICON.google} {busy === 'google' ? 'Opening Google…' : 'Continue with Google'}
      </button>
      <button type="button" className={btn} disabled={!!busy} onClick={() => go('facebook')}>
        {ICON.facebook} {busy === 'facebook' ? 'Opening Facebook…' : 'Continue with Facebook'}
      </button>
      {error && <p role="alert" className="text-[13px] text-danger">{error}</p>}
      <div className="flex items-center gap-3 pt-2 text-[12px] text-slate-light">
        <span className="h-px flex-1 bg-mist-deep" /> or use your email <span className="h-px flex-1 bg-mist-deep" />
      </div>
    </div>
  );
}
