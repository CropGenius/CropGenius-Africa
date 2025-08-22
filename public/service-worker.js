
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open("cg-v2").then(cache =>
      cache.addAll([
        "/",
        "/dashboard",
        "/manifest.json",
        "/lovable-uploads/4a5d3791-0b0d-4617-8f1d-55991d16baf2.png"
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
