@echo off
echo ========================================
echo    CONFIGURADOR DE RED AEJ POS
echo ========================================
echo.

echo Este script te ayuda a configurar la IP del servidor para el sistema AEJ POS
echo.

REM Obtener IP actual
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4"') do (
    set "current_ip=%%a"
    set "current_ip=!current_ip: =!"
    goto :found_ip
)
:found_ip

echo 📍 IP actual detectada: %current_ip%
echo.

echo Selecciona la configuración:
echo 1. Localhost (desarrollo local)
echo 2. IP actual (%current_ip%)
echo 3. IP personalizada
echo 4. Mostrar configuración actual
echo.

set /p option="Selecciona una opción (1-4): "

if "%option%"=="1" (
    echo.
    echo Configurando para localhost...
    echo VITE_API_URL=http://localhost:8000> .env
    echo ✅ Configurado para desarrollo local
    echo 🌐 Frontend: http://localhost:5173
    echo 📡 Backend: http://localhost:8000
)

if "%option%"=="2" (
    echo.
    echo Configurando para IP actual %current_ip%...
    echo VITE_API_URL=http://%current_ip%:8000> .env
    echo ✅ Configurado para red local
    echo 🌐 Frontend: http://%current_ip%:5173
    echo 📡 Backend: http://%current_ip%:8000
)

if "%option%"=="3" (
    echo.
    set /p custom_ip="Ingresa la IP del servidor: "
    echo Configurando para IP personalizada !custom_ip!...
    echo VITE_API_URL=http://!custom_ip!:8000> .env
    echo ✅ Configurado para IP personalizada
    echo 🌐 Frontend: http://!custom_ip!:5173
    echo 📡 Backend: http://!custom_ip!:8000
)

if "%option%"=="4" (
    echo.
    echo 📋 Configuración actual:
    if exist .env (
        type .env
    ) else (
        echo ❌ No hay archivo .env configurado
        echo 💡 Ejecuta este script para crear la configuración
    )
)

echo.
echo 💡 Notas importantes:
echo    - Reinicia el frontend después de cambiar la configuración
echo    - El backend siempre se ejecuta en 0.0.0.0:8000 (accesible desde red)
echo    - Asegúrate de que el firewall permita el puerto 8000
echo.

pause