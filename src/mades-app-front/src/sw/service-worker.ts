/// <reference lib="webworker" />

declare const self: ServiceWorkerGlobalScope;
declare const __BUILD_ASSET_URLS_JSON__: string;

import { CACHE_NAME, buildPrecacheUrls, GOOGLE_FONT_STYLE_URLS } from './cache/config.ts';
import { registerActivateHandler } from './events/activate.ts';
import { registerFetchHandler } from './events/fetch.ts';
import { registerInstallHandler } from './events/install.ts';

let BUILD_ASSET_URLS: string[] = [];
try {
  BUILD_ASSET_URLS = JSON.parse(__BUILD_ASSET_URLS_JSON__) as string[];
} catch {
  BUILD_ASSET_URLS = [];
}

const PRECACHE_URLS = buildPrecacheUrls(BUILD_ASSET_URLS);

registerInstallHandler({
  cacheName: CACHE_NAME,
  precacheUrls: PRECACHE_URLS,
  googleFontStyleUrls: GOOGLE_FONT_STYLE_URLS
});

registerActivateHandler({ cacheName: CACHE_NAME });
registerFetchHandler({ cacheName: CACHE_NAME });
