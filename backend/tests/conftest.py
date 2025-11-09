"""
Pytest configuration and shared fixtures
"""
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from fastapi.testclient import TestClient

from database import Base, get_db
from main import app
from models import User, Product, Client, Supplier, UserRole, UserLocation, ProductCategory
from auth import get_password_hash


# Test database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db_session():
    """Create a fresh database session for each test"""
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db_session):
    """Create a test client with database override"""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def test_user(db_session):
    """Create a test user"""
    user = User(
        username="testuser",
        email="test@example.com",
        nombre_completo="Test User",
        password_hash=get_password_hash("testpassword123"),
        rol=UserRole.VENDEDOR,
        ubicacion=UserLocation.COLOMBIA,
        is_active=True
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def test_admin(db_session):
    """Create a test admin user"""
    admin = User(
        username="admin",
        email="admin@example.com",
        nombre_completo="Admin User",
        password_hash=get_password_hash("adminpass123"),
        rol=UserRole.ADMIN,
        ubicacion=UserLocation.COLOMBIA,
        is_active=True
    )
    db_session.add(admin)
    db_session.commit()
    db_session.refresh(admin)
    return admin


@pytest.fixture
def test_superuser(db_session):
    """Create a test superuser"""
    superuser = User(
        username="superuser",
        email="super@example.com",
        nombre_completo="Super User",
        password_hash=get_password_hash("superpass123"),
        rol=UserRole.SUPERUSUARIO,
        ubicacion=UserLocation.EEUU,
        is_active=True
    )
    db_session.add(superuser)
    db_session.commit()
    db_session.refresh(superuser)
    return superuser


@pytest.fixture
def test_product(db_session):
    """Create a test product with stock"""
    product = Product(
        codigo="TEST-001",
        nombre="Test Product",
        descripcion="A test product",
        categoria=ProductCategory.ACCESORIOS,
        marca="Test Brand",
        precio_compra=100.0,
        precio_venta=150.0,
        stock_actual=50,
        stock_minimo=10,
        is_active=True
    )
    db_session.add(product)
    db_session.commit()
    db_session.refresh(product)
    return product


@pytest.fixture
def test_product_no_stock(db_session):
    """Create a test product without stock"""
    product = Product(
        codigo="TEST-002",
        nombre="Test Product No Stock",
        descripcion="A test product without stock",
        categoria=ProductCategory.ACCESORIOS,
        marca="Test Brand",
        precio_compra=50.0,
        precio_venta=75.0,
        stock_actual=0,
        stock_minimo=5,
        is_active=True
    )
    db_session.add(product)
    db_session.commit()
    db_session.refresh(product)
    return product


@pytest.fixture
def test_client_record(db_session):
    """Create a test client record"""
    client = Client(
        documento="1234567890",
        tipo_documento="CC",
        nombre_completo="Test Client",
        email="client@example.com",
        telefono="3001234567",
        direccion="Calle 123",
        ciudad="Bogotá",
        departamento="Cundinamarca",
        is_active=True
    )
    db_session.add(client)
    db_session.commit()
    db_session.refresh(client)
    return client


@pytest.fixture
def test_supplier(db_session):
    """Create a test supplier"""
    supplier = Supplier(
        nit="900123456-7",
        razon_social="Test Supplier S.A.S",
        nombre_comercial="Test Supplier",
        email="supplier@example.com",
        telefono="6011234567",
        direccion="Carrera 45 #67-89",
        ciudad="Medellín",
        is_active=True
    )
    db_session.add(supplier)
    db_session.commit()
    db_session.refresh(supplier)
    return supplier


@pytest.fixture
def sample_invoice_data():
    """Sample invoice data for testing"""
    return {
        "proveedor": {
            "nit": "900479120-7",
            "razon_social": "DISTRIBUIDORA TEST S.A.S",
            "email": "test@supplier.com",
            "telefono": "3154795581",
            "direccion": "Calle 123 #45-67",
            "ciudad": "BUCARAMANGA"
        },
        "factura": {
            "numero": "F-TEST-001",
            "fecha": "2025-01-15",
            "cufe": "test-cufe-123456",
            "fecha_aceptacion": "",
            "firma_digital": ""
        },
        "productos": [
            {
                "referencia": "TEST-PROD-001",
                "nombre": "PRODUCTO DE PRUEBA 1",
                "cantidad": 10,
                "precio_unitario": 1000.0,
                "total": 10000.0
            },
            {
                "referencia": "TEST-PROD-002",
                "nombre": "PRODUCTO DE PRUEBA 2",
                "cantidad": 5,
                "precio_unitario": 2000.0,
                "total": 10000.0
            }
        ],
        "totales": {
            "subtotal": 20000.0,
            "iva": 3800.0,
            "total": 23800.0
        }
    }
