@echo off
title U.E. Plenitud de Vida - Sistema Biometrico
echo =========================================================
echo   INICIANDO MOTOR DE ASISTENCIA BIOMETRICA (AFIS)
echo =========================================================
echo.
echo [1/2] Iniciando el servicio local de lectura de huellas...

:: Cambia de directorio al servicio AFIS
cd /d "%~dp0afis-service"

if not exist venv (
    echo [ERROR] No se encontro el entorno virtual 'venv'.
    echo Asegurate de que la carpeta 'venv' existe en 'afis-service'.
    pause
    exit /b
)

:: Levanta el servidor Flask de Python en una ventana minimizada para que no estorbe al usuario
start /min cmd /c "call venv\Scripts\activate && python app.py"

echo [OK] Servicio iniciado en segundo plano (corriendo en el puerto 5000).
echo.
echo [2/2] Abriendo el Portal de Asistencia en el navegador...
timeout /t 3 >nul

:: URL del sistema. Cambia esta URL por tu dominio de Vercel de produccion si lo prefieres:
set APP_URL=http://localhost:3000/attendances/register-fingerprint
:: Ejemplo en Vercel: set APP_URL=https://tu-proyecto.vercel.app/attendances/register-fingerprint

start "" "%APP_URL%"

echo.
echo =========================================================
echo   SISTEMA DE ASISTENCIA BIOMETRICA INICIADO CON EXITO
echo   (Ya puede conectar el lector USB y comenzar)
echo =========================================================
echo.
echo Presione cualquier tecla para finalizar este instalador.
pause >nul
