#!/bin/bash

echo "========================================"
echo "    INICIANDO SISTEMA AEJ POS"
echo "========================================"
echo

echo "Iniciando Backend..."
cd backend
source venv/bin/activate
python main.py &
BACKEND_PID=$!

echo "Backend iniciado con PID: $BACKEND_PID"
sleep 3

echo "Iniciando Frontend..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo "Frontend iniciado con PID: $FRONTEND_PID"

echo
echo "Sistema AEJ POS iniciado!"
echo
echo "Backend: http://localhost:8000"
echo "Frontend: http://localhost:5173"
echo
echo "Para detener el sistema, presiona Ctrl+C"

# Función para limpiar procesos al salir
cleanup() {
    echo
    echo "Deteniendo sistema..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "Sistema detenido."
    exit 0
}

# Capturar señal de interrupción
trap cleanup INT

# Mantener el script corriendo
wait