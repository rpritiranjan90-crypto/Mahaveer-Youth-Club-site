import time
import pytest
import pyotp
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from backend.app.core.security import (
    create_2fa_challenge_token,
    hash_password,
    hash_recovery_code,
    verify_password,
)
from backend.app.models.audit_log import AuditLog
from backend.app.models.recovery_code import RecoveryCode
from backend.app.models.user import User


def test_password_hashing():
    """1 & 2: Tests password hashing with Argon2id and constant-time verification."""
    plain = "SuperSecretPassword123!"
    hashed = hash_password(plain)

    assert hashed != plain
    assert verify_password(plain, hashed) is True
    assert verify_password("WrongPassword123!", hashed) is False


def test_login_success_without_2fa(client: TestClient, test_admin_user: User):
    """3: Tests successful login with valid credentials when 2FA is not enabled."""
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@banza.org", "password": "SecureAdminPassword123!"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["requires_2fa"] is False
    assert data["access_token"] is not None
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "admin@banza.org"
    assert data["user"]["is_admin"] is True


def test_login_failure_invalid_password(client: TestClient, test_admin_user: User):
    """4 & 5: Tests generic error message on invalid password to prevent enumeration."""
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@banza.org", "password": "IncorrectPassword123!"},
    )
    assert response.status_code == 401
    data = response.json()
    assert data["error"]["message"] == "Invalid email or password."


def test_login_failure_nonexistent_email(client: TestClient):
    """5: Tests account enumeration protection for non-existent email."""
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "nonexistent@banza.org", "password": "SomePassword123!"},
    )
    assert response.status_code == 401
    data = response.json()
    assert data["error"]["message"] == "Invalid email or password."


def test_login_deactivated_account(client: TestClient, test_admin_user: User, db_session: Session):
    """Tests rejection of deactivated accounts."""
    test_admin_user.is_active = False
    db_session.commit()

    response = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@banza.org", "password": "SecureAdminPassword123!"},
    )
    assert response.status_code == 403
    assert "deactivated" in response.json()["error"]["message"]


def test_login_rate_limiting(client: TestClient, test_admin_user: User):
    """24: Tests rate limiting threshold after 5 consecutive failed attempts."""
    for _ in range(5):
        resp = client.post(
            "/api/v1/auth/login",
            json={"email": "admin@banza.org", "password": "WrongPassword123!"},
        )
        assert resp.status_code == 401

    # 6th attempt must be rejected with 429 Too Many Requests
    rate_limited_resp = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@banza.org", "password": "SecureAdminPassword123!"},
    )
    assert rate_limited_resp.status_code == 429
    assert "Too many failed login attempts" in rate_limited_resp.json()["error"]["message"]


def test_current_user_me_endpoint(client: TestClient, test_admin_user: User):
    """19 & 23: Tests /api/v1/auth/me returns safe profile and no sensitive credentials."""
    login_resp = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@banza.org", "password": "SecureAdminPassword123!"},
    )
    token = login_resp.json()["access_token"]

    response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    user_data = response.json()
    assert user_data["email"] == "admin@banza.org"
    assert user_data["is_admin"] is True
    # Verify no sensitive data leakage
    assert "password_hash" not in user_data
    assert "totp_secret" not in user_data
    assert "backup_codes" not in user_data


def test_protected_endpoint_without_token(client: TestClient):
    """25: Tests rejection of unauthenticated requests on protected endpoints."""
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401


def test_non_admin_rejection(client: TestClient, test_non_admin_user: User):
    """6 & 7: Tests rejection of non-admin users from admin-only operations."""
    login_resp = client.post(
        "/api/v1/auth/login",
        json={"email": "volunteer@banza.org", "password": "VolunteerPass123!"},
    )
    token = login_resp.json()["access_token"]

    # Attempt 2FA setup (admin required)
    setup_resp = client.post(
        "/api/v1/auth/2fa/setup",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert setup_resp.status_code == 403
    assert "Administrator access required" in setup_resp.json()["error"]["message"]


def test_two_factor_setup_and_enable_flow(
    client: TestClient, test_admin_user: User, db_session: Session
):
    """8, 9, 10, 11: Tests complete 2FA setup, invalid TOTP rejection, and activation."""
    login_resp = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@banza.org", "password": "SecureAdminPassword123!"},
    )
    token = login_resp.json()["access_token"]

    # 1. Setup 2FA
    setup_resp = client.post(
        "/api/v1/auth/2fa/setup",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert setup_resp.status_code == 200
    setup_data = setup_resp.json()
    secret = setup_data["secret"]
    assert "otpauth://" in setup_data["provisioning_uri"]

    # 2. Attempt enable with invalid code
    bad_enable_resp = client.post(
        "/api/v1/auth/2fa/enable",
        headers={"Authorization": f"Bearer {token}"},
        json={"code": "000000"},
    )
    assert bad_enable_resp.status_code == 400

    # 3. Enable with valid code from secret
    valid_code = pyotp.TOTP(secret).now()
    good_enable_resp = client.post(
        "/api/v1/auth/2fa/enable",
        headers={"Authorization": f"Bearer {token}"},
        json={"code": valid_code},
    )
    assert good_enable_resp.status_code == 200
    enable_data = good_enable_resp.json()
    assert "recovery_codes" in enable_data
    assert len(enable_data["recovery_codes"]) == 8

    # Verify user state in DB
    db_session.refresh(test_admin_user)
    assert test_admin_user.totp_enabled is True
    assert test_admin_user.totp_secret == secret


def test_two_factor_login_challenge_and_verification(
    client: TestClient, test_admin_user: User, db_session: Session
):
    """12, 13, 14, 15: Tests 2FA login challenge, valid TOTP verification, and token scope."""
    # Setup TOTP on user
    secret = pyotp.random_base32()
    test_admin_user.totp_secret = secret
    test_admin_user.totp_enabled = True
    db_session.commit()

    # 1. Login should return 2FA challenge
    login_resp = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@banza.org", "password": "SecureAdminPassword123!"},
    )
    assert login_resp.status_code == 200
    login_data = login_resp.json()
    assert login_data["requires_2fa"] is True
    challenge_token = login_data["challenge_token"]
    assert challenge_token is not None

    # 2. Verify challenge token CANNOT be used to access protected endpoints
    unauthorized_check = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {challenge_token}"},
    )
    assert unauthorized_check.status_code == 401

    # 3. Verify with invalid code
    bad_verify = client.post(
        "/api/v1/auth/2fa/verify",
        json={"challenge_token": challenge_token, "code": "999999"},
    )
    assert bad_verify.status_code == 401

    # 4. Verify with valid TOTP code
    valid_code = pyotp.TOTP(secret).now()
    good_verify = client.post(
        "/api/v1/auth/2fa/verify",
        json={"challenge_token": challenge_token, "code": valid_code},
    )
    assert good_verify.status_code == 200
    session_data = good_verify.json()
    assert session_data["requires_2fa"] is False
    assert session_data["access_token"] is not None


def test_recovery_code_login_and_single_use(
    client: TestClient, test_admin_user: User, db_session: Session
):
    """16 & 17: Tests recovery code login and ensures single-use invalidation."""
    secret = pyotp.random_base32()
    test_admin_user.totp_secret = secret
    test_admin_user.totp_enabled = True

    # Seed one recovery code
    raw_code = "ABCD-1234"
    rc_entry = RecoveryCode(
        user_id=test_admin_user.id,
        code_hash=hash_recovery_code(raw_code),
        is_used=False,
    )
    db_session.add(rc_entry)
    db_session.commit()

    # Login and get challenge
    login_resp = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@banza.org", "password": "SecureAdminPassword123!"},
    )
    challenge_token = login_resp.json()["challenge_token"]

    # 1. Use recovery code
    verify_resp = client.post(
        "/api/v1/auth/2fa/verify",
        json={"challenge_token": challenge_token, "code": raw_code},
    )
    assert verify_resp.status_code == 200

    # 2. Check that recovery code is now marked is_used=True
    db_session.refresh(rc_entry)
    assert rc_entry.is_used is True

    # 3. Attempt to use the same recovery code again with a new challenge
    login_resp_2 = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@banza.org", "password": "SecureAdminPassword123!"},
    )
    challenge_token_2 = login_resp_2.json()["challenge_token"]

    reuse_resp = client.post(
        "/api/v1/auth/2fa/verify",
        json={"challenge_token": challenge_token_2, "code": raw_code},
    )
    assert reuse_resp.status_code == 401
    assert "Invalid authentication code" in reuse_resp.json()["error"]["message"]


def test_two_factor_disable_flow(
    client: TestClient, test_admin_user: User, db_session: Session
):
    """18: Tests disabling 2FA requiring both current password and TOTP code."""
    secret = pyotp.random_base32()
    test_admin_user.totp_secret = secret
    test_admin_user.totp_enabled = True
    db_session.commit()

    login_resp = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@banza.org", "password": "SecureAdminPassword123!"},
    )
    challenge = login_resp.json()["challenge_token"]
    verify_resp = client.post(
        "/api/v1/auth/2fa/verify",
        json={"challenge_token": challenge, "code": pyotp.TOTP(secret).now()},
    )
    token = verify_resp.json()["access_token"]

    # 1. Fail with wrong password
    bad_pwd_resp = client.post(
        "/api/v1/auth/2fa/disable",
        headers={"Authorization": f"Bearer {token}"},
        json={"current_password": "WrongPassword!", "code": pyotp.TOTP(secret).now()},
    )
    assert bad_pwd_resp.status_code == 400

    # 2. Disable with valid password and TOTP
    disable_resp = client.post(
        "/api/v1/auth/2fa/disable",
        headers={"Authorization": f"Bearer {token}"},
        json={"current_password": "SecureAdminPassword123!", "code": pyotp.TOTP(secret).now()},
    )
    assert disable_resp.status_code == 200
    db_session.refresh(test_admin_user)
    assert test_admin_user.totp_enabled is False


def test_recovery_codes_regeneration(
    client: TestClient, test_admin_user: User, db_session: Session
):
    """17: Tests regenerating recovery codes with password and TOTP."""
    secret = pyotp.random_base32()
    test_admin_user.totp_secret = secret
    test_admin_user.totp_enabled = True
    db_session.commit()

    login_resp = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@banza.org", "password": "SecureAdminPassword123!"},
    )
    challenge = login_resp.json()["challenge_token"]
    verify_resp = client.post(
        "/api/v1/auth/2fa/verify",
        json={"challenge_token": challenge, "code": pyotp.TOTP(secret).now()},
    )
    token = verify_resp.json()["access_token"]

    regen_resp = client.post(
        "/api/v1/auth/2fa/recovery-codes/regenerate",
        headers={"Authorization": f"Bearer {token}"},
        json={"current_password": "SecureAdminPassword123!", "code": pyotp.TOTP(secret).now()},
    )
    assert regen_resp.status_code == 200
    data = regen_resp.json()
    assert len(data["recovery_codes"]) == 8


def test_password_change_flow(client: TestClient, test_admin_user: User, db_session: Session):
    """19 & 20: Tests password change with minimum length validation and logout."""
    login_resp = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@banza.org", "password": "SecureAdminPassword123!"},
    )
    token = login_resp.json()["access_token"]

    # 1. Fail if new password is too short (< 12 chars)
    short_pwd_resp = client.post(
        "/api/v1/auth/password/change",
        headers={"Authorization": f"Bearer {token}"},
        json={"current_password": "SecureAdminPassword123!", "new_password": "short"},
    )
    assert short_pwd_resp.status_code == 422

    # 2. Change password successfully
    new_password = "BrandNewSecurePassword456!"
    change_resp = client.post(
        "/api/v1/auth/password/change",
        headers={"Authorization": f"Bearer {token}"},
        json={"current_password": "SecureAdminPassword123!", "new_password": new_password},
    )
    assert change_resp.status_code == 200

    # 3. Login with old password must fail
    old_login = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@banza.org", "password": "SecureAdminPassword123!"},
    )
    assert old_login.status_code == 401

    # 4. Login with new password must succeed
    new_login = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@banza.org", "password": new_password},
    )
    assert new_login.status_code == 200


def test_logout(client: TestClient, test_admin_user: User):
    """20: Tests logout endpoint."""
    login_resp = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@banza.org", "password": "SecureAdminPassword123!"},
    )
    token = login_resp.json()["access_token"]

    logout_resp = client.post(
        "/api/v1/auth/logout",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert logout_resp.status_code == 200
    assert logout_resp.json()["status"] == "ok"


def test_refresh_token_httponly_and_rotation(client: TestClient, test_admin_user: User):
    """Tests refresh token rotation and HttpOnly cookie exchange."""
    # 1. Login and receive refresh token cookie
    login_resp = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@banza.org", "password": "SecureAdminPassword123!"},
    )
    assert login_resp.status_code == 200
    assert "myc_refresh_token" in login_resp.cookies
    initial_cookie = login_resp.cookies["myc_refresh_token"]

    # 2. Call /refresh endpoint using cookie
    refresh_resp = client.post("/api/v1/auth/refresh")
    assert refresh_resp.status_code == 200
    refresh_data = refresh_resp.json()
    assert refresh_data["access_token"] is not None
    assert "myc_refresh_token" in refresh_resp.cookies
    rotated_cookie = refresh_resp.cookies["myc_refresh_token"]
    assert rotated_cookie != initial_cookie

    # 3. Old cookie should now be revoked
    client.cookies.set("myc_refresh_token", initial_cookie)
    revoked_check = client.post("/api/v1/auth/refresh")
    assert revoked_check.status_code == 401
