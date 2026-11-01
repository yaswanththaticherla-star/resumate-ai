import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { spawn, ChildProcess } from 'child_process';
import http from 'http';
import path from 'path';
import fs from 'fs';

// Auto-start backend if not already running on port 8000
function autoBackendPlugin(): Plugin {
  let backendProc: ChildProcess | null = null;
  let isChecking = false;

  return {
    name: 'auto-backend-plugin',
    configureServer(server) {
      if (backendProc || isChecking) return;
      isChecking = true;

      const checkReq = http.get('http://127.0.0.1:8000/api/health', { timeout: 1500 }, (res) => {
        isChecking = false;
        if (res.statusCode === 200) {
          console.log('\x1b[32m%s\x1b[0m', '[vite] FastAPI backend is confirmed active on http://127.0.0.1:8000');
        }
      });

      checkReq.on('error', () => {
        isChecking = false;
        if (backendProc) return;

        console.log('\x1b[33m%s\x1b[0m', '[vite] FastAPI backend is not active. Auto-starting backend on http://127.0.0.1:8000...');
        const projectRoot = path.resolve(__dirname, '..');
        const pythonExe = path.join(projectRoot, 'backend', 'venv', 'Scripts', 'python.exe');
        const backendDir = path.join(projectRoot, 'backend');

        if (fs.existsSync(pythonExe)) {
          // Note: shell: false is essential on Windows when the path contains spaces ('C:\ResuMate AI')
          // Using shell: false uses Win32 CreateProcessW directly without cmd.exe string splitting.
          backendProc = spawn(
            pythonExe,
            ['-m', 'uvicorn', 'app.main:app', '--host', '127.0.0.1', '--port', '8000', '--reload'],
            {
              cwd: backendDir,
              stdio: 'inherit',
              shell: false,
              windowsHide: false,
            }
          );

          backendProc.on('error', (err) => {
            console.error('\x1b[31m%s\x1b[0m', '[vite] Failed to auto-start backend:', err);
          });

          backendProc.on('exit', (code) => {
            if (code && code !== 0) {
              console.error('\x1b[31m%s\x1b[0m', `[vite] Backend process exited with code ${code}`);
            }
            backendProc = null;
          });
        } else {
          console.error('\x1b[31m%s\x1b[0m', '[vite] Python virtual environment not found at:', pythonExe);
        }
      });

      checkReq.on('timeout', () => {
        checkReq.destroy();
      });

      const cleanup = () => {
        if (backendProc && backendProc.pid) {
          try {
            if (process.platform === 'win32') {
              spawn('taskkill', ['/pid', backendProc.pid.toString(), '/f', '/t'], { shell: false });
            } else {
              backendProc.kill();
            }
          } catch {}
          backendProc = null;
        }
      };

      server.httpServer?.on('close', cleanup);
      process.on('exit', cleanup);
      process.on('SIGINT', cleanup);
      process.on('SIGTERM', cleanup);
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), autoBackendPlugin()],
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
            console.warn('[vite proxy notice]', err.message);
            if (res && !('headersSent' in res && res.headersSent) && typeof (res as any).writeHead === 'function') {
              (res as any).writeHead(503, { 'Content-Type': 'application/json' });
              (res as any).end(
                JSON.stringify({
                  detail: 'Backend server is initializing or unreachable at 127.0.0.1:8000. Please ensure the backend is running.',
                })
              );
            }
          });
        },
      },
    },
  },
});
