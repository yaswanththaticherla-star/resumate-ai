# ResuMate AI - Dev Environment Launcher (PowerShell)
$ErrorActionPreference = "Stop"

$ProjectRoot = $PSScriptRoot
if (-not $ProjectRoot) { $ProjectRoot = (Get-Location).Path }

$BackendDir = Join-Path $ProjectRoot "backend"
$FrontendDir = Join-Path $ProjectRoot "frontend"
$PythonExe = Join-Path $BackendDir "venv\Scripts\python.exe"

Write-Host "=======================================" -ForegroundColor Cyan
Write-Host " Starting ResuMate AI (Backend + Frontend)" -ForegroundColor Cyan
Write-Host " Project Directory: $ProjectRoot" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan

# Check Python virtual environment
if (-not (Test-Path $PythonExe)) {
    Write-Host "[ERROR] Virtual environment Python not found at: $PythonExe" -ForegroundColor Red
    Write-Host "Please set up the virtual environment in $BackendDir\venv" -ForegroundColor Red
    exit 1
}

# Check frontend directory & package.json
$FrontendPkg = Join-Path $FrontendDir "package.json"
if (-not (Test-Path $FrontendPkg)) {
    Write-Host "[ERROR] Frontend package.json not found at: $FrontendPkg" -ForegroundColor Red
    exit 1
}

# Check if port 8000 is already occupied
$portActive = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue
if ($portActive) {
    Write-Host "[WARNING] Port 8000 is already in use by process ID $($portActive[0].OwningProcess)." -ForegroundColor Yellow
    Write-Host "If this is an existing ResuMate backend, you can continue or terminate it." -ForegroundColor Yellow
} else {
    Write-Host "1. Launching FastAPI Backend on http://127.0.0.1:8000..." -ForegroundColor Green
    # Uses -FilePath and -ArgumentList directly to prevent command line string splitting on paths with spaces
    Start-Process -FilePath $PythonExe -ArgumentList "-m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload" -WorkingDirectory $BackendDir
    Start-Sleep -Seconds 2
}

# Launch Vite Frontend
Write-Host "2. Launching Vite Frontend on http://localhost:3000..." -ForegroundColor Green
Start-Process -FilePath "npm.cmd" -ArgumentList "run dev" -WorkingDirectory $FrontendDir

Write-Host ""
Write-Host "[READY] Both servers are starting in separate windows." -ForegroundColor Yellow
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Backend Docs: http://127.0.0.1:8000/docs" -ForegroundColor Cyan
