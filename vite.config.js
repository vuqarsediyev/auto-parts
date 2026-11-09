import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/hsprice': {
        target: 'http://api.favorit-parts.ru',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/hsprice/, '/hs/hsprice'),
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/setupTests.js',
  },
})
