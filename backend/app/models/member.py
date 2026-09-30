from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey, func
from sqlalchemy.ext.hybrid import hybrid_property
from backend.app.core.database import Base


class Member(Base):
    """
    Official Member Roster & Photo Management Model.
    Supports member names, designations, optional bios, photos, active status, and custom ordering.
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

    # Backward compatibility hybrid properties
    @hybrid_property
    def display_name(self) -> str:
        return self.name

    @display_name.setter
    def display_name(self, val: str) -> None:
        self.name = val

    @hybrid_property
    def role(self) -> str:
        return self.designation

    @role.setter
    def role(self, val: str) -> None:
        self.designation = val

    @hybrid_property
    def sort_order(self) -> int:
        return self.display_order

    @sort_order.setter
    def sort_order(self, val: int) -> None:
        self.display_order = val

    @hybrid_property
    def is_visible(self) -> bool:
        return self.is_active

    @is_visible.setter
    def is_visible(self, val: bool) -> None:
        self.is_active = val

    def __repr__(self) -> str:
        return f"<Member id={self.id} name={self.name!r} designation={self.designation!r} active={self.is_active}>"
