import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import electron from 'vite-plugin-electron'
import path from 'path'

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    tailwindcss(),
    ...(mode === 'development'
      ? []
      : [VitePWA({
          registerType: 'autoUpdate',
          includeAssets: ['favicon.svg', 'icons.svg'],
          manifest: {
            name: 'Sona Hisaab - Gold Ledger',
            short_name: 'Sona Hisaab',
            description: 'Gold shop management system for Pakistani gold shops',
            theme_color: '#c9a84c',
            background_color: '#faf7f2',
            display: 'standalone',
            orientation: 'any',
            lang: 'en',
            dir: 'ltr',
            icons: [
              { src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml' },
              { src: '/icons.svg', sizes: 'any', type: 'image/svg+xml' },
            ],
          },
          workbox: {
            globPatterns: ['**/*.{js,css,html,svg,png,ico,json}'],
            runtimeCaching: [
              {
                urlPattern: /^https:\/\/api\.gold-api\.com\/.*/i,
                handler: 'NetworkFirst',
                options: { cacheName: 'gold-api-cache', expiration: { maxEntries: 10, maxAgeSeconds: 3600 } },
              },
            ],
          },
        })]),
    electron([
      {
        entry: 'electron/main.ts',
        vite: {
          build: {
            outDir: 'dist-electron',
            rollupOptions: {
              external: ['electron'],
            },
          },
        },
      },
      {
        entry: 'electron/preload.ts',
        onstart(args) {
          args.reload()
        },
        vite: {
          build: {
            outDir: 'dist-electron',
            rollupOptions: {
              external: ['electron'],
            },
          },
        },
      },
    ]),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    watch: {
      ignored: ['**/dist-electron/**', '**/dist/**', '**/release/**'],
    },
    hmr: {
      overlay: false,
    },
  },
  build: {
    target: 'es2022',
    cssMinify: 'esbuild',
  },
}))
