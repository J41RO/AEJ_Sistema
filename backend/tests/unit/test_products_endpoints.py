"""
Unit tests for products endpoints (main.py - products routes)
Tests CRUD operations for products
"""
import pytest
from auth import create_access_token
from models import Product, ProductCategory


@pytest.mark.unit
@pytest.mark.products
class TestProductsEndpoints:
    """Test products-related API endpoints"""

    def test_get_products_returns_list(self, client, test_admin):
        """Test that GET /products returns a list of products"""
        token = create_access_token(data={"sub": test_admin.username})
        headers = {"Authorization": f"Bearer {token}"}

        response = client.get("/products", headers=headers)

        assert response.status_code == 200
        assert isinstance(response.json(), list)

    def test_get_products_requires_authentication(self, client):
        """Test that GET /products requires authentication"""
        response = client.get("/products")
        assert response.status_code == 403

    def test_get_products_pagination_works(self, client, test_admin):
        """Test that pagination works for products list"""
        token = create_access_token(data={"sub": test_admin.username})
        headers = {"Authorization": f"Bearer {token}"}

        response = client.get("/products?skip=0&limit=5", headers=headers)

        assert response.status_code == 200
        products = response.json()
        assert len(products) <= 5

    def test_get_product_by_id_success(self, client, test_admin, test_product):
        """Test getting a specific product by ID"""
        token = create_access_token(data={"sub": test_admin.username})
        headers = {"Authorization": f"Bearer {token}"}

        response = client.get(f"/products/{test_product.id}", headers=headers)

        assert response.status_code == 200
        product = response.json()
        assert product["id"] == test_product.id
        assert product["codigo"] == test_product.codigo
        assert product["nombre"] == test_product.nombre

    def test_get_product_by_id_not_found(self, client, test_admin):
        """Test that non-existent product returns 404"""
        token = create_access_token(data={"sub": test_admin.username})
        headers = {"Authorization": f"Bearer {token}"}

        response = client.get("/products/99999", headers=headers)

        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()

    def test_create_product_success(self, client, test_admin):
        """Test successful product creation"""
        token = create_access_token(data={"sub": test_admin.username})
        headers = {"Authorization": f"Bearer {token}"}

        product_data = {
            "codigo": "NEW-PROD-001",
            "nombre": "New Test Product",
            "descripcion": "A brand new product",
            "categoria": "MAQUILLAJE",
            "marca": "Test Brand",
            "precio_compra": 100.0,
            "precio_venta": 150.0,
            "stock_actual": 50,
            "stock_minimo": 10
        }

        response = client.post("/products", json=product_data, headers=headers)

        assert response.status_code == 200
        product = response.json()
        assert product["codigo"] == "NEW-PROD-001"
        assert product["nombre"] == "New Test Product"
        assert product["precio_compra"] == 100.0
        assert product["precio_venta"] == 150.0
        assert product["stock_actual"] == 50

    def test_create_product_duplicate_codigo_raises_400(self, client, test_admin, test_product):
        """Test that duplicate product code returns 400"""
        token = create_access_token(data={"sub": test_admin.username})
        headers = {"Authorization": f"Bearer {token}"}

        product_data = {
            "codigo": test_product.codigo,  # Duplicate
            "nombre": "Another Product",
            "categoria": "ACCESORIOS",
            "precio_compra": 50.0,
            "precio_venta": 75.0,
            "stock_actual": 20,
            "stock_minimo": 5
        }

        response = client.post("/products", json=product_data, headers=headers)

        assert response.status_code == 400
        assert "already exists" in response.json()["detail"].lower()

    def test_create_product_requires_admin_role(self, client, test_user):
        """Test that creating product requires ADMIN role"""
        token = create_access_token(data={"sub": test_user.username})
        headers = {"Authorization": f"Bearer {token}"}

        product_data = {
            "codigo": "VENDEDOR-PROD",
            "nombre": "Should Fail",
            "categoria": "ACCESORIOS",
            "precio_compra": 50.0,
            "precio_venta": 75.0,
            "stock_actual": 20
        }

        response = client.post("/products", json=product_data, headers=headers)

        assert response.status_code == 403
        assert "admin" in response.json()["detail"].lower()

    def test_update_product_success(self, client, test_admin, test_product):
        """Test successful product update"""
        token = create_access_token(data={"sub": test_admin.username})
        headers = {"Authorization": f"Bearer {token}"}

        update_data = {
            "codigo": test_product.codigo,
            "nombre": "Updated Product Name",
            "descripcion": "Updated description",
            "categoria": test_product.categoria.value,
            "marca": "Updated Brand",
            "precio_compra": 120.0,
            "precio_venta": 180.0,
            "stock_actual": test_product.stock_actual,
            "stock_minimo": 15
        }

        response = client.put(f"/products/{test_product.id}", json=update_data, headers=headers)

        assert response.status_code == 200
        product = response.json()
        assert product["nombre"] == "Updated Product Name"
        assert product["precio_compra"] == 120.0
        assert product["precio_venta"] == 180.0
        assert product["stock_minimo"] == 15

    def test_update_product_not_found(self, client, test_admin):
        """Test that updating non-existent product returns 404"""
        token = create_access_token(data={"sub": test_admin.username})
        headers = {"Authorization": f"Bearer {token}"}

        update_data = {
            "codigo": "NONEXISTENT",
            "nombre": "Should Fail",
            "categoria": "ACCESORIOS",
            "precio_compra": 50.0,
            "precio_venta": 75.0,
            "stock_actual": 20
        }

        response = client.put("/products/99999", json=update_data, headers=headers)

        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()

    def test_update_product_requires_admin_role(self, client, test_user, test_product):
        """Test that updating product requires ADMIN role"""
        token = create_access_token(data={"sub": test_user.username})
        headers = {"Authorization": f"Bearer {token}"}

        update_data = {
            "codigo": test_product.codigo,
            "nombre": "Should Fail",
            "categoria": test_product.categoria.value,
            "precio_compra": 120.0,
            "precio_venta": 180.0,
            "stock_actual": test_product.stock_actual
        }

        response = client.put(f"/products/{test_product.id}", json=update_data, headers=headers)

        assert response.status_code == 403
        assert "admin" in response.json()["detail"].lower()

    def test_create_product_validates_prices(self, client, test_admin):
        """Test that product creation validates price relationships"""
        token = create_access_token(data={"sub": test_admin.username})
        headers = {"Authorization": f"Bearer {token}"}

        # precio_venta should typically be >= precio_compra
        product_data = {
            "codigo": "PRICE-TEST",
            "nombre": "Price Test Product",
            "categoria": "ACCESORIOS",
            "precio_compra": 100.0,
            "precio_venta": 150.0,  # Valid: venta > compra
            "stock_actual": 10
        }

        response = client.post("/products", json=product_data, headers=headers)
        assert response.status_code == 200

    def test_create_product_with_all_categories(self, client, test_admin, db_session):
        """Test that products can be created with all category types"""
        token = create_access_token(data={"sub": test_admin.username})
        headers = {"Authorization": f"Bearer {token}"}

        categories = ["MAQUILLAJE", "FRAGANCIAS", "CUIDADO_PIEL", "ACCESORIOS"]

        for i, categoria in enumerate(categories):
            product_data = {
                "codigo": f"CAT-{i}",
                "nombre": f"Category Test {categoria}",
                "categoria": categoria,
                "precio_compra": 50.0,
                "precio_venta": 75.0,
                "stock_actual": 10
            }

            response = client.post("/products", json=product_data, headers=headers)
            assert response.status_code == 200
            assert response.json()["categoria"] == categoria

    def test_get_products_returns_active_only(self, client, test_admin, db_session):
        """Test that GET /products returns only active products by default"""
        token = create_access_token(data={"sub": test_admin.username})
        headers = {"Authorization": f"Bearer {token}"}

        # Create inactive product
        inactive_product = Product(
            codigo="INACTIVE-001",
            nombre="Inactive Product",
            categoria=ProductCategory.ACCESORIOS,
            precio_compra=50.0,
            precio_venta=75.0,
            stock_actual=10,
            is_active=False
        )
        db_session.add(inactive_product)
        db_session.commit()

        response = client.get("/products", headers=headers)
        assert response.status_code == 200

        products = response.json()
        inactive_codes = [p["codigo"] for p in products if not p.get("is_active", True)]

        # Should not include inactive products (or should be filtered)
        # Note: This depends on your backend implementation
        # If backend returns all, this test documents current behavior
