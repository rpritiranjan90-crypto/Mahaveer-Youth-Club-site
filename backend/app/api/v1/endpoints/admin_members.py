import math
from typing import Optional
from fastapi import APIRouter, Depends, File, HTTPException, Query, Request, UploadFile, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from backend.app.api.deps import get_current_admin, get_client_ip
from backend.app.core.database import get_db
from backend.app.models.user import User
from backend.app.models.member import Member
from backend.app.schemas.content import PaginatedResponse
from backend.app.schemas.member import (
    MemberCreate,
    MemberUpdate,
    MemberReorderRequest,
    MemberAdminResponse,
)
from backend.app.services.storage import StorageService, read_and_validate_upload_file
from backend.app.services.audit import record_audit_event

router = APIRouter()


@router.get(
    "",
    response_model=PaginatedResponse[MemberAdminResponse],
    summary="List Members (Admin)",
)
def list_admin_members(
    page: int = Query(1, ge=1),
    page_size: int = Query(100, ge=1, le=200),
    is_active: Optional[bool] = Query(None),
    is_visible: Optional[bool] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
) -> PaginatedResponse[MemberAdminResponse]:
    """
    Returns full member directory with administrative metadata, search, and active filtering.
    """
    query = db.query(Member)

    # Active status filter (support both is_active and is_visible query params)
    active_filter = is_active if is_active is not None else is_visible
    if active_filter is not None:
        query = query.filter(Member.is_active == active_filter)

    # Search filter
    if search:
        search_term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Member.name.ilike(search_term),
                Member.designation.ilike(search_term),
                Member.bio.ilike(search_term),
            )
        )

    total = query.count()
    total_pages = math.ceil(total / page_size) if total > 0 else 1

    items = (
        query.order_by(Member.display_order.asc(), Member.id.asc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    return PaginatedResponse(
        items=[MemberAdminResponse.model_validate(item) for item in items],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.post(
    "",
    response_model=MemberAdminResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add Member (Admin)",
)
def create_member(
    payload: MemberCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
) -> MemberAdminResponse:
    """
    Adds a new member profile to the club roster.
    PRIVACY ENFORCED: Minimal profile (name, designation, optional bio, display order, active flag).
    """
    client_ip = get_client_ip(request)

    # If display_order was not specified or is 0, auto-assign next order
    display_order = payload.display_order if (payload.display_order and payload.display_order > 0) else 0
    if display_order == 0:
        max_order = db.query(Member.display_order).order_by(Member.display_order.desc()).first()
        display_order = (max_order[0] + 1) if (max_order and max_order[0] is not None) else 1

    new_member = Member(
        name=payload.name or "",
        designation=payload.designation or "Member",
        bio=payload.bio.strip() if payload.bio else None,
        display_order=display_order,
        is_active=payload.is_active if payload.is_active is not None else True,
        created_by=current_admin.id,
    )
    db.add(new_member)
    db.commit()
    db.refresh(new_member)

    record_audit_event(
        db=db,
        action="MEMBER_CREATED",
        user_id=current_admin.id,
        user_email=current_admin.email,
        ip_address=client_ip,
        entity_type="member",
        entity_id=str(new_member.id),
        details={
            "name": new_member.name,
            "designation": new_member.designation,
            "display_order": new_member.display_order,
            "is_active": new_member.is_active,
        },
    )

    return MemberAdminResponse.model_validate(new_member)


@router.get(
    "/{member_id}",
    response_model=MemberAdminResponse,
    summary="Get Member Detail (Admin)",
)
def get_member_detail(
    member_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
) -> MemberAdminResponse:
    item = db.query(Member).filter(Member.id == member_id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Member not found.")
    return MemberAdminResponse.model_validate(item)


@router.patch(
    "/{member_id}",
    response_model=MemberAdminResponse,
    summary="Update Member (Admin)",
)
@router.put(
    "/{member_id}",
    response_model=MemberAdminResponse,
    summary="Update Member (Admin)",
)
def update_member(
    member_id: int,
    payload: MemberUpdate,
    request: Request,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
) -> MemberAdminResponse:
    """
    Updates member profile fields (name, designation, bio, display order, active status).
    """
    client_ip = get_client_ip(request)
    item = db.query(Member).filter(Member.id == member_id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Member not found.")

    if payload.name is not None:
        item.name = payload.name.strip()

    if payload.designation is not None:
        item.designation = payload.designation.strip()

    if payload.bio is not None:
        item.bio = payload.bio.strip() if payload.bio.strip() else None

    if payload.display_order is not None:
        item.display_order = payload.display_order

    if payload.is_active is not None:
        item.is_active = payload.is_active

    item.updated_by = current_admin.id
    db.commit()
    db.refresh(item)

    record_audit_event(
        db=db,
        action="MEMBER_UPDATED",
        user_id=current_admin.id,
        user_email=current_admin.email,
        ip_address=client_ip,
        entity_type="member",
        entity_id=str(item.id),
        details={
            "name": item.name,
            "designation": item.designation,
            "display_order": item.display_order,
            "is_active": item.is_active,
        },
    )

    return MemberAdminResponse.model_validate(item)


@router.post(
    "/{member_id}/photo",
    response_model=MemberAdminResponse,
    summary="Upload/Replace Member Photo (Admin)",
)
async def upload_member_photo(
    member_id: int,
    file: UploadFile = File(...),
    request: Request = None,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
) -> MemberAdminResponse:
    """
    Uploads or replaces a member's photograph.
    Security: Validates JPEG/PNG/WebP, magic bytes, Pillow integrity.
    Replaces old file safely without orphaned references.
    """
    client_ip = get_client_ip(request)
    member = db.query(Member).filter(Member.id == member_id).first()
    if not member:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Member not found.")

    file_bytes = await read_and_validate_upload_file(file)
    storage_path, detected_mime, file_size, width, height = StorageService.save_member_photo(
        file_bytes=file_bytes,
        content_type=file.content_type,
    )

    old_photo_path = member.photo_storage_path
    action_type = "MEMBER_PHOTO_REPLACED" if old_photo_path else "MEMBER_PHOTO_UPLOADED"

    member.photo_storage_path = storage_path
    member.photo_original_filename = file.filename
    member.photo_mime_type = detected_mime
    member.photo_file_size = file_size
    member.photo_width = width
    member.photo_height = height
    member.updated_by = current_admin.id

    db.commit()
    db.refresh(member)

    # Safely remove old photo if replacing
    if old_photo_path and old_photo_path != storage_path:
        StorageService.delete_file(old_photo_path)

    record_audit_event(
        db=db,
        action=action_type,
        user_id=current_admin.id,
        user_email=current_admin.email,
        ip_address=client_ip,
        entity_type="member",
        entity_id=str(member.id),
        details={
            "storage_path": storage_path,
            "original_filename": file.filename,
            "mime_type": detected_mime,
            "file_size": file_size,
        },
    )

    return MemberAdminResponse.model_validate(member)


@router.delete(
    "/{member_id}/photo",
    response_model=MemberAdminResponse,
    summary="Delete Member Photo (Admin)",
)
def delete_member_photo(
    member_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
) -> MemberAdminResponse:
    """
    Deletes a member's photograph and clears photo metadata.
    """
    client_ip = get_client_ip(request)
    member = db.query(Member).filter(Member.id == member_id).first()
    if not member:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Member not found.")

    old_photo_path = member.photo_storage_path
    if not old_photo_path:
        return MemberAdminResponse.model_validate(member)

    member.photo_storage_path = None
    member.photo_original_filename = None
    member.photo_mime_type = None
    member.photo_file_size = None
    member.photo_width = None
    member.photo_height = None
    member.updated_by = current_admin.id

    db.commit()
    db.refresh(member)

    StorageService.delete_file(old_photo_path)

    record_audit_event(
        db=db,
        action="MEMBER_PHOTO_DELETED",
        user_id=current_admin.id,
        user_email=current_admin.email,
        ip_address=client_ip,
        entity_type="member",
        entity_id=str(member.id),
        details={"deleted_photo_path": old_photo_path},
    )

    return MemberAdminResponse.model_validate(member)


@router.post(
    "/{member_id}/activate",
    response_model=MemberAdminResponse,
    summary="Activate Member (Admin)",
)
def activate_member(
    member_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
) -> MemberAdminResponse:
    client_ip = get_client_ip(request)
    member = db.query(Member).filter(Member.id == member_id).first()
    if not member:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Member not found.")

    member.is_active = True
    member.updated_by = current_admin.id
    db.commit()
    db.refresh(member)

    record_audit_event(
        db=db,
        action="MEMBER_ACTIVATED",
        user_id=current_admin.id,
        user_email=current_admin.email,
        ip_address=client_ip,
        entity_type="member",
        entity_id=str(member.id),
        details={"name": member.name},
    )

    return MemberAdminResponse.model_validate(member)


@router.post(
    "/{member_id}/deactivate",
    response_model=MemberAdminResponse,
    summary="Deactivate Member (Admin)",
)
def deactivate_member(
    member_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
) -> MemberAdminResponse:
    client_ip = get_client_ip(request)
    member = db.query(Member).filter(Member.id == member_id).first()
    if not member:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Member not found.")

    member.is_active = False
    member.updated_by = current_admin.id
    db.commit()
    db.refresh(member)

    record_audit_event(
        db=db,
        action="MEMBER_DEACTIVATED",
        user_id=current_admin.id,
        user_email=current_admin.email,
        ip_address=client_ip,
        entity_type="member",
        entity_id=str(member.id),
        details={"name": member.name},
    )

    return MemberAdminResponse.model_validate(member)


@router.post(
    "/reorder",
    status_code=status.HTTP_200_OK,
    summary="Batch Reorder Members (Admin)",
)
def reorder_members(
    payload: MemberReorderRequest,
    request: Request,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
) -> dict:
    """
    Batch updates display orders for members.
    """
    client_ip = get_client_ip(request)
    for order_item in payload.orders:
        db.query(Member).filter(Member.id == order_item.id).update(
            {"display_order": order_item.display_order}
        )
    db.commit()

    record_audit_event(
        db=db,
        action="MEMBER_REORDERED",
        user_id=current_admin.id,
        user_email=current_admin.email,
        ip_address=client_ip,
        entity_type="member",
        entity_id="batch",
        details={"count": len(payload.orders)},
    )

    return {"status": "ok", "message": f"{len(payload.orders)} members reordered successfully."}


@router.delete(
    "/{member_id}",
    status_code=status.HTTP_200_OK,
    summary="Delete Member (Admin)",
)
def delete_member(
    member_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
) -> dict:
    """
    Permanently removes a member from the roster and cleans up associated photo file.
    """
    client_ip = get_client_ip(request)
    item = db.query(Member).filter(Member.id == member_id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Member not found.")

    member_name = item.name
    photo_path = item.photo_storage_path

    db.delete(item)
    db.commit()

    if photo_path:
        StorageService.delete_file(photo_path)

    record_audit_event(
        db=db,
        action="MEMBER_DELETED",
        user_id=current_admin.id,
        user_email=current_admin.email,
        ip_address=client_ip,
        entity_type="member",
        entity_id=str(member_id),
        details={"deleted_member": member_name},
    )

    return {"status": "ok", "message": f"Member #{member_id} successfully deleted."}
