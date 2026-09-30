from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, computed_field


class SiteAssetPublicResponse(BaseModel):
    """
    Publicly safe site asset metadata without sensitive server-side paths.
    """
    id: int
    asset_type: str
    year: Optional[int] = None
    mime_type: str
    file_size: int
    width: Optional[int] = None
    height: Optional[int] = None
    storage_path: str
    updated_at: Optional[datetime] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

    @computed_field
    @property
    def image_url(self) -> str:
        return self.storage_path


class SiteAssetAdminResponse(BaseModel):
    """
    Administrative metadata for site assets including upload history and active flags.
    """
    id: int
    asset_type: str
    year: Optional[int] = None
    original_filename: Optional[str] = None
    mime_type: str
    file_size: int
    width: Optional[int] = None
    height: Optional[int] = None
    storage_path: str
    is_active: bool
    created_by: Optional[int] = None
    updated_at: Optional[datetime] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

    @computed_field
    @property
    def image_url(self) -> str:
        return self.storage_path
