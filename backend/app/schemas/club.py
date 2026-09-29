from typing import Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr, ConfigDict


class ClubSettingsBase(BaseModel):
    name: str = "Mahaveer Youth Club"
    tagline: str = "Celebrating Faith, Tradition & Community"
    description: str
    location: str
    address: str
    landmark: Optional[str] = None
    phone: str
    email: EmailStr
    registration_number: Optional[str] = None
    instagram_url: Optional[str] = None
    facebook_url: Optional[str] = None
    youtube_url: Optional[str] = None


class ClubSettingsUpdate(BaseModel):
    name: Optional[str] = None
    tagline: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    address: Optional[str] = None
    landmark: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    registration_number: Optional[str] = None
    instagram_url: Optional[str] = None
    facebook_url: Optional[str] = None
    youtube_url: Optional[str] = None


class ClubSettingsResponse(ClubSettingsBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    updated_at: datetime
