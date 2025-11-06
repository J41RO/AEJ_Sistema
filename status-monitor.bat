@echo off
setlocal enabledelayedexpansion
title Monitor AEJ POS - Actualizando cada 5 segundos

echo ========================================
echo    MONITOR CONTINUO AEJ POS
echo ========================================
echo.
echo Presiona Ctrl+C para detener el monitor
echo.

:monitor_loop
cls
echo ========================================
echo    MONITOR AEJ POS - %date% %time%
echo ========================================
echo.

REM Variables de estado
set "backend_status=🔴 INACTIVO"
set "frontend_status=🔴 INACTIVO"
set "backend_pid="
set "frontend_pid="
set "backend_url="
set "frontend_url="

REM === VERIFICAR BACKEND ===
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr :8000 ^| findstr LISTENING') do (
    set "backend_pid=%%a"
    set "backend_status=🟢 ACTIVO"
    set "backend_url=http://localhost:8000"
)

REM === VERIFICAR FRONTEND ===
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr :5173 ^| findstr LISTENING') do (
    set "frontend_pid=%%a"
    set "frontend_status=🟢 ACTIVO"
    set "frontend_url=http://localhost:5173"
)

REM Verificar puerto alternativo 3000 si 5173 no está activo
if not defined frontend_pid (
    for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr :3000 ^| findstr LISTENING') do (
        set "frontend_pid=%%a"
        set "frontend_status=🟢 ACTIVO (3000)"
        set "frontend_url=http://localhost:3000"
    )
)

REM === MOSTRAR ESTADO ACTUAL ===
echo 📡 BACKEND (Puerto 8000)
echo    Estado: !backend_status!
if defined backend_pid (
    echo    PID: !backend_pid!
    echo    URL: !backend_url!
    
    REM Verificar salud HTTP rápida
    python -c "
import requests
try:
    response = requests.get('http://localhost:8000/health', timeout=2)
    if response.status_code == 200:
        print('    Salud: ✅ OK')
    else:
        print('    Salud: ⚠️ ERROR')
except:
    print('    Salud: ❌ NO RESPONDE')
" 2>nul
) else (
    echo    Puerto libre
)

echo.
echo 🌐 FRONTEND
echo    Estado: !frontend_status!
if defined frontend_pid (
    echo    PID: !frontend_pid!
    echo    URL: !frontend_url!
) else (
    echo    Puerto libre
)

echo.
echo === ACCESOS RÁPIDOS ===
if defined backend_pid if defined frontend_pid (
    echo ✅ SISTEMA COMPLETO ACTIVO
    echo    🌐 Aplicación: !frontend_url!
    echo    📡 API: !backend_url!
    echo    📚 Docs: !backend_url!/docs
) else if defined backend_pid (
    echo ⚠️ SOLO BACKEND ACTIVO
    echo    💡 Iniciar frontend: npm run dev
) else if defined frontend_pid (
    echo ⚠️ SOLO FRONTEND ACTIVO  
    echo    💡 Iniciar backend: python main.py
) else (
    echo 🔴 SISTEMA INACTIVO
    echo    💡 Iniciar todo: start-system.bat
)

echo.
echo === PROCESOS RELACIONADOS ===
set "python_count=0"
set "node_count=0"

for /f %%a in ('tasklist /FI "IMAGENAME eq python.exe" 2^>nul ^| find /c "python.exe"') do set "python_count=%%a"
for /f %%a in ('tasklist /FI "IMAGENAME eq node.exe" 2^>nul ^| find /c "node.exe"') do set "node_count=%%a"

echo Python: !python_count! procesos
echo Node.js: !node_count! procesos

echo.
echo ========================================
echo Próxima actualización en 5 segundos...
echo Presiona Ctrl+C para salir
echo ========================================

REM Esperar 5 segundos
timeout /t 5 /nobreak >nul 2>&1

goto monitor_loop