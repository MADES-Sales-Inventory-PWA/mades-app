import { SWContext, json, errorResponse } from '../middlewares/types'
import { productsDb } from '../db/products.db'
import { listProductsQueryRequestSchema, ProductDTO } from './products.schema'
import { StoredProduct } from '../db/client'

// ── List products ─────────────────────────────────────────────────────────────

export async function listProducts(request: Request, _ctx: SWContext): Promise<Response> {
  try {
    const response = await fetch(request.clone())

    if (response.ok) {
      const body = await response.clone().json()

      if (body.success && Array.isArray(body.data)) {
        await productsDb.saveMany(body.data.map(mapToStored))
      }

      return response
    }

    return response
  } catch {
    // Sin conexión — fallback a IndexedDB
  }

  const url = new URL(request.url)
  const filtersParsed = listProductsQueryRequestSchema.safeParse(
    Object.fromEntries(url.searchParams.entries())
  )

  if (!filtersParsed.success) {
    return errorResponse(400, 'VALIDATION_ERROR', filtersParsed.error.issues[0]?.message ?? 'Filtros inválidos')
  }

  const filters = filtersParsed.data
  let all = await productsDb.findAll()

  if (filters.search !== undefined) {
    const term = filters.search.toLowerCase()
    all = all.filter(p => p.name.toLowerCase().includes(term))
  }

  if (filters.state !== undefined) {
    all = all.filter(p => p.state === filters.state)
  }

  if (filters.lowStock === true) {
    all = all.filter(p => p.quantity <= p.minQuantity)
  }

  return json({
    success: true,
    message: 'Productos obtenidos correctamente',
    data: all.map(mapStoredToDTO),
  })
}

// ── Get by id ─────────────────────────────────────────────────────────────────

export async function getProductById(request: Request, _ctx: SWContext): Promise<Response> {
  const id = extractPathId(request.url, '/api/products/')

  if (id === null) {
    return errorResponse(400, 'VALIDATION_ERROR', 'El id del producto no es válido')
  }

  try {
    const response = await fetch(request.clone())

    if (response.ok) {
      const body = await response.clone().json()

      if (body.success && body.data) {
        await productsDb.saveMany([mapToStored(body.data)])
      }

      return response
    }

    return response
  } catch {
    // Sin conexión — fallback a IndexedDB
  }

  const product = await productsDb.findById(id)

  if (!product) {
    return errorResponse(404, 'NOT_FOUND', `El producto con ID ${id} no existe`)
  }

  return json({
    success: true,
    message: 'Producto obtenido correctamente',
    data: mapStoredToDTO(product),
  })
}

// ── Mappers ───────────────────────────────────────────────────────────────────

function mapToStored(p: any): StoredProduct {
  return {
    id:            p.id,
    name:          p.name,
    state:         p.state,
    sizeTypeId:    p.sizeTypeId,
    sizeValueId:   p.sizeValueId,
    barcode:       p.barcode,
    description:   p.description   ?? null,
    imageUrl:      p.imageUrl      ?? null,
    purchasePrice: p.purchasePrice ?? 0,
    quantity:      p.quantity      ?? 0,
    minQuantity:   p.minQuantity   ?? 0,
  }
}

function mapStoredToDTO(p: StoredProduct): ProductDTO {
  return {
    id:            p.id,
    name:          p.name,
    state:         p.state,
    sizeTypeId:    p.sizeTypeId,
    sizeValueId:   p.sizeValueId,
    barcode:       p.barcode,
    description:   p.description,
    imageUrl:      p.imageUrl,
    purchasePrice: p.purchasePrice,
    quantity:      p.quantity,
    minQuantity:   p.minQuantity,
  }
}

// ── Utils ─────────────────────────────────────────────────────────────────────

function extractPathId(url: string, prefix: string): number | null {
  const { pathname } = new URL(url)
  const segment = pathname.replace(prefix, '').split('/')[0]
  const id = Number(segment)
  return Number.isInteger(id) && id > 0 ? id : null
}