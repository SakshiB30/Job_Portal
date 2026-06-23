import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    outDir: 'build',
  },
  server: {
    proxy: {
      '/users': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/api/users': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/api/admin': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
