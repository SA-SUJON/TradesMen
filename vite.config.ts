
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'framer-motion'],
          'app-vendor': ['@google/genai', 'html5-qrcode', '@supabase/supabase-js'],
          'icons': ['lucide-react']
        }
      }
    }
  }
});
