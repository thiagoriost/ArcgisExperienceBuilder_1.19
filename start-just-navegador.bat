@echo off
title ArcGIS Experience Builder - DEV

REM === Configurar PATH para Node y Chrome (si ya está en PATH, no afecta) ===
set PATH=%PATH%;"C:\Program Files\Google\Chrome\Application"


REM === Lanzar Chrome con flags necesarios ===
echo Abriendo Chrome...
start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" ^
 --user-data-dir="E:\IGAC\Software\arcgis-experience-builder-1.19\client" ^
 --ignore-certificate-errors ^
 --allow-insecure-localhost ^
 --disable-web-security ^
 --disable-site-isolation-trials ^
 https://localhost:3001/

echo Entorno Experience Builder iniciado correctamente.
timeout /t 15 /nobreak > nul

exit
