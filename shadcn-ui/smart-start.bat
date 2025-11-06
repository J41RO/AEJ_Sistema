@echo off
setlocal enabledelayedexpansion
echo ========================================
echo    INICIADOR INTELIGENTE AEJ POS
echo ========================================
echo.

set "backend_running="
set "frontend_running="
set "need_backend="
set "need_frontend="

echo Verificando estado actual del sistema...
echo.

REM === VERIFICAR BACKEND ===
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr :8000 ^| findstr LISTENING') do (
    set "backend_running=%%a"
)

if defined backend_running (
    echo 🟢 Backend YA ESTÁ CORRIENDO (PID: !backend_running!)
    
    REM Verificar si responde
    python -c "
import requests
try:
    response = requests.get('http://localhost:8000/health', timeout=3)
    if response.status_code == 200:
        print('   ✅ Backend saludable')
        exit(0)
    else:
        print('   ⚠️ Backend responde con errores')
        exit(1)
except:
    print('   ❌ Backend no responde (zombi)')
    exit(2)
" 2>nul
    
    if errorlevel 2 (
        echo   💡 Matando proceso zombi...
        taskkill /F /PID !backend_running! >nul 2>&1
        set "need_backend=1"
        echo   🔄 Backend zombi eliminado, se reiniciará
    ) else if errorlevel 1 (
        echo   ⚠️ Backend con problemas pero funcional
    )
) else (
    echo 🔴 Backend NO está corriendo
    set "need_backend=1"
)

echo.

REM === VERIFICAR FRONTEND ===
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr :5173 ^| findstr LISTENING') do (
    set "frontend_running=%%a"
)

if not defined frontend_running (
    for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr :3000 ^| findstr LISTENING') do (
        set "frontend_running=%%a"
    )
)

if defined frontend_running (
    echo 🟢 Frontend YA ESTÁ CORRIENDO (PID: !frontend_running!)
) else (
    echo 🔴 Frontend NO está corriendo
    set "need_frontend=1"
)

echo.
echo ========================================

REM === INICIAR SERVICIOS NECESARIOS ===
if defined need_backend if defined need_frontend (
    echo 🚀 INICIANDO SISTEMA COMPLETO...
    echo.
    
    echo Iniciando Backend...
    start "AEJ POS Backend" cmd /k "cd /d "%~dp0" && echo 🚀 Iniciando Backend AEJ POS... && python main.py"
    
    echo Esperando que el backend se inicie...
    timeout /t 5 /nobreak >nul
    
    echo Iniciando Frontend...
    start "AEJ POS Frontend" cmd /k "cd /d "%~dp0" && echo 🌐 Iniciando Frontend AEJ POS... && npm run dev"
    
    echo.
    echo ✅ SISTEMA COMPLETO INICIADO
    
) else if defined need_backend (
    echo 🚀 INICIANDO SOLO BACKEND...
    echo.
    start "AEJ POS Backend" cmd /k "cd /d "%~dp0" && echo 🚀 Iniciando Backend AEJ POS... && python main.py"
    echo ✅ Backend iniciado
    
) else if defined need_frontend (
    echo 🚀 INICIANDO SOLO FRONTEND...
    echo.
    start "AEJ POS Frontend" cmd /k "cd /d "%~dp0" && echo 🌐 Iniciando Frontend AEJ POS... && npm run dev"
    echo ✅ Frontend iniciado
    
) else (
    echo ✅ SISTEMA YA ESTÁ COMPLETAMENTE ACTIVO
    echo.
    echo 🌐 Aplicación: http://localhost:5173
    echo 📡 API: http://localhost:8000
    echo 📚 Documentación: http://localhost:8000/docs
    echo.
    echo ¿Deseas abrir la aplicación en el navegador? (S/N)
    set /p choice="> "
    
    if /i "!choice!"=="S" (
        start http://localhost:5173
    )
)

echo.
echo ========================================
echo    INICIADOR INTELIGENTE COMPLETADO
echo ========================================
echo.

if defined need_backend (
    echo ⏳ Esperando 8 segundos para verificar inicio...
    timeout /t 8 /nobreak >nul
    
    echo 🔍 Verificando estado final...
    call "%~dp0check-status.bat"
) else (
    echo Para verificar estado: check-status.bat
    echo Para monitoreo continuo: status-monitor.bat
)

echo.
pause