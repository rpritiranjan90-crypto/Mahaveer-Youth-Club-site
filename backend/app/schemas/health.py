from pydantic import BaseModel, ConfigDict

class HealthResponse(BaseModel):
    """
    Schema for system health check response.
    """
    model_config = ConfigDict(from_attributes=True)

    status: str
    service: str
    version: str
    environment: str
