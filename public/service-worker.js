
const CACHE_NAME = "cg-v5";
const urlsToCache = [
  "/",
  "/dashboard",
  "/manifest.json",
  "/cropgeniuslogo.png"
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then(names => 
      Promise.all(
        names.map(name => name !== CACHE_NAME ? caches.delete(name) : null)
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then(response => response || fetch(e.request))
  );
});
