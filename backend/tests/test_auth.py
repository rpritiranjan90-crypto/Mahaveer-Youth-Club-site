from backend.app.models.user import User


def test_login_success(client):
    """
    Verify valid credentials return JWT token and user info.
    """
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@mahaveeryouthclub.org", "password": "AdminPassword123!"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user_email"] == "admin@mahaveeryouthclub.org"
    assert data["user_role"] == "admin"


def test_login_invalid_password(client):
    """
    Verify incorrect password returns 401 Unauthorized.
    """
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@mahaveeryouthclub.org", "password": "WrongPassword123!"},
    )
    assert response.status_code == 401
    assert "error" in response.json() or "detail" in response.json()


def test_login_invalid_email(client):
    """
    Verify non-existent email returns 401 Unauthorized.
    """
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "nonexistent@example.com", "password": "AnyPassword123!"},
    )
    assert response.status_code == 401


def test_login_inactive_user(client, db_session):
    """
    Verify inactive user is blocked with 403 Forbidden.
    """
    user = db_session.query(User).filter(User.email == "admin@mahaveeryouthclub.org").first()
    user.is_active = False
    db_session.commit()

    response = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@mahaveeryouthclub.org", "password": "AdminPassword123!"},
    )
    assert response.status_code == 403


def test_get_me_authorized(client, admin_headers):
    """
    Verify /auth/me returns current authenticated user profile.
    """
    response = client.get("/api/v1/auth/me", headers=admin_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "admin@mahaveeryouthclub.org"
    assert data["role"] == "admin"
    assert "password_hash" not in data  # Never expose password hash


def test_get_me_unauthorized(client):
    """
    Verify accessing /auth/me without token returns 401.
    """
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401


def test_logout_endpoint(client):
    """
    Verify POST /auth/logout returns success confirmation.
    """
    response = client.post("/api/v1/auth/logout")
    assert response.status_code == 200
    assert "logged out" in response.json()["message"].lower()


def test_invalid_bearer_token(client):
    """
    Verify invalid or forged Bearer token is rejected with 401.
    """
    headers = {"Authorization": "Bearer totally.invalid.token.structure"}
    response = client.get("/api/v1/auth/me", headers=headers)
    assert response.status_code == 401


def test_non_admin_role_forbidden_on_admin_endpoint(client, db_session):
    """
    Verify authenticated user with role != 'admin' receives 403 Forbidden.
    """
    from backend.app.core.security import create_access_token, get_password_hash
    # Create non-admin user
    member = User(
        name="Club Member",
        email="member@mahaveeryouthclub.org",
        password_hash=get_password_hash("MemberPass123!"),
        role="member",
        is_active=True,
    )
    db_session.add(member)
    db_session.commit()

    member_token = create_access_token(subject=member.id, role="member")
    member_headers = {"Authorization": f"Bearer {member_token}"}

    # /auth/me should succeed for any valid user
    me_res = client.get("/api/v1/auth/me", headers=member_headers)
    assert me_res.status_code == 200

    # /admin/stats should be FORBIDDEN (403) for non-admin
    admin_res = client.get("/api/v1/admin/stats", headers=member_headers)
    assert admin_res.status_code == 403


def test_expired_token_rejected(client, db_session):
    """
    Verify expired JWT token returns 401 Unauthorized.
    """
    from datetime import timedelta
    from backend.app.core.security import create_access_token
    admin = db_session.query(User).filter(User.email == "admin@mahaveeryouthclub.org").first()
    # Create token that expired 1 hour ago
    expired_token = create_access_token(
        subject=admin.id,
        role="admin",
        expires_delta=timedelta(hours=-1),
    )
    expired_headers = {"Authorization": f"Bearer {expired_token}"}
    response = client.get("/api/v1/admin/stats", headers=expired_headers)
    assert response.status_code == 401

