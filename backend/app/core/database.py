from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase, Session
from backend.app.core.config import settings
from backend.app.core.logging import logger

# Configure Engine
# For SQLite (tests), require check_same_thread=False
connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args["check_same_thread"] = False

engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True,
)

# Session Factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# Declarative Base for SQLAlchemy 2.0
class Base(DeclarativeBase):
    pass


def get_db() -> Generator[Session, None, None]:
    """
    FastAPI dependency that yields a SQLAlchemy database session.
    Guarantees session cleanup after request completion.
    """
    db = SessionLocal()
    try:
        yield db
    except Exception as e:
        logger.error("Database session error: %s", str(e))
        db.rollback()
        raise
    finally:
        db.close()
