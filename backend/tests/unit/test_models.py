"""
Unit tests for database models (models.py)
Tests model creation, relationships, and validations
"""
import pytest
from datetime import datetime
from models import (
    User, Product, Client, Supplier, Sale, SaleItem,
    PurchaseInvoice, PurchaseInvoiceItem, InventoryMovement,
    UserRole, UserLocation, ProductCategory, SaleStatus,
    PurchaseInvoiceStatus, MovementType
)
from auth import get_password_hash


@pytest.mark.unit
@pytest.mark.database
class TestUserModel:
    """Test User model"""

    def test_user_model_creation(self, db_session):
        """Test creating a user model"""
        user = User(
            username="newuser",
            email="newuser@example.com",
            nombre_completo="New User",
            password_hash=get_password_hash("password123"),
            rol=UserRole.VENDEDOR,
            ubicacion=UserLocation.COLOMBIA,
            is_active=True
        )

        db_session.add(user)
        db_session.commit()
        db_session.refresh(user)

        assert user.id is not None
        assert user.username == "newuser"
        assert user.email == "newuser@example.com"
        assert user.rol == UserRole.VENDEDOR
        assert user.ubicacion == UserLocation.COLOMBIA
        assert user.is_active is True
        assert user.created_at is not None

    def test_user_model_relationships(self, db_session, test_user):
        """Test user relationships (sales, inventory_movements)"""
        assert hasattr(test_user, 'sales')
        assert hasattr(test_user, 'inventory_movements')
        assert isinstance(test_user.sales, list)
        assert isinstance(test_user.inventory_movements, list)

    def test_user_roles_enum(self, db_session):
        """Test that user roles enum works correctly"""
        admin = User(
            username="admin2",
            email="admin2@example.com",
            nombre_completo="Admin User",
            password_hash=get_password_hash("pass"),
            rol=UserRole.ADMIN,
            ubicacion=UserLocation.COLOMBIA,
            is_active=True
        )

        db_session.add(admin)
        db_session.commit()

        assert admin.rol == UserRole.ADMIN
        assert admin.rol == "ADMIN"


@pytest.mark.unit
@pytest.mark.database
class TestProductModel:
    """Test Product model"""

    def test_product_model_creation(self, db_session):
        """Test creating a product model"""
        product = Product(
            codigo="PROD-001",
            nombre="Test Product",
            descripcion="A test product",
            categoria=ProductCategory.MAQUILLAJE,
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

        assert product.id is not None
        assert product.codigo == "PROD-001"
        assert product.nombre == "Test Product"
        assert product.categoria == ProductCategory.MAQUILLAJE
        assert product.precio_compra == 100.0
        assert product.precio_venta == 150.0
        assert product.stock_actual == 50
        assert product.stock_minimo == 10

    def test_product_model_stock_validation(self, db_session):
        """Test product stock can be zero or positive"""
        product_zero_stock = Product(
            codigo="ZERO-STOCK",
            nombre="Zero Stock Product",
            categoria=ProductCategory.ACCESORIOS,
            precio_compra=50.0,
            precio_venta=75.0,
            stock_actual=0,
            stock_minimo=5,
            is_active=True
        )

        db_session.add(product_zero_stock)
        db_session.commit()

        assert product_zero_stock.stock_actual == 0

    def test_product_relationships(self, db_session, test_product):
        """Test product relationships"""
        assert hasattr(test_product, 'sale_items')
        assert hasattr(test_product, 'inventory_movements')
        assert hasattr(test_product, 'supplier_products')
        assert hasattr(test_product, 'purchase_invoice_items')


@pytest.mark.unit
@pytest.mark.database
class TestSupplierModel:
    """Test Supplier model"""

    def test_supplier_model_creation(self, db_session):
        """Test creating a supplier model"""
        supplier = Supplier(
            nit="900111222-3",
            razon_social="Test Supplier S.A.S",
            nombre_comercial="Test Supplier",
            email="test@supplier.com",
            telefono="3001234567",
            direccion="Calle 123",
            ciudad="Bogotá",
            is_active=True
        )

        db_session.add(supplier)
        db_session.commit()
        db_session.refresh(supplier)

        assert supplier.id is not None
        assert supplier.nit == "900111222-3"
        assert supplier.razon_social == "Test Supplier S.A.S"
        assert supplier.is_active is True

    def test_supplier_relationships(self, db_session, test_supplier):
        """Test supplier relationships"""
        assert hasattr(test_supplier, 'supplier_products')
        assert hasattr(test_supplier, 'purchase_invoices')


@pytest.mark.unit
@pytest.mark.database
class TestClientModel:
    """Test Client model"""

    def test_client_model_creation(self, db_session):
        """Test creating a client model"""
        client = Client(
            documento="9876543210",
            tipo_documento="CC",
            nombre_completo="Test Client",
            email="client@example.com",
            telefono="3009876543",
            direccion="Carrera 45 #67-89",
            ciudad="Medellín",
            departamento="Antioquia",
            is_active=True
        )

        db_session.add(client)
        db_session.commit()
        db_session.refresh(client)

        assert client.id is not None
        assert client.documento == "9876543210"
        assert client.tipo_documento == "CC"
        assert client.nombre_completo == "Test Client"

    def test_client_relationships(self, db_session, test_client_record):
        """Test client relationships"""
        assert hasattr(test_client_record, 'sales')


@pytest.mark.unit
@pytest.mark.database
class TestPurchaseInvoiceModel:
    """Test PurchaseInvoice model"""

    def test_purchase_invoice_model_creation(self, db_session, test_supplier):
        """Test creating a purchase invoice model"""
        invoice = PurchaseInvoice(
            numero_factura="FAC-001",
            supplier_id=test_supplier.id,
            fecha_emision=datetime.now(),
            subtotal=100000.0,
            iva=19000.0,
            total=119000.0,
            status=PurchaseInvoiceStatus.PROCESADA
        )

        db_session.add(invoice)
        db_session.commit()
        db_session.refresh(invoice)

        assert invoice.id is not None
        assert invoice.numero_factura == "FAC-001"
        assert invoice.supplier_id == test_supplier.id
        assert invoice.subtotal == 100000.0
        assert invoice.total == 119000.0
        assert invoice.status == PurchaseInvoiceStatus.PROCESADA

    def test_purchase_invoice_items_relationship(self, db_session, test_supplier, test_product):
        """Test purchase invoice items relationship"""
        invoice = PurchaseInvoice(
            numero_factura="FAC-002",
            supplier_id=test_supplier.id,
            fecha_emision=datetime.now(),
            subtotal=1000.0,
            iva=190.0,
            total=1190.0,
            status=PurchaseInvoiceStatus.PROCESADA
        )
        db_session.add(invoice)
        db_session.flush()

        # Add item
        item = PurchaseInvoiceItem(
            purchase_invoice_id=invoice.id,
            product_id=test_product.id,
            cantidad=10,
            precio_unitario=100.0,
            subtotal=1000.0
        )
        db_session.add(item)
        db_session.commit()
        db_session.refresh(invoice)

        assert len(invoice.items) == 1
        assert invoice.items[0].cantidad == 10
        assert invoice.items[0].product_id == test_product.id


@pytest.mark.unit
@pytest.mark.database
class TestSaleModel:
    """Test Sale model"""

    def test_sale_model_creation(self, db_session, test_client_record, test_user):
        """Test creating a sale model"""
        sale = Sale(
            numero_venta="VTA-000001",
            client_id=test_client_record.id,
            user_id=test_user.id,
            subtotal=150.0,
            descuento=0.0,
            impuestos=28.5,
            total=178.5,
            metodo_pago="EFECTIVO",
            status=SaleStatus.COMPLETADA
        )

        db_session.add(sale)
        db_session.commit()
        db_session.refresh(sale)

        assert sale.id is not None
        assert sale.numero_venta == "VTA-000001"
        assert sale.client_id == test_client_record.id
        assert sale.user_id == test_user.id
        assert sale.total == 178.5
        assert sale.status == SaleStatus.COMPLETADA

    def test_sale_items_relationship(self, db_session, test_client_record, test_user, test_product):
        """Test sale items relationship"""
        sale = Sale(
            numero_venta="VTA-000002",
            client_id=test_client_record.id,
            user_id=test_user.id,
            subtotal=150.0,
            descuento=0.0,
            impuestos=28.5,
            total=178.5,
            metodo_pago="TARJETA",
            status=SaleStatus.COMPLETADA
        )
        db_session.add(sale)
        db_session.flush()

        # Add item
        item = SaleItem(
            sale_id=sale.id,
            product_id=test_product.id,
            cantidad=1,
            precio_unitario=150.0,
            descuento=0.0,
            subtotal=150.0
        )
        db_session.add(item)
        db_session.commit()
        db_session.refresh(sale)

        assert len(sale.items) == 1
        assert sale.items[0].cantidad == 1
        assert sale.items[0].product_id == test_product.id


@pytest.mark.unit
@pytest.mark.database
class TestInventoryMovementModel:
    """Test InventoryMovement model"""

    def test_inventory_movement_model_creation(self, db_session, test_product, test_user):
        """Test creating an inventory movement model"""
        movement = InventoryMovement(
            product_id=test_product.id,
            user_id=test_user.id,
            tipo=MovementType.ENTRADA,
            cantidad=20,
            stock_anterior=50,
            stock_nuevo=70,
            motivo="Compra - Factura FAC-001",
            referencia="FAC-001"
        )

        db_session.add(movement)
        db_session.commit()
        db_session.refresh(movement)

        assert movement.id is not None
        assert movement.product_id == test_product.id
        assert movement.user_id == test_user.id
        assert movement.tipo == MovementType.ENTRADA
        assert movement.cantidad == 20
        assert movement.stock_anterior == 50
        assert movement.stock_nuevo == 70

    def test_inventory_movement_types(self, db_session, test_product, test_user):
        """Test different inventory movement types"""
        # Test ENTRADA
        entrada = InventoryMovement(
            product_id=test_product.id,
            user_id=test_user.id,
            tipo=MovementType.ENTRADA,
            cantidad=10,
            stock_anterior=50,
            stock_nuevo=60,
            motivo="Compra",
            referencia="FAC-001"
        )
        db_session.add(entrada)

        # Test SALIDA
        salida = InventoryMovement(
            product_id=test_product.id,
            user_id=test_user.id,
            tipo=MovementType.SALIDA,
            cantidad=5,
            stock_anterior=60,
            stock_nuevo=55,
            motivo="Venta",
            referencia="VTA-001"
        )
        db_session.add(salida)

        # Test AJUSTE
        ajuste = InventoryMovement(
            product_id=test_product.id,
            user_id=test_user.id,
            tipo=MovementType.AJUSTE,
            cantidad=3,
            stock_anterior=55,
            stock_nuevo=52,
            motivo="Ajuste de inventario",
            referencia="AJU-001"
        )
        db_session.add(ajuste)

        db_session.commit()

        # Verify all were created
        movements = db_session.query(InventoryMovement).filter(
            InventoryMovement.product_id == test_product.id
        ).all()

        assert len(movements) == 3
        tipos = [m.tipo for m in movements]
        assert MovementType.ENTRADA in tipos
        assert MovementType.SALIDA in tipos
        assert MovementType.AJUSTE in tipos


@pytest.mark.unit
@pytest.mark.database
class TestModelTimestamps:
    """Test model timestamps (created_at, updated_at)"""

    def test_user_timestamps(self, db_session):
        """Test user model has created_at timestamp"""
        user = User(
            username="timestamp_user",
            email="timestamp@example.com",
            nombre_completo="Timestamp User",
            password_hash=get_password_hash("pass"),
            rol=UserRole.VENDEDOR,
            ubicacion=UserLocation.COLOMBIA
        )

        db_session.add(user)
        db_session.commit()
        db_session.refresh(user)

        assert user.created_at is not None
        assert isinstance(user.created_at, datetime)

    def test_product_timestamps(self, db_session):
        """Test product model has timestamps"""
        product = Product(
            codigo="TIME-001",
            nombre="Timestamp Product",
            categoria=ProductCategory.ACCESORIOS,
            precio_compra=100.0,
            precio_venta=150.0,
            stock_actual=10
        )

        db_session.add(product)
        db_session.commit()
        db_session.refresh(product)

        assert product.created_at is not None

    def test_purchase_invoice_timestamps(self, db_session, test_supplier):
        """Test purchase invoice has timestamps"""
        invoice = PurchaseInvoice(
            numero_factura="TIME-FAC",
            supplier_id=test_supplier.id,
            fecha_emision=datetime.now(),
            subtotal=1000.0,
            iva=190.0,
            total=1190.0
        )

        db_session.add(invoice)
        db_session.commit()
        db_session.refresh(invoice)

        assert invoice.created_at is not None
