from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime
from backend.app.core.database import Base


class DonationSetting(Base):
    """
    Singleton donation configuration model (Version 1: Official Club UPI QR).
    """
    __tablename__ = "donation_settings"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    club_name = Column(String(200), default="Mahaveer Youth Club", nullable=False)
    upi_id = Column(String(100), default="mahaveeryouthclub@upi", nullable=False)
    qr_image_url = Column(String(500), nullable=True)
    description = Column(
        Text,
        default="Your voluntary contribution directly powers our daily Maha Bhog, Vedic pandal construction, and annual blood donation camps.",
        nullable=False,
    )
    suggested_amounts = Column(String(100), default="101,501,1001,2001", nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    def __repr__(self) -> str:
        return f"<DonationSetting id={self.id} upi_id={self.upi_id}>"
