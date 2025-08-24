const CACHE_NAME = 'cropgenius-v1';
const STATIC_CACHE = [
  '/',
  '/manifest.json',
  '/cropgeniuslogo.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_CACHE))
      .catch(() => {}) // Ignore cache failures
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(names => 
      Promise.all(
        names.map(name => 
          name !== CACHE_NAME ? caches.delete(name) : null
        )
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  // Network first for all requests
  e.respondWith(
    fetch(e.request)
      .catch(() => caches.match(e.request))
  );
});
