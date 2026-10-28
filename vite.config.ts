import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true, // allows access from local network / mobile in same wifi
  },
  build: {
    target: 'es2020',
    sourcemap: true,
  },
});
