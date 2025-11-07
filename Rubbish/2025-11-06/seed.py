from sqlalchemy.orm import Session
from backend.database import SessionLocal, create_tables
from backend.models import User, Product, Client, Supplier, Configuration
from backend.auth import get_password_hash
from datetime import datetime

def create_initial_users(db: Session):
    """Create initial users"""
    users_data = [
        {
            "username": "superadmin",
            "email": "superadmin@aejcosmetic.com",
            "nombre_completo": "Super Administrador",
            "password": "admin123",
            "rol": "SUPERUSUARIO",
            "ubicacion": "COLOMBIA"
        },
        {
            "username": "admin",
            "email": "admin@aejcosmetic.com", 
            "nombre_completo": "Administrador General",
            "password": "admin123",
            "rol": "ADMIN",
            "ubicacion": "COLOMBIA"
        },
        {
            "username": "vendedor1",
            "email": "vendedor1@aejcosmetic.com",
            "nombre_completo": "María González",
            "password": "vendedor123",
            "rol": "VENDEDOR", 
            "ubicacion": "COLOMBIA"
        },
        {
            "username": "almacen1",
            "email": "almacen1@aejcosmetic.com",
            "nombre_completo": "Carlos Rodríguez",
            "password": "almacen123",
            "rol": "ALMACEN",
            "ubicacion": "COLOMBIA"
        },
        {
            "username": "contador1",
            "email": "contador1@aejcosmetic.com",
            "nombre_completo": "Ana López",
            "password": "contador123",
            "rol": "CONTADOR",
            "ubicacion": "COLOMBIA"
        }
    ]
    
    for user_data in users_data:
        # Check if user already exists
        existing_user = db.query(User).filter(User.username == user_data["username"]).first()
        if not existing_user:
            user = User(
                username=user_data["username"],
                email=user_data["email"],
                nombre_completo=user_data["nombre_completo"],
                password_hash=get_password_hash(user_data["password"]),
                rol=user_data["rol"],
                ubicacion=user_data["ubicacion"]
            )
            db.add(user)
    
    db.commit()

def create_initial_products(db: Session):
    """Create initial products"""
    products_data = [
        {
            "codigo": "MAC001",
            "nombre": "Base Líquida MAC Studio Fix",
            "descripcion": "Base de maquillaje líquida de larga duración",
            "categoria": "MAQUILLAJE",
            "marca": "MAC",
            "precio_compra": 85000,
            "precio_venta": 120000,
            "stock_actual": 25,
            "stock_minimo": 5
        },
        {
            "codigo": "EST002", 
            "nombre": "Sérum Vitamina C Estée Lauder",
            "descripcion": "Sérum antioxidante con vitamina C",
            "categoria": "CUIDADO_PIEL",
            "marca": "Estée Lauder",
            "precio_compra": 150000,
            "precio_venta": 210000,
            "stock_actual": 15,
            "stock_minimo": 3
        },
        {
            "codigo": "CHA003",
            "nombre": "Perfume Chanel No. 5",
            "descripcion": "Fragancia clásica femenina",
            "categoria": "FRAGANCIAS", 
            "marca": "Chanel",
            "precio_compra": 280000,
            "precio_venta": 390000,
            "stock_actual": 8,
            "stock_minimo": 2
        },
        {
            "codigo": "BRU004",
            "nombre": "Set Brochas Profesionales",
            "descripcion": "Kit de 12 brochas para maquillaje profesional",
            "categoria": "ACCESORIOS",
            "marca": "Beauty Tools",
            "precio_compra": 45000,
            "precio_venta": 75000,
            "stock_actual": 30,
            "stock_minimo": 8
        },
        {
            "codigo": "NYX005",
            "nombre": "Paleta de Sombras NYX Ultimate",
            "descripcion": "Paleta con 16 sombras mate y shimmer",
            "categoria": "MAQUILLAJE",
            "marca": "NYX",
            "precio_compra": 55000,
            "precio_venta": 85000,
            "stock_actual": 20,
            "stock_minimo": 5
        }
    ]
    
    for product_data in products_data:
        # Check if product already exists
        existing_product = db.query(Product).filter(Product.codigo == product_data["codigo"]).first()
        if not existing_product:
            product = Product(**product_data)
            db.add(product)
    
    db.commit()

def create_initial_clients(db: Session):
    """Create initial clients"""
    clients_data = [
        {
            "documento": "1234567890",
            "tipo_documento": "CC",
            "nombre_completo": "Laura Martínez",
            "email": "laura.martinez@email.com",
            "telefono": "3001234567",
            "direccion": "Calle 123 #45-67",
            "ciudad": "Bogotá",
            "departamento": "Cundinamarca",
            "genero": "Femenino",
            "acepta_marketing": True,
            "acepta_datos": True
        },
        {
            "documento": "9876543210", 
            "tipo_documento": "CC",
            "nombre_completo": "Sofía García",
            "email": "sofia.garcia@email.com",
            "telefono": "3109876543",
            "direccion": "Carrera 45 #123-89",
            "ciudad": "Medellín",
            "departamento": "Antioquia",
            "genero": "Femenino",
            "acepta_marketing": False,
            "acepta_datos": True
        },
        {
            "documento": "5555666677",
            "tipo_documento": "CC", 
            "nombre_completo": "Isabella Rodríguez",
            "email": "isabella.rodriguez@email.com",
            "telefono": "3155556666",
            "direccion": "Avenida 80 #25-30",
            "ciudad": "Cali",
            "departamento": "Valle del Cauca",
            "genero": "Femenino",
            "acepta_marketing": True,
            "acepta_datos": True
        }
    ]
    
    for client_data in clients_data:
        # Check if client already exists
        existing_client = db.query(Client).filter(Client.documento == client_data["documento"]).first()
        if not existing_client:
            client = Client(**client_data)
            db.add(client)
    
    db.commit()

def create_initial_suppliers(db: Session):
    """Create initial suppliers"""
    suppliers_data = [
        {
            "nit": "900123456-1",
            "razon_social": "Distribuidora Beauty S.A.S.",
            "nombre_comercial": "Beauty Dist",
            "email": "ventas@beautydist.com",
            "telefono": "6013456789",
            "direccion": "Zona Industrial Bogotá",
            "ciudad": "Bogotá",
            "contacto_nombre": "Pedro Jiménez",
            "contacto_telefono": "3201234567",
            "contacto_email": "pedro.jimenez@beautydist.com",
            "calificacion": 4.5
        },
        {
            "nit": "800987654-2",
            "razon_social": "Cosméticos Internacionales Ltda.",
            "nombre_comercial": "Cosmo Int",
            "email": "info@cosmoint.com",
            "telefono": "6047654321", 
            "direccion": "Centro Comercial Premium",
            "ciudad": "Medellín",
            "contacto_nombre": "Ana Herrera",
            "contacto_telefono": "3109876543",
            "contacto_email": "ana.herrera@cosmoint.com",
            "calificacion": 4.8
        }
    ]
    
    for supplier_data in suppliers_data:
        # Check if supplier already exists
        existing_supplier = db.query(Supplier).filter(Supplier.nit == supplier_data["nit"]).first()
        if not existing_supplier:
            supplier = Supplier(**supplier_data)
            db.add(supplier)
    
    db.commit()

def create_initial_configurations(db: Session):
    """Create initial system configurations"""
    configs_data = [
        {
            "key": "company_name",
            "value": "AEJ Cosmetic & More S.A.S.",
            "description": "Nombre de la empresa"
        },
        {
            "key": "company_nit", 
            "value": "900123456-1",
            "description": "NIT de la empresa"
        },
        {
            "key": "company_address",
            "value": "Calle 123 #45-67, Bogotá D.C.",
            "description": "Dirección de la empresa"
        },
        {
            "key": "company_phone",
            "value": "+57 1 234 5678",
            "description": "Teléfono de la empresa"
        },
        {
            "key": "company_email",
            "value": "info@aejcosmetic.com",
            "description": "Email de la empresa"
        },
        {
            "key": "tax_iva",
            "value": "19",
            "description": "Porcentaje de IVA"
        },
        {
            "key": "currency",
            "value": "COP",
            "description": "Moneda del sistema"
        },
        {
            "key": "invoice_prefix",
            "value": "AEJ-",
            "description": "Prefijo para facturas"
        }
    ]
    
    for config_data in configs_data:
        # Check if config already exists
        existing_config = db.query(Configuration).filter(Configuration.key == config_data["key"]).first()
        if not existing_config:
            config = Configuration(**config_data)
            db.add(config)
    
    db.commit()

def seed_database():
    """Seed the database with initial data"""
    # Create tables
    create_tables()
    
    # Create session
    db = SessionLocal()
    
    try:
        print("🌱 Seeding database...")
        
        # Create initial data
        create_initial_users(db)
        print("✅ Users created")
        
        create_initial_products(db)
        print("✅ Products created")
        
        create_initial_clients(db)
        print("✅ Clients created")
        
        create_initial_suppliers(db)
        print("✅ Suppliers created")
        
        create_initial_configurations(db)
        print("✅ Configurations created")
        
        print("🎉 Database seeded successfully!")
        
    except Exception as e:
        print(f"❌ Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()