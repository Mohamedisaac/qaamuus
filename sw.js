const CACHE_NAME = 'dictionary-v2'; // Updated version number
const ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/dictionary.json',
  '/screenshots/desktop.png',
  '/screenshots/mobile.png'
];

// Install event - cache core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Caching core assets');
        return cache.addAll(ASSETS);
      })
      .catch(error => {
        console.log('Cache addAll error:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('Deleting old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// Fetch event with network-first strategy
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        // Update cache with fresh response
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, networkResponse.clone());
        });
        return networkResponse;
      })
      .catch(() => {
        // Fallback to cache
        return caches.match(event.request)
          .then(cachedResponse => {
            return cachedResponse || handleOfflineFallback(event.request);
          });
      })
  );
});

// Offline fallback handler
function handleOfflineFallback(request) {
  if (request.mode === 'navigate') {
    return caches.match('/index.html');
  }
  return new Response('Offline - Content not available', {
    status: 503,
    statusText: 'Offline',
    headers: new Headers({'Content-Type': 'text/plain'})
  });
}