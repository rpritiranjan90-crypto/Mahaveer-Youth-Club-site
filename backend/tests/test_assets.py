import io
import pytest
from fastapi.testclient import TestClient
from PIL import Image

from backend.app.core.security import create_access_token
from backend.app.models.user import User
from backend.app.models.site_asset import SiteAsset


def get_auth_headers(user: User) -> dict:
    token = create_access_token(user_id=user.id, email=user.email, is_admin=user.is_admin)
    return {"Authorization": f"Bearer {token}"}


def create_test_image_bytes(format_type: str = "PNG", width: int = 120, height: int = 120, color: str = "orange") -> bytes:
    img = Image.new("RGB", (width, height), color=color)
    buf = io.BytesIO()
    img.save(buf, format=format_type)
    return buf.getvalue()


# -----------------------------------------------------------------------------
# 1. Official Logo Lifecycle Tests
# -----------------------------------------------------------------------------
def test_admin_upload_logo_success(client: TestClient, test_admin_user: User):
    headers = get_auth_headers(test_admin_user)
    png_bytes = create_test_image_bytes(format_type="PNG", width=200, height=200)

    files = {"file": ("official_logo.png", png_bytes, "image/png")}
    res = client.post("/api/v1/admin/assets/logo", files=files, headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["asset_type"] == "LOGO"
    assert data["image_url"].startswith("/uploads/assets/")
    assert data["mime_type"] == "image/png"
    assert data["width"] == 200
    assert data["height"] == 200
    assert data["is_active"] is True


def test_unauthorized_user_cannot_upload_logo(client: TestClient, test_non_admin_user: User):
    # No auth
    png_bytes = create_test_image_bytes()
    files = {"file": ("logo.png", png_bytes, "image/png")}
    res = client.post("/api/v1/admin/assets/logo", files=files)
    assert res.status_code == 401

    # Regular non-admin user
    reg_headers = get_auth_headers(test_non_admin_user)
    res2 = client.post("/api/v1/admin/assets/logo", files=files, headers=reg_headers)
    assert res2.status_code == 403


def test_admin_replaces_and_deletes_logo(client: TestClient, test_admin_user: User):
    headers = get_auth_headers(test_admin_user)

    # 1. Initial upload
    png_bytes_1 = create_test_image_bytes(format_type="PNG", width=150, height=150, color="orange")
    res1 = client.post("/api/v1/admin/assets/logo", files={"file": ("logo_v1.png", png_bytes_1, "image/png")}, headers=headers)
    assert res1.status_code == 200
    path_1 = res1.json()["image_url"]

    # 2. Public can retrieve active logo
    pub_res1 = client.get("/api/v1/public/assets/logo")
    assert pub_res1.status_code == 200
    assert pub_res1.json()["image_url"] == path_1

    # 3. Replace logo
    webp_bytes_2 = create_test_image_bytes(format_type="WEBP", width=300, height=300, color="blue")
    res2 = client.post("/api/v1/admin/assets/logo", files={"file": ("logo_v2.webp", webp_bytes_2, "image/webp")}, headers=headers)
    assert res2.status_code == 200
    path_2 = res2.json()["image_url"]
    assert path_2 != path_1
    assert res2.json()["width"] == 300
    assert res2.json()["mime_type"] == "image/webp"

    # Public now gets replaced logo
    pub_res2 = client.get("/api/v1/public/assets/logo")
    assert pub_res2.status_code == 200
    assert pub_res2.json()["image_url"] == path_2

    # 4. Delete logo
    del_res = client.delete("/api/v1/admin/assets/logo", headers=headers)
    assert del_res.status_code == 200

    # Public now gets 404 (clean fallback)
    pub_res3 = client.get("/api/v1/public/assets/logo")
    assert pub_res3.status_code == 404


# -----------------------------------------------------------------------------
# 2. Current-Year Ganesh Image Lifecycle Tests
# -----------------------------------------------------------------------------
def test_admin_upload_current_ganesh_success(client: TestClient, test_admin_user: User):
    headers = get_auth_headers(test_admin_user)
    jpg_bytes = create_test_image_bytes(format_type="JPEG", width=800, height=600, color="gold")

    files = {"file": ("ganesh_2026.jpg", jpg_bytes, "image/jpeg")}
    data = {"year": 2026}
    res = client.post("/api/v1/admin/assets/ganesh/current", files=files, data=data, headers=headers)
    assert res.status_code == 200
    item = res.json()
    assert item["asset_type"] == "GANESH_CURRENT"
    assert item["year"] == 2026
    assert item["mime_type"] == "image/jpeg"
    assert item["width"] == 800
    assert item["height"] == 600
    assert item["is_active"] is True


def test_unauthorized_user_cannot_upload_ganesh(client: TestClient, test_non_admin_user: User):
    jpg_bytes = create_test_image_bytes(format_type="JPEG")
    files = {"file": ("ganesh.jpg", jpg_bytes, "image/jpeg")}
    data = {"year": 2026}

    # No auth
    res = client.post("/api/v1/admin/assets/ganesh/current", files=files, data=data)
    assert res.status_code == 401

    # Regular non-admin user
    reg_headers = get_auth_headers(test_non_admin_user)
    res2 = client.post("/api/v1/admin/assets/ganesh/current", files=files, data=data, headers=reg_headers)
    assert res2.status_code == 403


def test_admin_replaces_and_deletes_current_ganesh(client: TestClient, test_admin_user: User):
    headers = get_auth_headers(test_admin_user)

    # 1. Initial upload
    png_bytes_1 = create_test_image_bytes(format_type="PNG", width=400, height=400)
    res1 = client.post(
        "/api/v1/admin/assets/ganesh/current",
        files={"file": ("ganesh_v1.png", png_bytes_1, "image/png")},
        data={"year": 2026},
        headers=headers,
    )
    assert res1.status_code == 200
    path_1 = res1.json()["image_url"]

    # Public check
    pub_res1 = client.get("/api/v1/public/assets/ganesh/current")
    assert pub_res1.status_code == 200
    assert pub_res1.json()["image_url"] == path_1
    assert pub_res1.json()["year"] == 2026

    # 2. Replace with new year or new photo
    webp_bytes_2 = create_test_image_bytes(format_type="WEBP", width=1200, height=800)
    res2 = client.post(
        "/api/v1/admin/assets/ganesh/current",
        files={"file": ("ganesh_v2.webp", webp_bytes_2, "image/webp")},
        data={"year": 2027},
        headers=headers,
    )
    assert res2.status_code == 200
    path_2 = res2.json()["image_url"]
    assert path_2 != path_1
    assert res2.json()["year"] == 2027

    # Public check for updated asset
    pub_res2 = client.get("/api/v1/public/assets/ganesh/current")
    assert pub_res2.status_code == 200
    assert pub_res2.json()["image_url"] == path_2
    assert pub_res2.json()["year"] == 2027

    # 3. Delete
    del_res = client.delete("/api/v1/admin/assets/ganesh/current", headers=headers)
    assert del_res.status_code == 200

    # Public returns 404 cleanly
    pub_res3 = client.get("/api/v1/public/assets/ganesh/current")
    assert pub_res3.status_code == 404


# -----------------------------------------------------------------------------
# 3. Security & Validation Vector Rejection Tests
# -----------------------------------------------------------------------------
def test_svg_and_script_rejection(client: TestClient, test_admin_user: User):
    headers = get_auth_headers(test_admin_user)
    svg_payload = b"<svg xmlns='http://www.w3.org/2000/svg'><script>alert(1)</script></svg>"

    files = {"file": ("malicious.svg", svg_payload, "image/svg+xml")}
    res = client.post("/api/v1/admin/assets/logo", files=files, headers=headers)
    assert res.status_code == 400
    assert "Unsupported image format" in res.json()["error"]["message"]


def test_invalid_magic_bytes_rejection(client: TestClient, test_admin_user: User):
    headers = get_auth_headers(test_admin_user)
    fake_png = b"FAKE_PNG_CONTENT_NOT_REAL_HEADER"

    files = {"file": ("fake.png", fake_png, "image/png")}
    res = client.post("/api/v1/admin/assets/logo", files=files, headers=headers)
    assert res.status_code == 400


def test_oversized_file_rejection(client: TestClient, test_admin_user: User):
    headers = get_auth_headers(test_admin_user)
    # 6MB dummy content (limit is 5MB)
    huge_bytes = b"\xFF\xD8\xFF" + (b"0" * (6 * 1024 * 1024))

    files = {"file": ("huge.jpg", huge_bytes, "image/jpeg")}
    res = client.post("/api/v1/admin/assets/logo", files=files, headers=headers)
    assert res.status_code == 400
    assert "maximum permitted size" in res.json()["error"]["message"]


def test_invalid_festival_year_rejection(client: TestClient, test_admin_user: User):
    headers = get_auth_headers(test_admin_user)
    png_bytes = create_test_image_bytes()
    files = {"file": ("ganesh.png", png_bytes, "image/png")}

    # Year too early (before 2012)
    res1 = client.post("/api/v1/admin/assets/ganesh/current", files=files, data={"year": 1999}, headers=headers)
    assert res1.status_code == 400
    assert "Invalid festival year" in res1.json()["error"]["message"]

    # Year too far in the future
    res2 = client.post("/api/v1/admin/assets/ganesh/current", files=files, data={"year": 3000}, headers=headers)
    assert res2.status_code == 400
