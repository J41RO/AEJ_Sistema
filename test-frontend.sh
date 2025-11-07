#!/bin/bash

echo "========================================"
echo "    TEST DEL FRONTEND - AEJ SISTEMA    "
echo "========================================"
echo ""

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para verificar
check_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ PASS${NC}"
        return 0
    else
        echo -e "${RED}✗ FAIL${NC}"
        return 1
    fi
}

PASS_COUNT=0
FAIL_COUNT=0

# Test 1: Verificar que el servidor frontend está corriendo
echo -n "Test 1: Servidor frontend activo (puerto 5173)... "
curl -s -o /dev/null -w "%{http_code}" http://localhost:5173 | grep -q "200"
if check_status $?; then ((PASS_COUNT++)); else ((FAIL_COUNT++)); fi

# Test 2: Verificar que la página principal carga
echo -n "Test 2: Página principal carga correctamente... "
curl -s http://localhost:5173 | grep -q "Sistema POS AEJ"
if check_status $?; then ((PASS_COUNT++)); else ((FAIL_COUNT++)); fi

# Test 3: Verificar que React está configurado
echo -n "Test 3: React configurado correctamente... "
curl -s http://localhost:5173 | grep -q "react-refresh"
if check_status $?; then ((PASS_COUNT++)); else ((FAIL_COUNT++)); fi

# Test 4: Verificar Vite HMR
echo -n "Test 4: Vite HMR activo... "
curl -s http://localhost:5173/@vite/client | grep -q "HMRContext"
if check_status $?; then ((PASS_COUNT++)); else ((FAIL_COUNT++)); fi

# Test 5: Verificar archivo main.tsx
echo -n "Test 5: Punto de entrada main.tsx existe... "
test -f /home/admin-jairo/AEJ_Sistema/src/main.tsx
if check_status $?; then ((PASS_COUNT++)); else ((FAIL_COUNT++)); fi

# Test 6: Verificar App.tsx
echo -n "Test 6: Componente principal App.tsx existe... "
test -f /home/admin-jairo/AEJ_Sistema/src/App.tsx
if check_status $?; then ((PASS_COUNT++)); else ((FAIL_COUNT++)); fi

# Test 7: Verificar configuración de rutas
echo -n "Test 7: Sistema de navegación configurado... "
grep -q "currentPage" /home/admin-jairo/AEJ_Sistema/src/App.tsx
if check_status $?; then ((PASS_COUNT++)); else ((FAIL_COUNT++)); fi

# Test 8: Verificar todas las páginas existen
echo -n "Test 8: Todas las páginas principales existen... "
PAGES=("Login.tsx" "Dashboard.tsx" "POS.tsx" "Products.tsx" "Clients.tsx" "Inventory.tsx" "Reports.tsx" "Users.tsx" "Suppliers.tsx" "Billing.tsx" "Configuration.tsx")
ALL_EXIST=0
for page in "${PAGES[@]}"; do
    if [ ! -f "/home/admin-jairo/AEJ_Sistema/src/pages/$page" ]; then
        ALL_EXIST=1
        break
    fi
done
if check_status $ALL_EXIST; then ((PASS_COUNT++)); else ((FAIL_COUNT++)); fi

# Test 9: Verificar componentes UI (shadcn)
echo -n "Test 9: Componentes UI (shadcn) instalados... "
test -d /home/admin-jairo/AEJ_Sistema/src/components/ui && [ "$(ls -A /home/admin-jairo/AEJ_Sistema/src/components/ui)" ]
if check_status $?; then ((PASS_COUNT++)); else ((FAIL_COUNT++)); fi

# Test 10: Verificar configuración de API
echo -n "Test 10: API client configurado... "
test -f /home/admin-jairo/AEJ_Sistema/src/lib/api.ts && grep -q "axios" /home/admin-jairo/AEJ_Sistema/src/lib/api.ts
if check_status $?; then ((PASS_COUNT++)); else ((FAIL_COUNT++)); fi

# Test 11: Verificar dependencia axios instalada
echo -n "Test 11: Axios instalado correctamente... "
npm list axios 2>/dev/null | grep -q "axios@"
if check_status $?; then ((PASS_COUNT++)); else ((FAIL_COUNT++)); fi

# Test 12: Verificar React Query
echo -n "Test 12: TanStack Query configurado... "
grep -q "@tanstack/react-query" /home/admin-jairo/AEJ_Sistema/src/App.tsx
if check_status $?; then ((PASS_COUNT++)); else ((FAIL_COUNT++)); fi

# Test 13: Verificar autenticación
echo -n "Test 13: Sistema de autenticación implementado... "
grep -q "authAPI" /home/admin-jairo/AEJ_Sistema/src/lib/api.ts
if check_status $?; then ((PASS_COUNT++)); else ((FAIL_COUNT++)); fi

# Test 14: Verificar TypeScript
echo -n "Test 14: TypeScript configurado... "
test -f /home/admin-jairo/AEJ_Sistema/tsconfig.json
if check_status $?; then ((PASS_COUNT++)); else ((FAIL_COUNT++)); fi

# Test 15: Verificar Tailwind CSS
echo -n "Test 15: Tailwind CSS configurado... "
test -f /home/admin-jairo/AEJ_Sistema/tailwind.config.ts
if check_status $?; then ((PASS_COUNT++)); else ((FAIL_COUNT++)); fi

# Test 16: Verificar proceso Vite
echo -n "Test 16: Proceso Vite ejecutándose... "
pgrep -f "vite.*5173" > /dev/null
if check_status $?; then ((PASS_COUNT++)); else ((FAIL_COUNT++)); fi

# Test 17: Verificar memoria del proceso
echo -n "Test 17: Proceso frontend con recursos adecuados... "
VITE_PID=$(pgrep -f "vite.*5173" | head -1)
if [ ! -z "$VITE_PID" ]; then
    MEM=$(ps -p $VITE_PID -o %mem --no-headers | awk '{print int($1)}')
    [ $MEM -lt 50 ]  # Menos del 50% de memoria
    if check_status $?; then ((PASS_COUNT++)); else ((FAIL_COUNT++)); fi
else
    echo -e "${RED}✗ FAIL${NC} (proceso no encontrado)"
    ((FAIL_COUNT++))
fi

# Test 18: Verificar estructura de lib
echo -n "Test 18: Librería de utilidades completa... "
LIB_FILES=("api.ts" "auth.ts" "database.ts" "permissions.ts" "utils.ts")
ALL_LIB_EXIST=0
for libfile in "${LIB_FILES[@]}"; do
    if [ ! -f "/home/admin-jairo/AEJ_Sistema/src/lib/$libfile" ]; then
        ALL_LIB_EXIST=1
        break
    fi
done
if check_status $ALL_LIB_EXIST; then ((PASS_COUNT++)); else ((FAIL_COUNT++)); fi

# Test 19: Verificar hooks personalizados
echo -n "Test 19: Hooks personalizados disponibles... "
test -f /home/admin-jairo/AEJ_Sistema/src/hooks/use-toast.ts
if check_status $?; then ((PASS_COUNT++)); else ((FAIL_COUNT++)); fi

# Test 20: Verificar assets estáticos
echo -n "Test 20: Directorio de assets públicos existe... "
test -d /home/admin-jairo/AEJ_Sistema/public
if check_status $?; then ((PASS_COUNT++)); else ((FAIL_COUNT++)); fi

echo ""
echo "========================================"
echo "         RESUMEN DE RESULTADOS         "
echo "========================================"
echo -e "${GREEN}Tests Pasados: $PASS_COUNT${NC}"
echo -e "${RED}Tests Fallados: $FAIL_COUNT${NC}"
echo -e "Total de Tests: $((PASS_COUNT + FAIL_COUNT))"
echo ""

# Calcular porcentaje
PERCENTAGE=$((PASS_COUNT * 100 / (PASS_COUNT + FAIL_COUNT)))
echo -e "Porcentaje de Éxito: ${BLUE}${PERCENTAGE}%${NC}"

echo ""
echo "========================================"
echo "      INFORMACIÓN ADICIONAL            "
echo "========================================"
echo "URL Frontend: http://localhost:5173"
echo "URL Backend: http://localhost:8000 (INACTIVO)"
echo ""

# Información del proceso
VITE_PID=$(pgrep -f "vite.*5173" | head -1)
if [ ! -z "$VITE_PID" ]; then
    echo "Proceso Vite:"
    echo "  PID: $VITE_PID"
    echo "  Memoria: $(ps -p $VITE_PID -o %mem --no-headers)%"
    echo "  CPU: $(ps -p $VITE_PID -o %cpu --no-headers)%"
    echo "  Uptime: $(ps -p $VITE_PID -o etime --no-headers)"
fi

echo ""
echo "Componentes Principales:"
echo "  - Login (/src/pages/Login.tsx)"
echo "  - Dashboard (/src/pages/Dashboard.tsx)"
echo "  - POS (/src/pages/POS.tsx)"
echo "  - Productos (/src/pages/Products.tsx)"
echo "  - Clientes (/src/pages/Clients.tsx)"
echo "  - Inventario (/src/pages/Inventory.tsx)"
echo "  - Reportes (/src/pages/Reports.tsx)"
echo "  - Usuarios (/src/pages/Users.tsx)"
echo "  - Proveedores (/src/pages/Suppliers.tsx)"
echo "  - Facturación (/src/pages/Billing.tsx)"
echo "  - Configuración (/src/pages/Configuration.tsx)"

echo ""
echo "========================================"

if [ $FAIL_COUNT -eq 0 ]; then
    echo -e "${GREEN}¡TODOS LOS TESTS PASARON! ✓${NC}"
    exit 0
else
    echo -e "${YELLOW}Algunos tests fallaron. Revisa los detalles arriba.${NC}"
    exit 1
fi
