import os
os.environ["APP_ENV"] = "testing"
os.environ["DATABASE_URL"] = "sqlite:///:memory:"

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from fastapi.testclient import TestClient

from backend.app.core.config import settings
settings.DATABASE_URL = "sqlite:///:memory:"
settings.APP_ENV = "testing"

from backend.app.core.database import Base, get_db
import backend.app.core.database as db_module
from backend.app.core.rate_limit import login_rate_limiter
from backend.app.core.security import hash_password
from backend.app.main import app
from backend.app.models.user import User

# In-memory SQLite test database with StaticPool
test_engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

db_module.engine = test_engine
db_module.SessionLocal = TestingSessionLocal


@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    """
    Initializes database schema once for test session.
    """
    Base.metadata.create_all(bind=test_engine)
    yield
    Base.metadata.drop_all(bind=test_engine)


@pytest.fixture(scope="function", autouse=True)
def reset_rate_limiter():
    """
    Clears rate limiter state before each test.
    """
    login_rate_limiter.clear_all()
    yield
    login_rate_limiter.clear_all()


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


@pytest.fixture
def test_admin_user(db_session) -> User:
    """
    Creates a standard active test admin user.
    """
    user = User(
        email="admin@banza.org",
        password_hash=hash_password("SecureAdminPassword123!"),
        is_active=True,
        is_admin=True,
        totp_enabled=False,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def test_non_admin_user(db_session) -> User:
    """
    Creates a non-admin active user.
    """
    user = User(
        email="volunteer@banza.org",
        password_hash=hash_password("VolunteerPass123!"),
        is_active=True,
        is_admin=False,
        totp_enabled=False,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user
