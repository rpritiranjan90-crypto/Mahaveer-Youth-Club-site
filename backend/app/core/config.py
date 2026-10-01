from typing import List, Optional, Union
from pydantic import AnyHttpUrl, field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Centralized Application Configuration.
    Loads settings from environment variables and local .env file.
    """
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )

    APP_ENV: str = "development"
    APP_NAME: str = "Mahaveer Youth Club Banza API"
    APP_DEBUG: bool = False
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "development_secret_key_change_in_production"

    # Authentication & Sessions
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    FIRST_SUPERUSER_EMAIL: Optional[str] = "rpritiranjan90@gmail.com"
    FIRST_SUPERUSER_PASSWORD: Optional[str] = "Fukun@891755"

    # Database
    DATABASE_URL: str = "postgresql://mahaveer_user:mahaveer_pass@localhost:5432/mahaveer_db"
    DB_POOL_SIZE: int = 10
    DB_MAX_OVERFLOW: int = 20
    DB_POOL_TIMEOUT: int = 30

    # CORS
    CORS_ORIGINS: List[Union[str, AnyHttpUrl]] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
    ]

    # Storage & Uploads
    UPLOAD_DIR: str = "uploads"
    MAX_UPLOAD_SIZE_BYTES: int = 5 * 1024 * 1024  # 5 MB
    ALLOWED_IMAGE_TYPES: List[str] = ["image/jpeg", "image/png", "image/webp"]

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

    @model_validator(mode="after")
    def validate_production_safety(self) -> "Settings":
        env = self.APP_ENV.lower().strip()
        if env not in ["development", "staging", "production", "testing"]:
            raise ValueError(f"Invalid APP_ENV: {self.APP_ENV}. Must be one of: development, staging, production, testing")

        if env == "production":
            if self.APP_DEBUG:
                raise ValueError("APP_DEBUG must be set to False in production environment")
            insecure_keys = [
                "development_secret_key_change_in_production",
                "dev-secret-key-change-in-production-only",
                "change_this_to_a_secure_random_string_for_local_development_only",
            ]
            if self.SECRET_KEY in insecure_keys or len(self.SECRET_KEY) < 32:
                raise ValueError("A cryptographically secure SECRET_KEY (>= 32 characters) must be configured in production")
            for origin in self.CORS_ORIGINS:
                if str(origin).strip() == "*":
                    raise ValueError("Wildcard '*' CORS origin is strictly forbidden in production with credentials")

        return self


settings = Settings()
