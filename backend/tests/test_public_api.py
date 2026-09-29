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
