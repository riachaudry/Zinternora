'use client';
import * as React from 'react';
import { THEME_STORAGE_KEY, isTheme } from '@/lib/theme';

/** Applies the theme saved on the user's account (so it follows them across devices and sign-ins). */
export function ThemeSync({ saved }: { saved: string | null }) {
  React.useEffect(() => {
    if (!isTheme(saved)) return;
    document.documentElement.setAttribute('data-theme', saved);
    try { localStorage.setItem(THEME_STORAGE_KEY, saved); } catch { /* ignore */ }
  }, [saved]);
  return null;
}
