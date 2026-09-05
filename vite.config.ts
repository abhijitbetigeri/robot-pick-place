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
    allowedHosts: true
  },
  preview: {
    port: 3001,
    host: '0.0.0.0',
    allowedHosts: true
  }
});
