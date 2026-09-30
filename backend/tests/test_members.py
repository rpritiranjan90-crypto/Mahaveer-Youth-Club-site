import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from backend.app.core.security import create_access_token
from backend.app.models.member import Member
from backend.app.models.user import User


def get_auth_headers(user: User) -> dict:
    token = create_access_token(user_id=user.id, email=user.email, is_admin=user.is_admin)
    return {"Authorization": f"Bearer {token}"}


def test_member_crud_privacy_and_reordering(client: TestClient, test_admin_user: User):
    headers = get_auth_headers(test_admin_user)

    # 1. Add members with nicknames
    m1 = client.post(
        "/api/v1/admin/members",
        json={"display_name": "Ranjan B.", "role": "President", "sort_order": 1, "is_visible": True},
        headers=headers,
    )
    assert m1.status_code == 201
    id1 = m1.json()["id"]

    m2 = client.post(
        "/api/v1/admin/members",
        json={"display_name": "Deepak M.", "role": "General Secretary", "sort_order": 2, "is_visible": True},
        headers=headers,
    )
    assert m2.status_code == 201
    id2 = m2.json()["id"]

    m3 = client.post(
        "/api/v1/admin/members",
        json={"display_name": "Sanjay P.", "role": "Youth Member", "sort_order": 3, "is_visible": False},
        headers=headers,
    )
    assert m3.status_code == 201
    id3 = m3.json()["id"]

    # 2. Public API check: only visible members returned, ordered by sort_order
    pub_res = client.get("/api/v1/public/members")
    assert pub_res.status_code == 200
    data = pub_res.json()
    assert data["total"] == 2
    assert len(data["items"]) == 2
    assert data["items"][0]["display_name"] == "Ranjan B."
    assert data["items"][1]["display_name"] == "Deepak M."

    # Privacy check: Verify no sensitive fields in public items
    first_item = data["items"][0]
    assert "email" not in first_item
    assert "phone" not in first_item
    assert "address" not in first_item
    assert "password" not in first_item

    # 3. Batch Reordering
    reorder_res = client.post(
        "/api/v1/admin/members/reorder",
        json={"orders": [{"id": id1, "sort_order": 10}, {"id": id2, "sort_order": 1}]},
        headers=headers,
    )
    assert reorder_res.status_code == 200

    # Public list reflects new ordering
    pub_reordered = client.get("/api/v1/public/members").json()
    assert pub_reordered["items"][0]["display_name"] == "Deepak M."
    assert pub_reordered["items"][1]["display_name"] == "Ranjan B."

    # 4. Hide Deepak M.
    client.patch(f"/api/v1/admin/members/{id2}", json={"is_visible": False}, headers=headers)
    pub_after_hide = client.get("/api/v1/public/members").json()
    assert pub_after_hide["total"] == 1
    assert pub_after_hide["items"][0]["display_name"] == "Ranjan B."


def test_member_authorization(client: TestClient, test_non_admin_user: User):
    # Unauthenticated
    res_unauth = client.post("/api/v1/admin/members", json={"display_name": "Test"})
    assert res_unauth.status_code == 401

    # Non-admin
    headers = get_auth_headers(test_non_admin_user)
    res_forbid = client.post("/api/v1/admin/members", json={"display_name": "Test"}, headers=headers)
    assert res_forbid.status_code == 403
