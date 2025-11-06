@echo off
setlocal enabledelayedexpansion
echo ========================================
echo    VERIFICADOR INTELIGENTE AEJ POS
echo ========================================
echo.

set "backend_status=❌ INACTIVO"
set "frontend_status=❌ INACTIVO"
set "backend_pid="
set "frontend_pid="
set "backend_url_local=http://localhost:8000"
set "backend_url_network=http://192.168.1.137:8000"
set "frontend_url_local=http://localhost:5173"
set "frontend_url_network=http://192.168.1.137:5173"

echo [INFO] Analizando estado del sistema...
echo Fecha: %date% %time%
echo.

REM ========================================
REM VERIFICACIÓN DE PUERTOS
REM ========================================
echo ========================================
echo    VERIFICACIÓN DE PUERTOS
echo ========================================

echo.
echo 🔍 Verificando puerto 8000 (Backend)...
for /f "tokens=2,5" %%a in ('netstat -aon ^| findstr :8000 ^| findstr LISTENING') do (
    set "backend_pid=%%b"
    set "backend_status=🟢 ACTIVO"
    echo    ✅ Puerto 8000 ocupado por PID: %%b
)

if "!backend_pid!"=="" (
    echo    ❌ Puerto 8000 libre - Backend no está corriendo
) else (
    REM Obtener nombre del proceso
    for /f "tokens=1" %%c in ('tasklist /FI "PID eq !backend_pid!" /FO CSV /NH 2^>nul') do (
        set "backend_process=%%c"
        echo    📋 Proceso: %%c
    )
)

echo.
echo 🔍 Verificando puerto 5173 (Frontend)...
for /f "tokens=2,5" %%a in ('netstat -aon ^| findstr :5173 ^| findstr LISTENING') do (
    set "frontend_pid=%%b"
    set "frontend_status=🟢 ACTIVO"
    echo    ✅ Puerto 5173 ocupado por PID: %%b
)

if "!frontend_pid!"=="" (
    echo    ❌ Puerto 5173 libre - Frontend no está corriendo
    
    REM Verificar puerto alternativo 3000
    echo    🔍 Verificando puerto alternativo 3000...
    for /f "tokens=2,5" %%a in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING') do (
        set "frontend_pid=%%b"
        set "frontend_status=🟢 ACTIVO (Puerto 3000)"
        set "frontend_url_local=http://localhost:3000"
        set "frontend_url_network=http://192.168.1.137:3000"
        echo    ✅ Puerto 3000 ocupado por PID: %%b
    )
) else (
    REM Obtener nombre del proceso
    for /f "tokens=1" %%c in ('tasklist /FI "PID eq !frontend_pid!" /FO CSV /NH 2^>nul') do (
        set "frontend_process=%%c"
        echo    📋 Proceso: %%c
    )
)

REM ========================================
REM VERIFICACIÓN HTTP INTELIGENTE
REM ========================================
echo.
echo ========================================
echo    VERIFICACIÓN HTTP INTELIGENTE
echo ========================================

echo.
echo 🌐 Probando conectividad Backend Local (!backend_url_local!)...
powershell -Command "try { $response = Invoke-WebRequest -Uri '!backend_url_local!/health' -TimeoutSec 3 -UseBasicParsing; if($response.StatusCode -eq 200) { Write-Host '    ✅ Backend Local responde correctamente (HTTP 200)' } else { Write-Host '    ⚠️ Backend Local responde pero con código:' $response.StatusCode } } catch { Write-Host '    ❌ Backend Local no responde o error de conexión' }"

echo.
echo 🌐 Probando conectividad Backend Red (!backend_url_network!)...
powershell -Command "try { $response = Invoke-WebRequest -Uri '!backend_url_network!/health' -TimeoutSec 3 -UseBasicParsing; if($response.StatusCode -eq 200) { Write-Host '    ✅ Backend Red responde correctamente (HTTP 200)' } else { Write-Host '    ⚠️ Backend Red responde pero con código:' $response.StatusCode } } catch { Write-Host '    ❌ Backend Red no responde o error de conexión' }"

echo.
echo 🌐 Probando conectividad Frontend Local (!frontend_url_local!)...
powershell -Command "try { $response = Invoke-WebRequest -Uri '!frontend_url_local!' -TimeoutSec 3 -UseBasicParsing; if($response.StatusCode -eq 200) { Write-Host '    ✅ Frontend Local responde correctamente (HTTP 200)' } else { Write-Host '    ⚠️ Frontend Local responde pero con código:' $response.StatusCode } } catch { Write-Host '    ❌ Frontend Local no responde o error de conexión' }"

echo.
echo 🌐 Probando conectividad Frontend Red (!frontend_url_network!)...
powershell -Command "try { $response = Invoke-WebRequest -Uri '!frontend_url_network!' -TimeoutSec 3 -UseBasicParsing; if($response.StatusCode -eq 200) { Write-Host '    ✅ Frontend Red responde correctamente (HTTP 200)' } else { Write-Host '    ⚠️ Frontend Red responde pero con código:' $response.StatusCode } } catch { Write-Host '    ❌ Frontend Red no responde o error de conexión' }"

REM ========================================
REM ANÁLISIS DE PROCESOS
REM ========================================
echo.
echo ========================================
echo    ANÁLISIS DE PROCESOS
echo ========================================

echo.
echo 🐍 Procesos Python relacionados:
set "python_count=0"
for /f "tokens=2,5" %%a in ('tasklist /FI "IMAGENAME eq python.exe" /FO CSV 2^>nul ^| findstr /V "Image"') do (
    set /a python_count+=1
    echo    PID: %%a - Comando: %%b
)
if !python_count! equ 0 echo    ℹ️ No hay procesos Python activos

echo.
echo 📦 Procesos Node.js relacionados:
set "node_count=0"
for /f "tokens=2,5" %%a in ('tasklist /FI "IMAGENAME eq node.exe" /FO CSV 2^>nul ^| findstr /V "Image"') do (
    set /a node_count+=1
    echo    PID: %%a - Comando: %%b
)
if !node_count! equ 0 echo    ℹ️ No hay procesos Node.js activos

REM ========================================
REM RESUMEN EJECUTIVO
REM ========================================
echo.
echo ========================================
echo    RESUMEN EJECUTIVO
echo ========================================

echo.
echo 📊 ESTADO ACTUAL:
echo    🖥️ Backend (8000):  !backend_status!
if not "!backend_pid!"=="" echo       └─ PID: !backend_pid! - Proceso: !backend_process!
echo    🌐 Frontend:        !frontend_status!
if not "!frontend_pid!"=="" echo       └─ PID: !frontend_pid! - Proceso: !frontend_process!

echo.
echo 🔗 URLS DE ACCESO:
if not "!backend_pid!"=="" (
    echo    📡 API Backend Local:   !backend_url_local!
    echo    📡 API Backend Red:     !backend_url_network!
    echo    📚 Documentación:       !backend_url_network!/docs
    echo    💚 Health Check:        !backend_url_network!/health
)
if not "!frontend_pid!"=="" (
    echo    🌐 Aplicación Local:    !frontend_url_local!
    echo    🌐 Aplicación Red:      !frontend_url_network!
)

echo.
echo 🎯 ESTADO DEL SISTEMA:
if not "!backend_pid!"=="" if not "!frontend_pid!"=="" (
    echo    🎉 ¡SISTEMA COMPLETAMENTE OPERATIVO!
    echo    ✅ Ambos servicios están corriendo correctamente
    echo    🌐 Accesible desde la red local (192.168.1.137)
    echo.
    echo    💡 Acciones disponibles:
    echo       - Abrir aplicación local: start !frontend_url_local!
    echo       - Abrir aplicación red: start !frontend_url_network!
    echo       - Ver API docs: start !backend_url_network!/docs
    echo       - Monitorear: scripts\status-monitor.bat
) else (
    echo    ⚠️ Sistema parcialmente operativo o inactivo
    echo.
    echo    🔧 Acciones recomendadas:
    if "!backend_pid!"=="" echo       - Iniciar backend: scripts\start-backend.bat
    if "!frontend_pid!"=="" echo       - Iniciar frontend: npm run dev
    echo       - Reinicio limpio: scripts\restart-clean.bat
    echo       - Matar zombis: scripts\kill-services.bat
)

echo.
echo ========================================
echo    VERIFICACIÓN COMPLETADA
echo ========================================
echo.

REM Preguntar si abrir aplicación
if not "!frontend_pid!"=="" (
    echo ¿Deseas abrir la aplicación? (1=Local, 2=Red, N=No)
    set /p choice="> "
    if "!choice!"=="1" start !frontend_url_local!
    if "!choice!"=="2" start !frontend_url_network!
)

pause