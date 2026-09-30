from datetime import datetime
from typing import Generic, List, Literal, Optional, TypeVar
from pydantic import BaseModel, ConfigDict, Field

ContentStatusEnum = Literal["draft", "published", "archived"]

T = TypeVar("T")


class PaginatedResponse(BaseModel, Generic[T]):
    """
    Standard pagination envelope.
    """
    items: List[T]
    total: int
    page: int
    page_size: int
    total_pages: int


class StatusTransitionRequest(BaseModel):
    """
    Explicit status change payload.
    """
    status: ContentStatusEnum


# =============================================================================
# Updates Schemas
# =============================================================================
class UpdateBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    category: str = Field(default="Official Notice", max_length=100)
    excerpt: Optional[str] = Field(default=None, max_length=1000)
    content: str = Field(..., min_length=1)
    featured_image: Optional[str] = Field(default=None, max_length=500)


class UpdateCreate(UpdateBase):
    status: Optional[ContentStatusEnum] = "draft"


class UpdateUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=255)
    category: Optional[str] = Field(default=None, max_length=100)
    excerpt: Optional[str] = Field(default=None, max_length=1000)
    content: Optional[str] = Field(default=None, min_length=1)
    featured_image: Optional[str] = Field(default=None, max_length=500)
    status: Optional[ContentStatusEnum] = None


class UpdateAdminResponse(UpdateBase):
    id: int
    slug: str
    status: str
    published_at: Optional[datetime] = None
    archived_at: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class UpdatePublicResponse(BaseModel):
    id: int
    title: str
    slug: str
    category: str
    excerpt: Optional[str] = None
    content: str
    featured_image: Optional[str] = None
    published_at: Optional[datetime] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# =============================================================================
# Activity Schemas
# =============================================================================
class ActivityBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: str = Field(..., min_length=1)
    date: str = Field(..., min_length=1, max_length=100)
    category: str = Field(default="Puja & Rituals", max_length=100)
    image: Optional[str] = Field(default=None, max_length=500)


class ActivityCreate(ActivityBase):
    status: Optional[ContentStatusEnum] = "draft"


class ActivityUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=255)
    description: Optional[str] = Field(default=None, min_length=1)
    date: Optional[str] = Field(default=None, min_length=1, max_length=100)
    category: Optional[str] = Field(default=None, max_length=100)
    image: Optional[str] = Field(default=None, max_length=500)
    status: Optional[ContentStatusEnum] = None


class ActivityAdminResponse(ActivityBase):
    id: int
    slug: str
    status: str
    published_at: Optional[datetime] = None
    archived_at: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class ActivityPublicResponse(BaseModel):
    id: int
    title: str
    slug: str
    description: str
    date: str
    category: str
    image: Optional[str] = None
    published_at: Optional[datetime] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# =============================================================================
# Gallery Schemas
# =============================================================================
class GalleryItemBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    image_url: str = Field(..., min_length=1, max_length=500)
    thumbnail_url: Optional[str] = Field(default=None, max_length=500)
    year: str = Field(..., min_length=4, max_length=10)
    category: str = Field(default="Ganesh Puja", max_length=100)
    alt_text: str = Field(default="", max_length=255)


class GalleryItemCreate(GalleryItemBase):
    status: Optional[ContentStatusEnum] = "draft"


class GalleryItemUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=255)
    image_url: Optional[str] = Field(default=None, max_length=500)
    thumbnail_url: Optional[str] = Field(default=None, max_length=500)
    year: Optional[str] = Field(default=None, min_length=4, max_length=10)
    category: Optional[str] = Field(default=None, max_length=100)
    alt_text: Optional[str] = Field(default=None, max_length=255)
    status: Optional[ContentStatusEnum] = None


class GalleryItemAdminResponse(GalleryItemBase):
    id: int
    status: str
    published_at: Optional[datetime] = None
    archived_at: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class GalleryItemPublicResponse(BaseModel):
    id: int
    title: str
    image_url: str
    thumbnail_url: Optional[str] = None
    year: str
    category: str
    alt_text: str
    published_at: Optional[datetime] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class GalleryYearsResponse(BaseModel):
    years: List[str]


class GalleryCategoriesResponse(BaseModel):
    categories: List[str]


# =============================================================================
# Member Schemas (Strict Privacy: Public Nicknames Only!)
# =============================================================================
class MemberBase(BaseModel):
    display_name: str = Field(..., min_length=1, max_length=100)
    role: Optional[str] = Field(default="Club Youth Member", max_length=100)
    sort_order: int = Field(default=0)
    is_visible: bool = Field(default=True)


class MemberCreate(MemberBase):
    pass


class MemberUpdate(BaseModel):
    display_name: Optional[str] = Field(default=None, min_length=1, max_length=100)
    role: Optional[str] = Field(default=None, max_length=100)
    sort_order: Optional[int] = None
    is_visible: Optional[bool] = None


class MemberReorderItem(BaseModel):
    id: int
    sort_order: int


class MemberReorderRequest(BaseModel):
    orders: List[MemberReorderItem]


class MemberAdminResponse(MemberBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class MemberPublicResponse(BaseModel):
    id: int
    display_name: str
    role: Optional[str] = None
    sort_order: int

    model_config = ConfigDict(from_attributes=True)
