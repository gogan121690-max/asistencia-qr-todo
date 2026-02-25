// Service Worker para funcionamiento OFFLINE
const CACHE_NAME = 'asistencia-qr-v1';
const urlsToCache = [
  './',
  './index.html',
  './asistencia-completa.html',
  './calificaciones-completa.html',
  './asistencia-functions.js',
  './calificaciones-functions.js',
  'https://unpkg.com/html5-qrcode',
  'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js'
];

// Instalación del Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Archivos cacheados para offline');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// Activación del Service Worker
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Eliminando caché antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Intercepción de peticiones (estrategia: Cache First, luego Network)
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Si está en caché, devolver desde caché
        if (response) {
          return response;
        }
        
        // Si no está en caché, ir a la red
        return fetch(event.request).then(
          networkResponse => {
            // No cachear Firebase o APIs externas dinámicas
            if (!event.request.url.includes('firebasestorage') && 
                !event.request.url.includes('firestore') &&
                event.request.url.startsWith('http')) {
              caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, networkResponse.clone());
              });
            }
            return networkResponse;
          }
        ).catch(() => {
          // Si falla la red y no está en caché, mostrar página offline básica
          return new Response('Offline - Datos guardados localmente', {
            headers: { 'Content-Type': 'text/plain' }
          });
        });
      })
  );
});
