import { registerRoute } from 'workbox-routing'
import { NetworkOnly } from 'workbox-strategies'
import { withAuth } from '../middlewares/auth.middleware'
import { createContext } from '../middlewares/types'
import { offlineErrorPlugin } from '../plugins/offline-error.plugin'
import { listProducts, getProductById } from '../handlers/products.handler'

const authListProducts    = withAuth(listProducts)
const authGetProductById  = withAuth(getProductById)

export function registerProductsRoutes() {
  // GET /api/products  (lista con filtros)
  registerRoute(
    ({ url }) => url.pathname === '/api/products',
    ({ request }) => authListProducts(request, createContext()),
    'GET'
  )

  // GET /api/products/:id
  registerRoute(
    ({ url }) => /^\/api\/products\/\d+$/.test(url.pathname),
    ({ request }) => authGetProductById(request, createContext()),
    'GET'
  )

  // GET /api/sizes/* — solo red, sin fallback offline
  registerRoute(
    ({ url }) => url.pathname.startsWith('/api/sizes/'),
    new NetworkOnly({ plugins: [offlineErrorPlugin] }),
    'GET'
  )

  // POST y PATCH a productos y tallas — siempre requieren conexión
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