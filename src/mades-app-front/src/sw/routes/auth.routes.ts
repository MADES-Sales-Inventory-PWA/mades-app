import { registerRoute } from 'workbox-routing'
import { NetworkOnly } from 'workbox-strategies'
import { offlineErrorPlugin } from '../plugins/offline-error.plugin'

export function registerAuthRoutes() {
  registerRoute(
    ({ url }) => url.pathname.startsWith('/api/auth/'),
    new NetworkOnly({ plugins: [offlineErrorPlugin] }),
    'POST'
  )

  registerRoute(
    ({ url }) => url.pathname.startsWith('/api/users/admin-exists'),
    new NetworkOnly({ plugins: [offlineErrorPlugin] }),
    'GET'
  )
}