from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class GalleryBase(BaseModel):
    title: str
    description: Optional[str] = None
    image_url: str
    category: str = "Pandal"
    year: str = "2026"
    published: bool = True
    sort_order: int = 0


class GalleryCreate(GalleryBase):
    pass


class GalleryUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    category: Optional[str] = None
    year: Optional[str] = None
    published: Optional[bool] = None
    sort_order: Optional[int] = None


class GalleryResponse(GalleryBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime
