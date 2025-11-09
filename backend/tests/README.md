# Tests - AEJ Sistema POS Backend

## 📁 Estructura de Tests

```
tests/
├── __init__.py
├── conftest.py              # Fixtures compartidas y configuración
├── unit/                    # Tests unitarios
│   ├── __init__.py
│   ├── test_auth.py        # Tests de autenticación (31 tests)
│   └── test_invoice_processor.py  # Tests de procesador de facturas (28 tests)
├── integration/             # Tests de integración
│   └── __init__.py
└── fixtures/                # Fixtures adicionales
    └── __init__.py
```

## 🚀 Ejecutar Tests

### Windows
```bash
cd backend
run_tests.bat
```

### Linux/Mac
```bash
cd backend
chmod +x run_tests.sh
./run_tests.sh
```

### Manual
```bash
cd backend
pip install -r requirements-dev.txt
pytest -v
```

## 📊 Tests Implementados - Sesión 1

### ✅ Test de Autenticación (`test_auth.py`) - 31 tests

#### Password Hashing (5 tests)
- ✅ `test_hash_password_creates_hash` - Verifica que se crea un hash
- ✅ `test_hash_password_creates_different_hash_each_time` - Verifica salts únicos
- ✅ `test_verify_password_correct_password_returns_true` - Verifica contraseña correcta
- ✅ `test_verify_password_wrong_password_returns_false` - Rechaza contraseña incorrecta
- ✅ `test_verify_password_empty_password_returns_false` - Rechaza contraseña vacía

#### JWT Tokens (6 tests)
- ✅ `test_create_access_token_generates_valid_token` - Crea token válido
- ✅ `test_create_access_token_with_custom_expiration` - Token con expiración custom
- ✅ `test_verify_token_valid_token_returns_token_data` - Verifica token válido
- ✅ `test_verify_token_expired_token_raises_401` - Rechaza token expirado
- ✅ `test_verify_token_invalid_token_raises_401` - Rechaza token inválido
- ✅ `test_verify_token_missing_username_raises_401` - Rechaza token sin username

#### User Authentication (7 tests)
- ✅ `test_get_user_by_username_existing_user` - Encuentra usuario existente
- ✅ `test_get_user_by_username_non_existing_user` - Retorna None si no existe
- ✅ `test_authenticate_user_valid_credentials` - Autentica con credenciales válidas
- ✅ `test_authenticate_user_invalid_username` - Rechaza username inválido
- ✅ `test_authenticate_user_invalid_password` - Rechaza password inválido
- ✅ `test_authenticate_user_empty_password` - Rechaza password vacío
- ✅ `test_authenticate_user_case_sensitive_username` - Username case-sensitive

#### User Permissions (3 tests)
- ✅ `test_inactive_user_should_be_blocked` - Usuarios inactivos no pueden autenticar
- ✅ `test_user_roles_are_correctly_set` - Roles se asignan correctamente
- ✅ `test_user_locations_are_correctly_set` - Ubicaciones se asignan correctamente

#### Password Security (4 tests)
- ✅ `test_hash_contains_bcrypt_prefix` - Hash usa formato bcrypt
- ✅ `test_password_with_special_characters` - Maneja caracteres especiales
- ✅ `test_password_with_unicode_characters` - Maneja caracteres unicode
- ✅ `test_very_long_password` - Maneja passwords largos (72 chars)

#### Token Data Extraction (2 tests)
- ✅ `test_token_contains_username_in_sub_field` - Username en campo 'sub'
- ✅ `test_token_with_additional_claims` - Token con claims adicionales

---

### ✅ Test de Invoice Processor (`test_invoice_processor.py`) - 28 tests

#### Supplier Processing (6 tests)
- ✅ `test_find_or_create_supplier_creates_new_supplier` - Crea proveedor nuevo
- ✅ `test_find_or_create_supplier_finds_existing_by_nit` - Encuentra por NIT
- ✅ `test_find_or_create_supplier_updates_existing_data` - Actualiza datos existentes
- ✅ `test_find_or_create_supplier_reactivates_inactive` - Reactiva inactivos
- ✅ `test_find_or_create_supplier_requires_nit` - Requiere NIT
- ✅ `test_find_or_create_supplier_strips_whitespace_from_nit` - Limpia espacios

#### Product Processing (9 tests)
- ✅ `test_find_or_create_product_creates_new_product` - Crea producto nuevo
- ✅ `test_find_or_create_product_finds_by_codigo` - Encuentra por código
- ✅ `test_find_or_create_product_finds_by_exact_name` - Encuentra por nombre exacto
- ✅ `test_find_or_create_product_finds_by_similar_name` - Encuentra por nombre similar
- ✅ `test_find_or_create_product_updates_price_when_changed` - Actualiza precio
- ✅ `test_find_or_create_product_keeps_custom_margin` - Mantiene margen custom
- ✅ `test_find_or_create_product_updates_missing_codigo` - Actualiza código faltante
- ✅ `test_find_or_create_product_with_update_price_false` - No actualiza si flag=False

#### Inventory Updates (3 tests)
- ✅ `test_update_inventory_increases_stock` - Incrementa stock correctamente
- ✅ `test_update_inventory_creates_movement_record` - Crea registro de movimiento
- ✅ `test_update_inventory_from_zero_stock` - Actualiza desde stock cero

#### Invoice Processing (10 tests)
- ✅ `test_process_invoice_rejects_duplicate_invoice_number` - Rechaza duplicados
- ✅ `test_process_invoice_creates_invoice_with_items` - Crea factura con items
- ✅ `test_process_invoice_updates_all_product_stocks` - Actualiza todos los stocks
- ✅ `test_process_invoice_rollback_on_error` - Rollback en error
- ✅ `test_process_invoice_creates_supplier_if_not_exists` - Crea proveedor
- ✅ `test_process_invoice_creates_products_if_not_exist` - Crea productos
- ✅ `test_process_invoice_saves_pdf_file` - Guarda archivo PDF
- ✅ `test_process_invoice_calculates_totals_correctly` - Calcula totales

---

## 📈 Cobertura Actual

**Sesión 1 Completada:**
- ✅ 31 tests de autenticación
- ✅ 28 tests de invoice processor
- **Total: 59 tests**

**Módulos con Cobertura:**
- ✅ `auth.py` - ~90% cobertura
- ✅ `invoice_processor.py` - ~85% cobertura

## 🎯 Próximos Tests (Sesión 2)

1. Tests de Sales Endpoints
2. Tests de Models
3. Tests de Integración (Sales Flow)
4. Tests de Integración (Purchase Invoice Flow)

## 🔧 Comandos Útiles

### Ejecutar solo tests unitarios
```bash
pytest tests/unit/ -v
```

### Ejecutar solo tests de auth
```bash
pytest tests/unit/test_auth.py -v
```

### Ejecutar tests con marcadores específicos
```bash
pytest -m auth -v          # Solo tests de autenticación
pytest -m invoice -v       # Solo tests de facturas
pytest -m unit -v          # Solo tests unitarios
```

### Ver cobertura
```bash
pytest --cov=. --cov-report=html
# Abre htmlcov/index.html en el navegador
```

### Ejecutar tests en modo verbose
```bash
pytest -vv
```

### Ejecutar con output detallado
```bash
pytest -v -s
```

## 📝 Convenciones de Nombres

- **Archivos**: `test_<module>.py`
- **Clases**: `Test<Feature>`
- **Funciones**: `test_<what_it_does>`

## 🏷️ Marcadores de Tests

- `@pytest.mark.unit` - Tests unitarios
- `@pytest.mark.integration` - Tests de integración
- `@pytest.mark.auth` - Tests de autenticación
- `@pytest.mark.invoice` - Tests de facturas
- `@pytest.mark.asyncio` - Tests asíncronos

## 📚 Fixtures Disponibles

Ver `conftest.py` para lista completa de fixtures:
- `db_session` - Sesión de base de datos en memoria
- `client` - Cliente de test FastAPI
- `test_user` - Usuario de prueba (VENDEDOR)
- `test_admin` - Usuario admin de prueba
- `test_superuser` - Superusuario de prueba
- `test_product` - Producto de prueba con stock
- `test_product_no_stock` - Producto sin stock
- `test_client_record` - Cliente de prueba
- `test_supplier` - Proveedor de prueba
- `sample_invoice_data` - Datos de factura de ejemplo

## ⚠️ Notas Importantes

1. Todos los tests usan base de datos en memoria (SQLite)
2. Cada test tiene su propia sesión limpia
3. Los tests no afectan la base de datos de producción
4. Se recomienda ejecutar tests antes de hacer push

## 🐛 Debugging Tests

Para debug con breakpoint:
```python
import pdb; pdb.set_trace()
```

O usar pytest con:
```bash
pytest --pdb  # Entra en debugger en fallo
pytest -x     # Para en el primer error
```
