import io
import pytest
from fastapi.testclient import TestClient
from PIL import Image

from backend.app.core.security import create_access_token
from backend.app.models.user import User
from backend.app.services.sanitizer import sanitize_html
from backend.app.services.storage import StorageService, validate_image_file


def get_auth_headers(user: User) -> dict:
    token = create_access_token(user_id=user.id, email=user.email, is_admin=user.is_admin)
    return {"Authorization": f"Bearer {token}"}


def create_valid_image(fmt: str = "PNG") -> bytes:
    img = Image.new("RGB", (50, 50), color="blue")
    buf = io.BytesIO()
    img.save(buf, format=fmt)
    return buf.getvalue()


def test_html_sanitizer_security_vectors():
    # 1. Direct script tags
    dirty_1 = "<p>Welcome</p><script>alert('pwned')</script>"
    clean_1 = sanitize_html(dirty_1)
    assert "<script>" not in clean_1
    assert "alert" not in clean_1
    assert "<p>Welcome</p>" in clean_1

    # 2. Event handlers
    dirty_2 = '<p onmouseover="alert(1)" onclick="steal()">Click me</p>'
    clean_2 = sanitize_html(dirty_2)
    assert "onmouseover" not in clean_2
    assert "onclick" not in clean_2
    assert "<p>Click me</p>" in clean_2

    # 3. javascript: pseudoprotocol in links
    dirty_3 = '<a href="javascript:stealCookie()">Click here</a>'
    clean_3 = sanitize_html(dirty_3)
    assert "javascript:" not in clean_3
    assert "stealCookie" not in clean_3

    # 4. Iframes and dangerous tags
    dirty_4 = '<iframe src="https://evil.com"></iframe><object data="bad"></object>'
    clean_4 = sanitize_html(dirty_4)
    assert "iframe" not in clean_4
    assert "object" not in clean_4

    # 5. Safe links get rel="noopener noreferrer"
    dirty_5 = '<a href="https://google.com">Safe Link</a>'
    clean_5 = sanitize_html(dirty_5)
    assert 'rel="noopener noreferrer"' in clean_5
    assert 'href="https://google.com"' in clean_5


def test_file_upload_security_checks(client: TestClient, test_admin_user: User):
    headers = get_auth_headers(test_admin_user)

    # 1. SVG file rejection
    svg_bytes = b'<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>'
    files = {"file": ("malicious.svg", svg_bytes, "image/svg+xml")}
    res_svg = client.post(
        "/api/v1/admin/gallery/upload",
        data={"title": "SVG test", "year": "2026"},
        files=files,
        headers=headers,
    )
    assert res_svg.status_code == 400

    # 2. Path traversal attack in filename
    png_bytes = create_valid_image("PNG")
    files = {"file": ("../../etc/passwd.png", png_bytes, "image/png")}
    res_traversal = client.post(
        "/api/v1/admin/gallery/upload",
        data={"title": "Traversal Test", "year": "2026"},
        files=files,
        headers=headers,
    )
    assert res_traversal.status_code == 201
    data = res_traversal.json()
    # Stored image URL must NOT contain ../
    assert ".." not in data["image_url"]
    assert data["image_url"].startswith("/uploads/gallery/")

    # 3. Storage deletion path traversal protection
    assert StorageService.delete_file("/uploads/../../secret.txt") is False
    assert StorageService.delete_file("/etc/passwd") is False


def test_draft_and_archived_total_public_isolation(client: TestClient, test_admin_user: User):
    headers = get_auth_headers(test_admin_user)

    # Create 1 draft update, 1 published update, 1 archived update
    client.post(
        "/api/v1/admin/updates",
        json={"title": "Draft Notice", "content": "Secret internal draft", "status": "draft"},
        headers=headers,
    )
    client.post(
        "/api/v1/admin/updates",
        json={"title": "Published Notice", "content": "Public bulletin", "status": "published"},
        headers=headers,
    )
    client.post(
        "/api/v1/admin/updates",
        json={"title": "Archived Notice", "content": "Past archived notice", "status": "archived"},
        headers=headers,
    )

    # Public list must contain ONLY the 1 published update
    pub_res = client.get("/api/v1/public/updates")
    assert pub_res.status_code == 200
    items = pub_res.json()["items"]
    assert len(items) == 1
    assert items[0]["title"] == "Published Notice"

    # Direct slug access for draft or archived returns 404
    assert client.get("/api/v1/public/updates/draft-notice").status_code == 404
    assert client.get("/api/v1/public/updates/archived-notice").status_code == 404
    assert client.get("/api/v1/public/updates/published-notice").status_code == 200
