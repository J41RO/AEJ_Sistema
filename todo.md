# Sistema POS AEJ - MVP TODO

## Objetivo
Crear un Sistema POS completo con cumplimiento legal colombiano (DIAN + Ley 1581)

## Arquitectura
- **Frontend**: React + TypeScript + shadcn-ui + Tailwind CSS
- **Backend**: Simulado con localStorage (preparado para FastAPI)
- **Base de datos**: localStorage (preparado para SQLite)
- **Autenticación**: JWT simulado con roles

## Roles de Usuario
1. **SUPERUSUARIO** (EEUU): Acceso total
2. **ADMIN** (Colombia): Gestión completa
3. **VENDEDOR** (Colombia): POS, clientes, consultas
4. **ALMACEN** (Colombia): Inventario, productos, compras
5. **CONTADOR** (Colombia): Reportes, facturación, contabilidad

## Archivos a Crear (8 archivos máximo)

### 1. src/lib/auth.ts
- Sistema de autenticación con JWT
- Gestión de roles y permisos
- Usuarios predefinidos para demo

### 2. src/lib/database.ts
- Simulación de base de datos con localStorage
- Modelos: Usuario, Producto, Cliente, Venta, Categoria, Marca, Proveedor
- CRUD operations

### 3. src/components/Layout.tsx
- Layout principal con sidebar
- Navegación según rol del usuario
- Header con usuario actual

### 4. src/pages/Login.tsx
- Página de login
- Validación de credenciales
- Redirección según rol

### 5. src/pages/Dashboard.tsx
- Dashboard personalizado por rol
- Métricas principales
- Accesos rápidos

### 6. src/pages/POS.tsx
- Punto de venta completo
- Búsqueda de productos
- Carrito de compras
- Procesamiento de pagos

### 7. src/pages/Products.tsx
- Gestión completa de productos
- CRUD con categorías y marcas
- Control de inventario

### 8. src/pages/Clients.tsx
- Gestión de clientes
- Cumplimiento Ley 1581 (Habeas Data)
- Historial de compras

## Funcionalidades MVP
- ✅ Autenticación con roles
- ✅ Gestión de productos
- ✅ Gestión de clientes (Ley 1581)
- ✅ Punto de venta funcional
- ✅ Control de inventario básico
- ✅ Dashboard con métricas
- ✅ Reportes básicos
- ✅ Diseño responsive y profesional

## Datos de Demo
- Usuarios con diferentes roles
- Productos de cosmética y más
- Clientes con consentimiento de datos
- Ventas de ejemplo
- Métricas realistas