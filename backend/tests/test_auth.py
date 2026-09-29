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
