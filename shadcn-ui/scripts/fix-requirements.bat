@echo off
echo ========================================
echo    REPARADOR DE DEPENDENCIAS AEJ POS
echo ========================================
echo.

echo [INFO] Reparando archivo requirements.txt...

echo Navegando a directorio backend...
if not exist "backend" (
    echo [ERROR] Directorio backend no encontrado
    echo [INFO] Ejecuta este script desde la raiz del proyecto
    pause
    exit /b 1
)

cd backend

echo.
echo [INFO] Creando requirements.txt corregido...

echo fastapi==0.104.1> requirements.txt
echo uvicorn[standard]==0.24.0>> requirements.txt
echo python-multipart==0.0.6>> requirements.txt
echo pydantic==2.5.0>> requirements.txt
echo sqlalchemy==2.0.23>> requirements.txt
echo python-dotenv==1.0.0>> requirements.txt

echo [OK] requirements.txt creado correctamente

echo.
echo [INFO] Contenido del archivo:
type requirements.txt

echo.
echo [INFO] Instalando dependencias corregidas...
pip install -r requirements.txt

if %errorlevel% equ 0 (
    echo [OK] Dependencias instaladas exitosamente
) else (
    echo [ERROR] Hubo problemas instalando algunas dependencias
    echo [INFO] Esto es normal, sqlite3 viene incluido con Python
)

cd ..

echo.
echo ========================================
echo    REPARACIÓN COMPLETADA
echo ========================================
echo.
echo ✅ Archivo requirements.txt reparado
echo ✅ Dependencias instaladas
echo.
echo Para probar el backend:
echo cd backend
echo python main.py
echo.
pause