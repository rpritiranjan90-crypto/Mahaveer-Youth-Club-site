import io
import pytest
from fastapi.testclient import TestClient
from PIL import Image
from sqlalchemy.orm import Session

from backend.app.core.security import create_access_token
from backend.app.models.activity import Activity
from backend.app.models.gallery import GalleryItem
from backend.app.models.audit_log import AuditLog
from backend.app.models.user import User


def get_auth_headers(user: User) -> dict:
    token = create_access_token(user_id=user.id, email=user.email, is_admin=user.is_admin)
    return {"Authorization": f"Bearer {token}"}


def create_dummy_png_bytes(width: int = 100, height: int = 100) -> bytes:
    img = Image.new("RGB", (width, height), color="green")
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()


def test_activity_lifecycle_and_public_visibility(client: TestClient, test_admin_user: User):
    headers = get_auth_headers(test_admin_user)

    # 1. Create draft activity
    payload = {
        "title": "Blood Donation Camp 2026",
        "description": "Annual voluntary blood donation drive organized in coordination with local hospital.",
        "date": "2026-10-10",
        "category": "Community Seva",
        "status": "draft",
    }
    r_create = client.post("/api/v1/admin/activities", json=payload, headers=headers)
    assert r_create.status_code == 201
    data = r_create.json()
    activity_id = data["id"]
    slug = data["slug"]
    assert slug == "blood-donation-camp-2026"
    assert data["status"] == "draft"

    # 2. Public API should not return draft
    pub_res = client.get("/api/v1/public/activities")
    assert pub_res.status_code == 200
    assert pub_res.json()["total"] == 0

    pub_single = client.get(f"/api/v1/public/activities/{slug}")
    assert pub_single.status_code == 404

    # 3. Publish activity
    r_pub = client.post(
        f"/api/v1/admin/activities/{activity_id}/status",
        json={"status": "published"},
        headers=headers,
    )
    assert r_pub.status_code == 200
    assert r_pub.json()["status"] == "published"

    # 4. Public API returns published activity with category filter
    pub_res_after = client.get("/api/v1/public/activities?category=Community+Seva")
    assert pub_res_after.status_code == 200
    assert pub_res_after.json()["total"] == 1
    assert pub_res_after.json()["items"][0]["title"] == "Blood Donation Camp 2026"

    # Filter with different category should return 0
    pub_res_other = client.get("/api/v1/public/activities?category=Sports+%26+Culture")
    assert pub_res_other.json()["total"] == 0

    # 5. Archive activity
    r_arch = client.post(
        f"/api/v1/admin/activities/{activity_id}/status",
        json={"status": "archived"},
        headers=headers,
    )
    assert r_arch.status_code == 200
    assert r_arch.json()["status"] == "archived"

    # Public cannot see archived
    assert client.get("/api/v1/public/activities").json()["total"] == 0
    assert client.get(f"/api/v1/public/activities/{slug}").status_code == 404


def test_activity_image_upload_replace_delete(client: TestClient, test_admin_user: User, db_session: Session):
    headers = get_auth_headers(test_admin_user)

    # 1. Create activity
    create_res = client.post(
        "/api/v1/admin/activities",
        json={"title": "Tree Plantation Drive", "description": "Green village initiative", "date": "2026-07-15"},
        headers=headers,
    )
    activity_id = create_res.json()["id"]

    # 2. Upload direct image
    png_bytes = create_dummy_png_bytes(200, 200)
    files = {"file": ("tree.png", png_bytes, "image/png")}
    upload_res = client.post(f"/api/v1/admin/activities/{activity_id}/image", files=files, headers=headers)
    assert upload_res.status_code == 200
    img_url_1 = upload_res.json()["image"]
    assert img_url_1.startswith("/uploads/activities/")

    # Audit log check
    audit_upload = (
        db_session.query(AuditLog)
        .filter(AuditLog.action == "ACTIVITY_IMAGE_UPLOADED", AuditLog.entity_id == str(activity_id))
        .first()
    )
    assert audit_upload is not None

    # 3. Replace image
    png_bytes_2 = create_dummy_png_bytes(300, 300)
    files_2 = {"file": ("tree_v2.png", png_bytes_2, "image/png")}
    replace_res = client.post(f"/api/v1/admin/activities/{activity_id}/image", files=files_2, headers=headers)
    assert replace_res.status_code == 200
    img_url_2 = replace_res.json()["image"]
    assert img_url_2 != img_url_1
    assert img_url_2.startswith("/uploads/activities/")

    audit_replace = (
        db_session.query(AuditLog)
        .filter(AuditLog.action == "ACTIVITY_IMAGE_REPLACED", AuditLog.entity_id == str(activity_id))
        .first()
    )
    assert audit_replace is not None

    # 4. Remove image
    del_img_res = client.delete(f"/api/v1/admin/activities/{activity_id}/image", headers=headers)
    assert del_img_res.status_code == 200
    assert del_img_res.json()["image"] is None

    audit_remove = (
        db_session.query(AuditLog)
        .filter(AuditLog.action == "ACTIVITY_IMAGE_REMOVED", AuditLog.entity_id == str(activity_id))
        .first()
    )
    assert audit_remove is not None


def test_activity_image_gallery_reference_preservation(client: TestClient, test_admin_user: User, db_session: Session):
    headers = get_auth_headers(test_admin_user)

    # 1. Create a Gallery item
    gal_bytes = create_dummy_png_bytes()
    gal_upload = client.post(
        "/api/v1/admin/gallery/upload",
        data={"title": "Shared Puja Photo", "year": "2026", "category": "Ganesh Puja", "item_status": "published"},
        files={"file": ("shared.png", gal_bytes, "image/png")},
        headers=headers,
    )
    gal_url = gal_upload.json()["image_url"]

    # 2. Create activity referencing the gallery photo URL
    act_res = client.post(
        "/api/v1/admin/activities",
        json={"title": "Ganesh Puja Ritual Schedule", "description": "Ritual times", "date": "2026-09-01", "image": gal_url},
        headers=headers,
    )
    activity_id = act_res.json()["id"]
    assert act_res.json()["image"] == gal_url

    # 3. Delete activity
    del_act = client.delete(f"/api/v1/admin/activities/{activity_id}", headers=headers)
    assert del_act.status_code == 200

    # 4. Verify gallery item still exists and its image is intact
    gal_check = client.get(f"/api/v1/admin/gallery/{gal_upload.json()['id']}", headers=headers)
    assert gal_check.status_code == 200
    assert gal_check.json()["image_url"] == gal_url


def test_activity_image_validation_rejections(client: TestClient, test_admin_user: User):
    headers = get_auth_headers(test_admin_user)
    act_res = client.post(
        "/api/v1/admin/activities",
        json={"title": "Security Check Activity", "description": "Security test", "date": "2026-05-01"},
        headers=headers,
    )
    act_id = act_res.json()["id"]

    # Fake executable
    fake_bytes = b"MZ\x90\x00NotAnImage"
    files = {"file": ("malicious.png", fake_bytes, "image/png")}
    r_bad = client.post(f"/api/v1/admin/activities/{act_id}/image", files=files, headers=headers)
    assert r_bad.status_code == 400

    # Oversized file (> 5MB)
    huge_bytes = b"\xFF\xD8\xFF" + (b"\x00" * (5 * 1024 * 1024 + 100))
    files_huge = {"file": ("huge.jpg", huge_bytes, "image/jpeg")}
    r_huge = client.post(f"/api/v1/admin/activities/{act_id}/image", files=files_huge, headers=headers)
    assert r_huge.status_code == 400


def test_activity_authorization_controls(client: TestClient, test_non_admin_user: User):
    # Unauthenticated rejected
    res_unauth = client.post("/api/v1/admin/activities", json={"title": "Test", "description": "Test", "date": "2026-01-01"})
    assert res_unauth.status_code == 401

    # Non-admin forbidden
    headers = get_auth_headers(test_non_admin_user)
    res_forbid = client.post(
        "/api/v1/admin/activities",
        json={"title": "Test", "description": "Test", "date": "2026-01-01"},
        headers=headers,
    )
    assert res_forbid.status_code == 403

