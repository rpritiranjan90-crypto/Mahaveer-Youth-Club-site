from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class DonationSettingBase(BaseModel):
    club_name: str = "Mahaveer Youth Club"
    upi_id: str = "mahaveeryouthclub@upi"
    qr_image_url: Optional[str] = None
    description: str = "Your voluntary contribution directly powers our daily Maha Bhog, Vedic pandal construction, and annual blood donation camps."
    suggested_amounts: str = "101,501,1001,2001"


class DonationSettingUpdate(BaseModel):
    club_name: Optional[str] = None
    upi_id: Optional[str] = None
    qr_image_url: Optional[str] = None
    description: Optional[str] = None
    suggested_amounts: Optional[str] = None


class DonationSettingResponse(DonationSettingBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    updated_at: datetime
