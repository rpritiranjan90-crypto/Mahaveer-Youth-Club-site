from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime
from backend.app.core.database import Base


class Activity(Base):
    """
    Festival rituals, welfare camps, cultural evenings, and sports meets.
    """
    __tablename__ = "activities"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(100), default="Ritual", nullable=False)  # Ritual, Welfare, Cultural, Sports
    date = Column(String(100), nullable=False)
    time = Column(String(100), nullable=True)
    location = Column(String(255), nullable=False)
    image_url = Column(String(500), nullable=True)
    featured = Column(Boolean, default=False, nullable=False)
    published = Column(Boolean, default=True, index=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    def __repr__(self) -> str:
        return f"<Activity id={self.id} title={self.title} category={self.category}>"
