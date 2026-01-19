
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
    chunkSizeWarningLimit: 1000,
  }
});
