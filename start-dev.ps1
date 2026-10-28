# ResuMate AI - Dev Environment Launcher
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host " Starting ResuMate AI (Backend + Frontend)" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan

$backendScript = {
    Set-Location "C:\ResuMate AI\backend"
    & ".\venv\Scripts\python.exe" -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
}

$frontendScript = {
    Set-Location "C:\ResuMate AI\frontend"
    npm.cmd run dev
}

Write-Host "1. Launching FastAPI Backend on http://127.0.0.1:8000..." -ForegroundColor Green
Start-Process powershell.exe -ArgumentList "-NoExit", "-Command", "cd 'C:\ResuMate AI\backend'; & '.\venv\Scripts\python.exe' -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

Start-Sleep -Seconds 2

Write-Host "2. Launching Vite Frontend on http://localhost:3000..." -ForegroundColor Green
Start-Process powershell.exe -ArgumentList "-NoExit", "-Command", "cd 'C:\ResuMate AI\frontend'; npm.cmd run dev"

Write-Host ""
Write-Host "Both services are launching in separate windows." -ForegroundColor Yellow
Write-Host "Open http://localhost:3000 in your browser when ready!" -ForegroundColor Cyan
