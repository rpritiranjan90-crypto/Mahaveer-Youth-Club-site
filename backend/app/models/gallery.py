from sqlalchemy import Column, Integer, String, DateTime, func
from backend.app.core.database import Base


class GalleryItem(Base):
    """
    Festival photo archives and celebration gallery model.
    Dynamic year support without hardcoding.
    """
    __tablename__ = "gallery_items"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    title = Column(String(255), nullable=False)
    image_url = Column(String(500), nullable=False)
    thumbnail_url = Column(String(500), nullable=True)
    year = Column(String(10), nullable=False, index=True)  # Dynamic stored year (e.g. "2026", "2027")
    category = Column(String(100), nullable=False, default="Ganesh Puja", index=True)
    alt_text = Column(String(255), nullable=False, default="")
    status = Column(String(20), nullable=False, default="draft", index=True)

    published_at = Column(DateTime(timezone=True), nullable=True)
    archived_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), nullable=True)

    def __repr__(self) -> str:
        return f"<GalleryItem id={self.id} title={self.title!r} year={self.year!r} status={self.status!r}>"
