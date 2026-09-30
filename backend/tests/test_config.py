from backend.app.core.config import Settings


def test_settings_initialization():
    """
    Verify settings default values and CORS origin assembly.
    """
    s = Settings(
        APP_ENV="testing",
        APP_NAME="Mahaveer Youth Club Banza API",
        CORS_ORIGINS="http://localhost:5173,http://localhost:3000",
    )
    assert s.APP_ENV == "testing"
    assert "http://localhost:5173" in s.CORS_ORIGINS
    assert "http://localhost:3000" in s.CORS_ORIGINS
