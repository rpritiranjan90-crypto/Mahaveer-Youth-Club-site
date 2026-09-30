import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from backend.app.core.security import create_access_token
from backend.app.models.activity import Activity
from backend.app.models.audit_log import AuditLog
from backend.app.models.user import User


def get_auth_headers(user: User) -> dict:
    token = create_access_token(user_id=user.id, email=user.email, is_admin=user.is_admin)
    return {"Authorization": f"Bearer {token}"}


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
