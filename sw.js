const CACHE = 'ub-projects-v21';
const ASSETS = ['/', '/index.html', '/styles.css?v=11', '/app.js?v=11', '/manifest.json', '/icon-192.png', '/icon-512.png', '/splash-750x1334.png', '/splash-1170x2532.png', '/splash-1179x2556.png', '/splash-1284x2778.png', '/splash-1290x2796.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
