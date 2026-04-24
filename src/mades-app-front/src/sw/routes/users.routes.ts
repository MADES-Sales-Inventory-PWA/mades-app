import { registerRoute } from 'workbox-routing'
import { NetworkFirst } from 'workbox-strategies'
import { NetworkOnly } from 'workbox-strategies'
import { CacheableResponsePlugin } from 'workbox-cacheable-response'
import { ExpirationPlugin } from 'workbox-expiration'
import { offlineErrorPlugin } from '../plugins/offline-error.plugin'

export function registerUsersRoutes() {
  registerRoute(
    ({ url, request }) =>
      url.pathname.startsWith('/api/users/') &&
      !url.pathname.includes('admin-exists') &&
      request.method === 'GET',
    new NetworkFirst({
      cacheName: 'api-users',
      networkTimeoutSeconds: 5,
      plugins: [
        new CacheableResponsePlugin({ statuses: [200] }),
        new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 })
      ]
    }),
    'GET'
  )

  registerRoute(
    ({ url }) => url.pathname.startsWith('/api/users/'),
    new NetworkOnly({ plugins: [offlineErrorPlugin] }),
    'POST'
  )

  registerRoute(
    ({ url }) => url.pathname.startsWith('/api/users/'),
    new NetworkOnly({ plugins: [offlineErrorPlugin] }),
    'PATCH'
  )

  registerRoute(
    ({ url }) => url.pathname.startsWith('/api/users/'),
    new NetworkOnly({ plugins: [offlineErrorPlugin] }),
    'DELETE'
  )
}