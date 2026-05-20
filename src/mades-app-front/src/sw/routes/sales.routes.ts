import { registerRoute } from 'workbox-routing'
import { withAuth } from '../middlewares/auth.middleware'
import { createContext } from '../middlewares/types'
import { registerSale } from '../handlers/sales.handler'

const authRegisterSale = withAuth(registerSale)

export function registerSalesRoutes() {
  registerRoute(
    ({ url }) => url.pathname === '/api/sales',
    ({ request }) => authRegisterSale(request, createContext()),
    'POST'
  )
}
