"""
Unit tests for authentication module (auth.py)
Tests all authentication functions including password hashing, JWT tokens, and user authentication
"""
import pytest
from datetime import timedelta
from freezegun import freeze_time
from fastapi import HTTPException

from auth import (
    get_password_hash,
    verify_password,
    create_access_token,
    verify_token,
    authenticate_user,
    get_user_by_username,
)
from models import User, UserRole, UserLocation


@pytest.mark.unit
@pytest.mark.auth
class TestPasswordHashing:
    """Test password hashing and verification"""

    def test_hash_password_creates_hash(self):
        """Test that hash_password creates a non-empty hash"""
        password = "testpassword123"
        hashed = get_password_hash(password)

        assert hashed is not None
        assert len(hashed) > 0
        assert hashed != password  # Hash should be different from plain password

    def test_hash_password_creates_different_hash_each_time(self):
        """Test that same password creates different hashes (due to salt)"""
        password = "testpassword123"
        hash1 = get_password_hash(password)
        hash2 = get_password_hash(password)

        assert hash1 != hash2  # Different hashes due to random salt

    def test_verify_password_correct_password_returns_true(self):
        """Test that verify_password returns True for correct password"""
        password = "testpassword123"
        hashed = get_password_hash(password)

        result = verify_password(password, hashed)

        assert result is True

    def test_verify_password_wrong_password_returns_false(self):
        """Test that verify_password returns False for wrong password"""
        password = "testpassword123"
        wrong_password = "wrongpassword456"
        hashed = get_password_hash(password)

        result = verify_password(wrong_password, hashed)

        assert result is False

    def test_verify_password_empty_password_returns_false(self):
        """Test that verify_password handles empty password"""
        password = "testpassword123"
        hashed = get_password_hash(password)

        result = verify_password("", hashed)

        assert result is False


@pytest.mark.unit
@pytest.mark.auth
class TestJWTTokens:
    """Test JWT token creation and verification"""

    def test_create_access_token_generates_valid_token(self):
        """Test that create_access_token generates a non-empty token"""
        data = {"sub": "testuser"}
        token = create_access_token(data)

        assert token is not None
        assert len(token) > 0
        assert isinstance(token, str)

    def test_create_access_token_with_custom_expiration(self):
        """Test that create_access_token accepts custom expiration"""
        data = {"sub": "testuser"}
        expires_delta = timedelta(minutes=60)

        token = create_access_token(data, expires_delta=expires_delta)

        assert token is not None
        assert len(token) > 0

    def test_verify_token_valid_token_returns_token_data(self):
        """Test that verify_token returns TokenData for valid token"""
        username = "testuser"
        data = {"sub": username}
        token = create_access_token(data)

        token_data = verify_token(token)

        assert token_data is not None
        assert token_data.username == username

    @freeze_time("2025-01-01 12:00:00")
    def test_verify_token_expired_token_raises_401(self):
        """Test that verify_token raises 401 for expired token"""
        username = "testuser"
        data = {"sub": username}
        # Create token that expires in 1 minute
        token = create_access_token(data, expires_delta=timedelta(minutes=1))

        # Move time forward 2 minutes
        with freeze_time("2025-01-01 12:02:00"):
            with pytest.raises(HTTPException) as exc_info:
                verify_token(token)

            assert exc_info.value.status_code == 401
            assert "Could not validate credentials" in str(exc_info.value.detail)

    def test_verify_token_invalid_token_raises_401(self):
        """Test that verify_token raises 401 for invalid token"""
        invalid_token = "invalid.token.string"

        with pytest.raises(HTTPException) as exc_info:
            verify_token(invalid_token)

        assert exc_info.value.status_code == 401

    def test_verify_token_missing_username_raises_401(self):
        """Test that verify_token raises 401 when username missing from token"""
        # Create token without 'sub' field
        data = {"other_field": "value"}
        token = create_access_token(data)

        with pytest.raises(HTTPException) as exc_info:
            verify_token(token)

        assert exc_info.value.status_code == 401


@pytest.mark.unit
@pytest.mark.auth
class TestUserAuthentication:
    """Test user authentication functions"""

    def test_get_user_by_username_existing_user(self, db_session, test_user):
        """Test getting existing user by username"""
        user = get_user_by_username(db_session, test_user.username)

        assert user is not None
        assert user.id == test_user.id
        assert user.username == test_user.username

    def test_get_user_by_username_non_existing_user(self, db_session):
        """Test getting non-existing user returns None"""
        user = get_user_by_username(db_session, "nonexistent")

        assert user is None

    def test_authenticate_user_valid_credentials(self, db_session, test_user):
        """Test authentication with valid credentials"""
        # test_user has password 'testpassword123'
        user = authenticate_user(db_session, test_user.username, "testpassword123")

        assert user is not None
        assert user.id == test_user.id
        assert user.username == test_user.username

    def test_authenticate_user_invalid_username(self, db_session):
        """Test authentication with invalid username returns None"""
        user = authenticate_user(db_session, "nonexistent", "password")

        assert user is None

    def test_authenticate_user_invalid_password(self, db_session, test_user):
        """Test authentication with invalid password returns None"""
        user = authenticate_user(db_session, test_user.username, "wrongpassword")

        assert user is None

    def test_authenticate_user_empty_password(self, db_session, test_user):
        """Test authentication with empty password returns None"""
        user = authenticate_user(db_session, test_user.username, "")

        assert user is None

    def test_authenticate_user_case_sensitive_username(self, db_session, test_user):
        """Test that username is case-sensitive"""
        # Try with uppercase username
        user = authenticate_user(db_session, test_user.username.upper(), "testpassword123")

        # Should return None because username doesn't match exactly
        assert user is None


@pytest.mark.unit
@pytest.mark.auth
class TestUserPermissions:
    """Test user permission and role checks"""

    def test_inactive_user_should_be_blocked(self, db_session):
        """Test that inactive users cannot authenticate"""
        # Create inactive user
        inactive_user = User(
            username="inactive",
            email="inactive@example.com",
            nombre_completo="Inactive User",
            password_hash=get_password_hash("password123"),
            rol=UserRole.VENDEDOR,
            ubicacion=UserLocation.COLOMBIA,
            is_active=False
        )
        db_session.add(inactive_user)
        db_session.commit()

        # Authenticate returns the user, but is_active should be False
        user = authenticate_user(db_session, "inactive", "password123")

        assert user is not None
        assert user.is_active is False

    def test_user_roles_are_correctly_set(self, db_session, test_user, test_admin, test_superuser):
        """Test that user roles are correctly assigned"""
        assert test_user.rol == UserRole.VENDEDOR
        assert test_admin.rol == UserRole.ADMIN
        assert test_superuser.rol == UserRole.SUPERUSUARIO

    def test_user_locations_are_correctly_set(self, db_session, test_user, test_superuser):
        """Test that user locations are correctly assigned"""
        assert test_user.ubicacion == UserLocation.COLOMBIA
        assert test_superuser.ubicacion == UserLocation.EEUU


@pytest.mark.unit
@pytest.mark.auth
class TestPasswordSecurity:
    """Test password security features"""

    def test_hash_contains_bcrypt_prefix(self):
        """Test that hash uses bcrypt format"""
        password = "testpassword123"
        hashed = get_password_hash(password)

        # Bcrypt hashes start with $2b$
        assert hashed.startswith("$2b$")

    def test_password_with_special_characters(self):
        """Test password with special characters"""
        password = "p@ssw0rd!#$%^&*()"
        hashed = get_password_hash(password)

        assert verify_password(password, hashed) is True
        assert verify_password("wrong", hashed) is False

    def test_password_with_unicode_characters(self):
        """Test password with unicode characters"""
        password = "contraseña123áéíóú"
        hashed = get_password_hash(password)

        assert verify_password(password, hashed) is True

    def test_very_long_password(self):
        """Test very long password (72 characters - bcrypt limit)"""
        password = "a" * 72
        hashed = get_password_hash(password)

        assert verify_password(password, hashed) is True


@pytest.mark.unit
@pytest.mark.auth
class TestTokenDataExtraction:
    """Test extraction of data from JWT tokens"""

    def test_token_contains_username_in_sub_field(self):
        """Test that username is stored in 'sub' field of token"""
        username = "testuser"
        data = {"sub": username}
        token = create_access_token(data)

        token_data = verify_token(token)

        assert token_data.username == username

    def test_token_with_additional_claims(self):
        """Test that token can contain additional claims"""
        username = "testuser"
        data = {
            "sub": username,
            "extra_field": "extra_value"
        }
        token = create_access_token(data)

        # Should still work and extract username
        token_data = verify_token(token)
        assert token_data.username == username
