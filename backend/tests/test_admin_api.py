def test_admin_unauthorized_endpoints(client):
    """
    Verify accessing admin endpoints without token returns 401.
    """
    endpoints = [
        ("GET", "/api/v1/admin/stats"),
        ("GET", "/api/v1/admin/updates"),
        ("POST", "/api/v1/admin/updates"),
        ("GET", "/api/v1/admin/gallery"),
        ("GET", "/api/v1/admin/activities"),
        ("GET", "/api/v1/admin/history"),
        ("GET", "/api/v1/admin/club"),
        ("PATCH", "/api/v1/admin/club"),
        ("GET", "/api/v1/admin/donation"),
        ("PATCH", "/api/v1/admin/donation"),
    ]
    for method, path in endpoints:
        if method == "GET":
            res = client.get(path)
        elif method == "POST":
            res = client.post(path, json={})
        elif method == "PATCH":
            res = client.patch(path, json={})
        assert res.status_code == 401, f"{method} {path} should be 401 Unauthorized"


def test_admin_stats(client, admin_headers):
    """
    Verify GET /api/v1/admin/stats returns counts and recent items.
    """
    response = client.get("/api/v1/admin/stats", headers=admin_headers)
    assert response.status_code == 200
    data = response.json()
    assert "counts" in data
    assert "total_updates" in data["counts"]
    assert "total_gallery" in data["counts"]


def test_admin_updates_crud(client, admin_headers):
    """
    Verify Create, Read, Update, Delete lifecycle for updates.
    """
    # 1. Create
    create_res = client.post(
        "/api/v1/admin/updates",
        headers=admin_headers,
        json={
            "title": "New Test Notice",
            "excerpt": "Short excerpt for testing",
            "content": "Full content of test notice",
            "category": "Test",
            "published": True,
        },
    )
    assert create_res.status_code == 201
    created_id = create_res.json()["id"]

    # 2. Update
    patch_res = client.patch(
        f"/api/v1/admin/updates/{created_id}",
        headers=admin_headers,
        json={"title": "Updated Notice Title", "published": False},
    )
    assert patch_res.status_code == 200
    assert patch_res.json()["title"] == "Updated Notice Title"
    assert patch_res.json()["published"] is False

    # 3. Delete
    del_res = client.delete(f"/api/v1/admin/updates/{created_id}", headers=admin_headers)
    assert del_res.status_code == 200


def test_admin_gallery_crud(client, admin_headers):
    """
    Verify Gallery CRUD lifecycle.
    """
    # 1. Create
    create_res = client.post(
        "/api/v1/admin/gallery",
        headers=admin_headers,
        json={
            "title": "Test Pandal Shot",
            "image_url": "/uploads/test.jpg",
            "category": "Pandal",
            "year": "2026",
            "published": True,
        },
    )
    assert create_res.status_code == 201
    item_id = create_res.json()["id"]

    # 2. Update
    patch_res = client.patch(
        f"/api/v1/admin/gallery/{item_id}",
        headers=admin_headers,
        json={"title": "Updated Shot"},
    )
    assert patch_res.status_code == 200
    assert patch_res.json()["title"] == "Updated Shot"

    # 3. Delete
    del_res = client.delete(f"/api/v1/admin/gallery/{item_id}", headers=admin_headers)
    assert del_res.status_code == 200


def test_admin_club_settings_update(client, admin_headers):
    """
    Verify updating club settings.
    """
    patch_res = client.patch(
        "/api/v1/admin/club",
        headers=admin_headers,
        json={"phone": "+91 99999 88888"},
    )
    assert patch_res.status_code == 200
    assert patch_res.json()["phone"] == "+91 99999 88888"


def test_admin_activities_crud(client, admin_headers):
    """
    Verify Activity CRUD lifecycle.
    """
    # 1. Create
    create_res = client.post(
        "/api/v1/admin/activities",
        headers=admin_headers,
        json={
            "title": "Maha Aarti Special",
            "category": "Ritual",
            "date": "Day 5 • 2 Oct 2026",
            "time": "7:00 PM",
            "location": "Main Pandal",
            "description": "Special evening Aarti with guest priests.",
            "published": True,
        },
    )
    assert create_res.status_code == 201
    activity_id = create_res.json()["id"]

    # 2. Update
    patch_res = client.patch(
        f"/api/v1/admin/activities/{activity_id}",
        headers=admin_headers,
        json={"location": "Main Stage Pandal"},
    )
    assert patch_res.status_code == 200
    assert patch_res.json()["location"] == "Main Stage Pandal"

    # 3. Delete
    del_res = client.delete(f"/api/v1/admin/activities/{activity_id}", headers=admin_headers)
    assert del_res.status_code == 200


def test_admin_history_crud(client, admin_headers):
    """
    Verify History Milestone CRUD lifecycle and ordering.
    """
    # 1. Create
    create_res = client.post(
        "/api/v1/admin/history",
        headers=admin_headers,
        json={
            "year": "2015",
            "title": "Silver Jubilee Preparation",
            "description": "Formed the expanded youth volunteer wing.",
            "tag": "Milestone",
            "sort_order": 5,
            "published": True,
        },
    )
    assert create_res.status_code == 201
    hist_id = create_res.json()["id"]

    # 2. Update
    patch_res = client.patch(
        f"/api/v1/admin/history/{hist_id}",
        headers=admin_headers,
        json={"title": "Expanded Youth Volunteer Wing"},
    )
    assert patch_res.status_code == 200
    assert patch_res.json()["title"] == "Expanded Youth Volunteer Wing"

    # 3. Delete
    del_res = client.delete(f"/api/v1/admin/history/{hist_id}", headers=admin_headers)
    assert del_res.status_code == 200


def test_admin_donation_settings_update(client, admin_headers):
    """
    Verify updating donation configuration.
    """
    patch_res = client.patch(
        "/api/v1/admin/donation",
        headers=admin_headers,
        json={"upi_id": "testclub@upi", "suggested_amounts": "201,501,1100"},
    )
    assert patch_res.status_code == 200
    assert patch_res.json()["upi_id"] == "testclub@upi"


