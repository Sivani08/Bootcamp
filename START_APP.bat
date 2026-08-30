@echo off
title BootMind App Launcher
echo Starting BootMind Development Server on http://localhost:8080/ ...
cd /d "%~dp0"
npx vite --port 8080
pause
