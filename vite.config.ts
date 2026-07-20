import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(() => ({
  // Defaults to root: that's what Vercel serves (vercel.json rewrites
  // everything to /index.html at the domain root). The Docker/Nginx
  // deployment mounts the panel under /admin/ instead (see UBBFlow's
  // config/nginx.conf) and opts in via VITE_BASE_PATH at build time
  // (set in Dockerfile) — never set it for local dev or Vercel.
  base: process.env.VITE_BASE_PATH || '/',
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
