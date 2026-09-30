import math
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy.orm import Session
from sqlalchemy import desc, func

from backend.app.api.deps import get_current_admin, get_client_ip
from backend.app.core.database import get_db
from backend.app.models.user import User
from backend.app.models.update import Update
from backend.app.schemas.content import (
    PaginatedResponse,
    UpdateCreate,
    UpdateUpdate,
    UpdateAdminResponse,
    StatusTransitionRequest,
)
from backend.app.services.audit import record_audit_event
from backend.app.services.slug import generate_unique_slug
from backend.app.services.sanitizer import sanitize_html

router = APIRouter()


@router.get(
    "",
    response_model=PaginatedResponse[UpdateAdminResponse],
    summary="List All Updates (Admin)",
)
def list_admin_updates(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by draft/published/archived"),
    search: Optional[str] = Query(None, max_length=100),
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
) -> PaginatedResponse[UpdateAdminResponse]:
    """
    Returns all updates across all statuses (draft, published, archived) with pagination and search.
    """
    query = db.query(Update)

    if status_filter and status_filter.lower() != "all":
        query = query.filter(Update.status == status_filter.lower())

    if search:
        pattern = f"%{search.strip()}%"
        query = query.filter(
            (Update.title.ilike(pattern)) | (Update.excerpt.ilike(pattern))
        )

    total = query.count()
    total_pages = math.ceil(total / page_size) if total > 0 else 1

    items = (
        query.order_by(desc(Update.created_at))
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    return PaginatedResponse(
        items=[UpdateAdminResponse.model_validate(item) for item in items],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.post(
    "",
    response_model=UpdateAdminResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Update (Admin)",
)
def create_update(
    payload: UpdateCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
) -> UpdateAdminResponse:
    """
    Creates a new circular/update in draft (or published) status.
    Sanitizes HTML content and generates a unique slug.
    """
    client_ip = get_client_ip(request)
    slug = generate_unique_slug(db, Update, payload.title)
    sanitized_content = sanitize_html(payload.content)
    item_status = payload.status or "draft"

    published_at = func.now() if item_status == "published" else None

    new_update = Update(
        title=payload.title.strip(),
        slug=slug,
        category=payload.category.strip(),
        excerpt=payload.excerpt.strip() if payload.excerpt else None,
        content=sanitized_content,
        featured_image=payload.featured_image.strip() if payload.featured_image else None,
        status=item_status,
        published_at=published_at,
    )
    db.add(new_update)
    db.commit()
    db.refresh(new_update)

    record_audit_event(
        db=db,
        action="UPDATE_CREATED",
        user_id=current_admin.id,
        user_email=current_admin.email,
        ip_address=client_ip,
        entity_type="update",
        entity_id=str(new_update.id),
        details={"title": new_update.title, "slug": new_update.slug, "status": new_update.status},
    )

    return UpdateAdminResponse.model_validate(new_update)


@router.get(
    "/{update_id}",
    response_model=UpdateAdminResponse,
    summary="Get Update Details (Admin)",
)
def get_update_detail(
    update_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
) -> UpdateAdminResponse:
    """
    Retrieves full details of an update for administrative inspection/editing.
    """
    item = db.query(Update).filter(Update.id == update_id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Update not found.")
    return UpdateAdminResponse.model_validate(item)


@router.get(
    "/{update_id}/preview",
    response_model=UpdateAdminResponse,
    summary="Preview Draft/Unpublished Update (Admin)",
)
def preview_update(
    update_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
) -> UpdateAdminResponse:
    """
    Secure admin-only endpoint to preview draft or archived updates.
    """
    item = db.query(Update).filter(Update.id == update_id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Update not found.")
    return UpdateAdminResponse.model_validate(item)


@router.patch(
    "/{update_id}",
    response_model=UpdateAdminResponse,
    summary="Update Content/Metadata (Admin)",
)
def update_update(
    update_id: int,
    payload: UpdateUpdate,
    request: Request,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
) -> UpdateAdminResponse:
    """
    Modifies update fields. If title changes, updates slug uniquely.
    Sanitizes HTML content.
    """
    client_ip = get_client_ip(request)
    item = db.query(Update).filter(Update.id == update_id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Update not found.")

    if payload.title is not None and payload.title.strip() != item.title:
        item.title = payload.title.strip()
        item.slug = generate_unique_slug(db, Update, item.title, current_id=item.id)

    if payload.category is not None:
        item.category = payload.category.strip()

    if payload.excerpt is not None:
        item.excerpt = payload.excerpt.strip() if payload.excerpt else None

    if payload.content is not None:
        item.content = sanitize_html(payload.content)

    if payload.featured_image is not None:
        item.featured_image = payload.featured_image.strip() if payload.featured_image else None

    if payload.status is not None and payload.status != item.status:
        old_status = item.status
        item.status = payload.status
        if payload.status == "published":
            item.published_at = func.now()
            item.archived_at = None
        elif payload.status == "archived":
            item.archived_at = func.now()
        elif payload.status == "draft":
            item.published_at = None
            item.archived_at = None

    db.commit()
    db.refresh(item)

    record_audit_event(
        db=db,
        action="UPDATE_EDITED",
        user_id=current_admin.id,
        user_email=current_admin.email,
        ip_address=client_ip,
        entity_type="update",
        entity_id=str(item.id),
        details={"title": item.title, "status": item.status},
    )

    return UpdateAdminResponse.model_validate(item)


@router.post(
    "/{update_id}/status",
    response_model=UpdateAdminResponse,
    summary="Change Update Publishing Status (Admin)",
)
def change_update_status(
    update_id: int,
    payload: StatusTransitionRequest,
    request: Request,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
) -> UpdateAdminResponse:
    """
    Explicit status transition (publish, archive, return to draft).
    """
    client_ip = get_client_ip(request)
    item = db.query(Update).filter(Update.id == update_id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Update not found.")

    target_status = payload.status
    old_status = item.status
    item.status = target_status

    if target_status == "published":
        item.published_at = func.now()
        item.archived_at = None
        action_name = "UPDATE_PUBLISHED"
    elif target_status == "archived":
        item.archived_at = func.now()
        action_name = "UPDATE_ARCHIVED"
    else:  # draft
        item.published_at = None
        item.archived_at = None
        action_name = "UPDATE_RESTORED_DRAFT"

    db.commit()
    db.refresh(item)

    record_audit_event(
        db=db,
        action=action_name,
        user_id=current_admin.id,
        user_email=current_admin.email,
        ip_address=client_ip,
        entity_type="update",
        entity_id=str(item.id),
        details={"old_status": old_status, "new_status": target_status, "title": item.title},
    )

    return UpdateAdminResponse.model_validate(item)


@router.delete(
    "/{update_id}",
    status_code=status.HTTP_200_OK,
    summary="Delete Update (Admin)",
)
def delete_update(
    update_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
) -> dict:
    """
    Permanently removes an update with audit logging.
    """
    client_ip = get_client_ip(request)
    item = db.query(Update).filter(Update.id == update_id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Update not found.")

    title = item.title
    db.delete(item)
    db.commit()

    record_audit_event(
        db=db,
        action="UPDATE_DELETED",
        user_id=current_admin.id,
        user_email=current_admin.email,
        ip_address=client_ip,
        entity_type="update",
        entity_id=str(update_id),
        details={"deleted_title": title},
    )

    return {"status": "ok", "message": f"Update #{update_id} successfully deleted."}
