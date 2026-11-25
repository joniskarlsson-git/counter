// Service worker: lets the app start and work without network.
// Bump CACHE when you want to force every device to drop old files.
const CACHE = 'poangraknare-v1';
const ASSETS = [
  './',
  'index.html',
  'manifest.webmanifest',
  'fonts/BebasNeue-Regular.ttf',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/icon-maskable-512.png',
  'icons/apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Serve from cache first, refresh the cache in the background so
// updates show up the next time the app is opened.
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  event.respondWith(
    caches.open(CACHE).then((cache) =>
      cache.match(req, { ignoreSearch: true }).then((cached) => {
        const network = fetch(req)
          .then((res) => {
            if (res && res.ok && new URL(req.url).origin === self.location.origin) {
              cache.put(req, res.clone());
            }
            return res;
          })
          .catch(() => cached || cache.match('index.html'));
        return cached || network;
      })
    )
  );
});
