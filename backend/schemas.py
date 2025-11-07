from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from models import UserRole, UserLocation, ProductCategory, SaleStatus, PurchaseInvoiceStatus

# Auth schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class LoginRequest(BaseModel):
    username: str
    password: str

# User schemas
class UserBase(BaseModel):
    username: str
    email: EmailStr
    nombre_completo: str
    rol: UserRole
    ubicacion: UserLocation

class UserCreate(UserBase):
    password: str
    is_active: bool = True

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    nombre_completo: Optional[str] = None
    rol: Optional[UserRole] = None
    ubicacion: Optional[UserLocation] = None
    is_active: Optional[bool] = None

class User(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Product schemas
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

class ProductCreate(ProductBase):
    is_active: bool = True

class ProductUpdate(BaseModel):
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
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Client schemas
class ClientBase(BaseModel):
    documento: str
    tipo_documento: str
    nombre_completo: str
    email: Optional[EmailStr] = None
    telefono: Optional[str] = None
    direccion: Optional[str] = None
    ciudad: Optional[str] = None
    departamento: Optional[str] = None
    acepta_marketing: bool = False
    acepta_datos: bool = True

class ClientCreate(ClientBase):
    is_active: bool = True

class ClientUpdate(BaseModel):
    nombre_completo: Optional[str] = None
    email: Optional[EmailStr] = None
    telefono: Optional[str] = None
    direccion: Optional[str] = None
    ciudad: Optional[str] = None
    departamento: Optional[str] = None
    acepta_marketing: Optional[bool] = None
    acepta_datos: Optional[bool] = None
    is_active: Optional[bool] = None

class Client(ClientBase):
    id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Supplier schemas
class SupplierBase(BaseModel):
    nit: str
    razon_social: str
    nombre_comercial: Optional[str] = None
    email: Optional[EmailStr] = None
    telefono: Optional[str] = None
    direccion: Optional[str] = None
    ciudad: Optional[str] = None

class SupplierCreate(SupplierBase):
    is_active: bool = True

class Supplier(SupplierBase):
    id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Sale schemas
class SaleItemBase(BaseModel):
    product_id: int
    cantidad: int
    precio_unitario: float
    descuento: float = 0.0

class SaleItemCreate(SaleItemBase):
    pass

class SaleItem(SaleItemBase):
    id: int
    sale_id: int
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

# Purchase Invoice schemas
class PurchaseInvoiceItemBase(BaseModel):
    product_id: int
    cantidad: int
    precio_unitario: float
    subtotal: float

class PurchaseInvoiceItemCreate(PurchaseInvoiceItemBase):
    pass

class PurchaseInvoiceItem(PurchaseInvoiceItemBase):
    id: int
    purchase_invoice_id: int
    product: Product
    
    class Config:
        from_attributes = True

class PurchaseInvoiceBase(BaseModel):
    numero_factura: str
    supplier_id: int
    fecha_emision: datetime
    cufe: Optional[str] = None
    fecha_aceptacion: Optional[datetime] = None
    firma_digital: Optional[str] = None
    subtotal: float
    iva: float
    total: float
    notas: Optional[str] = None

class PurchaseInvoiceCreate(PurchaseInvoiceBase):
    items: List[PurchaseInvoiceItemCreate]

class PurchaseInvoice(PurchaseInvoiceBase):
    id: int
    archivo_pdf: Optional[str] = None
    status: PurchaseInvoiceStatus
    created_at: datetime
    supplier: Supplier
    items: List[PurchaseInvoiceItem]
    
    class Config:
        from_attributes = True

# Invoice data extraction schema
class InvoiceDataExtraction(BaseModel):
    proveedor: dict
    factura: dict
    productos: List[dict]
    totales: dict

# Dashboard schemas
class DashboardAlert(BaseModel):
    tipo: str
    mensaje: str
    producto: Optional[str] = None
    stock: Optional[int] = None

class DashboardMetrics(BaseModel):
    total_ventas_hoy: float
    total_productos: int
    total_clientes: int
    stock_bajo: int
    ventas_mes: float
    productos_mas_vendidos: List[Product]
    alertas: List[DashboardAlert]