/// <reference types="vitest/config" />
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'
import { handleDevAIProxy } from './server/dev-ai-proxy'

const flashfixAiDevProxy = () => ({
  name: 'flashfix-ai-dev-proxy',
  configureServer(server: any) {
    server.middlewares.use('/api/ai', (req: any, res: any) => {
      void handleDevAIProxy(req, res, process.env)
    })
  },
})

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  Object.assign(process.env, env)

  return {
  plugins: [
    react(),
    flashfixAiDevProxy(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
  server: {
    host: '127.0.0.1',
    port: 5173,
    open: false,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return
          }

          if (id.includes('react')) return 'vendor-react'
          if (id.includes('framer-motion') || id.includes('lucide-react')) return 'vendor-ui'
          if (id.includes('katex') || id.includes('dompurify')) return 'vendor-math'
          if (id.includes('pdfjs-dist') || id.includes('jszip')) return 'vendor-docs'
          if (id.includes('@supabase/supabase-js') || id.includes('idb') || id.includes('zustand')) return 'vendor-data'
        },
      },
    },
  },
  }
})
