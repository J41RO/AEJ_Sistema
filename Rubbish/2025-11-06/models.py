from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from backend.database import Base
import enum

# Enums
class UserRole(str, enum.Enum):
    SUPERUSUARIO = "SUPERUSUARIO"
    ADMIN = "ADMIN"
    VENDEDOR = "VENDEDOR"
    ALMACEN = "ALMACEN"
    CONTADOR = "CONTADOR"

class UserLocation(str, enum.Enum):
    EEUU = "EEUU"
    COLOMBIA = "COLOMBIA"

class ProductCategory(str, enum.Enum):
    MAQUILLAJE = "MAQUILLAJE"
    CUIDADO_PIEL = "CUIDADO_PIEL"
    FRAGANCIAS = "FRAGANCIAS"
    ACCESORIOS = "ACCESORIOS"

class SaleStatus(str, enum.Enum):
    PENDIENTE = "PENDIENTE"
    COMPLETADA = "COMPLETADA"
    CANCELADA = "CANCELADA"

class InvoiceStatus(str, enum.Enum):
    BORRADOR = "BORRADOR"
    ENVIADA = "ENVIADA"
    PAGADA = "PAGADA"
    ANULADA = "ANULADA"

class MovementType(str, enum.Enum):
    ENTRADA = "ENTRADA"
    SALIDA = "SALIDA"
    AJUSTE = "AJUSTE"

# Models
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    nombre_completo = Column(String(100), nullable=False)
    password_hash = Column(String(255), nullable=False)
    rol = Column(Enum(UserRole), nullable=False)
    ubicacion = Column(Enum(UserLocation), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    sales = relationship("Sale", back_populates="user")
    inventory_movements = relationship("InventoryMovement", back_populates="user")

class Product(Base):
    __tablename__ = "products"
    
    id = Column(Integer, primary_key=True, index=True)
    codigo = Column(String(50), unique=True, index=True, nullable=False)
    nombre = Column(String(200), nullable=False)
    descripcion = Column(Text)
    categoria = Column(Enum(ProductCategory), nullable=False)
    marca = Column(String(100))
    precio_compra = Column(Float, nullable=False)
    precio_venta = Column(Float, nullable=False)
    stock_actual = Column(Integer, default=0)
    stock_minimo = Column(Integer, default=5)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    sale_items = relationship("SaleItem", back_populates="product")
    inventory_movements = relationship("InventoryMovement", back_populates="product")
    supplier_products = relationship("SupplierProduct", back_populates="product")

class Client(Base):
    __tablename__ = "clients"
    
    id = Column(Integer, primary_key=True, index=True)
    documento = Column(String(20), unique=True, index=True, nullable=False)
    tipo_documento = Column(String(10), nullable=False)  # CC, NIT, CE, etc.
    nombre_completo = Column(String(200), nullable=False)
    email = Column(String(100))
    telefono = Column(String(20))
    direccion = Column(String(200))
    ciudad = Column(String(100))
    departamento = Column(String(100))
    fecha_nacimiento = Column(DateTime)
    genero = Column(String(10))
    acepta_marketing = Column(Boolean, default=False)
    acepta_datos = Column(Boolean, default=True)  # Ley 1581
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    sales = relationship("Sale", back_populates="client")

class Supplier(Base):
    __tablename__ = "suppliers"
    
    id = Column(Integer, primary_key=True, index=True)
    nit = Column(String(20), unique=True, index=True, nullable=False)
    razon_social = Column(String(200), nullable=False)
    nombre_comercial = Column(String(200))
    email = Column(String(100))
    telefono = Column(String(20))
    direccion = Column(String(200))
    ciudad = Column(String(100))
    contacto_nombre = Column(String(100))
    contacto_telefono = Column(String(20))
    contacto_email = Column(String(100))
    calificacion = Column(Float, default=0.0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    supplier_products = relationship("SupplierProduct", back_populates="supplier")

class SupplierProduct(Base):
    __tablename__ = "supplier_products"
    
    id = Column(Integer, primary_key=True, index=True)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    precio_compra = Column(Float, nullable=False)
    tiempo_entrega = Column(Integer)  # días
    cantidad_minima = Column(Integer, default=1)
    is_active = Column(Boolean, default=True)
    
    # Relationships
    supplier = relationship("Supplier", back_populates="supplier_products")
    product = relationship("Product", back_populates="supplier_products")

class Sale(Base):
    __tablename__ = "sales"
    
    id = Column(Integer, primary_key=True, index=True)
    numero_venta = Column(String(20), unique=True, index=True, nullable=False)
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    subtotal = Column(Float, nullable=False)
    descuento = Column(Float, default=0.0)
    impuestos = Column(Float, default=0.0)
    total = Column(Float, nullable=False)
    metodo_pago = Column(String(50), nullable=False)
    status = Column(Enum(SaleStatus), default=SaleStatus.PENDIENTE)
    notas = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    client = relationship("Client", back_populates="sales")
    user = relationship("User", back_populates="sales")
    items = relationship("SaleItem", back_populates="sale")

class SaleItem(Base):
    __tablename__ = "sale_items"
    
    id = Column(Integer, primary_key=True, index=True)
    sale_id = Column(Integer, ForeignKey("sales.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    cantidad = Column(Integer, nullable=False)
    precio_unitario = Column(Float, nullable=False)
    descuento = Column(Float, default=0.0)
    subtotal = Column(Float, nullable=False)
    
    # Relationships
    sale = relationship("Sale", back_populates="items")
    product = relationship("Product", back_populates="sale_items")

class Invoice(Base):
    __tablename__ = "invoices"
    
    id = Column(Integer, primary_key=True, index=True)
    numero_factura = Column(String(20), unique=True, index=True, nullable=False)
    sale_id = Column(Integer, ForeignKey("sales.id"), nullable=False)
    fecha_emision = Column(DateTime(timezone=True), server_default=func.now())
    fecha_vencimiento = Column(DateTime)
    subtotal = Column(Float, nullable=False)
    impuestos = Column(Float, nullable=False)
    total = Column(Float, nullable=False)
    status = Column(Enum(InvoiceStatus), default=InvoiceStatus.BORRADOR)
    cufe = Column(String(100))  # DIAN
    qr_code = Column(Text)
    xml_content = Column(Text)
    
    # Relationships
    sale = relationship("Sale")

class InventoryMovement(Base):
    __tablename__ = "inventory_movements"
    
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    tipo = Column(Enum(MovementType), nullable=False)
    cantidad = Column(Integer, nullable=False)
    stock_anterior = Column(Integer, nullable=False)
    stock_nuevo = Column(Integer, nullable=False)
    motivo = Column(String(200), nullable=False)
    referencia = Column(String(100))  # Número de venta, compra, etc.
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    product = relationship("Product", back_populates="inventory_movements")
    user = relationship("User", back_populates="inventory_movements")

class Configuration(Base):
    __tablename__ = "configurations"
    
    id = Column(Integer, primary_key=True, index=True)
    key = Column(String(100), unique=True, index=True, nullable=False)
    value = Column(Text, nullable=False)
    description = Column(String(200))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())