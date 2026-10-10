'use client';
import * as React from 'react';
import { Card, Button } from '@/components/ui';
import { useBrand } from '@/components/brand/BrandProvider';

type InstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }> };

/** "Install Zinternora" card for Settings. Uses the browser's install prompt where available, and shows clear steps otherwise. */
export function InstallApp() {
  const brand = useBrand();
  const [prompt, setPrompt] = React.useState<InstallPromptEvent | null>(null);
  const [installed, setInstalled] = React.useState(false);
  const [platform, setPlatform] = React.useState<'ios' | 'android' | 'desktop'>('desktop');

  React.useEffect(() => {
    const ua = navigator.userAgent;
    const ios = /iphone|ipad|ipod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    setPlatform(ios ? 'ios' : /android/i.test(ua) ? 'android' : 'desktop');
    setInstalled(window.matchMedia('(display-mode: standalone)').matches || (navigator as unknown as { standalone?: boolean }).standalone === true);

    const onPrompt = (e: Event) => { e.preventDefault(); setPrompt(e as InstallPromptEvent); };
    const onInstalled = () => { setInstalled(true); setPrompt(null); };
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => { window.removeEventListener('beforeinstallprompt', onPrompt); window.removeEventListener('appinstalled', onInstalled); };
  }, []);

  async function install() {
    if (!prompt) return;
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === 'accepted') setInstalled(true);
    setPrompt(null);
  }

  return (
    <Card className="p-5">
      <h2 className="font-display text-[15px] font-bold text-ink">Install the {brand.name} app</h2>
      <p className="mt-1 text-[13px] text-slate-light">
        Open {brand.name} like a normal app from your home screen or desktop, with no browser address bar.
      </p>

      {installed ? (
        <p role="status" className="mt-3 text-[13.5px] font-semibold text-signal-dark">{brand.name} is installed on this device.</p>
      ) : prompt ? (
        <div className="mt-4"><Button onClick={install}>Install app</Button></div>
      ) : (
        <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-[13.5px] text-slate">
          {platform === 'ios' && (<>
            <li>Open this website in <b>Safari</b> (installing does not work from other iPhone browsers).</li>
            <li>Tap the <b>Share</b> button (square with an arrow).</li>
            <li>Choose <b>Add to Home Screen</b>, then <b>Add</b>.</li>
          </>)}
          {platform === 'android' && (<>
            <li>Open this website in <b>Chrome</b>.</li>
            <li>Tap the <b>⋮</b> menu at the top right.</li>
            <li>Choose <b>Install app</b> (or <b>Add to Home screen</b>), then confirm.</li>
          </>)}
          {platform === 'desktop' && (<>
            <li>Open this website in <b>Chrome</b> or <b>Edge</b>.</li>
            <li>Click the <b>install icon</b> at the right end of the address bar, or open the <b>⋮</b> menu and choose <b>Install {brand.name}</b>.</li>
            <li>Confirm. {brand.name} opens in its own window and gets a desktop shortcut.</li>
          </>)}
        </ol>
      )}
      {!installed && !prompt && (
        <p className="mt-3 text-[12px] text-slate-light">Installing needs the secure (https) website address, not a local test address.</p>
      )}
    </Card>
  );
}
