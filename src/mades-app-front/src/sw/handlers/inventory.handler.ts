import { SWContext, json, errorResponse } from '../middlewares/types'
import { inventoryDb } from '../db/inventory.db'
import { productsDb } from '../db/products.db'
import {
  createInventoryAdjustmentSchema,
  adjustmentFiltersSchema,
  CreateInventoryAdjustmentDTO,
} from './inventory.schema'
import { StoredAdjustment } from '../db/client'

// ── List adjustments ──────────────────────────────────────────────────────────

export async function listAdjustments(request: Request, ctx: SWContext): Promise<Response> {
  // Intenta red primero y sincroniza IndexedDB
  try {
    const response = await fetch(request.clone())

    if (response.ok) {
      const body = await response.clone().json()

      if (body.success && Array.isArray(body.data)) {
        await inventoryDb.saveMany(body.data.map(mapListItemToStored))
      }

      return response
    }

    // Error del servidor (4xx/5xx) — lo devuelve tal cual
    return response
  } catch {
    // Sin conexión — fallback a IndexedDB
  }

  const url = new URL(request.url)
  const filtersParsed = adjustmentFiltersSchema.safeParse(
    Object.fromEntries(url.searchParams.entries())
  )

  if (!filtersParsed.success) {
    return errorResponse(400, 'VALIDATION_ERROR', filtersParsed.error.issues[0]?.message ?? 'Filtros inválidos')
  }

  const filters = filtersParsed.data
  let all = await inventoryDb.findAll()

  if (filters.productId !== undefined) {
    all = all.filter(a => a.productId === filters.productId)
  }
  if (filters.type) {
    all = all.filter(a => a.type === filters.type)
  }
  if (filters.reason) {
    all = all.filter(a => a.description.includes(filters.reason!))
  }
  if (filters.from) {
    const from = new Date(filters.from)
    all = all.filter(a => new Date(a.createdAt) >= from)
  }
  if (filters.to) {
    const to = new Date(filters.to)
    all = all.filter(a => new Date(a.createdAt) <= to)
  }

  all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const total = all.length
  const skip = (filters.page - 1) * filters.pageSize
  const page = all.slice(skip, skip + filters.pageSize)

  return json({
    success: true,
    data: page.map(mapStoredToListItem),
    meta: { total, page: filters.page, pageSize: filters.pageSize },
  })
}

// ── Get by id ─────────────────────────────────────────────────────────────────

export async function getAdjustmentById(request: Request, ctx: SWContext): Promise<Response> {
  const id = extractPathId(request.url, '/api/inventory/adjustments/')

  if (id === null) {
    return errorResponse(400, 'VALIDATION_ERROR', 'El id del ajuste no es válido')
  }

  try {
    const response = await fetch(request.clone())

    if (response.ok) {
      const body = await response.clone().json()

      if (body.success && body.data) {
        await inventoryDb.save(mapDetailToStored(body.data))
      }

      return response
    }

    return response
  } catch {
    // Sin conexión — fallback a IndexedDB
  }

  const adjustment = await inventoryDb.findById(id)

  if (!adjustment) {
    return errorResponse(404, 'RESOURCE_NOT_FOUND', 'Ajuste no encontrado')
  }

  return json({ success: true, data: mapStoredToDetail(adjustment) })
}

// ── Register adjustment ───────────────────────────────────────────────────────

export async function registerAdjustment(request: Request, ctx: SWContext): Promise<Response> {
  let raw: unknown

  try {
    raw = await request.clone().json()
  } catch {
    return errorResponse(400, 'VALIDATION_ERROR', 'El cuerpo de la petición no es JSON válido')
  }

  const parsed = createInventoryAdjustmentSchema.safeParse(raw)

  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? 'Error de validación'
    return errorResponse(400, 'VALIDATION_ERROR', message)
  }

  const dto: CreateInventoryAdjustmentDTO = parsed.data

  // Intenta red primero
  try {
    const response = await fetch(request.clone())

    if (response.ok) {
      const body = await response.clone().json()

      if (body.success && body.data) {
        const product = await productsDb.findById(dto.productId)
        await inventoryDb.save({
          id: body.data.id,
          productId: body.data.productId,
          barcode: body.data.barcode,
          productName: product?.name ?? 'Producto',
          type: dto.type,
          quantity: dto.quantity,
          description: buildDescription(dto),
          previousQty: body.data.previousQty,
          newQty: body.data.newQty,
          createdAt: new Date().toISOString(),
        })
        await productsDb.updateStock(dto.productId, body.data.newQty)
      }

      return response
    }

    return response
  } catch {
    // Sin conexión — ejecuta localmente
  }

  const product = await productsDb.findById(dto.productId)

  if (!product) {
    return errorResponse(
      400,
      'VALIDATION_ERROR',
      'Producto no encontrado en caché local. Navega al módulo de productos con conexión al menos una vez.'
    )
  }

  const previousQty = product.quantity
  const newQty = dto.type === 'LOSS'
    ? previousQty - dto.quantity
    : previousQty + dto.quantity

  if (newQty < 0) {
    return errorResponse(400, 'VALIDATION_ERROR', 'Stock insuficiente para registrar la pérdida')
  }

  const localId = await inventoryDb.nextLocalId()

  const stored: StoredAdjustment = {
    id: localId,
    productId: dto.productId,
    barcode: product.barcode,
    productName: product.name,
    type: dto.type,
    quantity: dto.quantity,
    description: buildDescription(dto),
    previousQty,
    newQty,
    createdAt: new Date().toISOString(),
    isLocal: true,
  }

  await inventoryDb.save(stored)
  await productsDb.updateStock(dto.productId, newQty)

  return json(
    {
      success: true,
      message: 'Ajuste registrado localmente (sin conexión)',
      data: { id: localId, productId: dto.productId, previousQty, newQty },
    },
    201
  )
}

// ── Mappers ───────────────────────────────────────────────────────────────────

function mapListItemToStored(a: any): StoredAdjustment {
  return {
    id: a.id,
    productId: a.productId,
    barcode: a.barcode ?? 'N/A',
    productName: 'Producto',
    type: a.type,
    quantity: a.quantity,
    description: a.description ?? '',
    createdAt: a.createdAt ?? new Date().toISOString(),
  }
}

function mapDetailToStored(a: any): StoredAdjustment {
  return {
    id: a.id,
    productId: a.productId,
    barcode: a.product?.barcode ?? 'N/A',
    productName: a.product?.name ?? 'Producto',
    type: a.type,
    quantity: a.quantity,
    description: a.description ?? '',
    createdAt: a.createdAt ?? new Date().toISOString(),
  }
}

function mapStoredToListItem(a: StoredAdjustment) {
  return {
    id: a.id,
    productId: a.productId,
    barcode: a.barcode,
    type: a.type,
    quantity: a.quantity,
    description: a.description,
    createdAt: a.createdAt,
  }
}

function mapStoredToDetail(a: StoredAdjustment) {
  return {
    id: a.id,
    productId: a.productId,
    product: { name: a.productName, barcode: a.barcode },
    type: a.type,
    quantity: a.quantity,
    description: a.description,
    createdAt: a.createdAt,
  }
}

// ── Utils ─────────────────────────────────────────────────────────────────────

function extractPathId(url: string, prefix: string): number | null {
  const { pathname } = new URL(url)
  const segment = pathname.replace(prefix, '').split('/')[0]
  const id = Number(segment)
  return Number.isInteger(id) && id !== 0 ? id : null
}

function buildDescription(dto: CreateInventoryAdjustmentDTO): string {
  return `Ajuste ${dto.type} | razon: ${dto.reason}${dto.notes ? ` | nota: ${dto.notes}` : ''}`
}