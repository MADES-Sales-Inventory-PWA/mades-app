/// <reference lib="webworker" />
/// <reference types="vite-plugin-pwa/vanillajs" />

import { clientsClaim } from 'workbox-core'
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching'
import { registerRoute, NavigationRoute } from 'workbox-routing'
import { NetworkFirst, CacheFirst, StaleWhileRevalidate } from 'workbox-strategies'
import { CacheableResponsePlugin } from 'workbox-cacheable-response'
import { ExpirationPlugin } from 'workbox-expiration'

import { registerAuthRoutes } from './routes/auth.routes'
import { registerUsersRoutes } from './routes/users.routes'
import { registerProductsRoutes } from './routes/products.routes'
import { registerInventoryRoutes } from './routes/inventory.routes'

declare const self: ServiceWorkerGlobalScope

self.skipWaiting()
clientsClaim()

self.addEventListener('fetch', (event) => {
  console.log('[SW] fetch interceptado:', event.request.url)
})

// ── Precaching y limpieza ─────────────────────────────────────────────────────
precacheAndRoute(self.__WB_MANIFEST)
cleanupOutdatedCaches()

// ── Navegación SPA ────────────────────────────────────────────────────────────
registerRoute(
  new NavigationRoute(
    new NetworkFirst({
      cacheName: 'navigations',
      plugins: [new CacheableResponsePlugin({ statuses: [200] })]
    })
  )
)

// ── Fuentes Google ────────────────────────────────────────────────────────────
registerRoute(
  ({ url }) => url.hostname === 'fonts.googleapis.com',
  new StaleWhileRevalidate({ cacheName: 'google-fonts-stylesheets' })
)

registerRoute(
  ({ url }) => url.hostname === 'fonts.gstatic.com',
  new CacheFirst({
    cacheName: 'google-fonts-webfonts',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxAgeSeconds: 60 * 60 * 24 * 365 })
    ]
  })
)

// ── Assets estáticos ──────────────────────────────────────────────────────────
registerRoute(
  ({ request }) => ['style', 'script', 'image'].includes(request.destination),
  new CacheFirst({
    cacheName: 'static-assets',
    plugins: [
      new CacheableResponsePlugin({ statuses: [200] }),
      new ExpirationPlugin({ maxEntries: 100 })
    ]
  })
)

// ── Rutas de API por dominio ──────────────────────────────────────────────────
registerAuthRoutes()
registerUsersRoutes()
registerProductsRoutes()
registerInventoryRoutes()