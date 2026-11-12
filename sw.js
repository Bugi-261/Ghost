/* Ghost offline support: try the network briefly for the newest version, fall back to the saved copy. */
const CACHE = 'ghost-v2';
const FILES = ['./', 'index.html', 'manifest.webmanifest', 'icon-180.png', 'icon-192.png', 'icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  const cached = () => caches.match(req, { ignoreSearch: true }).then(r => r || caches.match('index.html'));
  const fresh = fetch(req).then(r => { if (r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(req, copy)); } return r; });
  e.respondWith(Promise.race([fresh, new Promise((_, no) => setTimeout(no, 2500))]).catch(cached));
  e.waitUntil(fresh.catch(() => {}));
});
