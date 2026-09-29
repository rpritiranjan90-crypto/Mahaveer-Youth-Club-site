from backend.app.models.update import Update
from backend.app.models.gallery import Gallery


def test_get_public_club(client):
    """
    Verify GET /api/v1/public/club returns public settings.
    """
    response = client.get("/api/v1/public/club")
    assert response.status_code == 200
    data = response.json()
    assert "name" in data
    assert "phone" in data
    assert "email" in data


def test_get_public_updates(client, db_session):
    """
    Verify published updates are returned and unpublished are filtered out.
    """
    # Create unpublished update
    unpub = Update(
        title="Draft Secret Notice",
        slug="draft-secret-notice",
        excerpt="Not published yet",
        content="Hidden from public",
        published=False,
    )
    db_session.add(unpub)
    db_session.commit()

    response = client.get("/api/v1/public/updates")
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0
    # Verify no unpublished updates appear
    slugs = [item["slug"] for item in data]
    assert "draft-secret-notice" not in slugs


def test_get_public_update_by_slug(client):
    """
    Verify fetching single update by slug.
    """
    response = client.get("/api/v1/public/updates/ganesh-utsav-2026-vedic-palace-pandal-concept-unveiled")
    assert response.status_code == 200
    data = response.json()
    assert data["slug"] == "ganesh-utsav-2026-vedic-palace-pandal-concept-unveiled"
    assert "title" in data


def test_get_public_update_not_found(client):
    """
    Verify non-existent slug returns 404.
    """
    response = client.get("/api/v1/public/updates/non-existent-slug-xyz")
    assert response.status_code == 404


def test_get_public_gallery_published_filtering(client, db_session):
    """
    Verify published gallery items returned and unpublished items filtered out.
    """
    hidden = Gallery(
        title="Internal Test Photo",
        image_url="/uploads/hidden.jpg",
        category="Pandal",
        year="2026",
        published=False,
    )
    pub = Gallery(
        title="Public Pandal Photo",
        image_url="/uploads/public.jpg",
        category="Pandal",
        year="2026",
        published=True,
    )
    db_session.add_all([hidden, pub])
    db_session.commit()

    response = client.get("/api/v1/public/gallery")
    assert response.status_code == 200
    data = response.json()
    titles = [item["title"] for item in data]
    assert "Public Pandal Photo" in titles
    assert "Internal Test Photo" not in titles


def test_get_public_activities(client):
    """
    Verify GET /api/v1/public/activities returns ritual and welfare events.
    """
    response = client.get("/api/v1/public/activities")
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0
    assert "title" in data[0]
    assert "category" in data[0]


def test_get_public_history(client):
    """
    Verify GET /api/v1/public/history returns chronological history items.
    """
    response = client.get("/api/v1/public/history")
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0
    assert data[0]["year"] == "1998"


def test_get_public_donation(client):
    """
    Verify GET /api/v1/public/donation returns official UPI configuration.
    """
    response = client.get("/api/v1/public/donation")
    assert response.status_code == 200
    data = response.json()
    assert "upi_id" in data
    assert "club_name" in data


def test_public_activities_published_filtering(client, db_session):
    """
    Verify unpublished activities are not returned in public API.
    """
    from backend.app.models.activity import Activity
    hidden_act = Activity(
        title="Secret Internal Committee Meeting",
        category="Internal",
        date="Tomorrow",
        location="Office",
        description="Private meeting",
        published=False,
    )
    db_session.add(hidden_act)
    db_session.commit()

    res = client.get("/api/v1/public/activities")
    assert res.status_code == 200
    titles = [a["title"] for a in res.json()]
    assert "Secret Internal Committee Meeting" not in titles


def test_public_history_published_filtering(client, db_session):
    """
    Verify unpublished history milestones are not returned in public API.
    """
    from backend.app.models.history import History
    hidden_hist = History(
        year="1995",
        title="Pre-Founding Informal Discussions",
        description="Informal planning before club formation",
        sort_order=0,
        published=False,
    )
    db_session.add(hidden_hist)
    db_session.commit()

    res = client.get("/api/v1/public/history")
    assert res.status_code == 200
    titles = [h["title"] for h in res.json()]
    assert "Pre-Founding Informal Discussions" not in titles


def test_public_query_filters(client):
    """
    Verify category and year filters on public endpoints.
    """
    # Updates category filter
    res = client.get("/api/v1/public/updates?category=Pandal")
    assert res.status_code == 200

    # Gallery category & year filter
    res_gal = client.get("/api/v1/public/gallery?category=Pandal&year=2026")
    assert res_gal.status_code == 200

    # Activities category filter
    res_act = client.get("/api/v1/public/activities?category=Ritual")
    assert res_act.status_code == 200

