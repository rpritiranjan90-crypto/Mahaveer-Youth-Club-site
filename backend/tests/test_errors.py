def test_404_not_found_standard_error_format(client):
    """
    Verify 404 responses conform to {"error": {"code": "NOT_FOUND", "message": "..."}}.
    """
    response = client.get("/api/v1/non-existent-route-xyz")
    assert response.status_code == 404
    data = response.json()
    assert "error" in data
    assert data["error"]["code"] == "NOT_FOUND"
    assert "message" in data["error"]
    # Verify no stack trace or internal paths leaked
    assert "Traceback" not in response.text
    assert "sqlalchemy" not in response.text.lower()


def test_cors_headers_configured(client):
    """
    Verify CORS options request returns configured headers.
    """
    response = client.options(
        "/api/v1/health",
        headers={
            "Origin": "http://localhost:5173",
            "Access-Control-Request-Method": "GET",
        },
    )
    assert response.status_code == 200
    assert "access-control-allow-origin" in response.headers


def test_security_headers_middleware(client):
    """
    Verify standard HTTP security headers are set by SecurityHeadersMiddleware.
    """
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.headers["x-content-type-options"] == "nosniff"
    assert response.headers["x-frame-options"] == "DENY"
    assert response.headers["referrer-policy"] == "strict-origin-when-cross-origin"
    assert response.headers["x-xss-protection"] == "1; mode=block"
    assert "permissions-policy" in response.headers
    assert "content-security-policy" in response.headers

