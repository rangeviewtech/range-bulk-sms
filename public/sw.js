const CACHE_NAME = 'Range SMS-public-assets-v2';
const ASSETS = ['/images/smart/smart_logo.svg', '/images/smart/smart-icon.svg'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) =>
        Promise.all(
          names
            .filter((name) => name.startsWith('Range SMS-') && name !== CACHE_NAME)
            .map((name) => caches.delete(name))
        )
      )
      .then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  // Never persist HTML, RSC payloads, API data, or authenticated responses offline.
  if (
    event.request.method !== 'GET' ||
    url.origin !== self.location.origin ||
    !(url.pathname.startsWith('/images/') || url.pathname.startsWith('/_next/static/')) ||
    !['image', 'font', 'style', 'script'].includes(event.request.destination)
  )
    return;
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (
          response.ok &&
          response.type === 'basic' &&
          !/private|no-store/i.test(response.headers.get('cache-control') || '')
        ) {
          const cachedResponse = response.clone();
          event.waitUntil(
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, cachedResponse))
          );
        }
        return response;
      })
      .catch(async () => (await caches.match(event.request)) || Response.error())
  );
});
