declare const self: ServiceWorkerGlobalScope;

type ActivateConfig = {
  cacheName: string;
};

export function registerActivateHandler(config: ActivateConfig): void {
  self.addEventListener('activate', (event: ExtendableEvent) => {
    event.waitUntil(
      caches
        .keys()
        .then((cacheNames) => {
          return Promise.all(
            cacheNames
              .filter((cacheName) => cacheName !== config.cacheName)
              .map((cacheName) => caches.delete(cacheName))
          );
        })
        .then(() => self.clients.claim())
    );
  });
}
