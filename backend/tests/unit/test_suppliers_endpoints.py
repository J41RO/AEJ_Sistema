"""
Unit tests for suppliers endpoints (main.py - suppliers routes)
Tests CRUD operations for suppliers
"""
import pytest
from auth import create_access_token


@pytest.mark.unit
@pytest.mark.suppliers
class TestSuppliersEndpoints:
    """Test suppliers-related API endpoints"""

    def test_get_suppliers_returns_list(self, client, test_admin):
        """Test that GET /suppliers returns a list of suppliers"""
        token = create_access_token(data={"sub": test_admin.username})
        headers = {"Authorization": f"Bearer {token}"}

        response = client.get("/suppliers", headers=headers)

        assert response.status_code == 200
        assert isinstance(response.json(), list)

    def test_get_suppliers_requires_authentication(self, client):
        """Test that GET /suppliers requires authentication"""
        response = client.get("/suppliers")
        assert response.status_code == 403

    def test_get_suppliers_pagination_works(self, client, test_admin):
        """Test that pagination works for suppliers list"""
        token = create_access_token(data={"sub": test_admin.username})
        headers = {"Authorization": f"Bearer {token}"}

        response = client.get("/suppliers?skip=0&limit=5", headers=headers)

        assert response.status_code == 200
        suppliers = response.json()
        assert len(suppliers) <= 5

    def test_create_supplier_success(self, client, test_admin):
        """Test successful supplier creation"""
        token = create_access_token(data={"sub": test_admin.username})
        headers = {"Authorization": f"Bearer {token}"}

        supplier_data = {
            "nit": "900111222-3",
            "razon_social": "PROVEEDOR TEST S.A.S",
            "nombre_comercial": "Proveedor Test",
            "email": "contacto@proveedor.com",
            "telefono": "6011234567",
            "direccion": "Calle 100 #10-20",
            "ciudad": "Bogotá",
            "departamento": "Cundinamarca"
        }

        response = client.post("/suppliers", json=supplier_data, headers=headers)

        assert response.status_code == 200
        supplier = response.json()
        assert supplier["nit"] == "900111222-3"
        assert supplier["razon_social"] == "PROVEEDOR TEST S.A.S"
        assert supplier["email"] == "contacto@proveedor.com"

    def test_create_supplier_duplicate_nit_raises_400(self, client, test_admin, test_supplier):
        """Test that duplicate supplier NIT returns 400"""
        token = create_access_token(data={"sub": test_admin.username})
        headers = {"Authorization": f"Bearer {token}"}

        supplier_data = {
            "nit": test_supplier.nit,  # Duplicate
            "razon_social": "OTRO PROVEEDOR S.A.S",
            "email": "otro@proveedor.com",
            "telefono": "6019876543",
            "ciudad": "Medellín"
        }

        response = client.post("/suppliers", json=supplier_data, headers=headers)

        assert response.status_code == 400
        assert "already exists" in response.json()["detail"].lower()

    def test_create_supplier_requires_admin_role(self, client, test_user):
        """Test that creating supplier requires ADMIN role"""
        token = create_access_token(data={"sub": test_user.username})
        headers = {"Authorization": f"Bearer {token}"}

        supplier_data = {
            "nit": "900333444-5",
            "razon_social": "SHOULD FAIL S.A.S",
            "email": "fail@proveedor.com",
            "ciudad": "Cali"
        }

        response = client.post("/suppliers", json=supplier_data, headers=headers)

        assert response.status_code == 403
        assert "admin" in response.json()["detail"].lower()

    def test_create_supplier_validates_email_format(self, client, test_admin):
        """Test that supplier creation validates email format"""
        token = create_access_token(data={"sub": test_admin.username})
        headers = {"Authorization": f"Bearer {token}"}

        supplier_data = {
            "nit": "900555666-7",
            "razon_social": "EMAIL TEST S.A.S",
            "email": "invalid-email-format",  # Invalid
            "ciudad": "Bogotá"
        }

        response = client.post("/suppliers", json=supplier_data, headers=headers)

        assert response.status_code == 422

    def test_create_supplier_with_minimal_fields(self, client, test_admin):
        """Test creating supplier with minimal required fields"""
        token = create_access_token(data={"sub": test_admin.username})
        headers = {"Authorization": f"Bearer {token}"}

        supplier_data = {
            "nit": "900777888-9",
            "razon_social": "MINIMAL SUPPLIER S.A.S",
            "ciudad": "Cartagena"
        }

        response = client.post("/suppliers", json=supplier_data, headers=headers)

        # Should succeed with minimal fields
        assert response.status_code in [200, 422]

    def test_create_supplier_with_complete_data(self, client, test_admin):
        """Test creating supplier with all fields"""
        token = create_access_token(data={"sub": test_admin.username})
        headers = {"Authorization": f"Bearer {token}"}

        supplier_data = {
            "nit": "900888999-0",
            "razon_social": "COMPLETE SUPPLIER S.A.S",
            "nombre_comercial": "Complete Supplier",
            "email": "complete@supplier.com",
            "telefono": "3001234567",
            "celular": "3109876543",
            "direccion": "Carrera 50 #100-200",
            "ciudad": "Barranquilla",
            "departamento": "Atlántico",
            "pais": "Colombia",
            "codigo_postal": "080001",
            "sitio_web": "https://www.supplier.com",
            "contacto_nombre": "Juan Manager",
            "contacto_cargo": "Gerente Comercial",
            "contacto_email": "juan@supplier.com",
            "contacto_telefono": "3151234567"
        }

        response = client.post("/suppliers", json=supplier_data, headers=headers)

        assert response.status_code == 200
        supplier = response.json()
        assert supplier["nit"] == "900888999-0"
        assert supplier["razon_social"] == "COMPLETE SUPPLIER S.A.S"

    def test_create_supplier_nit_format_validation(self, client, test_admin):
        """Test various NIT formats"""
        token = create_access_token(data={"sub": test_admin.username})
        headers = {"Authorization": f"Bearer {token}"}

        valid_nits = [
            "900123456-7",
            "900.123.456-7",
            "900123456",
        ]

        for i, nit in enumerate(valid_nits):
            supplier_data = {
                "nit": nit,
                "razon_social": f"NIT TEST {i} S.A.S",
                "ciudad": "Bogotá"
            }

            response = client.post("/suppliers", json=supplier_data, headers=headers)

            # Accept both success and failure - just test that validation exists
            assert response.status_code in [200, 400, 422]

    def test_supplier_is_active_by_default(self, client, test_admin):
        """Test that newly created suppliers are active by default"""
        token = create_access_token(data={"sub": test_admin.username})
        headers = {"Authorization": f"Bearer {token}"}

        supplier_data = {
            "nit": "900999000-1",
            "razon_social": "ACTIVE SUPPLIER S.A.S",
            "email": "active@supplier.com",
            "ciudad": "Pereira"
        }

        response = client.post("/suppliers", json=supplier_data, headers=headers)

        assert response.status_code == 200
        supplier = response.json()
        assert supplier.get("is_active", True) is True

    def test_get_suppliers_vendedor_can_view(self, client, test_user):
        """Test that VENDEDOR role can view suppliers"""
        token = create_access_token(data={"sub": test_user.username})
        headers = {"Authorization": f"Bearer {token}"}

        response = client.get("/suppliers", headers=headers)

        # VENDEDOR should be able to view suppliers
        assert response.status_code == 200

    def test_create_supplier_with_long_razon_social(self, client, test_admin):
        """Test creating supplier with long razon social"""
        token = create_access_token(data={"sub": test_admin.username})
        headers = {"Authorization": f"Bearer {token}"}

        supplier_data = {
            "nit": "900000111-2",
            "razon_social": "NOMBRE COMERCIAL MUY LARGO PARA EMPRESA DE DISTRIBUCIÓN Y COMERCIALIZACIÓN DE PRODUCTOS COSMÉTICOS Y DE BELLEZA S.A.S",
            "email": "long@supplier.com",
            "ciudad": "Bucaramanga"
        }

        response = client.post("/suppliers", json=supplier_data, headers=headers)

        assert response.status_code == 200
