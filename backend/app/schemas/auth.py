from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=1)


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr
    is_admin: bool
    totp_enabled: bool
    last_login_at: Optional[datetime] = None
    created_at: datetime


class LoginResponse(BaseModel):
    requires_2fa: bool = False
    challenge_token: Optional[str] = None
    access_token: Optional[str] = None
    token_type: Optional[str] = "bearer"
    refresh_token: Optional[str] = None
    user: Optional[UserOut] = None


class TwoFactorVerifyRequest(BaseModel):
    challenge_token: str
    code: str = Field(..., min_length=6, max_length=20)


class TwoFactorSetupResponse(BaseModel):
    secret: str
    provisioning_uri: str


class TwoFactorEnableRequest(BaseModel):
    code: str = Field(..., min_length=6, max_length=6)


class TwoFactorEnableResponse(BaseModel):
    recovery_codes: List[str]
    message: str = "Two-factor authentication enabled successfully. Save recovery codes in a secure location."


class TwoFactorDisableRequest(BaseModel):
    current_password: str
    code: str = Field(..., min_length=6, max_length=20)


class RecoveryCodesRegenerateRequest(BaseModel):
    current_password: str
    code: str = Field(..., min_length=6, max_length=6)


class PasswordChangeRequest(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=12)

    @field_validator("new_password")
    @classmethod
    def validate_password_length(cls, v: str) -> str:
        if len(v) < 12:
            raise ValueError("Password must be at least 12 characters long.")
        return v


class RefreshTokenRequest(BaseModel):
    refresh_token: str
