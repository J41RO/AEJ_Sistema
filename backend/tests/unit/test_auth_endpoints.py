"""
Unit tests for auth endpoints (main.py - auth routes)
Tests login and authentication functionality
"""
import pytest


@pytest.mark.unit
@pytest.mark.auth
class TestAuthLoginEndpoint:
    """Test authentication login endpoint"""

    def test_login_with_valid_credentials(self, client, test_user):
        """Test successful login with valid credentials"""
        # Password for test_user is "testpassword123"
        login_data = {
            "username": test_user.username,
            "password": "testpassword123"
        }

        response = client.post("/auth/login", json=login_data)

        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "token_type" in data
        assert data["token_type"] == "bearer"
        assert len(data["access_token"]) > 0

    def test_login_with_invalid_username(self, client):
        """Test login with non-existent username"""
        login_data = {
            "username": "nonexistentuser",
            "password": "somepassword"
        }

        response = client.post("/auth/login", json=login_data)

        assert response.status_code == 401
        assert "incorrect" in response.json()["detail"].lower()

    def test_login_with_invalid_password(self, client, test_user):
        """Test login with wrong password"""
        login_data = {
            "username": test_user.username,
            "password": "wrongpassword"
        }

        response = client.post("/auth/login", json=login_data)

        assert response.status_code == 401
        assert "incorrect" in response.json()["detail"].lower()

    def test_login_token_can_be_used_for_authentication(self, client, test_user):
        """Test that login token can be used to access protected endpoints"""
        # Login
        login_data = {
            "username": test_user.username,
            "password": "testpassword123"
        }

        login_response = client.post("/auth/login", json=login_data)
        assert login_response.status_code == 200

        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Use token to access protected endpoint
        me_response = client.get("/auth/me", headers=headers)
        assert me_response.status_code == 200
        assert me_response.json()["username"] == test_user.username

