from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import local modules
from database import get_db, create_tables
from models import (
    User as UserModel, Product as ProductModel, Client as ClientModel,
    Sale as SaleModel, SaleItem as SaleItemModel
)
from schemas import (
    User as UserSchema, UserCreate, UserUpdate,
    Product as ProductSchema, ProductCreate, ProductUpdate,
    Client as ClientSchema, ClientCreate, ClientUpdate,
    Sale as SaleSchema, SaleCreate, SaleItem as SaleItemSchema,
    Token, LoginRequest, DashboardMetrics
)
from auth import *

# Create FastAPI app
app = FastAPI(
    title="AEJ POS Backend API",
    description="Backend API para Sistema POS AEJ Cosmetic & More",
    version="1.0.0"
)

# Configure CORS - Dynamic origins from environment variable
allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "")
if allowed_origins_env:
    # Production: use origins from environment variable
    allowed_origins = [origin.strip() for origin in allowed_origins_env.split(",")]
else:
    # Development: default localhost origins
    allowed_origins = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://192.168.1.137:5173",
        "http://192.168.1.137:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000"
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create tables and seed data on startup
@app.on_event("startup")
def startup_event():
    from database import SessionLocal

    # Create tables
    create_tables()

    # Seed database with initial data
    print("🌱 Checking database seed...")
    db = SessionLocal()
    try:
        # Check if users exist
        from models import User as UserModel
        user_count = db.query(UserModel).count()

        if user_count == 0:
            print("📊 Database is empty, running seed...")
            # Import and run seed functions
            from seed import create_initial_users, create_initial_products, create_initial_clients, create_initial_suppliers, create_initial_configuration

            create_initial_users(db)
            create_initial_products(db)
            create_initial_clients(db)
            create_initial_suppliers(db)
            create_initial_configuration(db)

            print("✅ Database seeded successfully!")
        else:
            print(f"✓ Database already has {user_count} users, skipping seed")
    except Exception as e:
        print(f"❌ Error seeding database: {e}")
    finally:
        db.close()

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "service": "AEJ POS Backend",
        "version": "1.0.0",
        "network": "accessible"
    }

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "AEJ POS Backend API",
        "status": "running",
        "docs": "/docs",
        "network_ready": True
    }

@app.get("/api/status")
async def api_status():
    """API status endpoint"""
    return {
        "api_status": "online",
        "database": "connected",
        "network": "192.168.1.137:8000",
        "timestamp": datetime.now().isoformat()
    }

# Authentication endpoints
@app.post("/auth/login", response_model=Token)
async def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    """Login endpoint"""
    user = authenticate_user(db, login_data.username, login_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/auth/me", response_model=UserSchema)
async def read_users_me(current_user: UserModel = Depends(get_current_active_user)):
    """Get current user info"""
    return current_user

# User endpoints
@app.get("/users", response_model=List[UserSchema])
async def get_users(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(require_superuser)
):
    """Get all users (superuser only)"""
    users = db.query(UserModel).offset(skip).limit(limit).all()
    return users

@app.post("/users", response_model=UserSchema)
async def create_user(
    user: UserCreate, 
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(require_superuser)
):
    """Create new user (superuser only)"""
    # Check if username already exists
    db_user = db.query(UserModel).filter(UserModel.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    # Check if email already exists
    db_user = db.query(UserModel).filter(UserModel.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new user
    hashed_password = get_password_hash(user.password)
    db_user = UserModel(
        username=user.username,
        email=user.email,
        nombre_completo=user.nombre_completo,
        password_hash=hashed_password,
        rol=user.rol,
        ubicacion=user.ubicacion,
        is_active=user.is_active
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# Product endpoints
@app.get("/products", response_model=List[ProductSchema])
async def get_products(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user)
):
    """Get all products"""
    products = db.query(ProductModel).filter(Product.is_active == True).offset(skip).limit(limit).all()
    return products

@app.post("/products", response_model=ProductSchema)
async def create_product(
    product: ProductCreate, 
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(require_admin_or_super)
):
    """Create new product"""
    # Check if code already exists
    db_product = db.query(ProductModel).filter(Product.codigo == product.codigo).first()
    if db_product:
        raise HTTPException(status_code=400, detail="Product code already exists")
    
    db_product = Product(**product.dict())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

@app.get("/products/{product_id}", response_model=ProductSchema)
async def get_product(
    product_id: int, 
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user)
):
    """Get product by ID"""
    product = db.query(ProductModel).filter(Product.id == product_id).first()
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@app.put("/products/{product_id}", response_model=ProductSchema)
async def update_product(
    product_id: int, 
    product: ProductUpdate, 
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(require_admin_or_super)
):
    """Update product"""
    db_product = db.query(ProductModel).filter(Product.id == product_id).first()
    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    
    update_data = product.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_product, field, value)
    
    db.commit()
    db.refresh(db_product)
    return db_product

# Client endpoints
@app.get("/clients", response_model=List[ClientSchema])
async def get_clients(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user)
):
    """Get all clients"""
    clients = db.query(ClientModel).filter(Client.is_active == True).offset(skip).limit(limit).all()
    return clients

@app.post("/clients", response_model=ClientSchema)
async def create_client(
    client: ClientCreate, 
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user)
):
    """Create new client"""
    # Check if document already exists
    db_client = db.query(ClientModel).filter(Client.documento == client.documento).first()
    if db_client:
        raise HTTPException(status_code=400, detail="Document already exists")
    
    db_client = Client(**client.dict())
    db.add(db_client)
    db.commit()
    db.refresh(db_client)
    return db_client

# Sale endpoints
@app.get("/sales", response_model=List[SaleSchema])
async def get_sales(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user)
):
    """Get all sales"""
    sales = db.query(SaleModel).offset(skip).limit(limit).all()
    return sales

@app.post("/sales", response_model=SaleSchema)
async def create_sale(
    sale: SaleCreate, 
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user)
):
    """Create new sale"""
    # Generate sale number
    last_sale = db.query(SaleModel).order_by(Sale.id.desc()).first()
    sale_number = f"VTA-{(last_sale.id + 1 if last_sale else 1):06d}"
    
    # Create sale
    db_sale = Sale(
        numero_venta=sale_number,
        client_id=sale.client_id,
        user_id=current_user.id,
        subtotal=sale.subtotal,
        descuento=sale.descuento,
        impuestos=sale.impuestos,
        total=sale.total,
        metodo_pago=sale.metodo_pago,
        notas=sale.notas,
        status=SaleStatus.COMPLETADA
    )
    db.add(db_sale)
    db.flush()  # Get the sale ID
    
    # Create sale items and update stock
    for item in sale.items:
        # Check product exists and has enough stock
        product = db.query(ProductModel).filter(Product.id == item.product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")
        
        if product.stock_actual < item.cantidad:
            raise HTTPException(status_code=400, detail=f"Insufficient stock for product {product.nombre}")
        
        # Create sale item
        subtotal = item.cantidad * item.precio_unitario - item.descuento
        db_item = SaleItem(
            sale_id=db_sale.id,
            product_id=item.product_id,
            cantidad=item.cantidad,
            precio_unitario=item.precio_unitario,
            descuento=item.descuento,
            subtotal=subtotal
        )
        db.add(db_item)
        
        # Update product stock
        old_stock = product.stock_actual
        product.stock_actual -= item.cantidad
        
        # Create inventory movement
        movement = InventoryMovement(
            product_id=product.id,
            user_id=current_user.id,
            tipo=MovementType.SALIDA,
            cantidad=item.cantidad,
            stock_anterior=old_stock,
            stock_nuevo=product.stock_actual,
            motivo=f"Venta {sale_number}",
            referencia=sale_number
        )
        db.add(movement)
    
    db.commit()
    db.refresh(db_sale)
    return db_sale

# Dashboard endpoint
@app.get("/dashboard/metrics", response_model=DashboardMetrics)
async def get_dashboard_metrics(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user)
):
    """Get dashboard metrics"""
    today = datetime.now().date()
    month_start = today.replace(day=1)
    
    # Total sales today
    total_ventas_hoy = db.query(func.sum(Sale.total)).filter(
        func.date(Sale.created_at) == today,
        Sale.status == SaleStatus.COMPLETADA
    ).scalar() or 0
    
    # Total products
    total_productos = db.query(ProductModel).filter(Product.is_active == True).count()
    
    # Total clients
    total_clientes = db.query(ClientModel).filter(Client.is_active == True).count()
    
    # Low stock products
    stock_bajo = db.query(ProductModel).filter(
        Product.stock_actual <= Product.stock_minimo,
        Product.is_active == True
    ).count()
    
    # Sales this month
    ventas_mes = db.query(func.sum(Sale.total)).filter(
        Sale.created_at >= month_start,
        Sale.status == SaleStatus.COMPLETADA
    ).scalar() or 0
    
    # Most sold products (placeholder)
    productos_mas_vendidos = []
    
    # Alerts (low stock)
    alertas = []
    low_stock_products = db.query(ProductModel).filter(
        Product.stock_actual <= Product.stock_minimo,
        Product.is_active == True
    ).limit(5).all()
    
    for product in low_stock_products:
        alertas.append({
            "tipo": "stock_bajo",
            "mensaje": f"Stock bajo: {product.nombre} ({product.stock_actual} unidades)",
            "producto": product.nombre,
            "stock": product.stock_actual
        })
    
    return DashboardMetrics(
        total_ventas_hoy=total_ventas_hoy,
        total_productos=total_productos,
        total_clientes=total_clientes,
        stock_bajo=stock_bajo,
        ventas_mes=ventas_mes,
        productos_mas_vendidos=productos_mas_vendidos,
        alertas=alertas
    )

if __name__ == "__main__":
    import uvicorn
    print("🚀 Iniciando AEJ POS Backend...")
    print("📡 Backend disponible en:")
    print("   - Local: http://localhost:8000")
    print("   - Red: http://192.168.1.137:8000")
    print("📚 Documentación API en: http://192.168.1.137:8000/docs")
    print("❤️ Health check en: http://192.168.1.137:8000/health")
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",  # Bind to all interfaces for network access
        port=8000,
        reload=True,
        log_level="info"
    )