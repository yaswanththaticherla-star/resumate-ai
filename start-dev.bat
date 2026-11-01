@echo off
setlocal
title ResuMate AI Launcher

set "PROJECT_ROOT=%~dp0"
echo =======================================
echo  Starting ResuMate AI Dev Servers
echo  Project Root: %PROJECT_ROOT%
echo =======================================

:: Verify Python Virtual Environment
if not exist "%PROJECT_ROOT%backend\venv\Scripts\python.exe" (
    echo [ERROR] Virtual environment Python not found at:
    echo "%PROJECT_ROOT%backend\venv\Scripts\python.exe"
    echo Please ensure the backend virtual environment is created.
    pause
    exit /b 1
)

:: Verify Frontend Directory
if not exist "%PROJECT_ROOT%frontend\package.json" (
    echo [ERROR] Frontend package.json not found in "%PROJECT_ROOT%frontend"
    pause
    exit /b 1
)

echo 1. Starting Backend Server (FastAPI)...
:: Note: The executable is explicitly double-quoted and directory is specified with /D to safely handle paths with spaces
start "ResuMate AI - Backend (FastAPI)" /D "%PROJECT_ROOT%backend" "%PROJECT_ROOT%backend\venv\Scripts\python.exe" -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload

timeout /t 2 /nobreak >nul

echo 2. Starting Frontend Dev Server (Vite)...
start "ResuMate AI - Frontend (Vite)" /D "%PROJECT_ROOT%frontend" cmd /c npm run dev

echo.
echo Both servers have been launched in separate windows.
echo Frontend URL: http://localhost:3000
echo Backend Docs: http://127.0.0.1:8000/docs
