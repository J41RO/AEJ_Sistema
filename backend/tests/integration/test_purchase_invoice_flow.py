"""
Integration tests for complete purchase invoice workflow
Tests the entire invoice processing flow from invoice creation to inventory update
"""
import pytest
from invoice_processor import InvoiceProcessor
from models import (
    Supplier, Product, PurchaseInvoice, InventoryMovement,
    MovementType, PurchaseInvoiceStatus
)


@pytest.mark.integration
@pytest.mark.invoice
@pytest.mark.asyncio
class TestCompletePurchaseInvoiceFlow:
    """Test complete purchase invoice workflow integration"""

    async def test_complete_purchase_invoice_workflow(self, db_session, test_user):
        """
        Test complete purchase invoice workflow:
        1. Process invoice with new supplier
        2. Verify supplier created
        3. Verify products created
        4. Verify stock incremented
        5. Verify inventory movements created
        """
        processor = InvoiceProcessor(db_session, test_user)

        # Invoice data with new supplier and new products
        invoice_data = {
            "proveedor": {
                "nit": "900555666-7",
                "razon_social": "NUEVO PROVEEDOR INTEGRATION S.A.S",
                "email": "integration@newproveedor.com",
                "telefono": "3155555555",
                "direccion": "Calle Integration 123",
                "ciudad": "CALI"
            },
            "factura": {
                "numero": "INT-FAC-001",
                "fecha": "2025-01-20",
                "cufe": "integration-cufe-12345",
                "fecha_aceptacion": "",
                "firma_digital": ""
            },
            "productos": [
                {
                    "referencia": "INT-PROD-A",
                    "nombre": "PRODUCTO INTEGRATION A",
                    "cantidad": 50,
                    "precio_unitario": 2000.0,
                    "total": 100000.0
                },
                {
                    "referencia": "INT-PROD-B",
                    "nombre": "PRODUCTO INTEGRATION B",
                    "cantidad": 30,
                    "precio_unitario": 3000.0,
                    "total": 90000.0
                }
            ],
            "totales": {
                "subtotal": 190000.0,
                "iva": 36100.0,
                "total": 226100.0
            }
        }

        # Step 1: Process invoice
        invoice = await processor.process_invoice(invoice_data)

        # Step 2: Verify invoice was created
        assert invoice is not None
        assert invoice.id is not None
        assert invoice.numero_factura == "INT-FAC-001"
        assert invoice.status == PurchaseInvoiceStatus.PROCESADA
        assert invoice.total == 226100.0

        # Step 3: Verify supplier was created
        supplier = db_session.query(Supplier).filter(
            Supplier.nit == "900555666-7"
        ).first()

        assert supplier is not None
        assert supplier.razon_social == "NUEVO PROVEEDOR INTEGRATION S.A.S"
        assert supplier.email == "integration@newproveedor.com"
        assert invoice.supplier_id == supplier.id

        # Step 4: Verify products were created with correct stock
        product_a = db_session.query(Product).filter(
            Product.codigo == "INT-PROD-A"
        ).first()

        product_b = db_session.query(Product).filter(
            Product.codigo == "INT-PROD-B"
        ).first()

        assert product_a is not None
        assert product_a.nombre == "PRODUCTO INTEGRATION A"
        assert product_a.stock_actual == 50
        assert product_a.precio_compra == 2000.0

        assert product_b is not None
        assert product_b.nombre == "PRODUCTO INTEGRATION B"
        assert product_b.stock_actual == 30
        assert product_b.precio_compra == 3000.0

        # Step 5: Verify inventory movements were created
        movements = db_session.query(InventoryMovement).filter(
            InventoryMovement.referencia == "INT-FAC-001"
        ).all()

        assert len(movements) == 2

        movements_by_product = {m.product_id: m for m in movements}

        assert product_a.id in movements_by_product
        mov_a = movements_by_product[product_a.id]
        assert mov_a.tipo == MovementType.ENTRADA
        assert mov_a.cantidad == 50
        assert mov_a.stock_anterior == 0
        assert mov_a.stock_nuevo == 50

        assert product_b.id in movements_by_product
        mov_b = movements_by_product[product_b.id]
        assert mov_b.tipo == MovementType.ENTRADA
        assert mov_b.cantidad == 30

    async def test_purchase_invoice_with_existing_products(self, db_session, test_user, test_product):
        """
        Test processing invoice with products that already exist
        Verify that stock is ADDED (not replaced)
        """
        processor = InvoiceProcessor(db_session, test_user)

        initial_stock = test_product.stock_actual
        initial_price = test_product.precio_compra

        invoice_data = {
            "proveedor": {
                "nit": "900777888-9",
                "razon_social": "PROVEEDOR EXISTENTE",
                "email": "existing@proveedor.com",
                "telefono": "3157777777",
                "direccion": "Calle Existente 456",
                "ciudad": "MEDELLIN"
            },
            "factura": {
                "numero": "INT-FAC-002",
                "fecha": "2025-01-21",
                "cufe": "",
                "fecha_aceptacion": "",
                "firma_digital": ""
            },
            "productos": [
                {
                    "referencia": test_product.codigo,  # Existing product
                    "nombre": test_product.nombre,
                    "cantidad": 25,
                    "precio_unitario": 120.0,  # Different price
                    "total": 3000.0
                }
            ],
            "totales": {
                "subtotal": 3000.0,
                "iva": 570.0,
                "total": 3570.0
            }
        }

        # Process invoice
        invoice = await processor.process_invoice(invoice_data)

        # Verify invoice created
        assert invoice is not None
        assert invoice.numero_factura == "INT-FAC-002"

        # Verify stock was ADDED (not replaced)
        db_session.refresh(test_product)
        assert test_product.stock_actual == initial_stock + 25

        # Verify price was updated
        assert test_product.precio_compra == 120.0
        assert test_product.precio_compra != initial_price

        # Verify inventory movement
        movement = db_session.query(InventoryMovement).filter(
            InventoryMovement.referencia == "INT-FAC-002",
            InventoryMovement.product_id == test_product.id
        ).first()

        assert movement is not None
        assert movement.tipo == MovementType.ENTRADA
        assert movement.cantidad == 25
        assert movement.stock_anterior == initial_stock
        assert movement.stock_nuevo == initial_stock + 25

    async def test_duplicate_invoice_number_is_rejected(self, db_session, test_user):
        """
        Test that duplicate invoice numbers are rejected
        """
        processor = InvoiceProcessor(db_session, test_user)

        invoice_data = {
            "proveedor": {
                "nit": "900999888-7",
                "razon_social": "PROVEEDOR DUPLICADO",
            },
            "factura": {
                "numero": "DUP-FAC-001",
                "fecha": "2025-01-22",
            },
            "productos": [
                {
                    "referencia": "DUP-PROD",
                    "nombre": "PRODUCTO DUPLICADO",
                    "cantidad": 10,
                    "precio_unitario": 1000.0,
                    "total": 10000.0
                }
            ],
            "totales": {
                "subtotal": 10000.0,
                "iva": 1900.0,
                "total": 11900.0
            }
        }

        # Process invoice first time
        invoice1 = await processor.process_invoice(invoice_data)
        assert invoice1 is not None

        # Try to process same invoice number again
        from fastapi import HTTPException
        with pytest.raises(HTTPException) as exc_info:
            await processor.process_invoice(invoice_data)

        assert exc_info.value.status_code == 400
        assert "ya existe" in str(exc_info.value.detail).lower()

    async def test_invoice_with_multiple_products_updates_all_stocks(
        self, db_session, test_user, test_product
    ):
        """
        Test that invoice with multiple products updates all stocks correctly
        """
        processor = InvoiceProcessor(db_session, test_user)

        # Create additional product
        product2 = Product(
            codigo="MULTI-PROD-2",
            nombre="Multi Product 2",
            categoria="ACCESORIOS",
            precio_compra=50.0,
            precio_venta=75.0,
            stock_actual=10,
            stock_minimo=5,
            is_active=True
        )
        db_session.add(product2)
        db_session.commit()
        db_session.refresh(product2)

        initial_stock_1 = test_product.stock_actual
        initial_stock_2 = product2.stock_actual

        invoice_data = {
            "proveedor": {
                "nit": "900888999-0",
                "razon_social": "PROVEEDOR MULTIPLE",
            },
            "factura": {
                "numero": "MULTI-FAC-001",
                "fecha": "2025-01-23",
            },
            "productos": [
                {
                    "referencia": test_product.codigo,
                    "nombre": test_product.nombre,
                    "cantidad": 15,
                    "precio_unitario": 100.0,
                    "total": 1500.0
                },
                {
                    "referencia": product2.codigo,
                    "nombre": product2.nombre,
                    "cantidad": 20,
                    "precio_unitario": 50.0,
                    "total": 1000.0
                }
            ],
            "totales": {
                "subtotal": 2500.0,
                "iva": 475.0,
                "total": 2975.0
            }
        }

        # Process invoice
        invoice = await processor.process_invoice(invoice_data)
        assert invoice is not None

        # Verify both products stock updated
        db_session.refresh(test_product)
        db_session.refresh(product2)

        assert test_product.stock_actual == initial_stock_1 + 15
        assert product2.stock_actual == initial_stock_2 + 20

        # Verify both inventory movements created
        movements = db_session.query(InventoryMovement).filter(
            InventoryMovement.referencia == "MULTI-FAC-001"
        ).all()

        assert len(movements) == 2

    async def test_invoice_processing_creates_all_invoice_items(
        self, db_session, test_user
    ):
        """
        Test that all invoice items are created and linked correctly
        """
        processor = InvoiceProcessor(db_session, test_user)

        invoice_data = {
            "proveedor": {
                "nit": "900111000-1",
                "razon_social": "PROVEEDOR ITEMS",
            },
            "factura": {
                "numero": "ITEMS-FAC-001",
                "fecha": "2025-01-24",
            },
            "productos": [
                {
                    "referencia": "ITEM-A",
                    "nombre": "ITEM PRODUCT A",
                    "cantidad": 5,
                    "precio_unitario": 1000.0,
                    "total": 5000.0
                },
                {
                    "referencia": "ITEM-B",
                    "nombre": "ITEM PRODUCT B",
                    "cantidad": 10,
                    "precio_unitario": 500.0,
                    "total": 5000.0
                },
                {
                    "referencia": "ITEM-C",
                    "nombre": "ITEM PRODUCT C",
                    "cantidad": 15,
                    "precio_unitario": 333.33,
                    "total": 5000.0
                }
            ],
            "totales": {
                "subtotal": 15000.0,
                "iva": 2850.0,
                "total": 17850.0
            }
        }

        # Process invoice
        invoice = await processor.process_invoice(invoice_data)
        assert invoice is not None

        # Verify all items created
        assert len(invoice.items) == 3

        # Verify item details
        items_by_ref = {
            item.product.codigo: item
            for item in invoice.items
        }

        assert "ITEM-A" in items_by_ref
        assert items_by_ref["ITEM-A"].cantidad == 5
        assert items_by_ref["ITEM-A"].precio_unitario == 1000.0

        assert "ITEM-B" in items_by_ref
        assert items_by_ref["ITEM-B"].cantidad == 10

        assert "ITEM-C" in items_by_ref
        assert items_by_ref["ITEM-C"].cantidad == 15

    async def test_invoice_with_existing_supplier_updates_supplier_data(
        self, db_session, test_user, test_supplier
    ):
        """
        Test that processing invoice with existing supplier updates supplier data
        """
        processor = InvoiceProcessor(db_session, test_user)

        old_email = test_supplier.email
        new_email = "updated@supplier.com"
        new_phone = "3009999999"

        invoice_data = {
            "proveedor": {
                "nit": test_supplier.nit,
                "razon_social": "UPDATED SUPPLIER NAME",
                "email": new_email,
                "telefono": new_phone,
            },
            "factura": {
                "numero": "UPDATE-FAC-001",
                "fecha": "2025-01-25",
            },
            "productos": [
                {
                    "referencia": "UPDATE-PROD",
                    "nombre": "UPDATE PRODUCT",
                    "cantidad": 1,
                    "precio_unitario": 1000.0,
                    "total": 1000.0
                }
            ],
            "totales": {
                "subtotal": 1000.0,
                "iva": 190.0,
                "total": 1190.0
            }
        }

        # Process invoice
        invoice = await processor.process_invoice(invoice_data)
        assert invoice is not None

        # Verify supplier data was updated
        db_session.refresh(test_supplier)

        assert test_supplier.razon_social == "UPDATED SUPPLIER NAME"
        assert test_supplier.email == new_email
        assert test_supplier.telefono == new_phone
        assert test_supplier.email != old_email

    async def test_invoice_processing_rollback_on_error(
        self, db_session, test_user
    ):
        """
        Test that when invoice processing fails, all changes are rolled back
        """
        processor = InvoiceProcessor(db_session, test_user)

        # Count records before
        supplier_count_before = db_session.query(Supplier).count()
        product_count_before = db_session.query(Product).count()
        invoice_count_before = db_session.query(PurchaseInvoice).count()
        movement_count_before = db_session.query(InventoryMovement).count()

        # Invalid invoice data (missing NIT)
        invalid_invoice_data = {
            "proveedor": {
                "nit": "",  # Invalid - empty NIT
                "razon_social": "INVALID SUPPLIER",
            },
            "factura": {
                "numero": "INVALID-FAC",
                "fecha": "2025-01-26",
            },
            "productos": [
                {
                    "referencia": "INVALID-PROD",
                    "nombre": "INVALID PRODUCT",
                    "cantidad": 1,
                    "precio_unitario": 1000.0,
                    "total": 1000.0
                }
            ],
            "totales": {
                "subtotal": 1000.0,
                "iva": 190.0,
                "total": 1190.0
            }
        }

        # Try to process invalid invoice
        with pytest.raises((ValueError, Exception)):
            await processor.process_invoice(invalid_invoice_data)

        # Verify no records were created (rollback worked)
        assert db_session.query(Supplier).count() == supplier_count_before
        assert db_session.query(Product).count() == product_count_before
        assert db_session.query(PurchaseInvoice).count() == invoice_count_before
        assert db_session.query(InventoryMovement).count() == movement_count_before
