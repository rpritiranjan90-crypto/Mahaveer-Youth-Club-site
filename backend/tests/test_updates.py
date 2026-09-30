import io
from PIL import Image
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from backend.app.core.security import create_access_token
from backend.app.models.update import Update
from backend.app.models.gallery import GalleryItem
from backend.app.models.audit_log import AuditLog
from backend.app.models.user import User


def get_auth_headers(user: User) -> dict:
    token = create_access_token(user_id=user.id, email=user.email, is_admin=user.is_admin)
    return {"Authorization": f"Bearer {token}"}


def create_dummy_png_bytes(width: int = 100, height: int = 100) -> bytes:
    img = Image.new("RGB", (width, height), color="purple")
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()



def test_admin_create_update_draft_and_publish(client: TestClient, test_admin_user: User, db_session: Session):
    headers = get_auth_headers(test_admin_user)
    payload = {
        "title": "Ganesh Puja 2026 Preparations",
        "category": "Festival Notice",
        "excerpt": "Official meeting on Ganesh Chaturthi pandal construction.",
        "content": "<p>Initial meeting will be held this Sunday.</p><script>alert('xss')</script>",
        "status": "draft",
    }

    # 1. Create Update as draft
    resp = client.post("/api/v1/admin/updates", json=payload, headers=headers)
    assert resp.status_code == 201
    data = resp.json()
    assert data["title"] == "Ganesh Puja 2026 Preparations"
    assert data["slug"] == "ganesh-puja-2026-preparations"
    assert data["status"] == "draft"
    assert data["published_at"] is None
    # Script tag must be stripped by sanitizer
    assert "<script>" not in data["content"]
    assert "alert('xss')" not in data["content"]
    assert "<p>Initial meeting will be held this Sunday.</p>" in data["content"]

    update_id = data["id"]
    slug = data["slug"]

    # 2. Public API must NOT return the draft update
    pub_list = client.get("/api/v1/public/updates")
    assert pub_list.status_code == 200
    assert pub_list.json()["total"] == 0

    pub_single = client.get(f"/api/v1/public/updates/{slug}")
    assert pub_single.status_code == 404

    # 3. Admin preview MUST return draft content
    preview_resp = client.get(f"/api/v1/admin/updates/{update_id}/preview", headers=headers)
    assert preview_resp.status_code == 200
    assert preview_resp.json()["id"] == update_id

    # 4. Publish update
    pub_action = client.post(
        f"/api/v1/admin/updates/{update_id}/status",
        json={"status": "published"},
        headers=headers,
    )
    assert pub_action.status_code == 200
    assert pub_action.json()["status"] == "published"
    assert pub_action.json()["published_at"] is not None

    # 5. Public API now returns the published update
    pub_list_after = client.get("/api/v1/public/updates")
    assert pub_list_after.status_code == 200
    assert pub_list_after.json()["total"] == 1
    assert pub_list_after.json()["items"][0]["slug"] == slug

    pub_single_after = client.get(f"/api/v1/public/updates/{slug}")
    assert pub_single_after.status_code == 200
    assert pub_single_after.json()["title"] == "Ganesh Puja 2026 Preparations"

    # 6. Archive update
    arch_action = client.post(
        f"/api/v1/admin/updates/{update_id}/status",
        json={"status": "archived"},
        headers=headers,
    )
    assert arch_action.status_code == 200
    assert arch_action.json()["status"] == "archived"
    assert arch_action.json()["archived_at"] is not None

    # 7. Public API must NOT return archived update
    pub_list_arch = client.get("/api/v1/public/updates")
    assert pub_list_arch.json()["total"] == 0

    pub_single_arch = client.get(f"/api/v1/public/updates/{slug}")
    assert pub_single_arch.status_code == 404

    # 8. Restore to draft
    restore_action = client.post(
        f"/api/v1/admin/updates/{update_id}/status",
        json={"status": "draft"},
        headers=headers,
    )
    assert restore_action.status_code == 200
    assert restore_action.json()["status"] == "draft"
    assert restore_action.json()["published_at"] is None
    assert restore_action.json()["archived_at"] is None


def test_update_slug_collision_handling(client: TestClient, test_admin_user: User):
    headers = get_auth_headers(test_admin_user)

    # 1. Create first item
    r1 = client.post(
        "/api/v1/admin/updates",
        json={"title": "Annual Meeting Notice", "content": "Meeting details"},
        headers=headers,
    )
    assert r1.status_code == 201
    assert r1.json()["slug"] == "annual-meeting-notice"

    # 2. Create second item with same title
    r2 = client.post(
        "/api/v1/admin/updates",
        json={"title": "Annual Meeting Notice", "content": "Second meeting details"},
        headers=headers,
    )
    assert r2.status_code == 201
    assert r2.json()["slug"] == "annual-meeting-notice-2"


def test_update_authorization_controls(client: TestClient, test_non_admin_user: User):
    # Unauthenticated
    resp_unauth = client.post("/api/v1/admin/updates", json={"title": "Test", "content": "Test"})
    assert resp_unauth.status_code == 401

    # Non-admin
    non_admin_headers = get_auth_headers(test_non_admin_user)
    resp_forbidden = client.post(
        "/api/v1/admin/updates",
        json={"title": "Test", "content": "Test"},
        headers=non_admin_headers,
    )
    assert resp_forbidden.status_code == 403


def test_update_delete_audit_logging(client: TestClient, test_admin_user: User, db_session: Session):
    headers = get_auth_headers(test_admin_user)
    r = client.post(
        "/api/v1/admin/updates",
        json={"title": "Temporary Circular", "content": "Will be deleted"},
        headers=headers,
    )
    update_id = r.json()["id"]

    del_resp = client.delete(f"/api/v1/admin/updates/{update_id}", headers=headers)
    assert del_resp.status_code == 200

    # Audit log check
    audit_entry = (
        db_session.query(AuditLog)
        .filter(AuditLog.action == "UPDATE_DELETED", AuditLog.entity_id == str(update_id))
        .first()
    )
    assert audit_entry is not None
    assert "Temporary Circular" in audit_entry.details


def test_update_featured_image_upload_replace_delete(client: TestClient, test_admin_user: User, db_session: Session):
    headers = get_auth_headers(test_admin_user)

    # 1. Create update
    create_res = client.post(
        "/api/v1/admin/updates",
        json={"title": "Important Youth Meeting", "content": "<p>Youth members please attend.</p>"},
        headers=headers,
    )
    update_id = create_res.json()["id"]

    # 2. Upload featured image
    png_bytes = create_dummy_png_bytes(250, 250)
    files = {"file": ("banner.png", png_bytes, "image/png")}
    upload_res = client.post(f"/api/v1/admin/updates/{update_id}/image", files=files, headers=headers)
    assert upload_res.status_code == 200
    img_url_1 = upload_res.json()["featured_image"]
    assert img_url_1.startswith("/uploads/updates/")

    audit_upload = (
        db_session.query(AuditLog)
        .filter(AuditLog.action == "UPDATE_IMAGE_UPLOADED", AuditLog.entity_id == str(update_id))
        .first()
    )
    assert audit_upload is not None

    # 3. Replace featured image
    png_bytes_2 = create_dummy_png_bytes(350, 350)
    files_2 = {"file": ("banner_v2.png", png_bytes_2, "image/png")}
    replace_res = client.post(f"/api/v1/admin/updates/{update_id}/image", files=files_2, headers=headers)
    assert replace_res.status_code == 200
    img_url_2 = replace_res.json()["featured_image"]
    assert img_url_2 != img_url_1
    assert img_url_2.startswith("/uploads/updates/")

    audit_replace = (
        db_session.query(AuditLog)
        .filter(AuditLog.action == "UPDATE_IMAGE_REPLACED", AuditLog.entity_id == str(update_id))
        .first()
    )
    assert audit_replace is not None

    # 4. Remove featured image
    del_img_res = client.delete(f"/api/v1/admin/updates/{update_id}/image", headers=headers)
    assert del_img_res.status_code == 200
    assert del_img_res.json()["featured_image"] is None

    audit_remove = (
        db_session.query(AuditLog)
        .filter(AuditLog.action == "UPDATE_IMAGE_REMOVED", AuditLog.entity_id == str(update_id))
        .first()
    )
    assert audit_remove is not None


def test_update_featured_image_gallery_reference_preservation(client: TestClient, test_admin_user: User, db_session: Session):
    headers = get_auth_headers(test_admin_user)

    # 1. Create a Gallery item
    gal_bytes = create_dummy_png_bytes()
    gal_upload = client.post(
        "/api/v1/admin/gallery/upload",
        data={"title": "Festival Notice Banner", "year": "2026", "category": "Ganesh Puja", "item_status": "published"},
        files={"file": ("shared_notice.png", gal_bytes, "image/png")},
        headers=headers,
    )
    gal_url = gal_upload.json()["image_url"]

    # 2. Create update referencing the gallery photo URL
    upd_res = client.post(
        "/api/v1/admin/updates",
        json={"title": "Official Puja Circular", "content": "Details here", "featured_image": gal_url},
        headers=headers,
    )
    update_id = upd_res.json()["id"]
    assert upd_res.json()["featured_image"] == gal_url

    # 3. Delete update
    del_upd = client.delete(f"/api/v1/admin/updates/{update_id}", headers=headers)
    assert del_upd.status_code == 200

    # 4. Verify gallery item still exists and its image is intact
    gal_check = client.get(f"/api/v1/admin/gallery/{gal_upload.json()['id']}", headers=headers)
    assert gal_check.status_code == 200
    assert gal_check.json()["image_url"] == gal_url


def test_update_image_validation_rejections(client: TestClient, test_admin_user: User):
    headers = get_auth_headers(test_admin_user)
    upd_res = client.post(
        "/api/v1/admin/updates",
        json={"title": "Security Check Circular", "content": "Content"},
        headers=headers,
    )
    upd_id = upd_res.json()["id"]

    # Fake executable
    fake_bytes = b"MZ\x90\x00NotAnImage"
    files = {"file": ("malicious.png", fake_bytes, "image/png")}
    r_bad = client.post(f"/api/v1/admin/updates/{upd_id}/image", files=files, headers=headers)
    assert r_bad.status_code == 400

    # Oversized file (> 5MB)
    huge_bytes = b"\xFF\xD8\xFF" + (b"\x00" * (5 * 1024 * 1024 + 100))
    files_huge = {"file": ("huge.jpg", huge_bytes, "image/jpeg")}
    r_huge = client.post(f"/api/v1/admin/updates/{upd_id}/image", files=files_huge, headers=headers)
    assert r_huge.status_code == 400

