@echo off
echo ========================================
echo    VERIFICADOR DE PUERTOS AEJ POS
echo ========================================
echo.

echo Verificando estado de servicios AEJ POS...
echo Fecha y hora: %date% %time%
echo.

echo ========================================
echo    ESTADO DE PUERTOS
echo ========================================

echo.
echo 🔍 PUERTO 8000 (Backend):
netstat -an | findstr :8000
if %errorlevel% equ 0 (
    echo ✅ [ACTIVO] Backend corriendo en puerto 8000
    
    echo.
    echo 📊 Detalles del proceso:
    for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000 ^| findstr LISTENING') do (
        echo    PID: %%a
        for /f "tokens=1,2" %%b in ('tasklist /FI "PID eq %%a" /FO CSV /NH') do (
            echo    Proceso: %%b
            echo    Memoria: %%c
        )
    )
) else (
    echo ❌ [INACTIVO] Backend NO está corriendo
    echo    💡 Para iniciar: cd backend && python main.py
)

echo.
echo 🔍 PUERTO 5173 (Frontend):
netstat -an | findstr :5173
if %errorlevel% equ 0 (
    echo ✅ [ACTIVO] Frontend corriendo en puerto 5173
    
    echo.
    echo 📊 Detalles del proceso:
    for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173 ^| findstr LISTENING') do (
        echo    PID: %%a
        for /f "tokens=1,2" %%b in ('tasklist /FI "PID eq %%a" /FO CSV /NH') do (
            echo    Proceso: %%b
            echo    Memoria: %%c
        )
    )
) else (
    echo ❌ [INACTIVO] Frontend NO está corriendo
    echo    💡 Para iniciar: cd frontend && npm run dev
)

echo.
echo ========================================
echo    PROCESOS RELACIONADOS
echo ========================================

echo.
echo 🐍 Procesos Python activos:
tasklist /FI "IMAGENAME eq python.exe" /FO TABLE 2>NUL | findstr /V "INFO:"
if %errorlevel% neq 0 echo    ℹ️  No hay procesos Python activos

echo.
echo 📦 Procesos Node.js activos:
tasklist /FI "IMAGENAME eq node.exe" /FO TABLE 2>NUL | findstr /V "INFO:"
if %errorlevel% neq 0 echo    ℹ️  No hay procesos Node.js activos

echo.
echo ========================================
echo    CONECTIVIDAD
echo ========================================

echo.
echo 🌐 Probando conectividad backend...
curl -s http://localhost:8000/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Backend responde correctamente
) else (
    echo ❌ Backend no responde o no está disponible
)

echo.
echo 🌐 Probando conectividad frontend...
curl -s http://localhost:5173 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Frontend responde correctamente
) else (
    echo ❌ Frontend no responde o no está disponible
)

echo.
echo ========================================
echo    RESUMEN RÁPIDO
echo ========================================
echo.

set backend_status=❌ INACTIVO
set frontend_status=❌ INACTIVO

netstat -an | findstr :8000 >nul 2>&1
if %errorlevel% equ 0 set backend_status=✅ ACTIVO

netstat -an | findstr :5173 >nul 2>&1
if %errorlevel% equ 0 set frontend_status=✅ ACTIVO

echo 🖥️  Backend (8000):  %backend_status%
echo 🌐 Frontend (5173): %frontend_status%
echo.

if "%backend_status%"=="✅ ACTIVO" if "%frontend_status%"=="✅ ACTIVO" (
    echo 🎉 ¡SISTEMA COMPLETAMENTE OPERATIVO!
    echo.
    echo 📱 Acceder al sistema: http://localhost:5173
    echo 📚 Documentación API: http://localhost:8000/docs
) else (
    echo ⚠️  Sistema parcialmente operativo o inactivo
    echo.
    echo 🔧 Comandos útiles:
    echo    - Reiniciar todo: restart-clean.bat
    echo    - Matar servicios: kill-services.bat
    echo    - Iniciar backend: cd backend ^&^& python main.py
    echo    - Iniciar frontend: cd frontend ^&^& npm run dev
)

echo.
echo ========================================
echo    VERIFICACIÓN COMPLETADA
echo ========================================
echo.
pause