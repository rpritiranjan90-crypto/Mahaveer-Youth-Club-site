from sqlalchemy import Column, Integer, String, Boolean, DateTime, func
from backend.app.core.database import Base


class Member(Base):
    """
    Public membership roster model.
    STRICT PRIVACY: Public nicknames only. No PII, phone, email, address, or photos.
    """
    __tablename__ = "members"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    display_name = Column(String(100), nullable=False)  # Public nickname only
    role = Column(String(100), nullable=True, default="Club Youth Member")
    sort_order = Column(Integer, nullable=False, default=0, index=True)
    is_visible = Column(Boolean, nullable=False, default=True, index=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), nullable=True)

    def __repr__(self) -> str:
        return f"<Member id={self.id} display_name={self.display_name!r} sort_order={self.sort_order}>"
