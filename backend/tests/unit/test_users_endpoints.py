"""
Unit tests for users endpoints (main.py - users routes)
Tests user management and authentication endpoints
"""
import pytest
from auth import create_access_token


@pytest.mark.unit
@pytest.mark.users
class TestUsersEndpoints:
    """Test users-related API endpoints"""

    def test_get_users_returns_list(self, client, test_superuser):
        """Test that GET /users returns a list of users"""
        token = create_access_token(data={"sub": test_superuser.username})
        headers = {"Authorization": f"Bearer {token}"}

        response = client.get("/users", headers=headers)

        assert response.status_code == 200
        assert isinstance(response.json(), list)
        assert len(response.json()) > 0

    def test_get_users_requires_authentication(self, client):
        """Test that GET /users requires authentication"""
        response = client.get("/users")
        assert response.status_code == 403

    def test_create_user_success_superuser(self, client, test_superuser):
        """Test successful user creation by SUPERUSER"""
        token = create_access_token(data={"sub": test_superuser.username})
        headers = {"Authorization": f"Bearer {token}"}

        user_data = {
            "username": "newuser123",
            "email": "newuser123@example.com",
            "nombre_completo": "New User Test",
            "password": "SecurePass123!",
            "rol": "VENDEDOR",
            "ubicacion": "COLOMBIA",
            "is_active": True
        }

        response = client.post("/users", json=user_data, headers=headers)

        assert response.status_code == 200
        user = response.json()
        assert user["username"] == "newuser123"
        assert user["email"] == "newuser123@example.com"
        assert user["rol"] == "VENDEDOR"

    def test_create_user_requires_superuser_role(self, client, test_admin):
        """Test that creating user requires SUPERUSER role"""
        token = create_access_token(data={"sub": test_admin.username})
        headers = {"Authorization": f"Bearer {token}"}

        user_data = {
            "username": "shouldfail",
            "email": "shouldfail@example.com",
            "nombre_completo": "Should Fail",
            "password": "Password123!",
            "rol": "VENDEDOR",
            "ubicacion": "COLOMBIA",
            "is_active": True
        }

        response = client.post("/users", json=user_data, headers=headers)

        assert response.status_code == 403
        assert "superuser" in response.json()["detail"].lower()

    def test_get_auth_me_returns_current_user(self, client, test_user):
        """Test that GET /auth/me returns current authenticated user"""
        token = create_access_token(data={"sub": test_user.username})
        headers = {"Authorization": f"Bearer {token}"}

        response = client.get("/auth/me", headers=headers)

        assert response.status_code == 200
        user = response.json()
        assert user["username"] == test_user.username
        assert user["email"] == test_user.email

    def test_get_auth_me_requires_authentication(self, client):
        """Test that GET /auth/me requires authentication"""
        response = client.get("/auth/me")
        assert response.status_code == 403
