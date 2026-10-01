from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey, func
from backend.app.core.database import Base


class Member(Base):
    """
    Official Member Roster & Photo Management Model.
    Supports member names, designations, optional bios, photos, active status, and custom ordering.
    Includes backward/forward dual-column mapping to guarantee zero schema mismatch issues.
    """
    __tablename__ = "members"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    name = Column(String(150), nullable=False, default="")
    designation = Column(String(150), nullable=False, default="Member")
    bio = Column(Text, nullable=True)

    # Photo Asset Metadata
    photo_storage_path = Column(String(500), nullable=True)
    photo_original_filename = Column(String(255), nullable=True)
    photo_mime_type = Column(String(50), nullable=True)
    photo_file_size = Column(Integer, nullable=True)
    photo_width = Column(Integer, nullable=True)
    photo_height = Column(Integer, nullable=True)

    display_order = Column(Integer, nullable=False, default=0, index=True)
    is_active = Column(Boolean, nullable=False, default=True, index=True)

    created_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    updated_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), nullable=True)

    # Dual-column compatibility mappings (ensures legacy and upgraded PostgreSQL tables both insert cleanly)
    display_name = Column(String(150), nullable=True, default="")
    role = Column(String(150), nullable=True, default="Member")
    sort_order = Column(Integer, nullable=True, default=0)
    is_visible = Column(Boolean, nullable=True, default=True)

    def __init__(self, **kwargs):
        # Auto-synchronize both new and legacy field names upon initialization
        if "name" in kwargs and "display_name" not in kwargs:
            kwargs["display_name"] = kwargs["name"]
        elif "display_name" in kwargs and "name" not in kwargs:
            kwargs["name"] = kwargs["display_name"]

        if "designation" in kwargs and "role" not in kwargs:
            kwargs["role"] = kwargs["designation"]
        elif "role" in kwargs and "designation" not in kwargs:
            kwargs["designation"] = kwargs["role"]

        if "display_order" in kwargs and "sort_order" not in kwargs:
            kwargs["sort_order"] = kwargs["display_order"]
        elif "sort_order" in kwargs and "display_order" not in kwargs:
            kwargs["display_order"] = kwargs["sort_order"]

        if "is_active" in kwargs and "is_visible" not in kwargs:
            kwargs["is_visible"] = kwargs["is_active"]
        elif "is_visible" in kwargs and "is_active" not in kwargs:
            kwargs["is_active"] = kwargs["is_visible"]

        super().__init__(**kwargs)

    def __repr__(self) -> str:
        return f"<Member id={self.id} name={self.name!r} designation={self.designation!r} active={self.is_active}>"
