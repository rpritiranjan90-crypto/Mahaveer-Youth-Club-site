import os
import sys
from sqlalchemy.orm import Session
from dotenv import load_dotenv

from backend.app.core.database import SessionLocal, Base, engine
from backend.app.core.logging import logger
from backend.app.core.security import hash_password
from backend.app.models.user import User
import backend.app.models  # noqa: F401


def init_first_superuser(db: Session) -> None:
    """
    Initializes the initial superuser from environment variables.
    Does not overwrite existing administrator accounts.
    """
    load_dotenv()
    Base.metadata.create_all(bind=engine)
    admin_email = os.getenv("FIRST_SUPERUSER_EMAIL")
    admin_password = os.getenv("FIRST_SUPERUSER_PASSWORD")

    if not admin_email or not admin_password:
        logger.info("FIRST_SUPERUSER_EMAIL or FIRST_SUPERUSER_PASSWORD not set; skipping auto-init.")
        return

    admin_email = admin_email.strip().lower()

    if len(admin_password) < 12:
        logger.error("FIRST_SUPERUSER_PASSWORD must be at least 12 characters long.")
        return

    existing_user = db.query(User).filter(User.email == admin_email).first()
    if existing_user:
        logger.info("Administrator account [%s] already exists.", admin_email)
        return

    hashed_pw = hash_password(admin_password)
    superuser = User(
        email=admin_email,
        password_hash=hashed_pw,
        is_active=True,
        is_admin=True,
        totp_enabled=False,
    )
    db.add(superuser)
    db.commit()
    logger.info("Initial administrator account successfully created.")


if __name__ == "__main__":
    db = SessionLocal()
    try:
        init_first_superuser(db)
    finally:
        db.close()
