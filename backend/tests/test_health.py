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
