import { registerRoute } from 'workbox-routing'
import { NetworkOnly } from 'workbox-strategies'
import { withAuth } from '../middlewares/auth.middleware'
import { createContext } from '../middlewares/types'
import { offlineErrorPlugin } from '../plugins/offline-error.plugin'
import { listSizeTypes, listSizeValuesByTypeId } from '../handlers/sizes.handler'

const authListSizeTypes         = withAuth(listSizeTypes)
const authListSizeValuesByTypeId = withAuth(listSizeValuesByTypeId)

export function registerSizesRoutes() {
  // GET /api/sizes/types — disponible offline
  registerRoute(
    ({ url }) => url.pathname === '/api/sizes/types',
    ({ request }) => authListSizeTypes(request, createContext()),
    'GET'
  )

  // GET /api/sizes/values/:id — disponible offline
  registerRoute(
    ({ url }) => /^\/api\/sizes\/values\/\d+$/.test(url.pathname),
    ({ request }) => authListSizeValuesByTypeId(request, createContext()),
    'GET'
  )

  // Cualquier escritura a sizes — solo online
  registerRoute(
    ({ url }) => url.pathname.startsWith('/api/sizes/'),
    new NetworkOnly({ plugins: [offlineErrorPlugin] }),
    'POST'
  )

  registerRoute(
    ({ url }) => url.pathname.startsWith('/api/sizes/'),
    new NetworkOnly({ plugins: [offlineErrorPlugin] }),
    'PATCH'
  )
}