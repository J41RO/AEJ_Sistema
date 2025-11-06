@echo off
setlocal enabledelayedexpansion
title Monitor AEJ POS - Estado en Tiempo Real

echo ========================================
echo    MONITOR EN TIEMPO REAL AEJ POS
echo ========================================
echo.
echo [INFO] Iniciando monitoreo continuo cada 5 segundos
echo [INFO] Presiona Ctrl+C para detener el monitor
echo.

:MONITOR_LOOP

REM Limpiar pantalla y mostrar header
cls
echo ========================================
echo    MONITOR AEJ POS - !date! !time!
echo ========================================
echo.

REM Variables de estado
set "backend_status=❌"
set "frontend_status=❌"
set "backend_pid="
set "frontend_pid="
set "backend_response="
set "frontend_response="

REM Verificar Backend (Puerto 8000)
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr :8000 ^| findstr LISTENING') do (
    set "backend_pid=%%a"
    set "backend_status=🟢"
)

REM Verificar Frontend (Puerto 5173)
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr :5173 ^| findstr LISTENING') do (
    set "frontend_pid=%%a"
    set "frontend_status=🟢"
)

REM Si no hay en 5173, verificar 3000
if "!frontend_pid!"=="" (
    for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr :3000 ^| findstr LISTENING') do (
        set "frontend_pid=%%a"
        set "frontend_status=🟢"
    )
)

REM Verificar conectividad HTTP del Backend
if not "!backend_pid!"=="" (
    powershell -Command "$start = Get-Date; try { $r = Invoke-WebRequest -Uri 'http://localhost:8000/health' -TimeoutSec 2 -UseBasicParsing; $time = [math]::Round(((Get-Date) - $start).TotalMilliseconds, 0); Write-Host \"✅ $time ms\" } catch { Write-Host \"❌ No responde\" }" > temp_backend.txt 2>nul
    set /p backend_response=<temp_backend.txt
    del temp_backend.txt >nul 2>&1
) else (
    set "backend_response=❌ Puerto libre"
)

REM Verificar conectividad HTTP del Frontend
if not "!frontend_pid!"=="" (
    powershell -Command "$start = Get-Date; try { $r = Invoke-WebRequest -Uri 'http://localhost:5173' -TimeoutSec 2 -UseBasicParsing; $time = [math]::Round(((Get-Date) - $start).TotalMilliseconds, 0); Write-Host \"✅ $time ms\" } catch { try { $r = Invoke-WebRequest -Uri 'http://localhost:3000' -TimeoutSec 2 -UseBasicParsing; $time = [math]::Round(((Get-Date) - $start).TotalMilliseconds, 0); Write-Host \"✅ $time ms (3000)\" } catch { Write-Host \"❌ No responde\" } }" > temp_frontend.txt 2>nul
    set /p frontend_response=<temp_frontend.txt
    del temp_frontend.txt >nul 2>&1
) else (
    set "frontend_response=❌ Puerto libre"
)

REM Mostrar estado actual
echo 📊 ESTADO DE SERVICIOS:
echo.
echo    🖥️ BACKEND (Puerto 8000):
echo       Estado: !backend_status! !backend_response!
if not "!backend_pid!"=="" echo       PID: !backend_pid!

echo.
echo    🌐 FRONTEND (Puerto 5173/3000):
echo       Estado: !frontend_status! !frontend_response!
if not "!frontend_pid!"=="" echo       PID: !frontend_pid!

echo.
echo 🔗 URLS DE ACCESO:
if not "!backend_pid!"=="" (
    echo    📡 Backend: http://localhost:8000
    echo    📚 API Docs: http://localhost:8000/docs
)
if not "!frontend_pid!"=="" (
    echo    🌐 Frontend: http://localhost:5173
)

echo.
echo 📈 ESTADÍSTICAS:
REM Contar procesos relacionados
set "python_count=0"
set "node_count=0"

for /f %%a in ('tasklist /FI "IMAGENAME eq python.exe" 2^>nul ^| find /C "python.exe"') do set "python_count=%%a"
for /f %%a in ('tasklist /FI "IMAGENAME eq node.exe" 2^>nul ^| find /C "node.exe"') do set "node_count=%%a"

echo    🐍 Procesos Python: !python_count!
echo    📦 Procesos Node.js: !node_count!

REM Estado general del sistema
echo.
echo 🎯 ESTADO GENERAL:
if not "!backend_pid!"=="" if not "!frontend_pid!"=="" (
    echo    🎉 SISTEMA OPERATIVO - Todo funcionando correctamente
) else if not "!backend_pid!"=="" (
    echo    ⚠️ PARCIAL - Solo Backend activo, falta Frontend
) else if not "!frontend_pid!"=="" (
    echo    ⚠️ PARCIAL - Solo Frontend activo, falta Backend  
) else (
    echo    🔴 INACTIVO - Ningún servicio está corriendo
)

echo.
echo ⏰ Próxima actualización en 5 segundos... (Ctrl+C para salir)
echo ========================================

REM Esperar 5 segundos
timeout /t 5 /nobreak >nul

REM Repetir el ciclo
goto MONITOR_LOOP