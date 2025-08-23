
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open("cg-v3").then(cache =>
      cache.addAll([
        "/",
        "/dashboard",
        "/manifest.json",
        "/cropgeniuslogo.png"
      ])
    )
  );
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then(response =>
      response || fetch(e.request)
    )
  );
});
