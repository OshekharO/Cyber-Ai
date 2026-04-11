import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // Split large third-party libraries into separate cacheable chunks so
        // the browser can load them in parallel and cache them across deploys.
        manualChunks(id: string) {
          if (id.includes('node_modules/react-syntax-highlighter')) {
            return 'vendor-syntax';
          }
          if (
            id.includes('node_modules/react-markdown') ||
            id.includes('node_modules/remark') ||
            id.includes('node_modules/micromark') ||
            id.includes('node_modules/mdast') ||
            id.includes('node_modules/unified')
          ) {
            return 'vendor-markdown';
          }
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
            return 'vendor-react';
          }
        },
      },
    },
  },
})
