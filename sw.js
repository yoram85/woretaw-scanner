const CACHE = 'woretaw-scanner-v20260907k';
// Relative, so the app works both at yoram85.github.io/woretaw-scanner/ and at
// the root of a custom domain. (2026-09-07)
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './html5-qrcode.min.js',
  './zxing-reader.js',
  './zxing_reader.wasm'
];

// Install — cache all assets
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

// Activate — clean old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE).map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

// Fetch — network first, fallback to cache
self.addEventListener('fetch', e => {
  // Don't cache API calls
  if (e.request.url.includes('/webhook') || e.request.url.includes('/api/')) {
    return e.respondWith(fetch(e.request));
  }
  e.respondWith(
    fetch(e.request)
      .then(r => {
        // Update cache with fresh version
        const clone = r.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return r;
      })
      .catch(() => caches.match(e.request))
  );
});
