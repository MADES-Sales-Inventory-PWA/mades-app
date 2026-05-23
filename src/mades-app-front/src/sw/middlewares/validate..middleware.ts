import { z } from 'zod'
import { SWHandler, SWContext, errorResponse } from './types'

export function withBody(schema: z.ZodType): (handler: SWHandler) => SWHandler {
  return (handler) =>
    async (request: Request, ctx: SWContext): Promise<Response> => {
      let raw: unknown

      try {
        raw = await request.clone().json()
      } catch {
        return errorResponse(400, 'VALIDATION_ERROR', 'El cuerpo de la petición no es JSON válido')
      }

      const result = schema.safeParse(raw)

      if (!result.success) {
        const message = result.error.issues.map(i => i.message).join(', ')
        return errorResponse(400, 'VALIDATION_ERROR', message)
      }

      ctx.validated.body = result.data

      return handler(request, ctx)
    }
}

export function withQuery(schema: z.ZodType): (handler: SWHandler) => SWHandler {
  return (handler) =>
    async (request: Request, ctx: SWContext): Promise<Response> => {
      const url = new URL(request.url)
      const raw = Object.fromEntries(url.searchParams.entries())

      const result = schema.safeParse(raw)

      if (!result.success) {
        const message = result.error.issues.map(i => i.message).join(', ')
        return errorResponse(400, 'VALIDATION_ERROR', message)
      }

      ctx.validated.query = result.data

      return handler(request, ctx)
    }
}