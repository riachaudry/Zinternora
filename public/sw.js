/* Zinternora service worker.
 * Purpose: lets the browser install Zinternora as an app and shows a friendly page when the device is offline.
 * It deliberately caches NOTHING from the signed-in portal, so private student/admin data is never stored on the device
 * and nobody ever sees stale payment, task or document information. */
const CACHE = 'internora-offline-v1';
const OFFLINE_URL = '/offline.html';

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.add(OFFLINE_URL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.mode !== 'navigate') return;               // only page loads; API calls and files go straight to the network
  event.respondWith(fetch(req).catch(() => caches.match(OFFLINE_URL)));
});
