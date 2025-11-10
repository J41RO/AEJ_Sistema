@echo off
REM Script para ejecutar tests con coverage
REM AEJ Sistema POS

echo ========================================
echo  AEJ Sistema POS - Tests con Coverage
echo ========================================
echo.

:menu
echo Seleccione una opcion:
echo.
echo 1. Backend - Tests con Coverage
echo 2. Frontend - Tests con Coverage
echo 3. Ambos - Backend y Frontend
echo 4. Ver reportes en navegador
echo 5. Limpiar reportes de coverage
echo 6. Salir
echo.
set /p option="Ingrese opcion (1-6): "

if "%option%"=="1" goto backend
if "%option%"=="2" goto frontend
if "%option%"=="3" goto both
if "%option%"=="4" goto view
if "%option%"=="5" goto clean
if "%option%"=="6" goto end
echo Opcion invalida
goto menu

:backend
echo.
echo === Ejecutando tests del backend con coverage ===
cd backend
python -m pytest tests/ --cov --cov-report=html --cov-report=term-missing
if errorlevel 1 (
    echo.
    echo ERROR: Tests del backend fallaron
    pause
    goto menu
)
echo.
echo Coverage report generado en: backend\htmlcov\index.html
echo.
pause
goto menu

:frontend
echo.
echo === Ejecutando tests del frontend con coverage ===
cd ..
call npm run test:coverage
if errorlevel 1 (
    echo.
    echo ERROR: Tests del frontend fallaron
    pause
    goto menu
)
echo.
echo Coverage report generado en: coverage\index.html
echo.
pause
goto menu

:both
echo.
echo === Ejecutando tests del backend ===
cd backend
python -m pytest tests/ --cov --cov-report=html --cov-report=term-missing
if errorlevel 1 (
    echo.
    echo ERROR: Tests del backend fallaron
    pause
    goto menu
)
echo.
echo === Ejecutando tests del frontend ===
cd ..
call npm run test:coverage
if errorlevel 1 (
    echo.
    echo ERROR: Tests del frontend fallaron
    pause
    goto menu
)
echo.
echo ========================================
echo  Todos los tests completados!
echo ========================================
echo Backend report: backend\htmlcov\index.html
echo Frontend report: coverage\index.html
echo.
pause
goto menu

:view
echo.
echo Abriendo reportes de coverage...
start backend\htmlcov\index.html
start coverage\index.html
echo.
pause
goto menu

:clean
echo.
echo Limpiando reportes de coverage...
if exist backend\htmlcov rmdir /s /q backend\htmlcov
if exist backend\.coverage del backend\.coverage
if exist coverage rmdir /s /q coverage
if exist .nyc_output rmdir /s /q .nyc_output
echo Reportes de coverage eliminados
echo.
pause
goto menu

:end
echo.
echo Saliendo...
exit /b 0
