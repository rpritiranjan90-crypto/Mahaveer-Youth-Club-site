from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy import desc
from sqlalchemy.orm import Session

from backend.app.api.deps import get_current_admin
from backend.app.core.database import get_db
from backend.app.models.audit_log import AuditLog
from backend.app.models.user import User
from backend.app.schemas.audit import AuditLogListResponse, AuditLogOut

router = APIRouter()


@router.get("/audit-logs", response_model=AuditLogListResponse, summary="List Security Audit Logs")
def get_audit_logs(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(50, ge=1, le=100, description="Items per page"),
    action: Optional[str] = Query(None, description="Filter by action type"),
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> AuditLogListResponse:
    """
    Returns paginated security audit logs, newest first. Authenticated administrators only.
    """
    query = db.query(AuditLog)

    if action:
        query = query.filter(AuditLog.action == action.upper())

    total = query.count()
    items = (
        query.order_by(desc(AuditLog.created_at))
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    return AuditLogListResponse(
        items=[AuditLogOut.model_validate(item) for item in items],
        total=total,
        page=page,
        page_size=page_size,
    )
