"""
Unit tests for invoice processor module (invoice_processor.py)
Tests all invoice processing logic including supplier/product creation and inventory updates
"""
import pytest
from unittest.mock import Mock, patch
from fastapi import HTTPException

from invoice_processor import InvoiceProcessor
from models import (
    Supplier, Product, PurchaseInvoice, PurchaseInvoiceItem,
    InventoryMovement, MovementType, PurchaseInvoiceStatus, ProductCategory
)


@pytest.mark.unit
@pytest.mark.invoice
class TestSupplierProcessing:
    """Test supplier finding and creation logic"""

    def test_find_or_create_supplier_creates_new_supplier(self, db_session, test_user):
        """Test creating a new supplier when it doesn't exist"""
        processor = InvoiceProcessor(db_session, test_user)

        supplier_data = {
            "nit": "900123456-7",
            "razon_social": "NEW SUPPLIER S.A.S",
            "email": "new@supplier.com",
            "telefono": "3001234567",
            "ciudad": "Bogotá",
            "direccion": "Calle 123"
        }

        supplier = processor.find_or_create_supplier(supplier_data)

        assert supplier is not None
        assert supplier.id is not None
        assert supplier.nit == "900123456-7"
        assert supplier.razon_social == "NEW SUPPLIER S.A.S"
        assert supplier.is_active is True

    def test_find_or_create_supplier_finds_existing_by_nit(self, db_session, test_user, test_supplier):
        """Test finding existing supplier by NIT"""
        processor = InvoiceProcessor(db_session, test_user)

        supplier_data = {
            "nit": test_supplier.nit,
            "razon_social": "Updated Name",
        }

        supplier = processor.find_or_create_supplier(supplier_data)

        assert supplier is not None
        assert supplier.id == test_supplier.id
        assert supplier.nit == test_supplier.nit

    def test_find_or_create_supplier_updates_existing_data(self, db_session, test_user, test_supplier):
        """Test that existing supplier data gets updated"""
        processor = InvoiceProcessor(db_session, test_user)

        new_email = "updated@supplier.com"
        new_phone = "3009999999"
        supplier_data = {
            "nit": test_supplier.nit,
            "razon_social": "UPDATED SUPPLIER NAME",
            "email": new_email,
            "telefono": new_phone,
        }

        supplier = processor.find_or_create_supplier(supplier_data)

        assert supplier.id == test_supplier.id
        assert supplier.razon_social == "UPDATED SUPPLIER NAME"
        assert supplier.email == new_email
        assert supplier.telefono == new_phone

    def test_find_or_create_supplier_reactivates_inactive(self, db_session, test_user):
        """Test that inactive supplier gets reactivated"""
        processor = InvoiceProcessor(db_session, test_user)

        # Create inactive supplier
        inactive_supplier = Supplier(
            nit="900999999-9",
            razon_social="Inactive Supplier",
            is_active=False
        )
        db_session.add(inactive_supplier)
        db_session.commit()

        supplier_data = {
            "nit": "900999999-9",
            "razon_social": "Reactivated Supplier",
        }

        supplier = processor.find_or_create_supplier(supplier_data)

        assert supplier.id == inactive_supplier.id
        assert supplier.is_active is True

    def test_find_or_create_supplier_requires_nit(self, db_session, test_user):
        """Test that NIT is required"""
        processor = InvoiceProcessor(db_session, test_user)

        supplier_data = {
            "nit": "",
            "razon_social": "Supplier Without NIT",
        }

        with pytest.raises(ValueError, match="NIT del proveedor es requerido"):
            processor.find_or_create_supplier(supplier_data)

    def test_find_or_create_supplier_strips_whitespace_from_nit(self, db_session, test_user):
        """Test that NIT whitespace is stripped"""
        processor = InvoiceProcessor(db_session, test_user)

        supplier_data = {
            "nit": "  900123456-7  ",
            "razon_social": "Test Supplier",
        }

        supplier = processor.find_or_create_supplier(supplier_data)

        assert supplier.nit == "900123456-7"


@pytest.mark.unit
@pytest.mark.invoice
class TestProductProcessing:
    """Test product finding and creation logic"""

    def test_find_or_create_product_creates_new_product(self, db_session, test_user):
        """Test creating a new product when it doesn't exist"""
        processor = InvoiceProcessor(db_session, test_user)

        product_data = {
            "referencia": "NEW-001",
            "nombre": "NEW PRODUCT",
            "precio_unitario": 1000.0,
            "cantidad": 10,
            "total": 10000.0
        }

        product = processor.find_or_create_product(product_data)

        assert product is not None
        assert product.id is not None
        assert product.codigo == "NEW-001"
        assert product.nombre == "NEW PRODUCT"
        assert product.precio_compra == 1000.0
        assert product.precio_venta == 1500.0  # 50% markup
        assert product.is_active is True

    def test_find_or_create_product_finds_by_codigo(self, db_session, test_user, test_product):
        """Test finding existing product by codigo"""
        processor = InvoiceProcessor(db_session, test_user)

        product_data = {
            "referencia": test_product.codigo,
            "nombre": "Different Name",
            "precio_unitario": 2000.0,
        }

        product = processor.find_or_create_product(product_data)

        assert product.id == test_product.id
        assert product.codigo == test_product.codigo

    def test_find_or_create_product_finds_by_exact_name(self, db_session, test_user, test_product):
        """Test finding existing product by exact name match"""
        processor = InvoiceProcessor(db_session, test_user)

        product_data = {
            "referencia": "DIFFERENT-CODE",
            "nombre": test_product.nombre,
            "precio_unitario": 2000.0,
        }

        product = processor.find_or_create_product(product_data)

        assert product.id == test_product.id

    def test_find_or_create_product_finds_by_similar_name(self, db_session, test_user):
        """Test finding existing product by similar name (first 30 chars)"""
        processor = InvoiceProcessor(db_session, test_user)

        # Create product with long name
        long_product = Product(
            codigo="LONG-001",
            nombre="This is a very long product name that exceeds thirty characters",
            precio_compra=100.0,
            precio_venta=150.0,
            categoria=ProductCategory.ACCESORIOS,
            stock_actual=0,
            stock_minimo=5,
            is_active=True
        )
        db_session.add(long_product)
        db_session.commit()

        product_data = {
            "referencia": "DIFFERENT",
            "nombre": "This is a very long product name with different ending",
            "precio_unitario": 200.0,
        }

        product = processor.find_or_create_product(product_data)

        # Should find the existing product by similar name
        assert product.id == long_product.id

    def test_find_or_create_product_updates_price_when_changed(self, db_session, test_user, test_product):
        """Test that product price gets updated when it changes"""
        processor = InvoiceProcessor(db_session, test_user)

        old_price = test_product.precio_compra
        new_price = 5000.0

        product_data = {
            "referencia": test_product.codigo,
            "nombre": test_product.nombre,
            "precio_unitario": new_price,
        }

        product = processor.find_or_create_product(product_data)

        assert product.precio_compra == new_price
        assert product.precio_compra != old_price
        # Precio de venta should be updated proportionally
        assert product.precio_venta == new_price * 1.5

    def test_find_or_create_product_keeps_custom_margin(self, db_session, test_user):
        """Test that custom price margins are preserved"""
        processor = InvoiceProcessor(db_session, test_user)

        # Create product with custom high margin (more than 2x)
        custom_product = Product(
            codigo="CUSTOM-001",
            nombre="Custom Margin Product",
            precio_compra=100.0,
            precio_venta=300.0,  # 3x margin (custom)
            categoria=ProductCategory.ACCESORIOS,
            stock_actual=10,
            stock_minimo=5,
            is_active=True
        )
        db_session.add(custom_product)
        db_session.commit()

        product_data = {
            "referencia": "CUSTOM-001",
            "nombre": "Custom Margin Product",
            "precio_unitario": 120.0,  # New purchase price
        }

        product = processor.find_or_create_product(product_data)

        # Custom margin should be preserved (not updated to 1.5x)
        assert product.precio_compra == 120.0
        assert product.precio_venta == 300.0  # Should keep custom price

    def test_find_or_create_product_updates_missing_codigo(self, db_session, test_user):
        """Test that product codigo is updated if it was auto-generated"""
        processor = InvoiceProcessor(db_session, test_user)

        # Create product with auto-generated code
        auto_product = Product(
            codigo="AUTO-20250101120000",
            nombre="Auto Code Product",
            precio_compra=100.0,
            precio_venta=150.0,
            categoria=ProductCategory.ACCESORIOS,
            stock_actual=0,
            stock_minimo=5,
            is_active=True
        )
        db_session.add(auto_product)
        db_session.commit()

        product_data = {
            "referencia": "REAL-CODE-001",
            "nombre": "Auto Code Product",
            "precio_unitario": 100.0,
        }

        product = processor.find_or_create_product(product_data)

        # Code should be updated from AUTO- to real code
        assert product.codigo == "REAL-CODE-001"

    def test_find_or_create_product_with_update_price_false(self, db_session, test_user, test_product):
        """Test that price is not updated when update_price=False"""
        processor = InvoiceProcessor(db_session, test_user)

        old_price = test_product.precio_compra

        product_data = {
            "referencia": test_product.codigo,
            "nombre": test_product.nombre,
            "precio_unitario": 9999.0,
        }

        product = processor.find_or_create_product(product_data, update_price=False)

        # Price should NOT be updated
        assert product.precio_compra == old_price


@pytest.mark.unit
@pytest.mark.invoice
class TestInventoryUpdates:
    """Test inventory update logic"""

    def test_update_inventory_increases_stock(self, db_session, test_user, test_product):
        """Test that inventory update increases stock correctly"""
        processor = InvoiceProcessor(db_session, test_user)

        old_stock = test_product.stock_actual
        quantity = 20
        referencia = "INV-001"

        movement = processor.update_inventory(test_product, quantity, referencia)

        # Stock should increase
        assert test_product.stock_actual == old_stock + quantity

        # Movement should be created
        assert movement is not None
        assert movement.tipo == MovementType.ENTRADA
        assert movement.cantidad == quantity
        assert movement.stock_anterior == old_stock
        assert movement.stock_nuevo == old_stock + quantity

    def test_update_inventory_creates_movement_record(self, db_session, test_user, test_product):
        """Test that inventory update creates a movement record"""
        processor = InvoiceProcessor(db_session, test_user)

        quantity = 15
        referencia = "FAC-123"

        movement = processor.update_inventory(test_product, quantity, referencia)

        assert movement.product_id == test_product.id
        assert movement.user_id == test_user.id
        assert movement.motivo == f"Compra - Factura {referencia}"
        assert movement.referencia == referencia

    def test_update_inventory_from_zero_stock(self, db_session, test_user, test_product_no_stock):
        """Test inventory update when starting from zero stock"""
        processor = InvoiceProcessor(db_session, test_user)

        assert test_product_no_stock.stock_actual == 0

        quantity = 100
        processor.update_inventory(test_product_no_stock, quantity, "INV-001")

        assert test_product_no_stock.stock_actual == 100


@pytest.mark.unit
@pytest.mark.invoice
@pytest.mark.asyncio
class TestInvoiceProcessing:
    """Test complete invoice processing workflow"""

    async def test_process_invoice_rejects_duplicate_invoice_number(
        self, db_session, test_user, test_supplier, sample_invoice_data
    ):
        """Test that duplicate invoice numbers are rejected"""
        processor = InvoiceProcessor(db_session, test_user)

        # Process invoice once
        await processor.process_invoice(sample_invoice_data)

        # Try to process same invoice again
        with pytest.raises(HTTPException) as exc_info:
            await processor.process_invoice(sample_invoice_data)

        assert exc_info.value.status_code == 400
        assert "ya existe" in str(exc_info.value.detail).lower()

    async def test_process_invoice_creates_invoice_with_items(
        self, db_session, test_user, sample_invoice_data
    ):
        """Test that processing creates invoice with all items"""
        processor = InvoiceProcessor(db_session, test_user)

        invoice = await processor.process_invoice(sample_invoice_data)

        assert invoice is not None
        assert invoice.id is not None
        assert invoice.numero_factura == sample_invoice_data["factura"]["numero"]
        assert invoice.status == PurchaseInvoiceStatus.PROCESADA
        assert len(invoice.items) == len(sample_invoice_data["productos"])

    async def test_process_invoice_updates_all_product_stocks(
        self, db_session, test_user, sample_invoice_data
    ):
        """Test that all product stocks are updated"""
        processor = InvoiceProcessor(db_session, test_user)

        # Get product quantities from invoice
        product_quantities = {
            p["referencia"]: p["cantidad"]
            for p in sample_invoice_data["productos"]
        }

        invoice = await processor.process_invoice(sample_invoice_data)

        # Verify all products have correct stock
        for item in invoice.items:
            expected_quantity = product_quantities.get(item.product.codigo, 0)
            assert item.product.stock_actual == expected_quantity

    async def test_process_invoice_rollback_on_error(
        self, db_session, test_user, sample_invoice_data
    ):
        """Test that transaction rolls back on error"""
        processor = InvoiceProcessor(db_session, test_user)

        # Make invoice data invalid (missing required field)
        invalid_data = sample_invoice_data.copy()
        invalid_data["proveedor"]["nit"] = ""  # Invalid NIT

        # Count records before
        supplier_count_before = db_session.query(Supplier).count()
        product_count_before = db_session.query(Product).count()
        invoice_count_before = db_session.query(PurchaseInvoice).count()

        # Try to process invalid invoice
        with pytest.raises((HTTPException, ValueError)):
            await processor.process_invoice(invalid_data)

        # Verify no records were created (rollback worked)
        assert db_session.query(Supplier).count() == supplier_count_before
        assert db_session.query(Product).count() == product_count_before
        assert db_session.query(PurchaseInvoice).count() == invoice_count_before

    async def test_process_invoice_creates_supplier_if_not_exists(
        self, db_session, test_user, sample_invoice_data
    ):
        """Test that new supplier is created during invoice processing"""
        processor = InvoiceProcessor(db_session, test_user)

        # Verify supplier doesn't exist
        nit = sample_invoice_data["proveedor"]["nit"]
        existing = db_session.query(Supplier).filter(Supplier.nit == nit).first()
        assert existing is None

        invoice = await processor.process_invoice(sample_invoice_data)

        # Verify supplier was created
        supplier = db_session.query(Supplier).filter(Supplier.nit == nit).first()
        assert supplier is not None
        assert invoice.supplier_id == supplier.id

    async def test_process_invoice_creates_products_if_not_exist(
        self, db_session, test_user, sample_invoice_data
    ):
        """Test that new products are created during invoice processing"""
        processor = InvoiceProcessor(db_session, test_user)

        invoice = await processor.process_invoice(sample_invoice_data)

        # Verify all products were created
        for product_data in sample_invoice_data["productos"]:
            product = db_session.query(Product).filter(
                Product.codigo == product_data["referencia"]
            ).first()
            assert product is not None
            assert product.nombre == product_data["nombre"]

    async def test_process_invoice_saves_pdf_file(
        self, db_session, test_user, sample_invoice_data
    ):
        """Test that PDF file path is saved if provided"""
        processor = InvoiceProcessor(db_session, test_user)

        # Mock PDF file
        mock_pdf = Mock()
        mock_pdf.filename = "test_invoice.pdf"
        mock_pdf.file = Mock()

        with patch.object(processor, 'save_pdf', return_value='uploads/invoices/test.pdf'):
            invoice = await processor.process_invoice(sample_invoice_data, pdf_file=mock_pdf)

            assert invoice.archivo_pdf == 'uploads/invoices/test.pdf'

    async def test_process_invoice_calculates_totals_correctly(
        self, db_session, test_user, sample_invoice_data
    ):
        """Test that invoice totals are calculated correctly"""
        processor = InvoiceProcessor(db_session, test_user)

        invoice = await processor.process_invoice(sample_invoice_data)

        assert invoice.subtotal == sample_invoice_data["totales"]["subtotal"]
        assert invoice.iva == sample_invoice_data["totales"]["iva"]
        assert invoice.total == sample_invoice_data["totales"]["total"]
