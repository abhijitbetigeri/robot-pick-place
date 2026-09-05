import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // `npx convex dev` writes CONVEX_URL (not VITE_CONVEX_URL) into .env.local.
  // Without this prefix the client URL is undefined in the browser.
  envPrefix: ['VITE_', 'CONVEX_'],
  server: {
    port: 3001,
    host: '0.0.0.0',
    allowedHosts: true,
    // `scripts/sim_server.py` runs the MuJoCo task. Proxying keeps the page
    // same-origin, so the fetch needs no CORS handling and no absolute URL.
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8765',
        changeOrigin: false
      }
    }
  },
  preview: {
    port: 3001,
    host: '0.0.0.0',
    allowedHosts: true
  }
});
