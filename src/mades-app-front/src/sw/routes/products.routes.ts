import { registerRoute } from 'workbox-routing'
import { NetworkOnly } from 'workbox-strategies'
import { withAuth } from '../middlewares/auth.middleware'
import { createContext } from '../middlewares/types'
import { offlineErrorPlugin } from '../plugins/offline-error.plugin'
import { listProducts, getProductById } from '../handlers/products.handler'

const authListProducts    = withAuth(listProducts)
const authGetProductById  = withAuth(getProductById)

export function registerProductsRoutes() {

  registerRoute(
    ({ url }) => url.pathname === '/api/products',
    ({ request }) => authListProducts(request, createContext()),
    'GET'
  )

  registerRoute(
    ({ url }) => /^\/api\/products\/\d+$/.test(url.pathname),
    ({ request }) => authGetProductById(request, createContext()),
    'GET'
  )

  registerRoute(
    ({ url }) => url.pathname.startsWith('/api/products/') || url.pathname.startsWith('/api/sizes/'),
    new NetworkOnly({ plugins: [offlineErrorPlugin] }),
    'POST'
  )

  registerRoute(
    ({ url }) => url.pathname.startsWith('/api/products/') || url.pathname.startsWith('/api/sizes/'),
    new NetworkOnly({ plugins: [offlineErrorPlugin] }),
    'PATCH'
  )
}