import math
from typing import Optional
from fastapi import APIRouter, Depends, File, HTTPException, Query, Request, UploadFile, status
from sqlalchemy.orm import Session
from sqlalchemy import desc, func

from backend.app.api.deps import get_current_admin, get_client_ip
from backend.app.core.database import get_db
from backend.app.models.user import User
from backend.app.models.activity import Activity
from backend.app.schemas.content import (
    PaginatedResponse,
    ActivityCreate,
    ActivityUpdate,
    ActivityAdminResponse,
    StatusTransitionRequest,
)
from backend.app.services.audit import record_audit_event
from backend.app.services.slug import generate_unique_slug
from backend.app.services.storage import StorageService, safe_delete_media_file

router = APIRouter()



@router.get(
    "",
    response_model=PaginatedResponse[ActivityAdminResponse],
    summary="List All Activities (Admin)",
)
def list_admin_activities(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by draft/published/archived"),
    category: Optional[str] = Query(None, max_length=100),
    search: Optional[str] = Query(None, max_length=100),
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
) -> PaginatedResponse[ActivityAdminResponse]:
    """
    Returns all club activities with status/category filters and search.
    """
    query = db.query(Activity)

    if status_filter and status_filter.lower() != "all":
        query = query.filter(Activity.status == status_filter.lower())

    if category and category.lower() != "all":
        query = query.filter(Activity.category.ilike(category.strip()))

    if search:
        pattern = f"%{search.strip()}%"
        query = query.filter(
            (Activity.title.ilike(pattern)) | (Activity.description.ilike(pattern))
        )

    total = query.count()
    total_pages = math.ceil(total / page_size) if total > 0 else 1

    items = (
        query.order_by(desc(Activity.created_at))
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    return PaginatedResponse(
        items=[ActivityAdminResponse.model_validate(item) for item in items],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.post(
    "",
    response_model=ActivityAdminResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Activity (Admin)",
)
def create_activity(
    payload: ActivityCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
) -> ActivityAdminResponse:
    """
    Creates a new activity program. Generates unique slug.
    """
    client_ip = get_client_ip(request)
    slug = generate_unique_slug(db, Activity, payload.title)
    item_status = payload.status or "draft"

    published_at = func.now() if item_status == "published" else None

    new_act = Activity(
        title=payload.title.strip(),
        slug=slug,
        description=payload.description.strip(),
        date=payload.date.strip(),
        category=payload.category.strip(),
        image=payload.image.strip() if payload.image else None,
        status=item_status,
        published_at=published_at,
    )
    db.add(new_act)
    db.commit()
    db.refresh(new_act)

    record_audit_event(
        db=db,
        action="ACTIVITY_CREATED",
        user_id=current_admin.id,
        user_email=current_admin.email,
        ip_address=client_ip,
        entity_type="activity",
        entity_id=str(new_act.id),
        details={"title": new_act.title, "slug": new_act.slug, "status": new_act.status},
    )

    return ActivityAdminResponse.model_validate(new_act)


@router.get(
    "/{activity_id}",
    response_model=ActivityAdminResponse,
    summary="Get Activity Details (Admin)",
)
def get_activity_detail(
    activity_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
) -> ActivityAdminResponse:
    item = db.query(Activity).filter(Activity.id == activity_id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Activity not found.")
    return ActivityAdminResponse.model_validate(item)


@router.get(
    "/{activity_id}/preview",
    response_model=ActivityAdminResponse,
    summary="Preview Draft Activity (Admin)",
)
def preview_activity(
    activity_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
) -> ActivityAdminResponse:
    """
    Secure admin-only endpoint to preview draft or archived activities.
    """
    item = db.query(Activity).filter(Activity.id == activity_id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Activity not found.")
    return ActivityAdminResponse.model_validate(item)


@router.patch(
    "/{activity_id}",
    response_model=ActivityAdminResponse,
    summary="Update Activity (Admin)",
)
def update_activity(
    activity_id: int,
    payload: ActivityUpdate,
    request: Request,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
) -> ActivityAdminResponse:
    """
    Modifies activity fields. If title changes, updates slug uniquely.
    """
    client_ip = get_client_ip(request)
    item = db.query(Activity).filter(Activity.id == activity_id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Activity not found.")

    if payload.title is not None and payload.title.strip() != item.title:
        item.title = payload.title.strip()
        item.slug = generate_unique_slug(db, Activity, item.title, current_id=item.id)

    if payload.description is not None:
        item.description = payload.description.strip()

    if payload.date is not None:
        item.date = payload.date.strip()

    if payload.category is not None:
        item.category = payload.category.strip()

    if payload.image is not None:
        old_image = item.image
        new_image = payload.image.strip() if payload.image else None
        item.image = new_image
        if old_image and old_image != new_image:
            safe_delete_media_file(db, old_image, current_table="activities", current_id=item.id)

    if payload.status is not None and payload.status != item.status:
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
        action="ACTIVITY_EDITED",
        user_id=current_admin.id,
        user_email=current_admin.email,
        ip_address=client_ip,
        entity_type="activity",
        entity_id=str(item.id),
        details={"title": item.title, "status": item.status},
    )

    return ActivityAdminResponse.model_validate(item)


@router.post(
    "/{activity_id}/image",
    response_model=ActivityAdminResponse,
    summary="Upload/Replace Activity Image (Admin)",
)
async def upload_activity_image(
    activity_id: int,
    file: UploadFile = File(...),
    request: Request = None,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
) -> ActivityAdminResponse:
    """
    Uploads or replaces an activity program image.
    Validates format (JPEG/PNG/WebP), magic bytes, size (<=5MB), Pillow integrity.
    Saves new image before safely cleaning up old image if unreferenced elsewhere.
    """
    client_ip = get_client_ip(request)
    activity = db.query(Activity).filter(Activity.id == activity_id).first()
    if not activity:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Activity not found.")

    file_bytes = await file.read()
    storage_path, detected_mime, file_size, width, height = StorageService.save_activity_image(
        file_bytes=file_bytes,
        content_type=file.content_type,
    )

    old_image_path = activity.image
    action_type = "ACTIVITY_IMAGE_REPLACED" if old_image_path else "ACTIVITY_IMAGE_UPLOADED"

    activity.image = storage_path
    db.commit()
    db.refresh(activity)

    # Safely remove old image only if not referenced elsewhere
    if old_image_path and old_image_path != storage_path:
        safe_delete_media_file(db, old_image_path, current_table="activities", current_id=activity.id)

    record_audit_event(
        db=db,
        action=action_type,
        user_id=current_admin.id,
        user_email=current_admin.email,
        ip_address=client_ip,
        entity_type="activity",
        entity_id=str(activity.id),
        details={
            "storage_path": storage_path,
            "original_filename": file.filename,
            "mime_type": detected_mime,
            "file_size": file_size,
        },
    )

    return ActivityAdminResponse.model_validate(activity)


@router.delete(
    "/{activity_id}/image",
    response_model=ActivityAdminResponse,
    summary="Remove Activity Image (Admin)",
)
def delete_activity_image(
    activity_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
) -> ActivityAdminResponse:
    """
    Removes an activity program image and safely deletes the underlying file if unreferenced.
    """
    client_ip = get_client_ip(request)
    activity = db.query(Activity).filter(Activity.id == activity_id).first()
    if not activity:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Activity not found.")

    old_image = activity.image
    if not old_image:
        return ActivityAdminResponse.model_validate(activity)

    activity.image = None
    db.commit()
    db.refresh(activity)

    safe_delete_media_file(db, old_image, current_table="activities", current_id=activity.id)

    record_audit_event(
        db=db,
        action="ACTIVITY_IMAGE_REMOVED",
        user_id=current_admin.id,
        user_email=current_admin.email,
        ip_address=client_ip,
        entity_type="activity",
        entity_id=str(activity.id),
        details={"removed_image": old_image},
    )

    return ActivityAdminResponse.model_validate(activity)


@router.post(
    "/{activity_id}/status",
    response_model=ActivityAdminResponse,
    summary="Change Activity Status (Admin)",
)
def change_activity_status(
    activity_id: int,
    payload: StatusTransitionRequest,
    request: Request,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
) -> ActivityAdminResponse:
    """
    Explicit status transition for activities.
    """
    client_ip = get_client_ip(request)
    item = db.query(Activity).filter(Activity.id == activity_id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Activity not found.")

    target_status = payload.status
    old_status = item.status
    item.status = target_status

    if target_status == "published":
        item.published_at = func.now()
        item.archived_at = None
        action_name = "ACTIVITY_PUBLISHED"
    elif target_status == "archived":
        item.archived_at = func.now()
        action_name = "ACTIVITY_ARCHIVED"
    else:  # draft
        item.published_at = None
        item.archived_at = None
        action_name = "ACTIVITY_RESTORED_DRAFT"

    db.commit()
    db.refresh(item)

    record_audit_event(
        db=db,
        action=action_name,
        user_id=current_admin.id,
        user_email=current_admin.email,
        ip_address=client_ip,
        entity_type="activity",
        entity_id=str(item.id),
        details={"old_status": old_status, "new_status": target_status, "title": item.title},
    )

    return ActivityAdminResponse.model_validate(item)


@router.delete(
    "/{activity_id}",
    status_code=status.HTTP_200_OK,
    summary="Delete Activity (Admin)",
)
def delete_activity(
    activity_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
) -> dict:
    """
    Permanently deletes an activity with safe image cleanup and audit logging.
    """
    client_ip = get_client_ip(request)
    item = db.query(Activity).filter(Activity.id == activity_id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Activity not found.")

    title = item.title
    image_to_delete = item.image

    db.delete(item)
    db.commit()

    if image_to_delete:
        safe_delete_media_file(db, image_to_delete, current_table="activities", current_id=activity_id)

    record_audit_event(
        db=db,
        action="ACTIVITY_DELETED",
        user_id=current_admin.id,
        user_email=current_admin.email,
        ip_address=client_ip,
        entity_type="activity",
        entity_id=str(activity_id),
        details={"deleted_title": title},
    )

    return {"status": "ok", "message": f"Activity #{activity_id} successfully deleted."}

