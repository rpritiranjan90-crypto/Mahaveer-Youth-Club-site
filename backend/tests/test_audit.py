import json
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from backend.app.models.audit_log import AuditLog
from backend.app.models.user import User
from backend.app.services.audit import record_audit_event, sanitize_audit_details


def test_audit_log_sanitization():
    """21 & 23: Tests that sensitive keys are strictly redacted in audit logs."""
    dirty_details = {
        "user_email": "admin@banza.org",
        "password": "RawPlaintextPassword123!",
        "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "totp_secret": "JBSWY3DPEHPK3PXP",
        "recovery_codes": ["ABCD-1234", "EFGH-5678"],
        "client_browser": "Mozilla/5.0",
    }
    cleaned_json = sanitize_audit_details(dirty_details)
    assert cleaned_json is not None
    cleaned = json.loads(cleaned_json)

    assert cleaned["user_email"] == "admin@banza.org"
    assert cleaned["client_browser"] == "Mozilla/5.0"
    assert cleaned["password"] == "[REDACTED]"
    assert cleaned["access_token"] == "[REDACTED]"
    assert cleaned["totp_secret"] == "[REDACTED]"
    assert cleaned["recovery_codes"] == "[REDACTED]"


def test_audit_logs_endpoint_protection_and_pagination(
    client: TestClient, test_admin_user: User, test_non_admin_user: User, db_session: Session
):
    """21 & 22: Tests protected access and pagination on /api/v1/admin/audit-logs."""
    # Seed 5 audit events
    for i in range(5):
        record_audit_event(
            db_session,
            action=f"TEST_ACTION_{i}",
            user_id=test_admin_user.id,
            user_email=test_admin_user.email,
            ip_address="127.0.0.1",
        )

    # 1. Reject unauthenticated access
    unauth_resp = client.get("/api/v1/admin/audit-logs")
    assert unauth_resp.status_code == 401

    # 2. Reject non-admin access
    non_admin_login = client.post(
        "/api/v1/auth/login",
        json={"email": "volunteer@banza.org", "password": "VolunteerPass123!"},
    )
    non_admin_token = non_admin_login.json()["access_token"]
    forbidden_resp = client.get(
        "/api/v1/admin/audit-logs",
        headers={"Authorization": f"Bearer {non_admin_token}"},
    )
    assert forbidden_resp.status_code == 403

    # 3. Allow admin access
    admin_login = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@banza.org", "password": "SecureAdminPassword123!"},
    )
    admin_token = admin_login.json()["access_token"]

    logs_resp = client.get(
        "/api/v1/admin/audit-logs?page=1&page_size=3",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert logs_resp.status_code == 200
    data = logs_resp.json()
    assert len(data["items"]) == 3
    assert data["total"] >= 5
    assert data["page"] == 1
    assert data["page_size"] == 3
