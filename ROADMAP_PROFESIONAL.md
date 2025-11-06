# 🗺️ ROADMAP PROFESIONAL - SISTEMA POS AEJ
## Reconstrucción Desde Cero con Cumplimiento Legal Colombiano

**Sistema:** POS AEJ Cosmetic & More
**Versión Objetivo:** 2.0
**Fecha Inicio:** Noviembre 2025
**Desarrollador:** Jairo Colina
**Tipo:** Sistema Local - Sin Exposición a Red Externa

---

uvicorn main:app --host 0.0.0.0 --port 8000 --reload
mega-quit
sudo systemctl restart megacmd-sync.service
admin-jairo@minsky-core:~$ sudo nano /usr/local/bin/backup_aej_sistema.sh
admin-jairo@minsky-core:~$ sudo chmod +x /usr/local/bin/backup_aej_sistema.shl/bin/backup_aej_sistema.sh
Respaldo manualmente--> 
/usr/local/bin/backup_aej_sistema.sh
===BACKEND===
Servicio para el backend-->
sudo nano /etc/systemd/system/aej-backend.service
sudo systemctl status aej-backend.service
sudo lsof -i :8000

==END==
===FRONTEND===
Servicio para el frontend-->
sudo nano /etc/systemd/system/aej-frontend.service
✅ Qué tienes ahora
Frontend (Vite/React) ejecutándose 24/7
→ Auto-reinicia si falla o el servidor se apaga.
→ Se inicia automáticamente con el sistema.
→ Guarda logs en:
~/AEJ_Sistema/frontend.log
~/AEJ_Sistema/frontend-error.log
Puerto activo: http://192.168.1.137:5173
Puedes confirmarlo con:
sudo systemctl status aej-frontend.service
o, si quieres ver el log en tiempo real:
sudo journalctl -u aej-frontend.service -f
===END===

🧩 Resumen completo del proyecto AEJ Sistema

🔧 Infraestructura base configurada en Linux (Minsky-Core):

Se instalaron y configuraron Node.js, pnpm, Python 3.11, FastAPI, Uvicorn, Pyenv y Systemd.

Se habilitó SSH (puerto 2222) y herramientas esenciales (dos2unix, lsof, systemctl, etc.).

Se estableció un entorno limpio para desarrollo y despliegue.

💻 Backend (FastAPI / Python):

Se creó y configuró el backend completo dentro de /home/admin-jairo/AEJ_Sistema/backend.

Se implementó el servicio aej-backend.service en systemd para mantenerlo activo, reiniciarse solo y loguear errores.

Se solucionaron conflictos de puerto (8000) y se limpió la instancia anterior de uvicorn.

El backend está funcionando estable y accesible en
👉 http://192.168.1.137:8000/docs
 con endpoints /health, /api/status, /api/products, /api/sales.

⚛️ Frontend (React + Vite + TypeScript):

Se configuró entorno Node.js con pnpm y dependencias modernas.

Se creó el servicio aej-frontend.service en systemd (en proceso de ajuste final) para mantener el frontend activo automáticamente.

Se estableció integración con el backend (CORS configurado, comunicación local en red).

☁️ Sincronización y almacenamiento (MEGA en Linux):

Se configuró cliente de MEGAsync en Ubuntu Server para sincronizar proyectos (AEJ_Sistema, megamax, etc.).

Se conectaron directorios de desarrollo entre Windows ↔ Linux para mantener el código unificado.

⚙️ Automatización y resiliencia:

Se integró systemd para manejo automático de servicios (reinicio, logs, monitoreo).

Se planificó la activación del watchdog de systemd, que supervisará el backend y lo reiniciará en caso de cuelgue.

Próximamente se añadirá también al frontend.

🧠 Optimización general:

Se estandarizó entorno con pyenv y rutas limpias.

Se solucionaron incompatibilidades de Windows/Linux (dos2unix).

Se definieron protocolos para despliegue continuo y mantenimiento remoto.

✅ Estado actual

Backend: Activo, estable, con reinicio automático.

Frontend: Configurado, pendiente activar servicio permanente.

Sincronización: MEGA funcional entre Windows y Linux.

Sistema: Preparado para operación 24/7.


## 🎯 ARQUITECTURA DE DESARROLLO Y DESPLIEGUE

### Estrategia de Sincronización con MEGA
**IMPORTANTE:** Este proyecto NO estará en la web, es 100% LOCAL.

**Entorno de Desarrollo (Tu PC):**
- Carpeta local sincronizada con MEGA
- Desarrollo de frontend y backend aquí
- Cada cambio se sincroniza automáticamente a MEGA

**Entorno de Producción (PC en Colombia):**
- Instalar MEGA Desktop en la PC destino
- Sincronizar la misma carpeta del proyecto
- Instalar Python 3.11+ y crear venv
- Instalar dependencias: `pip install -r requirements.txt`
- Ejecutar backend: `cd backend && python main.py`
- Abrir frontend en navegador: `file:///ruta/frontend/index.html`

**Ventajas de este enfoque:**
✅ Sin necesidad de servidor web
✅ Sin exposición a internet
✅ Sincronización automática de cambios vía MEGA
✅ Base de datos SQLite se sincroniza automáticamente
✅ Cero configuración de red/puertos/firewall
✅ Instalación simple en PC destino

**Estructura de carpetas sincronizada:**
```
MEGA/AEJ_Sistema/
├── backend/
│   ├── app/
│   ├── database/
│   ├── main.py
│   └── requirements.txt
├── frontend/
│   ├── index.html
│   ├── assets/
│   └── pages/
├── database/
│   └── pos_aej.db (se sincroniza automáticamente)
├── uploads/
├── logs/
└── README_INSTALACION.md (instrucciones para PC Colombia)
```

---

NOTAS PARA JAIRO-->
Para futuras ejecuciones, usa siempre:
  cd backend
  ..\venv\Scripts\python.exe main.py

  O activa el venv primero:
  cd backend
  ..\venv\Scripts\activate
  python main.py

## 📊 TRACKING DE PROGRESO - SESIÓN ACTUAL

**Última Actualización:** 2025-11-05 01:25
**Acciones realizadas:**
- 2025-11-05 00:45: Definición de arquitectura local con sincronización MEGA
- 2025-11-05 00:50: Estructura completa de directorios creada
- 2025-11-05 00:55: Configuración base (config.py, database.py, main.py)
- 2025-11-05 00:58: Frontend base (HTML + CSS + JS) completado
- 2025-11-05 01:00: Entorno virtual creado y dependencias instaladas
- 2025-11-05 01:03: Base de datos SQLite inicializada con modelo Usuario
- 2025-11-05 01:05: Backend funcionando correctamente en http://127.0.0.1:8000
- 2025-11-05 01:10: Modelos completos creados (9 tablas):
  * usuarios, categorias, marcas, proveedores, productos
  * clientes (con Ley 1581), ventas, venta_items, movimientos_inventario
- 2025-11-05 01:15: Schemas Pydantic completos (8 archivos):
  * base.py, categoria.py, marca.py, proveedor.py
  * producto.py, cliente.py (con validaciones Ley 1581), venta.py
- 2025-11-05 01:25: Repositories completos (8 archivos):
  * BaseRepository gen\u00e9rico con CRUD completo
  * CategoriaRepository, MarcaRepository, ProveedorRepository
  * ProductoRepository, ClienteRepository, VentaRepository
- 2025-11-05 01:45: Services completos (10 archivos):
  * BaseService gen\u00e9rico con validaciones
  * CategoriaService, MarcaService, ProveedorService
  * ProductoService (con c\u00e1lculos de precios y stock)
  * ClienteService (con Ley 1581 y clasificaci\u00f3n autom\u00e1tica)
  * VentaService (procesamiento transaccional completo)
  * InventarioService (trazabilidad de movimientos)
  * ProteccionDatosService (cumplimiento total Ley 1581/2012)

### 🔄 SIGUIENTE TAREA
**→ Crear API Endpoints (capa de exposici\u00f3n REST)**

---

## 📋 ÍNDICE

1. [Fundamentos y Arquitectura](#módulo-1-fundamentos-y-arquitectura)
2. [Base de Datos y Modelos](#módulo-2-base-de-datos-y-modelos)
3. [Backend API Core](#módulo-3-backend-api-core)
4. [Seguridad y Protección de Datos](#módulo-4-seguridad-y-protección-de-datos)
5. [Frontend Profesional](#módulo-5-frontend-profesional)
6. [Facturación Electrónica DIAN](#módulo-6-facturación-electrónica-dian)
7. [Gestión de Inventario Avanzado](#módulo-7-gestión-de-inventario-avanzado)
8. [Reportes y Analytics](#módulo-8-reportes-y-analytics)
9. [Sistema de Backups y Auditoría](#módulo-9-sistema-de-backups-y-auditoría)
10. [Testing y Calidad](#módulo-10-testing-y-calidad)
11. [Documentación y Despliegue](#módulo-11-documentación-y-despliegue)
12. [Mantenimiento y Soporte](#módulo-12-mantenimiento-y-soporte)

---

## 🎯 OBJETIVOS ESTRATÉGICOS

### Objetivos de Negocio
- ✅ Cumplir 100% con la normativa DIAN (Resolución 000165 de 2023, modificada por Res. 000202 de marzo 2025)
- ✅ Cumplir Ley 1581 de 2012 (Protección Datos Personales - Habeas Data)
- ✅ Sistema profesional, estable y escalable
- ✅ Interfaz moderna, intuitiva y rápida
- ✅ Operación 100% offline con sincronización opcional

### Objetivos Técnicos
- ✅ Arquitectura limpia y modular (Clean Architecture)
- ✅ Testing completo (>80% cobertura)
- ✅ Documentación exhaustiva
- ✅ Performance optimizado (respuesta <200ms)
- ✅ Seguridad de nivel empresarial

---

## 📊 METODOLOGÍA

**Enfoque:** Desarrollo Iterativo e Incremental
**Principios:**
- SOLID
- DRY (Don't Repeat Yourself)
- KISS (Keep It Simple, Stupid)
- TDD (Test-Driven Development)

**Stack Tecnológico Confirmado:**
- **Backend:** Python 3.11+ con FastAPI (cambio de Flask a FastAPI para mejor performance)
- **Base de Datos:** SQLite con SQLAlchemy ORM
- **Frontend:** HTML5, CSS3, JavaScript ES6+ (Vanilla - sin frameworks pesados)
- **Validación:** Pydantic
- **Testing:** Pytest + Coverage
- **Docs:** MkDocs Material

---

# MÓDULO 1: FUNDAMENTOS Y ARQUITECTURA

## 1.1 Configuración del Entorno

### 1.1.1 Entorno de Desarrollo
- [x] Instalar Python 3.11+ con ambiente virtual (venv)
- [x] Instalar dependencias (pip install -r requirements.txt)
- [x] Configurar Git con .gitignore profesional
- [ ] Instalar VS Code con extensiones recomendadas
  - Python
  - Pylance
  - SQLite Viewer
  - GitLens
  - Better Comments
- [ ] Configurar pre-commit hooks para calidad de código
- [ ] Configurar black, flake8, mypy para linting

### 1.1.2 Estructura de Directorios Profesional
- [x] Estructura MVP base creada:
  - [x] backend/app/ (api/, models/, schemas/, services/, utils/)
  - [x] backend/database/
  - [x] frontend/assets/ (css/, js/, img/)
  - [x] frontend/pages/
  - [x] uploads/ (facturas/, productos/)
  - [x] logs/
```
AEJ_Sistema_v2/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── v1/
│   │   │   │   ├── endpoints/
│   │   │   │   │   ├── auth.py
│   │   │   │   │   ├── productos.py
│   │   │   │   │   ├── ventas.py
│   │   │   │   │   ├── clientes.py
│   │   │   │   │   ├── inventario.py
│   │   │   │   │   ├── reportes.py
│   │   │   │   │   └── facturacion.py
│   │   │   │   └── api.py
│   │   │   └── deps.py
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   ├── security.py
│   │   │   ├── database.py
│   │   │   └── logging.py
│   │   ├── models/
│   │   │   ├── producto.py
│   │   │   ├── cliente.py
│   │   │   ├── venta.py
│   │   │   ├── factura.py
│   │   │   └── usuario.py
│   │   ├── schemas/
│   │   │   ├── producto.py
│   │   │   ├── cliente.py
│   │   │   └── ...
│   │   ├── services/
│   │   │   ├── producto_service.py
│   │   │   ├── venta_service.py
│   │   │   ├── facturacion_service.py
│   │   │   └── dian_service.py
│   │   ├── repositories/
│   │   │   ├── producto_repository.py
│   │   │   ├── cliente_repository.py
│   │   │   └── ...
│   │   ├── utils/
│   │   │   ├── validators.py
│   │   │   ├── formatters.py
│   │   │   ├── xml_generator.py
│   │   │   └── qr_generator.py
│   │   └── main.py
│   ├── tests/
│   │   ├── unit/
│   │   ├── integration/
│   │   └── e2e/
│   ├── migrations/
│   ├── scripts/
│   └── requirements/
│       ├── base.txt
│       ├── dev.txt
│       └── prod.txt
├── frontend/
│   ├── assets/
│   │   ├── css/
│   │   ├── js/
│   │   ├── img/
│   │   └── fonts/
│   ├── components/
│   ├── pages/
│   └── utils/
├── database/
│   └── backups/
├── docs/
│   ├── api/
│   ├── user_manual/
│   ├── legal/
│   └── technical/
├── logs/
├── temp/
├── .env.example
├── .gitignore
├── README.md
├── CONTRIBUTING.md
├── LICENSE
└── pyproject.toml
```

### 1.1.3 Documentación de Arquitectura
- [ ] Crear diagrama de arquitectura (Clean Architecture)
- [ ] Documentar flujo de datos
- [ ] Definir convenciones de código
- [ ] Crear ADRs (Architecture Decision Records)

## 1.2 Configuración Base

### 1.2.1 Sistema de Configuración
- [x] Crear `backend/app/core/config.py` con Pydantic Settings
- [x] Implementar carga de variables de entorno
- [x] Crear `.env.example` completo
- [x] Configurar validación de variables obligatorias (field_validator)
- [x] Documentar todas las variables de entorno

### 1.2.2 Sistema de Logging
- [x] Implementar logging estructurado (JSON logs)
- [x] Configurar rotación de logs
- [x] Crear niveles de logging apropiados
- [x] Implementar logging de auditoría
- [x] Configurar logs separados por módulo

### 1.2.3 Manejo de Errores
- [x] Crear excepciones personalizadas
- [x] Implementar manejadores de errores globales
- [x] Configurar respuestas de error estandarizadas
- [x] Logging automático de errores

---

# MÓDULO 2: BASE DE DATOS Y MODELOS

## 2.1 Diseño de Base de Datos

### 2.1.1 Análisis y Normalización
- [ ] Revisar esquema actual (ESQUEMA_BD.md)
- [ ] Normalizar a 3FN (Third Normal Form)
- [ ] Identificar relaciones y cardinalidades
- [ ] Optimizar índices según queries frecuentes
- [ ] Documentar diccionario de datos completo

### 2.1.2 Migración a SQLAlchemy ORM
- [x] Instalar SQLAlchemy 2.0+
- [ ] Instalar Alembic para migraciones (pendiente - no necesario para MVP)
- [x] Configurar engine y session factory
- [x] Crear modelos MVP con campos comunes (created_at, updated_at, activo)
  - ✅ Categoria, Marca, Proveedor, FacturaCompra, FacturaCompraItem, Producto
  - ✅ Relaciones establecidas (ForeignKey, relationships)
  - ✅ Generador de SKU automático implementado

### 2.1.3 Modelos Core (Prioridad Alta)

#### 2.1.3.1 Modelo Usuario ✅ COMPLETADO
- [x] Tabla: `usuarios`
- [x] Campos:
  - id, username, email, hashed_password
  - nombre_completo, telefono, direccion
  - area, cargo
  - activo, bloqueado
  - ultimo_login, intentos_fallidos
  - ultimo_cambio_password, debe_cambiar_password
  - refresh_token
  - created_at, updated_at, created_by, updated_by
- [x] Relaciones: roles (many-to-many), permisos_adicionales (many-to-many)
- [x] Métodos auxiliares: tiene_permiso(), tiene_rol(), es_admin(), es_superadmin(), incrementar_intentos_fallidos(), resetear_intentos_fallidos()
- [x] Validaciones: email único, username único
- [ ] Tests unitarios (pendiente)

#### 2.1.3.2 Modelo Cliente
- [ ] Tabla: `clientes`
- [ ] Campos según Ley 1581 de 2012:
  - id, tipo_documento (CC, NIT, CE, TI, etc.)
  - documento (único, indexado)
  - nombre, apellido, razon_social
  - email, telefono, celular
  - direccion, ciudad, departamento, codigo_postal
  - fecha_nacimiento
  - aceptacion_tratamiento_datos (BOOLEAN) ⚠️ LEGAL
  - fecha_aceptacion_datos ⚠️ LEGAL
  - canal_aceptacion ⚠️ LEGAL
  - clasificacion (ocasional, frecuente, vip)
  - total_compras, total_gastado
  - fecha_ultima_compra
  - notas_internas
  - activo, verificado
- [ ] Validaciones: documento válido, email formato
- [ ] Índices: documento, nombre+apellido, email
- [ ] Tests

#### 2.1.3.3 Modelo Producto
- [ ] Tabla: `productos`
- [ ] Campos:
  - id, sku (único), codigo_barras (único)
  - nombre, descripcion, descripcion_corta
  - categoria_id (FK), marca_id (FK)
  - proveedor_id (FK)
  - precio_compra, precio_venta
  - margen_porcentaje, utilidad
  - aplica_iva (BOOLEAN), porcentaje_iva (19%)
  - precio_con_iva (calculado)
  - stock_actual, stock_minimo, stock_maximo
  - unidad_medida (und, caja, paquete, kg, etc.)
  - peso, dimensiones (JSON)
  - requiere_lote, requiere_vencimiento
  - imagen_principal, galeria_imagenes (JSON)
  - tags (JSON), caracteristicas (JSON)
  - activo, disponible_venta
- [ ] Relaciones: variantes, movimientos, alertas
- [ ] Validaciones: precios > 0, stock >= 0
- [ ] Índices: sku, codigo_barras, nombre, categoria
- [ ] Tests

#### 2.1.3.4 Modelo Categoría
- [ ] Tabla: `categorias`
- [ ] Estructura jerárquica (self-referencing)
- [ ] Campos: id, nombre, slug, descripcion, icono
- [ ] categoria_padre_id, nivel, orden
- [ ] Tests de jerarquías

#### 2.1.3.5 Modelo Marca
- [ ] Tabla: `marcas`
- [ ] Campos: id, nombre, descripcion, logo, sitio_web
- [ ] Tests

#### 2.1.3.6 Modelo Proveedor
- [ ] Tabla: `proveedores`
- [ ] Campos: id, nit, razon_social, nombre_comercial
- [ ] contacto_nombre, contacto_email, contacto_telefono
- [ ] direccion, ciudad, departamento
- [ ] condiciones_pago, dias_credito
- [ ] calificacion, activo
- [ ] Tests

### 2.1.4 Modelos de Ventas

#### 2.1.4.1 Modelo Venta
- [ ] Tabla: `ventas`
- [ ] Campos:
  - id, numero_venta (secuencial)
  - cliente_id (FK), usuario_id (FK)
  - fecha_hora
  - subtotal, descuento_porcentaje, descuento_valor
  - subtotal_con_descuento
  - iva_valor, total
  - metodo_pago (efectivo, tarjeta, transferencia, mixto)
  - detalles_pago (JSON) - si es mixto
  - valor_recibido, cambio
  - estado (abierta, pagada, anulada, devuelta)
  - notas, observaciones
  - factura_electronica_id (FK)
- [ ] Relaciones: items, factura
- [ ] Validaciones: total > 0
- [ ] Tests

#### 2.1.4.2 Modelo Venta Item
- [ ] Tabla: `venta_items`
- [ ] Campos:
  - id, venta_id (FK)
  - producto_id (FK), variante_id (FK, nullable)
  - cantidad, precio_unitario
  - descuento_item, subtotal_item
  - iva_item, total_item
- [ ] Validaciones: cantidad > 0
- [ ] Tests

### 2.1.5 Modelos de Facturación Electrónica (DIAN)

#### 2.1.5.1 Modelo Factura Electrónica
- [ ] Tabla: `facturas_electronicas`
- [ ] Campos según Resolución 000165/2023:
  - id, numero_factura (autorizado DIAN)
  - prefijo, rango_desde, rango_hasta
  - venta_id (FK), cliente_id (FK)
  - fecha_emision, fecha_vencimiento
  - cufe (código único 40 caracteres) ⚠️ OBLIGATORIO
  - qr_data (datos QR) ⚠️ OBLIGATORIO
  - qr_image (ruta imagen QR)
  - xml_content (XML firmado)
  - xml_path (ruta archivo)
  - pdf_path (representación gráfica)
  - estado_dian (pendiente, aceptada, rechazada)
  - codigo_respuesta_dian
  - mensaje_dian
  - fecha_envio_dian, fecha_respuesta_dian
  - tipo_factura (01=factura_venta, 02=factura_exportacion, etc.)
  - ambiente (1=produccion, 2=pruebas)
  - moneda (COP)
  - tasa_cambio
  - subtotal, descuentos, cargos, iva, total
  - notas
- [ ] Validaciones: CUFE válido, XML válido
- [ ] Tests

#### 2.1.5.2 Modelo Documento Equivalente POS
- [ ] Tabla: `documentos_pos`
- [ ] Para ventas < 5 UVT (según Res. 001092/2022)
- [ ] Campos: similar a factura pero simplificado
- [ ] Numeración autorizada DIAN
- [ ] Tests

#### 2.1.5.3 Modelo Nota Crédito/Débito
- [ ] Tabla: `notas_credito_debito`
- [ ] Campos: referencia factura_id, motivo, valores
- [ ] XML DIAN, CUFE
- [ ] Tests

### 2.1.6 Modelos de Inventario

#### 2.1.6.1 Modelo Movimiento Inventario
- [ ] Tabla: `movimientos_inventario`
- [ ] Campos:
  - id, producto_id (FK)
  - tipo_movimiento (entrada, salida, ajuste, devolucion)
  - cantidad, costo_unitario
  - referencia_tipo (venta, compra, ajuste)
  - referencia_id
  - motivo, observaciones
  - usuario_id (FK)
  - fecha_hora
- [ ] Tests

#### 2.1.6.2 Modelo Alerta Inventario
- [ ] Tabla: `alertas_inventario`
- [ ] Campos: producto_id, tipo_alerta, mensaje, atendida
- [ ] Tests

### 2.1.7 Modelos de Compras ✅ COMPLETADO MVP

#### 2.1.7.1 Modelo Factura Compra
- [x] Tabla: `facturas_compra`
- [x] Campos: proveedor_id, numero_factura, fecha_factura, subtotal, iva, total
- [x] archivo_pdf, observaciones, created_at, updated_at
- [x] Schema Pydantic con validaciones
- [ ] Tests unitarios (pendiente)

#### 2.1.7.2 Modelo Factura Compra Items
- [x] Tabla: `facturas_compra_items`
- [x] Campos: factura_id, descripcion, cantidad, precio_unitario, subtotal, producto_id
- [x] Schema Pydantic con validación de totales
- [ ] Tests unitarios (pendiente)

### 2.1.8 Modelos de Auditoría y Seguridad

#### 2.1.8.1 Modelo Sesión
- [ ] Tabla: `sesiones`
- [ ] Campos: usuario_id, token (UUID), ip, user_agent
- [ ] fecha_inicio, fecha_expiracion, activa
- [ ] Tests

#### 2.1.8.2 Modelo Log Auditoría
- [ ] Tabla: `auditoria`
- [ ] Campos:
  - id, usuario_id, accion
  - tabla, registro_id
  - datos_anteriores (JSON), datos_nuevos (JSON)
  - ip_address, user_agent
  - fecha_hora
- [ ] Cumplimiento Ley 1581 ⚠️ LEGAL
- [ ] Tests

#### 2.1.8.3 Modelo Consentimiento Datos (HABEAS DATA)
- [ ] Tabla: `consentimientos_datos`
- [ ] Campos:
  - id, cliente_id (FK)
  - tipo_consentimiento (tratamiento, marketing, compartir)
  - aceptado (BOOLEAN)
  - fecha_aceptacion, ip_aceptacion
  - canal (web, fisico, telefono)
  - version_politica
  - revocado, fecha_revocacion
- [ ] Cumplimiento Ley 1581/2012 ⚠️ OBLIGATORIO
- [ ] Tests

## 2.2 Migraciones Alembic

### 2.2.1 Configuración Inicial
- [ ] Instalar Alembic
- [ ] Inicializar: `alembic init migrations`
- [ ] Configurar `alembic.ini`
- [ ] Configurar `env.py` con modelos

### 2.2.2 Migración Inicial
- [ ] Crear migración: `alembic revision -m "initial_schema"`
- [ ] Revisar migración generada
- [ ] Aplicar: `alembic upgrade head`
- [ ] Verificar esquema creado

### 2.2.3 Seeds Iniciales
- [ ] Script para crear usuario admin
- [ ] Script para categorías base
- [ ] Script para configuración inicial
- [ ] Tests de seeds

---

# MÓDULO 3: BACKEND API CORE

## 3.1 Configuración FastAPI ✅ COMPLETADO

### 3.1.1 Instalación y Setup
- [x] Instalar FastAPI, Uvicorn, Pydantic
- [x] Crear `backend/main.py` (punto de entrada)
- [x] Configurar CORS (all origins - ajustar en producción)
- [x] Configurar middleware de logging (integrado)
- [ ] Configurar middleware de auditoría (pendiente)
- [x] Configurar manejadores de excepciones (register_exception_handlers)

### 3.1.2 Estructura de la API
- [x] Implementar versionado (/api/v1/)
- [x] Configurar routers por módulo (facturas_compra creado)
- [x] Configurar dependencias (get_db en app/api/deps.py)
- [x] Implementar health check endpoint (/, /health, /api/info)

### 3.1.3 Documentación Automática
- [x] Configurar Swagger UI (docs) - /api/docs
- [x] Configurar ReDoc (redoc) - /api/redoc
- [x] Personalizar metadata API (title, description, version)
- [ ] Agregar ejemplos a endpoints (cuando creemos los endpoints)

## 3.2 Schemas Pydantic ✅ COMPLETADO MVP

### 3.2.1 Schemas Base
- [ ] Crear `schemas/base.py` con schemas comunes (pendiente)
- [ ] ResponseModel estándar (pendiente)
- [ ] PaginationParams (pendiente)
- [x] ErrorResponse (implementado en exceptions)

### 3.2.2 Schemas por Entidad MVP
- [x] `schemas/categoria.py` ✅
  - CategoriaCreate, CategoriaUpdate, CategoriaResponse, CategoriaListResponse
- [x] `schemas/marca.py` ✅
  - MarcaCreate, MarcaUpdate, MarcaResponse, MarcaListResponse
- [x] `schemas/proveedor.py` ✅
  - ProveedorCreate, ProveedorUpdate, ProveedorResponse
  - Validación: NIT, email, teléfono
- [x] `schemas/producto.py` ✅
  - ProductoCreate, ProductoUpdate, ProductoResponse
  - ProductoStockUpdate, ProductoSearchParams
  - Validación: precio_venta >= precio_compra
- [x] `schemas/factura_compra.py` ✅
  - FacturaCompraCreate, FacturaCompraItemCreate
  - FacturaCompraResponse, FacturaCompraDetailResponse
  - Validación: totales, subtotales, fechas
- [ ] `schemas/usuario.py` (pendiente - para autenticación)
- [ ] `schemas/cliente.py` (pendiente - para ventas)
- [ ] `schemas/venta.py` (pendiente - para ventas)
- [ ] `schemas/factura_electronica.py` (pendiente - integración DIAN)
- [x] Tests de validación (test_schemas.py) ✅

## 3.3 Repositories (Capa de Datos)

### 3.3.1 Repository Base
- [ ] Crear `repositories/base.py`
- [ ] Implementar métodos CRUD genéricos:
  - get_by_id()
  - get_all(skip, limit, filters)
  - create()
  - update()
  - delete() (soft delete)
  - restore()
- [ ] Tests

### 3.3.2 Repositories Específicos
- [ ] `repositories/usuario_repository.py`
  - get_by_username()
  - get_by_email()
  - verify_credentials()
- [ ] `repositories/cliente_repository.py`
  - get_by_documento()
  - search_clientes()
  - get_historial_compras()
- [ ] `repositories/producto_repository.py`
  - get_by_sku()
  - get_by_codigo_barras()
  - search_productos()
  - update_stock()
- [ ] `repositories/venta_repository.py`
  - get_ventas_periodo()
  - get_top_productos()
  - get_ventas_por_usuario()
- [ ] Tests para cada repository

## 3.4 Services (Lógica de Negocio) ✅ COMPLETADO (01:45)

### 3.4.0 Base Service ✅ COMPLETADO
- [x] `services/base_service.py`
- [x] Clase genérica con TypeVar y Generics
- [x] Métodos CRUD comunes: get_by_id, get_all, count, exists, create, update, delete, soft_delete, restore
- [x] Hooks para validaciones personalizadas: _validar_antes_crear, _validar_antes_actualizar
- [x] Integración perfecta con BaseRepository

### 3.4.1 Servicio de Categorías ✅ COMPLETADO
- [x] `services/categoria_service.py`
- [x] Funciones: crear_categoria, actualizar_categoria, eliminar_categoria
- [x] Generación automática de slugs
- [x] Validaciones: nombre único, categoría padre válida, prevenir ciclos jerárquicos
- [x] Verificación de subcategorías activas antes de eliminar

### 3.4.2 Servicio de Marcas ✅ COMPLETADO
- [x] `services/marca_service.py`
- [x] Funciones: crear_marca, actualizar_marca, eliminar_marca
- [x] Validaciones: nombre único, formato de URL válido
- [x] Búsqueda por nombre (parcial)

### 3.4.3 Servicio de Proveedores ✅ COMPLETADO
- [x] `services/proveedor_service.py`
- [x] Funciones: crear_proveedor, actualizar_proveedor, calificar_proveedor
- [x] Validaciones: NIT único, email único y formato válido
- [x] Validación de plazos de crédito, límites y descuentos (0-100%)
- [x] Búsqueda con múltiples filtros

### 3.4.4 Servicio de Productos ✅ COMPLETADO
- [x] `services/producto_service.py`
- [x] Funciones completas:
  - crear_producto (con generación automática de SKU)
  - actualizar_precios (con recalculo de margen)
  - actualizar_stock, incrementar_stock, decrementar_stock
  - verificar_disponibilidad
  - calcular_precio_con_descuento
- [x] Validaciones robustas:
  - Precios > 0 y precio_venta > precio_compra
  - Margen mínimo 10%
  - SKU y código barras únicos
  - Stock suficiente para decrementos
- [x] Alertas: get_alertas_stock (productos con stock bajo y agotados)
- [x] Cálculo automático de margen de ganancia

### 3.4.5 Servicio de Clientes ✅ COMPLETADO
- [x] `services/cliente_service.py`
- [x] Funciones:
  - crear_cliente (con validación de consentimiento LEY 1581)
  - registrar_consentimiento, revocar_consentimiento
  - actualizar_metricas_compra
  - clasificar_automaticamente (VIP, FRECUENTE, NUEVO, OCASIONAL)
- [x] Clasificación automática según criterios:
  - VIP: > $5,000,000 en compras
  - FRECUENTE: > $1,000,000 o > 10 compras
  - NUEVO: < 3 compras
  - OCASIONAL: resto
- [x] **LEY 1581/2012:** validar_cumplimiento_ley_1581 con reporte completo
- [x] Validaciones: documento único, email único y válido

### 3.4.6 Servicio de Ventas ✅ COMPLETADO
- [x] `services/venta_service.py`
- [x] Funciones:
  - crear_venta (con validación completa de items y stock)
  - procesar_pago (actualiza stock y métricas de cliente)
  - cancelar_venta
  - get_estadisticas_hoy, get_estadisticas_periodo
- [x] Validaciones transaccionales:
  - Verificación de stock disponible para cada item
  - Precios unitarios > 0
  - Descuentos 0-100%
  - Cliente activo
- [x] Procesamiento atómico:
  - Decremento automático de stock al pagar
  - Actualización de métricas del cliente
  - Generación automática de número de venta (V-00001)
- [x] Estadísticas: totales por periodo, promedio, ventas por método de pago

### 3.4.7 Servicio de Inventario ✅ COMPLETADO
- [x] `services/inventario_service.py`
- [x] Funciones:
  - registrar_entrada (compras, devoluciones)
  - registrar_salida (ventas, mermas)
  - registrar_ajuste (conteos físicos, correcciones)
- [x] Trazabilidad completa:
  - Registro de stock anterior y nuevo
  - Documento de referencia
  - Usuario que realiza el movimiento
  - Costo unitario y total
- [x] Validaciones: cantidad > 0, stock suficiente para salidas
- [x] Estadísticas: get_estadisticas_movimientos, validar_inventario
- [x] Tipos de movimiento: ENTRADA, SALIDA, AJUSTE_ENTRADA, AJUSTE_SALIDA

### 3.4.8 Servicio de Protección de Datos (HABEAS DATA) ✅ COMPLETADO
- [x] `services/proteccion_datos_service.py`
- [x] **CUMPLIMIENTO TOTAL LEY 1581/2012**
- [x] Funciones implementadas:
  - registrar_consentimiento (con metadata: IP, user agent, canal)
  - revocar_consentimiento
  - get_reporte_cumplimiento (con métricas y recomendaciones)
  - solicitar_actualizacion_datos
  - eliminar_datos_cliente (derecho al olvido con anonimización)
- [x] Reporte de cumplimiento incluye:
  - Porcentaje de cumplimiento
  - Estado: EXCELENTE, BUENO, REGULAR, CRÍTICO
  - Canales de aceptación
  - Consentimientos recientes (30 y 90 días)
  - Lista de clientes pendientes
  - Recomendaciones automáticas
- [x] Generación de política de tratamiento de datos
- [x] Auditoría completa de consentimientos

### 3.4.9 Services __init__.py ✅ COMPLETADO
- [x] Exportación centralizada de todos los servicios

**ARCHIVOS CREADOS (10 archivos):**
1. backend/app/services/base_service.py
2. backend/app/services/categoria_service.py
3. backend/app/services/marca_service.py
4. backend/app/services/proveedor_service.py
5. backend/app/services/producto_service.py
6. backend/app/services/cliente_service.py
7. backend/app/services/venta_service.py
8. backend/app/services/inventario_service.py
9. backend/app/services/proteccion_datos_service.py
10. backend/app/services/__init__.py

**SERVICIOS PENDIENTES (FASE 2):**
- [ ] Servicio de Facturación DIAN (cuando se integre facturación electrónica)
- [ ] Servicio de Reportes Avanzados (exportación Excel/PDF)
- [ ] Servicio de Autenticación (si se requiere más adelante)

## 3.5 API Endpoints

### 3.5.1 Endpoints de Autenticación ✅ COMPLETADO
- [x] POST /api/v1/auth/login
- [x] POST /api/v1/auth/logout
- [x] POST /api/v1/auth/refresh
- [x] POST /api/v1/auth/change-password
- [x] GET /api/v1/auth/me
- [x] Tests manuales pasando (test_login.py)
- [ ] Tests unitarios con pytest (pendiente)

### 3.5.2 Endpoints de Usuarios ✅ COMPLETADO
- [x] GET /api/v1/usuarios (paginado con filtros)
- [x] GET /api/v1/usuarios/{id}
- [x] POST /api/v1/usuarios (con asignación de roles)
- [x] PUT /api/v1/usuarios/{id}
- [x] PATCH /api/v1/usuarios/{id}/toggle-active
- [x] DELETE /api/v1/usuarios/{id}
- [x] GET /api/v1/usuarios/stats/summary (estadísticas)
- [x] Protección con PermissionChecker (RBAC)
- [x] Tests manuales pasando
- [ ] Tests unitarios con pytest (pendiente)

### 3.5.3 Endpoints de Clientes
- [ ] GET /api/v1/clientes
- [ ] GET /api/v1/clientes/{id}
- [ ] GET /api/v1/clientes/buscar?q=
- [ ] POST /api/v1/clientes
- [ ] PUT /api/v1/clientes/{id}
- [ ] DELETE /api/v1/clientes/{id}
- [ ] GET /api/v1/clientes/{id}/historial
- [ ] POST /api/v1/clientes/{id}/consentimiento ⚠️ LEGAL
- [ ] GET /api/v1/clientes/{id}/exportar-datos ⚠️ LEGAL
- [ ] Tests

### 3.5.4 Endpoints de Productos
- [ ] GET /api/v1/productos
- [ ] GET /api/v1/productos/{id}
- [ ] GET /api/v1/productos/buscar?q=
- [ ] GET /api/v1/productos/codigo-barras/{codigo}
- [ ] POST /api/v1/productos
- [ ] PUT /api/v1/productos/{id}
- [ ] DELETE /api/v1/productos/{id}
- [ ] PATCH /api/v1/productos/{id}/stock
- [ ] POST /api/v1/productos/{id}/imagen
- [ ] Tests

### 3.5.5 Endpoints de Categorías
- [ ] GET /api/v1/categorias (árbol jerárquico)
- [ ] POST /api/v1/categorias
- [ ] PUT /api/v1/categorias/{id}
- [ ] DELETE /api/v1/categorias/{id}
- [ ] Tests

### 3.5.6 Endpoints de Ventas
- [ ] GET /api/v1/ventas
- [ ] GET /api/v1/ventas/{id}
- [ ] POST /api/v1/ventas (crear venta)
- [ ] POST /api/v1/ventas/{id}/items (agregar item)
- [ ] DELETE /api/v1/ventas/{id}/items/{item_id}
- [ ] PATCH /api/v1/ventas/{id}/descuento
- [ ] POST /api/v1/ventas/{id}/procesar-pago
- [ ] POST /api/v1/ventas/{id}/anular
- [ ] Tests

### 3.5.7 Endpoints de Facturación
- [ ] POST /api/v1/facturas/generar (desde venta_id)
- [ ] GET /api/v1/facturas/{id}
- [ ] GET /api/v1/facturas/{id}/xml
- [ ] GET /api/v1/facturas/{id}/pdf
- [ ] GET /api/v1/facturas/{id}/qr
- [ ] POST /api/v1/facturas/{id}/enviar-dian
- [ ] GET /api/v1/facturas/{id}/estado-dian
- [ ] POST /api/v1/facturas/{id}/nota-credito
- [ ] Tests

### 3.5.8 Endpoints de Reportes
- [ ] GET /api/v1/reportes/ventas
- [ ] GET /api/v1/reportes/productos-top
- [ ] GET /api/v1/reportes/inventario
- [ ] GET /api/v1/reportes/utilidades
- [ ] GET /api/v1/reportes/clientes
- [ ] GET /api/v1/reportes/export/excel
- [ ] Tests

### 3.5.9 Endpoints de Facturas de Compra ✅ COMPLETADO MVP
- [x] POST /api/v1/facturas-compra (crear con productos automáticos)
- [x] GET /api/v1/facturas-compra (listar con paginación y filtros)
- [x] GET /api/v1/facturas-compra/{id} (detalle con items)
- [x] PUT /api/v1/facturas-compra/{id} (actualizar)
- [x] DELETE /api/v1/facturas-compra/{id} (eliminar)
- [x] POST /api/v1/facturas-compra/{id}/upload-pdf (subir PDF)
- [x] Validación duplicados (numero_factura único)
- [x] Generación automática de SKU (CATEG-MARC-001)
- [x] Tests de integración pasando

### 3.5.10 Endpoints de Dashboard
- [ ] GET /api/v1/dashboard/metrics
- [ ] GET /api/v1/dashboard/ventas-hoy
- [ ] GET /api/v1/dashboard/alertas
- [ ] GET /api/v1/dashboard/graficos
- [ ] Tests

---

# MÓDULO 3.6: MEJORAS FRONTEND FACTURAS DE COMPRA

## 3.6.1 Funcionalidades Adicionales
- [ ] Página de detalle completo de factura
  - Vista de todos los items
  - Información del proveedor
  - Productos creados automáticamente
  - Opción de imprimir/exportar PDF
- [ ] Búsqueda y filtros en listado
  - Filtrar por proveedor
  - Filtrar por rango de fechas
  - Búsqueda por número de factura
  - Ordenar por fecha/total
- [ ] Edición de facturas
  - Permitir modificar observaciones
  - Agregar/quitar items (si no tiene productos creados)
  - Validaciones de integridad
- [ ] Subida de PDF de factura original
  - Drag & drop de archivo
  - Preview del PDF
  - Almacenamiento en /uploads/facturas/
- [ ] Estadísticas y métricas
  - Total invertido por proveedor
  - Productos creados este mes
  - Gráfico de compras mensuales
- [ ] Mejoras UX
  - Autocompletar proveedores
  - Sugerencias de precios basados en histórico
  - Shortcuts de teclado (Ctrl+S para guardar)
  - Validación en tiempo real

## 3.6.2 Optimizaciones
- [ ] Lazy loading de tablas grandes
- [ ] Cache de categorías/marcas/proveedores
- [ ] Debounce en búsquedas
- [ ] Paginación en listado de facturas
- [ ] Web Workers para cálculos pesados

---

# MÓDULO 4: SEGURIDAD Y PROTECCIÓN DE DATOS

## 4.1 Seguridad de Autenticación ✅ COMPLETADO

### 4.1.1 Implementación JWT ✅
- [x] Instalar python-jose, bcrypt
- [x] Configurar SECRET_KEY fuerte
- [x] Implementar generación de tokens (access y refresh)
- [x] Implementar validación de tokens
- [x] Configurar expiración (30 min access, 7 días refresh)
- [x] Corrección JWT spec: sub como string
- [ ] Tests unitarios (pendiente)

### 4.1.2 Hash de Contraseñas ✅
- [x] Implementar bcrypt directo para hashing
- [x] Configurar salt rounds (12 por defecto)
- [x] Función hash_password() con truncado 72 bytes
- [x] Función verify_password()
- [ ] Tests unitarios (pendiente)

### 4.1.3 Protección Anti-Brute Force ✅
- [x] Implementar límite de intentos (5 intentos)
- [x] Bloqueo automático (campo bloqueado en BD)
- [x] Registro de intentos fallidos (campo intentos_fallidos)
- [x] Reseteo automático tras login exitoso
- [ ] Alerta admin en ataques (pendiente)
- [ ] Tests unitarios (pendiente)

## 4.2 Cumplimiento Ley 1581/2012 (Habeas Data)

### 4.2.1 Política de Tratamiento de Datos
- [ ] Redactar política completa de tratamiento de datos
- [ ] Incluir:
  - Identificación del responsable (AEJ)
  - Datos recolectados
  - Finalidad del tratamiento
  - Derechos de los titulares
  - Procedimiento para ejercer derechos
  - Medidas de seguridad
  - Tiempo de conservación
- [ ] Documento legal firmado
- [ ] Publicar en sistema y local

### 4.2.2 Captura de Consentimiento
- [ ] Formulario de consentimiento explícito
- [ ] Checkboxes separados para:
  - Tratamiento de datos básicos (obligatorio)
  - Marketing y promociones (opcional)
  - Compartir con terceros (opcional)
- [ ] Registro de fecha, hora, IP, canal
- [ ] Almacenar en BD (tabla consentimientos_datos)
- [ ] Tests

### 4.2.3 Derechos de los Titulares
- [ ] Implementar derecho de ACCESO (consultar datos)
- [ ] Implementar derecho de RECTIFICACIÓN (corregir datos)
- [ ] Implementar derecho de ACTUALIZACIÓN
- [ ] Implementar derecho de SUPRESIÓN (eliminar datos)
- [ ] Implementar derecho de REVOCACIÓN (retirar consentimiento)
- [ ] Plazo máximo respuesta: 15 días hábiles
- [ ] Tests

### 4.2.4 Auditoría y Trazabilidad
- [ ] Registrar todo acceso a datos personales
- [ ] Registrar modificaciones
- [ ] Registrar quién, cuándo, qué datos
- [ ] Logs inmutables
- [ ] Retención logs: 5 años mínimo
- [ ] Tests

### 4.2.5 Seguridad de Datos Personales
- [ ] Cifrado de datos sensibles en BD (si aplica)
- [ ] Conexiones seguras (HTTPS en producción)
- [ ] Backups cifrados
- [ ] Control de acceso basado en roles
- [ ] Procedimiento de incidentes de seguridad
- [ ] Tests

## 4.3 Validación y Sanitización

### 4.3.1 Validación de Entrada
- [ ] Validar todos los inputs con Pydantic
- [ ] Validar tipos de datos
- [ ] Validar rangos numéricos
- [ ] Validar longitudes de string
- [ ] Validar formatos (email, teléfono, NIT, etc.)
- [ ] Tests

### 4.3.2 Sanitización
- [ ] Escapar caracteres especiales
- [ ] Prevenir SQL Injection (ORM automático)
- [ ] Prevenir XSS en frontend
- [ ] Validar nombres de archivos
- [ ] Tests

### 4.3.3 Validadores Personalizados
- [ ] Validador de NIT colombiano
- [ ] Validador de cédula colombiana
- [ ] Validador de CUFE
- [ ] Validador de código de barras
- [ ] Tests

## 4.4 Control de Acceso (RBAC)

### 4.4.1 Definición de Roles
- [ ] ROL: SuperAdmin
  - Acceso total
  - Configuración sistema
  - Gestión usuarios
- [ ] ROL: Admin
  - Gestión inventario
  - Reportes completos
  - Configuración básica
- [ ] ROL: Vendedor
  - Crear ventas
  - Buscar productos
  - Consultar clientes
- [ ] ROL: Visualizador
  - Solo consulta
  - Reportes básicos

### 4.4.2 Implementación Permisos
- [ ] Decorador @require_permission()
- [ ] Verificación en endpoints
- [ ] Matriz de permisos documentada
- [ ] Tests

### 4.4.3 Auditoría de Acciones
- [ ] Registrar acciones críticas:
  - Login/logout
  - Cambios de precios
  - Eliminaciones
  - Anulaciones
  - Modificaciones de inventario
- [ ] Tabla auditoria con:
  - usuario, acción, tabla, registro_id
  - datos_antes, datos_despues
  - fecha, IP
- [ ] Tests

## 4.5 Seguridad de Archivos

### 4.5.1 Upload de Imágenes
- [ ] Validar extensiones permitidas (jpg, png, webp)
- [ ] Validar tamaño máximo (5MB)
- [ ] Validar MIME type
- [ ] Generar nombres únicos (UUID)
- [ ] Almacenar fuera de webroot
- [ ] Tests

### 4.5.2 Generación de PDFs/XMLs
- [ ] Validar contenido generado
- [ ] Almacenar en directorio seguro
- [ ] Limpieza automática archivos antiguos
- [ ] Tests

---

# MÓDULO 5: FRONTEND PROFESIONAL

## 5.1 Diseño y UX

### 5.1.1 Sistema de Diseño
- [ ] Definir paleta de colores profesional
  - Primary: #2563eb (azul profesional)
  - Secondary: #10b981 (verde éxito)
  - Danger: #ef4444 (rojo alerta)
  - Warning: #f59e0b (naranja advertencia)
  - Neutral: grises (#f9fafb a #111827)
- [ ] Definir tipografía:
  - Fuente principal: Inter o System UI
  - Tamaños: 12px, 14px, 16px, 20px, 24px, 32px
- [ ] Definir espaciado (4px, 8px, 16px, 24px, 32px, 48px)
- [ ] Definir sombras y elevaciones
- [ ] Crear guía de estilo visual

### 5.1.2 Componentes Base
- [ ] Button (primary, secondary, danger, outline)
- [ ] Input (text, number, email, tel, search)
- [ ] Select / Dropdown
- [ ] Checkbox / Radio
- [ ] Modal / Dialog
- [ ] Alert / Toast
- [ ] Card
- [ ] Table con paginación
- [ ] Tabs
- [ ] Sidebar / Navigation
- [ ] Loader / Spinner
- [ ] Badge
- [ ] Avatar
- [ ] Breadcrumb

### 5.1.3 Layout Responsivo
- [ ] Grid system (12 columnas)
- [ ] Breakpoints: mobile (< 640px), tablet (640-1024px), desktop (> 1024px)
- [ ] Sidebar colapsable
- [ ] Header fijo con navegación
- [ ] Footer con info sistema

## 5.2 Arquitectura Frontend

### 5.2.1 Estructura de Archivos
```
frontend/
├── assets/
│   ├── css/
│   │   ├── reset.css
│   │   ├── variables.css
│   │   ├── components/
│   │   │   ├── button.css
│   │   │   ├── input.css
│   │   │   ├── modal.css
│   │   │   └── ...
│   │   ├── layouts/
│   │   │   ├── sidebar.css
│   │   │   ├── header.css
│   │   │   └── grid.css
│   │   └── main.css
│   ├── js/
│   │   ├── api/
│   │   │   ├── client.js
│   │   │   ├── auth.js
│   │   │   ├── productos.js
│   │   │   └── ...
│   │   ├── components/
│   │   │   ├── Modal.js
│   │   │   ├── Toast.js
│   │   │   ├── Table.js
│   │   │   └── ...
│   │   ├── utils/
│   │   │   ├── validators.js
│   │   │   ├── formatters.js
│   │   │   ├── storage.js
│   │   │   └── ...
│   │   ├── pages/
│   │   │   ├── dashboard.js
│   │   │   ├── ventas.js
│   │   │   ├── productos.js
│   │   │   └── ...
│   │   └── app.js
│   ├── img/
│   └── fonts/
├── pages/
│   ├── index.html (login)
│   ├── dashboard.html
│   ├── ventas.html
│   ├── productos.html
│   ├── clientes.html
│   ├── inventario.html
│   ├── reportes.html
│   └── configuracion.html
└── components/ (HTML snippets)
```

### 5.2.2 API Client
- [ ] Crear `js/api/client.js`:
  - baseURL configuración
  - Interceptores para token
  - Manejo de errores global
  - Retry logic
- [ ] Crear módulos API por entidad:
  - `auth.js`: login, logout, refresh
  - `productos.js`: CRUD productos
  - `ventas.js`: crear venta, procesar
  - `clientes.js`: CRUD clientes
  - etc.
- [ ] Tests (Jest o similar)

### 5.2.3 Estado Global Simple
- [ ] Crear `js/utils/store.js`:
  - currentUser
  - authToken
  - carritoVenta
  - notificaciones
- [ ] localStorage para persistencia
- [ ] Eventos custom para reactivity

### 5.2.4 Routing Simple
- [ ] Implementar router básico o usar páginas separadas
- [ ] Protección de rutas (verificar token)
- [ ] Redirección a login si no autenticado

## 5.3 Páginas Principales

### 5.3.1 Login
- [ ] Formulario de login
- [ ] Validación frontend
- [ ] Mostrar errores
- [ ] Loading state
- [ ] Recordar usuario (opcional)
- [ ] Link recuperar contraseña
- [ ] Tests

### 5.3.2 Dashboard
- [ ] Cards de métricas principales:
  - Ventas hoy
  - Ventas semana
  - Ventas mes
  - Total clientes
- [ ] Gráfico de ventas (Chart.js)
- [ ] Top 5 productos vendidos
- [ ] Alertas de inventario
- [ ] Accesos rápidos
- [ ] Tests

### 5.3.3 Punto de Venta (POS)
- [ ] Búsqueda de productos (nombre, código, barras)
- [ ] Lista de items en venta
- [ ] Cálculo automático de totales
- [ ] Aplicar descuentos
- [ ] Seleccionar cliente
- [ ] Botones métodos de pago
- [ ] Procesar venta
- [ ] Imprimir ticket/factura
- [ ] Limpiar venta
- [ ] Escaneo código de barras (input focus)
- [ ] Shortcuts teclado
- [ ] Tests

### 5.3.4 Productos
- [ ] Listado paginado con búsqueda
- [ ] Filtros: categoría, marca, stock
- [ ] Tabla con columnas: imagen, nombre, SKU, precio, stock
- [ ] Acciones: editar, eliminar
- [ ] Modal crear/editar producto
- [ ] Upload de imagen
- [ ] Gestión de variantes
- [ ] Tests

### 5.3.5 Clientes
- [ ] Listado paginado con búsqueda
- [ ] Filtros: clasificación, ciudad
- [ ] Tabla: nombre, documento, teléfono, total_compras
- [ ] Modal crear/editar cliente
- [ ] Formulario consentimiento datos ⚠️ LEGAL
- [ ] Ver historial de compras
- [ ] Exportar datos cliente ⚠️ LEGAL
- [ ] Tests

### 5.3.6 Inventario
- [ ] Vista de stock actual
- [ ] Alertas de stock bajo
- [ ] Ajustes de inventario
- [ ] Movimientos de inventario
- [ ] Importar/exportar
- [ ] Tests

### 5.3.7 Reportes
- [ ] Selector de tipo de reporte
- [ ] Filtros por fecha
- [ ] Visualización de datos (tablas, gráficos)
- [ ] Exportar a Excel/PDF
- [ ] Tests

### 5.3.8 Facturación Electrónica
- [ ] Listar facturas
- [ ] Ver detalle factura
- [ ] Generar factura desde venta
- [ ] Ver XML
- [ ] Descargar PDF
- [ ] Ver estado DIAN
- [ ] Reenviar a DIAN
- [ ] Generar nota crédito
- [ ] Tests

### 5.3.9 Configuración
- [ ] Datos de la empresa
- [ ] Configuración DIAN (certificado, NIT, etc.)
- [ ] Configuración facturación
- [ ] Gestión de usuarios
- [ ] Política de privacidad ⚠️ LEGAL
- [ ] Backups
- [ ] Tests

## 5.4 Características UX

### 5.4.1 Feedback Visual
- [ ] Loaders durante peticiones
- [ ] Toasts para notificaciones
- [ ] Confirmación para acciones destructivas
- [ ] Estados de botones (normal, loading, disabled)
- [ ] Validación en tiempo real en formularios

### 5.4.2 Accesibilidad
- [ ] Etiquetas ARIA
- [ ] Contraste de colores (WCAG AA)
- [ ] Navegación por teclado
- [ ] Focus visible
- [ ] Textos alternativos en imágenes

### 5.4.3 Performance
- [ ] Lazy loading de imágenes
- [ ] Debounce en búsquedas
- [ ] Paginación de tablas
- [ ] Minimizar JS/CSS
- [ ] Caché de recursos

---

# MÓDULO 6: FACTURACIÓN ELECTRÓNICA DIAN

## 6.1 Configuración DIAN

### 6.1.1 Registro en DIAN
- [ ] Obtener certificado digital (ONAC)
- [ ] Solicitar habilitación facturación electrónica
- [ ] Obtener rango de numeración autorizado
- [ ] Configurar ambiente de pruebas
- [ ] Documentar proceso

### 6.1.2 Certificado Digital
- [ ] Instalar certificado (.pfx)
- [ ] Almacenar de forma segura
- [ ] Configurar en código
- [ ] Función para cargar certificado
- [ ] Tests con certificado de pruebas

### 6.1.3 Numeración Autorizada
- [ ] Tabla: `numeraciones_dian`
- [ ] Campos:
  - prefijo, resolucion_numero
  - fecha_resolucion
  - rango_desde, rango_hasta
  - tipo_documento (factura, nota_credito, etc.)
  - ambiente (1=prod, 2=pruebas)
  - activo, fecha_vencimiento
  - consecutivo_actual
- [ ] Función obtener_siguiente_numero()
- [ ] Validar no exceder rango
- [ ] Tests

## 6.2 Generación XML DIAN

### 6.2.1 Estructura XML UBL 2.1
- [ ] Estudiar especificaciones DIAN
- [ ] Crear template XML base
- [ ] Namespace correctos
- [ ] Implementar generador XML con ElementTree o lxml
- [ ] Tests

### 6.2.2 Secciones del XML
- [ ] Encabezado (InvoiceHeader)
  - ID, UUID (CUFE), IssueDate, IssueTime
  - InvoiceTypeCode
  - DocumentCurrencyCode (COP)
- [ ] Datos Emisor (AccountingSupplierParty)
  - NIT, nombre, dirección, ciudad
  - RegimenFiscal, Responsabilidades
- [ ] Datos Adquirente (AccountingCustomerParty)
  - Tipo documento, número
  - Nombre, dirección
- [ ] Totales (LegalMonetaryTotal)
  - LineExtensionAmount (subtotal)
  - TaxExclusiveAmount
  - TaxInclusiveAmount (total)
  - PayableAmount
- [ ] Items (InvoiceLine)
  - ID, Quantity, UnitCode
  - LineExtensionAmount
  - Item (Description, SellersItemIdentification)
  - Price
  - TaxTotal (IVA)
- [ ] Medios de pago
- [ ] Tests con casos reales

### 6.2.3 Cálculo CUFE
- [ ] Implementar algoritmo CUFE según DIAN:
  ```
  CUFE = SHA384(
    NumeroFactura +
    FechaEmision +
    HoraEmision +
    ValorSinImpuestos +
    "01" + // código impuesto IVA
    ValorImpuesto +
    "04" + // código impuesto consumo
    ValorImpuestoConsumo +
    "03" + // código impuesto ICA
    ValorImpuestoICA +
    TotalFactura +
    NITEmisor +
    TipoDocAdquirente +
    NumDocAdquirente +
    ClaveAlgoritmo + // DIAN proporciona
    TipoAmbiente
  )
  ```
- [ ] Función generar_cufe()
- [ ] Tests con ejemplos DIAN

### 6.2.4 Generación QR
- [ ] Instalar qrcode library
- [ ] Datos QR según DIAN:
  - NIT Emisor
  - NIT/Doc Adquirente
  - Número factura
  - Fecha emisión
  - Total factura
  - Valor IVA
  - CUFE
  - URL verificación DIAN
- [ ] Función generar_qr()
- [ ] Guardar imagen QR
- [ ] Tests

## 6.3 Firma Digital

### 6.3.1 Firma XML
- [ ] Instalar signxml o similar
- [ ] Cargar certificado digital
- [ ] Firmar XML con SHA256
- [ ] Insertar firma en XML
- [ ] Validar XML firmado
- [ ] Tests

### 6.3.2 Validación XML
- [ ] Validar contra XSD DIAN
- [ ] Descargar XSDs oficiales
- [ ] Función validar_xml()
- [ ] Tests

## 6.4 Envío a DIAN

### 6.4.1 API DIAN
- [ ] Estudiar documentación API DIAN
- [ ] Implementar autenticación
- [ ] Endpoints:
  - SendBillSync (envío sincrónico)
  - SendBillAsync (envío asincrónico)
  - GetStatus (consultar estado)
  - GetNumberingRange (consultar numeración)
- [ ] Implementar cliente SOAP (zeep library)
- [ ] Tests con ambiente pruebas

### 6.4.2 Manejo de Respuestas
- [ ] Procesar ApplicationResponse de DIAN
- [ ] Códigos de respuesta:
  - 00: Aprobado
  - 01: Rechazado
  - 02: Pendiente validación
  - etc.
- [ ] Actualizar estado en BD
- [ ] Guardar respuesta DIAN
- [ ] Tests

### 6.4.3 Reintentos
- [ ] Implementar retry logic
- [ ] Máximo 3 reintentos
- [ ] Backoff exponencial
- [ ] Notificar errores persistentes
- [ ] Tests

## 6.5 Representación Gráfica (PDF)

### 6.5.1 Generación PDF
- [ ] Instalar ReportLab o WeasyPrint
- [ ] Diseñar template PDF profesional:
  - Logo empresa
  - Datos emisor (AEJ Cosmetic & More)
  - Datos adquirente
  - Número factura, CUFE
  - Tabla de items
  - Subtotales, IVA, total
  - QR code
  - Leyenda legal DIAN
  - Representación gráfica de FE
- [ ] Función generar_pdf_factura()
- [ ] Tests

### 6.5.2 Elementos Obligatorios PDF
- [ ] Título: "FACTURA ELECTRÓNICA DE VENTA"
- [ ] Número y fecha
- [ ] CUFE visible
- [ ] QR code
- [ ] Leyenda: "Esta es una representación gráfica de la factura electrónica generada y validada por la DIAN"
- [ ] Datos de la resolución DIAN
- [ ] Cumplir diseño profesional

## 6.6 Notas Crédito/Débito

### 6.6.1 Nota Crédito
- [ ] Motivos: devolución, descuento, anulación
- [ ] Referenciar factura original
- [ ] Generar XML similar a factura
- [ ] CUFE para nota crédito
- [ ] Enviar a DIAN
- [ ] Tests

### 6.6.2 Nota Débito
- [ ] Motivos: intereses, ajustes
- [ ] Similar a nota crédito
- [ ] Tests

## 6.7 Documentos Equivalentes POS

### 6.7.1 Ticket POS Electrónico
- [ ] Para ventas < 5 UVT (Res. 001092/2022)
- [ ] Numeración autorizada DIAN
- [ ] XML simplificado
- [ ] CUFE
- [ ] Envío a DIAN
- [ ] PDF/Ticket impreso
- [ ] Tests

### 6.7.2 Umbral UVT
- [ ] Obtener valor UVT actual (DIAN)
- [ ] Calcular 5 UVT
- [ ] Lógica: si venta >= 5 UVT → factura, sino → doc equivalente
- [ ] Configuración dinámica
- [ ] Tests

## 6.8 Integración con Ventas

### 6.8.1 Flujo Automático
- [ ] Al finalizar venta → verificar monto
- [ ] Si >= 5 UVT: generar factura electrónica
- [ ] Si < 5 UVT: generar doc equivalente
- [ ] Generar XML, firmar, CUFE, QR
- [ ] Enviar a DIAN (async)
- [ ] Generar PDF
- [ ] Mostrar al usuario
- [ ] Opción imprimir
- [ ] Tests e2e

### 6.8.2 Manejo de Errores
- [ ] Si DIAN rechaza: mostrar error, permitir corregir
- [ ] Si DIAN no responde: guardar para reenvío
- [ ] Cola de reintentos
- [ ] Notificaciones admin
- [ ] Tests

---

# MÓDULO 7: GESTIÓN DE INVENTARIO AVANZADO

## 7.1 Movimientos de Inventario

### 7.1.1 Tipos de Movimiento
- [ ] Entrada: compra, devolución cliente, ajuste positivo
- [ ] Salida: venta, devolución a proveedor, ajuste negativo
- [ ] Transferencia: entre bodegas (si aplica)
- [ ] Tests

### 7.1.2 Registro Automático
- [ ] Al crear venta → salida automática
- [ ] Al anular venta → entrada automática
- [ ] Al crear compra → entrada automática
- [ ] Triggers o eventos
- [ ] Tests

### 7.1.3 Kardex
- [ ] Vista histórica de movimientos por producto
- [ ] Fecha, tipo, cantidad, saldo
- [ ] Usuario responsable
- [ ] Reporte imprimible
- [ ] Tests

## 7.2 Alertas de Inventario

### 7.2.1 Alertas Automáticas
- [ ] Stock bajo (< stock_minimo)
- [ ] Stock crítico (= 0)
- [ ] Stock alto (> stock_maximo)
- [ ] Productos sin movimiento (>90 días)
- [ ] Tests

### 7.2.2 Notificaciones
- [ ] Dashboard: badge con número de alertas
- [ ] Modal con listado
- [ ] Acciones: comprar, ajustar, ignorar
- [ ] Marcar como atendida
- [ ] Tests

## 7.3 Valorización de Inventario

### 7.3.1 Métodos de Valorización
- [ ] Costo Promedio Ponderado (implementar)
- [ ] PEPS (FIFO) (opcional)
- [ ] Selección en configuración
- [ ] Tests

### 7.3.2 Reportes de Valorización
- [ ] Valor total inventario
- [ ] Desglose por categoría
- [ ] Desglose por marca
- [ ] Comparación periodos
- [ ] Tests

## 7.4 Importación/Exportación

### 7.4.1 Exportar Inventario
- [ ] Formato Excel
- [ ] Formato CSV
- [ ] Incluir: SKU, nombre, stock, precios
- [ ] Tests

### 7.4.2 Importar Productos
- [ ] Desde Excel/CSV
- [ ] Validación de datos
- [ ] Manejo de errores
- [ ] Preview antes de importar
- [ ] Tests

---

# MÓDULO 8: REPORTES Y ANALYTICS

## 8.1 Reportes de Ventas

### 8.1.1 Reporte Ventas por Periodo
- [ ] Filtros: fecha inicio, fecha fin
- [ ] Agrupación: día, semana, mes
- [ ] Métricas: total ventas, cantidad transacciones, ticket promedio
- [ ] Gráfico de línea temporal
- [ ] Exportar Excel/PDF
- [ ] Tests

### 8.1.2 Reporte Ventas por Usuario
- [ ] Total vendido por usuario
- [ ] Ranking de vendedores
- [ ] Tests

### 8.1.3 Reporte Ventas por Cliente
- [ ] Top clientes por gasto
- [ ] Frecuencia de compra
- [ ] Tests

## 8.2 Reportes de Productos

### 8.2.1 Top Productos Vendidos
- [ ] Ranking por cantidad
- [ ] Ranking por ingresos
- [ ] Periodo configurable
- [ ] Tests

### 8.2.2 Productos sin Rotación
- [ ] Productos sin ventas en X días
- [ ] Sugerencias de liquidación
- [ ] Tests

### 8.2.3 Análisis de Rentabilidad
- [ ] Margen de utilidad por producto
- [ ] Comparación precio compra vs venta
- [ ] Tests

## 8.3 Dashboard Analytics

### 8.3.1 Gráficos Interactivos
- [ ] Instalar Chart.js
- [ ] Gráfico ventas últimos 30 días (línea)
- [ ] Gráfico top 10 productos (barras)
- [ ] Gráfico distribución ventas por método pago (pie)
- [ ] Tests

### 8.3.2 KPIs Principales
- [ ] Ventas hoy vs ayer (% cambio)
- [ ] Ventas mes vs mes anterior
- [ ] Ticket promedio
- [ ] Productos en alerta
- [ ] Tests

## 8.4 Exportación de Reportes

### 8.4.1 Exportar a Excel
- [ ] Instalar openpyxl
- [ ] Función genérica export_to_excel()
- [ ] Formato profesional (headers, borders, etc.)
- [ ] Tests

### 8.4.2 Exportar a PDF
- [ ] Función genérica export_to_pdf()
- [ ] Template profesional
- [ ] Tests

---

# MÓDULO 9: SISTEMA DE BACKUPS Y AUDITORÍA

## 9.1 Backups Automáticos

### 9.1.1 Configuración de Backups
- [ ] Frecuencia: diaria (2:00 AM)
- [ ] Retención: 7 días backups diarios, 4 semanales, 12 mensuales
- [ ] Compresión: gzip
- [ ] Ubicación: `database/backups/`
- [ ] Tests

### 9.1.2 Script de Backup
- [ ] `scripts/backup_automatico.py`
- [ ] Copiar aej_sistema.db
- [ ] Comprimir con gzip
- [ ] Nombrar: `backup_YYYYMMDD_HHMMSS.db.gz`
- [ ] Calcular checksum MD5
- [ ] Guardar metadata (fecha, tamaño, checksum)
- [ ] Limpiar backups antiguos
- [ ] Tests

### 9.1.3 Programación Automática
- [ ] Windows: Task Scheduler
- [ ] Script PowerShell para crear tarea
- [ ] Linux: Cron job
- [ ] Tests

### 9.1.4 Restauración de Backups
- [ ] `scripts/restaurar_backup.py`
- [ ] Listar backups disponibles
- [ ] Seleccionar backup
- [ ] Verificar checksum
- [ ] Descomprimir
- [ ] Reemplazar BD actual (con confirmación)
- [ ] Crear backup pre-restauración
- [ ] Tests

## 9.2 Backup Externo

### 9.2.1 Backup a USB/Disco Externo
- [ ] Configurar ruta externa en .env
- [ ] Copiar backups automáticamente
- [ ] Tests

### 9.2.2 Backup Manual
- [ ] Endpoint /api/v1/backups/crear
- [ ] Endpoint /api/v1/backups/listar
- [ ] Endpoint /api/v1/backups/descargar/{id}
- [ ] UI para crear backup manual
- [ ] Tests

## 9.3 Auditoría Completa

### 9.3.1 Log de Auditoría
- [ ] Tabla auditoria (ya definida)
- [ ] Decorator @audit() para marcar funciones
- [ ] Registrar automáticamente:
  - Acción, usuario, timestamp
  - Datos antes/después (JSON)
  - IP, user agent
- [ ] Tests

### 9.3.2 Consulta de Auditoría
- [ ] Endpoint /api/v1/auditoria
- [ ] Filtros: usuario, fecha, acción, tabla
- [ ] Paginación
- [ ] UI para consultar logs
- [ ] Exportar logs
- [ ] Tests

### 9.3.3 Retención de Logs
- [ ] Conservar logs 5 años (Ley 1581)
- [ ] Archivar logs antiguos
- [ ] Tests

---

# MÓDULO 10: TESTING Y CALIDAD

## 10.1 Testing Backend

### 10.1.1 Tests Unitarios
- [ ] Instalar pytest, pytest-cov
- [ ] Configurar pytest.ini
- [ ] Tests para todos los servicios
- [ ] Tests para repositories
- [ ] Tests para utils
- [ ] Cobertura objetivo: >80%
- [ ] CI/CD: ejecutar en cada commit

### 10.1.2 Tests de Integración
- [ ] Tests de endpoints API
- [ ] Tests de BD (con BD de pruebas)
- [ ] Tests de flujos completos
- [ ] Fixtures de datos de prueba

### 10.1.3 Tests E2E
- [ ] Tests de flujos críticos:
  - Crear venta completa
  - Generar factura electrónica
  - Anular venta
- [ ] Simular interacción usuario

## 10.2 Testing Frontend

### 10.2.1 Tests Manuales
- [ ] Checklist de funcionalidades
- [ ] Tests en navegadores (Chrome, Firefox, Edge)
- [ ] Tests responsive (mobile, tablet, desktop)

### 10.2.2 Tests Automatizados (opcional)
- [ ] Selenium o Playwright
- [ ] Tests de flujos críticos

## 10.3 Calidad de Código

### 10.3.1 Linting y Formateo
- [ ] black para formateo Python
- [ ] flake8 para linting
- [ ] pylint para análisis estático
- [ ] mypy para type checking
- [ ] Pre-commit hooks

### 10.3.2 Code Review
- [ ] Revisión de código antes de merge
- [ ] Checklist de revisión

### 10.3.3 Análisis de Seguridad
- [ ] bandit para análisis seguridad Python
- [ ] safety para vulnerabilidades en dependencias
- [ ] Actualizar dependencias regularmente

## 10.4 Performance Testing

### 10.4.1 Load Testing
- [ ] Herramienta: Locust o Apache Bench
- [ ] Simular 10-50 usuarios concurrentes
- [ ] Medir tiempos de respuesta
- [ ] Identificar cuellos de botella

### 10.4.2 Optimización BD
- [ ] Analizar queries lentos
- [ ] Agregar índices necesarios
- [ ] Optimizar joins
- [ ] VACUUM SQLite periódicamente

---

# MÓDULO 11: DOCUMENTACIÓN Y DESPLIEGUE

## 11.1 Documentación Técnica

### 11.1.1 Documentación de Código
- [ ] Docstrings en todas las funciones (Google style)
- [ ] Type hints en Python
- [ ] Comentarios en lógica compleja
- [ ] README por módulo

### 11.1.2 Documentación API
- [ ] OpenAPI/Swagger automático (FastAPI)
- [ ] Personalizar descripciones
- [ ] Ejemplos de request/response
- [ ] Códigos de error documentados

### 11.1.3 Arquitectura
- [ ] Diagrama de arquitectura (C4 Model)
- [ ] Diagrama de flujo de datos
- [ ] Diagrama ER de BD
- [ ] ADRs (decisiones importantes)

### 11.1.4 MkDocs
- [ ] Instalar mkdocs-material
- [ ] Crear site con:
  - Introducción
  - Guía de instalación
  - Guía de usuario
  - Guía de desarrollador
  - API Reference
  - Legal (DIAN, Habeas Data)
- [ ] Deploy docs local

## 11.2 Manual de Usuario

### 11.2.1 Guías Paso a Paso
- [ ] Cómo crear una venta
- [ ] Cómo generar factura electrónica
- [ ] Cómo gestionar productos
- [ ] Cómo gestionar clientes
- [ ] Cómo ver reportes
- [ ] Cómo hacer backups manuales

### 11.2.2 FAQs
- [ ] Problemas comunes y soluciones
- [ ] Glosario de términos

### 11.2.3 Videos Tutoriales (opcional)
- [ ] Grabación de pantalla
- [ ] Tutoriales cortos (2-5 min)

## 11.3 Documentación Legal

### 11.3.1 Política de Tratamiento de Datos
- [ ] Documento completo según Ley 1581
- [ ] Versión PDF firmada
- [ ] Publicar en sistema y física

### 11.3.2 Términos y Condiciones
- [ ] Para uso del sistema
- [ ] Para clientes finales

### 11.3.3 Procedimientos Habeas Data
- [ ] Procedimiento ejercer derechos
- [ ] Formularios de solicitud
- [ ] Plazos de respuesta

## 11.4 Despliegue

### 11.4.1 Ambiente de Desarrollo
- [ ] Ya configurado
- [ ] .env con FLASK_ENV=development

### 11.4.2 Ambiente de Producción
- [ ] .env con FLASK_ENV=production
- [ ] SECRET_KEY fuerte
- [ ] DEBUG=False
- [ ] Configurar DIAN producción
- [ ] Certificado digital producción
- [ ] Rangos numeración producción

### 11.4.3 Instalación en Cliente
- [ ] Crear instalador (PyInstaller o similar)
- [ ] Incluir Python embebido
- [ ] Incluir todas las dependencias
- [ ] Script de instalación automático
- [ ] Crear acceso directo en escritorio
- [ ] Configurar inicio automático (opcional)

### 11.4.4 Actualización
- [ ] Sistema de versionado (SemVer)
- [ ] Script de migración de datos
- [ ] Backup automático antes de actualizar
- [ ] Changelog

---

# MÓDULO 12: MANTENIMIENTO Y SOPORTE

## 12.1 Monitoreo

### 12.1.1 Logs del Sistema
- [ ] Revisar logs periódicamente
- [ ] Alertas de errores críticos
- [ ] Dashboard de salud del sistema

### 12.1.2 Métricas
- [ ] Tiempo de respuesta API
- [ ] Uso de disco
- [ ] Tamaño de BD
- [ ] Número de ventas/día

## 12.2 Mantenimiento Preventivo

### 12.2.1 Tareas Diarias (automáticas)
- [ ] Backup automático
- [ ] Limpieza de logs antiguos
- [ ] Limpieza de archivos temporales

### 12.2.2 Tareas Semanales
- [ ] Revisar alertas de inventario
- [ ] Revisar estado facturas DIAN
- [ ] Revisar logs de errores

### 12.2.3 Tareas Mensuales
- [ ] Actualizar dependencias
- [ ] Revisar políticas de seguridad
- [ ] VACUUM de BD
- [ ] Verificar backups

### 12.2.4 Tareas Anuales
- [ ] Renovar certificado digital DIAN
- [ ] Solicitar nuevos rangos de numeración
- [ ] Auditoría completa de seguridad
- [ ] Revisar Política Tratamiento Datos

## 12.3 Soporte al Usuario

### 12.3.1 Canales de Soporte
- [ ] Email de soporte
- [ ] Teléfono de soporte
- [ ] Sistema de tickets (opcional)

### 12.3.2 Base de Conocimiento
- [ ] FAQ en sistema
- [ ] Tutoriales
- [ ] Videos

### 12.3.3 Capacitación
- [ ] Capacitación inicial usuarios
- [ ] Capacitación en nuevas funcionalidades
- [ ] Manuales impresos

## 12.4 Evolución del Sistema

### 12.4.1 Roadmap Futuro
- [ ] Módulo de nómina (opcional)
- [ ] Integración con bancos
- [ ] App móvil
- [ ] Integración con e-commerce
- [ ] Multi-tienda
- [ ] Análisis predictivo con ML

### 12.4.2 Feedback Usuarios
- [ ] Recopilar sugerencias
- [ ] Priorizar mejoras
- [ ] Implementar iterativamente

---

# 📈 CRONOGRAMA ESTIMADO

## Fase 1: Fundamentos (Semanas 1-2)
- Módulo 1: Fundamentos y Arquitectura
- Módulo 2.1-2.2: Base de Datos (diseño y modelos core)

## Fase 2: Backend Core (Semanas 3-6)
- Módulo 2.3-2.7: Modelos completos
- Módulo 3: Backend API Core
- Módulo 4: Seguridad y Protección de Datos

## Fase 3: DIAN (Semanas 7-9)
- Módulo 6: Facturación Electrónica DIAN

## Fase 4: Frontend (Semanas 10-13)
- Módulo 5: Frontend Profesional

## Fase 5: Funcionalidades Avanzadas (Semanas 14-16)
- Módulo 7: Gestión de Inventario Avanzado
- Módulo 8: Reportes y Analytics
- Módulo 9: Sistema de Backups y Auditoría

## Fase 6: Calidad (Semanas 17-18)
- Módulo 10: Testing y Calidad

## Fase 7: Documentación y Despliegue (Semanas 19-20)
- Módulo 11: Documentación y Despliegue
- Módulo 12: Mantenimiento y Soporte

## Fase 8: Piloto y Ajustes (Semanas 21-24)
- Pruebas con usuarios reales
- Ajustes y correcciones
- Capacitación final
- Go-live

**DURACIÓN TOTAL ESTIMADA: 24 semanas (6 meses)**

---

# ✅ CRITERIOS DE ÉXITO

## Cumplimiento Legal
- ✅ 100% cumplimiento Resolución DIAN 000165/2023
- ✅ 100% cumplimiento Ley 1581/2012 (Habeas Data)
- ✅ Facturas electrónicas validadas por DIAN
- ✅ Política de Tratamiento de Datos implementada

## Funcionalidad
- ✅ Sistema completo de POS operativo
- ✅ Facturación electrónica funcional
- ✅ Inventario en tiempo real
- ✅ Reportes precisos
- ✅ Backups automáticos

## Calidad
- ✅ Cobertura de tests >80%
- ✅ 0 bugs críticos
- ✅ Tiempo de respuesta <200ms
- ✅ Documentación completa
- ✅ Código limpio y mantenible

## Usuario
- ✅ Interfaz intuitiva
- ✅ Usuarios capacitados
- ✅ Satisfacción >90%

---

# 🔧 HERRAMIENTAS Y TECNOLOGÍAS

## Backend
- Python 3.11+
- FastAPI
- SQLAlchemy 2.0+
- Alembic
- Pydantic
- python-jose (JWT)
- passlib (bcrypt)
- signxml (firma digital)
- qrcode
- openpyxl
- reportlab / weasyprint
- zeep (SOAP DIAN)

## Frontend
- HTML5
- CSS3 (Grid, Flexbox)
- JavaScript ES6+ (Vanilla)
- Chart.js

## Testing
- pytest
- pytest-cov
- pytest-asyncio

## Docs
- MkDocs Material

## Tools
- Git
- VS Code
- SQLite Browser
- Postman

---

# 📚 RECURSOS LEGALES

## DIAN
- Resolución 000165 de 2023
- Resolución 000202 de marzo 2025
- Resolución 001092 de 2022
- Especificaciones técnicas XML UBL 2.1
- Portal DIAN: https://www.dian.gov.co

## Habeas Data
- Ley 1581 de 2012
- Decreto 1377 de 2013
- SIC (Superintendencia de Industria y Comercio)

---

# 🎓 CAPACITACIÓN NECESARIA

## Desarrollador
- [ ] FastAPI framework
- [ ] SQLAlchemy ORM
- [ ] XML UBL DIAN
- [ ] Firma digital con certificados
- [ ] Normativa DIAN
- [ ] Ley 1581 Habeas Data

## Usuario Final
- [ ] Uso del sistema POS
- [ ] Facturación electrónica básica
- [ ] Gestión de inventario
- [ ] Consulta de reportes

---

# 💡 MEJORES PRÁCTICAS

## Código
- Seguir PEP 8 (Python)
- Naming conventions consistentes
- DRY (Don't Repeat Yourself)
- SOLID principles
- Documentar funciones complejas

## Git
- Commits descriptivos
- Branches por feature
- Pull requests con revisión
- Nunca commit de .env

## Seguridad
- Nunca hardcodear secretos
- Validar todos los inputs
- Sanitizar outputs
- Principio de mínimo privilegio
- Mantener dependencias actualizadas

## Performance
- Indexar campos de búsqueda
- Paginar resultados largos
- Cachear cuando sea apropiado
- Lazy loading de recursos pesados

---

---

# 🚀 SUGERENCIAS DE DESARROLLO PROGRESIVO

## Prioridad 1: Funcionalidades Core del POS (Semanas 1-4)

### 1.1 Gestión de Productos (Semana 1)
**¿Por qué es prioritario?** Sin productos no hay ventas. Esta es la base del sistema.

- [ ] **Endpoints de Productos**
  - GET /api/v1/productos (listado con paginación, búsqueda, filtros)
  - POST /api/v1/productos (crear producto con categoría y marca)
  - PUT /api/v1/productos/{id} (actualizar)
  - DELETE /api/v1/productos/{id} (soft delete)
  - GET /api/v1/productos/buscar?q={query} (búsqueda rápida)
  - GET /api/v1/productos/codigo-barras/{codigo} (para escaneo)

- [ ] **Página productos.html**
  - Tabla con columnas: imagen, nombre, SKU, categoría, marca, precio, stock
  - Búsqueda en tiempo real (debounce)
  - Filtros: categoría, marca, stock bajo
  - Modal crear/editar producto
  - Upload de imagen (opcional para MVP)
  - Indicadores visuales: stock bajo (amarillo), sin stock (rojo)

- [ ] **Mejoras UX**
  - Autocompletar categorías y marcas
  - Cálculo automático de precio con IVA
  - Validación: precio venta >= precio compra
  - Preview de imagen antes de subir

**Valor agregado:** Los usuarios podrán gestionar el catálogo completo de productos.

### 1.2 Gestión de Clientes (Semana 2)
**¿Por qué es prioritario?** Necesario para ventas y cumplimiento legal (Habeas Data).

- [ ] **Modelo Cliente**
  - Tabla `clientes` con campos según Ley 1581/2012
  - Campos: tipo_documento, documento, nombre, email, teléfono
  - aceptacion_tratamiento_datos (BOOLEAN) ⚠️ LEGAL
  - fecha_aceptacion_datos, canal_aceptacion

- [ ] **Endpoints de Clientes**
  - GET /api/v1/clientes (paginado)
  - POST /api/v1/clientes (con consentimiento obligatorio)
  - PUT /api/v1/clientes/{id}
  - DELETE /api/v1/clientes/{id}
  - GET /api/v1/clientes/buscar?q={documento_o_nombre}

- [ ] **Página clientes.html**
  - Tabla: nombre, documento, teléfono, email, total_compras
  - Búsqueda rápida por nombre o documento
  - Modal crear cliente con:
    - Formulario completo
    - Checkbox consentimiento datos (obligatorio) ⚠️ LEGAL
    - Leyenda de política de privacidad
  - Ver historial de compras (futuro)

**Valor agregado:** Cumplimiento legal + base de datos de clientes para marketing.

### 1.3 Módulo de Ventas - POS (Semanas 3-4)
**¿Por qué es prioritario?** Es el core del negocio. Sin esto no hay ingresos.

- [ ] **Modelos de Venta**
  - Tabla `ventas` con campos: cliente_id, usuario_id, fecha_hora, subtotal, descuento, iva, total
  - Tabla `venta_items`: venta_id, producto_id, cantidad, precio_unitario, subtotal, iva
  - Estados: abierta, pagada, anulada

- [ ] **Endpoints de Ventas**
  - POST /api/v1/ventas (crear venta vacía)
  - POST /api/v1/ventas/{id}/items (agregar producto)
  - DELETE /api/v1/ventas/{id}/items/{item_id}
  - PATCH /api/v1/ventas/{id}/descuento
  - POST /api/v1/ventas/{id}/procesar-pago (finalizar venta)
  - POST /api/v1/ventas/{id}/anular
  - GET /api/v1/ventas (historial)

- [ ] **Página pos.html (Punto de Venta)**
  - Layout en dos columnas:
    - Izquierda: búsqueda de productos + lista de productos
    - Derecha: carrito de venta con items agregados
  - Búsqueda de productos:
    - Input con búsqueda en tiempo real
    - Soporte para escaneo de código de barras
    - Resultados en cards clickeables
  - Carrito de venta:
    - Tabla de items con cantidad editable
    - Botón eliminar item
    - Cálculo automático: subtotal, IVA, total
    - Input descuento (% o valor fijo)
    - Selector de cliente (opcional para ventas rápidas)
  - Panel de pago:
    - Botones: Efectivo, Tarjeta, Transferencia, Mixto
    - Input valor recibido (para efectivo)
    - Cálculo automático de cambio
    - Botón "Procesar Pago" grande y destacado
  - Acciones:
    - Limpiar venta
    - Guardar venta (para continuar después)
    - Imprimir ticket (después de pagar)
  - Shortcuts de teclado:
    - F1: Enfocar búsqueda
    - F2: Agregar cliente
    - F9: Procesar pago
    - Esc: Limpiar venta

**Valor agregado:** Sistema POS funcional para procesar ventas en tiempo real.

## Prioridad 2: Reportes Básicos (Semana 5)

### 2.1 Dashboard Funcional
- [ ] **Métricas reales del dashboard**
  - GET /api/v1/dashboard/metricas
  - Ventas de hoy (total, cantidad, ticket promedio)
  - Ventas del mes
  - Productos con stock bajo (conteo)
  - Total de clientes activos

- [ ] **Actualizar dashboard.html**
  - Conectar cards de métricas con API
  - Actualización automática cada 5 minutos
  - Gráfico de ventas últimos 7 días (Chart.js)
  - Lista de productos con stock bajo

### 2.2 Reportes de Ventas
- [ ] **Endpoint de reportes**
  - GET /api/v1/reportes/ventas?fecha_inicio=&fecha_fin=
  - Agrupación por día
  - Total vendido, cantidad de transacciones

- [ ] **Página reportes.html**
  - Selector de rango de fechas
  - Tabla con resultados
  - Gráfico de línea temporal
  - Botón exportar a Excel (futuro)

**Valor agregado:** Visibilidad del rendimiento del negocio.

## Prioridad 3: Gestión de Inventario (Semanas 6-7)

### 3.1 Movimientos de Inventario
- [ ] **Modelo MovimientoInventario**
  - Tipos: entrada, salida, ajuste
  - Trigger automático al crear venta → salida
  - Trigger automático al crear factura_compra → entrada

- [ ] **Endpoints**
  - GET /api/v1/inventario/movimientos (kardex)
  - POST /api/v1/inventario/ajustes (ajuste manual)

- [ ] **Página inventario.html**
  - Vista de stock actual por producto
  - Alertas de stock bajo destacadas
  - Formulario de ajuste de inventario
  - Historial de movimientos (kardex)

### 3.2 Alertas de Stock
- [ ] **Sistema de alertas**
  - Verificación automática en cada venta
  - Crear alerta si stock < stock_minimo
  - Notificación en dashboard (badge)
  - Modal de alertas al hacer login

**Valor agregado:** Control de inventario en tiempo real y prevención de quiebres de stock.

## Prioridad 4: Facturación Electrónica DIAN (Semanas 8-12)

### 4.1 Configuración DIAN (Semana 8)
- [ ] **Registro en DIAN**
  - Obtener certificado digital de pruebas
  - Solicitar habilitación para facturación electrónica
  - Obtener rango de numeración de pruebas
  - Configurar ambiente de pruebas DIAN

- [ ] **Modelo de configuración**
  - Tabla `configuracion_dian`
  - Almacenar: certificado, rango numeración, ambiente

### 4.2 Generación XML UBL (Semanas 9-10)
- [ ] **Servicio de facturación**
  - Instalar lxml para generación XML
  - Implementar template XML UBL 2.1 según DIAN
  - Función generar_cufe() (SHA384)
  - Función generar_qr() (qrcode library)
  - Firma digital del XML (signxml)

- [ ] **Modelo FacturaElectronica**
  - Tabla `facturas_electronicas`
  - Relación con venta_id
  - Campos: numero_factura, cufe, qr_data, xml_content, estado_dian

### 4.3 Integración con DIAN (Semanas 11-12)
- [ ] **Cliente SOAP DIAN**
  - Instalar zeep
  - Implementar autenticación
  - Endpoint SendBillSync
  - Endpoint GetStatus
  - Manejo de respuestas DIAN

- [ ] **Flujo automático**
  - Al finalizar venta → verificar monto
  - Si >= 5 UVT: generar factura electrónica
  - Generar XML, CUFE, QR
  - Enviar a DIAN (async)
  - Generar PDF representación gráfica

**Valor agregado:** Cumplimiento legal 100% con DIAN para facturación electrónica.

## Prioridad 5: Seguridad y Protección de Datos (Semana 13)

### 5.1 Habeas Data (Ley 1581/2012)
- [ ] **Política de Tratamiento de Datos**
  - Redactar documento legal completo
  - Incluir: finalidad, derechos, procedimientos
  - Publicar en el sistema

- [ ] **Modelo Consentimiento**
  - Tabla `consentimientos_datos`
  - Registrar aceptación con fecha, IP, canal

- [ ] **Endpoints de derechos**
  - GET /api/v1/clientes/{id}/exportar-datos (derecho de acceso)
  - POST /api/v1/clientes/{id}/revocar-consentimiento
  - DELETE /api/v1/clientes/{id}/ejercer-olvido (derecho de supresión)

### 5.2 Auditoría Completa
- [ ] **Sistema de auditoría**
  - Modelo `auditoria`
  - Decorator @audit() para acciones críticas
  - Registrar: usuario, acción, datos_antes, datos_despues, IP, timestamp

- [ ] **Página auditoria.html**
  - Listado de logs de auditoría
  - Filtros: usuario, fecha, acción
  - Solo accesible para super_admin

**Valor agregado:** Cumplimiento legal Ley 1581 + trazabilidad completa.

## Prioridad 6: Backups y Mantenimiento (Semana 14)

### 6.1 Backups Automáticos
- [ ] **Script de backup**
  - `scripts/backup_automatico.py`
  - Copia de aej_sistema.db
  - Compresión gzip
  - Calcular checksum MD5
  - Limpiar backups antiguos (retención 7/4/12)

- [ ] **Programación automática**
  - Windows Task Scheduler (diario a las 2:00 AM)
  - Script PowerShell para crear tarea

- [ ] **Restauración**
  - `scripts/restaurar_backup.py`
  - Listar backups disponibles
  - Verificar integridad (checksum)
  - Restaurar con confirmación

### 6.2 UI de Backups
- [ ] **Página configuracion.html**
  - Sección "Backups"
  - Botón "Crear Backup Manual"
  - Lista de backups disponibles
  - Botón "Descargar" por backup
  - Botón "Restaurar" con confirmación

**Valor agregado:** Seguridad de datos + tranquilidad del usuario.

## Prioridad 7: Optimizaciones y Pulido (Semanas 15-16)

### 7.1 Performance
- [ ] Agregar índices en BD (documento clientes, sku productos, fecha ventas)
- [ ] Implementar paginación en todas las tablas
- [ ] Lazy loading de imágenes
- [ ] Comprimir CSS/JS (minificación)
- [ ] Caché de categorías/marcas/proveedores

### 7.2 UX Mejorado
- [ ] Toasts para notificaciones (éxito, error, info)
- [ ] Confirmaciones modales para acciones destructivas
- [ ] Loading states en todos los botones
- [ ] Validación en tiempo real en formularios
- [ ] Shortcuts de teclado documentados

### 7.3 Responsive
- [ ] Verificar todas las páginas en mobile
- [ ] Menú hamburguesa en mobile
- [ ] Tablas scrolleables horizontalmente
- [ ] Touch-friendly buttons

**Valor agregado:** Experiencia de usuario pulida y profesional.

## Prioridad 8: Testing Completo (Semana 17)

### 8.1 Tests Backend
- [ ] Tests unitarios para todos los servicios (>80% cobertura)
- [ ] Tests de integración para todos los endpoints
- [ ] Tests E2E de flujos críticos (crear venta, generar factura)

### 8.2 Tests Manuales
- [ ] Checklist de funcionalidades
- [ ] Tests en navegadores (Chrome, Firefox, Edge)
- [ ] Tests responsive (mobile, tablet, desktop)
- [ ] Tests de carga (simular 10 usuarios concurrentes)

**Valor agregado:** Calidad asegurada y confiabilidad del sistema.

## Prioridad 9: Documentación (Semana 18)

### 9.1 Manual de Usuario
- [ ] Guía de instalación
- [ ] Cómo hacer una venta paso a paso
- [ ] Cómo gestionar productos
- [ ] Cómo gestionar clientes
- [ ] Cómo ver reportes
- [ ] FAQs

### 9.2 Documentación Técnica
- [ ] README.md completo
- [ ] Diagramas de arquitectura
- [ ] Diagrama ER de base de datos
- [ ] Documentación API (ya generada con FastAPI)

**Valor agregado:** Usuarios pueden usar el sistema sin soporte constante.

## Prioridad 10: Despliegue y Producción (Semana 19-20)

### 10.1 Preparación para Producción
- [ ] Configurar .env de producción
- [ ] SECRET_KEY fuerte generada
- [ ] Certificado DIAN de producción
- [ ] Rangos de numeración de producción
- [ ] Desactivar CORS abierto

### 10.2 Instalador
- [ ] Crear ejecutable con PyInstaller
- [ ] Incluir Python embebido
- [ ] Script de instalación automático
- [ ] Crear acceso directo en escritorio
- [ ] Documentar instalación

### 10.3 Capacitación
- [ ] Capacitar a usuarios en uso del sistema
- [ ] Entregar manual de usuario impreso
- [ ] Dejar contacto de soporte

**Valor agregado:** Sistema listo para uso en producción.

---

## 📊 ROADMAP VISUAL SUGERIDO

```
Mes 1: Core POS
├── Semana 1: Productos ✓
├── Semana 2: Clientes ✓
├── Semana 3-4: Ventas (POS) ✓

Mes 2: Reportes e Inventario
├── Semana 5: Dashboard + Reportes Básicos ✓
├── Semana 6-7: Gestión de Inventario ✓
├── Semana 8: Configuración DIAN ✓

Mes 3: Facturación Electrónica
├── Semana 9-10: Generación XML UBL ✓
├── Semana 11-12: Integración con DIAN ✓

Mes 4: Seguridad y Pulido
├── Semana 13: Habeas Data + Auditoría ✓
├── Semana 14: Backups Automáticos ✓
├── Semana 15-16: Optimizaciones y UX ✓

Mes 5: Calidad
├── Semana 17: Testing Completo ✓
├── Semana 18: Documentación ✓

Mes 6: Producción
├── Semana 19-20: Despliegue y Capacitación ✓
```

---

## 🎯 ENTREGABLES POR FASE

### Fase 1 (Mes 1): Sistema POS Básico Funcional
**Entregable:** Aplicación que permite crear productos, clientes y procesar ventas.
**Demo:** Hacer una venta completa desde buscar producto hasta procesar pago.

### Fase 2 (Mes 2): Gestión e Inventario
**Entregable:** Dashboard con métricas, reportes básicos, control de stock.
**Demo:** Ver ventas del día, productos con stock bajo, ajustar inventario.

### Fase 3 (Mes 3): Facturación Electrónica
**Entregable:** Generación automática de facturas electrónicas válidas ante DIAN.
**Demo:** Hacer una venta y generar factura electrónica con CUFE y QR.

### Fase 4 (Mes 4): Seguridad y Profesionalización
**Entregable:** Sistema con cumplimiento legal, backups automáticos, auditoría.
**Demo:** Mostrar política de datos, logs de auditoría, restaurar backup.

### Fase 5 (Mes 5): Calidad Asegurada
**Entregable:** Sistema completamente testado y documentado.
**Demo:** Ejecutar suite de tests (100% passing), mostrar manual de usuario.

### Fase 6 (Mes 6): Listo para Producción
**Entregable:** Sistema instalado en producción, usuarios capacitados.
**Demo:** Sistema funcionando en ambiente real con ventas reales.

---

## 💡 TIPS DE DESARROLLO PROGRESIVO

### 1. Iteraciones Cortas
- Trabajar en ciclos de 1 semana
- Al final de cada semana, tener algo funcional para mostrar
- No intentar hacer todo perfecto de una vez

### 2. MVP Primero
- Priorizar funcionalidad core sobre features avanzados
- Ejemplo: implementar búsqueda simple antes que búsqueda avanzada con filtros
- Ejemplo: ticket simple antes que factura electrónica

### 3. Testing Continuo
- Escribir tests a medida que desarrollas, no al final
- Ejecutar tests antes de cada commit
- Mantener cobertura >80%

### 4. Feedback Temprano
- Mostrar prototipos a usuarios desde semana 1
- Ajustar según feedback real
- Validar flujos de trabajo con usuarios reales

### 5. Documentar Mientras Desarrollas
- Escribir README al crear cada módulo
- Documentar decisiones importantes (ADRs)
- Comentar código complejo inmediatamente

### 6. Commits Pequeños y Frecuentes
- Hacer commit después de cada feature pequeña
- Mensajes descriptivos (ej: "feat: agregar búsqueda de productos por código de barras")
- Usar convención de commits (feat, fix, docs, refactor, test)

---

# 📋 LISTA COMPLETA DE FUNCIONALIDADES (395 FUNCIONES)

## Clasificación: MVP vs PROGRESIVO

### ✅ FUNCIONALIDADES MVP (MÍNIMO PRODUCTO VIABLE) - 65 funciones

Estas son las funcionalidades ESENCIALES para tener un sistema POS operativo.

#### 1. AUTENTICACIÓN Y USUARIOS - 8 MVP
- [x] Login con usuario y contraseña
- [x] Logout
- [x] Cambio de contraseña
- [x] Roles básicos (admin, cajero)
- [x] Permisos por rol
- [ ] Recuperación de contraseña
- [ ] Sesión con expiración automática
- [ ] Auditoría de accesos

#### 2. PRODUCTOS - 12 MVP
- [ ] Crear productos
- [ ] Editar productos
- [ ] Eliminar productos (soft delete)
- [ ] Código de barras
- [ ] Código interno/SKU
- [ ] Precio de venta
- [ ] Precio de compra
- [ ] Control de stock
- [ ] Categorías de productos
- [ ] Marcas
- [ ] Imágenes de productos
- [ ] Búsqueda de productos

#### 3. INVENTARIO BÁSICO - 8 MVP
- [ ] **Saldos iniciales de inventario** ⭐ NUEVA
  - [ ] Ingresar saldos iniciales por producto
  - [ ] Fecha de saldos iniciales
  - [ ] Cantidad inicial
  - [ ] Costo unitario inicial
  - [ ] Costo total calculado automáticamente
  - [ ] Relacionar con proveedor (opcional)
  - [ ] Observaciones del movimiento
  - [ ] Ingresar saldos por Excel (carga masiva)
  - [ ] Valor total del inventario inicial
- [ ] Ajustes de inventario (entrada/salida)
- [ ] Consulta de existencias
- [ ] Alertas de stock bajo
- [ ] Movimientos de inventario (kardex básico)
- [ ] Transferencias entre bodegas (si aplica)
- [ ] Inventario en tiempo real

#### 4. CLIENTES - 5 MVP
- [ ] Registro de clientes
- [ ] Datos básicos (nombre, documento, teléfono, email)
- [ ] **Consentimiento tratamiento de datos (Ley 1581)** ⚠️ LEGAL
- [ ] Historial de compras
- [ ] Búsqueda de clientes

#### 5. PUNTO DE VENTA (POS) - 15 MVP
- [ ] Búsqueda rápida de productos
- [ ] Búsqueda por código de barras
- [ ] Agregar productos al carrito
- [ ] Editar cantidad
- [ ] Eliminar items del carrito
- [ ] Cálculo automático de subtotal, IVA, total
- [ ] Descuento por monto fijo
- [ ] Descuento por porcentaje
- [ ] Venta con cliente (opcional)
- [ ] Venta sin cliente (venta rápida)
- [ ] Pago en efectivo
- [ ] Pago con tarjeta
- [ ] Cálculo de cambio
- [ ] Apertura de caja
- [ ] Cierre de caja

#### 6. FACTURACIÓN - 5 MVP
- [ ] Emisión de tiquete de venta (simple)
- [ ] Reimpresión de factura
- [ ] Número consecutivo de factura
- [ ] Anulación de ventas
- [ ] Devoluciones totales

#### 7. COMPRAS BÁSICAS - 5 MVP
- [ ] Registro de proveedores
- [ ] Registro de facturas de compra
- [ ] Entrada de mercancía
- [ ] Actualización automática de inventario
- [ ] Historial de compras

#### 8. REPORTES BÁSICOS - 7 MVP
- [ ] Reporte de ventas del día
- [ ] Reporte de ventas por período
- [ ] Productos más vendidos
- [ ] Existencias actuales
- [ ] Cierre de caja
- [ ] Utilidad bruta
- [ ] Cartera por cobrar

**TOTAL MVP: 65 funciones** - Estas son las que desarrollaremos primero.

---

### 🚀 FUNCIONALIDADES PROGRESIVAS (POST-MVP) - 330 funciones

Estas se implementarán después del MVP, organizadas por prioridad.

## PRIORIDAD ALTA (90 funciones)

### 1. PUNTO DE VENTA AVANZADO - 20 funciones
- [ ] Facturación electrónica DIAN (>= 5 UVT)
- [ ] Emisión de documentos equivalentes POS (< 5 UVT)
- [ ] Facturas de contingencia
- [ ] Control de descuadres de caja
- [ ] Turnos múltiples
- [ ] Devoluciones parciales
- [ ] Cambios de productos
- [ ] Búsqueda por categoría
- [ ] Productos favoritos
- [ ] Vista de cuadrícula de productos
- [ ] Vista de lista de productos
- [ ] Calculadora integrada
- [ ] Teclado numérico en pantalla
- [ ] Pre-cuenta
- [ ] Suspender venta
- [ ] Recuperar ventas suspendidas
- [ ] Edición de precios (con permiso)
- [ ] Impresión en impresora térmica
- [ ] Envío de factura por email
- [ ] Envío de factura por WhatsApp

### 2. VENTAS AVANZADAS - 20 funciones
- [ ] Venta a domicilio
- [ ] Reservas de productos
- [ ] Apartados con abono
- [ ] Ventas al por mayor
- [ ] Múltiples listas de precios
- [ ] Precio mayorista/detal
- [ ] Descuentos por volumen
- [ ] Descuentos por combo
- [ ] Cupones de descuento
- [ ] Códigos promocionales
- [ ] Cotizaciones
- [ ] Conversión de cotización a factura
- [ ] Venta a crédito
- [ ] Pagos mixtos
- [ ] PSE
- [ ] Nequi
- [ ] Daviplata
- [ ] Pagos parciales
- [ ] Abonos a cuenta
- [ ] Anticipos de clientes

### 3. INVENTARIO AVANZADO - 25 funciones
- [ ] Productos compuestos (kits)
- [ ] Productos con variantes (talla, color)
- [ ] Conversión de unidades
- [ ] Productos pesables
- [ ] Productos por fracción
- [ ] Exportación de productos a Excel
- [ ] Productos con múltiples imágenes
- [ ] Subcategorías ilimitadas
- [ ] Líneas de producto
- [ ] Etiquetas personalizadas
- [ ] Productos destacados
- [ ] Productos en promoción
- [ ] Inventario por ubicación física
- [ ] Costo promedio ponderado
- [ ] Costo PEPS
- [ ] Control de lotes
- [ ] Fecha de vencimiento
- [ ] Registro sanitario INVIMA
- [ ] Alertas de productos próximos a vencer
- [ ] Trazabilidad de lotes
- [ ] Stock de seguridad
- [ ] Punto de reorden automático
- [ ] Cantidad económica de pedido
- [ ] Toma física de inventario
- [ ] Diferencias de inventario

### 4. COMPRAS Y PROVEEDORES - 15 funciones
- [ ] Evaluación de proveedores
- [ ] Clasificación de proveedores
- [ ] Órdenes de compra
- [ ] Aprobación de órdenes
- [ ] Envío de orden por email
- [ ] Seguimiento de órdenes
- [ ] Recepción parcial de mercancía
- [ ] Control de calidad en recepción
- [ ] Documento soporte de adquisición
- [ ] Compras a crédito
- [ ] Devoluciones a proveedor
- [ ] Notas crédito de proveedor
- [ ] Historial de precios
- [ ] Comparación de precios entre proveedores
- [ ] Rentabilidad por producto

### 5. CLIENTES AVANZADO - 10 funciones
- [ ] Múltiples direcciones por cliente
- [ ] Segmentación por categoría
- [ ] Clientes VIP
- [ ] Productos preferidos
- [ ] Ticket promedio por cliente
- [ ] Lifetime value
- [ ] Sistema de puntos
- [ ] Canje de puntos por descuentos
- [ ] Cupones personalizados
- [ ] Promociones exclusivas

## PRIORIDAD MEDIA (120 funciones)

### 6. ALERTAS Y NOTIFICACIONES - 35 funciones
- [ ] Productos con stock bajo
- [ ] Productos sin stock
- [ ] Productos próximos a vencer (30, 15, 7 días)
- [ ] Productos vencidos
- [ ] Productos sin movimiento
- [ ] Productos con exceso de inventario
- [ ] Diferencias de inventario detectadas
- [ ] Transferencias pendientes
- [ ] Meta de ventas alcanzada
- [ ] Meta de ventas no alcanzada
- [ ] Venta pendiente de pago
- [ ] Cliente con pagos vencidos
- [ ] Descuadre de caja
- [ ] Devolución registrada
- [ ] Venta anulada
- [ ] Descuento mayor al permitido
- [ ] Caja sin cerrar
- [ ] Exceso de efectivo en caja
- [ ] Faltante en arqueo
- [ ] Sobrante en arqueo
- [ ] Base de caja insuficiente
- [ ] Facturas sin enviar a DIAN
- [ ] Facturas rechazadas por DIAN
- [ ] Cuadre contable pendiente
- [ ] Impuestos por declarar
- [ ] Cierre contable mensual
- [ ] Notificaciones en pantalla
- [ ] Notificaciones por email
- [ ] Notificaciones por SMS
- [ ] Notificaciones por WhatsApp
- [ ] Panel de alertas en dashboard
- [ ] Reportes automáticos programados
- [ ] Configurar umbrales personalizados
- [ ] Programar horarios de notificación
- [ ] Historial de alertas

### 7. CONTABILIDAD - 50 funciones
- [ ] Asientos contables automáticos por venta
- [ ] Asientos contables automáticos por compra
- [ ] Asientos por gastos
- [ ] Asientos por ingresos
- [ ] Asientos de apertura
- [ ] Asientos de cierre
- [ ] Asientos de ajuste
- [ ] Comprobantes de egreso
- [ ] Comprobantes de ingreso
- [ ] Notas de contabilidad
- [ ] Plan único de cuentas (PUC) Colombia
- [ ] Cuentas de activos
- [ ] Cuentas de pasivos
- [ ] Cuentas de patrimonio
- [ ] Cuentas de ingresos
- [ ] Cuentas de gastos
- [ ] Cuentas de costos
- [ ] Subcuentas auxiliares
- [ ] Centros de costos
- [ ] Terceros (clientes/proveedores)
- [ ] Libro diario
- [ ] Libro mayor
- [ ] Balance de prueba
- [ ] Balance general
- [ ] Estado de resultados
- [ ] Flujo de caja
- [ ] Estado de cambios en el patrimonio
- [ ] Cálculo automático de IVA
- [ ] Retención en la fuente
- [ ] Retención de IVA
- [ ] Retención de ICA
- [ ] ICA (Impuesto Industria y Comercio)
- [ ] Autorretención
- [ ] Impuesto al consumo
- [ ] Declaración de IVA bimestral
- [ ] Declaración de renta
- [ ] Información exógena
- [ ] Facturas por cobrar
- [ ] Abonos a facturas
- [ ] Antigüedad de cartera
- [ ] Cartera vencida
- [ ] Recordatorios de pago
- [ ] Estados de cuenta por cliente
- [ ] Intereses por mora
- [ ] Facturas de proveedores por pagar
- [ ] Pagos a proveedores
- [ ] Programación de pagos
- [ ] Registro de gastos operacionales
- [ ] Costo de mercancía vendida
- [ ] Conciliación bancaria

### 8. REPORTES AVANZADOS - 35 funciones
- [ ] Ventas por vendedor/cajero
- [ ] Ventas por sucursal
- [ ] Ventas por hora del día
- [ ] Comparativo de ventas (período vs período)
- [ ] Tendencias de ventas
- [ ] Productos menos vendidos
- [ ] Número de transacciones
- [ ] Unidades vendidas
- [ ] Descuentos otorgados
- [ ] Existencias por bodega
- [ ] Productos sobre stock máximo
- [ ] Rotación de inventario
- [ ] Inventario físico vs sistema
- [ ] Análisis ABC de productos
- [ ] Productos de alta rotación
- [ ] Productos de baja rotación
- [ ] Consolidado de cajas
- [ ] Ingresos vs egresos
- [ ] Retiros de caja
- [ ] Depósitos bancarios
- [ ] Análisis de gastos
- [ ] Gastos por categoría
- [ ] Gastos vs presupuesto
- [ ] Impuestos causados
- [ ] Impuestos pagados
- [ ] Utilidad neta
- [ ] Punto de equilibrio
- [ ] ROI (retorno de inversión)
- [ ] Cartera por vencer
- [ ] Historial de pagos
- [ ] Clientes morosos
- [ ] Provisión de cartera
- [ ] Certificado de retención
- [ ] Reporte de facturación electrónica
- [ ] Documentos DIAN rechazados

## PRIORIDAD BAJA (120 funciones)

### 9. CONFIGURACIÓN AVANZADA - 40 funciones
- [ ] Datos fiscales completos
- [ ] Actividad económica (CIIU)
- [ ] Resolución de facturación DIAN
- [ ] Certificado digital
- [ ] Numeración de notas crédito
- [ ] Numeración de notas débito
- [ ] Plantilla de factura personalizada
- [ ] Términos y condiciones
- [ ] Información adicional en factura
- [ ] Tarifas de IVA configurables
- [ ] Productos excluidos de IVA
- [ ] Productos exentos de IVA
- [ ] Tarifas de retención
- [ ] Retención ICA
- [ ] Auto-retención
- [ ] Múltiples sucursales
- [ ] Datos por sucursal
- [ ] Bodegas por sucursal
- [ ] Cajas por sucursal
- [ ] Resolución DIAN por sucursal
- [ ] Permisos personalizados
- [ ] Acceso por módulos
- [ ] Horarios de acceso
- [ ] Auditoría de accesos
- [ ] Sesiones concurrentes
- [ ] Moneda local
- [ ] Zona horaria
- [ ] Formato de fecha
- [ ] Separador de decimales
- [ ] Número de decimales
- [ ] Año fiscal
- [ ] Período contable
- [ ] Backup automático
- [ ] Frecuencia de backup
- [ ] Restauración de backups
- [ ] Logo personalizado por sucursal
- [ ] Impresoras por caja
- [ ] Gaveta de dinero
- [ ] Lector de código de barras
- [ ] Pantalla de cliente (display)

### 10. MÓDULO CORRESPONSAL BANCOLOMBIA - 20 funciones
- [ ] Consignaciones nacionales
- [ ] Retiros sin tarjeta
- [ ] Pago de servicios públicos
- [ ] Recargas de celular
- [ ] Recargas de transporte
- [ ] Pago de créditos Bancolombia
- [ ] Giros nacionales
- [ ] Pagos a terceros
- [ ] Consulta de saldos
- [ ] Registro de transacciones
- [ ] Comisión por transacción
- [ ] Cierre diario de corresponsalía
- [ ] Cuadre de corresponsalía
- [ ] Reporte de comisiones ganadas
- [ ] Diferencias en cuadre
- [ ] Efectivo de corresponsalía separado
- [ ] Límites de transacción
- [ ] Validación de identidad
- [ ] Comprobantes de transacción
- [ ] Histórico de transacciones

### 11. FUNCIONALIDADES ESPECIALES - 30 funciones
- [ ] Venta sin conexión (modo offline)
- [ ] Sincronización automática
- [ ] Apertura de gaveta de dinero
- [ ] Impresión en impresora láser
- [ ] Envío de factura por SMS
- [ ] Compartir factura (link)
- [ ] Consulta rápida de precios
- [ ] Venta para recoger (pickup)
- [ ] Venta por teléfono
- [ ] Venta por WhatsApp
- [ ] Ventas por consignación
- [ ] Happy hour / descuentos por horario
- [ ] Cotizaciones con imágenes
- [ ] Cotizaciones con videos
- [ ] Seguimiento de cotizaciones
- [ ] Pagos con Wompi
- [ ] Pagos con Efecty
- [ ] Pagos con giros
- [ ] Pagos con cheques
- [ ] Corresponsal Bancolombia QR
- [ ] Propinas
- [ ] Redondeo de valores
- [ ] Productos con instructivo de uso
- [ ] Productos de temporada
- [ ] Valor del inventario por bodega
- [ ] Notas a los estados financieros
- [ ] Extractos bancarios
- [ ] Movimientos bancarios pendientes
- [ ] Múltiples cuentas bancarias
- [ ] Análisis de rentabilidad por producto

### 12. FUNCIONALIDADES EXTRAS - 30 funciones
- [ ] App móvil para ventas
- [ ] App móvil para inventario
- [ ] Integración con e-commerce
- [ ] Catálogo web de productos
- [ ] Pedidos online
- [ ] Multi-tienda (varias tiendas)
- [ ] Dashboard ejecutivo
- [ ] Gráficos interactivos
- [ ] Predicción de ventas (ML)
- [ ] Recomendación de productos
- [ ] Integración con redes sociales
- [ ] Marketing por email
- [ ] Marketing por SMS
- [ ] Campañas promocionales
- [ ] Encuestas de satisfacción
- [ ] Programa de referidos
- [ ] Cashback
- [ ] Factura recurrente
- [ ] Suscripciones
- [ ] Reservas con calendario
- [ ] Citas y agendamiento
- [ ] Servicio técnico
- [ ] Órdenes de servicio
- [ ] Garantías
- [ ] Devoluciones con RMA
- [ ] Integración con proveedores (API)
- [ ] Dropshipping
- [ ] Marketplace
- [ ] Multi-idioma
- [ ] Multi-moneda

---

## 📊 RESUMEN DE FUNCIONALIDADES

| CATEGORÍA | MVP | PROGRESIVO | TOTAL |
|-----------|-----|------------|-------|
| Autenticación y Usuarios | 8 | 12 | 20 |
| Productos | 12 | 18 | 30 |
| Inventario | 8 | 47 | 55 |
| Clientes | 5 | 20 | 25 |
| Punto de Venta (POS) | 15 | 20 | 35 |
| Ventas | 0 | 45 | 45 |
| Facturación | 5 | 15 | 20 |
| Compras y Proveedores | 5 | 25 | 30 |
| Alertas y Notificaciones | 0 | 35 | 35 |
| Contabilidad | 0 | 50 | 50 |
| Reportes | 7 | 53 | 60 |
| Configuración | 0 | 40 | 40 |
| Corresponsal Bancolombia | 0 | 20 | 20 |
| Funcionalidades Especiales | 0 | 30 | 30 |
| **TOTAL** | **65** | **330** | **395** |

---

## 🎯 ESTRATEGIA DE DESARROLLO

### FASE 1: MVP (2-3 meses) - 65 funciones
**Objetivo:** Sistema POS básico y funcional para comenzar a operar.

**Entregables:**
- Login y gestión de usuarios
- CRUD de productos con categorías y marcas
- **Saldos iniciales de inventario** ⭐
- Registro de clientes con Habeas Data
- Punto de venta funcional
- Tiquetes de venta
- Registro de compras
- Reportes básicos

**Criterio de éxito:** Poder hacer una venta completa, desde buscar producto hasta cobrar y emitir tiquete.

### FASE 2: Prioridad Alta (2-3 meses) - 90 funciones
**Objetivo:** Facturación electrónica DIAN + funcionalidades avanzadas de venta.

**Entregables:**
- Facturación electrónica DIAN
- Ventas avanzadas (cotizaciones, apartados, crédito)
- Inventario avanzado (lotes, vencimientos, variantes)
- Compras y proveedores completo
- Clientes con fidelización

### FASE 3: Prioridad Media (3-4 meses) - 120 funciones
**Objetivo:** Contabilidad completa y reportería avanzada.

**Entregables:**
- Sistema de alertas y notificaciones
- Contabilidad completa con PUC
- Reportes avanzados y analytics
- Cartera y cuentas por cobrar/pagar

### FASE 4: Prioridad Baja (2-3 meses) - 120 funciones
**Objetivo:** Funcionalidades especiales y diferenciadores.

**Entregables:**
- Configuración avanzada
- Módulo Corresponsal Bancolombia
- Funcionalidades especiales (offline, múltiples métodos pago)
- Extras (app móvil, e-commerce, ML)

---

## ✅ VALIDACIÓN DE LA LISTA

### ¿Está completa la lista?

**SÍ, la lista está muy completa.** Cubre:

✅ Todo el ciclo de vida de un POS
✅ Cumplimiento legal colombiano (DIAN, Habeas Data)
✅ Funcionalidades básicas y avanzadas
✅ Integración con servicios colombianos
✅ Escalabilidad (desde pequeño negocio hasta multi-tienda)

### Sugerencias de Mejora:

#### 1. **Agregar módulo de PRODUCCIÓN** (para negocios que fabrican)
- [ ] Fórmulas de producción
- [ ] Consumo de materia prima
- [ ] Órdenes de producción
- [ ] Costo de producción
- [ ] Control de calidad de producción

#### 2. **Agregar módulo de EMPLEADOS Y NÓMINA** (opcional)
- [ ] Registro de empleados
- [ ] Asistencia y turnos
- [ ] Cálculo de nómina
- [ ] Liquidación de prestaciones
- [ ] Pagos de seguridad social

#### 3. **Mejorar TRAZABILIDAD** (importante para alimentos/cosméticos)
- [ ] Trazabilidad hacia atrás (proveedores)
- [ ] Trazabilidad hacia adelante (clientes)
- [ ] Recall de productos
- [ ] Alertas sanitarias

#### 4. **Agregar ACTIVOS FIJOS** (para contabilidad completa)
- [ ] Registro de activos fijos
- [ ] Depreciación automática
- [ ] Mantenimientos de activos

### Recomendación Final:

**La lista está excelente y completa para un POS profesional.**

Mi sugerencia es:
1. ✅ **Iniciar con el MVP (65 funciones)** - 2-3 meses
2. ✅ **Evaluar con usuarios reales**
3. ✅ **Priorizar Fase 2 según feedback**
4. ✅ **Continuar progresivamente**

---

**¿Comenzamos a desarrollar el MVP?**

Si estás de acuerdo, empezamos con:
1. **Saldos iniciales de inventario** (que es lo nuevo que agregaste)
2. **Gestión de productos completa**
3. **Punto de venta básico**

¿Procedemos?

---

**FIN DEL ROADMAP**

Este roadmap está diseñado para transformar el Sistema POS AEJ en una solución profesional, legal y escalable. Cada tarea tiene un propósito claro y contribuye al objetivo final de un sistema de clase empresarial.

**Desarrollado por:** Jairo Colina
**Fecha:** Noviembre 2025
**Versión:** 2.0 (con lista completa de 395 funcionalidades organizadas)
**Próxima Revisión:** Al completar MVP (65 funciones)
