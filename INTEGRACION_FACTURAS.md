# Integración Automática de Facturas de Compra

## Resumen de Funcionalidades Implementadas

El sistema ahora cuenta con integración completa entre facturas de compra, proveedores, productos e inventario.

### ✅ Características Implementadas

#### 1. **Proveedores - Dos Formas de Ingreso**

##### a) Ingreso Directo por Módulo de Proveedores
- Ruta: `/suppliers` (GET, POST)
- Crear proveedor manualmente desde el módulo de proveedores
- Requiere: NIT, razón social, datos de contacto

##### b) Ingreso Automático desde Factura
- Al procesar una factura de compra, el sistema:
  - **Si el proveedor existe** (por NIT): Actualiza sus datos si hay cambios
  - **Si el proveedor NO existe**: Lo crea automáticamente con los datos de la factura
  - Reactiva proveedores inactivos si se recibe una nueva factura

#### 2. **Productos - Creación y Actualización Automática**

Cuando se registra una factura de compra:

##### Si el producto YA EXISTE:
- ✅ Lo detecta por código de referencia (coincidencia exacta)
- ✅ Si no lo encuentra por código, lo busca por nombre (coincidencia exacta)
- ✅ Si no lo encuentra, lo busca por nombre similar (primeros 30 caracteres)
- ✅ **Actualiza automáticamente el precio de compra** si cambió
- ✅ Actualiza el precio de venta manteniendo el margen (si no es personalizado)
- ✅ Completa el código de producto si faltaba

##### Si el producto NO EXISTE:
- ✅ Crea el producto automáticamente con:
  - Código: referencia de la factura o código autogenerado
  - Nombre: nombre del producto en la factura
  - Precio de compra: precio unitario de la factura
  - Precio de venta: precio de compra × 1.5 (50% de margen por defecto)
  - Stock inicial: 0 (se actualiza en el siguiente paso)
  - Categoría: ACCESORIOS (por defecto)

#### 3. **Inventario - Actualización Automática**

##### En Facturas de Compra (ENTRADA):
- ✅ **Suma** la cantidad al stock actual: `stock_actual += cantidad`
- ✅ Crea registro de movimiento tipo ENTRADA
- ✅ Registra: producto, cantidad, stock anterior, stock nuevo, referencia de factura
- ✅ Asocia el movimiento al usuario que procesó la factura

##### En Ventas (SALIDA):
- ✅ **Resta** la cantidad del stock actual: `stock_actual -= cantidad`
- ✅ Valida que haya stock suficiente antes de vender
- ✅ Crea registro de movimiento tipo SALIDA
- ✅ Registra: producto, cantidad, stock anterior, stock nuevo, número de venta

#### 4. **Validaciones de Seguridad**

- ✅ **No permite facturas duplicadas**: Valida por número de factura
- ✅ **No permite ventas sin stock**: Valida disponibilidad antes de vender
- ✅ **Requiere NIT del proveedor**: No se puede procesar sin identificación
- ✅ **Rollback automático**: Si algo falla, revierte todos los cambios

## Flujo de Trabajo Completo

### Escenario 1: Primera Factura de un Proveedor Nuevo con Productos Nuevos

```
USUARIO → Registra Factura de Compra
   ↓
1. Sistema busca proveedor por NIT → NO EXISTE
   ✅ Crea proveedor nuevo

2. Para cada producto en la factura:
   - Busca por código → NO EXISTE
   - Busca por nombre → NO EXISTE
   ✅ Crea producto nuevo con precio de compra
   ✅ Agrega cantidad al inventario (stock = 0 + cantidad)
   ✅ Registra movimiento de ENTRADA

3. ✅ Guarda factura como PROCESADA
```

### Escenario 2: Segunda Factura del Mismo Proveedor con Productos Existentes

```
USUARIO → Registra Factura de Compra
   ↓
1. Sistema busca proveedor por NIT → EXISTE
   ✅ Actualiza datos del proveedor si cambiaron

2. Para cada producto en la factura:
   - Busca por código → EXISTE
   ✅ Actualiza precio de compra si cambió
   ✅ Actualiza precio de venta proporcionalmente
   ✅ Suma cantidad al stock existente (stock = actual + cantidad)
   ✅ Registra movimiento de ENTRADA

3. ✅ Guarda factura como PROCESADA
```

### Escenario 3: Venta de Productos

```
USUARIO → Realiza Venta en POS
   ↓
1. Sistema valida stock disponible
   ❌ Si no hay stock → ERROR, no permite la venta

2. Si hay stock suficiente:
   ✅ Resta cantidad del inventario (stock = actual - cantidad)
   ✅ Registra movimiento de SALIDA
   ✅ Crea registro de venta
```

## Archivos Modificados

### Backend
- `backend/invoice_processor.py` - Lógica de procesamiento de facturas
  - Línea 45-111: `find_or_create_supplier()` - Mejorado
  - Línea 113-157: `find_or_create_product()` - Completamente reescrito
  - Línea 208-322: `process_invoice()` - Agregada validación de duplicados

- `backend/main.py` - Endpoints REST API
  - Línea 305-373: `create_sale()` - Ya implementado (descuento automático)
  - Línea 514-539: `process_invoice()` - Endpoint para procesar facturas

### Frontend
- `src/pages/PurchaseInvoices.tsx` - Interfaz de usuario para facturas

### Base de Datos
- `backend/models.py` - Modelos de datos (sin cambios necesarios)

## Mejoras Técnicas Implementadas

1. **Búsqueda Inteligente de Productos**:
   - Primero por código exacto
   - Luego por nombre exacto (case-insensitive)
   - Finalmente por nombre similar (primeros 30 caracteres)

2. **Actualización Selectiva de Precios**:
   - Solo actualiza si el precio cambió más de $0.01
   - Mantiene márgenes personalizados (no los sobrescribe si son mayores al 100%)

3. **Logs Informativos**:
   - Mensajes en consola para tracking de operaciones
   - Útil para debugging y auditoría

4. **Manejo de Errores Robusto**:
   - Rollback automático en caso de error
   - Mensajes de error descriptivos
   - Validaciones previas a operaciones críticas

## Próximos Pasos (Opcional)

Si deseas mejorar aún más el sistema:

- [ ] OCR automático para extraer datos de PDFs
- [ ] Notificaciones cuando productos lleguen a stock mínimo
- [ ] Historial de precios de compra por proveedor
- [ ] Sugerencias de orden de compra basadas en ventas
- [ ] Reportes de rentabilidad por producto
- [ ] Comparación de precios entre proveedores

## Pruebas Recomendadas

1. **Prueba de Proveedor Nuevo**:
   - Registra una factura con un NIT que no existe
   - Verifica que el proveedor se cree automáticamente
   - Ve al módulo de proveedores y confirma que está ahí

2. **Prueba de Producto Nuevo**:
   - Registra una factura con productos nuevos
   - Ve al módulo de productos y verifica que se crearon
   - Verifica que el stock se actualizó correctamente

3. **Prueba de Producto Existente**:
   - Registra otra factura con los mismos productos
   - Verifica que el stock se sumó (no se reemplazó)
   - Verifica que el precio se actualizó si cambió

4. **Prueba de Venta**:
   - Realiza una venta de un producto con stock
   - Verifica que el stock se descontó
   - Ve al historial de movimientos de inventario

5. **Prueba de Factura Duplicada**:
   - Intenta registrar la misma factura dos veces
   - Debe mostrar error de duplicado

6. **Prueba de Venta Sin Stock**:
   - Intenta vender un producto sin stock disponible
   - Debe mostrar error de stock insuficiente
