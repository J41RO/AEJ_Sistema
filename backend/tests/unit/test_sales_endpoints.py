"""
Unit tests for sales endpoints (main.py - sales routes)
Tests the complete sales workflow including stock validation and inventory updates
"""
import pytest
from fastapi import HTTPException
from auth import create_access_token


@pytest.mark.unit
@pytest.mark.sales
class TestSalesEndpoints:
    """Test sales-related API endpoints"""

    def test_get_sales_returns_list(self, client, test_user):
        """Test that GET /sales returns a list of sales"""
        # Create access token
        token = create_access_token(data={"sub": test_user.username})
        headers = {"Authorization": f"Bearer {token}"}

        response = client.get("/sales", headers=headers)

        assert response.status_code == 200
        assert isinstance(response.json(), list)

    def test_get_sales_requires_authentication(self, client):
        """Test that GET /sales requires authentication"""
        response = client.get("/sales")

        assert response.status_code == 403  # No auth header

    def test_get_sales_pagination_works(self, client, test_user, db_session):
        """Test that pagination works for sales list"""
        token = create_access_token(data={"sub": test_user.username})
        headers = {"Authorization": f"Bearer {token}"}

        # Test with limit
        response = client.get("/sales?skip=0&limit=5", headers=headers)

        assert response.status_code == 200
        sales = response.json()
        assert len(sales) <= 5

    def test_create_sale_success(self, client, test_user, test_client_record, test_product):
        """Test successful sale creation"""
        token = create_access_token(data={"sub": test_user.username})
        headers = {"Authorization": f"Bearer {token}"}

        sale_data = {
            "client_id": test_client_record.id,
            "subtotal": 150.0,
            "descuento": 0.0,
            "impuestos": 28.5,
            "total": 178.5,
            "metodo_pago": "EFECTIVO",
            "notas": "Test sale",
            "items": [
                {
                    "product_id": test_product.id,
                    "cantidad": 1,
                    "precio_unitario": 150.0,
                    "descuento": 0.0
                }
            ]
        }

        response = client.post("/sales", json=sale_data, headers=headers)

        assert response.status_code == 200
        sale = response.json()
        assert sale["total"] == 178.5
        assert sale["status"] == "COMPLETADA"
        assert "numero_venta" in sale
        assert sale["numero_venta"].startswith("VTA-")

    def test_create_sale_decreases_inventory(self, client, test_user, test_client_record, test_product, db_session):
        """Test that creating a sale decreases product inventory"""
        token = create_access_token(data={"sub": test_user.username})
        headers = {"Authorization": f"Bearer {token}"}

        initial_stock = test_product.stock_actual
        quantity_to_sell = 5

        sale_data = {
            "client_id": test_client_record.id,
            "subtotal": 750.0,
            "descuento": 0.0,
            "impuestos": 142.5,
            "total": 892.5,
            "metodo_pago": "EFECTIVO",
            "items": [
                {
                    "product_id": test_product.id,
                    "cantidad": quantity_to_sell,
                    "precio_unitario": 150.0,
                    "descuento": 0.0
                }
            ]
        }

        response = client.post("/sales", json=sale_data, headers=headers)

        assert response.status_code == 200

        # Refresh product from database
        db_session.refresh(test_product)

        # Stock should have decreased
        assert test_product.stock_actual == initial_stock - quantity_to_sell

    def test_create_sale_creates_inventory_movement(self, client, test_user, test_client_record, test_product, db_session):
        """Test that sale creates inventory movement record"""
        from models import InventoryMovement, MovementType

        token = create_access_token(data={"sub": test_user.username})
        headers = {"Authorization": f"Bearer {token}"}

        sale_data = {
            "client_id": test_client_record.id,
            "subtotal": 150.0,
            "descuento": 0.0,
            "impuestos": 28.5,
            "total": 178.5,
            "metodo_pago": "EFECTIVO",
            "items": [
                {
                    "product_id": test_product.id,
                    "cantidad": 3,
                    "precio_unitario": 50.0,
                    "descuento": 0.0
                }
            ]
        }

        response = client.post("/sales", json=sale_data, headers=headers)

        assert response.status_code == 200
        sale = response.json()

        # Check that inventory movement was created
        movement = db_session.query(InventoryMovement).filter(
            InventoryMovement.referencia == sale["numero_venta"]
        ).first()

        assert movement is not None
        assert movement.tipo == MovementType.SALIDA
        assert movement.cantidad == 3
        assert movement.product_id == test_product.id

    def test_create_sale_insufficient_stock_raises_400(self, client, test_user, test_client_record, test_product):
        """Test that sale with insufficient stock returns 400"""
        token = create_access_token(data={"sub": test_user.username})
        headers = {"Authorization": f"Bearer {token}"}

        # Try to sell more than available stock
        excessive_quantity = test_product.stock_actual + 100

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
                    "cantidad": excessive_quantity,
                    "precio_unitario": 150.0,
                    "descuento": 0.0
                }
            ]
        }

        response = client.post("/sales", json=sale_data, headers=headers)

        assert response.status_code == 400
        assert "Insufficient stock" in response.json()["detail"]

    def test_create_sale_invalid_product_raises_404(self, client, test_user, test_client_record):
        """Test that sale with non-existent product returns 404"""
        token = create_access_token(data={"sub": test_user.username})
        headers = {"Authorization": f"Bearer {token}"}

        sale_data = {
            "client_id": test_client_record.id,
            "subtotal": 150.0,
            "descuento": 0.0,
            "impuestos": 28.5,
            "total": 178.5,
            "metodo_pago": "EFECTIVO",
            "items": [
                {
                    "product_id": 99999,  # Non-existent product
                    "cantidad": 1,
                    "precio_unitario": 150.0,
                    "descuento": 0.0
                }
            ]
        }

        response = client.post("/sales", json=sale_data, headers=headers)

        assert response.status_code == 404
        assert "not found" in response.json()["detail"]

    def test_create_sale_calculates_totals_correctly(self, client, test_user, test_client_record, test_product):
        """Test that sale totals are calculated correctly"""
        token = create_access_token(data={"sub": test_user.username})
        headers = {"Authorization": f"Bearer {token}"}

        sale_data = {
            "client_id": test_client_record.id,
            "subtotal": 300.0,  # 2 items * 150
            "descuento": 30.0,  # 10% discount
            "impuestos": 51.3,  # 19% IVA on (300-30)
            "total": 321.3,
            "metodo_pago": "TARJETA",
            "items": [
                {
                    "product_id": test_product.id,
                    "cantidad": 2,
                    "precio_unitario": 150.0,
                    "descuento": 30.0
                }
            ]
        }

        response = client.post("/sales", json=sale_data, headers=headers)

        assert response.status_code == 200
        sale = response.json()

        assert sale["subtotal"] == 300.0
        assert sale["descuento"] == 30.0
        assert sale["impuestos"] == 51.3
        assert sale["total"] == 321.3

    def test_create_sale_requires_authentication(self, client, test_client_record, test_product):
        """Test that creating sale requires authentication"""
        sale_data = {
            "client_id": test_client_record.id,
            "subtotal": 150.0,
            "descuento": 0.0,
            "impuestos": 28.5,
            "total": 178.5,
            "metodo_pago": "EFECTIVO",
            "items": [
                {
                    "product_id": test_product.id,
                    "cantidad": 1,
                    "precio_unitario": 150.0,
                    "descuento": 0.0
                }
            ]
        }

        response = client.post("/sales", json=sale_data)

        assert response.status_code == 403  # No auth

    def test_create_sale_generates_sequential_numbers(self, client, test_user, test_client_record, test_product):
        """Test that sale numbers are generated sequentially"""
        token = create_access_token(data={"sub": test_user.username})
        headers = {"Authorization": f"Bearer {token}"}

        sale_data = {
            "client_id": test_client_record.id,
            "subtotal": 150.0,
            "descuento": 0.0,
            "impuestos": 28.5,
            "total": 178.5,
            "metodo_pago": "EFECTIVO",
            "items": [
                {
                    "product_id": test_product.id,
                    "cantidad": 1,
                    "precio_unitario": 150.0,
                    "descuento": 0.0
                }
            ]
        }

        # Create first sale
        response1 = client.post("/sales", json=sale_data, headers=headers)
        assert response1.status_code == 200
        sale1 = response1.json()

        # Create second sale
        response2 = client.post("/sales", json=sale_data, headers=headers)
        assert response2.status_code == 200
        sale2 = response2.json()

        # Extract numbers from sale codes
        num1 = int(sale1["numero_venta"].split("-")[1])
        num2 = int(sale2["numero_venta"].split("-")[1])

        # Second sale number should be greater than first
        assert num2 > num1

    def test_create_sale_with_multiple_products(self, client, test_user, test_client_record, test_product, db_session):
        """Test creating sale with multiple different products"""
        from models import Product, ProductCategory

        # Create second product
        product2 = Product(
            codigo="TEST-002",
            nombre="Second Test Product",
            categoria=ProductCategory.ACCESORIOS,
            precio_compra=50.0,
            precio_venta=75.0,
            stock_actual=30,
            stock_minimo=5,
            is_active=True
        )
        db_session.add(product2)
        db_session.commit()
        db_session.refresh(product2)

        token = create_access_token(data={"sub": test_user.username})
        headers = {"Authorization": f"Bearer {token}"}

        sale_data = {
            "client_id": test_client_record.id,
            "subtotal": 225.0,  # 150 + 75
            "descuento": 0.0,
            "impuestos": 42.75,
            "total": 267.75,
            "metodo_pago": "EFECTIVO",
            "items": [
                {
                    "product_id": test_product.id,
                    "cantidad": 1,
                    "precio_unitario": 150.0,
                    "descuento": 0.0
                },
                {
                    "product_id": product2.id,
                    "cantidad": 1,
                    "precio_unitario": 75.0,
                    "descuento": 0.0
                }
            ]
        }

        response = client.post("/sales", json=sale_data, headers=headers)

        assert response.status_code == 200
        sale = response.json()
        assert len(sale["items"]) == 2
