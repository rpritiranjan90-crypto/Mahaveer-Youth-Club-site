import os
from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from backend.app.core.config import settings
from backend.app.core.database import SessionLocal
from backend.app.core.init_db import init_db
from backend.app.core.logging import logger
from backend.app.api.v1.api import api_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager for startup and shutdown events.
    """
    logger.info("Starting %s (v%s) in [%s] mode...", settings.PROJECT_NAME, settings.API_VERSION, settings.API_ENV)
    
    # Initialize DB schema and seed default admin user
    if SessionLocal:
        try:
            db = SessionLocal()
            try:
                init_db(db)
            finally:
                db.close()
        except Exception as e:
            logger.warning("DB Initialization note: %s", str(e))

    yield
    logger.info("Shutting down %s...", settings.PROJECT_NAME)


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.API_VERSION,
    description="REST API backend for Mahaveer Youth Club Ganesh Puja & Community Portal",
    openapi_url=f"{settings.API_V1_STR}/openapi.json" if settings.API_ENV != "production" else None,
    docs_url=f"{settings.API_V1_STR}/docs" if settings.API_ENV != "production" else None,
    redoc_url=f"{settings.API_V1_STR}/redoc" if settings.API_ENV != "production" else None,
    lifespan=lifespan,
)

# CORS Configuration
if settings.CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Static Files for Uploads
upload_path = Path(settings.UPLOAD_DIR).resolve()
upload_path.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(upload_path)), name="uploads")


# -----------------------------------------------------------------------------
# Global Error Handling
# -----------------------------------------------------------------------------
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    """
    Standardized JSON response for HTTP exceptions.
    """
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "code": exc.status_code,
                "message": exc.detail,
            }
        },
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """
    Standardized JSON response for schema validation errors.
    """
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": {
                "code": 422,
                "message": "Validation Error",
                "details": exc.errors(),
            }
        },
    )


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    """
    Catch-all handler for unhandled exceptions.
    Prevents raw tracebacks from leaking to clients.
    """
    logger.error("Unhandled Exception at %s: %s", request.url.path, str(exc), exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": {
                "code": 500,
                "message": "An unexpected internal server error occurred. Please contact the administrator.",
            }
        },
    )


# -----------------------------------------------------------------------------
# Route Registration
# -----------------------------------------------------------------------------
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/", tags=["Root"])
def root():
    """
    Root endpoint for quick connectivity check.
    """
    return {
        "message": f"Welcome to {settings.PROJECT_NAME}",
        "health": f"{settings.API_V1_STR}/health",
        "docs": f"{settings.API_V1_STR}/docs" if settings.API_ENV != "production" else None,
    }
