import { SWContext, json, errorResponse } from '../middlewares/types'
import { salesDb } from '../db/sales.db'
import { productsDb } from '../db/products.db'
import { z } from 'zod'

const saleItemSchema = z.object({
  productId: z.number().int().positive(),
  quantity: z.number().int().positive(),
  price: z.number().nonnegative(),
})

const createSaleSchema = z.object({
  items: z.array(saleItemSchema).min(1),
  notes: z.string().trim().max(250).optional(),
})

export async function registerSale(request: Request, _ctx: SWContext): Promise<Response> {
  let raw: unknown

  try {
    raw = await request.clone().json()
  } catch {
    return errorResponse(400, 'VALIDATION_ERROR', 'El cuerpo de la petición no es JSON válido')
  }

  const parsed = createSaleSchema.safeParse(raw)

  if (!parsed.success) {
    return errorResponse(400, 'VALIDATION_ERROR', parsed.error.issues[0]?.message ?? 'Error de validación')
  }

  const dto = parsed.data
  const isPendingSync = typeof raw === 'object' && raw !== null && (raw as { syncPendingSale?: unknown }).syncPendingSale === true

  try {
    const response = await fetch(request.clone())

    if (response.ok) {
      const body = await response.clone().json()

      if (body.success && !isPendingSync) {
        for (const item of dto.items) {
          const product = await productsDb.findById(item.productId)
          if (product) {
            await productsDb.updateStock(item.productId, product.quantity - item.quantity)
          }
        }
      }

      return response
    }

    return response
  } catch {
    // 
  }

  for (const item of dto.items) {
    const product = await productsDb.findById(item.productId)

    if (!product) {
      return errorResponse(
        400,
        'VALIDATION_ERROR',
        `Producto con id ${item.productId} no encontrado en caché local. Abre el inventario con conexión al menos una vez.`
      )
    }

    if (!product.state) {
      return errorResponse(400, 'VALIDATION_ERROR', `El producto "${product.name}" no está activo`)
    }

    if (product.quantity < item.quantity) {
      return errorResponse(
        400,
        'VALIDATION_ERROR',
        `Stock insuficiente para "${product.name}". Disponible: ${product.quantity}`
      )
    }
  }

  for (const item of dto.items) {
    const product = await productsDb.findById(item.productId)
    if (product) {
      await productsDb.updateStock(item.productId, product.quantity - item.quantity)
    }
  }

  const id = await salesDb.save({
    items: dto.items,
    notes: dto.notes,
    createdAt: new Date().toISOString(),
    status: 'pending',
  })

  return json(
    {
      success: true,
      message: 'Venta guardada localmente (sin conexión)',
      data: { id, offline: true },
    },
    201
  )
}
