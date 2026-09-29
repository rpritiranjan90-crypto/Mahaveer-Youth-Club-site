from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime
from backend.app.core.database import Base


class ClubSettings(Base):
    """
    Singleton club information and general settings model.
    """
    __tablename__ = "club_settings"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(200), default="Mahaveer Youth Club", nullable=False)
    tagline = Column(String(255), default="Celebrating Faith, Tradition & Community", nullable=False)
    description = Column(Text, nullable=False)
    location = Column(String(255), nullable=False)
    address = Column(String(255), nullable=False)
    landmark = Column(String(255), nullable=True)
    phone = Column(String(50), nullable=False)
    email = Column(String(255), nullable=False)
    registration_number = Column(String(100), nullable=True)
    instagram_url = Column(String(255), nullable=True)
    facebook_url = Column(String(255), nullable=True)
    youtube_url = Column(String(255), nullable=True)
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    def __repr__(self) -> str:
        return f"<ClubSettings id={self.id} name={self.name}>"
