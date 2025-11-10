"""
Unit tests for dashboard endpoints (main.py - dashboard routes)
Tests dashboard metrics and statistics
"""
import pytest
from auth import create_access_token
from models import Sale, SaleStatus, Product, ProductCategory
from datetime import datetime, timedelta


@pytest.mark.unit
@pytest.mark.dashboard
class TestDashboardEndpoints:
    """Test dashboard-related API endpoints"""

    def test_get_dashboard_metrics_requires_authentication(self, client):
        """Test that GET /dashboard/metrics requires authentication"""
        response = client.get("/dashboard/metrics")
        assert response.status_code == 403

    def test_get_dashboard_metrics_success(self, client, test_admin):
        """Test successful dashboard metrics retrieval"""
        token = create_access_token(data={"sub": test_admin.username})
        headers = {"Authorization": f"Bearer {token}"}

        response = client.get("/dashboard/metrics", headers=headers)

        assert response.status_code == 200
        metrics = response.json()

        # Verify expected structure (Spanish field names)
        assert "total_ventas_hoy" in metrics
        assert "total_productos" in metrics
        assert "stock_bajo" in metrics
        assert "total_clientes" in metrics
        assert "ventas_mes" in metrics
        assert "productos_mas_vendidos" in metrics
        assert "alertas" in metrics

    def test_dashboard_metrics_returns_correct_types(self, client, test_admin):
        """Test that dashboard metrics return correct data types"""
        token = create_access_token(data={"sub": test_admin.username})
        headers = {"Authorization": f"Bearer {token}"}

        response = client.get("/dashboard/metrics", headers=headers)

        assert response.status_code == 200
        metrics = response.json()

        # Check types (Spanish field names)
        assert isinstance(metrics["total_ventas_hoy"], (int, float))
        assert isinstance(metrics["total_productos"], int)
        assert isinstance(metrics["stock_bajo"], int)
        assert isinstance(metrics["total_clientes"], int)
        assert isinstance(metrics["ventas_mes"], (int, float))
        assert isinstance(metrics["productos_mas_vendidos"], list)
        assert isinstance(metrics["alertas"], list)

    def test_dashboard_metrics_vendedor_can_access(self, client, test_user):
        """Test that VENDEDOR role can access dashboard"""
        token = create_access_token(data={"sub": test_user.username})
        headers = {"Authorization": f"Bearer {token}"}

        response = client.get("/dashboard/metrics", headers=headers)

        # VENDEDOR should be able to view dashboard
        assert response.status_code == 200

    def test_dashboard_counts_total_products(self, client, test_admin, test_product, db_session):
        """Test that dashboard counts total products correctly"""
        token = create_access_token(data={"sub": test_admin.username})
        headers = {"Authorization": f"Bearer {token}"}

        response = client.get("/dashboard/metrics", headers=headers)

        assert response.status_code == 200
        metrics = response.json()

        # Should have at least the test_product
        assert metrics["total_productos"] >= 1

    def test_dashboard_identifies_low_stock_products(self, client, test_admin, db_session):
        """Test that dashboard identifies products with low stock"""
        token = create_access_token(data={"sub": test_admin.username})
        headers = {"Authorization": f"Bearer {token}"}

        # Create product with low stock
        low_stock_product = Product(
            codigo="LOW-STOCK-001",
            nombre="Low Stock Product",
            categoria=ProductCategory.ACCESORIOS,
            precio_compra=50.0,
            precio_venta=75.0,
            stock_actual=3,  # Below minimum
            stock_minimo=10,
            is_active=True
        )
        db_session.add(low_stock_product)
        db_session.commit()

        response = client.get("/dashboard/metrics", headers=headers)

        assert response.status_code == 200
        metrics = response.json()

        # Should detect at least one low stock product
        assert metrics["stock_bajo"] >= 1

    def test_dashboard_alertas_structure(self, client, test_admin):
        """Test that alertas have correct structure"""
        token = create_access_token(data={"sub": test_admin.username})
        headers = {"Authorization": f"Bearer {token}"}

        response = client.get("/dashboard/metrics", headers=headers)

        assert response.status_code == 200
        metrics = response.json()

        # Alertas should be a list
        assert isinstance(metrics["alertas"], list)

        if len(metrics["alertas"]) > 0:
            alert = metrics["alertas"][0]
            # Verify alert has expected fields
            assert "tipo" in alert
            assert "mensaje" in alert

    def test_dashboard_metrics_with_no_data(self, client, test_admin, db_session):
        """Test dashboard with minimal/no data returns valid response"""
        token = create_access_token(data={"sub": test_admin.username})
        headers = {"Authorization": f"Bearer {token}"}

        response = client.get("/dashboard/metrics", headers=headers)

        assert response.status_code == 200
        metrics = response.json()

        # All counts should be >= 0 (Spanish field names)
        assert metrics["total_ventas_hoy"] >= 0
        assert metrics["ventas_mes"] >= 0
        assert metrics["total_productos"] >= 0
        assert metrics["stock_bajo"] >= 0
        assert metrics["total_clientes"] >= 0
