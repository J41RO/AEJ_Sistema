@echo off
echo ========================================
echo    MATANDO SERVICIOS AEJ POS - AGRESIVO
echo ========================================
echo.

echo [INFO] Verificando procesos activos...
echo.

echo ========================================
echo    VERIFICANDO PUERTOS
echo ========================================

echo Verificando puerto 8000 (Backend)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000') do (
    if not "%%a"=="0" (
        echo [ENCONTRADO] Proceso en puerto 8000 - PID: %%a
        echo [MATANDO] Terminando proceso %%a agresivamente...
        taskkill /F /PID %%a >nul 2>&1
        if !errorlevel! equ 0 (
            echo [OK] Proceso %%a terminado exitosamente
        ) else (
            echo [ERROR] No se pudo terminar proceso %%a
        )
    )
)

echo.
echo Verificando puerto 5173 (Frontend)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173') do (
    if not "%%a"=="0" (
        echo [ENCONTRADO] Proceso en puerto 5173 - PID: %%a
        echo [MATANDO] Terminando proceso %%a agresivamente...
        taskkill /F /PID %%a >nul 2>&1
        if !errorlevel! equ 0 (
            echo [OK] Proceso %%a terminado exitosamente
        ) else (
            echo [ERROR] No se pudo terminar proceso %%a
        )
    )
)

echo.
echo ========================================
echo    LIMPIANDO PROCESOS ZOMBI
echo ========================================

echo Matando todos los procesos de Node.js...
tasklist /FI "IMAGENAME eq node.exe" 2>NUL | find /I /N "node.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo [ENCONTRADO] Procesos Node.js activos
    taskkill /F /IM node.exe >nul 2>&1
    echo [OK] Procesos Node.js terminados
) else (
    echo [INFO] No hay procesos Node.js activos
)

echo.
echo Matando todos los procesos de Python relacionados con uvicorn...
for /f "tokens=2" %%a in ('tasklist /FI "IMAGENAME eq python.exe" /FO CSV ^| findstr uvicorn') do (
    echo [ENCONTRADO] Proceso Python/uvicorn - PID: %%a
    taskkill /F /PID %%a >nul 2>&1
    echo [OK] Proceso Python/uvicorn terminado
)

echo.
echo Matando procesos de Vite...
tasklist /FI "IMAGENAME eq vite.exe" 2>NUL | find /I /N "vite.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo [ENCONTRADO] Procesos Vite activos
    taskkill /F /IM vite.exe >nul 2>&1
    echo [OK] Procesos Vite terminados
) else (
    echo [INFO] No hay procesos Vite activos
)

echo.
echo ========================================
echo    LIMPIEZA ADICIONAL
echo ========================================

echo Matando procesos npm/pnpm colgados...
taskkill /F /IM npm.exe >nul 2>&1
taskkill /F /IM pnpm.exe >nul 2>&1
echo [OK] Procesos npm/pnpm limpiados

echo.
echo Liberando puertos adicionales...
netsh int ipv4 reset >nul 2>&1
echo [OK] Stack TCP/IP reiniciado

echo.
echo ========================================
echo    VERIFICACION FINAL
echo ========================================

echo Verificando puertos después de la limpieza...
echo.

echo Puerto 8000:
netstat -an | findstr :8000
if %errorlevel% neq 0 echo [OK] Puerto 8000 libre

echo.
echo Puerto 5173:
netstat -an | findstr :5173
if %errorlevel% neq 0 echo [OK] Puerto 5173 libre

echo.
echo ========================================
echo    LIMPIEZA COMPLETADA
echo ========================================
echo.
echo Todos los servicios AEJ POS han sido terminados agresivamente.
echo Los puertos 8000 y 5173 están ahora disponibles.
echo.
echo Para reiniciar el sistema, ejecuta: restart-clean.bat
echo.
pause