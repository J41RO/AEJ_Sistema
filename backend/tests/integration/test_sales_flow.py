"""
Integration tests for complete sales workflow
Tests the entire sales flow from product creation to final sale and inventory update
"""
import pytest
from auth import create_access_token
from models import (
    Product, Client, Sale, SaleItem, InventoryMovement,
    ProductCategory, MovementType, SaleStatus
)


@pytest.mark.integration
@pytest.mark.sales
class TestCompleteSalesFlow:
    """Test complete sales workflow integration"""

    def test_complete_sale_workflow(self, client, db_session, test_admin):
        """
        Test complete sales workflow:
        1. Create client
        2. Create products with stock
        3. Create sale
        4. Verify stock decremented
        5. Verify inventory movement created
        6. Verify sale recorded
        """
        # Setup authentication
        token = create_access_token(data={"sub": test_admin.username})
        headers = {"Authorization": f"Bearer {token}"}

        # Step 1: Create client
        client_data = {
            "documento": "1122334455",
            "tipo_documento": "CC",
            "nombre_completo": "Integration Test Client",
            "email": "integration@test.com",
            "telefono": "3001112233",
            "direccion": "Test Address 123",
            "ciudad": "Bogotá",
            "departamento": "Cundinamarca"
        }

        client_response = client.post("/clients", json=client_data, headers=headers)
        assert client_response.status_code == 200
        created_client = client_response.json()
        client_id = created_client["id"]

        # Step 2: Create products with stock
        product1_data = {
            "codigo": "INT-PROD-001",
            "nombre": "Integration Product 1",
            "descripcion": "First test product",
            "categoria": "MAQUILLAJE",
            "marca": "Test Brand",
            "precio_compra": 100.0,
            "precio_venta": 150.0,
            "stock_actual": 100,
            "stock_minimo": 10
        }

        product2_data = {
            "codigo": "INT-PROD-002",
            "nombre": "Integration Product 2",
            "descripcion": "Second test product",
            "categoria": "FRAGANCIAS",
            "marca": "Test Brand",
            "precio_compra": 200.0,
            "precio_venta": 300.0,
            "stock_actual": 50,
            "stock_minimo": 5
        }

        prod1_response = client.post("/products", json=product1_data, headers=headers)
        assert prod1_response.status_code == 200
        product1 = prod1_response.json()

        prod2_response = client.post("/products", json=product2_data, headers=headers)
        assert prod2_response.status_code == 200
        product2 = prod2_response.json()

        initial_stock_prod1 = product1["stock_actual"]
        initial_stock_prod2 = product2["stock_actual"]

        # Step 3: Create sale with both products
        sale_data = {
            "client_id": client_id,
            "subtotal": 900.0,  # (150 * 2) + (300 * 2)
            "descuento": 50.0,
            "impuestos": 161.5,  # 19% IVA on (900 - 50)
            "total": 1011.5,
            "metodo_pago": "TARJETA",
            "notas": "Integration test sale",
            "items": [
                {
                    "product_id": product1["id"],
                    "cantidad": 2,
                    "precio_unitario": 150.0,
                    "descuento": 20.0
                },
                {
                    "product_id": product2["id"],
                    "cantidad": 2,
                    "precio_unitario": 300.0,
                    "descuento": 30.0
                }
            ]
        }

        sale_response = client.post("/sales", json=sale_data, headers=headers)
        assert sale_response.status_code == 200
        sale = sale_response.json()

        # Step 4: Verify sale was created correctly
        assert sale["status"] == "COMPLETADA"
        assert sale["total"] == 1011.5
        assert "numero_venta" in sale
        assert sale["numero_venta"].startswith("VTA-")
        assert len(sale["items"]) == 2

        # Step 5: Verify stock was decremented
        prod1_check = client.get(f"/products/{product1['id']}", headers=headers)
        prod2_check = client.get(f"/products/{product2['id']}", headers=headers)

        assert prod1_check.status_code == 200
        assert prod2_check.status_code == 200

        updated_prod1 = prod1_check.json()
        updated_prod2 = prod2_check.json()

        assert updated_prod1["stock_actual"] == initial_stock_prod1 - 2
        assert updated_prod2["stock_actual"] == initial_stock_prod2 - 2

        # Step 6: Verify inventory movements were created
        movements = db_session.query(InventoryMovement).filter(
            InventoryMovement.referencia == sale["numero_venta"]
        ).all()

        assert len(movements) == 2  # One for each product

        # Verify movement details
        movements_by_product = {m.product_id: m for m in movements}

        assert product1["id"] in movements_by_product
        assert product2["id"] in movements_by_product

        mov1 = movements_by_product[product1["id"]]
        assert mov1.tipo == MovementType.SALIDA
        assert mov1.cantidad == 2
        assert mov1.stock_anterior == initial_stock_prod1
        assert mov1.stock_nuevo == initial_stock_prod1 - 2

        mov2 = movements_by_product[product2["id"]]
        assert mov2.tipo == MovementType.SALIDA
        assert mov2.cantidad == 2

        # Step 7: Verify sale can be retrieved
        sales_response = client.get("/sales", headers=headers)
        assert sales_response.status_code == 200
        sales_list = sales_response.json()

        # Find our sale in the list
        our_sale = next((s for s in sales_list if s["numero_venta"] == sale["numero_venta"]), None)
        assert our_sale is not None
        assert our_sale["total"] == 1011.5

    def test_sale_with_insufficient_stock_does_not_modify_database(
        self, client, db_session, test_user, test_client_record, test_product
    ):
        """
        Test that when a sale fails due to insufficient stock,
        no changes are made to the database (rollback works)
        """
        token = create_access_token(data={"sub": test_user.username})
        headers = {"Authorization": f"Bearer {token}"}

        # Get initial state
        initial_stock = test_product.stock_actual

        # Try to create sale with insufficient stock
        sale_data = {
            "client_id": test_client_record.id,
            "subtotal": 15000.0,
            "descuento": 0.0,
            "impuestos": 2850.0,
            "total": 17850.0,
            "metodo_pago": "EFECTIVO",
            "items": [
                {
                    "product_id": test_product.id,
                    "cantidad": test_product.stock_actual + 100,  # More than available
                    "precio_unitario": 150.0,
                    "descuento": 0.0
                }
            ]
        }

        response = client.post("/sales", json=sale_data, headers=headers)
        assert response.status_code == 400
        assert "Insufficient stock" in response.json()["detail"]

        # Verify stock was not modified
        db_session.refresh(test_product)
        assert test_product.stock_actual == initial_stock

    def test_multiple_sequential_sales_decrement_stock_correctly(
        self, client, db_session, test_user, test_client_record, test_product
    ):
        """
        Test that multiple sequential sales correctly decrement stock
        """
        token = create_access_token(data={"sub": test_user.username})
        headers = {"Authorization": f"Bearer {token}"}

        initial_stock = test_product.stock_actual
        quantity_per_sale = 3
        number_of_sales = 5

        # Create multiple sales
        for i in range(number_of_sales):
            sale_data = {
                "client_id": test_client_record.id,
                "subtotal": 150.0 * quantity_per_sale,
                "descuento": 0.0,
                "impuestos": 150.0 * quantity_per_sale * 0.19,
                "total": 150.0 * quantity_per_sale * 1.19,
                "metodo_pago": "EFECTIVO",
                "items": [
                    {
                        "product_id": test_product.id,
                        "cantidad": quantity_per_sale,
                        "precio_unitario": 150.0,
                        "descuento": 0.0
                    }
                ]
            }

            response = client.post("/sales", json=sale_data, headers=headers)
            assert response.status_code == 200

        # Verify final stock
        db_session.refresh(test_product)
        expected_final_stock = initial_stock - (quantity_per_sale * number_of_sales)
        assert test_product.stock_actual == expected_final_stock

        # Verify all movements were created
        movements = db_session.query(InventoryMovement).filter(
            InventoryMovement.product_id == test_product.id,
            InventoryMovement.tipo == MovementType.SALIDA
        ).all()

        assert len(movements) >= number_of_sales

    def test_sale_creates_correct_sale_items_records(
        self, client, db_session, test_user, test_client_record
    ):
        """
        Test that sale items are correctly created and linked to the sale
        """
        token = create_access_token(data={"sub": test_user.username})
        headers = {"Authorization": f"Bearer {token}"}

        # Create products
        products = []
        for i in range(3):
            product = Product(
                codigo=f"SALE-ITEM-{i}",
                nombre=f"Sale Item Product {i}",
                categoria=ProductCategory.ACCESORIOS,
                precio_compra=100.0,
                precio_venta=150.0,
                stock_actual=100,
                stock_minimo=10,
                is_active=True
            )
            db_session.add(product)
            products.append(product)

        db_session.commit()
        for p in products:
            db_session.refresh(p)

        # Create sale with multiple items
        sale_data = {
            "client_id": test_client_record.id,
            "subtotal": 450.0,
            "descuento": 0.0,
            "impuestos": 85.5,
            "total": 535.5,
            "metodo_pago": "EFECTIVO",
            "items": [
                {
                    "product_id": products[0].id,
                    "cantidad": 1,
                    "precio_unitario": 150.0,
                    "descuento": 0.0
                },
                {
                    "product_id": products[1].id,
                    "cantidad": 2,
                    "precio_unitario": 150.0,
                    "descuento": 0.0
                },
                {
                    "product_id": products[2].id,
                    "cantidad": 3,
                    "precio_unitario": 150.0,
                    "descuento": 150.0  # Discount on third item
                }
            ]
        }

        response = client.post("/sales", json=sale_data, headers=headers)
        assert response.status_code == 200
        sale = response.json()

        # Verify sale items were created
        sale_record = db_session.query(Sale).filter(
            Sale.numero_venta == sale["numero_venta"]
        ).first()

        assert len(sale_record.items) == 3

        # Verify each item
        items_by_product = {item.product_id: item for item in sale_record.items}

        assert products[0].id in items_by_product
        assert items_by_product[products[0].id].cantidad == 1

        assert products[1].id in items_by_product
        assert items_by_product[products[1].id].cantidad == 2

        assert products[2].id in items_by_product
        assert items_by_product[products[2].id].cantidad == 3
        assert items_by_product[products[2].id].descuento == 150.0

    def test_sale_with_zero_quantity_is_rejected(
        self, client, test_user, test_client_record, test_product
    ):
        """
        Test that sales with zero or negative quantity are rejected
        """
        token = create_access_token(data={"sub": test_user.username})
        headers = {"Authorization": f"Bearer {token}"}

        sale_data = {
            "client_id": test_client_record.id,
            "subtotal": 0.0,
            "descuento": 0.0,
            "impuestos": 0.0,
            "total": 0.0,
            "metodo_pago": "EFECTIVO",
            "items": [
                {
                    "product_id": test_product.id,
                    "cantidad": 0,  # Invalid quantity
                    "precio_unitario": 150.0,
                    "descuento": 0.0
                }
            ]
        }

        response = client.post("/sales", json=sale_data, headers=headers)

        # Should fail validation (either 400 or 422)
        assert response.status_code in [400, 422]
