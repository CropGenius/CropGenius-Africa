self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open("cropgenius-cache").then((cache) => {
      return cache.addAll([
        "/",
        "/dashboard",
        "/icons/icon-192x192.png",
        "/icons/icon-512x512.png",
        "/manifest.json"
      ]);
    })
  );
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => response || fetch(e.request))
  );
});