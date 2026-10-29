@echo off
title Autenticar GitHub - Nuestro Nido
set "PATH=%LOCALAPPDATA%\Programs\Git\cmd;%LOCALAPPDATA%\Programs\Git\bin;%LOCALAPPDATA%\Programs\Git\ucrt64\bin;C:\Program Files\Git\cmd;C:\Program Files\Git\bin;%PATH%"
cd /d D:\juego

echo ========================================================
echo   AUTENTICACION INICIAL CON GITHUB | NUESTRO NIDO
echo ========================================================
echo.
echo Se abrira una ventana de tu navegador para autorizar a
echo Git Credential Manager en tu cuenta de GitHub (%USERNAME%).
echo.
echo Luego de autorizar, este push se completara de inmediato
echo y Windows guardara tus credenciales en el sistema para siempre.
echo ========================================================
echo.

git push -u origin main

echo.
echo ========================================================
echo   Listo! Tus cambios ya estan en GitHub y GitHub Pages.
echo   El auto-push en segundo plano sigue activo permanentemente.
echo ========================================================
echo.
pause
