import { registerRoute } from 'workbox-routing'
import { NetworkOnly } from 'workbox-strategies'
import { withAuth } from '../middlewares/auth.middleware'
import { createContext } from '../middlewares/types'
import { offlineErrorPlugin } from '../plugins/offline-error.plugin'
import { listSizeTypes, listSizeValuesByTypeId } from '../handlers/sizes.handler'

const authListSizeTypes         = withAuth(listSizeTypes)
const authListSizeValuesByTypeId = withAuth(listSizeValuesByTypeId)

export function registerSizesRoutes() {

  registerRoute(
    ({ url }) => url.pathname === '/api/sizes/types',
    ({ request }) => authListSizeTypes(request, createContext()),
    'GET'
  )

  registerRoute(
    ({ url }) => /^\/api\/sizes\/values\/\d+$/.test(url.pathname),
    ({ request }) => authListSizeValuesByTypeId(request, createContext()),
    'GET'
  )

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