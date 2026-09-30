from fastapi import APIRouter
from backend.app.api.v1.endpoints import (
    auth,
    audit,
    health,
    public,
    admin_updates,
    admin_activities,
    admin_gallery,
    admin_members,
    admin_assets,
)

api_router = APIRouter()

# Register v1 routes
api_router.include_router(health.router, tags=["System Health"])
api_router.include_router(auth.router, prefix="/auth", tags=["Admin Authentication"])
api_router.include_router(audit.router, prefix="/admin", tags=["Security Audit Logs"])

# Public Content Routes
api_router.include_router(public.router, prefix="/public", tags=["Public Content"])
api_router.include_router(public.router, tags=["Public Content Aliases"])

# Admin Content Management Routes
api_router.include_router(admin_updates.router, prefix="/admin/updates", tags=["Admin Updates Management"])
api_router.include_router(admin_activities.router, prefix="/admin/activities", tags=["Admin Activities Management"])
api_router.include_router(admin_gallery.router, prefix="/admin/gallery", tags=["Admin Gallery Management"])
api_router.include_router(admin_members.router, prefix="/admin/members", tags=["Admin Members Management"])
api_router.include_router(admin_assets.router, prefix="/admin/assets", tags=["Admin Asset Management"])

