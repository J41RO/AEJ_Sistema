@echo off
echo ========================================
echo    INICIANDO SISTEMA AEJ POS
echo ========================================
echo.

echo Iniciando Backend...
start "AEJ POS Backend" cmd /k "cd backend && venv\Scripts\activate && python main.py"

timeout /t 3 /nobreak >nul

echo Iniciando Frontend...
start "AEJ POS Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo Sistema AEJ POS iniciado!
echo.
echo Backend: http://localhost:8000
echo Frontend: http://localhost:5173
echo.
echo Presiona cualquier tecla para cerrar esta ventana...
pause >nul