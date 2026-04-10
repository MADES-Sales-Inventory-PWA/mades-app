import { matchCachedRequest } from '../cache/helpers';

declare const self: ServiceWorkerGlobalScope;

type FetchConfig = {
  cacheName: string;
};

type RequestClassification = {
  url: URL;
  isSameOrigin: boolean;
  isNavigation: boolean;
  isStyle: boolean;
  isScript: boolean;
  isFont: boolean;
  isImage: boolean;
  isGoogleStyle: boolean;
};

function isSupportedRequest(request: Request): URL | null {
  if (request.method !== 'GET') {
    return null;
  }

  const url = new URL(request.url);
  const isHttpRequest = url.protocol === 'http:' || url.protocol === 'https:';

  if (!isHttpRequest) {
    return null;
  }

  return url;
}

function classifyRequest(request: Request, url: URL): RequestClassification {
  return {
    url,
    isSameOrigin: url.origin === self.location.origin,
    isNavigation: request.mode === 'navigate',
    isStyle: request.destination === 'style' || url.pathname.endsWith('.css'),
    isScript: request.destination === 'script' || url.pathname.endsWith('.js'),
    isFont: request.destination === 'font' || url.hostname === 'fonts.gstatic.com',
    isImage: request.destination === 'image',
    isGoogleStyle: url.hostname === 'fonts.googleapis.com'
  };
}

function shouldHandleRuntimeRequest(classification: RequestClassification): boolean {
  return (
    classification.isStyle
    || classification.isScript
    || classification.isFont
    || classification.isImage
    || classification.isGoogleStyle
    || classification.isSameOrigin
  );
}

function handleNavigationRequest(request: Request, cacheName: string): Promise<Response> {
  return fetch(request)
    .then((networkResponse) => {
      const responseToCache = networkResponse.clone();
      caches
        .open(cacheName)
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
    });
}

function handleRuntimeRequest(request: Request, url: URL, cacheName: string): Promise<Response> {
  return matchCachedRequest(request, url).then((cachedResponse) => {
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
          .open(cacheName)
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
  });
}

export function registerFetchHandler(config: FetchConfig): void {
  self.addEventListener('fetch', (event: FetchEvent) => {
    const { request } = event;

    const parsedUrl = isSupportedRequest(request);
    if (!parsedUrl) {
      return;
    }

    const classification = classifyRequest(request, parsedUrl);

    if (classification.isNavigation) {
      event.respondWith(handleNavigationRequest(request, config.cacheName));
      return;
    }

    if (!shouldHandleRuntimeRequest(classification)) {
      return;
    }

    event.respondWith(handleRuntimeRequest(request, classification.url, config.cacheName));
  });
}
