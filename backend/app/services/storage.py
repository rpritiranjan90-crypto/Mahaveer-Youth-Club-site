import os
import uuid
from pathlib import Path
from typing import Tuple, Optional
from fastapi import HTTPException, UploadFile, status
from PIL import Image
import io

from backend.app.core.config import settings
from backend.app.core.logging import logger

# Magic byte signatures for image types
MAGIC_BYTES = {
    "image/jpeg": [b"\xFF\xD8\xFF"],
    "image/png": [b"\x89PNG\r\n\x1a\n"],
    "image/webp": [b"RIFF"],  # With 'WEBP' at offset 8
}

ALLOWED_EXTENSIONS = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
}


def get_upload_dir() -> Path:
    """
    Returns the resolved absolute path to the uploads directory.
    Ensures directory exists.
    """
    base_dir = Path(os.getcwd())
    upload_path = (base_dir / settings.UPLOAD_DIR).resolve()
    upload_path.mkdir(parents=True, exist_ok=True)
    return upload_path


def validate_image_file(file_bytes: bytes, declared_content_type: Optional[str]) -> Tuple[str, str]:
    """
    Validates image content size, magic bytes signature, and structure.
    Returns (validated_mime_type, file_extension).
    Raises HTTPException on validation failure.
    """
    # 1. Size check
    if len(file_bytes) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty.",
        )

    if len(file_bytes) > settings.MAX_UPLOAD_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Uploaded file exceeds the maximum permitted size of {settings.MAX_UPLOAD_SIZE_BYTES // (1024 * 1024)}MB.",
        )

    # 2. Magic byte check
    detected_mime: Optional[str] = None
    for mime, signatures in MAGIC_BYTES.items():
        for sig in signatures:
            if file_bytes.startswith(sig):
                if mime == "image/webp":
                    if len(file_bytes) >= 12 and file_bytes[8:12] == b"WEBP":
                        detected_mime = mime
                        break
                else:
                    detected_mime = mime
                    break
        if detected_mime:
            break

    if not detected_mime or detected_mime not in settings.ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported image format. Allowed formats: JPEG, PNG, WebP.",
        )

    # 3. Integrity verification with Pillow
    try:
        image = Image.open(io.BytesIO(file_bytes))
        image.verify()
    except Exception as e:
        logger.warning("Image verification failed: %s", str(e))
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The uploaded file is not a valid or corrupted image.",
        )

    ext = ALLOWED_EXTENSIONS[detected_mime]
    return detected_mime, ext


class StorageService:
    """
    Secure file storage service for gallery images and featured media.
    Handles path traversal protection, UUID naming, and thumbnail creation.
    """

    @staticmethod
    def save_image(
        file_bytes: bytes,
        content_type: Optional[str] = None,
        subfolder: str = "gallery",
    ) -> Tuple[str, Optional[str]]:
        """
        Validates, saves the image, and generates a thumbnail.
        Returns (image_url, thumbnail_url).
        """
        detected_mime, ext = validate_image_file(file_bytes, content_type)

        upload_root = get_upload_dir()
        target_dir = (upload_root / subfolder).resolve()
        
        # Verify no path traversal outside upload_root
        if not str(target_dir).startswith(str(upload_root)):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid upload destination.",
            )
        target_dir.mkdir(parents=True, exist_ok=True)

        # Generate safe server-side UUID filename
        file_id = uuid.uuid4().hex
        main_filename = f"{file_id}{ext}"
        thumb_filename = f"{file_id}_thumb{ext}"

        main_path = target_dir / main_filename
        thumb_path = target_dir / thumb_filename

        # Write original image
        with open(main_path, "wb") as f:
            f.write(file_bytes)

        # Generate thumbnail
        thumbnail_url = None
        try:
            image = Image.open(io.BytesIO(file_bytes))
            # Convert RGBA to RGB for JPEG
            if detected_mime == "image/jpeg" and image.mode in ("RGBA", "P"):
                image = image.convert("RGB")
            
            image.thumbnail((600, 600), Image.Resampling.LANCZOS)
            image.save(thumb_path, optimize=True, quality=85)
            thumbnail_url = f"/uploads/{subfolder}/{thumb_filename}"
        except Exception as e:
            logger.warning("Thumbnail generation skipped: %s", str(e))
            thumbnail_url = None

        image_url = f"/uploads/{subfolder}/{main_filename}"
        return image_url, thumbnail_url

    @staticmethod
    def save_site_asset(
        file_bytes: bytes,
        content_type: Optional[str] = None,
        subfolder: str = "assets",
    ) -> Tuple[str, str, int, Optional[int], Optional[int]]:
        """
        Validates, saves a managed brand/site asset (Logo, Ganesh image), and extracts dimensions.
        Returns (storage_path, detected_mime, file_size, width, height).
        """
        detected_mime, ext = validate_image_file(file_bytes, content_type)

        upload_root = get_upload_dir()
        target_dir = (upload_root / subfolder).resolve()

        if not str(target_dir).startswith(str(upload_root)):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid upload destination.",
            )
        target_dir.mkdir(parents=True, exist_ok=True)

        file_id = uuid.uuid4().hex
        main_filename = f"{file_id}{ext}"
        main_path = target_dir / main_filename

        with open(main_path, "wb") as f:
            f.write(file_bytes)

        width: Optional[int] = None
        height: Optional[int] = None
        try:
            with Image.open(io.BytesIO(file_bytes)) as img:
                width, height = img.size
        except Exception as e:
            logger.warning("Could not extract image dimensions: %s", str(e))

        storage_path = f"/uploads/{subfolder}/{main_filename}"
        return storage_path, detected_mime, len(file_bytes), width, height

    @staticmethod
    def save_member_photo(
        file_bytes: bytes,
        content_type: Optional[str] = None,
    ) -> Tuple[str, str, int, Optional[int], Optional[int]]:
        """
        Validates and saves a member profile photograph securely.
        Returns (storage_path, detected_mime, file_size, width, height).
        """
        return StorageService.save_site_asset(
            file_bytes=file_bytes,
            content_type=content_type,
            subfolder="members",
        )

    @staticmethod
    def save_activity_image(
        file_bytes: bytes,
        content_type: Optional[str] = None,
    ) -> Tuple[str, str, int, Optional[int], Optional[int]]:
        """
        Validates and saves an activity program image securely.
        Returns (storage_path, detected_mime, file_size, width, height).
        """
        return StorageService.save_site_asset(
            file_bytes=file_bytes,
            content_type=content_type,
            subfolder="activities",
        )

    @staticmethod
    def save_update_image(
        file_bytes: bytes,
        content_type: Optional[str] = None,
    ) -> Tuple[str, str, int, Optional[int], Optional[int]]:
        """
        Validates and saves a circular / bulletin featured image securely.
        Returns (storage_path, detected_mime, file_size, width, height).
        """
        return StorageService.save_site_asset(
            file_bytes=file_bytes,
            content_type=content_type,
            subfolder="updates",
        )

    @staticmethod
    def delete_file(file_url: Optional[str]) -> bool:
        """
        Deletes a previously uploaded file safely given its URL path.
        Guards against directory traversal.
        """
        if not file_url or not file_url.startswith("/uploads/"):
            return False

        try:
            rel_path = file_url.replace("/uploads/", "").lstrip("/")
            upload_root = get_upload_dir()
            target_path = (upload_root / rel_path).resolve()

            # Guard against path traversal
            if not str(target_path).startswith(str(upload_root)):
                logger.warning("Attempted path traversal deletion: %s", file_url)
                return False

            if target_path.exists() and target_path.is_file():
                target_path.unlink()
                return True
        except Exception as e:
            logger.error("Failed to delete stored file [%s]: %s", file_url, str(e))

        return False


def is_image_referenced_elsewhere(
    db,
    file_url: Optional[str],
    current_table: Optional[str] = None,
    current_id: Optional[int] = None,
) -> bool:
    """
    Checks if a media file URL is referenced in other database records
    to prevent accidental deletion of shared gallery photos, assets, or roster photos.
    """
    if not file_url or not file_url.startswith("/uploads/"):
        return False

    from backend.app.models.gallery import GalleryItem
    from backend.app.models.site_asset import SiteAsset
    from backend.app.models.member import Member
    from backend.app.models.activity import Activity
    from backend.app.models.update import Update

    # 1. Gallery Items (original or thumbnail)
    gal_q = db.query(GalleryItem).filter(
        (GalleryItem.image_url == file_url) | (GalleryItem.thumbnail_url == file_url)
    )
    if current_table == "gallery_items" and current_id:
        gal_q = gal_q.filter(GalleryItem.id != current_id)
    if gal_q.first():
        return True

    # 2. Site Assets (Logo / Ganesh)
    asset_q = db.query(SiteAsset).filter(SiteAsset.storage_path == file_url)
    if current_table == "site_assets" and current_id:
        asset_q = asset_q.filter(SiteAsset.id != current_id)
    if asset_q.first():
        return True

    # 3. Members
    member_q = db.query(Member).filter(Member.photo_storage_path == file_url)
    if current_table == "members" and current_id:
        member_q = member_q.filter(Member.id != current_id)
    if member_q.first():
        return True

    # 4. Activities
    act_q = db.query(Activity).filter(Activity.image == file_url)
    if current_table == "activities" and current_id:
        act_q = act_q.filter(Activity.id != current_id)
    if act_q.first():
        return True

    # 5. Updates
    upd_q = db.query(Update).filter(Update.featured_image == file_url)
    if current_table == "updates" and current_id:
        upd_q = upd_q.filter(Update.id != current_id)
    if upd_q.first():
        return True

    return False


def safe_delete_media_file(
    db,
    file_url: Optional[str],
    current_table: Optional[str] = None,
    current_id: Optional[int] = None,
) -> bool:
    """
    Deletes a media file from disk ONLY if it is not referenced elsewhere in the database.
    """
    if not file_url or not file_url.startswith("/uploads/"):
        return False

    if is_image_referenced_elsewhere(db, file_url, current_table=current_table, current_id=current_id):
        logger.info("Preserving shared media file [%s] as it is still referenced elsewhere.", file_url)
        return False

    return StorageService.delete_file(file_url)

