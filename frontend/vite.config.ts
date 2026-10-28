import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, res) => {
            console.error('[vite proxy error]', err.message);
            if (res && !('headersSent' in res && res.headersSent) && typeof (res as any).writeHead === 'function') {
              (res as any).writeHead(503, { 'Content-Type': 'application/json' });
              (res as any).end(
                JSON.stringify({
                  detail: 'Backend server is unreachable at 127.0.0.1:8000. Please start your FastAPI backend server.',
                })
              );
            }
          });
        },
      },
    },
  },
});

