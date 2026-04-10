import { precacheUrl } from '../cache/helpers';

declare const self: ServiceWorkerGlobalScope;

type InstallConfig = {
  cacheName: string;
  precacheUrls: string[];
  googleFontStyleUrls: string[];
};

export function registerInstallHandler(config: InstallConfig): void {
  self.addEventListener('install', (event: ExtendableEvent) => {
    self.skipWaiting();

    event.waitUntil(
      caches.open(config.cacheName).then(async (cache) => {
        await Promise.allSettled(Array.from(new Set(config.precacheUrls)).map((url) => precacheUrl(cache, url)));

        void Promise.allSettled(config.googleFontStyleUrls.map((url) => precacheUrl(cache, url)));
      })
    );
  });
}
