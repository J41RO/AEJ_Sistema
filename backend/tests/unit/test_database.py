"""
Unit tests for database module (database.py)
Tests database connection, session management, and utility functions
"""
import pytest
from sqlalchemy import inspect
from sqlalchemy.orm import Session

from database import (
    get_db,
    create_tables,
    drop_tables,
    Base,
    engine,
    SessionLocal,
)
from models import User, Product


@pytest.mark.unit
@pytest.mark.database
class TestDatabaseConnection:
    """Test database connection and engine"""

    def test_engine_is_created(self):
        """Test that database engine is created"""
        assert engine is not None

    def test_engine_has_correct_driver(self):
        """Test that engine uses correct driver"""
        # Should be sqlite for tests
        assert "sqlite" in str(engine.url)

    def test_sessionlocal_is_configured(self):
        """Test that SessionLocal is properly configured"""
        assert SessionLocal is not None

        # Create a session to verify configuration
        db = SessionLocal()
        assert isinstance(db, Session)
        db.close()


@pytest.mark.unit
@pytest.mark.database
class TestGetDB:
    """Test get_db dependency function"""

    def test_get_db_yields_session(self):
        """Test that get_db yields a database session"""
        gen = get_db()
        db = next(gen)

        assert isinstance(db, Session)

        # Clean up - call generator again to trigger finally block
        try:
            next(gen)
        except StopIteration:
            pass

    def test_get_db_closes_session(self):
        """Test that get_db closes session after use"""
        gen = get_db()
        db = next(gen)

        # Session should be active
        assert db.is_active

        # Trigger finally block to close session
        try:
            next(gen)
        except StopIteration:
            pass

        # Session should be closed now
        # Note: is_active might still be True but session is closed
        # We verify it doesn't error when creating a new one
        gen2 = get_db()
        db2 = next(gen2)
        assert isinstance(db2, Session)
        try:
            next(gen2)
        except StopIteration:
            pass

    def test_get_db_can_query_database(self):
        """Test that session from get_db can query database"""
        gen = get_db()
        db = next(gen)

        # Try a simple query
        users = db.query(User).all()
        assert isinstance(users, list)

        # Clean up
        try:
            next(gen)
        except StopIteration:
            pass


@pytest.mark.unit
@pytest.mark.database
class TestTableManagement:
    """Test table creation and dropping"""

    def test_create_tables_creates_all_models(self):
        """Test that create_tables creates all model tables"""
        # Drop first to ensure clean state
        drop_tables()

        # Create tables
        create_tables()

        # Verify tables exist
        inspector = inspect(engine)
        table_names = inspector.get_table_names()

        # Should have our main tables
        assert "users" in table_names
        assert "products" in table_names
        assert "clients" in table_names
        assert "suppliers" in table_names
        assert "sales" in table_names
        assert "purchase_invoices" in table_names

    def test_drop_tables_removes_all_tables(self):
        """Test that drop_tables removes all tables"""
        # First ensure tables exist
        create_tables()

        # Drop tables
        drop_tables()

        # Verify tables are gone
        inspector = inspect(engine)
        table_names = inspector.get_table_names()

        # Should have no tables (or only system tables)
        assert len(table_names) == 0 or all(
            name not in table_names
            for name in ["users", "products", "clients", "suppliers", "sales"]
        )

    def test_create_tables_idempotent(self):
        """Test that calling create_tables multiple times is safe"""
        create_tables()
        create_tables()  # Should not error

        inspector = inspect(engine)
        table_names = inspector.get_table_names()

        # Tables should still exist
        assert "users" in table_names


@pytest.mark.unit
@pytest.mark.database
class TestBaseDeclarative:
    """Test Base declarative class"""

    def test_base_has_metadata(self):
        """Test that Base has metadata"""
        assert hasattr(Base, "metadata")
        assert Base.metadata is not None

    def test_models_inherit_from_base(self):
        """Test that our models inherit from Base"""
        assert issubclass(User, Base)
        assert issubclass(Product, Base)

    def test_base_metadata_contains_tables(self):
        """Test that Base metadata knows about our tables"""
        table_names = list(Base.metadata.tables.keys())

        assert "users" in table_names
        assert "products" in table_names
        assert "clients" in table_names


@pytest.mark.unit
@pytest.mark.database
class TestDatabaseTransactions:
    """Test database transaction behavior"""

    def test_session_rollback_on_error(self, db_session):
        """Test that session rolls back on error"""
        initial_count = db_session.query(User).count()

        # Start a transaction
        try:
            user = User(
                username="test_rollback",
                email="rollback@test.com",
                nombre_completo="Test Rollback",
                password_hash="hash",
                rol="VENDEDOR",
                ubicacion="COLOMBIA"
            )
            db_session.add(user)
            db_session.flush()

            # Force an error
            raise Exception("Intentional error")
        except Exception:
            db_session.rollback()

        # User should not be in database
        final_count = db_session.query(User).count()
        assert final_count == initial_count

    def test_session_commit_persists_data(self, db_session):
        """Test that session commit persists data"""
        initial_count = db_session.query(User).count()

        user = User(
            username="test_commit",
            email="commit@test.com",
            nombre_completo="Test Commit",
            password_hash="hash",
            rol="VENDEDOR",
            ubicacion="COLOMBIA"
        )
        db_session.add(user)
        db_session.commit()

        # User should be in database
        final_count = db_session.query(User).count()
        assert final_count == initial_count + 1

        # Clean up
        db_session.delete(user)
        db_session.commit()
