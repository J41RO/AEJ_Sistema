@echo off
echo ========================================
echo    INSTALADOR AEJ POS - WINDOWS
echo ========================================
echo.

echo Verificando Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js no está instalado
    echo Por favor instala Node.js desde: https://nodejs.org/
    pause
    exit /b 1
)

echo Verificando Python...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python no está instalado
    echo Por favor instala Python desde: https://www.python.org/downloads/
    pause
    exit /b 1
)

echo.
echo ========================================
echo    INSTALANDO DEPENDENCIAS FRONTEND
echo ========================================
cd frontend
echo Instalando dependencias de Node.js...
npm install
if %errorlevel% neq 0 (
    echo ERROR: Falló la instalación de dependencias del frontend
    pause
    exit /b 1
)

echo Compilando frontend para producción...
npm run build
if %errorlevel% neq 0 (
    echo ERROR: Falló la compilación del frontend
    pause
    exit /b 1
)

echo.
echo ========================================
echo    INSTALANDO DEPENDENCIAS BACKEND
echo ========================================
cd ..\backend

echo Creando entorno virtual de Python...
python -m venv venv
if %errorlevel% neq 0 (
    echo ERROR: Falló la creación del entorno virtual
    pause
    exit /b 1
)

echo Activando entorno virtual...
call venv\Scripts\activate.bat

echo Instalando dependencias de Python...
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo ERROR: Falló la instalación de dependencias del backend
    pause
    exit /b 1
)

echo.
echo ========================================
echo    CONFIGURANDO ARCHIVOS
echo ========================================
if not exist .env (
    echo Creando archivo de configuración...
    copy .env.example .env
)

cd ..

echo.
echo ========================================
echo    INSTALACIÓN COMPLETADA
echo ========================================
echo.
echo El sistema AEJ POS ha sido instalado exitosamente!
echo.
echo Para iniciar el sistema:
echo 1. Frontend: cd frontend && npm run dev
echo 2. Backend:  cd backend && venv\Scripts\activate && python main.py
echo.
echo El sistema estará disponible en: http://localhost:5173
echo.
pause