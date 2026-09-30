from sqlalchemy import Column, Integer, String, Text, DateTime, func
from backend.app.core.database import Base


class Update(Base):
    """
    Official announcements, circulars, and bulletins model.
    """
    __tablename__ = "updates"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    title = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, nullable=False, index=True)
    category = Column(String(100), nullable=False, default="Official Notice")
    excerpt = Column(Text, nullable=True)
    content = Column(Text, nullable=False)
    featured_image = Column(String(500), nullable=True)
    status = Column(String(20), nullable=False, default="draft", index=True)

    published_at = Column(DateTime(timezone=True), nullable=True, index=True)
    archived_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), nullable=True)

    def __repr__(self) -> str:
        return f"<Update id={self.id} title={self.title!r} status={self.status!r}>"
