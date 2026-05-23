import { defineConfig, type ProxyOptions } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { VitePWA } from 'vite-plugin-pwa'

const proxyConfig: Record<string, ProxyOptions> = {
  '/api': {
    target: 'http://localhost:3000',
    changeOrigin: true,
  }
}

export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    VitePWA({
      registerType: 'autoUpdate',

      strategies: 'injectManifest',

      srcDir: 'src/sw',
      filename: 'service-worker.ts',

      injectManifest: {

        injectionPoint: 'self.__WB_MANIFEST',

        globPatterns: ['**/*.{js,css,html,png,svg,webmanifest}'],
      },

      manifest: {
        name: 'MADES - Architectural Dashboard',
        short_name: 'MADES',
        theme_color: '#2f6fed',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/icon.png', sizes: '512x512', type: 'image/png' }
        ]
      },

      devOptions: {
        enabled: true,
        type: 'module',
        navigateFallback: 'index.html',
      }
    })
  ],

  server: {
    hmr: {
      host: 'localhost',
      port: 4173,
      protocol: 'ws'
    },
    proxy: proxyConfig
  },

  preview: {
    proxy: proxyConfig
  }
})