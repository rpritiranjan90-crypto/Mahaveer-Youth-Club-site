from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class ActivityBase(BaseModel):
    title: str
    description: str
    category: str = "Ritual"
    date: str
    time: Optional[str] = None
    location: str = "Main Pandal Ground"
    image_url: Optional[str] = None
    featured: bool = False
    published: bool = True


class ActivityCreate(ActivityBase):
    pass


class ActivityUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    date: Optional[str] = None
    time: Optional[str] = None
    location: Optional[str] = None
    image_url: Optional[str] = None
    featured: Optional[bool] = None
    published: Optional[bool] = None


class ActivityResponse(ActivityBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime
