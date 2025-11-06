@echo off
echo 🚀 ESTADO RÁPIDO AEJ POS
echo ========================

REM Backend check
netstat -an | findstr :8000 | findstr LISTENING >nul
if %errorlevel% equ 0 (
    echo ✅ Backend: ACTIVO (Puerto 8000)
) else (
    echo ❌ Backend: INACTIVO
)

REM Frontend check  
netstat -an | findstr :5173 | findstr LISTENING >nul
if %errorlevel% equ 0 (
    echo ✅ Frontend: ACTIVO (Puerto 5173)
) else (
    netstat -an | findstr :3000 | findstr LISTENING >nul
    if %errorlevel% equ 0 (
        echo ✅ Frontend: ACTIVO (Puerto 3000)
    ) else (
        echo ❌ Frontend: INACTIVO
    )
)

echo.
echo 💡 Para verificación completa: scripts\check-status.bat
echo 📊 Para monitor en tiempo real: scripts\status-monitor.bat