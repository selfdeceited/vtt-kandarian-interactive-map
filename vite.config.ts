import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  define: {
    // Mapbox GL v3 references process.env.NODE_ENV internally
    'process.env': {},
  },
  server: {
    proxy: {
      '/api/jsonsilo': {
        target: 'https://api.jsonsilo.com',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api\/jsonsilo/, ''),
      },
    },
  },
})
