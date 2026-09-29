def test_health_check_endpoint(client):
    """
    Verify GET /api/v1/health returns 200 OK and expected structure.
    """
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "service" in data
    assert "version" in data
    assert "environment" in data


def test_root_endpoint(client):
    """
    Verify root endpoint responds with service info.
    """
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "health" in data
    assert data["health"] == "/api/v1/health"


def test_404_json_error_structure(client):
    """
    Verify non-existent routes return standardized JSON error structure.
    """
    response = client.get("/api/v1/non-existent-route-999")
    assert response.status_code == 404
    data = response.json()
    assert "error" in data
    assert data["error"]["code"] == 404
    assert "message" in data["error"]
