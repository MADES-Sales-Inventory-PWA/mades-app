import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { build as esbuildBuild } from 'esbuild'
import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

const serviceWorkerEntryPath = resolve(__dirname, 'src/sw/service-worker.ts')

const compileServiceWorker = async (minify = false) => {
  const result = await esbuildBuild({
    entryPoints: [serviceWorkerEntryPath],
    bundle: true,
    write: false,
    format: 'iife',
    platform: 'browser',
    target: ['es2020'],
    minify
  })

  return result.outputFiles[0]?.text ?? await readFile(serviceWorkerEntryPath, 'utf8')
}

const serviceWorkerFromSrc = () => ({
  name: 'service-worker-from-src',
  configureServer(server: any) {
    server.middlewares.use('/service-worker.js', async (_req: any, res: any) => {
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
  async generateBundle(this: any) {
    const source = await compileServiceWorker(true)
    this.emitFile({
      type: 'asset',
      fileName: 'service-worker.js',
      source
    })
  }
})

// https://vite.dev/config/
export default defineConfig({
  server: {
    host: 'localhost',
    port: 5173,
    strictPort: true,
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 5173,
      clientPort: 5173
    }
  },
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    serviceWorkerFromSrc()
  ],
})
