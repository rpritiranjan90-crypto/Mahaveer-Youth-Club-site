from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field, computed_field, model_validator


class MemberCreate(BaseModel):
    """
    Schema for creating a new member roster entry.
    """
    name: Optional[str] = Field(default=None, max_length=150)
    display_name: Optional[str] = Field(default=None, max_length=150)
    designation: Optional[str] = Field(default="Member", max_length=150)
    role: Optional[str] = Field(default=None, max_length=150)
    bio: Optional[str] = Field(default=None, max_length=1000)
    display_order: Optional[int] = Field(default=0)
    sort_order: Optional[int] = Field(default=None)
    is_active: Optional[bool] = Field(default=True)
    is_visible: Optional[bool] = Field(default=None)

    @model_validator(mode="after")
    def populate_defaults_and_aliases(self) -> "MemberCreate":
        # Resolve name
        if not self.name and self.display_name:
            self.name = self.display_name.strip()
        elif self.name:
            self.name = self.name.strip()
        else:
            raise ValueError("Member name is required.")

        # Resolve designation
        if self.role and (not self.designation or self.designation == "Member"):
            self.designation = self.role.strip()
        elif self.designation:
            self.designation = self.designation.strip()
        else:
            self.designation = "Member"

        # Resolve display_order
        if self.sort_order is not None and self.display_order == 0:
            self.display_order = self.sort_order

        # Resolve is_active
        if self.is_visible is not None and self.is_active is True:
            self.is_active = self.is_visible

        return self


class MemberUpdate(BaseModel):
    """
    Schema for updating an existing member.
    """
    name: Optional[str] = Field(default=None, min_length=1, max_length=150)
    display_name: Optional[str] = Field(default=None, min_length=1, max_length=150)
    designation: Optional[str] = Field(default=None, max_length=150)
    role: Optional[str] = Field(default=None, max_length=150)
    bio: Optional[str] = Field(default=None, max_length=1000)
    display_order: Optional[int] = None
    sort_order: Optional[int] = None
    is_active: Optional[bool] = None
    is_visible: Optional[bool] = None

    @model_validator(mode="after")
    def normalize_aliases(self) -> "MemberUpdate":
        if self.display_name is not None and self.name is None:
            self.name = self.display_name.strip()
        if self.role is not None and self.designation is None:
            self.designation = self.role.strip()
        if self.sort_order is not None and self.display_order is None:
            self.display_order = self.sort_order
        if self.is_visible is not None and self.is_active is None:
            self.is_active = self.is_visible
        return self


class MemberReorderItem(BaseModel):
    id: int
    display_order: Optional[int] = None
    sort_order: Optional[int] = None

    @model_validator(mode="after")
    def resolve_order(self) -> "MemberReorderItem":
        if self.display_order is None and self.sort_order is not None:
            self.display_order = self.sort_order
        elif self.display_order is None:
            self.display_order = 0
        return self


class MemberReorderRequest(BaseModel):
    orders: List[MemberReorderItem]


class MemberPublicResponse(BaseModel):
    """
    Privacy-safe public member roster profile.
    Never exposes internal paths, audit data, email, phone, address, or administrative identifiers.
    """
    id: int
    name: str
    designation: str
    bio: Optional[str] = None
    display_order: int
    photo_storage_path: Optional[str] = None
    photo_width: Optional[int] = None
    photo_height: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)

    @computed_field
    @property
    def photo_url(self) -> Optional[str]:
        return self.photo_storage_path

    @computed_field
    @property
    def display_name(self) -> str:
        return self.name

    @computed_field
    @property
    def role(self) -> str:
        return self.designation

    @computed_field
    @property
    def sort_order(self) -> int:
        return self.display_order


class MemberAdminResponse(BaseModel):
    """
    Full administrative view of a member profile.
    """
    id: int
    name: str
    designation: str
    bio: Optional[str] = None
    photo_storage_path: Optional[str] = None
    photo_original_filename: Optional[str] = None
    photo_mime_type: Optional[str] = None
    photo_file_size: Optional[int] = None
    photo_width: Optional[int] = None
    photo_height: Optional[int] = None
    display_order: int
    is_active: bool
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

    @computed_field
    @property
    def photo_url(self) -> Optional[str]:
        return self.photo_storage_path

    @computed_field
    @property
    def display_name(self) -> str:
        return self.name

    @computed_field
    @property
    def role(self) -> str:
        return self.designation

    @computed_field
    @property
    def sort_order(self) -> int:
        return self.display_order

    @computed_field
    @property
    def is_visible(self) -> bool:
        return self.is_active
