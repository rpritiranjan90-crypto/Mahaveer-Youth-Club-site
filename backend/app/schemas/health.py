from pydantic import BaseModel


class HealthResponse(BaseModel):
    status: str = "ok"
    app: str = "Mahaveer Youth Club Banza API"
    version: str = "1.0.0"
    environment: str = "development"


class ReadyResponse(BaseModel):
    status: str = "ready"
    database: str = "connected"


class ErrorDetail(BaseModel):
    code: str
    message: str


class ErrorResponse(BaseModel):
    error: ErrorDetail
