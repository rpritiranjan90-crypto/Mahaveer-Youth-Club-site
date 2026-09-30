import io
import os
import pytest
from PIL import Image
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from backend.app.core.security import create_access_token
from backend.app.models.member import Member
from backend.app.models.user import User
from backend.app.models.audit_log import AuditLog
from backend.app.services.storage import get_upload_dir


def get_auth_headers(user: User) -> dict:
    token = create_access_token(user_id=user.id, email=user.email, is_admin=user.is_admin)
    return {"Authorization": f"Bearer {token}"}


def create_test_image(format="JPEG", size=(200, 200), color="blue") -> io.BytesIO:
    buf = io.BytesIO()
    img = Image.new("RGB", size, color=color)
    img.save(buf, format=format)
    buf.seek(0)
    return buf


def test_admin_create_member_lifecycle(client: TestClient, test_admin_user: User, db_session: Session):
    headers = get_auth_headers(test_admin_user)

    # 1. Create with minimal fields
    res1 = client.post(
        "/api/v1/admin/members",
        json={"name": "Subhashree Dash", "designation": "President"},
        headers=headers,
    )
    assert res1.status_code == 201
    m1 = res1.json()
    assert m1["name"] == "Subhashree Dash"
    assert m1["designation"] == "President"
    assert m1["is_active"] is True
    assert m1["display_order"] == 1
    assert m1["photo_url"] is None
    id1 = m1["id"]

    # 2. Create with full fields (including bio, custom display order)
    res2 = client.post(
        "/api/v1/admin/members",
        json={
            "name": "Pradeep Kumar Sahoo",
            "designation": "General Secretary",
            "bio": "Founding member dedicated to community welfare in Banza.",
            "display_order": 2,
            "is_active": True,
        },
        headers=headers,
    )
    assert res2.status_code == 201
    m2 = res2.json()
    assert m2["name"] == "Pradeep Kumar Sahoo"
    assert m2["bio"] == "Founding member dedicated to community welfare in Banza."
    id2 = m2["id"]

    # 3. Create inactive member
    res3 = client.post(
        "/api/v1/admin/members",
        json={"name": "Inactive Volunteer", "designation": "Volunteer", "is_active": False},
        headers=headers,
    )
    assert res3.status_code == 201
    id3 = res3.json()["id"]

    # 4. Verify audit logging
    audit = db_session.query(AuditLog).filter(
        AuditLog.action == "MEMBER_CREATED",
        AuditLog.entity_id == str(id1)
    ).first()
    assert audit is not None
    assert audit.user_id == test_admin_user.id


def test_member_authorization_and_idor(client: TestClient, test_non_admin_user: User, test_admin_user: User):
    # Unauthenticated
    res_unauth = client.post("/api/v1/admin/members", json={"name": "Hacker"})
    assert res_unauth.status_code == 401

    # Non-admin forbidden
    non_admin_headers = get_auth_headers(test_non_admin_user)
    res_forbid = client.post("/api/v1/admin/members", json={"name": "Hacker"}, headers=non_admin_headers)
    assert res_forbid.status_code == 403

    # Non-existent member detail 404
    admin_headers = get_auth_headers(test_admin_user)
    res_404 = client.get("/api/v1/admin/members/999999", headers=admin_headers)
    assert res_404.status_code == 404


def test_admin_update_activate_deactivate(client: TestClient, test_admin_user: User, db_session: Session):
    headers = get_auth_headers(test_admin_user)

    # Create member
    created = client.post(
        "/api/v1/admin/members",
        json={"name": "Rakesh Mohapatra", "designation": "Treasurer", "display_order": 5},
        headers=headers,
    ).json()
    m_id = created["id"]

    # Update fields
    res_update = client.patch(
        f"/api/v1/admin/members/{m_id}",
        json={"name": "Rakesh K. Mohapatra", "bio": "Managing cultural funds."},
        headers=headers,
    )
    assert res_update.status_code == 200
    assert res_update.json()["name"] == "Rakesh K. Mohapatra"
    assert res_update.json()["bio"] == "Managing cultural funds."

    # Deactivate
    res_deact = client.post(f"/api/v1/admin/members/{m_id}/deactivate", headers=headers)
    assert res_deact.status_code == 200
    assert res_deact.json()["is_active"] is False

    # Activate
    res_act = client.post(f"/api/v1/admin/members/{m_id}/activate", headers=headers)
    assert res_act.status_code == 200
    assert res_act.json()["is_active"] is True


def test_admin_reorder_members(client: TestClient, test_admin_user: User):
    headers = get_auth_headers(test_admin_user)

    m1 = client.post("/api/v1/admin/members", json={"name": "Member Alpha", "display_order": 1}, headers=headers).json()
    m2 = client.post("/api/v1/admin/members", json={"name": "Member Beta", "display_order": 2}, headers=headers).json()

    reorder_res = client.post(
        "/api/v1/admin/members/reorder",
        json={"orders": [{"id": m1["id"], "display_order": 10}, {"id": m2["id"], "display_order": 1}]},
        headers=headers,
    )
    assert reorder_res.status_code == 200

    # Verify public ordering
    pub_res = client.get("/api/v1/public/members").json()
    names = [item["name"] for item in pub_res["items"]]
    assert names.index("Member Beta") < names.index("Member Alpha")


def test_member_photo_upload_replace_delete(client: TestClient, test_admin_user: User, db_session: Session):
    headers = get_auth_headers(test_admin_user)

    # 1. Create member
    member = client.post(
        "/api/v1/admin/members",
        json={"name": "Ananya Jena", "designation": "Cultural Coordinator"},
        headers=headers,
    ).json()
    m_id = member["id"]

    # 2. Upload initial photo (PNG)
    img_buf1 = create_test_image(format="PNG", size=(300, 300), color="green")
    upload_res1 = client.post(
        f"/api/v1/admin/members/{m_id}/photo",
        files={"file": ("profile.png", img_buf1, "image/png")},
        headers=headers,
    )
    assert upload_res1.status_code == 200
    data1 = upload_res1.json()
    assert data1["photo_storage_path"] is not None
    assert data1["photo_storage_path"].startswith("/uploads/members/")
    assert data1["photo_mime_type"] == "image/png"
    assert data1["photo_width"] == 300
    assert data1["photo_height"] == 300
    path1 = data1["photo_storage_path"]

    # Verify file exists on disk
    upload_root = get_upload_dir()
    rel_path1 = path1.replace("/uploads/", "")
    full_path1 = upload_root / rel_path1
    assert full_path1.exists()

    # 3. Replace photo with JPEG
    img_buf2 = create_test_image(format="JPEG", size=(400, 400), color="red")
    upload_res2 = client.post(
        f"/api/v1/admin/members/{m_id}/photo",
        files={"file": ("new_profile.jpg", img_buf2, "image/jpeg")},
        headers=headers,
    )
    assert upload_res2.status_code == 200
    data2 = upload_res2.json()
    path2 = data2["photo_storage_path"]
    assert path2 != path1
    assert data2["photo_mime_type"] == "image/jpeg"

    # Verify old file was deleted from disk and new file exists
    assert not full_path1.exists()
    rel_path2 = path2.replace("/uploads/", "")
    full_path2 = upload_root / rel_path2
    assert full_path2.exists()

    # 4. Delete photo
    del_res = client.delete(f"/api/v1/admin/members/{m_id}/photo", headers=headers)
    assert del_res.status_code == 200
    data3 = del_res.json()
    assert data3["photo_storage_path"] is None
    assert data3["photo_url"] is None
    assert not full_path2.exists()

    # 5. Delete member completely
    del_member_res = client.delete(f"/api/v1/admin/members/{m_id}", headers=headers)
    assert del_member_res.status_code == 200


def test_member_photo_upload_security_validations(client: TestClient, test_admin_user: User):
    headers = get_auth_headers(test_admin_user)

    member = client.post(
        "/api/v1/admin/members",
        json={"name": "Security Test User", "designation": "Tester"},
        headers=headers,
    ).json()
    m_id = member["id"]

    # 1. Invalid MIME type (text/plain)
    res_mime = client.post(
        f"/api/v1/admin/members/{m_id}/photo",
        files={"file": ("malicious.txt", io.BytesIO(b"Hello world text file"), "text/plain")},
        headers=headers,
    )
    assert res_mime.status_code == 400

    # 2. Fake magic bytes (script disguised as image)
    res_fake = client.post(
        f"/api/v1/admin/members/{m_id}/photo",
        files={"file": ("fake.jpg", io.BytesIO(b"<script>alert(1)</script>"), "image/jpeg")},
        headers=headers,
    )
    assert res_fake.status_code == 400

    # 3. SVG image rejection (XSS vector)
    svg_data = b'<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>'
    res_svg = client.post(
        f"/api/v1/admin/members/{m_id}/photo",
        files={"file": ("vector.svg", io.BytesIO(svg_data), "image/svg+xml")},
        headers=headers,
    )
    assert res_svg.status_code == 400

    # 4. Corrupted image bytes
    corrupted_data = b"\xFF\xD8\xFF\xE0" + b"\x00" * 50
    res_corrupt = client.post(
        f"/api/v1/admin/members/{m_id}/photo",
        files={"file": ("broken.jpg", io.BytesIO(corrupted_data), "image/jpeg")},
        headers=headers,
    )
    assert res_corrupt.status_code == 400


def test_public_members_privacy_and_filtering(client: TestClient, test_admin_user: User):
    headers = get_auth_headers(test_admin_user)

    # Add active member
    m_active = client.post(
        "/api/v1/admin/members",
        json={"name": "Public Active Member", "designation": "Youth Leader", "display_order": 1, "is_active": True},
        headers=headers,
    ).json()

    # Add inactive member
    m_inactive = client.post(
        "/api/v1/admin/members",
        json={"name": "Hidden Inactive Member", "designation": "Former Member", "display_order": 2, "is_active": False},
        headers=headers,
    ).json()

    # Public endpoint check
    pub_res = client.get("/api/v1/public/members")
    assert pub_res.status_code == 200
    data = pub_res.json()

    # Inactive member must NOT be present
    public_names = [item["name"] for item in data["items"]]
    assert "Public Active Member" in public_names
    assert "Hidden Inactive Member" not in public_names

    # Privacy verification: Zero sensitive or administrative fields in public items
    item = next(i for i in data["items"] if i["name"] == "Public Active Member")
    assert "created_by" not in item
    assert "updated_by" not in item
    assert "email" not in item
    assert "phone" not in item
    assert "address" not in item
    assert "password" not in item
    assert "audit" not in item
    assert item["name"] == "Public Active Member"
    assert item["designation"] == "Youth Leader"
