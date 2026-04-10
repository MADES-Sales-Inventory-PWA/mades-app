import { readFile } from 'node:fs/promises'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { resolve } from 'node:path'
import { build as esbuildBuild } from 'esbuild'
import { defineConfig } from 'vite'
import type { Plugin, ViteDevServer } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

const serviceWorkerEntryPath = resolve(__dirname, 'src/sw/service-worker.ts')

const compileServiceWorker = async (buildAssetUrlsJson: string, minify = false) => {
  const result = await esbuildBuild({
    entryPoints: [serviceWorkerEntryPath],
    bundle: true,
    write: false,
    format: 'iife',
    platform: 'browser',
    target: ['es2020'],
    minify,
    define: {
      __BUILD_ASSET_URLS_JSON__: JSON.stringify(buildAssetUrlsJson)
    }
  })

  return result.outputFiles[0]?.text ?? await readFile(serviceWorkerEntryPath, 'utf8')
}

const serviceWorkerFromSrc = (): Plugin => ({
  name: 'service-worker-from-src',
  configureServer(server: ViteDevServer) {
    server.middlewares.use('/service-worker.js', async (_req: IncomingMessage, res: ServerResponse<IncomingMessage>) => {
      try {
        const source = await compileServiceWorker('[]')
        res.setHeader('Content-Type', 'application/javascript; charset=utf-8')
        res.end(source)
      } catch {
        res.statusCode = 404
        res.end('Service worker source not found')
      }
    })
  },
  async generateBundle(_options, bundle) {
    const assetUrls = Object.values(bundle)
      .map((output) => output.fileName)
      .filter((fileName) => fileName.startsWith('assets/'))
      .map((fileName) => `/${fileName}`)
    const source = await compileServiceWorker(JSON.stringify(assetUrls), true)

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
