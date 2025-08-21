// Redirect to the new service worker
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', () => {
  self.clients.claim();
  // Clear old caches and redirect to new service worker
  caches.keys().then(names => {
    names.forEach(name => caches.delete(name));
  });
});