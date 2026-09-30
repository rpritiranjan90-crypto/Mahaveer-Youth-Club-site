from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import text
from sqlalchemy.orm import Session

from backend.app.core.config import settings
from backend.app.core.database import get_db
from backend.app.core.logging import logger
from backend.app.schemas.health import HealthResponse, ReadyResponse

router = APIRouter()


@router.get("/health", response_model=HealthResponse, summary="Service Health Check")
def health_check() -> HealthResponse:
    """
    Returns basic application liveness status without executing heavy dependencies.
    """
    return HealthResponse(
        status="ok",
        app=settings.APP_NAME,
        version="1.0.0",
        environment=settings.APP_ENV,
    )


@router.get("/ready", response_model=ReadyResponse, summary="Service Readiness Check")
def readiness_check(db: Session = Depends(get_db)) -> ReadyResponse:
    """
    Validates end-to-end database connectivity.
    Returns 200 OK when database is reachable, or 503 Service Unavailable on connection failure.
    """
    try:
        db.execute(text("SELECT 1"))
        return ReadyResponse(status="ready", database="connected")
    except Exception as e:
        logger.error("Readiness check failed - database connection error: %s", str(e))
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database service unreachable.",
        )
