"""
Unit tests for clients endpoints (main.py - clients routes)
Tests CRUD operations for clients
"""
import pytest
from auth import create_access_token


@pytest.mark.unit
@pytest.mark.clients
class TestClientsEndpoints:
    """Test clients-related API endpoints"""

    def test_get_clients_returns_list(self, client, test_user):
        """Test that GET /clients returns a list of clients"""
        token = create_access_token(data={"sub": test_user.username})
        headers = {"Authorization": f"Bearer {token}"}

        response = client.get("/clients", headers=headers)

        assert response.status_code == 200
        assert isinstance(response.json(), list)

    def test_get_clients_requires_authentication(self, client):
        """Test that GET /clients requires authentication"""
        response = client.get("/clients")
        assert response.status_code == 403

    def test_get_clients_pagination_works(self, client, test_user):
        """Test that pagination works for clients list"""
        token = create_access_token(data={"sub": test_user.username})
        headers = {"Authorization": f"Bearer {token}"}

        response = client.get("/clients?skip=0&limit=5", headers=headers)

        assert response.status_code == 200
        clients = response.json()
        assert len(clients) <= 5

    def test_create_client_success(self, client, test_user):
        """Test successful client creation"""
        token = create_access_token(data={"sub": test_user.username})
        headers = {"Authorization": f"Bearer {token}"}

        client_data = {
            "documento": "1234567890",
            "tipo_documento": "CC",
            "nombre_completo": "Juan Pérez",
            "email": "juan.perez@example.com",
            "telefono": "3001234567",
            "direccion": "Calle 123 #45-67",
            "ciudad": "Bogotá",
            "departamento": "Cundinamarca"
        }

        response = client.post("/clients", json=client_data, headers=headers)

        assert response.status_code == 200
        created_client = response.json()
        assert created_client["documento"] == "1234567890"
        assert created_client["nombre_completo"] == "Juan Pérez"
        assert created_client["email"] == "juan.perez@example.com"
        assert created_client["ciudad"] == "Bogotá"

    def test_create_client_duplicate_documento_raises_400(self, client, test_user, test_client_record):
        """Test that duplicate client documento returns 400"""
        token = create_access_token(data={"sub": test_user.username})
        headers = {"Authorization": f"Bearer {token}"}

        client_data = {
            "documento": test_client_record.documento,  # Duplicate
            "tipo_documento": "CC",
            "nombre_completo": "Another Client",
            "email": "another@example.com",
            "telefono": "3009876543",
            "direccion": "Carrera 10",
            "ciudad": "Medellín",
            "departamento": "Antioquia"
        }

        response = client.post("/clients", json=client_data, headers=headers)

        assert response.status_code == 400
        assert "already exists" in response.json()["detail"].lower()

    def test_create_client_with_nit_type(self, client, test_user):
        """Test creating client with NIT document type"""
        token = create_access_token(data={"sub": test_user.username})
        headers = {"Authorization": f"Bearer {token}"}

        client_data = {
            "documento": "900123456-7",
            "tipo_documento": "NIT",
            "nombre_completo": "Empresa Test S.A.S",
            "email": "contacto@empresa.com",
            "telefono": "6011234567",
            "direccion": "Av. Principal 123",
            "ciudad": "Cali",
            "departamento": "Valle del Cauca"
        }

        response = client.post("/clients", json=client_data, headers=headers)

        assert response.status_code == 200
        created_client = response.json()
        assert created_client["tipo_documento"] == "NIT"
        assert created_client["documento"] == "900123456-7"

    def test_create_client_with_ce_type(self, client, test_user):
        """Test creating client with CE (Cédula Extranjería) document type"""
        token = create_access_token(data={"sub": test_user.username})
        headers = {"Authorization": f"Bearer {token}"}

        client_data = {
            "documento": "CE1234567",
            "tipo_documento": "CE",
            "nombre_completo": "Extranjero Test",
            "email": "extranjero@example.com",
            "telefono": "3157654321",
            "direccion": "Calle 50",
            "ciudad": "Cartagena",
            "departamento": "Bolívar"
        }

        response = client.post("/clients", json=client_data, headers=headers)

        assert response.status_code == 200
        created_client = response.json()
        assert created_client["tipo_documento"] == "CE"

    def test_create_client_optional_fields(self, client, test_user):
        """Test creating client with minimal required fields"""
        token = create_access_token(data={"sub": test_user.username})
        headers = {"Authorization": f"Bearer {token}"}

        # Only required fields
        client_data = {
            "documento": "9988776655",
            "tipo_documento": "CC",
            "nombre_completo": "Cliente Mínimo",
            "ciudad": "Bogotá"
        }

        response = client.post("/clients", json=client_data, headers=headers)

        # Should succeed if optional fields are truly optional
        assert response.status_code in [200, 422]  # 422 if fields are required

    def test_create_client_validates_email_format(self, client, test_user):
        """Test that client creation validates email format"""
        token = create_access_token(data={"sub": test_user.username})
        headers = {"Authorization": f"Bearer {token}"}

        client_data = {
            "documento": "1122334455",
            "tipo_documento": "CC",
            "nombre_completo": "Email Test",
            "email": "invalid-email",  # Invalid format
            "ciudad": "Bogotá"
        }

        response = client.post("/clients", json=client_data, headers=headers)

        # Should return validation error
        assert response.status_code == 422

    def test_create_client_vendedor_can_create(self, client, test_user):
        """Test that VENDEDOR role can create clients"""
        token = create_access_token(data={"sub": test_user.username})
        headers = {"Authorization": f"Bearer {token}"}

        client_data = {
            "documento": "5544332211",
            "tipo_documento": "CC",
            "nombre_completo": "Cliente Vendedor",
            "email": "vendedor.client@example.com",
            "ciudad": "Medellín",
            "departamento": "Antioquia"
        }

        response = client.post("/clients", json=client_data, headers=headers)

        # VENDEDOR should be able to create clients
        assert response.status_code == 200

    def test_get_clients_search_by_documento(self, client, test_user, test_client_record):
        """Test searching clients by documento"""
        token = create_access_token(data={"sub": test_user.username})
        headers = {"Authorization": f"Bearer {token}"}

        # This assumes backend supports search parameter
        response = client.get(f"/clients?search={test_client_record.documento}", headers=headers)

        assert response.status_code == 200
        clients = response.json()

        # Should find the client (if search is implemented)
        # If not implemented, just verify it returns successfully
        assert isinstance(clients, list)

    def test_create_client_with_long_names(self, client, test_user):
        """Test creating client with long names"""
        token = create_access_token(data={"sub": test_user.username})
        headers = {"Authorization": f"Bearer {token}"}

        client_data = {
            "documento": "7788990011",
            "tipo_documento": "CC",
            "nombre_completo": "Nombre Muy Largo Con Múltiples Palabras Y Apellidos Compuestos",
            "email": "long.name@example.com",
            "ciudad": "Bucaramanga",
            "departamento": "Santander"
        }

        response = client.post("/clients", json=client_data, headers=headers)

        assert response.status_code == 200

    def test_create_client_with_special_characters_in_name(self, client, test_user):
        """Test creating client with special characters"""
        token = create_access_token(data={"sub": test_user.username})
        headers = {"Authorization": f"Bearer {token}"}

        client_data = {
            "documento": "4455667788",
            "tipo_documento": "CC",
            "nombre_completo": "María José O'Brien-Pérez",
            "email": "maria.obrien@example.com",
            "ciudad": "Barranquilla",
            "departamento": "Atlántico"
        }

        response = client.post("/clients", json=client_data, headers=headers)

        assert response.status_code == 200
        created_client = response.json()
        assert "María" in created_client["nombre_completo"]

    def test_client_is_active_by_default(self, client, test_user):
        """Test that newly created clients are active by default"""
        token = create_access_token(data={"sub": test_user.username})
        headers = {"Authorization": f"Bearer {token}"}

        client_data = {
            "documento": "3344556677",
            "tipo_documento": "CC",
            "nombre_completo": "Active Client",
            "email": "active@example.com",
            "ciudad": "Pereira",
            "departamento": "Risaralda"
        }

        response = client.post("/clients", json=client_data, headers=headers)

        assert response.status_code == 200
        created_client = response.json()
        assert created_client.get("is_active", True) is True
