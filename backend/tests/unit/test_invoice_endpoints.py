"""
Unit tests for invoice endpoints (main.py - invoice routes)
Tests invoice retrieval and management
"""
import pytest
from auth import create_access_token


@pytest.mark.unit
@pytest.mark.invoice_endpoints
class TestInvoiceEndpoints:
    """Test invoice-related API endpoints"""

    def test_get_invoices_returns_list(self, client, test_admin):
        """Test that GET /api/invoices returns a list of invoices"""
        token = create_access_token(data={"sub": test_admin.username})
        headers = {"Authorization": f"Bearer {token}"}

        response = client.get("/api/invoices", headers=headers)

        assert response.status_code == 200
        assert isinstance(response.json(), list)

    def test_get_invoices_requires_authentication(self, client):
        """Test that GET /api/invoices requires authentication"""
        response = client.get("/api/invoices")
        assert response.status_code == 403

    def test_get_invoices_pagination_works(self, client, test_admin):
        """Test that pagination works for invoices list"""
        token = create_access_token(data={"sub": test_admin.username})
        headers = {"Authorization": f"Bearer {token}"}

        response = client.get("/api/invoices?skip=0&limit=5", headers=headers)

        assert response.status_code == 200
        invoices = response.json()
        assert len(invoices) <= 5

    def test_get_invoice_by_id_not_found(self, client, test_admin):
        """Test that non-existent invoice returns 404"""
        token = create_access_token(data={"sub": test_admin.username})
        headers = {"Authorization": f"Bearer {token}"}

        response = client.get("/api/invoices/99999", headers=headers)

        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()

    def test_delete_invoice_not_found(self, client, test_admin):
        """Test deleting non-existent invoice returns 404"""
        token = create_access_token(data={"sub": test_admin.username})
        headers = {"Authorization": f"Bearer {token}"}

        response = client.delete("/api/invoices/99999", headers=headers)

        assert response.status_code == 404

    def test_upload_invoice_requires_authentication(self, client):
        """Test that invoice upload requires authentication"""
        from io import BytesIO

        # Create fake PDF file
        pdf_content = b"%PDF-1.4 fake pdf content"
        files = {"file": ("invoice.pdf", BytesIO(pdf_content), "application/pdf")}

        response = client.post("/api/invoices/upload", files=files)

        assert response.status_code == 403

    def test_get_invoices_vendedor_can_view(self, client, test_user):
        """Test that VENDEDOR role can view invoices"""
        token = create_access_token(data={"sub": test_user.username})
        headers = {"Authorization": f"Bearer {token}"}

        response = client.get("/api/invoices", headers=headers)

        # VENDEDOR should be able to view invoices
        assert response.status_code == 200
