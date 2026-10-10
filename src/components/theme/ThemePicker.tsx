'use client';
import * as React from 'react';
import { THEMES, DEFAULT_THEME, THEME_STORAGE_KEY, isTheme, type ThemeId } from '@/lib/theme';
import { Card } from '@/components/ui';

function applyTheme(t: ThemeId) {
  document.documentElement.setAttribute('data-theme', t);
  try { localStorage.setItem(THEME_STORAGE_KEY, t); } catch { /* storage may be blocked; the choice still applies for this visit */ }
}

/** Theme selector for the Settings pages (students and admins). */
export function ThemePicker() {
  const [theme, setTheme] = React.useState<ThemeId>(DEFAULT_THEME);
  const [note, setNote] = React.useState<string | null>(null);

  React.useEffect(() => {
    const current = document.documentElement.getAttribute('data-theme');
    if (isTheme(current)) setTheme(current);
  }, []);

  async function choose(t: ThemeId) {
    setTheme(t); applyTheme(t); setNote(null);
    try {
      const res = await fetch('/api/profile/theme', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ theme: t }),
      });
      const data = await res.json().catch(() => ({}));
      setNote(res.ok && data?.persisted === false
        ? 'Saved on this device. (Account-wide saving needs the theme database update.)'
        : res.ok ? 'Theme saved to your account.' : 'Saved on this device only.');
    } catch { setNote('Saved on this device only.'); }
  }

  return (
    <Card className="p-5">
      <h2 className="font-display text-[15px] font-bold text-ink">Theme</h2>
      <p className="mt-1 text-[13px] text-slate-light">Choose how your dashboard looks. Official documents always keep the classic Zinternora design.</p>
      <div role="radiogroup" aria-label="Dashboard theme" className="mt-4 grid gap-3 sm:grid-cols-3">
        {THEMES.map((t) => {
          const active = theme === t.id;
          return (
            <button key={t.id} type="button" role="radio" aria-checked={active} onClick={() => choose(t.id)}
                    className={`rounded-xl border p-4 text-left transition ${
                      active ? 'border-signal ring-2 ring-signal/30' : 'border-mist-deep hover:border-slate-light'}`}>
              <span data-theme={t.id} aria-hidden="true"
                    className="mb-3 flex h-12 overflow-hidden rounded-lg border border-mist-deep">
                <span className="w-1/3" style={{ background: 'rgb(var(--ink-solid))' }} />
                <span className="w-1/3" style={{ background: 'rgb(var(--surface))' }} />
                <span className="w-1/3" style={{ background: 'rgb(var(--accent-gold))' }} />
              </span>
              <span className="block text-[14px] font-semibold text-ink">{t.label}{active ? ' · Selected' : ''}</span>
              <span className="mt-0.5 block text-[12.5px] text-slate-light">{t.hint}</span>
            </button>
          );
        })}
      </div>
      {note && <p role="status" className="mt-3 text-[13px] text-slate">{note}</p>}
    </Card>
  );
}
