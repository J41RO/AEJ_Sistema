@echo off
echo ========================================
echo    SERVICIOS PERSISTENTES AEJ POS
echo ========================================
echo.

echo [INFO] Este script mantiene los servicios corriendo permanentemente
echo [INFO] Los servicios se reiniciarán automáticamente si fallan
echo.

:MAIN_LOOP

echo ========================================
echo    VERIFICANDO SERVICIOS
echo ========================================
echo Hora: %time%
echo.

REM Verificar Backend
netstat -an | findstr :8000 >nul 2>&1
if %errorlevel% neq 0 (
    echo [REINICIANDO] Backend no está corriendo, iniciando...
    cd backend
    start "AEJ Backend Persistente" /MIN cmd /c "python main.py"
    cd ..
    timeout /t 5 /nobreak >nul
) else (
    echo [OK] Backend corriendo en puerto 8000
)

REM Verificar Frontend
netstat -an | findstr :5173 >nul 2>&1
if %errorlevel% neq 0 (
    echo [REINICIANDO] Frontend no está corriendo, iniciando...
    cd frontend
    start "AEJ Frontend Persistente" /MIN cmd /c "npm run dev"
    cd ..
    timeout /t 5 /nobreak >nul
) else (
    echo [OK] Frontend corriendo en puerto 5173
)

echo.
echo [INFO] Próxima verificación en 30 segundos...
echo [INFO] Presiona Ctrl+C para detener el monitor
echo.

timeout /t 30 /nobreak >nul

goto MAIN_LOOP