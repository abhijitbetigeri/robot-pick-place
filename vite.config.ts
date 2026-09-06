import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// The studio's Run button POSTs to /api/run, which Vite proxies to
// scripts/sim_server.py. Its port is overridable because 8765 is not always
// free: on one dev machine it was held by an unrelated long-running app,
// which answered 404 with an empty body and surfaced in the UI as
// "Unexpected end of JSON input". Set SIM_SERVER_PORT in .env.development.local.
const simServerPort = loadEnv('development', process.cwd(), '').SIM_SERVER_PORT || '8765';

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
        target: `http://127.0.0.1:${simServerPort}`,
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
