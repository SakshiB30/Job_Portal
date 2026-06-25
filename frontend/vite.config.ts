import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    outDir: 'build',
    rollupOptions: {
      output: {
        manualChunks: {
          // Core vendor chunk (React, Redux, Router)
          'vendor-core': ['react', 'react-dom', 'react-router-dom', 'react-redux', '@reduxjs/toolkit', 'axios'],
          // UI framework chunk (Mantine)
          'vendor-ui': ['@mantine/core', '@mantine/hooks', '@mantine/form', '@mantine/notifications', '@mantine/dates', '@mantine/carousel'],
          // Rich text editor chunk (TipTap)
          'vendor-editor': ['@tiptap/react', '@tiptap/starter-kit', '@tiptap/extension-link', '@tiptap/extension-highlight', '@tiptap/extension-text-align', '@tiptap/extension-subscript', '@tiptap/extension-superscript', '@mantine/tiptap'],
          // Icon libraries
          'vendor-icons': ['@tabler/icons-react'],
        },
      },
    },
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
