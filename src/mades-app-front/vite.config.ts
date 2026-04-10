import { readFile } from 'node:fs/promises'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { resolve } from 'node:path'
import { defineConfig, transformWithEsbuild } from 'vite'
import type { Plugin, ViteDevServer } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

const serviceWorkerEntryPath = resolve(__dirname, 'src/sw/service-worker.ts')

const compileServiceWorker = async (minify = false) => {
  const source = await readFile(serviceWorkerEntryPath, 'utf8')
  const result = await transformWithEsbuild(source, serviceWorkerEntryPath, {
    loader: 'ts',
    target: 'es2020',
    minify
  })

  return result.code
}

const serviceWorkerFromSrc = (): Plugin => ({
  name: 'service-worker-from-src',
  configureServer(server: ViteDevServer) {
    server.middlewares.use('/service-worker.js', async (_req: IncomingMessage, res: ServerResponse<IncomingMessage>) => {
      try {
        const source = await compileServiceWorker()
        res.setHeader('Content-Type', 'application/javascript; charset=utf-8')
        res.end(source)
      } catch {
        res.statusCode = 404
        res.end('Service worker source not found')
      }
    })
  },
  async generateBundle() {
    const source = await compileServiceWorker(true)
    this.emitFile({
      type: 'asset',
      fileName: 'service-worker.js',
      source
    })
  }
})

export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    serviceWorkerFromSrc()
  ],
  server: {
    hmr: {
      host: 'localhost',
      port: 5173,
      protocol: 'ws'
    }
  }
})
