@echo off
echo ========================================
echo    REINICIO LIMPIO AEJ POS
echo ========================================
echo.

echo [PASO 1] Matando servicios existentes...
call "%~dp0kill-services.bat"

echo.
echo [PASO 2] Esperando limpieza completa...
timeout /t 3 /nobreak >nul

echo.
echo [PASO 3] Verificando directorio del proyecto...
if not exist "frontend" (
    echo [ERROR] No se encuentra la carpeta 'frontend'
    echo [INFO] Asegurate de ejecutar este script desde la raiz del proyecto AEJ
    pause
    exit /b 1
)

if not exist "backend" (
    echo [ERROR] No se encuentra la carpeta 'backend'
    echo [INFO] Asegurate de ejecutar este script desde la raiz del proyecto AEJ
    pause
    exit /b 1
)

echo [OK] Estructura del proyecto verificada

echo.
echo ========================================
echo    INICIANDO BACKEND LIMPIO
echo ========================================

echo Navegando a directorio backend...
cd backend

echo Verificando archivo requirements.txt...
if not exist "requirements.txt" (
    echo [ERROR] No se encuentra requirements.txt en backend/
    cd ..
    pause
    exit /b 1
)

echo Instalando/verificando dependencias Python...
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo [ERROR] Falló la instalación de dependencias Python
    cd ..
    pause
    exit /b 1
)

echo.
echo Iniciando servidor backend...
start "AEJ POS Backend - Puerto 8000" cmd /k "python main.py"

echo [OK] Backend iniciado en nueva ventana
echo [INFO] Esperando que el backend se estabilice...
timeout /t 5 /nobreak >nul

cd ..

echo.
echo ========================================
echo    INICIANDO FRONTEND LIMPIO
echo ========================================

echo Navegando a directorio frontend...
cd frontend

echo Verificando package.json...
if not exist "package.json" (
    echo [ERROR] No se encuentra package.json en frontend/
    cd ..
    pause
    exit /b 1
)

echo Instalando/verificando dependencias Node.js...
npm install
if %errorlevel% neq 0 (
    echo [ERROR] Falló la instalación de dependencias Node.js
    cd ..
    pause
    exit /b 1
)

echo.
echo Iniciando servidor frontend...
start "AEJ POS Frontend - Puerto 5173" cmd /k "npm run dev"

echo [OK] Frontend iniciado en nueva ventana

cd ..

echo.
echo ========================================
echo    REINICIO COMPLETADO
echo ========================================
echo.
echo ✅ Sistema AEJ POS reiniciado limpiamente!
echo.
echo 🖥️  Backend: http://localhost:8000
echo 🌐 Frontend: http://localhost:5173
echo 📚 API Docs: http://localhost:8000/docs
echo.
echo [INFO] Ambos servicios están corriendo en ventanas separadas
echo [INFO] Para verificar estado, ejecuta: check-ports.bat
echo [INFO] Para matar servicios, ejecuta: kill-services.bat
echo.
pause