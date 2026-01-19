
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Prevent crash if code uses process.env.API_KEY, maps it to import.meta.env
    'process.env': {}
  }
});
