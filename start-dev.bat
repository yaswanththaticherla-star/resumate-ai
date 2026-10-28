@echo off
title ResuMate AI Launcher
echo =======================================
echo  Starting ResuMate AI Dev Servers
echo =======================================

echo 1. Starting Backend Server...
start "ResuMate AI - Backend (FastAPI)" cmd /k "cd /d C:\ResuMate AI\backend && .\venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

timeout /t 2 /nobreak >nul

echo 2. Starting Frontend Dev Server...
start "ResuMate AI - Frontend (Vite)" cmd /k "cd /d C:\ResuMate AI\frontend && npm run dev"

echo.
echo Both servers are started in dedicated windows.
echo Frontend URL: http://localhost:3000
echo Backend Docs: http://127.0.0.1:8000/docs
