const CACHE_NAME = 'jyl-v2';

const PRECACHE = [
  '/LHDMV/splash.html',
  '/LHDMV/index.html',
  '/LHDMV/gallery.html',
  '/LHDMV/viajes.html',
  '/LHDMV/splash.jpg',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  const path = url.pathname;

  // Cache-first para imágenes, fuentes, covers de canciones y audio
  const isCacheable =
    path.includes('/links/gallery/') ||
    path.includes('/fonts/') ||
    path.includes('/songs/') ||
    /\.(jpg|jpeg|png|webp|gif|otf|ttf|mp3)$/i.test(path);

  if (isCacheable) {
    event.respondWith(
      caches.open(CACHE_NAME).then(cache =>
        cache.match(event.request).then(cached => {
          if (cached) return cached;
          return fetch(event.request).then(response => {
            if (response.ok) cache.put(event.request, response.clone());
            return response;
          });
        })
      )
    );
    return;
  }

  // Network-first para HTML (páginas siempre actualizadas)
  if (event.request.mode === 'navigate' || /\.html$/.test(path)) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Default: cache first con fallback a red
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});
