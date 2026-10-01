import sys
from pathlib import Path

# Ensure project root and backend dir are in sys.path so 'backend.app' imports work from any working directory
_file_path = Path(__file__).resolve()
_backend_dir = _file_path.parent.parent  # backend
_project_root = _backend_dir.parent      # project root

for _p in (str(_project_root), str(_backend_dir)):
    if _p not in sys.path:
        sys.path.insert(0, _p)

from contextlib import asynccontextmanager
from typing import AsyncGenerator
from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException
from starlette.middleware.base import BaseHTTPMiddleware

from backend.app.core.config import settings
from backend.app.core.logging import logger
from backend.app.api.v1.api import api_router


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncGenerator[None, None]:
    """
    Application lifecycle management.
    Logs technical startup and shutdown events safely.
    """
    logger.info("Starting %s in [%s] environment...", settings.APP_NAME, settings.APP_ENV)
    try:
        yield
    finally:
        logger.info("Shutting down %s gracefully...", settings.APP_NAME)


app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan,
)

# -----------------------------------------------------------------------------
# Security Headers Middleware (Rule 31)
# -----------------------------------------------------------------------------
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=(), payment=()"
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; "
            "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://fonts.googleapis.com; "
            "img-src 'self' data: blob: https:; "
            "font-src 'self' data: https: https://fonts.gstatic.com; "
            "connect-src 'self' http://localhost:* http://127.0.0.1:* https://*; "
            "frame-ancestors 'none'; "
            "object-src 'none'; "
            "base-uri 'self';"
        )
        if settings.APP_ENV == "production" or request.url.scheme == "https":
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload"
        return response


app.add_middleware(SecurityHeadersMiddleware)

# -----------------------------------------------------------------------------
# CORS Configuration (Strict origins)
# -----------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[str(origin) for origin in settings.CORS_ORIGINS],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)


# -----------------------------------------------------------------------------
# Centralized Error Handlers (Rule 12 & 33: Standardized error responses, zero secret leakage)
# -----------------------------------------------------------------------------
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(_: Request, exc: StarletteHTTPException) -> JSONResponse:
    """
    Standardized handler for HTTPExceptions.
    """
    code_map = {
        status.HTTP_400_BAD_REQUEST: "BAD_REQUEST",
        status.HTTP_401_UNAUTHORIZED: "UNAUTHORIZED",
        status.HTTP_403_FORBIDDEN: "FORBIDDEN",
        status.HTTP_404_NOT_FOUND: "NOT_FOUND",
        status.HTTP_422_UNPROCESSABLE_ENTITY: "UNPROCESSABLE_ENTITY",
        status.HTTP_429_TOO_MANY_REQUESTS: "TOO_MANY_REQUESTS",
        status.HTTP_500_INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR",
        status.HTTP_503_SERVICE_UNAVAILABLE: "SERVICE_UNAVAILABLE",
    }
    error_code = code_map.get(exc.status_code, f"HTTP_{exc.status_code}")
    message = exc.detail if isinstance(exc.detail, str) else "A request error occurred."
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": {"code": error_code, "message": message}},
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(_: Request, exc: RequestValidationError) -> JSONResponse:
    """
    Standardized handler for Pydantic request validation errors.
    """
    logger.warning("Request validation error: %s", str(exc.errors()))
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": {
                "code": "VALIDATION_ERROR",
                "message": "The submitted request data failed schema validation.",
            }
        },
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(_: Request, exc: Exception) -> JSONResponse:
    """
    Catches all unhandled exceptions, logs detailed context securely,
    and returns a clean generic error response without exposing internal paths or SQL.
    """
    logger.error("Unhandled server exception: %s", str(exc), exc_info=settings.APP_DEBUG)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": "An unexpected server error occurred. Please try again later.",
            }
        },
    )


# -----------------------------------------------------------------------------
from fastapi.staticfiles import StaticFiles
from fastapi.responses import RedirectResponse
from backend.app.services.storage import get_upload_dir

upload_dir = get_upload_dir()
app.mount("/uploads", StaticFiles(directory=str(upload_dir), html=False), name="uploads")

@app.get("/", summary="Root Health Ping", tags=["System Health"])
def root() -> dict:
    return {
        "app": settings.APP_NAME,
        "status": "ok",
        "docs": f"{settings.API_V1_STR}/docs",
        "health": f"{settings.API_V1_STR}/health",
    }

@app.get("/docs", include_in_schema=False)
def redirect_docs() -> RedirectResponse:
    return RedirectResponse(url=f"{settings.API_V1_STR}/docs")

@app.get("/health", include_in_schema=False)
def redirect_health() -> RedirectResponse:
    return RedirectResponse(url=f"{settings.API_V1_STR}/health")


app.include_router(api_router, prefix=settings.API_V1_STR)
