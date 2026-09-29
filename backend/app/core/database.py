from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from backend.app.core.config import settings
from backend.app.core.logging import logger

# Declarative Base for all future database models
Base = declarative_base()

# SQLAlchemy Engine
# Note: For SQLite testing or PostgreSQL in dev/production
is_sqlite = settings.DATABASE_URL.startswith("sqlite")
connect_args = {"check_same_thread": False} if is_sqlite else {}

try:
    engine = create_engine(
        settings.DATABASE_URL,
        pool_pre_ping=True,
        echo=False,
        connect_args=connect_args
    )
except Exception as e:
    logger.error("Failed to initialize database engine: %s", str(e))
    engine = None

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine) if engine else None


def get_db() -> Generator[Session, None, None]:
    """
    FastAPI dependency that yields a database session per request
    and ensures proper teardown/closing.
    """
    if SessionLocal is None:
        raise RuntimeError("Database engine is not configured or failed to initialize.")
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
