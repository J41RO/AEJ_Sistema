#!/bin/bash

echo "========================================"
echo "    INSTALADOR AEJ POS - LINUX"
echo "========================================"
echo

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js no está instalado"
    echo "Instalando Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Verificar Python
if ! command -v python3 &> /dev/null; then
    echo "ERROR: Python no está instalado"
    echo "Instalando Python..."
    sudo apt update
    sudo apt install -y python3 python3-pip python3-venv
fi

echo
echo "========================================"
echo "    INSTALANDO DEPENDENCIAS FRONTEND"
echo "========================================"
cd frontend

echo "Instalando dependencias de Node.js..."
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: Falló la instalación de dependencias del frontend"
    exit 1
fi

echo "Compilando frontend para producción..."
npm run build
if [ $? -ne 0 ]; then
    echo "ERROR: Falló la compilación del frontend"
    exit 1
fi

echo
echo "========================================"
echo "    INSTALANDO DEPENDENCIAS BACKEND"
echo "========================================"
cd ../backend

echo "Creando entorno virtual de Python..."
python3 -m venv venv
if [ $? -ne 0 ]; then
    echo "ERROR: Falló la creación del entorno virtual"
    exit 1
fi

echo "Activando entorno virtual..."
source venv/bin/activate

echo "Instalando dependencias de Python..."
pip install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "ERROR: Falló la instalación de dependencias del backend"
    exit 1
fi

echo
echo "========================================"
echo "    CONFIGURANDO ARCHIVOS"
echo "========================================"
if [ ! -f .env ]; then
    echo "Creando archivo de configuración..."
    cp .env.example .env
fi

cd ..

echo
echo "========================================"
echo "    INSTALACIÓN COMPLETADA"
echo "========================================"
echo
echo "El sistema AEJ POS ha sido instalado exitosamente!"
echo
echo "Para iniciar el sistema:"
echo "1. Frontend: cd frontend && npm run dev"
echo "2. Backend:  cd backend && source venv/bin/activate && python main.py"
echo
echo "El sistema estará disponible en: http://localhost:5173"
echo