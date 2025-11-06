# 📋 INSTRUCTIVO COMPLETO PARA COMPLETAR EL PROYECTO AEJ SISTEMA

**Versión:** 1.0
**Fecha:** 2025-11-06
**Desarrollador:** Jairo Luis Colina Mesa
**Tiempo Estimado Total:** 6-8 semanas (304 horas)

---

## 📊 RESUMEN EJECUTIVO

### Estado Actual del Proyecto
- **Frontend:** ✅ 100% completo y funcional (localStorage)
- **Backend:** ⚠️ 10% completo (solo estructura básica)
- **Integración:** ❌ 0% (totalmente desconectado)
- **Legal DIAN:** ❌ 0% implementado
- **Testing:** ❌ 0% implementado

### Lo que Funciona Ahora
✅ Interfaz de usuario completa con 13 páginas
✅ Sistema de autenticación y roles
✅ Gestión completa de productos, clientes, inventario
✅ Punto de venta funcional
✅ Reportes y dashboard
✅ Cumplimiento Ley 1581 en frontend

### Lo que NO Funciona
❌ Datos solo en navegador (se pierden al limpiar caché)
❌ Sin backend real (solo placeholders)
❌ Sin base de datos persistente
❌ Sin facturas electrónicas DIAN
❌ Sin seguridad real (contraseñas sin cifrar)
❌ No deployable en producción

---

## 🎯 OBJETIVO FINAL

Transformar el prototipo actual en un **sistema POS completo, legal y operativo** que:

1. Almacene datos en base de datos real (SQLite/PostgreSQL)
2. Tenga backend robusto con FastAPI
3. Genere facturas electrónicas válidas según DIAN
4. Sea seguro (JWT, bcrypt, validaciones)
5. Tenga tests automatizados (cobertura >70%)
6. Sea desplegable en producción
7. Cumpla 100% normativa colombiana

---

## 📅 PLAN MAESTRO - 5 FASES

```
┌──────────────────────────────────────────────────────────────┐
│                    ROADMAP DE DESARROLLO                      │
├─────────┬────────────────────────────────┬──────────┬────────┤
│  FASE   │         DESCRIPCIÓN            │  TIEMPO  │ PRIORID│
├─────────┼────────────────────────────────┼──────────┼────────┤
│ FASE 1  │ Backend Básico                 │ 2 semanas│  🔴    │
│ FASE 2  │ Testing y Estabilidad          │ 1 semana │  🟡    │
│ FASE 3  │ Despliegue y DevOps            │ 1 semana │  🟡    │
│ FASE 4  │ Integración DIAN               │ 2-3 sem. │  🔴    │
│ FASE 5  │ Producción y Optimización      │ 1-2 sem. │  🟢    │
└─────────┴────────────────────────────────┴──────────┴────────┘
```

---

# 📦 FASE 1: BACKEND BÁSICO (2 SEMANAS - 88 HORAS)

**Objetivo:** Conectar frontend con backend real y base de datos persistente

## SEMANA 1 - DÍA 1-2: Base de Datos (16h)

### Tarea 1.1: Configurar Base de Datos SQLite
**Tiempo:** 2 horas

1. Crear archivo `backend/database.py`:
```python
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

SQLALCHEMY_DATABASE_URL = "sqlite:///./aej_sistema.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

2. Actualizar `requirements.txt`:
```txt
fastapi==0.104.1
uvicorn[standard]==0.24.0
sqlalchemy==2.0.23
pydantic==2.5.0
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.6
alembic==1.12.1
```

3. Instalar dependencias:
```bash
cd backend
pip install -r requirements.txt
```

### Tarea 1.2: Crear Modelos SQLAlchemy
**Tiempo:** 8 horas

Crear archivo `backend/models.py`:

```python
from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Float, DateTime, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100))
    role = Column(String(20), nullable=False)  # SUPERUSUARIO, ADMIN, VENDEDOR, ALMACEN, CONTADOR
    is_active = Column(Boolean, default=True)
    is_deleted = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relaciones
    sales = relationship("Sale", back_populates="user")

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    sku = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(200), nullable=False)
    description = Column(Text)
    category = Column(String(100))
    brand = Column(String(100))
    cost_price = Column(Float, nullable=False)
    sale_price = Column(Float, nullable=False)
    stock = Column(Integer, default=0)
    min_stock = Column(Integer, default=5)
    has_iva = Column(Boolean, default=True)
    iva_percentage = Column(Float, default=19.0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relaciones
    sale_items = relationship("SaleItem", back_populates="product")
    inventory_movements = relationship("InventoryMovement", back_populates="product")

class Client(Base):
    __tablename__ = "clients"

    id = Column(Integer, primary_key=True, index=True)
    document_type = Column(String(10), nullable=False)  # CC, NIT, CE, TI
    document_number = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(200), nullable=False)
    email = Column(String(100))
    phone = Column(String(20))
    address = Column(String(255))
    city = Column(String(100))

    # Cumplimiento Ley 1581/2012
    data_consent = Column(Boolean, default=False, nullable=False)
    consent_date = Column(DateTime)
    consent_channel = Column(String(50))  # Presencial, Teléfono, Email, Web

    classification = Column(String(20), default="Nuevo")  # Nuevo, Ocasional, Frecuente, VIP
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relaciones
    sales = relationship("Sale", back_populates="client")

class Sale(Base):
    __tablename__ = "sales"

    id = Column(Integer, primary_key=True, index=True)
    sale_number = Column(String(50), unique=True, index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    client_id = Column(Integer, ForeignKey("clients.id"))

    subtotal = Column(Float, nullable=False)
    discount = Column(Float, default=0.0)
    iva = Column(Float, default=0.0)
    total = Column(Float, nullable=False)

    payment_method = Column(String(50), nullable=False)  # Efectivo, Tarjeta, Transferencia
    payment_reference = Column(String(100))

    status = Column(String(20), default="Completada")  # Completada, Anulada
    notes = Column(Text)

    sale_date = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relaciones
    user = relationship("User", back_populates="sales")
    client = relationship("Client", back_populates="sales")
    items = relationship("SaleItem", back_populates="sale", cascade="all, delete-orphan")
    invoice = relationship("Invoice", back_populates="sale", uselist=False)

class SaleItem(Base):
    __tablename__ = "sale_items"

    id = Column(Integer, primary_key=True, index=True)
    sale_id = Column(Integer, ForeignKey("sales.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)

    quantity = Column(Integer, nullable=False)
    unit_price = Column(Float, nullable=False)
    discount = Column(Float, default=0.0)
    iva_amount = Column(Float, default=0.0)
    subtotal = Column(Float, nullable=False)

    # Relaciones
    sale = relationship("Sale", back_populates="items")
    product = relationship("Product", back_populates="sale_items")

class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(Integer, primary_key=True, index=True)
    invoice_number = Column(String(50), unique=True, index=True, nullable=False)
    sale_id = Column(Integer, ForeignKey("sales.id"), nullable=False)

    cufe = Column(String(255))  # Código Único de Factura Electrónica (DIAN)
    qr_code = Column(Text)  # Código QR en base64
    xml_content = Column(Text)  # XML de la factura (DIAN)
    pdf_path = Column(String(255))  # Ruta al PDF generado

    status = Column(String(20), default="Emitida")  # Emitida, Pagada, Anulada, Vencida
    issue_date = Column(DateTime, default=datetime.utcnow)
    due_date = Column(DateTime)
    payment_date = Column(DateTime)

    cancellation_reason = Column(Text)
    cancelled_at = Column(DateTime)
    cancelled_by = Column(Integer, ForeignKey("users.id"))

    created_at = Column(DateTime, default=datetime.utcnow)

    # Relaciones
    sale = relationship("Sale", back_populates="invoice")

class Supplier(Base):
    __tablename__ = "suppliers"

    id = Column(Integer, primary_key=True, index=True)
    nit = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(200), nullable=False)
    contact_name = Column(String(100))
    phone = Column(String(20))
    email = Column(String(100))
    address = Column(String(255))
    city = Column(String(100))

    # Evaluación del proveedor
    quality_rating = Column(Float, default=0.0)
    price_rating = Column(Float, default=0.0)
    delivery_rating = Column(Float, default=0.0)
    service_rating = Column(Float, default=0.0)

    notes = Column(Text)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class InventoryMovement(Base):
    __tablename__ = "inventory_movements"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    movement_type = Column(String(20), nullable=False)  # Entrada, Salida, Ajuste
    quantity = Column(Integer, nullable=False)
    previous_stock = Column(Integer, nullable=False)
    new_stock = Column(Integer, nullable=False)

    reason = Column(String(100))
    reference = Column(String(100))
    notes = Column(Text)

    movement_date = Column(DateTime, default=datetime.utcnow)

    # Relaciones
    product = relationship("Product", back_populates="inventory_movements")

class Configuration(Base):
    __tablename__ = "configuration"

    id = Column(Integer, primary_key=True, index=True)

    # Información de la empresa
    company_name = Column(String(200), nullable=False)
    company_nit = Column(String(50), nullable=False)
    company_address = Column(String(255))
    company_city = Column(String(100))
    company_phone = Column(String(20))
    company_email = Column(String(100))
    company_website = Column(String(100))

    # Configuración de impuestos
    default_iva = Column(Float, default=19.0)

    # Configuración de facturación DIAN
    dian_resolution = Column(String(100))
    dian_prefix = Column(String(20))
    dian_from_number = Column(Integer)
    dian_to_number = Column(Integer)
    dian_authorization_date = Column(DateTime)
    dian_due_date = Column(DateTime)
    dian_technical_key = Column(String(255))
    dian_test_id = Column(String(255))

    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
```

### Tarea 1.3: Crear Migraciones con Alembic
**Tiempo:** 2 horas

1. Inicializar Alembic:
```bash
cd backend
alembic init alembic
```

2. Editar `alembic/env.py`:
```python
from backend.models import Base
target_metadata = Base.metadata
```

3. Crear migración inicial:
```bash
alembic revision --autogenerate -m "Initial migration"
alembic upgrade head
```

### Tarea 1.4: Crear Schemas Pydantic
**Tiempo:** 4 horas

Crear archivo `backend/schemas.py`:

```python
from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, List
from datetime import datetime

# ============ USER SCHEMAS ============
class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    role: str = Field(..., pattern="^(SUPERUSUARIO|ADMIN|VENDEDOR|ALMACEN|CONTADOR)$")

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None

class User(UserBase):
    id: int
    is_active: bool
    is_deleted: bool
    created_at: datetime

    class Config:
        from_attributes = True

# ============ PRODUCT SCHEMAS ============
class ProductBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    category: Optional[str] = None
    brand: Optional[str] = None
    cost_price: float = Field(..., gt=0)
    sale_price: float = Field(..., gt=0)
    stock: int = Field(default=0, ge=0)
    min_stock: int = Field(default=5, ge=0)
    has_iva: bool = True
    iva_percentage: float = Field(default=19.0, ge=0, le=100)

class ProductCreate(ProductBase):
    sku: str = Field(..., min_length=1, max_length=50)

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    brand: Optional[str] = None
    cost_price: Optional[float] = Field(None, gt=0)
    sale_price: Optional[float] = Field(None, gt=0)
    stock: Optional[int] = Field(None, ge=0)
    min_stock: Optional[int] = Field(None, ge=0)
    has_iva: Optional[bool] = None
    iva_percentage: Optional[float] = Field(None, ge=0, le=100)
    is_active: Optional[bool] = None

class Product(ProductBase):
    id: int
    sku: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

# ============ CLIENT SCHEMAS ============
class ClientBase(BaseModel):
    document_type: str = Field(..., pattern="^(CC|NIT|CE|TI)$")
    document_number: str = Field(..., min_length=1, max_length=50)
    name: str = Field(..., min_length=1, max_length=200)
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    data_consent: bool = Field(..., description="Cumplimiento Ley 1581/2012")
    consent_channel: Optional[str] = None

class ClientCreate(ClientBase):
    @validator('data_consent')
    def consent_must_be_true(cls, v):
        if not v:
            raise ValueError('El cliente debe aceptar el tratamiento de datos (Ley 1581/2012)')
        return v

class ClientUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    classification: Optional[str] = None
    is_active: Optional[bool] = None

class Client(ClientBase):
    id: int
    consent_date: Optional[datetime]
    classification: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

# ============ SALE SCHEMAS ============
class SaleItemCreate(BaseModel):
    product_id: int
    quantity: int = Field(..., gt=0)
    unit_price: float = Field(..., gt=0)
    discount: float = Field(default=0.0, ge=0)

class SaleItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    unit_price: float
    discount: float
    iva_amount: float
    subtotal: float

    class Config:
        from_attributes = True

class SaleCreate(BaseModel):
    client_id: Optional[int] = None
    items: List[SaleItemCreate]
    discount: float = Field(default=0.0, ge=0)
    payment_method: str = Field(..., pattern="^(Efectivo|Tarjeta|Transferencia)$")
    payment_reference: Optional[str] = None
    notes: Optional[str] = None

class Sale(BaseModel):
    id: int
    sale_number: str
    user_id: int
    client_id: Optional[int]
    subtotal: float
    discount: float
    iva: float
    total: float
    payment_method: str
    status: str
    sale_date: datetime
    items: List[SaleItemResponse]

    class Config:
        from_attributes = True

# ============ INVOICE SCHEMAS ============
class InvoiceCreate(BaseModel):
    sale_id: int
    due_date: Optional[datetime] = None

class Invoice(BaseModel):
    id: int
    invoice_number: str
    sale_id: int
    cufe: Optional[str]
    status: str
    issue_date: datetime
    due_date: Optional[datetime]
    payment_date: Optional[datetime]

    class Config:
        from_attributes = True

# ============ AUTH SCHEMAS ============
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class LoginRequest(BaseModel):
    username: str
    password: str
```

---

## SEMANA 1 - DÍA 3-5: Autenticación JWT (24h)

### Tarea 1.5: Implementar Autenticación
**Tiempo:** 8 horas

Crear archivo `backend/auth.py`:

```python
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from . import models, schemas, database

# Configuración
SECRET_KEY = "tu_clave_secreta_muy_segura_cambiar_en_produccion"  # CAMBIAR EN PRODUCCIÓN
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 480  # 8 horas

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verificar contraseña"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Hashear contraseña"""
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Crear token JWT"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def authenticate_user(db: Session, username: str, password: str):
    """Autenticar usuario"""
    user = db.query(models.User).filter(
        models.User.username == username,
        models.User.is_active == True,
        models.User.is_deleted == False
    ).first()

    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(database.get_db)
) -> models.User:
    """Obtener usuario actual desde token"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudo validar las credenciales",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = schemas.TokenData(username=username)
    except JWTError:
        raise credentials_exception

    user = db.query(models.User).filter(
        models.User.username == token_data.username,
        models.User.is_active == True,
        models.User.is_deleted == False
    ).first()

    if user is None:
        raise credentials_exception
    return user

async def get_current_active_user(
    current_user: models.User = Depends(get_current_user)
) -> models.User:
    """Verificar que el usuario esté activo"""
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Usuario inactivo")
    return current_user

def require_role(allowed_roles: list):
    """Decorator para verificar roles"""
    def role_checker(current_user: models.User = Depends(get_current_active_user)):
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tiene permisos para esta acción"
            )
        return current_user
    return role_checker

# Aliases de roles comunes
require_superuser = require_role(["SUPERUSUARIO"])
require_admin = require_role(["SUPERUSUARIO", "ADMIN"])
require_seller = require_role(["SUPERUSUARIO", "ADMIN", "VENDEDOR"])
require_warehouse = require_role(["SUPERUSUARIO", "ADMIN", "ALMACEN"])
require_accountant = require_role(["SUPERUSUARIO", "ADMIN", "CONTADOR"])
```

### Tarea 1.6: Crear Seed Data (Usuarios Iniciales)
**Tiempo:** 2 horas

Crear archivo `backend/seed.py`:

```python
from sqlalchemy.orm import Session
from . import models
from .auth import get_password_hash

def create_initial_users(db: Session):
    """Crear usuarios iniciales del sistema"""

    users = [
        {
            "username": "superadmin",
            "email": "superadmin@aej.com",
            "full_name": "Super Administrador",
            "hashed_password": get_password_hash("admin123"),
            "role": "SUPERUSUARIO"
        },
        {
            "username": "admin",
            "email": "admin@aej.com",
            "full_name": "Administrador",
            "hashed_password": get_password_hash("admin123"),
            "role": "ADMIN"
        },
        {
            "username": "vendedor1",
            "email": "vendedor1@aej.com",
            "full_name": "Vendedor Principal",
            "hashed_password": get_password_hash("vendedor123"),
            "role": "VENDEDOR"
        },
        {
            "username": "almacen1",
            "email": "almacen1@aej.com",
            "full_name": "Encargado de Almacén",
            "hashed_password": get_password_hash("almacen123"),
            "role": "ALMACEN"
        },
        {
            "username": "contador1",
            "email": "contador1@aej.com",
            "full_name": "Contador",
            "hashed_password": get_password_hash("contador123"),
            "role": "CONTADOR"
        }
    ]

    for user_data in users:
        existing_user = db.query(models.User).filter(
            models.User.username == user_data["username"]
        ).first()

        if not existing_user:
            db_user = models.User(**user_data)
            db.add(db_user)

    db.commit()
    print("✅ Usuarios iniciales creados")

def create_initial_configuration(db: Session):
    """Crear configuración inicial"""
    config = db.query(models.Configuration).first()
    if not config:
        config = models.Configuration(
            company_name="AEJ Cosmetic & More",
            company_nit="900123456-7",
            company_address="Calle 123 # 45-67",
            company_city="Bogotá",
            company_phone="601-2345678",
            company_email="info@aejcosmetic.com",
            default_iva=19.0
        )
        db.add(config)
        db.commit()
        print("✅ Configuración inicial creada")

def init_db(db: Session):
    """Inicializar base de datos con datos de prueba"""
    create_initial_users(db)
    create_initial_configuration(db)
```

---

## SEMANA 2 - DÍA 1-3: Endpoints CRUD (32h)

### Tarea 1.7: Implementar Endpoints de Autenticación
**Tiempo:** 4 horas

Actualizar `backend/main.py` (parte 1 - Auth):

```python
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import List

from . import models, schemas, auth, database, seed

# Crear tablas
models.Base.metadata.create_all(bind=database.engine)

# Inicializar datos
db = database.SessionLocal()
seed.init_db(db)
db.close()

app = FastAPI(
    title="AEJ POS Backend",
    description="Backend API para Sistema POS AEJ Cosmetic & More",
    version="2.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://192.168.1.137:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ========== AUTENTICACIÓN ==========

@app.post("/api/auth/login", response_model=schemas.Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(database.get_db)
):
    """Login de usuario"""
    user = auth.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )

    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/api/auth/me", response_model=schemas.User)
async def get_me(current_user: models.User = Depends(auth.get_current_active_user)):
    """Obtener usuario actual"""
    return current_user

# ========== HEALTH CHECKS ==========

@app.get("/health")
async def health_check():
    """Health check"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "service": "AEJ POS Backend",
        "version": "2.0.0"
    }

@app.get("/")
async def root():
    """Endpoint raíz"""
    return {
        "message": "AEJ POS Backend API v2.0",
        "status": "running",
        "docs": "/docs"
    }
```

### Tarea 1.8: Implementar CRUD de Productos
**Tiempo:** 6 horas

Agregar a `backend/main.py` (parte 2 - Products):

```python
# ========== PRODUCTOS ==========

@app.get("/api/products", response_model=List[schemas.Product])
async def get_products(
    skip: int = 0,
    limit: int = 100,
    search: str = None,
    category: str = None,
    active_only: bool = True,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Obtener lista de productos"""
    query = db.query(models.Product)

    if active_only:
        query = query.filter(models.Product.is_active == True)

    if search:
        query = query.filter(
            models.Product.name.contains(search) |
            models.Product.sku.contains(search) |
            models.Product.brand.contains(search)
        )

    if category:
        query = query.filter(models.Product.category == category)

    products = query.offset(skip).limit(limit).all()
    return products

@app.get("/api/products/{product_id}", response_model=schemas.Product)
async def get_product(
    product_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Obtener producto por ID"""
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return product

@app.post("/api/products", response_model=schemas.Product, status_code=status.HTTP_201_CREATED)
async def create_product(
    product: schemas.ProductCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.require_warehouse)
):
    """Crear nuevo producto"""
    # Verificar SKU único
    existing = db.query(models.Product).filter(models.Product.sku == product.sku).first()
    if existing:
        raise HTTPException(status_code=400, detail="El SKU ya existe")

    db_product = models.Product(**product.dict())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

@app.put("/api/products/{product_id}", response_model=schemas.Product)
async def update_product(
    product_id: int,
    product: schemas.ProductUpdate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.require_warehouse)
):
    """Actualizar producto"""
    db_product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    update_data = product.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_product, field, value)

    db.commit()
    db.refresh(db_product)
    return db_product

@app.delete("/api/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(
    product_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.require_warehouse)
):
    """Eliminar producto (soft delete)"""
    db_product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    db_product.is_active = False
    db.commit()
    return None
```

### Tarea 1.9: Implementar CRUD de Clientes
**Tiempo:** 6 horas

Agregar a `backend/main.py` (parte 3 - Clients):

```python
# ========== CLIENTES ==========

@app.get("/api/clients", response_model=List[schemas.Client])
async def get_clients(
    skip: int = 0,
    limit: int = 100,
    search: str = None,
    active_only: bool = True,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Obtener lista de clientes"""
    query = db.query(models.Client)

    if active_only:
        query = query.filter(models.Client.is_active == True)

    if search:
        query = query.filter(
            models.Client.name.contains(search) |
            models.Client.document_number.contains(search) |
            models.Client.email.contains(search)
        )

    clients = query.offset(skip).limit(limit).all()
    return clients

@app.get("/api/clients/{client_id}", response_model=schemas.Client)
async def get_client(
    client_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Obtener cliente por ID"""
    client = db.query(models.Client).filter(models.Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    return client

@app.post("/api/clients", response_model=schemas.Client, status_code=status.HTTP_201_CREATED)
async def create_client(
    client: schemas.ClientCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.require_seller)
):
    """Crear nuevo cliente (Ley 1581/2012)"""
    # Verificar documento único
    existing = db.query(models.Client).filter(
        models.Client.document_number == client.document_number
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="El documento ya está registrado")

    # Validar consentimiento (Ley 1581)
    if not client.data_consent:
        raise HTTPException(
            status_code=400,
            detail="El cliente debe aceptar el tratamiento de datos personales (Ley 1581/2012)"
        )

    client_dict = client.dict()
    client_dict['consent_date'] = datetime.utcnow()

    db_client = models.Client(**client_dict)
    db.add(db_client)
    db.commit()
    db.refresh(db_client)
    return db_client

@app.put("/api/clients/{client_id}", response_model=schemas.Client)
async def update_client(
    client_id: int,
    client: schemas.ClientUpdate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.require_seller)
):
    """Actualizar cliente"""
    db_client = db.query(models.Client).filter(models.Client.id == client_id).first()
    if not db_client:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")

    update_data = client.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_client, field, value)

    db.commit()
    db.refresh(db_client)
    return db_client
```

### Tarea 1.10: Implementar CRUD de Ventas
**Tiempo:** 8 horas

Agregar a `backend/main.py` (parte 4 - Sales):

```python
# ========== VENTAS ==========

@app.get("/api/sales", response_model=List[schemas.Sale])
async def get_sales(
    skip: int = 0,
    limit: int = 100,
    from_date: datetime = None,
    to_date: datetime = None,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Obtener lista de ventas"""
    query = db.query(models.Sale)

    if from_date:
        query = query.filter(models.Sale.sale_date >= from_date)
    if to_date:
        query = query.filter(models.Sale.sale_date <= to_date)

    sales = query.order_by(models.Sale.sale_date.desc()).offset(skip).limit(limit).all()
    return sales

@app.get("/api/sales/{sale_id}", response_model=schemas.Sale)
async def get_sale(
    sale_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Obtener venta por ID"""
    sale = db.query(models.Sale).filter(models.Sale.id == sale_id).first()
    if not sale:
        raise HTTPException(status_code=404, detail="Venta no encontrada")
    return sale

@app.post("/api/sales", response_model=schemas.Sale, status_code=status.HTTP_201_CREATED)
async def create_sale(
    sale: schemas.SaleCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.require_seller)
):
    """Crear nueva venta"""

    # Verificar stock de productos
    for item in sale.items:
        product = db.query(models.Product).filter(models.Product.id == item.product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Producto {item.product_id} no encontrado")
        if product.stock < item.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Stock insuficiente para {product.name}. Disponible: {product.stock}"
            )

    # Calcular totales
    subtotal = 0.0
    iva_total = 0.0

    # Generar número de venta
    last_sale = db.query(models.Sale).order_by(models.Sale.id.desc()).first()
    sale_number = f"V-{(last_sale.id + 1) if last_sale else 1:06d}"

    # Crear venta
    db_sale = models.Sale(
        sale_number=sale_number,
        user_id=current_user.id,
        client_id=sale.client_id,
        discount=sale.discount,
        payment_method=sale.payment_method,
        payment_reference=sale.payment_reference,
        notes=sale.notes
    )

    # Crear items de venta
    for item in sale.items:
        product = db.query(models.Product).filter(models.Product.id == item.product_id).first()

        item_subtotal = (item.unit_price * item.quantity) - item.discount
        item_iva = 0.0

        if product.has_iva:
            item_iva = item_subtotal * (product.iva_percentage / 100)

        db_item = models.SaleItem(
            product_id=item.product_id,
            quantity=item.quantity,
            unit_price=item.unit_price,
            discount=item.discount,
            iva_amount=item_iva,
            subtotal=item_subtotal + item_iva
        )

        db_sale.items.append(db_item)

        subtotal += item_subtotal
        iva_total += item_iva

        # Reducir stock
        product.stock -= item.quantity

        # Registrar movimiento de inventario
        movement = models.InventoryMovement(
            product_id=product.id,
            user_id=current_user.id,
            movement_type="Salida",
            quantity=item.quantity,
            previous_stock=product.stock + item.quantity,
            new_stock=product.stock,
            reason="Venta",
            reference=sale_number
        )
        db.add(movement)

    db_sale.subtotal = subtotal
    db_sale.iva = iva_total
    db_sale.total = subtotal + iva_total - sale.discount

    db.add(db_sale)
    db.commit()
    db.refresh(db_sale)

    return db_sale
```

### Tarea 1.11: Implementar Endpoints Restantes
**Tiempo:** 8 horas

- Facturas (CRUD)
- Proveedores (CRUD)
- Movimientos de Inventario (CRUD)
- Usuarios (CRUD)
- Configuración (GET/UPDATE)
- Reportes (endpoints de consulta)

---

## SEMANA 2 - DÍA 4-5: Integración Frontend (16h)

### Tarea 1.12: Crear Cliente API en Frontend
**Tiempo:** 4 horas

Crear archivo `src/lib/api.ts`:

```typescript
import axios, { AxiosInstance, AxiosError } from 'axios';
import { getCurrentAuth, logout } from './auth';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://192.168.1.137:8000';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor para agregar token
    this.client.interceptors.request.use((config) => {
      const auth = getCurrentAuth();
      if (auth.token) {
        config.headers.Authorization = `Bearer ${auth.token}`;
      }
      return config;
    });

    // Interceptor para manejar errores
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          logout();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // ===== AUTH =====
  async login(username: string, password: string) {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    const response = await this.client.post('/api/auth/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    return response.data;
  }

  async getMe() {
    const response = await this.client.get('/api/auth/me');
    return response.data;
  }

  // ===== PRODUCTS =====
  async getProducts(params?: any) {
    const response = await this.client.get('/api/products', { params });
    return response.data;
  }

  async getProduct(id: number) {
    const response = await this.client.get(`/api/products/${id}`);
    return response.data;
  }

  async createProduct(data: any) {
    const response = await this.client.post('/api/products', data);
    return response.data;
  }

  async updateProduct(id: number, data: any) {
    const response = await this.client.put(`/api/products/${id}`, data);
    return response.data;
  }

  async deleteProduct(id: number) {
    await this.client.delete(`/api/products/${id}`);
  }

  // ===== CLIENTS =====
  async getClients(params?: any) {
    const response = await this.client.get('/api/clients', { params });
    return response.data;
  }

  async getClient(id: number) {
    const response = await this.client.get(`/api/clients/${id}`);
    return response.data;
  }

  async createClient(data: any) {
    const response = await this.client.post('/api/clients', data);
    return response.data;
  }

  async updateClient(id: number, data: any) {
    const response = await this.client.put(`/api/clients/${id}`, data);
    return response.data;
  }

  // ===== SALES =====
  async getSales(params?: any) {
    const response = await this.client.get('/api/sales', { params });
    return response.data;
  }

  async getSale(id: number) {
    const response = await this.client.get(`/api/sales/${id}`);
    return response.data;
  }

  async createSale(data: any) {
    const response = await this.client.post('/api/sales', data);
    return response.data;
  }

  // ... Agregar más endpoints según necesidad
}

export const api = new ApiClient();
```

### Tarea 1.13: Migrar Frontend de localStorage a API
**Tiempo:** 12 horas

Modificar cada página para usar `api` en lugar de funciones `db.*`:

**Ejemplo para Products.tsx:**

```typescript
// ANTES (localStorage):
const products = db.getProducts();

// DESPUÉS (API):
const [products, setProducts] = useState([]);
const [loading, setLoading] = useState(false);

useEffect(() => {
  loadProducts();
}, []);

const loadProducts = async () => {
  setLoading(true);
  try {
    const data = await api.getProducts();
    setProducts(data);
  } catch (error) {
    toast.error('Error al cargar productos');
  } finally {
    setLoading(false);
  }
};

const handleCreate = async (productData) => {
  try {
    await api.createProduct(productData);
    await loadProducts();
    toast.success('Producto creado');
  } catch (error) {
    toast.error('Error al crear producto');
  }
};
```

Repetir este patrón para:
- Products.tsx ✓
- Clients.tsx
- POS.tsx
- Inventory.tsx
- Suppliers.tsx
- Billing.tsx
- Reports.tsx
- Users.tsx
- Configuration.tsx

---

# 📦 FASE 2: TESTING Y ESTABILIDAD (1 SEMANA - 40h)

## DÍA 1-2: Tests Backend (16h)

### Tarea 2.1: Configurar pytest
**Tiempo:** 2 horas

1. Agregar a `requirements.txt`:
```txt
pytest==7.4.3
pytest-asyncio==0.21.1
httpx==0.25.1
faker==20.0.0
```

2. Crear `backend/tests/conftest.py`:
```python
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient

from backend.database import Base, get_db
from backend.main import app
from backend import models
from backend.auth import get_password_hash

SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture
def db():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)

@pytest.fixture
def client(db):
    def override_get_db():
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()

@pytest.fixture
def test_user(db):
    user = models.User(
        username="testuser",
        email="test@example.com",
        hashed_password=get_password_hash("testpass123"),
        full_name="Test User",
        role="ADMIN"
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@pytest.fixture
def auth_token(client, test_user):
    response = client.post(
        "/api/auth/login",
        data={"username": "testuser", "password": "testpass123"}
    )
    return response.json()["access_token"]

@pytest.fixture
def auth_headers(auth_token):
    return {"Authorization": f"Bearer {auth_token}"}
```

### Tarea 2.2: Escribir Tests de Productos
**Tiempo:** 4 horas

Crear `backend/tests/test_products.py`:

```python
import pytest
from backend import models

def test_create_product(client, auth_headers):
    """Test crear producto"""
    response = client.post(
        "/api/products",
        json={
            "sku": "TEST-001",
            "name": "Producto de Prueba",
            "cost_price": 10000,
            "sale_price": 15000,
            "stock": 50,
            "has_iva": True
        },
        headers=auth_headers
    )
    assert response.status_code == 201
    data = response.json()
    assert data["sku"] == "TEST-001"
    assert data["name"] == "Producto de Prueba"

def test_get_products(client, auth_headers, db):
    """Test listar productos"""
    # Crear productos de prueba
    for i in range(5):
        product = models.Product(
            sku=f"TEST-{i:03d}",
            name=f"Producto {i}",
            cost_price=10000,
            sale_price=15000,
            stock=50
        )
        db.add(product)
    db.commit()

    response = client.get("/api/products", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 5

def test_get_product_by_id(client, auth_headers, db):
    """Test obtener producto por ID"""
    product = models.Product(
        sku="TEST-001",
        name="Producto Test",
        cost_price=10000,
        sale_price=15000,
        stock=50
    )
    db.add(product)
    db.commit()
    db.refresh(product)

    response = client.get(f"/api/products/{product.id}", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == product.id
    assert data["sku"] == "TEST-001"

def test_update_product(client, auth_headers, db):
    """Test actualizar producto"""
    product = models.Product(
        sku="TEST-001",
        name="Producto Original",
        cost_price=10000,
        sale_price=15000,
        stock=50
    )
    db.add(product)
    db.commit()
    db.refresh(product)

    response = client.put(
        f"/api/products/{product.id}",
        json={"name": "Producto Actualizado", "sale_price": 20000},
        headers=auth_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Producto Actualizado"
    assert data["sale_price"] == 20000

def test_delete_product(client, auth_headers, db):
    """Test eliminar producto (soft delete)"""
    product = models.Product(
        sku="TEST-001",
        name="Producto Test",
        cost_price=10000,
        sale_price=15000,
        stock=50
    )
    db.add(product)
    db.commit()
    db.refresh(product)

    response = client.delete(f"/api/products/{product.id}", headers=auth_headers)
    assert response.status_code == 204

    # Verificar que está desactivado
    db.refresh(product)
    assert product.is_active == False

def test_duplicate_sku(client, auth_headers, db):
    """Test SKU duplicado debe fallar"""
    product = models.Product(
        sku="TEST-001",
        name="Producto 1",
        cost_price=10000,
        sale_price=15000,
        stock=50
    )
    db.add(product)
    db.commit()

    response = client.post(
        "/api/products",
        json={
            "sku": "TEST-001",  # SKU duplicado
            "name": "Producto 2",
            "cost_price": 10000,
            "sale_price": 15000,
            "stock": 50
        },
        headers=auth_headers
    )
    assert response.status_code == 400
    assert "SKU ya existe" in response.json()["detail"]
```

### Tarea 2.3: Tests de Clientes, Ventas, Auth
**Tiempo:** 10 horas

Crear archivos similares:
- `test_clients.py`
- `test_sales.py`
- `test_auth.py`
- `test_inventory.py`

## DÍA 3: Tests Frontend (8h)

### Tarea 2.4: Configurar Vitest
**Tiempo:** 2 horas

1. Instalar dependencias:
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

2. Crear `vitest.config.ts`:
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/tests/setup.ts',
  },
});
```

3. Crear `src/tests/setup.ts`:
```typescript
import '@testing-library/jest-dom';
```

### Tarea 2.5: Escribir Tests Básicos Frontend
**Tiempo:** 6 horas

Crear `src/tests/Login.test.tsx`:
```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Login from '../pages/Login';

describe('Login Component', () => {
  it('should render login form', () => {
    render(<Login onLogin={() => {}} />);
    expect(screen.getByLabelText(/usuario/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();
  });

  it('should show error on invalid credentials', async () => {
    render(<Login onLogin={() => {}} />);

    fireEvent.change(screen.getByLabelText(/usuario/i), {
      target: { value: 'invalid' },
    });
    fireEvent.change(screen.getByLabelText(/contraseña/i), {
      target: { value: 'wrong' },
    });
    fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));

    await waitFor(() => {
      expect(screen.getByText(/usuario o contraseña incorrectos/i)).toBeInTheDocument();
    });
  });
});
```

## DÍA 4-5: Corrección de Bugs y Estabilización (16h)

### Tarea 2.6: Ejecutar Tests y Corregir Fallos
**Tiempo:** 8 horas

```bash
# Backend
cd backend
pytest --cov=backend --cov-report=html

# Frontend
npm run test
```

### Tarea 2.7: Pruebas End-to-End Manuales
**Tiempo:** 8 horas

Probar flujos completos:
1. ✓ Login → Dashboard → Logout
2. ✓ Crear producto → Ver en lista → Editar → Eliminar
3. ✓ Crear cliente → Ver historial
4. ✓ Hacer venta → Generar factura → Ver en reportes
5. ✓ Movimiento inventario → Ver kardex
6. ✓ Configurar sistema → Guardar → Verificar

---

# 📦 FASE 3: DESPLIEGUE Y DEVOPS (1 SEMANA - 40h)

## DÍA 1-2: Dockerización (16h)

### Tarea 3.1: Crear Dockerfiles
**Tiempo:** 4 horas

**Backend Dockerfile:**
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Frontend Dockerfile:**
```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    volumes:
      - ./backend:/app
      - ./data:/app/data
    environment:
      - DATABASE_URL=sqlite:///./data/aej_sistema.db
    restart: unless-stopped

  frontend:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped
```

### Tarea 3.2: Configurar Nginx
**Tiempo:** 2 horas

Crear `nginx.conf`:
```nginx
server {
    listen 80;
    server_name localhost;

    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location /docs {
        proxy_pass http://backend:8000;
    }
}
```

### Tarea 3.3: Testing de Contenedores
**Tiempo:** 4 horas

```bash
# Build y levantar
docker-compose up --build -d

# Verificar logs
docker-compose logs -f

# Probar endpoints
curl http://localhost:8000/health
curl http://localhost/

# Debugging
docker-compose exec backend bash
docker-compose exec frontend sh
```

### Tarea 3.4: Scripts de Producción
**Tiempo:** 6 horas

Crear `scripts/deploy-production.sh`:
```bash
#!/bin/bash

echo "🚀 Desplegando AEJ Sistema en Producción"

# Backup de base de datos
echo "📦 Creando backup..."
cp data/aej_sistema.db backups/aej_sistema_$(date +%Y%m%d_%H%M%S).db

# Pull latest code
echo "📥 Obteniendo código..."
git pull origin main

# Build containers
echo "🔨 Construyendo contenedores..."
docker-compose build --no-cache

# Stop old containers
echo "🛑 Deteniendo servicios antiguos..."
docker-compose down

# Start new containers
echo "▶️ Iniciando servicios nuevos..."
docker-compose up -d

# Run migrations
echo "🗄️ Ejecutando migraciones..."
docker-compose exec backend alembic upgrade head

# Health check
echo "🩺 Verificando salud..."
sleep 5
curl -f http://localhost:8000/health || exit 1

echo "✅ Despliegue completado exitosamente"
```

## DÍA 3-4: Monitoreo y Logs (16h)

### Tarea 3.5: Configurar Logging
**Tiempo:** 6 horas

Actualizar `backend/main.py`:
```python
import logging
from logging.handlers import RotatingFileHandler

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        RotatingFileHandler('logs/aej_backend.log', maxBytes=10000000, backupCount=5),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

# En cada endpoint:
@app.post("/api/products")
async def create_product(...):
    logger.info(f"Usuario {current_user.username} creando producto")
    # ... resto del código
    logger.info(f"Producto {product.sku} creado exitosamente")
```

### Tarea 3.6: Sistema de Backups
**Tiempo:** 4 horas

Crear `scripts/backup-database.sh`:
```bash
#!/bin/bash

BACKUP_DIR="backups"
DB_FILE="data/aej_sistema.db"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup completo
cp $DB_FILE $BACKUP_DIR/aej_sistema_$TIMESTAMP.db

# Comprimir backup
gzip $BACKUP_DIR/aej_sistema_$TIMESTAMP.db

# Eliminar backups antiguos (mantener últimos 30 días)
find $BACKUP_DIR -name "*.db.gz" -mtime +30 -delete

echo "✅ Backup creado: aej_sistema_$TIMESTAMP.db.gz"
```

Agregar a crontab:
```bash
# Backup diario a las 2 AM
0 2 * * * /ruta/al/proyecto/scripts/backup-database.sh
```

### Tarea 3.7: Monitoreo con Prometheus (Opcional)
**Tiempo:** 6 horas

Instalar `prometheus-fastapi-instrumentator`:
```bash
pip install prometheus-fastapi-instrumentator
```

Actualizar `backend/main.py`:
```python
from prometheus_fastapi_instrumentator import Instrumentator

app = FastAPI(...)

# Métricas de Prometheus
Instrumentator().instrument(app).expose(app, endpoint="/metrics")
```

## DÍA 5: Documentación de Despliegue (8h)

### Tarea 3.8: Manual de Despliegue
**Tiempo:** 4 horas

Crear `DEPLOYMENT.md` con:
- Requisitos del servidor
- Instrucciones paso a paso
- Configuración de variables de entorno
- Troubleshooting común

### Tarea 3.9: Scripts de Instalación Linux
**Tiempo:** 4 horas

Actualizar `scripts/install-linux.sh`:
```bash
#!/bin/bash

echo "🚀 Instalando AEJ Sistema"

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Crear directorios
mkdir -p data backups logs

# Configurar permisos
sudo chown -R $USER:$USER .

# Variables de entorno
cp .env.example .env
echo "📝 Edita el archivo .env con tu configuración"

# Build y start
docker-compose up -d

echo "✅ Instalación completada"
echo "📱 Frontend: http://localhost"
echo "🔗 Backend: http://localhost:8000"
echo "📚 Docs: http://localhost:8000/docs"
```

---

# 📦 FASE 4: INTEGRACIÓN DIAN (2-3 SEMANAS - 56h)

**⚠️ ADVERTENCIA:** Esta es la parte más compleja y regulada. Requiere certificado digital y registro en DIAN.

## SEMANA 1: Estructura de Factura Electrónica

### Tarea 4.1: Instalar Dependencias
**Tiempo:** 2 horas

Agregar a `requirements.txt`:
```txt
lxml==4.9.3
xmltodict==0.13.0
cryptography==41.0.7
qrcode==7.4.2
Pillow==10.1.0
reportlab==4.0.7
```

### Tarea 4.2: Generación de XML DIAN
**Tiempo:** 16 horas

Crear `backend/dian/xml_generator.py`:

```python
from lxml import etree
from datetime import datetime
import hashlib
import base64

class DIANXMLGenerator:
    """Generador de XML para factura electrónica DIAN"""

    def __init__(self, config):
        self.config = config

    def generate_invoice_xml(self, sale, client, company):
        """Generar XML de factura según formato DIAN"""

        # Crear elemento raíz
        root = etree.Element(
            "Invoice",
            nsmap={
                None: "urn:oasis:names:specification:ubl:schema:xsd:Invoice-2",
                "cac": "urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2",
                "cbc": "urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2",
                "ext": "urn:oasis:names:specification:ubl:schema:xsd:CommonExtensionComponents-2",
            }
        )

        # UBL Version
        ubl_version = etree.SubElement(root, "{urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2}UBLVersionID")
        ubl_version.text = "UBL 2.1"

        # Número de factura
        invoice_id = etree.SubElement(root, "{urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2}ID")
        invoice_id.text = sale.invoice.invoice_number

        # Fecha de emisión
        issue_date = etree.SubElement(root, "{urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2}IssueDate")
        issue_date.text = sale.sale_date.strftime("%Y-%m-%d")

        # CUFE (se genera después)
        uuid = etree.SubElement(root, "{urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2}UUID")
        uuid.set("schemeID", "CUFE-SHA384")

        # Información del emisor (empresa)
        self._add_supplier_party(root, company)

        # Información del cliente
        self._add_customer_party(root, client)

        # Totales
        self._add_monetary_totals(root, sale)

        # Items de la factura
        for item in sale.items:
            self._add_invoice_line(root, item)

        # Generar CUFE
        cufe = self._generate_cufe(sale, company)
        uuid.text = cufe

        return etree.tostring(root, pretty_print=True, xml_declaration=True, encoding='UTF-8')

    def _generate_cufe(self, sale, company):
        """Generar CUFE (Código Único de Factura Electrónica)"""
        # Formato: SHA-384(NumFac + FecFac + HorFac + ValFac + CodImp + ValImp + ValTot + NitOFE + DocAdq + TecKey)

        data = (
            f"{sale.invoice.invoice_number}"
            f"{sale.sale_date.strftime('%Y%m%d')}"
            f"{sale.sale_date.strftime('%H%M%S')}"
            f"{sale.subtotal:.2f}"
            f"01"  # Código IVA
            f"{sale.iva:.2f}"
            f"{sale.total:.2f}"
            f"{company.company_nit}"
            f"{sale.client.document_number if sale.client else '222222222222'}"
            f"{self.config.dian_technical_key}"
        )

        cufe = hashlib.sha384(data.encode()).hexdigest()
        return cufe

    def _add_supplier_party(self, root, company):
        """Agregar información del proveedor (empresa emisora)"""
        # Implementación según especificación DIAN
        pass

    def _add_customer_party(self, root, client):
        """Agregar información del cliente"""
        # Implementación según especificación DIAN
        pass

    def _add_monetary_totals(self, root, sale):
        """Agregar totales monetarios"""
        # Implementación según especificación DIAN
        pass

    def _add_invoice_line(self, root, item):
        """Agregar línea de factura"""
        # Implementación según especificación DIAN
        pass
```

**NOTA:** El código completo del generador XML es extenso (~500 líneas). Requiere seguir exactamente la especificación de la Resolución 000165/2023 de DIAN.

### Tarea 4.3: Firma Digital
**Tiempo:** 12 horas

Crear `backend/dian/signature.py`:

```python
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.x509 import load_pem_x509_certificate
from lxml import etree
import base64

class DIANSigner:
    """Firmador de XML con certificado digital"""

    def __init__(self, cert_path, key_path, password):
        # Cargar certificado
        with open(cert_path, 'rb') as f:
            self.cert = load_pem_x509_certificate(f.read())

        # Cargar llave privada
        with open(key_path, 'rb') as f:
            self.private_key = serialization.load_pem_private_key(
                f.read(),
                password=password.encode() if password else None
            )

    def sign_xml(self, xml_content):
        """Firmar XML según estándar XMLDSig"""

        # Parse XML
        doc = etree.fromstring(xml_content)

        # Crear firma digital
        signature = self._create_signature(doc)

        # Insertar firma en el XML
        ext_content = doc.find(".//{urn:oasis:names:specification:ubl:schema:xsd:CommonExtensionComponents-2}ExtensionContent")
        ext_content.append(signature)

        return etree.tostring(doc, pretty_print=True, xml_declaration=True, encoding='UTF-8')

    def _create_signature(self, doc):
        """Crear elemento Signature según XMLDSig"""
        # Implementación según especificación XMLDSig y DIAN
        pass
```

### Tarea 4.4: Generación de QR
**Tiempo:** 4 horas

Crear `backend/dian/qr_generator.py`:

```python
import qrcode
import io
import base64

def generate_qr_for_invoice(invoice, company):
    """Generar código QR para factura electrónica"""

    # Datos del QR según DIAN
    qr_data = (
        f"NumFac: {invoice.invoice_number}\n"
        f"FecFac: {invoice.issue_date.strftime('%Y-%m-%d')}\n"
        f"NitFac: {company.company_nit}\n"
        f"DocAdq: {invoice.sale.client.document_number if invoice.sale.client else 'N/A'}\n"
        f"ValFac: {invoice.sale.total:.2f}\n"
        f"CUFE: {invoice.cufe}\n"
    )

    # Generar QR
    qr = qrcode.QRCode(version=1, box_size=10, border=4)
    qr.add_data(qr_data)
    qr.make(fit=True)

    # Convertir a imagen
    img = qr.make_image(fill_color="black", back_color="white")

    # Convertir a base64
    buffer = io.BytesIO()
    img.save(buffer, format='PNG')
    qr_base64 = base64.b64encode(buffer.getvalue()).decode()

    return qr_base64
```

## SEMANA 2: Integración API DIAN

### Tarea 4.5: Cliente API DIAN
**Tiempo:** 12 horas

Crear `backend/dian/api_client.py`:

```python
import requests
from requests.auth import HTTPBasicAuth

class DIANAPIClient:
    """Cliente para comunicación con API de DIAN"""

    def __init__(self, environment='habilitacion'):
        # URLs según ambiente
        self.urls = {
            'habilitacion': 'https://vpfe-hab.dian.gov.co/WcfDianCustomerServices.svc',
            'produccion': 'https://vpfe.dian.gov.co/WcfDianCustomerServices.svc'
        }
        self.base_url = self.urls[environment]

    def send_invoice(self, xml_content, test_id):
        """Enviar factura a DIAN"""

        # Endpoint de envío
        url = f"{self.base_url}/SendBillSync"

        # Preparar SOAP envelope
        soap_body = self._create_soap_envelope(xml_content, test_id)

        headers = {
            'Content-Type': 'text/xml; charset=utf-8',
            'SOAPAction': 'http://wcf.dian.colombia/SendBillSync'
        }

        # Enviar petición
        response = requests.post(url, data=soap_body, headers=headers, timeout=30)

        if response.status_code == 200:
            return self._parse_response(response.content)
        else:
            raise Exception(f"Error al enviar factura a DIAN: {response.status_code}")

    def get_status(self, track_id):
        """Consultar estado de factura en DIAN"""
        # Implementación
        pass

    def _create_soap_envelope(self, xml_content, test_id):
        """Crear envelope SOAP para DIAN"""
        # Implementación según especificación DIAN
        pass

    def _parse_response(self, xml_response):
        """Parsear respuesta de DIAN"""
        # Implementación
        pass
```

### Tarea 4.6: Integrar con Backend
**Tiempo:** 10 horas

Actualizar `backend/main.py` - agregar endpoints DIAN:

```python
from .dian import xml_generator, signature, qr_generator, api_client

@app.post("/api/invoices/{invoice_id}/generate-electronic")
async def generate_electronic_invoice(
    invoice_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.require_accountant)
):
    """Generar factura electrónica y enviar a DIAN"""

    # Obtener factura
    invoice = db.query(models.Invoice).filter(models.Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Factura no encontrada")

    # Obtener configuración
    config = db.query(models.Configuration).first()
    if not config.dian_technical_key:
        raise HTTPException(status_code=400, detail="Configuración DIAN incompleta")

    # Obtener datos
    sale = invoice.sale
    client = sale.client

    # Generar XML
    xml_gen = xml_generator.DIANXMLGenerator(config)
    xml_content = xml_gen.generate_invoice_xml(sale, client, config)

    # Firmar XML
    signer = signature.DIANSigner(
        cert_path=config.dian_cert_path,
        key_path=config.dian_key_path,
        password=config.dian_cert_password
    )
    signed_xml = signer.sign_xml(xml_content)

    # Generar CUFE
    cufe = xml_gen._generate_cufe(sale, config)

    # Generar QR
    qr_code = qr_generator.generate_qr_for_invoice(invoice, config)

    # Enviar a DIAN
    dian_client = api_client.DIANAPIClient(environment='habilitacion')
    dian_response = dian_client.send_invoice(signed_xml, config.dian_test_id)

    # Actualizar factura
    invoice.xml_content = signed_xml.decode()
    invoice.cufe = cufe
    invoice.qr_code = qr_code
    invoice.dian_response = dian_response['message']
    invoice.dian_status = dian_response['status']

    db.commit()

    return {
        "message": "Factura electrónica generada y enviada a DIAN",
        "cufe": cufe,
        "dian_status": dian_response['status']
    }
```

### Tarea 4.7: Generación de PDF con Representación Gráfica
**Tiempo:** 10 horas

Crear `backend/dian/pdf_generator.py`:

```python
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_RIGHT
from reportlab.lib import colors
import io
import base64

def generate_invoice_pdf(invoice, company, client, sale):
    """Generar PDF de representación gráfica de factura electrónica"""

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    elements = []
    styles = getSampleStyleSheet()

    # Título
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#2563eb'),
        spaceAfter=30,
        alignment=TA_CENTER
    )

    elements.append(Paragraph("FACTURA ELECTRÓNICA DE VENTA", title_style))
    elements.append(Spacer(1, 0.2*inch))

    # Información de la empresa
    company_data = [
        [company.company_name],
        [f"NIT: {company.company_nit}"],
        [company.company_address],
        [f"Tel: {company.company_phone}"],
        [f"Email: {company.company_email}"]
    ]

    # Número de factura y CUFE
    invoice_data = [
        ["Factura No:", invoice.invoice_number],
        ["Fecha:", invoice.issue_date.strftime("%Y-%m-%d %H:%M:%S")],
        ["CUFE:", invoice.cufe[:50] + "..."]  # Truncado para visualización
    ]

    # ... (código completo del PDF)

    # Código QR
    if invoice.qr_code:
        qr_image = Image(io.BytesIO(base64.b64decode(invoice.qr_code)), width=2*inch, height=2*inch)
        elements.append(qr_image)

    # Construir PDF
    doc.build(elements)
    pdf_content = buffer.getvalue()
    buffer.close()

    return pdf_content
```

## SEMANA 3: Testing y Certificación DIAN

### Tarea 4.8: Testing en Ambiente de Habilitación
**Tiempo:** 16 horas

1. Registrarse en ambiente de habilitación DIAN
2. Obtener certificado digital de pruebas
3. Configurar TestSetID
4. Enviar facturas de prueba
5. Validar respuestas
6. Corregir errores

### Tarea 4.9: Documentación DIAN
**Tiempo:** 6 horas

Crear `docs/DIAN_INTEGRATION.md`:
- Requisitos legales
- Proceso de certificación
- Configuración paso a paso
- Troubleshooting
- FAQs

---

# 📦 FASE 5: PRODUCCIÓN Y OPTIMIZACIÓN (1-2 SEMANAS - 80h)

## SEMANA 1: Hardening de Seguridad

### Tarea 5.1: Variables de Entorno
**Tiempo:** 4 horas

Crear `.env.example`:
```env
# Database
DATABASE_URL=sqlite:///./data/aej_sistema.db

# JWT
SECRET_KEY=CAMBIAR_EN_PRODUCCION_CON_CLAVE_SEGURA
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=480

# DIAN
DIAN_ENVIRONMENT=habilitacion
DIAN_TEST_ID=
DIAN_TECHNICAL_KEY=
DIAN_CERT_PATH=./certs/certificado.pem
DIAN_KEY_PATH=./certs/llave.pem
DIAN_CERT_PASSWORD=

# Frontend
VITE_API_URL=http://localhost:8000

# Empresa
COMPANY_NAME=AEJ Cosmetic & More
COMPANY_NIT=900123456-7
```

### Tarea 5.2: Rate Limiting
**Tiempo:** 4 horas

```bash
pip install slowapi
```

```python
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.post("/api/auth/login")
@limiter.limit("5/minute")  # Máximo 5 intentos por minuto
async def login(...):
    pass
```

### Tarea 5.3: HTTPS y Certificados
**Tiempo:** 6 horas

Configurar Let's Encrypt:
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d tudominio.com
```

### Tarea 5.4: Input Validation y Sanitization
**Tiempo:** 6 horas

Agregar validaciones adicionales con Pydantic:
```python
from pydantic import validator, constr

class ProductCreate(BaseModel):
    name: constr(strip_whitespace=True, min_length=1, max_length=200)

    @validator('sale_price')
    def price_must_be_greater_than_cost(cls, v, values):
        if 'cost_price' in values and v < values['cost_price']:
            raise ValueError('El precio de venta debe ser mayor al costo')
        return v
```

## SEMANA 2: Optimizaciones

### Tarea 5.5: Database Indexing
**Tiempo:** 4 horas

```python
# En models.py agregar índices
class Product(Base):
    __tablename__ = "products"
    __table_args__ = (
        Index('idx_product_sku', 'sku'),
        Index('idx_product_name', 'name'),
        Index('idx_product_category', 'category'),
    )
```

### Tarea 5.6: Caching
**Tiempo:** 8 horas

Instalar Redis:
```bash
pip install redis aioredis
```

```python
from aioredis import Redis
import json

redis = Redis.from_url("redis://localhost")

@app.get("/api/products")
async def get_products(...):
    # Intentar obtener de cache
    cache_key = f"products:{search}:{category}"
    cached = await redis.get(cache_key)

    if cached:
        return json.loads(cached)

    # Si no está en cache, obtener de DB
    products = db.query(models.Product).all()

    # Guardar en cache (5 minutos)
    await redis.setex(cache_key, 300, json.dumps([p.dict() for p in products]))

    return products
```

### Tarea 5.7: Frontend Performance
**Tiempo:** 8 horas

1. **Code Splitting:**
```typescript
// En App.tsx usar lazy loading
const Dashboard = lazy(() => import('./pages/Dashboard'));
const POS = lazy(() => import('./pages/POS'));
```

2. **Optimizar Imágenes:**
```bash
npm install vite-plugin-imagemin
```

3. **Lazy Loading de Componentes:**
```typescript
import { Suspense } from 'react';

<Suspense fallback={<Loading />}>
  <Dashboard />
</Suspense>
```

### Tarea 5.8: Database Migrations
**Tiempo:** 4 horas

Documentar proceso de migraciones:
```bash
# Crear migración
alembic revision --autogenerate -m "descripcion"

# Aplicar migración
alembic upgrade head

# Rollback
alembic downgrade -1
```

### Tarea 5.9: Monitoring y Alertas
**Tiempo:** 12 horas

Configurar Grafana + Prometheus:
1. Dashboard de métricas
2. Alertas de errores
3. Monitoreo de performance
4. Alertas de disco lleno

### Tarea 5.10: Documentación Final
**Tiempo:** 16 horas

Crear documentación completa:
1. `README.md` - Instalación y uso
2. `DEPLOYMENT.md` - Despliegue en producción
3. `API_DOCUMENTATION.md` - Documentación de endpoints
4. `USER_MANUAL.md` - Manual de usuario
5. `DIAN_INTEGRATION.md` - Integración con DIAN
6. `TROUBLESHOOTING.md` - Solución de problemas
7. `CHANGELOG.md` - Registro de cambios

### Tarea 5.11: Capacitación de Usuarios
**Tiempo:** 8 horas

1. Crear videos tutoriales
2. Documentar flujos de trabajo
3. FAQ para usuarios finales
4. Sesiones de capacitación

### Tarea 5.12: Plan de Mantenimiento
**Tiempo:** 4 horas

Documentar:
1. Backups automáticos
2. Actualizaciones de seguridad
3. Monitoreo continuo
4. Soporte técnico

---

# 📊 RESUMEN DE TIEMPO Y COSTOS

## Desglose por Fase

| Fase | Duración | Horas | Prioridad |
|------|----------|-------|-----------|
| **Fase 1: Backend Básico** | 2 semanas | 88h | 🔴 Crítica |
| **Fase 2: Testing** | 1 semana | 40h | 🟡 Alta |
| **Fase 3: Despliegue** | 1 semana | 40h | 🟡 Alta |
| **Fase 4: DIAN** | 2-3 semanas | 56h | 🔴 Crítica |
| **Fase 5: Producción** | 1-2 semanas | 80h | 🟢 Media |
| **TOTAL** | **7-9 semanas** | **304h** | |

## Hitos Importantes

```
Semana 1-2:  ✅ Backend funcional + DB real
Semana 3:    ✅ Tests automatizados
Semana 4:    ✅ Sistema desplegable
Semana 5-7:  ✅ Facturación DIAN completa
Semana 8-9:  ✅ Producción lista
```

## Checklist de Completitud

### MVP (Mínimo Viable)
- [ ] Base de datos SQLite funcionando
- [ ] API backend con todos los CRUD
- [ ] Autenticación JWT
- [ ] Frontend conectado a backend
- [ ] Tests básicos (>50% cobertura)
- [ ] Docker funcional
- [ ] Documentación básica

### Producción
- [ ] Facturación electrónica DIAN
- [ ] Tests completos (>70% cobertura)
- [ ] Seguridad hardened
- [ ] Monitoreo configurado
- [ ] Backups automáticos
- [ ] Documentación completa
- [ ] Capacitación usuarios

---

# 🚀 PLAN DE ACCIÓN INMEDIATO (PRÓXIMOS 3 DÍAS)

## DÍA 1 - Fundamentos (8h)

### Mañana (4h):
1. ✅ Actualizar `requirements.txt` con todas las dependencias
2. ✅ Crear `backend/database.py`
3. ✅ Crear `backend/models.py` (todos los modelos)
4. ✅ Instalar dependencias: `pip install -r backend/requirements.txt`

### Tarde (4h):
5. ✅ Crear `backend/schemas.py` (todos los schemas Pydantic)
6. ✅ Inicializar Alembic
7. ✅ Crear migración inicial
8. ✅ Ejecutar migración: `alembic upgrade head`

## DÍA 2 - Autenticación (8h)

### Mañana (4h):
1. ✅ Crear `backend/auth.py` (JWT completo)
2. ✅ Crear `backend/seed.py` (usuarios iniciales)
3. ✅ Actualizar `backend/main.py` con endpoints auth

### Tarde (4h):
4. ✅ Probar login manualmente: `curl -X POST http://localhost:8000/api/auth/login -d "username=superadmin&password=admin123"`
5. ✅ Crear `src/lib/api.ts` (cliente HTTP)
6. ✅ Actualizar Login.tsx para usar API real

## DÍA 3 - Primeros Endpoints (8h)

### Mañana (4h):
1. ✅ Implementar CRUD de Productos en backend
2. ✅ Probar con curl o Postman

### Tarde (4h):
3. ✅ Actualizar Products.tsx para usar API
4. ✅ Testing manual completo del flujo
5. ✅ Commit: "feat: integración productos con backend"

**Meta del Día 3:** Tener al menos un módulo (Productos) funcionando end-to-end con backend real.

---

# 📞 SOPORTE Y RECURSOS

## Documentación Oficial

### Backend:
- FastAPI: https://fastapi.tiangolo.com/
- SQLAlchemy: https://docs.sqlalchemy.org/
- Alembic: https://alembic.sqlalchemy.org/
- Pydantic: https://docs.pydantic.dev/

### DIAN:
- Portal DIAN: https://www.dian.gov.co/
- Resolución 000165/2023: [Buscar en DIAN]
- Ambiente de Habilitación: https://catalogo-vpfe-hab.dian.gov.co/

### Frontend:
- React: https://react.dev/
- TypeScript: https://www.typescriptlang.org/
- Vite: https://vitejs.dev/

## Comandos Útiles de Referencia

### Backend:
```bash
# Iniciar servidor desarrollo
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Tests
pytest --cov=backend

# Migraciones
alembic revision --autogenerate -m "mensaje"
alembic upgrade head
alembic downgrade -1

# Shell interactivo
python -i
>>> from backend import models, database
>>> db = database.SessionLocal()
>>> db.query(models.User).all()
```

### Frontend:
```bash
# Iniciar desarrollo
npm run dev

# Build producción
npm run build

# Preview build
npm run preview

# Tests
npm run test
```

### Docker:
```bash
# Build y start
docker-compose up --build -d

# Logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Restart
docker-compose restart

# Stop
docker-compose down

# Eliminar volúmenes
docker-compose down -v
```

---

# ✅ CRITERIOS DE ACEPTACIÓN

## MVP Completado Cuando:
1. ✅ Usuario puede hacer login con JWT
2. ✅ Crear, leer, actualizar, eliminar productos
3. ✅ Crear clientes con Ley 1581
4. ✅ Hacer venta y reducir stock automáticamente
5. ✅ Ver reportes básicos
6. ✅ Datos persisten en SQLite (no se pierden)
7. ✅ Tests básicos pasan (>50% cobertura)
8. ✅ Sistema corre con Docker

## Producción Lista Cuando:
1. ✅ Factura electrónica genera XML válido DIAN
2. ✅ XML se firma correctamente
3. ✅ Se envía a DIAN y recibe respuesta
4. ✅ Se genera PDF con QR
5. ✅ Tests completos pasan (>70% cobertura)
6. ✅ Sistema en HTTPS
7. ✅ Backups automáticos funcionan
8. ✅ Monitoreo configurado
9. ✅ Documentación completa
10. ✅ Usuarios capacitados

---

# 🎯 PRÓXIMOS PASOS

1. **Revisar este documento** completamente
2. **Aprobar el plan** o solicitar ajustes
3. **Comenzar DÍA 1** del plan de acción inmediato
4. **Seguir el roadmap** fase por fase
5. **Hacer commits frecuentes** con mensajes descriptivos
6. **Documentar** mientras desarrollas
7. **Testing continuo** en cada fase

---

**¡Éxito en la implementación del proyecto! 🚀**

Si necesitas ayuda en cualquier paso, tengo conocimiento detallado de cada tarea y puedo asistirte con código específico, debugging, o aclaraciones.
