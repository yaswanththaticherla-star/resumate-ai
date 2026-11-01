// ResuMate AI - Unified Development Runner
// Starts FastAPI backend (port 8000) and Vite frontend (port 3000) together with graceful shutdown.

const { spawn } = require('child_process');
const http = require('http');
const path = require('path');
const fs = require('fs');

const projectRoot = path.resolve(__dirname, '..');
const backendDir = path.join(projectRoot, 'backend');
const frontendDir = path.join(projectRoot, 'frontend');
const pythonExe = path.join(backendDir, 'venv', 'Scripts', 'python.exe');
const frontendPkgPath = path.join(frontendDir, 'package.json');

console.log('\x1b[36m%s\x1b[0m', '================================================');
console.log('\x1b[36m%s\x1b[0m', '   ResuMate AI — Development Server Launcher    ');
console.log('\x1b[36m%s\x1b[0m', '================================================');

function checkHealth(timeoutMs = 1000) {
  return new Promise((resolve) => {
    const req = http.get('http://127.0.0.1:8000/api/health', { timeout: timeoutMs }, (res) => {
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function waitForBackend(maxAttempts = 15) {
  for (let i = 0; i < maxAttempts; i++) {
    const ok = await checkHealth(1000);
    if (ok) return true;
    await new Promise((r) => setTimeout(r, 600));
  }
  return false;
}

let backendProc = null;
let frontendProc = null;
let backendWasAlreadyRunning = false;

function shutdown(exitCode = 0) {
  console.log('\n\x1b[33m%s\x1b[0m', '[ResuMate AI] Shutting down launcher...');

  // Only terminate backend if this runner started it; preserve pre-existing backend
  if (!backendWasAlreadyRunning && backendProc && backendProc.pid) {
    console.log('\x1b[33m%s\x1b[0m', '[ResuMate AI] Stopping spawned FastAPI backend...');
    try {
      if (process.platform === 'win32') {
        spawn('taskkill', ['/pid', backendProc.pid.toString(), '/f', '/t'], { shell: false });
      } else {
        process.kill(backendProc.pid);
      }
    } catch {}
    backendProc = null;
  } else if (backendWasAlreadyRunning) {
    console.log('\x1b[32m%s\x1b[0m', '[ResuMate AI] Pre-existing FastAPI backend remains active on http://127.0.0.1:8000');
  }

  if (frontendProc && frontendProc.pid) {
    console.log('\x1b[33m%s\x1b[0m', '[ResuMate AI] Stopping frontend Vite server...');
    try {
      if (process.platform === 'win32') {
        spawn('taskkill', ['/pid', frontendProc.pid.toString(), '/f', '/t'], { shell: false });
      } else {
        process.kill(frontendProc.pid);
      }
    } catch {}
    frontendProc = null;
  }

  process.exit(exitCode);
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));

async function main() {
  backendWasAlreadyRunning = await checkHealth(1500);

  if (backendWasAlreadyRunning) {
    console.log('\x1b[32m%s\x1b[0m', '[backend] FastAPI is already running and healthy on http://127.0.0.1:8000');
  } else {
    if (!fs.existsSync(pythonExe)) {
      console.error('\x1b[31m%s\x1b[0m', `[backend ERROR] Python interpreter not found at: ${pythonExe}`);
      console.error('Please configure the Python virtual environment in backend/venv');
      process.exit(1);
    }

    console.log('\x1b[32m%s\x1b[0m', '[backend] Starting FastAPI backend on http://127.0.0.1:8000...');
    // shell: false with direct executable path avoids cmd.exe path space split
    backendProc = spawn(
      pythonExe,
      ['-m', 'uvicorn', 'app.main:app', '--host', '127.0.0.1', '--port', '8000', '--reload'],
      {
        cwd: backendDir,
        stdio: ['ignore', 'pipe', 'pipe'],
        shell: false,
        windowsHide: false,
      }
    );

    backendProc.stdout.on('data', (d) => {
      process.stdout.write(`\x1b[34m[backend]\x1b[0m ${d.toString()}`);
    });

    backendProc.stderr.on('data', (d) => {
      process.stderr.write(`\x1b[31m[backend]\x1b[0m ${d.toString()}`);
    });

    backendProc.on('exit', (code) => {
      if (code && code !== 0) {
        console.error('\x1b[31m%s\x1b[0m', `[backend] Process exited with code ${code}`);
      }
      backendProc = null;
    });

    const ready = await waitForBackend(20);
    if (ready) {
      console.log('\x1b[32m%s\x1b[0m', '[backend] FastAPI health check passed! (http://127.0.0.1:8000/api/health)');
    } else {
      console.warn('\x1b[33m%s\x1b[0m', '[backend] Backend is taking longer than expected to report healthy, proceeding with frontend...');
    }
  }

  // Validate frontend package.json before launch
  if (!fs.existsSync(frontendPkgPath)) {
    console.error('\x1b[31m%s\x1b[0m', `[frontend ERROR] Frontend package.json not found at: ${frontendPkgPath}`);
    if (backendWasAlreadyRunning) {
      console.log('\x1b[32m%s\x1b[0m', '[backend] Pre-existing FastAPI backend remains running at http://127.0.0.1:8000');
    }
    process.exit(1);
  }

  console.log('\x1b[35m%s\x1b[0m', '[frontend] Starting Vite development server on http://localhost:3000...');

  // Windows Node.js (v18.20.2+, v20.12.2+, v22+, v24+) throws spawn EINVAL when calling .bat / .cmd
  // directly with shell: false (CVE-2024-27980). To safely run npm without shell: true,
  // invoke cmd.exe explicitly with ['/d', '/s', '/c', 'npm', 'run', 'dev'].
  const isWin = process.platform === 'win32';
  const executable = isWin ? (process.env.ComSpec || 'cmd.exe') : 'npm';
  const args = isWin ? ['/d', '/s', '/c', 'npm', 'run', 'dev'] : ['run', 'dev'];

  try {
    frontendProc = spawn(executable, args, {
      cwd: frontendDir,
      stdio: 'inherit',
      shell: false,
      windowsHide: false,
    });
  } catch (spawnErr) {
    console.error('\x1b[31m%s\x1b[0m', '[frontend ERROR] Failed to spawn frontend process:');
    console.error(`  Executable:  ${executable}`);
    console.error(`  Arguments:   ${JSON.stringify(args)}`);
    console.error(`  Working Dir: ${frontendDir}`);
    console.error(`  Error:       ${spawnErr.message}`);

    if (backendWasAlreadyRunning) {
      console.log('\x1b[32m%s\x1b[0m', '[backend] Pre-existing FastAPI backend remains active at http://127.0.0.1:8000');
    }
    process.exit(1);
  }

  frontendProc.on('error', (err) => {
    console.error('\x1b[31m%s\x1b[0m', '[frontend ERROR] Runtime error in frontend process:');
    console.error(`  Executable:  ${executable}`);
    console.error(`  Arguments:   ${JSON.stringify(args)}`);
    console.error(`  Working Dir: ${frontendDir}`);
    console.error(`  Error:       ${err.message}`);

    if (backendWasAlreadyRunning) {
      console.log('\x1b[32m%s\x1b[0m', '[backend] Pre-existing FastAPI backend remains active at http://127.0.0.1:8000');
    }
    shutdown(1);
  });

  frontendProc.on('exit', (code) => {
    console.log(`[frontend] Exited with code ${code}`);
    shutdown(code || 0);
  });
}

main().catch((err) => {
  console.error('\x1b[31m%s\x1b[0m', '[launcher error] Uncaught exception in main launcher:');
  console.error(err);
  if (backendWasAlreadyRunning) {
    console.log('\x1b[32m%s\x1b[0m', '[backend] Pre-existing FastAPI backend remains active at http://127.0.0.1:8000');
  }
  shutdown(1);
});
