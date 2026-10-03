@echo off
echo ================================================
echo ShopSphere - Starting Application
echo ================================================
echo.
echo This will open TWO command windows:
echo   1. Backend Server (port 5000)
echo   2. Frontend Client (port 5173)
echo.
echo Press any key to continue...
pause > nul

echo Starting Backend Server...
start "ShopSphere Backend" cmd /k "cd /d %~dp0server && npm run dev"
timeout /t 3 /nobreak > nul

echo Starting Frontend Client...
start "ShopSphere Frontend" cmd /k "cd /d %~dp0client && npm run dev"

echo.
echo ================================================
echo Application Starting!
echo ================================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:5173
echo.
echo Two new command windows have opened.
echo Keep them running while using the application.
echo.
echo To stop: Close both command windows or press Ctrl+C in each.
echo.
