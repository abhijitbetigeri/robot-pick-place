import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import App from './App';
import './index.css';

// Vite exposes VITE_-prefixed vars; `npx convex dev` writes CONVEX_URL to
// .env.local, so accept either name rather than failing silently at runtime.
const convexUrl =
  import.meta.env.VITE_CONVEX_URL ?? import.meta.env.CONVEX_URL;

const convex = new ConvexReactClient(convexUrl as string);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConvexProvider client={convex}>
      <App />
    </ConvexProvider>
  </React.StrictMode>,
);
