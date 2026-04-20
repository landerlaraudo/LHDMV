const CACHE_NAME = 'jyl-v1';
const urlsToCache = [
  '/LHDMV/',
  '/LHDMV/index.html',
  '/LHDMV/styles.css',
  '/LHDMV/script.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});
