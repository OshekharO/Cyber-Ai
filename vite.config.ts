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
          const normalizedId = id.replace(/\\/g, '/');

          if (normalizedId.includes('node_modules/react-syntax-highlighter')) {
            return 'vendor-syntax';
          }
          if (
            normalizedId.includes('node_modules/react-markdown') ||
            normalizedId.includes('node_modules/remark') ||
            normalizedId.includes('node_modules/micromark') ||
            normalizedId.includes('node_modules/mdast') ||
            normalizedId.includes('node_modules/unified')
          ) {
            return 'vendor-markdown';
          }
          if (
            normalizedId.includes('node_modules/react/') ||
            normalizedId.includes('node_modules/react-dom/')
          ) {
            return 'vendor-react';
          }
        },
      },
    },
  },
})
