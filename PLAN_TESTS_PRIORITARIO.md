# Plan de Tests Críticos y Urgentes - AEJ Sistema POS

## 🔴 PRIORIDAD CRÍTICA (Hacer primero)

### Backend - Tests Unitarios

#### 1. **Tests de Autenticación (`auth.py`)** ⭐⭐⭐⭐⭐
**Archivo**: `backend/tests/unit/test_auth.py`
**Razón**: La seguridad del sistema depende de esto
**Tests**:
- `test_hash_password_creates_different_hash_each_time()`
- `test_verify_password_correct_password_returns_true()`
- `test_verify_password_wrong_password_returns_false()`
- `test_create_access_token_generates_valid_token()`
- `test_create_access_token_with_expiration()`
- `test_decode_token_valid_token_returns_username()`
- `test_decode_token_expired_token_returns_none()`
- `test_decode_token_invalid_token_returns_none()`
- `test_authenticate_user_valid_credentials()`
- `test_authenticate_user_invalid_username()`
- `test_authenticate_user_invalid_password()`
- `test_get_current_user_valid_token()`
- `test_get_current_user_invalid_token_raises_401()`

**Tiempo estimado**: 1-2 horas
**Impacto**: ⭐⭐⭐⭐⭐ (Sin esto, cualquier fallo de auth es invisible)

---

#### 2. **Tests de Invoice Processor (`invoice_processor.py`)** ⭐⭐⭐⭐⭐
**Archivo**: `backend/tests/unit/test_invoice_processor.py`
**Razón**: Lógica crítica de negocio, acabamos de modificarla
**Tests**:
- `test_find_or_create_supplier_creates_new_supplier()`
- `test_find_or_create_supplier_finds_existing_by_nit()`
- `test_find_or_create_supplier_updates_existing_data()`
- `test_find_or_create_supplier_reactivates_inactive()`
- `test_find_or_create_supplier_requires_nit()`
- `test_find_or_create_product_creates_new_product()`
- `test_find_or_create_product_finds_by_codigo()`
- `test_find_or_create_product_finds_by_exact_name()`
- `test_find_or_create_product_finds_by_similar_name()`
- `test_find_or_create_product_updates_price_when_changed()`
- `test_find_or_create_product_keeps_custom_margin()`
- `test_find_or_create_product_updates_missing_codigo()`
- `test_update_inventory_increases_stock()`
- `test_update_inventory_creates_movement_record()`
- `test_process_invoice_rejects_duplicate_invoice_number()`
- `test_process_invoice_creates_invoice_with_items()`
- `test_process_invoice_updates_all_product_stocks()`
- `test_process_invoice_rollback_on_error()`

**Tiempo estimado**: 2-3 horas
**Impacto**: ⭐⭐⭐⭐⭐ (Maneja todo el flujo de compras)

---

#### 3. **Tests de Endpoints de Ventas (`main.py` - sales endpoints)** ⭐⭐⭐⭐
**Archivo**: `backend/tests/unit/test_sales_endpoints.py`
**Razón**: El POS es el corazón del negocio
**Tests**:
- `test_create_sale_success()`
- `test_create_sale_decreases_inventory()`
- `test_create_sale_creates_inventory_movement()`
- `test_create_sale_insufficient_stock_raises_400()`
- `test_create_sale_invalid_product_raises_404()`
- `test_create_sale_calculates_totals_correctly()`
- `test_create_sale_requires_authentication()`
- `test_get_sales_returns_list()`
- `test_get_sales_pagination_works()`

**Tiempo estimado**: 1-2 horas
**Impacto**: ⭐⭐⭐⭐⭐ (Ventas = ingresos)

---

#### 4. **Tests de Modelos Principales (`models.py`)** ⭐⭐⭐⭐
**Archivo**: `backend/tests/unit/test_models.py`
**Razón**: Base de toda la aplicación
**Tests**:
- `test_user_model_creation()`
- `test_user_model_relationships()`
- `test_product_model_creation()`
- `test_product_model_stock_validation()`
- `test_supplier_model_creation()`
- `test_purchase_invoice_model_creation()`
- `test_purchase_invoice_items_relationship()`
- `test_sale_model_creation()`
- `test_sale_items_relationship()`
- `test_inventory_movement_model_creation()`

**Tiempo estimado**: 1-2 horas
**Impacto**: ⭐⭐⭐⭐ (Todo depende de los modelos)

---

### Backend - Tests de Integración

#### 5. **Test de Flujo Completo de Venta** ⭐⭐⭐⭐
**Archivo**: `backend/tests/integration/test_sales_flow.py`
**Razón**: Verifica que todo el proceso funciona junto
**Tests**:
- `test_complete_sale_workflow()`
  - Crear cliente
  - Crear productos con stock
  - Crear venta
  - Verificar stock decrementado
  - Verificar movimiento de inventario
  - Verificar venta registrada

**Tiempo estimado**: 1 hora
**Impacto**: ⭐⭐⭐⭐⭐ (Test más importante del sistema)

---

#### 6. **Test de Flujo Completo de Factura de Compra** ⭐⭐⭐⭐
**Archivo**: `backend/tests/integration/test_purchase_invoice_flow.py`
**Razón**: Acabamos de implementar esta funcionalidad
**Tests**:
- `test_complete_purchase_invoice_workflow()`
  - Procesar factura con proveedor nuevo
  - Verificar proveedor creado
  - Verificar productos creados
  - Verificar stock incrementado
  - Verificar movimientos de inventario
- `test_purchase_invoice_with_existing_products()`
  - Procesar factura con productos existentes
  - Verificar stock se SUMA (no reemplaza)
  - Verificar precios actualizados

**Tiempo estimado**: 1 hora
**Impacto**: ⭐⭐⭐⭐⭐ (Nueva funcionalidad crítica)

---

### Frontend - Tests de Componentes

#### 7. **Tests de Login Component** ⭐⭐⭐⭐⭐
**Archivo**: `src/pages/__tests__/Login.test.tsx`
**Razón**: Puerta de entrada al sistema
**Tests**:
- `test_renders_login_form()`
- `test_shows_error_on_invalid_credentials()`
- `test_successful_login_redirects_to_dashboard()`
- `test_form_validation_works()`
- `test_shows_loading_state_during_login()`

**Tiempo estimado**: 1 hora
**Impacto**: ⭐⭐⭐⭐⭐ (Sin login, no hay acceso)

---

#### 8. **Tests de POS Component** ⭐⭐⭐⭐⭐
**Archivo**: `src/pages/__tests__/POS.test.tsx`
**Razón**: Componente más usado del sistema
**Tests**:
- `test_renders_pos_interface()`
- `test_add_product_to_cart()`
- `test_remove_product_from_cart()`
- `test_update_product_quantity_in_cart()`
- `test_calculates_subtotal_correctly()`
- `test_calculates_taxes_correctly()`
- `test_calculates_total_correctly()`
- `test_requires_client_selection_before_sale()`
- `test_shows_error_when_insufficient_stock()`
- `test_clears_cart_after_successful_sale()`
- `test_shows_success_message_after_sale()`

**Tiempo estimado**: 2-3 horas
**Impacto**: ⭐⭐⭐⭐⭐ (El core del negocio)

---

#### 9. **Tests de PurchaseInvoices Component** ⭐⭐⭐⭐
**Archivo**: `src/pages/__tests__/PurchaseInvoices.test.tsx`
**Razón**: Nueva funcionalidad que acabamos de implementar
**Tests**:
- `test_renders_invoice_form()`
- `test_file_upload_works()`
- `test_supplier_autocomplete_by_nit()`
- `test_add_product_to_invoice()`
- `test_remove_product_from_invoice()`
- `test_calculates_totals_correctly()`
- `test_validates_required_fields()`
- `test_shows_success_after_processing_invoice()`
- `test_shows_invoice_in_history_after_creation()`

**Tiempo estimado**: 2 horas
**Impacto**: ⭐⭐⭐⭐ (Funcionalidad crítica nueva)

---

## 🟡 PRIORIDAD URGENTE (Hacer después de críticos)

### Backend

#### 10. **Tests de Endpoints de Productos** ⭐⭐⭐
**Archivo**: `backend/tests/unit/test_products_endpoints.py`
**Tests**:
- `test_get_products_list()`
- `test_create_product_success()`
- `test_create_product_duplicate_code_fails()`
- `test_update_product_success()`
- `test_get_product_by_id()`
- `test_delete_product_not_allowed()` (si aplica)

**Tiempo estimado**: 1 hora
**Impacto**: ⭐⭐⭐

---

#### 11. **Tests de Schemas/Validaciones (`schemas.py`)** ⭐⭐⭐
**Archivo**: `backend/tests/unit/test_schemas.py`
**Tests**:
- `test_user_schema_validation()`
- `test_product_schema_validation()`
- `test_sale_schema_validation()`
- `test_invoice_data_extraction_schema()`
- `test_schema_rejects_invalid_email()`
- `test_schema_rejects_negative_prices()`

**Tiempo estimado**: 1 hora
**Impacto**: ⭐⭐⭐

---

#### 12. **Tests de Endpoints de Clientes** ⭐⭐⭐
**Archivo**: `backend/tests/unit/test_clients_endpoints.py`
**Tests**:
- `test_get_clients_list()`
- `test_create_client_success()`
- `test_create_client_duplicate_documento_fails()`
- `test_get_client_by_id()`
- `test_update_client_success()`

**Tiempo estimado**: 45 minutos
**Impacto**: ⭐⭐⭐

---

### Frontend

#### 13. **Tests de Products Component** ⭐⭐⭐
**Archivo**: `src/pages/__tests__/Products.test.tsx`
**Tests**:
- `test_renders_products_table()`
- `test_opens_create_product_dialog()`
- `test_creates_product_successfully()`
- `test_edits_product_successfully()`
- `test_search_filters_products()`

**Tiempo estimado**: 1.5 horas
**Impacto**: ⭐⭐⭐

---

#### 14. **Tests de Inventory Component** ⭐⭐⭐
**Archivo**: `src/pages/__tests__/Inventory.test.tsx`
**Tests**:
- `test_renders_inventory_table()`
- `test_shows_low_stock_alerts()`
- `test_shows_movement_history()`
- `test_filters_by_product()`
- `test_filters_by_date_range()`

**Tiempo estimado**: 1 hora
**Impacto**: ⭐⭐⭐

---

#### 15. **Tests de API Client (`lib/api.ts`)** ⭐⭐⭐
**Archivo**: `src/lib/__tests__/api.test.ts`
**Tests**:
- `test_products_api_list()`
- `test_products_api_create()`
- `test_sales_api_create()`
- `test_invoice_api_process()`
- `test_api_handles_401_errors()`
- `test_api_handles_network_errors()`

**Tiempo estimado**: 1 hora
**Impacto**: ⭐⭐⭐⭐

---

## 📊 Resumen de Prioridades

| # | Test | Tipo | Tiempo | Impacto | Prioridad |
|---|------|------|--------|---------|-----------|
| 1 | Auth | Unit BE | 1-2h | ⭐⭐⭐⭐⭐ | 🔴 CRÍTICO |
| 2 | Invoice Processor | Unit BE | 2-3h | ⭐⭐⭐⭐⭐ | 🔴 CRÍTICO |
| 3 | Sales Endpoints | Unit BE | 1-2h | ⭐⭐⭐⭐⭐ | 🔴 CRÍTICO |
| 4 | Models | Unit BE | 1-2h | ⭐⭐⭐⭐ | 🔴 CRÍTICO |
| 5 | Sales Flow | Integration BE | 1h | ⭐⭐⭐⭐⭐ | 🔴 CRÍTICO |
| 6 | Purchase Invoice Flow | Integration BE | 1h | ⭐⭐⭐⭐⭐ | 🔴 CRÍTICO |
| 7 | Login Component | Unit FE | 1h | ⭐⭐⭐⭐⭐ | 🔴 CRÍTICO |
| 8 | POS Component | Unit FE | 2-3h | ⭐⭐⭐⭐⭐ | 🔴 CRÍTICO |
| 9 | Purchase Invoices Component | Unit FE | 2h | ⭐⭐⭐⭐ | 🔴 CRÍTICO |
| 10 | Products Endpoints | Unit BE | 1h | ⭐⭐⭐ | 🟡 URGENTE |
| 11 | Schemas | Unit BE | 1h | ⭐⭐⭐ | 🟡 URGENTE |
| 12 | Clients Endpoints | Unit BE | 45m | ⭐⭐⭐ | 🟡 URGENTE |
| 13 | Products Component | Unit FE | 1.5h | ⭐⭐⭐ | 🟡 URGENTE |
| 14 | Inventory Component | Unit FE | 1h | ⭐⭐⭐ | 🟡 URGENTE |
| 15 | API Client | Unit FE | 1h | ⭐⭐⭐⭐ | 🟡 URGENTE |

---

## 🎯 Orden Sugerido de Implementación

### Sesión 1 (3-4 horas): Backend Crítico
1. Setup pytest + configuración
2. Tests de Auth (#1)
3. Tests de Invoice Processor (#2)

### Sesión 2 (2-3 horas): Backend Crítico cont.
4. Tests de Sales Endpoints (#3)
5. Tests de Models (#4)

### Sesión 3 (2 horas): Integración Backend
6. Test de Sales Flow (#5)
7. Test de Purchase Invoice Flow (#6)

### Sesión 4 (3-4 horas): Frontend Crítico
8. Setup Vitest + configuración
9. Tests de Login Component (#7)
10. Tests de POS Component (#8) - parte 1

### Sesión 5 (2-3 horas): Frontend Crítico cont.
11. Tests de POS Component (#8) - parte 2
12. Tests de Purchase Invoices Component (#9)

### Sesión 6 (3 horas): Backend Urgente
13. Tests de Products Endpoints (#10)
14. Tests de Schemas (#11)
15. Tests de Clients Endpoints (#12)

### Sesión 7 (3 horas): Frontend Urgente
16. Tests de API Client (#15)
17. Tests de Products Component (#13)
18. Tests de Inventory Component (#14)

---

## 📝 Notas

- **Total tiempo estimado críticos**: ~15-20 horas
- **Total tiempo estimado urgentes**: ~8-10 horas
- **Total general**: ~25-30 horas de trabajo efectivo

**Beneficios al completar todos**:
- ✅ Cobertura ~70-80% de código crítico
- ✅ Confianza para refactorizar
- ✅ Detección temprana de bugs
- ✅ CI/CD robusto
- ✅ Documentación viva del comportamiento esperado

---

**ESTADO**: ⏸️ Esperando aprobación para comenzar

**¿Por cuál quieres que empiece?**
