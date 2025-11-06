@echo off
echo ========================================
echo    INICIO RÁPIDO AEJ POS
echo ========================================
echo.

echo Selecciona una opción:
echo.
echo 1. Iniciar sistema normalmente
echo 2. Reiniciar sistema limpio (mata procesos existentes)
echo 3. Solo verificar estado
echo 4. Solo matar servicios
echo 5. Reparar dependencias
echo 6. Iniciar servicios persistentes
echo 7. Salir
echo.

set /p choice="Ingresa tu opción (1-7): "

if "%choice%"=="1" goto START_NORMAL
if "%choice%"=="2" goto RESTART_CLEAN  
if "%choice%"=="3" goto CHECK_STATUS
if "%choice%"=="4" goto KILL_SERVICES
if "%choice%"=="5" goto FIX_DEPS
if "%choice%"=="6" goto START_PERSISTENT
if "%choice%"=="7" goto EXIT
goto INVALID_CHOICE

:START_NORMAL
echo.
echo [INFO] Iniciando sistema normalmente...
call "%~dp0start-system.bat"
goto END

:RESTART_CLEAN
echo.
echo [INFO] Reiniciando sistema limpio...
call "%~dp0restart-clean.bat"
goto END

:CHECK_STATUS
echo.
echo [INFO] Verificando estado del sistema...
call "%~dp0check-ports.bat"
goto END

:KILL_SERVICES
echo.
echo [INFO] Matando todos los servicios...
call "%~dp0kill-services.bat"
goto END

:FIX_DEPS
echo.
echo [INFO] Reparando dependencias...
call "%~dp0fix-requirements.bat"
goto END

:START_PERSISTENT
echo.
echo [INFO] Iniciando servicios persistentes...
call "%~dp0start-services-persistent.bat"
goto END

:INVALID_CHOICE
echo.
echo [ERROR] Opción inválida. Por favor selecciona 1-7.
echo.
pause
goto START

:EXIT
echo.
echo [INFO] Saliendo...
exit /b 0

:END
echo.
echo [INFO] Operación completada.
pause