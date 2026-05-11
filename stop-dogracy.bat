@echo off
title Stop Dogracy Server
color 0C
echo.
echo  ========================================
echo        STOPPING DOGRACY SERVER
echo  ========================================
echo.

echo [1] Stopping Node.js Server...
taskkill /f /im node.exe >nul 2>&1

echo [2] Stopping ngrok...
taskkill /f /im ngrok.exe >nul 2>&1

echo [3] Cleaning up...
timeout /t 2 /nobreak >nul

echo.
echo  ========================================
echo        DOGRACY SERVER STOPPED
echo  ========================================
echo.
echo All services have been stopped.
echo.
pause
