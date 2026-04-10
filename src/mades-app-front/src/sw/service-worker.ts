/// <reference lib="webworker" />

declare const self: ServiceWorkerGlobalScope;

const CACHE_NAME = 'mades-app-cache-v4';

const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/icon.png',
  '/favicon.svg',
  'https://fonts.googleapis.com/css2?family=Manrope:wght@700;800&family=Inter:wght@400;500;600&display=swap',
  'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap',
  'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Sora:wght@600;700&display=swap'
];

const ASSET_PATH_REGEX = /(?:src|href)=["'](\/assets\/[^"']+)["']/g;

async function precacheBuildAssets(cache: Cache): Promise<void> {
  const response = await fetch('/index.html', { cache: 'no-store' });
  if (!response.ok) {
    return;
  }

  const html = await response.text();
  const assets = new Set<string>();
  let match = ASSET_PATH_REGEX.exec(html);

  while (match) {
    assets.add(match[1]);
    match = ASSET_PATH_REGEX.exec(html);
  }

  if (assets.size === 0) {
    return;
  }

  await Promise.allSettled(Array.from(assets).map((assetUrl) => cache.add(assetUrl)));
}

self.addEventListener('install', (event: ExtendableEvent) => {
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      await Promise.allSettled(PRECACHE_URLS.map((url) => cache.add(url)));
      await precacheBuildAssets(cache);
    })
  );
});

self.addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => cacheName !== CACHE_NAME)
            .map((cacheName) => caches.delete(cacheName))
        );
      })
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event: FetchEvent) => {
  const { request } = event;

  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);
  const isHttpRequest = url.protocol === 'http:' || url.protocol === 'https:';

  if (!isHttpRequest) {
    return;
  }

  const isSameOrigin = url.origin === self.location.origin;
  const isNavigation = request.mode === 'navigate';
  const isStyle = request.destination === 'style' || url.pathname.endsWith('.css');
  const isScript = request.destination === 'script' || url.pathname.endsWith('.js');
  const isFont = request.destination === 'font' || url.hostname === 'fonts.gstatic.com';
  const isImage = request.destination === 'image';
  const isGoogleStyle = url.hostname === 'fonts.googleapis.com';

  if (isNavigation) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          const responseToCache = networkResponse.clone();
          caches
            .open(CACHE_NAME)
            .then((cache) => cache.put('/index.html', responseToCache))
            .catch(() => {
              // Ignore cache write failures to keep navigation working.
            });
          return networkResponse;
        })
        .catch(async () => {
          const cachedIndex = await caches.match('/index.html');
          if (cachedIndex) {
            return cachedIndex;
          }

          return new Response('Offline', {
            status: 503,
            statusText: 'Offline and no cached HTML'
          });
        })
    );
    return;
  }

  const shouldCacheRuntime = isStyle || isScript || isFont || isImage || isGoogleStyle || isSameOrigin;

  if (!shouldCacheRuntime) {
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request)
        .then((networkResponse) => {
          if (!networkResponse || (!networkResponse.ok && networkResponse.type !== 'opaque')) {
            return networkResponse;
          }

          const responseToCache = networkResponse.clone();
          caches
            .open(CACHE_NAME)
            .then((cache) => cache.put(request, responseToCache))
            .catch(() => {
              // Ignore cache write failures to keep runtime responses flowing.
            });

          return networkResponse;
        })
        .catch(() => {
          return new Response('', {
            status: 503,
            statusText: 'Offline and resource not cached'
          });
        });
    })
  );
});
