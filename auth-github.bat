@echo off
title Autenticar GitHub - Nuestro Nido
set "PATH=%LOCALAPPDATA%\Programs\Git\cmd;%LOCALAPPDATA%\Programs\Git\ucrt64\bin;%PATH%"
cd /d D:\juego

echo ========================================================
echo   AUTENTICACION INICIAL CON GITHUB | NUESTRO NIDO
echo ========================================================
echo.
echo Se abrira una ventana de tu navegador para autorizar a
echo Git Credential Manager en tu cuenta de GitHub.
echo.
echo Luego de autorizar, este primer push se completara y
echo Windows guardara tus credenciales para siempre.
echo ========================================================
echo.

git push -u origin main

echo.
echo ========================================================
echo   Proceso finalizado. El auto-push ya esta activo!
echo ========================================================
pause
