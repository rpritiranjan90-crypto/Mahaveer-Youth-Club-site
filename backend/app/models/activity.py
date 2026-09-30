from sqlalchemy import Column, Integer, String, Text, DateTime, func
from backend.app.core.database import Base


class Activity(Base):
    """
    Community seva, festival organization, and youth programs model.
    """
    __tablename__ = "activities"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    title = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=False)
    date = Column(String(100), nullable=False)  # Formatted human date or ISO date
    category = Column(String(100), nullable=False, default="Puja & Rituals", index=True)
    image = Column(String(500), nullable=True)
    status = Column(String(20), nullable=False, default="draft", index=True)

    published_at = Column(DateTime(timezone=True), nullable=True, index=True)
    archived_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), nullable=True)

    def __repr__(self) -> str:
        return f"<Activity id={self.id} title={self.title!r} status={self.status!r}>"
