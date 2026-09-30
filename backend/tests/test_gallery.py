import io
import pytest
from fastapi.testclient import TestClient
from PIL import Image

from backend.app.core.security import create_access_token
from backend.app.models.gallery import GalleryItem
from backend.app.models.user import User


def get_auth_headers(user: User) -> dict:
    token = create_access_token(user_id=user.id, email=user.email, is_admin=user.is_admin)
    return {"Authorization": f"Bearer {token}"}


def create_dummy_png_bytes(width: int = 100, height: int = 100) -> bytes:
    img = Image.new("RGB", (width, height), color="orange")
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()


def test_gallery_upload_valid_image_and_publish(client: TestClient, test_admin_user: User):
    headers = get_auth_headers(test_admin_user)
    png_bytes = create_dummy_png_bytes()

    files = {"file": ("test_festival.png", png_bytes, "image/png")}
    data = {
        "title": "Ganesh Murti Sthapana 2026",
        "year": "2026",
        "category": "Ganesh Puja",
        "alt_text": "Devotional idol installation ceremony at Banza pandal",
        "item_status": "draft",
    }

    # 1. Upload
    res = client.post("/api/v1/admin/gallery/upload", data=data, files=files, headers=headers)
    assert res.status_code == 201
    item = res.json()
    assert item["title"] == "Ganesh Murti Sthapana 2026"
    assert item["year"] == "2026"
    assert item["status"] == "draft"
    assert item["image_url"].startswith("/uploads/gallery/")
    assert item["thumbnail_url"].startswith("/uploads/gallery/")
    gallery_id = item["id"]

    # 2. Public API should not return draft
    pub_res = client.get("/api/v1/public/gallery")
    assert pub_res.status_code == 200
    assert pub_res.json()["total"] == 0

    # 3. Publish
    pub_action = client.post(
        f"/api/v1/admin/gallery/{gallery_id}/status",
        json={"status": "published"},
        headers=headers,
    )
    assert pub_action.status_code == 200
    assert pub_action.json()["status"] == "published"

    # 4. Public API returns published item
    pub_res_after = client.get("/api/v1/public/gallery?year=2026")
    assert pub_res_after.json()["total"] == 1
    assert pub_res_after.json()["items"][0]["title"] == "Ganesh Murti Sthapana 2026"

    # 5. Dynamic Years & Categories check
    years_res = client.get("/api/v1/public/gallery/years")
    assert years_res.status_code == 200
    assert "2026" in years_res.json()["years"]

    cat_res = client.get("/api/v1/public/gallery/categories")
    assert cat_res.status_code == 200
    assert "Ganesh Puja" in cat_res.json()["categories"]

    # 6. Delete
    del_res = client.delete(f"/api/v1/admin/gallery/{gallery_id}", headers=headers)
    assert del_res.status_code == 200
    assert client.get("/api/v1/public/gallery").json()["total"] == 0


def test_gallery_upload_reject_invalid_file(client: TestClient, test_admin_user: User):
    headers = get_auth_headers(test_admin_user)

    # 1. Fake executable / text masquerading as PNG
    fake_bytes = b"MZ\x90\x00\x03\x00\x00\x00NotARealImage"
    files = {"file": ("malicious.png", fake_bytes, "image/png")}
    data = {
        "title": "Malicious Upload",
        "year": "2026",
        "category": "Other",
        "alt_text": "Bad",
        "item_status": "draft",
    }

    res = client.post("/api/v1/admin/gallery/upload", data=data, files=files, headers=headers)
    assert res.status_code == 400
    assert "Unsupported image format" in res.json()["error"]["message"] or "valid" in res.json()["error"]["message"]


def test_gallery_authorization(client: TestClient, test_non_admin_user: User):
    png_bytes = create_dummy_png_bytes()
    files = {"file": ("test.png", png_bytes, "image/png")}
    data = {"title": "Test", "year": "2026"}

    # Unauthenticated
    r_unauth = client.post("/api/v1/admin/gallery/upload", data=data, files=files)
    assert r_unauth.status_code == 401

    # Forbidden for non-admin
    headers = get_auth_headers(test_non_admin_user)
    r_forbid = client.post("/api/v1/admin/gallery/upload", data=data, files=files, headers=headers)
    assert r_forbid.status_code == 403
