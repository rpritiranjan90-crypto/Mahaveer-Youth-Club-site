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


# =============================================================================
# Comprehensive Phase 7 Security Regression Suite
# =============================================================================

def test_unauthenticated_admin_access_rejected(client: TestClient):
    """Verifies that all administrative endpoints reject unauthenticated requests with 401."""
    endpoints = [
        ("GET", "/api/v1/admin/members"),
        ("POST", "/api/v1/admin/members"),
        ("GET", "/api/v1/admin/gallery"),
        ("POST", "/api/v1/admin/gallery"),
        ("GET", "/api/v1/admin/activities"),
        ("POST", "/api/v1/admin/activities"),
        ("GET", "/api/v1/admin/updates"),
        ("POST", "/api/v1/admin/updates"),
        ("GET", "/api/v1/admin/assets/logo"),
        ("GET", "/api/v1/admin/assets/ganesh/current"),
        ("GET", "/api/v1/admin/audit-logs"),
    ]
    for method, path in endpoints:
        if method == "GET":
            res = client.get(path)
        else:
            res = client.post(path, json={})
        assert res.status_code == 401, f"Expected 401 for unauthenticated {method} {path}, got {res.status_code}"
        assert res.json()["error"]["code"] == "UNAUTHORIZED"


def test_non_admin_access_rejected(client: TestClient, test_non_admin_user: User):
    """Verifies that non-admin authenticated users are forbidden (403) from admin operations."""
    headers = get_auth_headers(test_non_admin_user)
    
    res_members = client.get("/api/v1/admin/members", headers=headers)
    assert res_members.status_code == 403
    assert res_members.json()["error"]["code"] == "FORBIDDEN"

    res_audit = client.get("/api/v1/admin/audit-logs", headers=headers)
    assert res_audit.status_code == 403

    res_post = client.post("/api/v1/admin/activities", json={"title": "Unauthorized"}, headers=headers)
    assert res_post.status_code == 403


def test_invalid_and_expired_jwt_tokens(client: TestClient, test_admin_user: User):
    """Verifies proper rejection of tampered, expired, and mis-scoped JWT tokens."""
    # 1. Tampered signature
    valid_token = create_access_token(test_admin_user.id, test_admin_user.email, is_admin=True)
    tampered_token = valid_token[:-4] + "xxxx"
    res_tampered = client.get("/api/v1/admin/members", headers={"Authorization": f"Bearer {tampered_token}"})
    assert res_tampered.status_code == 401

    # 2. Expired token
    from datetime import datetime, timedelta, timezone
    import jwt
    from backend.app.core.config import settings
    from backend.app.core.security import ALGORITHM

    now = datetime.now(timezone.utc)
    expired_payload = {
        "sub": str(test_admin_user.id),
        "email": test_admin_user.email,
        "is_admin": True,
        "type": "access",
        "iat": int((now - timedelta(hours=2)).timestamp()),
        "exp": int((now - timedelta(hours=1)).timestamp()),
    }
    expired_token = jwt.encode(expired_payload, settings.SECRET_KEY, algorithm=ALGORITHM)
    res_expired = client.get("/api/v1/admin/members", headers={"Authorization": f"Bearer {expired_token}"})
    assert res_expired.status_code == 401
    assert "expired" in res_expired.json()["error"]["message"].lower()

    # 3. 2FA Pending token used on standard admin route (scope violation)
    from backend.app.core.security import create_2fa_challenge_token
    challenge_token = create_2fa_challenge_token(test_admin_user.id, test_admin_user.email)
    res_challenge = client.get("/api/v1/admin/members", headers={"Authorization": f"Bearer {challenge_token}"})
    assert res_challenge.status_code == 401


def test_revoked_session_rejected(client: TestClient, test_admin_user: User):
    """Verifies that revoked refresh tokens are rejected during token refresh."""
    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@banza.org", "password": "SecureAdminPassword123!"},
    )
    assert login_res.status_code == 200
    access_token = login_res.json()["access_token"]
    refresh_token = login_res.json()["refresh_token"]

    # Logout to revoke refresh token
    logout_res = client.post(
        "/api/v1/auth/logout",
        headers={"Authorization": f"Bearer {access_token}"},
    )
    assert logout_res.status_code == 200

    # Attempt to refresh using revoked token
    refresh_res = client.post(
        "/api/v1/auth/refresh",
        headers={"Authorization": f"Bearer {refresh_token}"},
    )
    assert refresh_res.status_code == 401


def test_oversized_upload_memory_protection(client: TestClient, test_admin_user: User):
    """Verifies that uploads exceeding MAX_UPLOAD_SIZE_BYTES are rejected with 400 without crashing."""
    headers = get_auth_headers(test_admin_user)
    # 6 MB dummy payload (> 5 MB limit)
    oversized_bytes = b"0" * (6 * 1024 * 1024)
    files = {"file": ("huge.png", oversized_bytes, "image/png")}

    res = client.post(
        "/api/v1/admin/gallery/upload",
        data={"title": "Huge", "year": "2026"},
        files=files,
        headers=headers,
    )
    assert res.status_code == 400
    assert "exceeds the maximum permitted size" in res.json()["error"]["message"]


def test_invalid_mime_and_corrupted_image(client: TestClient, test_admin_user: User):
    """Verifies that non-image binary files and corrupted data are rejected with 400."""
    headers = get_auth_headers(test_admin_user)

    # 1. Plain text masquerading as PNG
    files_fake = {"file": ("malicious.png", b"Hello not a png image", "image/png")}
    res_fake = client.post(
        "/api/v1/admin/gallery/upload",
        data={"title": "Fake Image", "year": "2026"},
        files=files_fake,
        headers=headers,
    )
    assert res_fake.status_code == 400

    # 2. Corrupted PNG header
    corrupted_bytes = b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR" + b"\x00" * 20
    files_corrupt = {"file": ("corrupt.png", corrupted_bytes, "image/png")}
    res_corrupt = client.post(
        "/api/v1/admin/gallery/upload",
        data={"title": "Corrupt Image", "year": "2026"},
        files=files_corrupt,
        headers=headers,
    )
    assert res_corrupt.status_code == 400


def test_malformed_request_body_standardized_error(client: TestClient, test_admin_user: User):
    """Verifies that schema validation errors return standardized 422 error format."""
    headers = get_auth_headers(test_admin_user)
    # Missing required name/display_name
    res = client.post("/api/v1/admin/members", json={}, headers=headers)
    assert res.status_code == 422
    data = res.json()
    assert "error" in data
    assert data["error"]["code"] == "VALIDATION_ERROR"
    assert "message" in data["error"]


def test_cors_and_security_headers(client: TestClient):
    """Verifies that standard security headers (CSP, X-Frame-Options, etc.) are present."""
    res = client.get("/api/v1/health")
    assert res.status_code == 200
    headers = res.headers

    assert headers.get("X-Content-Type-Options") == "nosniff"
    assert headers.get("X-Frame-Options") == "DENY"
    assert headers.get("Referrer-Policy") == "strict-origin-when-cross-origin"
    assert "Content-Security-Policy" in headers
    assert "frame-ancestors 'none'" in headers["Content-Security-Policy"]


def test_no_sensitive_secrets_leaked(client: TestClient, test_admin_user: User):
    """Verifies that sensitive password hashes and 2FA secrets are never exposed in JSON responses."""
    headers = get_auth_headers(test_admin_user)
    res_me = client.get("/api/v1/auth/me", headers=headers)
    assert res_me.status_code == 200
    data = res_me.json()

    assert "password" not in data
    assert "password_hash" not in data
    assert "totp_secret" not in data
    assert "totp_temp_secret" not in data


def test_cloudinary_failure_handled_safely_502(client: TestClient, test_admin_user: User):
    """Verifies that Cloudinary exceptions return 502 without leaking internal paths or stack traces."""
    from unittest.mock import patch
    from backend.app.core.config import settings

    png_bytes = create_valid_image("PNG")
    headers = get_auth_headers(test_admin_user)
    files = {"file": ("photo.png", png_bytes, "image/png")}

    with patch.object(settings, "CLOUDINARY_CLOUD_NAME", "mock_cloud"), \
         patch.object(settings, "CLOUDINARY_API_KEY", "mock_key"), \
         patch.object(settings, "CLOUDINARY_API_SECRET", "mock_secret"), \
         patch("cloudinary.uploader.upload", side_effect=Exception("Cloudinary timeout")):

        res = client.post(
            "/api/v1/admin/gallery/upload",
            data={"title": "Photo", "year": "2026"},
            files=files,
            headers=headers,
        )
        assert res.status_code == 502
        data = res.json()
        assert data["error"]["code"] == "HTTP_502"
        assert "cloud storage failed" in data["error"]["message"]


def test_idor_protection_on_member_and_content_mutations(client: TestClient, test_non_admin_user: User):
    """Verifies that non-admin authenticated users cannot delete or patch arbitrary database IDs."""
    headers = get_auth_headers(test_non_admin_user)

    # Attempt to delete member #1
    res_del_member = client.delete("/api/v1/admin/members/1", headers=headers)
    assert res_del_member.status_code == 403

    # Attempt to patch activity #1
    res_patch_act = client.patch("/api/v1/admin/activities/1", json={"title": "Hacked"}, headers=headers)
    assert res_patch_act.status_code == 403

    # Attempt to delete gallery #1
    res_del_gal = client.delete("/api/v1/admin/gallery/1", headers=headers)
    assert res_del_gal.status_code == 403

