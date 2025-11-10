#!/bin/bash
# Script para ejecutar tests con coverage
# AEJ Sistema POS

echo "========================================"
echo " AEJ Sistema POS - Tests con Coverage"
echo "========================================"
echo ""

function show_menu() {
    echo "Seleccione una opción:"
    echo ""
    echo "1. Backend - Tests con Coverage"
    echo "2. Frontend - Tests con Coverage"
    echo "3. Ambos - Backend y Frontend"
    echo "4. Ver reportes en navegador"
    echo "5. Limpiar reportes de coverage"
    echo "6. Salir"
    echo ""
    read -p "Ingrese opción (1-6): " option

    case $option in
        1) run_backend ;;
        2) run_frontend ;;
        3) run_both ;;
        4) view_reports ;;
        5) clean_reports ;;
        6) exit 0 ;;
        *) echo "Opción inválida"; show_menu ;;
    esac
}

function run_backend() {
    echo ""
    echo "=== Ejecutando tests del backend con coverage ==="
    cd backend
    python -m pytest tests/ --cov --cov-report=html --cov-report=term-missing
    if [ $? -ne 0 ]; then
        echo ""
        echo "ERROR: Tests del backend fallaron"
        read -p "Presione Enter para continuar..."
        cd ..
        show_menu
        return
    fi
    echo ""
    echo "Coverage report generado en: backend/htmlcov/index.html"
    echo ""
    read -p "Presione Enter para continuar..."
    cd ..
    show_menu
}

function run_frontend() {
    echo ""
    echo "=== Ejecutando tests del frontend con coverage ==="
    npm run test:coverage
    if [ $? -ne 0 ]; then
        echo ""
        echo "ERROR: Tests del frontend fallaron"
        read -p "Presione Enter para continuar..."
        show_menu
        return
    fi
    echo ""
    echo "Coverage report generado en: coverage/index.html"
    echo ""
    read -p "Presione Enter para continuar..."
    show_menu
}

function run_both() {
    echo ""
    echo "=== Ejecutando tests del backend ==="
    cd backend
    python -m pytest tests/ --cov --cov-report=html --cov-report=term-missing
    if [ $? -ne 0 ]; then
        echo ""
        echo "ERROR: Tests del backend fallaron"
        read -p "Presione Enter para continuar..."
        cd ..
        show_menu
        return
    fi
    cd ..

    echo ""
    echo "=== Ejecutando tests del frontend ==="
    npm run test:coverage
    if [ $? -ne 0 ]; then
        echo ""
        echo "ERROR: Tests del frontend fallaron"
        read -p "Presione Enter para continuar..."
        show_menu
        return
    fi

    echo ""
    echo "========================================"
    echo " Todos los tests completados!"
    echo "========================================"
    echo "Backend report: backend/htmlcov/index.html"
    echo "Frontend report: coverage/index.html"
    echo ""
    read -p "Presione Enter para continuar..."
    show_menu
}

function view_reports() {
    echo ""
    echo "Abriendo reportes de coverage..."

    # Try different browsers
    if command -v xdg-open &> /dev/null; then
        xdg-open backend/htmlcov/index.html 2>/dev/null &
        xdg-open coverage/index.html 2>/dev/null &
    elif command -v open &> /dev/null; then
        open backend/htmlcov/index.html 2>/dev/null &
        open coverage/index.html 2>/dev/null &
    else
        echo "No se pudo abrir el navegador automáticamente"
        echo "Por favor abra manualmente:"
        echo "  - backend/htmlcov/index.html"
        echo "  - coverage/index.html"
    fi

    echo ""
    read -p "Presione Enter para continuar..."
    show_menu
}

function clean_reports() {
    echo ""
    echo "Limpiando reportes de coverage..."
    rm -rf backend/htmlcov backend/.coverage backend/.coverage.*
    rm -rf coverage .nyc_output
    echo "Reportes de coverage eliminados"
    echo ""
    read -p "Presione Enter para continuar..."
    show_menu
}

# Start
show_menu
