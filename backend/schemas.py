from pydantic import BaseModel, EmailStr, validator
from typing import Optional, List
from datetime import datetime
from models import UserRole, UserLocation, ProductCategory, SaleStatus, InvoiceStatus, MovementType

# User Schemas
class UserBase(BaseModel):
    username: str
    email: EmailStr
    nombre_completo: str
    rol: UserRole
    ubicacion: UserLocation
    is_active: bool = True

class UserCreate(UserBase):
    password: str
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 6:
            raise ValueError('Password must be at least 6 characters')
        return v

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    nombre_completo: Optional[str] = None
    rol: Optional[UserRole] = None
    ubicacion: Optional[UserLocation] = None
    is_active: Optional[bool] = None

class User(UserBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Auth Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class LoginRequest(BaseModel):
    username: str
    password: str

# Product Schemas
class ProductBase(BaseModel):
    codigo: str
    nombre: str
    descripcion: Optional[str] = None
    categoria: ProductCategory
    marca: Optional[str] = None
    precio_compra: float
    precio_venta: float
    stock_actual: int = 0
    stock_minimo: int = 5
    is_active: bool = True

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    codigo: Optional[str] = None
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    categoria: Optional[ProductCategory] = None
    marca: Optional[str] = None
    precio_compra: Optional[float] = None
    precio_venta: Optional[float] = None
    stock_actual: Optional[int] = None
    stock_minimo: Optional[int] = None
    is_active: Optional[bool] = None

class Product(ProductBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Client Schemas
class ClientBase(BaseModel):
    documento: str
    tipo_documento: str
    nombre_completo: str
    email: Optional[EmailStr] = None
    telefono: Optional[str] = None
    direccion: Optional[str] = None
    ciudad: Optional[str] = None
    departamento: Optional[str] = None
    fecha_nacimiento: Optional[datetime] = None
    genero: Optional[str] = None
    acepta_marketing: bool = False
    acepta_datos: bool = True
    is_active: bool = True

class ClientCreate(ClientBase):
    pass

class ClientUpdate(BaseModel):
    documento: Optional[str] = None
    tipo_documento: Optional[str] = None
    nombre_completo: Optional[str] = None
    email: Optional[EmailStr] = None
    telefono: Optional[str] = None
    direccion: Optional[str] = None
    ciudad: Optional[str] = None
    departamento: Optional[str] = None
    fecha_nacimiento: Optional[datetime] = None
    genero: Optional[str] = None
    acepta_marketing: Optional[bool] = None
    acepta_datos: Optional[bool] = None
    is_active: Optional[bool] = None

class Client(ClientBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Supplier Schemas
class SupplierBase(BaseModel):
    nit: str
    razon_social: str
    nombre_comercial: Optional[str] = None
    email: Optional[EmailStr] = None
    telefono: Optional[str] = None
    direccion: Optional[str] = None
    ciudad: Optional[str] = None
    contacto_nombre: Optional[str] = None
    contacto_telefono: Optional[str] = None
    contacto_email: Optional[EmailStr] = None
    calificacion: float = 0.0
    is_active: bool = True

class SupplierCreate(SupplierBase):
    pass

class SupplierUpdate(BaseModel):
    nit: Optional[str] = None
    razon_social: Optional[str] = None
    nombre_comercial: Optional[str] = None
    email: Optional[EmailStr] = None
    telefono: Optional[str] = None
    direccion: Optional[str] = None
    ciudad: Optional[str] = None
    contacto_nombre: Optional[str] = None
    contacto_telefono: Optional[str] = None
    contacto_email: Optional[EmailStr] = None
    calificacion: Optional[float] = None
    is_active: Optional[bool] = None

class Supplier(SupplierBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Sale Schemas
class SaleItemBase(BaseModel):
    product_id: int
    cantidad: int
    precio_unitario: float
    descuento: float = 0.0

class SaleItemCreate(SaleItemBase):
    pass

class SaleItem(SaleItemBase):
    id: int
    subtotal: float
    product: Product
    
    class Config:
        from_attributes = True

class SaleBase(BaseModel):
    client_id: int
    subtotal: float
    descuento: float = 0.0
    impuestos: float = 0.0
    total: float
    metodo_pago: str
    notas: Optional[str] = None

class SaleCreate(SaleBase):
    items: List[SaleItemCreate]

class SaleUpdate(BaseModel):
    status: Optional[SaleStatus] = None
    notas: Optional[str] = None

class Sale(SaleBase):
    id: int
    numero_venta: str
    user_id: int
    status: SaleStatus
    created_at: datetime
    client: Client
    user: User
    items: List[SaleItem]
    
    class Config:
        from_attributes = True

# Inventory Movement Schemas
class InventoryMovementBase(BaseModel):
    product_id: int
    tipo: MovementType
    cantidad: int
    motivo: str
    referencia: Optional[str] = None

class InventoryMovementCreate(InventoryMovementBase):
    pass

class InventoryMovement(InventoryMovementBase):
    id: int
    user_id: int
    stock_anterior: int
    stock_nuevo: int
    created_at: datetime
    product: Product
    user: User
    
    class Config:
        from_attributes = True

# Configuration Schemas
class ConfigurationBase(BaseModel):
    key: str
    value: str
    description: Optional[str] = None

class ConfigurationCreate(ConfigurationBase):
    pass

class ConfigurationUpdate(BaseModel):
    value: str
    description: Optional[str] = None

class Configuration(ConfigurationBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Dashboard Schemas
class DashboardMetrics(BaseModel):
    total_ventas_hoy: float
    total_productos: int
    total_clientes: int
    stock_bajo: int
    ventas_mes: float
    productos_mas_vendidos: List[dict]
    alertas: List[dict]