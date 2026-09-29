import io
import pytest
from fastapi import HTTPException
from backend.app.services.storage import StorageService


def test_storage_valid_image_upload(client, admin_headers):
    """
    Verify valid JPEG image upload succeeds.
    """
    fake_image = io.BytesIO(b"\xff\xd8\xff\xe0\x00\x10JFIF" + b"0" * 50)
    files = {"file": ("test_image.jpg", fake_image, "image/jpeg")}

    response = client.post("/api/v1/admin/upload", headers=admin_headers, files=files)
    assert response.status_code == 200
    data = response.json()
    assert "filename" in data
    assert data["url"].startswith("/uploads/")
    assert data["content_type"] == "image/jpeg"


def test_storage_rejected_executable_extension(client, admin_headers):
    """
    Verify upload of executable files (.exe, .sh, .py, .php) is blocked with 400.
    """
    fake_exe = io.BytesIO(b"MZ\x90\x00\x03\x00\x00\x00")
    files = {"file": ("malicious_payload.exe", fake_exe, "application/octet-stream")}

    response = client.post("/api/v1/admin/upload", headers=admin_headers, files=files)
    assert response.status_code == 400


def test_storage_rejected_mime_type(client, admin_headers):
    """
    Verify mismatched or unsupported MIME type is blocked.
    """
    fake_script = io.BytesIO(b"<script>alert(1)</script>")
    files = {"file": ("script.js", fake_script, "text/javascript")}

    response = client.post("/api/v1/admin/upload", headers=admin_headers, files=files)
    assert response.status_code == 400


def test_storage_path_traversal_protection():
    """
    Verify path traversal attempts in filenames are rejected.
    """
    storage = StorageService(base_dir="uploads")
    is_valid, msg = storage.validate_file(
        filename="../../../etc/passwd",
        content_type="image/jpeg",
        file_size=100,
    )
    assert is_valid is False
    assert "path traversal" in msg.lower()


def test_storage_size_limit_validation():
    """
    Verify files exceeding MAX_UPLOAD_SIZE_BYTES are rejected.
    """
    storage = StorageService(base_dir="uploads")
    oversized = 10 * 1024 * 1024  # 10 MB
    is_valid, msg = storage.validate_file(
        filename="huge_photo.jpg",
        content_type="image/jpeg",
        file_size=oversized,
    )
    assert is_valid is False
    assert "exceeds maximum" in msg.lower()
