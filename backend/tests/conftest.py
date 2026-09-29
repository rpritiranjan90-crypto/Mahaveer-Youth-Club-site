import os
os.environ["DATABASE_URL"] = "sqlite:///:memory:"
os.environ["API_ENV"] = "testing"

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient

from backend.app.core.config import settings
settings.DATABASE_URL = "sqlite:///:memory:"

from backend.app.core.database import Base, get_db
import backend.app.core.database as db_module
from backend.app.core.init_db import init_db
from backend.app.core.security import create_access_token
from backend.app.models.user import User

# In-memory SQLite test database with StaticPool so all connections share the same memory DB
from sqlalchemy.pool import StaticPool
test_engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

# Point db_module SessionLocal and engine to test_engine
db_module.engine = test_engine
db_module.SessionLocal = TestingSessionLocal

from backend.app.main import app


@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    """
    Initializes database schema once for test session.
    """
    Base.metadata.create_all(bind=test_engine)
    db = TestingSessionLocal()
    init_db(db)
    yield
    Base.metadata.drop_all(bind=test_engine)


@pytest.fixture(scope="function")
def db_session():
    """
    Yields an isolated database session per test function.
    """
    connection = test_engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)

    yield session

    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture(scope="function")
def client(db_session):
    """
    TestClient configured with overridden database session dependency.
    """
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture(scope="function")
def admin_token(db_session) -> str:
    """
    Returns valid admin Bearer token for test authorization.
    """
    admin = db_session.query(User).filter(User.email == "admin@mahaveeryouthclub.org").first()
    return create_access_token(subject=admin.id, role="admin")


@pytest.fixture(scope="function")
def admin_headers(admin_token: str) -> dict:
    """
    Returns Authorization headers with valid admin Bearer token.
    """
    return {"Authorization": f"Bearer {admin_token}"}
