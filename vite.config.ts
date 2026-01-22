
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    // Increase warning limit to 2000kB to accommodate the AI SDK
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Split UI libraries
            if (id.includes('react') || id.includes('react-dom') || id.includes('framer-motion')) {
              return 'vendor-ui';
            }
            // Split AI and Database libraries
            if (id.includes('@google/genai') || id.includes('@supabase')) {
              return 'vendor-core';
            }
            // Split Icon library
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            // All other dependencies go to a generic vendor chunk
            return 'vendor';
          }
        }
      }
    }
  }
});
