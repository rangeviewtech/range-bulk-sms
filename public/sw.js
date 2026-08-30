const CACHE_NAME = 'trakzee-pwa-v1';

const PRECACHE_ASSETS = [
  '/',
  '/login',
  '/images/smart/smart_logo.svg',
  '/images/smart/smart-icon.svg',
  '/images/smart/wl-language.svg',
  '/images/smart/wl-down.svg',
  '/images/smart/wlf-eye-close.png',
  '/images/smart/wlf-eye-open.png',
  '/images/smart/prod_image1.jpg',
  '/images/smart/prod_image2.png',
  '/images/smart/prod_image3.jpg',
  '/images/smart/prod_image4.jpg',
];

// Install Event - Precache App Shell Assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event - Clean Old Caches & Take Control Immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Network-First Strategy with Cache Fallback for Offline Access
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  // Ignore browser-extension and chrome-extension schemes
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Clone and store valid responses in cache
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Fallback to cache if network fails (offline)
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // If HTML page requested offline, return cached /login or /
          if (event.request.headers.get('accept')?.includes('text/html')) {
            return caches.match('/login');
          }
        });
      })
  );
});
