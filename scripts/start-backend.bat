@echo off
echo ========================================
echo    INICIANDO BACKEND AEJ POS
echo ========================================
echo.

echo Navegando al directorio backend...
cd /d "%~dp0..\backend"

echo Verificando dependencias...
python -c "import fastapi, uvicorn, sqlalchemy, jose, passlib" 2>nul
if %errorlevel% neq 0 (
    echo [INFO] Instalando dependencias faltantes...
    pip install -r requirements.txt
)

echo.
echo Inicializando base de datos...
python ../scripts/init-database.py

echo.
echo Iniciando servidor backend en red...
echo.
echo 📡 Backend disponible en:
echo    - Local: http://localhost:8000
echo    - Red: http://192.168.1.137:8000
echo 📚 Documentación API: http://192.168.1.137:8000/docs
echo ❤️ Health check: http://192.168.1.137:8000/health
echo.
echo [INFO] Servidor configurado para acceso desde red (0.0.0.0:8000)
echo.

python main.py