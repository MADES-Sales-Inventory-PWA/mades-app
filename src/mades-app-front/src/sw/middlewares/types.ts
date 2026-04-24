export interface SWUser {
  userId: number
  roleId: number
  userName: string
}

export interface SWContext {
  user?: SWUser
  pathParams?: Record<string, string>
  validated: {
    body?: unknown
    query?: unknown
  }
}

export type SWHandler = (request: Request, ctx: SWContext) => Promise<Response>
export type SWMiddleware = (handler: SWHandler) => SWHandler

export function createContext(): SWContext {
  return { validated: {} }
}

export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

export function errorResponse(status: number, code: string, message: string): Response {
  return json({ code, message }, status)
}

export function compose(...middlewares: SWMiddleware[]) {
  return (handler: SWHandler): SWHandler =>
    middlewares.reduceRight((acc, mw) => mw(acc), handler)
}