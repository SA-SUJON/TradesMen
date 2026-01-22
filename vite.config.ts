
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Defines process.env as an empty object so access like process.env.API_KEY returns undefined
    // instead of throwing "process is not defined"
    'process.env': {}
  },
  build: {
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            if (id.includes('@google/genai')) {
              return 'genai-vendor';
            }
            if (id.includes('framer-motion')) {
              return 'framer-motion-vendor';
            }
            if (id.includes('lucide-react')) {
              return 'lucide-vendor';
            }
            if (id.includes('html5-qrcode')) {
              return 'html5-qrcode-vendor';
            }
            return 'vendor';
          }
        }
      }
    }
  }
});
