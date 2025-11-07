# 📄 Sistema de Procesamiento de Facturas de Compra

## Resumen

Se ha implementado un sistema completo para procesar facturas de compra que permite:
- Cargar facturas en PDF
- Extraer datos automáticamente (o ingreso manual)
- Crear/actualizar proveedores automáticamente
- Crear/actualizar productos automáticamente
- Actualizar inventario automáticamente
- Registrar movimientos de inventario

## 🗄️ Modelos de Base de Datos

### Nuevos Modelos Agregados

#### 1. **PurchaseInvoice** (Factura de Compra)
```python
- id: Identificador único
- numero_factura: Número de factura (único)
- supplier_id: ID del proveedor
- fecha_emision: Fecha de emisión
- cufe: Código CUFE (DIAN)
- fecha_aceptacion: Fecha de aceptación
- firma_digital: Firma digital de la factura
- subtotal: Subtotal de la factura
- iva: IVA
- total: Total de la factura
- archivo_pdf: Ruta del archivo PDF
- status: Estado (PENDIENTE, PROCESADA, CANCELADA)
- notas: Notas adicionales
- created_at: Fecha de creación
- updated_at: Fecha de actualización
```

#### 2. **PurchaseInvoiceItem** (Ítem de Factura de Compra)
```python
- id: Identificador único
- purchase_invoice_id: ID de la factura
- product_id: ID del producto
- cantidad: Cantidad comprada
- precio_unitario: Precio unitario de compra
- subtotal: Subtotal del ítem
```

## 🔌 API Endpoints

### 1. **GET /suppliers**
Obtener lista de proveedores
- Autenticación: Requerida
- Permisos: Usuario activo

### 2. **POST /suppliers**
Crear nuevo proveedor
- Autenticación: Requerida
- Permisos: Admin o Superusuario
- Body: SupplierCreate schema

### 3. **POST /api/invoices/upload**
Subir archivo PDF de factura
- Autenticación: Requerida
- Permisos: Usuario activo
- File: PDF file
- Retorna: Confirmación de carga

### 4. **POST /api/invoices/process**
Procesar datos de factura y actualizar sistema
- Autenticación: Requerida
- Permisos: Usuario activo
- Form Data:
  - invoice_data: JSON string con datos de la factura
  - pdf_file: Archivo PDF (opcional)
- Retorna: PurchaseInvoice creada

### 5. **GET /api/invoices**
Obtener lista de facturas de compra
- Autenticación: Requerida
- Permisos: Usuario activo
- Query params: skip, limit

### 6. **GET /api/invoices/{invoice_id}**
Obtener factura específica por ID
- Autenticación: Requerida
- Permisos: Usuario activo

### 7. **DELETE /api/invoices/{invoice_id}**
Eliminar factura de compra
- Autenticación: Requerida
- Permisos: Admin o Superusuario

## 📋 Formato de Datos de Factura

### Estructura JSON Requerida

```json
{
  "proveedor": {
    "razon_social": "DISTRIBUIDORA EL HUECO S.A.S",
    "nit": "900.479.120-7",
    "ciudad": "BUCARAMANGA",
    "telefono": "3154795581",
    "email": "servicioalcliente@tiendaselhueco.com.co",
    "direccion": "BUCARAMANGA"
  },
  "factura": {
    "numero": "F5C612276",
    "fecha": "2024-10-24",
    "hora": "17:40:49",
    "cufe": "b58736aef9ead8b517c5d606936b38e6...",
    "fecha_aceptacion": "2025-10-24 17:41:23-05:00",
    "firma_digital": "fVXmF0gRFxTfqCl789tPwYjJ0GxM0CeV..."
  },
  "productos": [
    {
      "nombre": "BOLSA DE EMPAQUE 30K PCR",
      "referencia": "30K",
      "cantidad": 1,
      "precio_unitario": 500,
      "total": 500
    }
  ],
  "totales": {
    "subtotal": 132802,
    "iva": 25232,
    "total": 158034
  }
}
```

## 🔄 Flujo de Procesamiento

### Proceso Automático

1. **Recepción de Datos**
   - Se recibe el JSON con datos de la factura
   - Opcionalmente se recibe el archivo PDF

2. **Procesamiento del Proveedor**
   - Busca proveedor existente por NIT
   - Si existe: actualiza información
   - Si no existe: crea nuevo proveedor

3. **Procesamiento de Productos**
   Para cada producto en la factura:
   - Busca producto por referencia/código
   - Si no existe, busca por nombre similar
   - Si no existe: crea nuevo producto con:
     - Precio de compra del proveedor
     - Precio de venta = precio_compra × 1.5 (50% markup)
     - Categoría por defecto: ACCESORIOS
     - Stock inicial: 0

4. **Creación de Factura de Compra**
   - Crea registro de PurchaseInvoice
   - Estado: PROCESADA
   - Guarda archivo PDF si se proporcionó

5. **Creación de Ítems de Factura**
   - Crea PurchaseInvoiceItem para cada producto
   - Vincula producto con factura

6. **Actualización de Inventario**
   Para cada producto:
   - Incrementa stock_actual con la cantidad comprada
   - Crea registro en InventoryMovement:
     - Tipo: ENTRADA
     - Motivo: "Compra - Factura {numero}"
     - Registra stock anterior y nuevo

## 🧪 Pruebas

### Test Exitoso Realizado

```bash
cd /workspace/AEJ_Sistema/backend
python test_invoice_processing.py
```

**Resultado:**
- ✅ Factura procesada: F5C612276
- ✅ Proveedor creado: DISTRIBUIDORA EL HUECO S.A.S
- ✅ 7 productos creados/actualizados
- ✅ Inventario actualizado correctamente
- ✅ Movimientos de inventario registrados

## 📁 Archivos Creados/Modificados

### Nuevos Archivos
1. **invoice_processor.py** - Lógica de procesamiento de facturas
2. **test_invoice_processing.py** - Script de pruebas
3. **extracted_invoice_data.json** - Datos extraídos de factura de ejemplo

### Archivos Modificados
1. **models.py** - Agregados modelos PurchaseInvoice y PurchaseInvoiceItem
2. **schemas.py** - Agregados schemas para facturas de compra
3. **main.py** - Agregados endpoints de API para facturas
4. **database** - Recreada con nuevas tablas

## 🚀 Uso en Producción

### Ejemplo de Uso con curl

```bash
# 1. Login
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'

# 2. Procesar factura
curl -X POST http://localhost:8000/api/invoices/process \
  -H "Authorization: Bearer {token}" \
  -F "invoice_data=@extracted_invoice_data.json" \
  -F "pdf_file=@factura.pdf"

# 3. Listar facturas
curl -X GET http://localhost:8000/api/invoices \
  -H "Authorization: Bearer {token}"
```

## 📊 Estado Actual del Sistema

### Base de Datos
- ✅ 5 usuarios
- ✅ 12 productos (5 iniciales + 7 de factura)
- ✅ 3 clientes
- ✅ 3 proveedores (2 iniciales + 1 de factura)
- ✅ 1 factura de compra procesada

### Funcionalidades Implementadas
- ✅ CRUD de proveedores
- ✅ Carga de facturas PDF
- ✅ Procesamiento automático de facturas
- ✅ Creación automática de proveedores
- ✅ Creación automática de productos
- ✅ Actualización automática de inventario
- ✅ Registro de movimientos de inventario
- ✅ Consulta de facturas procesadas

## 🔮 Próximos Pasos Sugeridos

1. **Frontend para Facturas**
   - Interfaz para cargar facturas
   - Vista de facturas procesadas
   - Edición manual de datos extraídos

2. **OCR Automático**
   - Integrar servicio de OCR para extraer datos de PDF
   - Validación automática de datos extraídos

3. **Gestión de Categorías y Marcas**
   - CRUD de categorías de productos
   - CRUD de marcas
   - Asignación automática inteligente

4. **Reportes**
   - Reporte de compras por proveedor
   - Análisis de precios de compra
   - Historial de movimientos de inventario

## 📝 Notas Importantes

- El sistema crea productos automáticamente con un markup del 50%
- Los productos nuevos se asignan a la categoría ACCESORIOS por defecto
- Se recomienda revisar y ajustar precios y categorías después del procesamiento
- El archivo PDF se guarda en `uploads/invoices/`
- Todos los movimientos de inventario quedan registrados para auditoría