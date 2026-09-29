import os
import uuid
import mimetypes
from pathlib import Path
from typing import Tuple
from fastapi import UploadFile, HTTPException, status
from backend.app.core.config import settings
from backend.app.core.logging import logger


class StorageService:
    """
    Abstract storage service for secure local media file management.
    Validates MIME types, extensions, size constraints, and prevents path traversal.
    """

    def __init__(self, base_dir: str = settings.UPLOAD_DIR):
        self.base_dir = Path(base_dir).resolve()
        self.base_dir.mkdir(parents=True, exist_ok=True)

    def validate_file(self, filename: str, content_type: str, file_size: int) -> Tuple[bool, str]:
        """
        Validates filename, extension, MIME type, and size limits.
        """
        if not filename or ".." in filename or "/" in filename or "\\" in filename:
            return False, "Invalid filename or potential path traversal detected."

        ext = Path(filename).suffix.lower()
        if ext not in settings.ALLOWED_IMAGE_EXTENSIONS:
            return False, f"File extension '{ext}' is not allowed. Supported extensions: {', '.join(settings.ALLOWED_IMAGE_EXTENSIONS)}"

        # Verify MIME type
        guessed_type, _ = mimetypes.guess_type(filename)
        mime = content_type or guessed_type or ""
        if mime.lower() not in settings.ALLOWED_IMAGE_MIME_TYPES:
            return False, f"MIME type '{mime}' is not allowed. Supported types: {', '.join(settings.ALLOWED_IMAGE_MIME_TYPES)}"

        if file_size > settings.MAX_UPLOAD_SIZE_BYTES:
            max_mb = settings.MAX_UPLOAD_SIZE_BYTES / (1024 * 1024)
            return False, f"File size exceeds maximum allowed limit of {max_mb} MB."

        return True, ""

    async def save_image(self, file: UploadFile) -> Tuple[str, str, int]:
        """
        Reads, validates, and securely stores an uploaded image.
        Returns (stored_filename, public_url, file_size).
        """
        # Read content to check size
        content = await file.read()
        file_size = len(content)

        is_valid, error_msg = self.validate_file(
            filename=file.filename or "",
            content_type=file.content_type or "",
            file_size=file_size,
        )

        if not is_valid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=error_msg,
            )

        # Generate secure random filename
        ext = Path(file.filename or "").suffix.lower()
        safe_name = f"{uuid.uuid4().hex}{ext}"
        destination = self.base_dir / safe_name

        try:
            with open(destination, "wb") as f:
                f.write(content)
            logger.info("Saved image upload: %s (%d bytes)", safe_name, file_size)
        except Exception as e:
            logger.error("Failed to write uploaded file: %s", str(e))
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Could not save uploaded file.",
            )

        public_url = f"/uploads/{safe_name}"
        return safe_name, public_url, file_size

    def delete_image(self, filename_or_url: str) -> bool:
        """
        Safely deletes a stored image by filename or URL.
        """
        filename = os.path.basename(filename_or_url)
        if ".." in filename or "/" in filename or "\\" in filename:
            return False

        target = self.base_dir / filename
        if target.exists() and target.is_file():
            try:
                target.unlink()
                logger.info("Deleted image file: %s", filename)
                return True
            except Exception as e:
                logger.error("Error deleting image file: %s", str(e))
                return False
        return False


storage_service = StorageService()
