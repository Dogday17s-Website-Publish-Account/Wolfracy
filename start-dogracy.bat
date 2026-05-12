@echo off
title Dogracy Server Launcher
color 0A
echo.
echo  ========================================
echo         DOGRACY SERVER LAUNCHER
echo  ========================================
echo.

echo [1] Starting Node.js Server...
start /B node server.js
timeout /t 3 /nobreak >nul

echo [2] Starting ngrok Tunnel...
start /B .\ngrok.exe http 3000
timeout /t 5 /nobreak >nul

echo [3] Getting ngrok URL...
timeout /t 10 /nobreak >nul

echo [4] Getting final ngrok URL...
powershell -Command "& { $ngrokUrl = (Invoke-WebRequest -Uri 'http://localhost:4040/api/tunnels' -UseBasicParsing | ConvertFrom-Json).tunnels[0].public_url; Write-Host \"Ngrok URL: $ngrokUrl\"; Write-Host \"\"; Write-Host \"📋 Save this URL and upload to GitHub Pages!\"; Write-Host \"   Your GitHub Pages URL will be:\"; Write-Host \"   https://YOUR_USERNAME.github.io/dogracy\" }"
timeout /t 5 /nobreak >nul

echo.
echo  ========================================
echo         DOGRACY IS NOW LIVE!
echo  ========================================
echo.
echo Your server is running on:
echo    Local:    http://localhost:3000
echo    Network:  http://192.168.1.73:3000
echo    Global:   https://dogracy.short.gy
echo.
echo Opening web interface...
echo.
echo Your domain has been updated automatically!
echo.
echo Press any key to open your Dogracy site...
pause >nul
start https://dogracy.short.gy
echo.
echo Dogracy server is running in background!
echo Close this window to stop all services.
echo.

:KEEP_ALIVE
timeout /t 30 /nobreak >nul
goto KEEP_ALIVE
