import math
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy.orm import Session

from backend.app.api.deps import get_current_admin, get_client_ip
from backend.app.core.database import get_db
from backend.app.models.user import User
from backend.app.models.member import Member
from backend.app.schemas.content import (
    PaginatedResponse,
    MemberCreate,
    MemberUpdate,
    MemberReorderRequest,
    MemberAdminResponse,
)
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
    is_visible: Optional[bool] = Query(None),
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
) -> PaginatedResponse[MemberAdminResponse]:
    """
    Returns member directory for administrative management.
    """
    query = db.query(Member)

    if is_visible is not None:
        query = query.filter(Member.is_visible == is_visible)

    total = query.count()
    total_pages = math.ceil(total / page_size) if total > 0 else 1

    items = (
        query.order_by(Member.sort_order.asc(), Member.id.asc())
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
    summary="Add Member Nickname (Admin)",
)
def create_member(
    payload: MemberCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
) -> MemberAdminResponse:
    """
    Adds an approved public member nickname to the roster.
    PRIVACY: Nicknames only.
    """
    client_ip = get_client_ip(request)

    new_member = Member(
        display_name=payload.display_name.strip(),
        role=payload.role.strip() if payload.role else "Club Youth Member",
        sort_order=payload.sort_order,
        is_visible=payload.is_visible,
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
        details={"display_name": new_member.display_name, "sort_order": new_member.sort_order},
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
def update_member(
    member_id: int,
    payload: MemberUpdate,
    request: Request,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
) -> MemberAdminResponse:
    """
    Updates member display name, role, sort order, or visibility.
    """
    client_ip = get_client_ip(request)
    item = db.query(Member).filter(Member.id == member_id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Member not found.")

    if payload.display_name is not None:
        item.display_name = payload.display_name.strip()

    if payload.role is not None:
        item.role = payload.role.strip()

    if payload.sort_order is not None:
        item.sort_order = payload.sort_order

    if payload.is_visible is not None:
        item.is_visible = payload.is_visible

    db.commit()
    db.refresh(item)

    record_audit_event(
        db=db,
        action="MEMBER_EDITED",
        user_id=current_admin.id,
        user_email=current_admin.email,
        ip_address=client_ip,
        entity_type="member",
        entity_id=str(item.id),
        details={"display_name": item.display_name, "is_visible": item.is_visible},
    )

    return MemberAdminResponse.model_validate(item)


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
    Batch updates sort orders for members.
    """
    client_ip = get_client_ip(request)
    for order_item in payload.orders:
        db.query(Member).filter(Member.id == order_item.id).update(
            {"sort_order": order_item.sort_order}
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
    Permanently removes a member nickname from the roster.
    """
    client_ip = get_client_ip(request)
    item = db.query(Member).filter(Member.id == member_id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Member not found.")

    display_name = item.display_name
    db.delete(item)
    db.commit()

    record_audit_event(
        db=db,
        action="MEMBER_DELETED",
        user_id=current_admin.id,
        user_email=current_admin.email,
        ip_address=client_ip,
        entity_type="member",
        entity_id=str(member_id),
        details={"deleted_member": display_name},
    )

    return {"status": "ok", "message": f"Member #{member_id} successfully deleted."}
