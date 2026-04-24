import { registerRoute } from 'workbox-routing'
import { withAuth } from '../middlewares/auth.middleware'
import { createContext } from '../middlewares/types'
import {
  listAdjustments,
  getAdjustmentById,
  registerAdjustment,
} from '../handlers/inventory.handler'

const authListAdjustments   = withAuth(listAdjustments)
const authGetAdjustmentById = withAuth(getAdjustmentById)
const authRegisterAdjustment = withAuth(registerAdjustment)

export function registerInventoryRoutes() {
  // GET /api/inventory/adjustments
  registerRoute(
    ({ url }) => url.pathname === '/api/inventory/adjustments',
    ({ request }) => authListAdjustments(request, createContext()),
    'GET'
  )

  // GET /api/inventory/adjustments/:id
  registerRoute(
    ({ url }) => /^\/api\/inventory\/adjustments\/\d+$/.test(url.pathname),
    ({ request }) => authGetAdjustmentById(request, createContext()),
    'GET'
  )

  // POST /api/inventory/adjustments
  registerRoute(
    ({ url }) => url.pathname === '/api/inventory/adjustments',
    ({ request }) => authRegisterAdjustment(request, createContext()),
    'POST'
  )
}