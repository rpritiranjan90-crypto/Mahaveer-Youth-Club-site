def test_root_ping(client):
    """
    Verify GET / returns basic app metadata and health links.
    """
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "app" in data
    assert "docs" in data
    assert "health" in data


def test_health_check_endpoint(client):
    """
    Verify GET /api/v1/health returns 200 OK with application name and environment.
    """
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "Mahaveer Youth Club" in data["app"]
    assert data["version"] == "1.0.0"
    assert "environment" in data


def test_readiness_check_endpoint(client):
    """
    Verify GET /api/v1/ready executes database query and returns 200 OK.
    """
    response = client.get("/api/v1/ready")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ready"
    assert data["database"] == "connected"


def test_readiness_check_head_endpoint(client):
    """
    Verify HEAD /api/v1/ready returns 200 OK (no 405 Method Not Allowed).
    """
    response = client.head("/api/v1/ready")
    assert response.status_code == 200


def test_readiness_check_database_failure(client):
    """
    Verify /api/v1/ready returns 503 Service Unavailable when database connection fails.
    """
    from backend.app.core.database import get_db
    from backend.app.main import app

    def mock_broken_db():
        class MockBrokenSession:
            def execute(self, *args, **kwargs):
                raise Exception("Database connection lost")
            def close(self):
                pass
        yield MockBrokenSession()

    app.dependency_overrides[get_db] = mock_broken_db
    try:
        # Test GET failure
        get_resp = client.get("/api/v1/ready")
        assert get_resp.status_code == 503
        data = get_resp.json()
        assert "Database service unreachable" in (data.get("error", {}).get("message") or str(data))

        # Test HEAD failure
        head_resp = client.head("/api/v1/ready")
        assert head_resp.status_code == 503
    finally:
        app.dependency_overrides.pop(get_db, None)

