/// <reference lib="webworker" />

declare const self: ServiceWorkerGlobalScope;

const CACHE_NAME = 'mades-app-cache-v7';

const BUILD_ASSET_URLS_JSON = '__BUILD_ASSET_URLS_JSON__';

let BUILD_ASSET_URLS: string[] = [];
try {
  BUILD_ASSET_URLS = JSON.parse(BUILD_ASSET_URLS_JSON) as string[];
} catch {
  BUILD_ASSET_URLS = [];
}

const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/icon.png',
  '/favicon.svg',
  ...BUILD_ASSET_URLS
];

async function precacheUrl(cache: Cache, url: string): Promise<void> {
  try {
    const response = await fetch(url, { cache: 'reload' });
    if (response.ok || response.type === 'opaque') {
      await cache.put(url, response);
    }
  } catch {
    // Ignore failed precache entries and keep installing remaining assets.
  }
}

async function matchCachedRequest(request: Request, url: URL): Promise<Response | undefined> {
  const directMatch = await caches.match(request);
  if (directMatch) {
    return directMatch;
  }

  if (url.origin === self.location.origin) {
    const byPathMatch = await caches.match(url.pathname, { ignoreSearch: true });
    if (byPathMatch) {
      return byPathMatch;
    }
  }

  return undefined;
}

self.addEventListener('install', (event: ExtendableEvent) => {
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      await Promise.allSettled(Array.from(new Set(PRECACHE_URLS)).map((url) => precacheUrl(cache, url)));

      void Promise.allSettled(
        [
          'https://fonts.googleapis.com/css2?family=Manrope:wght@700;800&family=Inter:wght@400;500;600&display=swap',
          'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap',
          'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Sora:wght@600;700&display=swap'
        ].map((url) => precacheUrl(cache, url))
      );
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
    matchCachedRequest(request, url).then((cachedResponse) => {
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
