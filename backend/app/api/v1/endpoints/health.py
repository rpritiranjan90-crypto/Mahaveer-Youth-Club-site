from fastapi import APIRouter
from backend.app.schemas.health import HealthResponse
from backend.app.core.config import settings

router = APIRouter()


@router.get("/health", response_model=HealthResponse, summary="API Health Check")
def get_health() -> HealthResponse:
    """
    Returns system health status, service name, version, and environment.
    Used for monitoring, uptime verification, and CI/CD smoke tests.
    """
    return HealthResponse(
        status="ok",
        service=settings.PROJECT_NAME,
        version=settings.API_VERSION,
        environment=settings.API_ENV,
    )
