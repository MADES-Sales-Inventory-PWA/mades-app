import { SWHandler, SWContext, errorResponse } from './types'

function decodeJwt(token: string): Record<string, unknown> | null {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(atob(base64))
  } catch {
    return null
  }
}

export function withAuth(handler: SWHandler): SWHandler {
  return async (request: Request, ctx: SWContext): Promise<Response> => {
    const authHeader = request.headers.get('Authorization')

    if (!authHeader) {
      return errorResponse(401, 'INVALID_TOKEN', 'No se proporcionó el token de autenticación')
    }

    if (!authHeader.startsWith('Bearer ')) {
      return errorResponse(401, 'INVALID_TOKEN', 'El formato del token de autenticación es inválido')
    }

    const token = authHeader.split(' ')[1]

    if (!token) {
      return errorResponse(401, 'INVALID_TOKEN', 'El token de autenticación está vacío')
    }

    const payload = decodeJwt(token)

    if (!payload) {
      return errorResponse(401, 'INVALID_TOKEN', 'El token de autenticación es inválido o ha expirado')
    }

    ctx.user = payload as { userId: number; roleId: number; userName: string }

    return handler(request, ctx)
  }
}