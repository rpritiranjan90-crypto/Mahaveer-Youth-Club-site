import math
from typing import Optional
from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, Request, UploadFile, status
from sqlalchemy.orm import Session
from sqlalchemy import desc, func

from backend.app.api.deps import get_current_admin, get_client_ip
from backend.app.core.database import get_db
from backend.app.models.user import User
from backend.app.models.gallery import GalleryItem
from backend.app.schemas.content import (
    PaginatedResponse,
    GalleryItemCreate,
    GalleryItemUpdate,
    GalleryItemAdminResponse,
    StatusTransitionRequest,
)
from backend.app.services.audit import record_audit_event
from backend.app.services.storage import StorageService

router = APIRouter()


@router.get(
    "",
    response_model=PaginatedResponse[GalleryItemAdminResponse],
    summary="List All Gallery Items (Admin)",
)
def list_admin_gallery(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by draft/published/archived"),
    year: Optional[str] = Query(None, max_length=10),
    category: Optional[str] = Query(None, max_length=100),
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
) -> PaginatedResponse[GalleryItemAdminResponse]:
    """
    Returns gallery photos across all statuses (draft, published, archived) with year and category filters.
    """
    query = db.query(GalleryItem)

    if status_filter and status_filter.lower() != "all":
        query = query.filter(GalleryItem.status == status_filter.lower())

    if year and year.lower() != "all":
        query = query.filter(GalleryItem.year == year.strip())

    if category and category.lower() != "all":
        query = query.filter(GalleryItem.category.ilike(category.strip()))

    total = query.count()
    total_pages = math.ceil(total / page_size) if total > 0 else 1

    items = (
        query.order_by(desc(GalleryItem.created_at))
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    return PaginatedResponse(
        items=[GalleryItemAdminResponse.model_validate(item) for item in items],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.post(
    "",
    response_model=GalleryItemAdminResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Gallery Item (Admin - Metadata)",
)
def create_gallery_item(
    payload: GalleryItemCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
) -> GalleryItemAdminResponse:
    """
    Creates a new gallery record with an existing image URL.
    """
    client_ip = get_client_ip(request)
    item_status = payload.status or "draft"
    published_at = func.now() if item_status == "published" else None

    new_item = GalleryItem(
        title=payload.title.strip(),
        image_url=payload.image_url.strip(),
        thumbnail_url=payload.thumbnail_url.strip() if payload.thumbnail_url else None,
        year=payload.year.strip(),
        category=payload.category.strip(),
        alt_text=payload.alt_text.strip(),
        status=item_status,
        published_at=published_at,
    )
    db.add(new_item)
    db.commit()
    db.refresh(new_item)

    record_audit_event(
        db=db,
        action="GALLERY_UPLOADED",
        user_id=current_admin.id,
        user_email=current_admin.email,
        ip_address=client_ip,
        entity_type="gallery",
        entity_id=str(new_item.id),
        details={"title": new_item.title, "year": new_item.year, "status": new_item.status},
    )

    return GalleryItemAdminResponse.model_validate(new_item)


@router.post(
    "/upload",
    response_model=GalleryItemAdminResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload Image & Create Gallery Item (Admin)",
)
async def upload_gallery_image(
    request: Request,
    title: str = Form(..., min_length=1, max_length=255),
    year: str = Form(..., min_length=4, max_length=10),
    category: str = Form("Ganesh Puja", max_length=100),
    alt_text: str = Form("", max_length=255),
    item_status: str = Form("draft"),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
) -> GalleryItemAdminResponse:
    """
    Uploads a photo file (JPEG/PNG/WebP), validates magic bytes & size,
    generates a thumbnail, and creates a gallery record.
    """
    client_ip = get_client_ip(request)

    file_bytes = await file.read()
    image_url, thumbnail_url = StorageService.save_image(
        file_bytes=file_bytes,
        content_type=file.content_type,
        subfolder="gallery",
    )

    status_val = item_status.lower() if item_status.lower() in ("draft", "published", "archived") else "draft"
    published_at = func.now() if status_val == "published" else None

    # Default alt_text to title if not provided
    effective_alt = alt_text.strip() if alt_text.strip() else title.strip()

    new_item = GalleryItem(
        title=title.strip(),
        image_url=image_url,
        thumbnail_url=thumbnail_url,
        year=year.strip(),
        category=category.strip(),
        alt_text=effective_alt,
        status=status_val,
        published_at=published_at,
    )
    db.add(new_item)
    db.commit()
    db.refresh(new_item)

    record_audit_event(
        db=db,
        action="GALLERY_UPLOADED",
        user_id=current_admin.id,
        user_email=current_admin.email,
        ip_address=client_ip,
        entity_type="gallery",
        entity_id=str(new_item.id),
        details={"title": new_item.title, "year": new_item.year, "image_url": image_url, "status": new_item.status},
    )

    return GalleryItemAdminResponse.model_validate(new_item)


@router.get(
    "/{gallery_id}",
    response_model=GalleryItemAdminResponse,
    summary="Get Gallery Item (Admin)",
)
def get_gallery_detail(
    gallery_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
) -> GalleryItemAdminResponse:
    item = db.query(GalleryItem).filter(GalleryItem.id == gallery_id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Gallery item not found.")
    return GalleryItemAdminResponse.model_validate(item)


@router.patch(
    "/{gallery_id}",
    response_model=GalleryItemAdminResponse,
    summary="Update Gallery Item Metadata (Admin)",
)
def update_gallery_item(
    gallery_id: int,
    payload: GalleryItemUpdate,
    request: Request,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
) -> GalleryItemAdminResponse:
    """
    Updates gallery metadata (title, year, category, alt_text, status).
    """
    client_ip = get_client_ip(request)
    item = db.query(GalleryItem).filter(GalleryItem.id == gallery_id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Gallery item not found.")

    if payload.title is not None:
        item.title = payload.title.strip()

    if payload.image_url is not None:
        item.image_url = payload.image_url.strip()

    if payload.thumbnail_url is not None:
        item.thumbnail_url = payload.thumbnail_url.strip() if payload.thumbnail_url else None

    if payload.year is not None:
        item.year = payload.year.strip()

    if payload.category is not None:
        item.category = payload.category.strip()

    if payload.alt_text is not None:
        item.alt_text = payload.alt_text.strip()

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
        action="GALLERY_EDITED",
        user_id=current_admin.id,
        user_email=current_admin.email,
        ip_address=client_ip,
        entity_type="gallery",
        entity_id=str(item.id),
        details={"title": item.title, "year": item.year, "status": item.status},
    )

    return GalleryItemAdminResponse.model_validate(item)


@router.post(
    "/{gallery_id}/status",
    response_model=GalleryItemAdminResponse,
    summary="Change Gallery Item Status (Admin)",
)
def change_gallery_status(
    gallery_id: int,
    payload: StatusTransitionRequest,
    request: Request,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
) -> GalleryItemAdminResponse:
    """
    Explicit status transition for gallery items.
    """
    client_ip = get_client_ip(request)
    item = db.query(GalleryItem).filter(GalleryItem.id == gallery_id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Gallery item not found.")

    target_status = payload.status
    old_status = item.status
    item.status = target_status

    if target_status == "published":
        item.published_at = func.now()
        item.archived_at = None
        action_name = "GALLERY_PUBLISHED"
    elif target_status == "archived":
        item.archived_at = func.now()
        action_name = "GALLERY_ARCHIVED"
    else:  # draft
        item.published_at = None
        item.archived_at = None
        action_name = "GALLERY_RESTORED_DRAFT"

    db.commit()
    db.refresh(item)

    record_audit_event(
        db=db,
        action=action_name,
        user_id=current_admin.id,
        user_email=current_admin.email,
        ip_address=client_ip,
        entity_type="gallery",
        entity_id=str(item.id),
        details={"old_status": old_status, "new_status": target_status, "title": item.title},
    )

    return GalleryItemAdminResponse.model_validate(item)


@router.delete(
    "/{gallery_id}",
    status_code=status.HTTP_200_OK,
    summary="Delete Gallery Item (Admin)",
)
def delete_gallery_item(
    gallery_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
) -> dict:
    """
    Deletes gallery item and removes underlying image files from storage.
    """
    client_ip = get_client_ip(request)
    item = db.query(GalleryItem).filter(GalleryItem.id == gallery_id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Gallery item not found.")

    title = item.title
    image_url = item.image_url
    thumbnail_url = item.thumbnail_url

    # Safely clean up local media
    StorageService.delete_file(image_url)
    if thumbnail_url:
        StorageService.delete_file(thumbnail_url)

    db.delete(item)
    db.commit()

    record_audit_event(
        db=db,
        action="GALLERY_DELETED",
        user_id=current_admin.id,
        user_email=current_admin.email,
        ip_address=client_ip,
        entity_type="gallery",
        entity_id=str(gallery_id),
        details={"deleted_title": title},
    )

    return {"status": "ok", "message": f"Gallery photo #{gallery_id} deleted."}
