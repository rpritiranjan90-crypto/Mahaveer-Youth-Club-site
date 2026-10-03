import io
from unittest.mock import MagicMock, PropertyMock, patch

import pytest
from fastapi import HTTPException
from PIL import Image

from backend.app.core.config import Settings, settings
from backend.app.services.storage import (
    StorageService,
    extract_cloudinary_public_id,
    is_image_referenced_elsewhere,
    safe_delete_media_file,
    validate_image_file,
)


def create_test_image(format_type: str = "JPEG", size: tuple = (100, 100), color: str = "green") -> bytes:
    img = Image.new("RGB", size, color=color)
    buf = io.BytesIO()
    img.save(buf, format=format_type)
    return buf.getvalue()


# -----------------------------------------------------------------------------
# 1. Configuration & Detection Tests
# -----------------------------------------------------------------------------
def test_cloudinary_not_configured_by_default():
    s = Settings(
        CLOUDINARY_CLOUD_NAME=None,
        CLOUDINARY_API_KEY=None,
        CLOUDINARY_API_SECRET=None,
        CLOUDINARY_URL=None,
    )
    assert s.is_cloudinary_configured is False


def test_cloudinary_configured_with_explicit_keys():
    s = Settings(
        CLOUDINARY_CLOUD_NAME="mycloud",
        CLOUDINARY_API_KEY="123456789",
        CLOUDINARY_API_SECRET="secret_token",
    )
    assert s.is_cloudinary_configured is True


def test_cloudinary_configured_with_url():
    s = Settings(
        CLOUDINARY_URL="cloudinary://123456789:secret_token@mycloud",
    )
    assert s.is_cloudinary_configured is True


def test_configure_cloudinary_from_url_populates_sdk():
    import cloudinary
    from backend.app.services.storage import configure_cloudinary

    with patch.object(settings, "CLOUDINARY_URL", "cloudinary://123456789:secret_token@mycloud"):
        configure_cloudinary()
        conf = cloudinary.config()
        assert conf.cloud_name == "mycloud"
        assert conf.api_key == "123456789"
        assert conf.api_secret == "secret_token"
        assert conf.secure is True


# -----------------------------------------------------------------------------
# 2. Public ID Extraction Tests
# -----------------------------------------------------------------------------
def test_extract_cloudinary_public_id():
    url1 = "https://res.cloudinary.com/z1aoi3i6/image/upload/v1727980000/mahaveer_club/members/d7a8f89e2b1c.jpg"
    assert extract_cloudinary_public_id(url1) == "mahaveer_club/members/d7a8f89e2b1c"

    url2 = "https://res.cloudinary.com/z1aoi3i6/image/upload/mahaveer_club/gallery/8a1b2c3d4e5f.png"
    assert extract_cloudinary_public_id(url2) == "mahaveer_club/gallery/8a1b2c3d4e5f"

    url3 = "https://res.cloudinary.com/z1aoi3i6/image/upload/c_limit,w_600/v1727980000/mahaveer_club/assets/0c4e8a1b.webp"
    assert extract_cloudinary_public_id(url3) == "mahaveer_club/assets/0c4e8a1b"

    assert extract_cloudinary_public_id("") is None
    assert extract_cloudinary_public_id("/uploads/members/local.jpg") is None


# -----------------------------------------------------------------------------
# 3. Cloudinary Upload Tests (Mocked Cloudinary SDK)
# -----------------------------------------------------------------------------
def test_save_image_with_cloudinary():
    img_bytes = create_test_image(format_type="JPEG")

    mock_upload_resp = {
        "secure_url": "https://res.cloudinary.com/z1aoi3i6/image/upload/v1/mahaveer_club/gallery/abc12345.jpg",
        "public_id": "mahaveer_club/gallery/abc12345",
        "width": 100,
        "height": 100,
    }

    with patch.object(Settings, "is_cloudinary_configured", new_callable=PropertyMock, return_value=True), \
         patch.object(settings, "CLOUDINARY_CLOUD_NAME", "z1aoi3i6"), \
         patch.object(settings, "CLOUDINARY_API_KEY", "288948134476681"), \
         patch.object(settings, "CLOUDINARY_API_SECRET", "mock_secret"), \
         patch("cloudinary.uploader.upload", return_value=mock_upload_resp) as mock_upload:

        image_url, thumb_url = StorageService.save_image(img_bytes, content_type="image/jpeg", subfolder="gallery")

        assert image_url.startswith("https://res.cloudinary.com/")
        assert "mahaveer_club/gallery" in image_url
        assert thumb_url is not None
        assert "https://res.cloudinary.com/" in thumb_url
        mock_upload.assert_called_once()
        # Verify public_id is namespaced properly
        call_kwargs = mock_upload.call_args[1]
        assert call_kwargs["public_id"].startswith("mahaveer_club/gallery/")
        assert call_kwargs["resource_type"] == "image"
        assert call_kwargs["secure"] is True


def test_save_site_asset_with_cloudinary():
    png_bytes = create_test_image(format_type="PNG", size=(200, 200))

    mock_upload_resp = {
        "secure_url": "https://res.cloudinary.com/z1aoi3i6/image/upload/v1/mahaveer_club/assets/logo_uuid.png",
        "public_id": "mahaveer_club/assets/logo_uuid",
        "width": 200,
        "height": 200,
    }

    with patch.object(Settings, "is_cloudinary_configured", new_callable=PropertyMock, return_value=True), \
         patch("cloudinary.uploader.upload", return_value=mock_upload_resp):

        storage_path, mime, size, width, height = StorageService.save_site_asset(
            png_bytes, content_type="image/png", subfolder="assets"
        )

        assert storage_path.startswith("https://res.cloudinary.com/")
        assert mime == "image/png"
        assert width == 200
        assert height == 200


def test_save_member_photo_with_cloudinary():
    jpg_bytes = create_test_image(format_type="JPEG", size=(300, 400))

    mock_upload_resp = {
        "secure_url": "https://res.cloudinary.com/z1aoi3i6/image/upload/v1/mahaveer_club/members/member_uuid.jpg",
        "public_id": "mahaveer_club/members/member_uuid",
        "width": 300,
        "height": 400,
    }

    with patch.object(Settings, "is_cloudinary_configured", new_callable=PropertyMock, return_value=True), \
         patch("cloudinary.uploader.upload", return_value=mock_upload_resp) as mock_upload:

        storage_path, mime, size, width, height = StorageService.save_member_photo(
            jpg_bytes, content_type="image/jpeg"
        )

        assert storage_path.startswith("https://res.cloudinary.com/")
        assert "mahaveer_club/members" in storage_path
        call_kwargs = mock_upload.call_args[1]
        assert call_kwargs["public_id"].startswith("mahaveer_club/members/")


# -----------------------------------------------------------------------------
# 4. Error Handling & Security Tests
# -----------------------------------------------------------------------------
def test_cloudinary_upload_failure_handles_cleanly():
    img_bytes = create_test_image(format_type="JPEG")

    with patch.object(Settings, "is_cloudinary_configured", new_callable=PropertyMock, return_value=True), \
         patch("cloudinary.uploader.upload", side_effect=Exception("Connection timed out to Cloudinary API")):

        with pytest.raises(HTTPException) as exc_info:
            StorageService.save_image(img_bytes, content_type="image/jpeg", subfolder="gallery")

        assert exc_info.value.status_code == 502
        assert "Image upload to cloud storage failed" in exc_info.value.detail
        # Ensure credentials/secrets are not leaked in exception detail
        assert "Connection timed out" not in exc_info.value.detail


def test_validation_rejects_non_image():
    fake_bytes = b"NOT_AN_IMAGE_DATA_12345678"
    with pytest.raises(HTTPException) as exc_info:
        validate_image_file(fake_bytes, "image/jpeg")
    assert exc_info.value.status_code == 400
    assert "Unsupported image format" in exc_info.value.detail


def test_validation_rejects_oversized_file():
    huge_bytes = b"\xFF\xD8\xFF" + b"\x00" * (6 * 1024 * 1024)
    with pytest.raises(HTTPException) as exc_info:
        validate_image_file(huge_bytes, "image/jpeg")
    assert exc_info.value.status_code == 400
    assert "exceeds the maximum permitted size" in exc_info.value.detail


# -----------------------------------------------------------------------------
# 5. Cloudinary Deletion Tests
# -----------------------------------------------------------------------------
def test_delete_cloudinary_file_success():
    cloudinary_url = "https://res.cloudinary.com/z1aoi3i6/image/upload/v1/mahaveer_club/members/member123.jpg"

    with patch.object(Settings, "is_cloudinary_configured", new_callable=PropertyMock, return_value=True), \
         patch("cloudinary.uploader.destroy", return_value={"result": "ok"}) as mock_destroy:

        result = StorageService.delete_file(cloudinary_url)
        assert result is True
        mock_destroy.assert_called_once_with("mahaveer_club/members/member123", invalidate=True)


def test_delete_cloudinary_file_handles_not_found():
    cloudinary_url = "https://res.cloudinary.com/z1aoi3i6/image/upload/v1/mahaveer_club/gallery/photo999.jpg"

    with patch.object(Settings, "is_cloudinary_configured", new_callable=PropertyMock, return_value=True), \
         patch("cloudinary.uploader.destroy", return_value={"result": "not found"}):

        result = StorageService.delete_file(cloudinary_url)
        assert result is True


def test_delete_invalid_url_returns_false():
    assert StorageService.delete_file(None) is False
    assert StorageService.delete_file("") is False
