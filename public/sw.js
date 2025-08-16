// CropGenius Service Worker - SIMPLE AND WORKING
const CACHE_NAME = 'cropgenius-v1';
const STATIC_FILES = ['/', '/manifest.json'];

// Install
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_FILES))
  );
});

// Activate
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Push notifications
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'CropGenius', {
      body: data.message || 'New notification',
      icon: '/icons/icon-192x192.png',
      data: data
    })
  );
});

// Notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow(event.notification.data?.url || '/')
  );
});

// Fetch - basic caching
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  
  event.respondWith(
    caches.match(event.request).then(response => 
      response || fetch(event.request)
    )
  );
});