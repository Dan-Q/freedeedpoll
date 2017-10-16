const CACHE = 'fdp-1';

// On activate, clear old caches
self.addEventListener('activate', event => {
  const caches = [CACHE];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return cacheNames.filter(cacheName => !caches.includes(cacheName));
    }).then(cachesToDelete => {
      return Promise.all(cachesToDelete.map(cacheToDelete => {
        return caches.delete(cacheToDelete);
      }));
    }).then(() => self.clients.claim())
  );
});

// Offline-first read-through cache
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.open(CACHE).then(function(cache) {
      return cache.match(event.request).then(function(response) {
        if (response) return response; // found in cache
        return fetch(event.request.clone()).then(function(response) {
          if (response.status < 400) cache.put(event.request, response.clone());
          return response;
        });
      }).catch(function(error) {
        throw error;
      });
    })
  );
});
