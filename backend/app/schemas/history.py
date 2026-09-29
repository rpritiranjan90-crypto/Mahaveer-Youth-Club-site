from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class HistoryBase(BaseModel):
    year: str
    title: str
    description: str
    tag: Optional[str] = None
    image_url: Optional[str] = None
    sort_order: int = 0
    published: bool = True


class HistoryCreate(HistoryBase):
    pass


class HistoryUpdate(BaseModel):
    year: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    tag: Optional[str] = None
    image_url: Optional[str] = None
    sort_order: Optional[int] = None
    published: Optional[bool] = None


class HistoryResponse(HistoryBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime
