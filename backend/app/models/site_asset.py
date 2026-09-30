from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, func
from backend.app.core.database import Base


class SiteAsset(Base):
    """
    Managed site assets such as official club logo and current-year Ganesh Puja image.
    Supports secure replacement, versioning metadata, dimension caching, and active state tracking.
    """
    __tablename__ = "site_assets"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    asset_type = Column(String(50), nullable=False, index=True)  # 'LOGO', 'GANESH_CURRENT'
    year = Column(Integer, nullable=True, index=True)            # e.g., 2026 for GANESH_CURRENT
    storage_path = Column(String(500), nullable=False)          # Safe storage URL (e.g. /uploads/assets/uuid.png)
    original_filename = Column(String(255), nullable=True)
    mime_type = Column(String(50), nullable=False)              # e.g. 'image/png'
    file_size = Column(Integer, nullable=False)                 # in bytes
    width = Column(Integer, nullable=True)                      # in pixels
    height = Column(Integer, nullable=True)                     # in pixels
    is_active = Column(Boolean, default=True, nullable=False, index=True)
    
    created_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), nullable=True)

    def __repr__(self) -> str:
        return f"<SiteAsset id={self.id} type={self.asset_type!r} year={self.year} active={self.is_active}>"
