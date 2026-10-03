from typing import Optional
from fastapi import APIRouter, Depends, File, Form, HTTPException, Request, UploadFile, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from backend.app.api.deps import get_current_admin, get_client_ip
from backend.app.core.database import get_db
from backend.app.models.user import User
from backend.app.models.site_asset import SiteAsset
from backend.app.schemas.asset import SiteAssetAdminResponse
from backend.app.services.audit import record_audit_event
from backend.app.services.storage import StorageService, read_and_validate_upload_file

router = APIRouter()


# =============================================================================
# 1. Official Logo Admin Endpoints
# =============================================================================
@router.get(
    "/logo",
    response_model=SiteAssetAdminResponse,
    summary="Get Official Logo (Admin)",
)
def get_admin_logo(
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
) -> SiteAssetAdminResponse:
    """
    Returns the currently active official logo asset metadata.
    """
    asset = (
        db.query(SiteAsset)
        .filter(SiteAsset.asset_type == "LOGO", SiteAsset.is_active == True)
        .order_by(desc(SiteAsset.created_at))
        .first()
    )
    if not asset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Official logo not found or not uploaded yet.",
        )
    return SiteAssetAdminResponse.model_validate(asset)


@router.post(
    "/logo",
    response_model=SiteAssetAdminResponse,
    status_code=status.HTTP_200_OK,
    summary="Upload or Replace Official Logo (Admin)",
)
async def upload_or_replace_logo(
    request: Request,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
) -> SiteAssetAdminResponse:
    """
    Uploads or replaces the official club logo.
    Validates magic bytes, file size, MIME type (JPEG/PNG/WebP), and Pillow integrity.
    Safely cleans up previous storage file upon successful replacement.
    """
    client_ip = get_client_ip(request)
    file_bytes = await read_and_validate_upload_file(file)

    # Save and validate via secure storage service
    storage_path, detected_mime, file_size, width, height = StorageService.save_site_asset(
        file_bytes=file_bytes,
        content_type=file.content_type,
        subfolder="assets",
    )

    # Check for existing active logo
    existing_logos = (
        db.query(SiteAsset)
        .filter(SiteAsset.asset_type == "LOGO", SiteAsset.is_active == True)
        .all()
    )

    is_replacement = len(existing_logos) > 0

    # Create new active logo asset
    new_asset = SiteAsset(
        asset_type="LOGO",
        year=None,
        storage_path=storage_path,
        original_filename=file.filename or "logo",
        mime_type=detected_mime,
        file_size=file_size,
        width=width,
        height=height,
        is_active=True,
        created_by=current_admin.id,
    )
    db.add(new_asset)

    # Deactivate / delete old logos from database & clean up their physical files
    for old_logo in existing_logos:
        old_path = old_logo.storage_path
        db.delete(old_logo)
        StorageService.delete_file(old_path)

    db.commit()
    db.refresh(new_asset)

    # Audit logging
    action = "REPLACE_LOGO" if is_replacement else "UPLOAD_LOGO"
    record_audit_event(
        db=db,
        action=action,
        user_id=current_admin.id,
        user_email=current_admin.email,
        ip_address=client_ip,
        entity_type="site_asset",
        entity_id=str(new_asset.id),
        details={
            "asset_type": "LOGO",
            "storage_path": new_asset.storage_path,
            "original_filename": new_asset.original_filename,
            "mime_type": new_asset.mime_type,
            "file_size": new_asset.file_size,
            "width": new_asset.width,
            "height": new_asset.height,
        },
    )

    return SiteAssetAdminResponse.model_validate(new_asset)


@router.delete(
    "/logo",
    summary="Delete Official Logo (Admin)",
)
def delete_logo(
    request: Request,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
) -> dict:
    """
    Deletes the current active official logo and purges its physical file from storage.
    Public website falls back gracefully to text brand fallback.
    """
    client_ip = get_client_ip(request)
    existing_logos = (
        db.query(SiteAsset)
        .filter(SiteAsset.asset_type == "LOGO")
        .all()
    )
    if not existing_logos:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No official logo found to delete.",
        )

    for asset in existing_logos:
        old_path = asset.storage_path
        db.delete(asset)
        StorageService.delete_file(old_path)

    db.commit()

    record_audit_event(
        db=db,
        action="DELETE_LOGO",
        user_id=current_admin.id,
        user_email=current_admin.email,
        ip_address=client_ip,
        entity_type="site_asset",
        entity_id="LOGO",
        details={"asset_type": "LOGO"},
    )

    return {"message": "Official logo deleted successfully."}


# =============================================================================
# 2. Current-Year Ganesh Image Admin Endpoints
# =============================================================================
@router.get(
    "/ganesh/current",
    response_model=SiteAssetAdminResponse,
    summary="Get Current-Year Ganesh Image (Admin)",
)
def get_admin_current_ganesh(
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
) -> SiteAssetAdminResponse:
    """
    Returns the currently active Ganesh/Puja image asset metadata.
    """
    asset = (
        db.query(SiteAsset)
        .filter(SiteAsset.asset_type == "GANESH_CURRENT", SiteAsset.is_active == True)
        .order_by(desc(SiteAsset.created_at))
        .first()
    )
    if not asset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Current-year Ganesh image not found or not uploaded yet.",
        )
    return SiteAssetAdminResponse.model_validate(asset)


@router.post(
    "/ganesh/current",
    response_model=SiteAssetAdminResponse,
    status_code=status.HTTP_200_OK,
    summary="Upload or Replace Current-Year Ganesh Image (Admin)",
)
async def upload_or_replace_current_ganesh(
    request: Request,
    file: UploadFile = File(...),
    year: int = Form(2026),
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
) -> SiteAssetAdminResponse:
    """
    Uploads or replaces the current-year Ganesh Chaturthi festival image.
    Stores explicit festival year in database metadata.
    """
    if year < 2012 or year > 2100:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid festival year. Must be between 2012 and 2100.",
        )

    client_ip = get_client_ip(request)
    file_bytes = await read_and_validate_upload_file(file)

    # Save and validate via secure storage service
    storage_path, detected_mime, file_size, width, height = StorageService.save_site_asset(
        file_bytes=file_bytes,
        content_type=file.content_type,
        subfolder="assets",
    )

    # Check for existing active ganesh asset
    existing_assets = (
        db.query(SiteAsset)
        .filter(SiteAsset.asset_type == "GANESH_CURRENT", SiteAsset.is_active == True)
        .all()
    )

    is_replacement = len(existing_assets) > 0

    # Create new active ganesh asset
    new_asset = SiteAsset(
        asset_type="GANESH_CURRENT",
        year=year,
        storage_path=storage_path,
        original_filename=file.filename or f"ganesh_{year}",
        mime_type=detected_mime,
        file_size=file_size,
        width=width,
        height=height,
        is_active=True,
        created_by=current_admin.id,
    )
    db.add(new_asset)

    # Delete old ganesh assets from database & clean up their physical files
    for old_asset in existing_assets:
        old_path = old_asset.storage_path
        db.delete(old_asset)
        StorageService.delete_file(old_path)

    db.commit()
    db.refresh(new_asset)

    # Audit logging
    action = "REPLACE_GANESH_CURRENT" if is_replacement else "UPLOAD_GANESH_CURRENT"
    record_audit_event(
        db=db,
        action=action,
        user_id=current_admin.id,
        user_email=current_admin.email,
        ip_address=client_ip,
        entity_type="site_asset",
        entity_id=str(new_asset.id),
        details={
            "asset_type": "GANESH_CURRENT",
            "year": new_asset.year,
            "storage_path": new_asset.storage_path,
            "original_filename": new_asset.original_filename,
            "mime_type": new_asset.mime_type,
            "file_size": new_asset.file_size,
            "width": new_asset.width,
            "height": new_asset.height,
        },
    )

    return SiteAssetAdminResponse.model_validate(new_asset)


@router.delete(
    "/ganesh/current",
    summary="Delete Current-Year Ganesh Image (Admin)",
)
def delete_current_ganesh(
    request: Request,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
) -> dict:
    """
    Deletes the current active Ganesh image and purges its physical file from storage.
    Homepage falls back gracefully.
    """
    client_ip = get_client_ip(request)
    existing_assets = (
        db.query(SiteAsset)
        .filter(SiteAsset.asset_type == "GANESH_CURRENT")
        .all()
    )
    if not existing_assets:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No current-year Ganesh image found to delete.",
        )

    for asset in existing_assets:
        old_path = asset.storage_path
        db.delete(asset)
        StorageService.delete_file(old_path)

    db.commit()

    record_audit_event(
        db=db,
        action="DELETE_GANESH_CURRENT",
        user_id=current_admin.id,
        user_email=current_admin.email,
        ip_address=client_ip,
        entity_type="site_asset",
        entity_id="GANESH_CURRENT",
        details={"asset_type": "GANESH_CURRENT"},
    )

    return {"message": "Current-year Ganesh image deleted successfully."}
