"""
Unit tests for health and status endpoints
Tests system health checks and status endpoints
"""
import pytest


@pytest.mark.unit
@pytest.mark.health
class TestHealthEndpoints:
    """Test health and status endpoints"""

    def test_health_endpoint_returns_ok(self, client):
        """Test that GET /health returns OK status"""
        response = client.get("/health")

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"

    def test_health_endpoint_no_authentication_required(self, client):
        """Test that health endpoint doesn't require authentication"""
        response = client.get("/health")

        # Should work without authentication
        assert response.status_code == 200

    def test_root_endpoint_returns_welcome(self, client):
        """Test that GET / returns welcome message"""
        response = client.get("/")

        assert response.status_code == 200
        data = response.json()
        assert "message" in data or "status" in data

    def test_api_status_endpoint_returns_info(self, client):
        """Test that GET /api/status returns API information"""
        response = client.get("/api/status")

        assert response.status_code == 200
        data = response.json()

        # Verify expected fields (actual implementation uses api_status)
        assert "api_status" in data or "status" in data or "version" in data

    def test_health_endpoints_return_json(self, client):
        """Test that all health endpoints return JSON"""
        endpoints = ["/health", "/", "/api/status"]

        for endpoint in endpoints:
            response = client.get(endpoint)
            assert response.status_code == 200
            assert response.headers["content-type"].startswith("application/json")

    def test_health_check_is_fast(self, client):
        """Test that health check responds quickly"""
        import time

        start = time.time()
        response = client.get("/health")
        duration = time.time() - start

        assert response.status_code == 200
        # Should respond in less than 1 second
        assert duration < 1.0

    def test_multiple_health_checks_consistent(self, client):
        """Test that multiple health checks return consistent results"""
        responses = []

        for _ in range(5):
            response = client.get("/health")
            responses.append(response.status_code)

        # All should return 200
        assert all(status == 200 for status in responses)
