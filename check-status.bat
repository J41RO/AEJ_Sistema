@echo off
setlocal enabledelayedexpansion
echo ========================================
echo    DETECTOR INTELIGENTE AEJ POS
echo ========================================
echo.

set "backend_status=🔴 INACTIVO"
set "frontend_status=🔴 INACTIVO"
set "backend_pid="
set "frontend_pid="
set "backend_health=❌"
set "frontend_health=❌"

echo Verificando servicios...
echo.

REM === VERIFICAR BACKEND (Puerto 8000) ===
echo === BACKEND (Puerto 8000) ===
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr :8000 ^| findstr LISTENING') do (
    set "backend_pid=%%a"
    set "backend_status=🟢 ACTIVO"
)

if defined backend_pid (
    echo Estado: !backend_status!
    echo PID: !backend_pid!
    
    REM Obtener nombre del proceso
    for /f "tokens=1" %%b in ('tasklist /FI "PID eq !backend_pid!" /FO CSV /NH 2^>nul') do (
        set "process_name=%%b"
        set "process_name=!process_name:"=!"
        echo Proceso: !process_name!
    )
    
    REM Verificar salud HTTP
    echo Verificando salud HTTP...
    python -c "
import requests
import sys
try:
    response = requests.get('http://localhost:8000/health', timeout=3)
    if response.status_code == 200:
        print('Salud: ✅ SALUDABLE ({}ms)'.format(int(response.elapsed.total_seconds() * 1000)))
    else:
        print('Salud: ⚠️ RESPONDE PERO ERROR ({})'.format(response.status_code))
except:
    print('Salud: ❌ NO RESPONDE (Posible Zombi)')
" 2>nul
    if errorlevel 1 (
        echo Salud: ❌ NO RESPONDE ^(Posible Zombi^)
    )
    
    echo URL: http://localhost:8000
    echo Docs: http://localhost:8000/docs
) else (
    echo Estado: !backend_status!
    echo Puerto 8000 libre
)

echo.

REM === VERIFICAR FRONTEND (Puerto 5173) ===
echo === FRONTEND (Puerto 5173) ===
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr :5173 ^| findstr LISTENING') do (
    set "frontend_pid=%%a"
    set "frontend_status=🟢 ACTIVO"
)

if defined frontend_pid (
    echo Estado: !frontend_status!
    echo PID: !frontend_pid!
    
    REM Obtener nombre del proceso
    for /f "tokens=1" %%b in ('tasklist /FI "PID eq !frontend_pid!" /FO CSV /NH 2^>nul') do (
        set "process_name=%%b"
        set "process_name=!process_name:"=!"
        echo Proceso: !process_name!
    )
    
    echo URL: http://localhost:5173
) else (
    echo Estado: !frontend_status!
    echo Puerto 5173 libre
    
    REM Verificar puerto alternativo 3000
    for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr :3000 ^| findstr LISTENING') do (
        set "frontend_pid=%%a"
        set "frontend_status=🟢 ACTIVO (Puerto 3000)"
        echo Estado: !frontend_status!
        echo PID: !frontend_pid!
        echo URL: http://localhost:3000
    )
)

echo.

REM === RESUMEN Y SUGERENCIAS ===
echo ========================================
echo    RESUMEN DEL SISTEMA
echo ========================================
echo Backend:  !backend_status!
echo Frontend: !frontend_status!
echo.

REM Sugerencias basadas en el estado
if not defined backend_pid if not defined frontend_pid (
    echo 💡 SUGERENCIA: Ambos servicios están inactivos
    echo    Ejecuta: start-system.bat
    echo.
) else if not defined backend_pid (
    echo 💡 SUGERENCIA: Solo falta el backend
    echo    Ejecuta: python main.py
    echo.
) else if not defined frontend_pid (
    echo 💡 SUGERENCIA: Solo falta el frontend  
    echo    Ejecuta: npm run dev
    echo.
) else (
    echo ✅ SISTEMA COMPLETO ACTIVO
    echo    Backend: http://localhost:8000
    echo    Frontend: http://localhost:5173
    echo.
)

REM === PROCESOS RELACIONADOS ===
echo === PROCESOS RELACIONADOS ===
echo.
echo Procesos Python activos:
tasklist /FI "IMAGENAME eq python.exe" 2>nul | findstr python.exe
if errorlevel 1 echo   Ninguno

echo.
echo Procesos Node.js activos:
tasklist /FI "IMAGENAME eq node.exe" 2>nul | findstr node.exe  
if errorlevel 1 echo   Ninguno

echo.
echo ========================================
echo Para monitoreo continuo: status-monitor.bat
echo Para matar servicios: kill-services.bat
echo Para reinicio limpio: restart-clean.bat
echo ========================================
pause