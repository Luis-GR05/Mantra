/* MANTRA — service worker: la app abre sin conexión y las fotos se guardan al verlas. */
const VERSION = 'mantra-v2';
const NUCLEO = ['./', 'index.html', 'styles.css', 'app.js', 'data.js', 'manifest.webmanifest', 'icons/icon.svg',
  'vendor/gsap.min.js', 'vendor/ScrollTrigger.min.js',
  'fonts/anton-latin-400-normal.woff2', 'fonts/instrument-serif-latin-400-normal.woff2',
  'fonts/instrument-serif-latin-400-italic.woff2', 'fonts/inter-latin-wght-normal.woff2'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(NUCLEO)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const { request } = e;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin === location.origin) {
    // Archivos propios: red primero para ver cambios, caché si no hay conexión.
    e.respondWith(fetch(request).then(r => {
      const copia = r.clone(); caches.open(VERSION).then(c => c.put(request, copia)); return r;
    }).catch(() => caches.match(request).then(r => r || caches.match('index.html'))));
  } else if (url.hostname === 'images.unsplash.com') {
    e.respondWith(caches.match(request).then(r => r || fetch(request).then(res => {
      const copia = res.clone(); caches.open(VERSION + '-fotos').then(c => c.put(request, copia)); return res;
    })));
  }
});
