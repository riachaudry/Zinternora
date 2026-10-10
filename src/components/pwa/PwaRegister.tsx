'use client';
import * as React from 'react';

/** Registers the service worker that makes the app installable. Renders nothing. */
export function PwaRegister() {
  React.useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    const register = () => { navigator.serviceWorker.register('/sw.js').catch(() => { /* installability is optional; ignore */ }); };
    if (document.readyState === 'complete') register();
    else window.addEventListener('load', register, { once: true });
  }, []);
  return null;
}
