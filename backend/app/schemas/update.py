from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class UpdateBase(BaseModel):
    title: str
    excerpt: str
    content: str
    image_url: Optional[str] = None
    category: str = "Announcement"
    published: bool = True


class UpdateCreate(UpdateBase):
    slug: Optional[str] = None


class UpdateUpdate(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    excerpt: Optional[str] = None
    content: Optional[str] = None
    image_url: Optional[str] = None
    category: Optional[str] = None
    published: Optional[bool] = None


class UpdateResponse(UpdateBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    slug: str
    published_at: datetime
    created_at: datetime
    updated_at: datetime
