import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ command }) => ({
  // Only the production build is reverse-proxied under /admin/ (see UBBFlow's
  // config/nginx.conf). The dev server must keep serving at the root, or
  // asset requests 404 into the SPA fallback and fail MIME-type checking.
  base: command === 'build' ? '/admin/' : '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5175,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
}))
