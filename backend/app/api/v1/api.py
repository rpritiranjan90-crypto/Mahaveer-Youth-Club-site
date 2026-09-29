from fastapi import APIRouter
from backend.app.api.v1.endpoints import health, auth, public, admin

api_router = APIRouter()

api_router.include_router(health.router, tags=["Health"])
api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])
api_router.include_router(public.router, prefix="/public", tags=["Public Content"])
api_router.include_router(admin.router, prefix="/admin", tags=["Admin Content Management"])
