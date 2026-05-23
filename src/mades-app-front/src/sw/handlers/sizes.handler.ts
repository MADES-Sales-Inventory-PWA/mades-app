import { SWContext, json, errorResponse } from '../middlewares/types';
import { sizeTypesDb, sizeValuesDb } from '../db/sizes.db';
import { sizeTypeIdParamSchema } from './sizes.schema';

export async function listSizeTypes(request: Request, _ctx: SWContext): Promise<Response> {
  try {
    const response = await fetch(request.clone())

    if (response.ok) {
      const body = await response.clone().json()

      if (body.success && Array.isArray(body.data)) {
        await sizeTypesDb.saveMany(body.data)
      }

      return response
    }

    return response
  } catch {
  }

  const types = await sizeTypesDb.findAll()

  return json({
    success: true,
    message: 'Tipos de talla obtenidos correctamente',
    data: types,
  })
}

export async function listSizeValuesByTypeId(request: Request, _ctx: SWContext): Promise<Response> {
  const idParsed = extractSizeTypeId(request.url)

  if (idParsed === null) {
    return errorResponse(400, 'VALIDATION_ERROR', 'El ID del tipo de talla no es válido')
  }

  try {
    const response = await fetch(request.clone())

    if (response.ok) {
      const body = await response.clone().json()

      if (body.success && Array.isArray(body.data)) {
        const withTypeId = body.data.map((v: any) => ({
          ...v,
          sizeTypeId: idParsed,
        }))
        await sizeValuesDb.saveMany(withTypeId)
      }

      return response
    }

    return response
  } catch {
  }

  const sizeType = await sizeTypesDb.findById(idParsed)

  if (!sizeType) {
    return errorResponse(404, 'NOT_FOUND', `El tipo de talla con ID ${idParsed} no existe`)
  }

  const values = await sizeValuesDb.findByTypeId(idParsed)

  return json({
    success: true,
    message: 'Valores de talla obtenidos correctamente',
    data: values,
  })
}

function extractSizeTypeId(url: string): number | null {
  const { pathname } = new URL(url)
  const match = pathname.match(/^\/api\/sizes\/values\/(\d+)$/)
  if (!match) return null

  const parsed = sizeTypeIdParamSchema.safeParse({ id: match[1] })
  return parsed.success ? parsed.data.id : null
}