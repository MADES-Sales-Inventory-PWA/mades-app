import { WorkboxPlugin } from 'workbox-core'

export const offlineErrorPlugin: WorkboxPlugin = {
  handlerDidError: async () => {
    return new Response(
      JSON.stringify({
        code: 'NETWORK_ERROR',
        message: 'No puedes realizar esta acción sin conexión a internet'
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}