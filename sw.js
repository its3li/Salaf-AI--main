const CACHE_NAME = 'salaf-ai-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/index.tsx',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Amiri+Quran&family=Cairo:wght@300;400;600;700&family=Amiri:ital,wght@0,400;0,700;1,400&display=swap'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      // Try to find in cache
      const cachedResponse = await cache.match(event.request);
      
      // Network fetch promise
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        // Cache valid responses for next time
        if (networkResponse && networkResponse.status === 200) {
          cache.put(event.request, networkResponse.clone());
        }
        return networkResponse;
      }).catch(() => {
        // If network fails and we don't have a cache, we might want to return a fallback
        // But for this simple app, returning undefined lets the browser handle the error
      });

      // Stale-While-Revalidate: Return cached if available, else wait for network
      return cachedResponse || fetchPromise;
    })
  );
});