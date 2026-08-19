import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // bind to all interfaces so the Vite dev server is reachable from outside the container
  server: {
    host: true,
    port: 3000,
    strictPort: true,
  },
});