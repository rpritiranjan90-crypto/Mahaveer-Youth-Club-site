import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from backend.app.core.security import create_access_token
from backend.app.models.update import Update
from backend.app.models.audit_log import AuditLog
from backend.app.models.user import User


def get_auth_headers(user: User) -> dict:
    token = create_access_token(user_id=user.id, email=user.email, is_admin=user.is_admin)
    return {"Authorization": f"Bearer {token}"}


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
