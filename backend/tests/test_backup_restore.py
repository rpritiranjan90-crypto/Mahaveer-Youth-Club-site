import gzip
import json
import sqlite3
import tempfile
from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest

from scripts.backup import (
    EXPECTED_TABLES,
    backup_python_json_export,
    backup_sqlite,
    calculate_sha256,
    mask_db_url,
    run_backup,
)
from scripts.verify_backup import (
    PG_CUSTOM_DUMP_MAGIC,
    run_verification,
    verify_file_presence,
    verify_postgresql_custom_dump,
    verify_secondary_json_export,
    verify_sha256_manifest,
    verify_sqlite_backup,
)


def create_sample_sqlite_db(db_path: Path) -> None:
    """Helper to create a fully populated sample SQLite database with all expected tables."""
    conn = sqlite3.connect(str(db_path))
    cursor = conn.cursor()
    for table in EXPECTED_TABLES:
        cursor.execute(f'CREATE TABLE "{table}" (id INTEGER PRIMARY KEY, name TEXT);')
        cursor.execute(f'INSERT INTO "{table}" (id, name) VALUES (1, "test_record");')
    conn.commit()
    conn.close()


# -----------------------------------------------------------------------------
# 1. Masking & Security Tests
# -----------------------------------------------------------------------------
def test_mask_db_url_redacts_passwords():
    raw_url = "postgresql://myuser:SuperSecretPassword123@ep-cool-cloud.neon.tech/neondb"
    masked = mask_db_url(raw_url)
    assert "SuperSecretPassword123" not in masked
    assert "myuser:***@ep-cool-cloud.neon.tech" in masked


def test_mask_db_url_handles_empty_or_sqlite():
    assert mask_db_url("") == "<EMPTY>"
    assert mask_db_url("sqlite:///./test.db") == "sqlite:///./test.db"


# -----------------------------------------------------------------------------
# 2. Backup & Verification End-to-End Tests (SQLite)
# -----------------------------------------------------------------------------
def test_sqlite_backup_and_verification_success(tmp_path):
    # 1. Create source database
    src_db = tmp_path / "source.db"
    create_sample_sqlite_db(src_db)

    # 2. Run backup
    backup_dir = tmp_path / "backups"
    backup_file = run_backup(
        output_dir=backup_dir,
        db_url_override=f"sqlite:///{src_db}",
        backup_format="native",
    )
    assert backup_file.exists()
    assert backup_file.stat().st_size > 0

    # 3. Locate manifest
    manifest_files = list(backup_dir.glob("manifest_*.json"))
    assert len(manifest_files) == 1
    manifest_file = manifest_files[0]

    # 4. Verify backup
    report = run_verification(backup_file=backup_file, manifest_file=manifest_file)
    assert report["status"] == "VALID"
    assert report["manifest_verified"] is True
    assert len(report["details"]["tables_found"]) == len(EXPECTED_TABLES)


# -----------------------------------------------------------------------------
# 3. Tampered & Corrupted Backup Detection Tests
# -----------------------------------------------------------------------------
def test_tampered_backup_detected_by_sha256(tmp_path):
    src_db = tmp_path / "source.db"
    create_sample_sqlite_db(src_db)

    backup_dir = tmp_path / "backups"
    backup_file = run_backup(
        output_dir=backup_dir,
        db_url_override=f"sqlite:///{src_db}",
    )
    manifest_file = list(backup_dir.glob("manifest_*.json"))[0]

    # Tamper with backup file content
    with open(backup_file, "ab") as f:
        f.write(b"TAMPERED_MALICIOUS_BYTES")

    # Verification must fail on SHA-256 mismatch
    with pytest.raises(ValueError) as exc_info:
        run_verification(backup_file=backup_file, manifest_file=manifest_file)

    assert "Checksum Mismatch" in str(exc_info.value) or "corruption or tampering" in str(exc_info.value)


def test_corrupted_sqlite_integrity_fails(tmp_path):
    bad_backup_file = tmp_path / "corrupted.sqlite.gz"
    # Write garbage gzip
    with gzip.open(bad_backup_file, "wb") as f:
        f.write(b"NOT_A_VALID_SQLITE_DATABASE_HEADER_DATA")

    with pytest.raises(Exception):
        verify_sqlite_backup(bad_backup_file)


# -----------------------------------------------------------------------------
# 4. PostgreSQL Custom Dump Verification Tests
# -----------------------------------------------------------------------------
def test_postgresql_custom_dump_validates_magic_header(tmp_path):
    valid_dump = tmp_path / "valid.dump"
    with open(valid_dump, "wb") as f:
        f.write(PG_CUSTOM_DUMP_MAGIC + b"\x01\x0e\x00\x00\x00" + b"\x00" * 100)

    result = verify_postgresql_custom_dump(valid_dump)
    assert result["header_valid"] is True
    assert result["is_native_dump"] is True


def test_postgresql_custom_dump_invalid_header_raises_error(tmp_path):
    invalid_dump = tmp_path / "invalid.dump"
    with open(invalid_dump, "wb") as f:
        f.write(b"NOT_A_PG_DUMP_HEADER_12345")

    with pytest.raises(ValueError) as exc_info:
        verify_postgresql_custom_dump(invalid_dump)
    assert "Invalid PostgreSQL custom dump header" in str(exc_info.value)


# -----------------------------------------------------------------------------
# 5. Secondary JSON Export Tests (Non-Equivalence Distinction)
# -----------------------------------------------------------------------------
def test_secondary_json_export_and_verification(tmp_path):
    src_db = tmp_path / "source.db"
    create_sample_sqlite_db(src_db)

    export_file = tmp_path / "export.json.gz"
    meta = backup_python_json_export(f"sqlite:///{src_db}", export_file)
    assert meta["is_native_dump"] is False
    assert "disclaimer" in meta

    result = verify_secondary_json_export(export_file)
    assert result["is_native_dump"] is False
    assert "SECONDARY BEST-EFFORT EXPORT" in result["disclaimer"]
    assert len(result["tables_found"]) == len(EXPECTED_TABLES)


# -----------------------------------------------------------------------------
# 6. File Presence & Empty File Checks
# -----------------------------------------------------------------------------
def test_verify_file_presence_rejects_missing_or_empty(tmp_path):
    missing_file = tmp_path / "non_existent.dump"
    with pytest.raises(FileNotFoundError):
        verify_file_presence(missing_file)

    empty_file = tmp_path / "empty.dump"
    empty_file.touch()
    with pytest.raises(ValueError) as exc_info:
        verify_file_presence(empty_file)
    assert "is empty (0 bytes)" in str(exc_info.value)


# -----------------------------------------------------------------------------
# 7. End-to-End Restoration Tests (Isolated Environment)
# -----------------------------------------------------------------------------
def test_sqlite_restoration_success(tmp_path):
    from scripts.restore import run_restore

    src_db = tmp_path / "source.db"
    create_sample_sqlite_db(src_db)

    backup_dir = tmp_path / "backups"
    backup_file = run_backup(
        output_dir=backup_dir,
        db_url_override=f"sqlite:///{src_db}",
    )
    manifest_file = list(backup_dir.glob("manifest_*.json"))[0]

    restored_db = tmp_path / "restored.db"
    restore_res = run_restore(
        backup_file=backup_file,
        target_db_url=f"sqlite:///{restored_db}",
        manifest_file=manifest_file,
        skip_confirmation=True,
    )

    assert restore_res["status"] == "RESTORE_SUCCESS"
    assert restore_res["verification"]["is_ready"] is True
    assert len(restore_res["verification"]["tables_found"]) == len(EXPECTED_TABLES)


def test_sqlite_restoration_fails_on_corrupted_checksum(tmp_path):
    from scripts.restore import run_restore

    src_db = tmp_path / "source.db"
    create_sample_sqlite_db(src_db)

    backup_dir = tmp_path / "backups"
    backup_file = run_backup(
        output_dir=backup_dir,
        db_url_override=f"sqlite:///{src_db}",
    )
    manifest_file = list(backup_dir.glob("manifest_*.json"))[0]

    # Corrupt backup file
    with open(backup_file, "ab") as f:
        f.write(b"CORRUPTED")

    restored_db = tmp_path / "restored.db"
    with pytest.raises(ValueError) as exc_info:
        run_restore(
            backup_file=backup_file,
            target_db_url=f"sqlite:///{restored_db}",
            manifest_file=manifest_file,
            skip_confirmation=True,
        )
    assert "SHA-256 Checksum Mismatch" in str(exc_info.value)


# -----------------------------------------------------------------------------
# 8. Media Inventory Scan Tests (Read-Only)
# -----------------------------------------------------------------------------
def test_media_inventory_scan_executes_cleanly(tmp_path):
    from scripts.inventory_media import scan_media_inventory

    src_db = tmp_path / "source.db"
    conn = sqlite3.connect(str(src_db))
    cursor = conn.cursor()
    cursor.execute("CREATE TABLE gallery_items (id INTEGER, title TEXT, image_url TEXT, thumbnail_url TEXT, year TEXT, category TEXT, status TEXT);")
    cursor.execute("INSERT INTO gallery_items VALUES (1, 'Puja', 'https://res.cloudinary.com/z1aoi3i6/image/upload/v1/mahaveer_club/gallery/abc.jpg', 'https://res.cloudinary.com/...', '2026', 'Festival', 'published');")
    cursor.execute("CREATE TABLE members (id INTEGER, name TEXT, designation TEXT, photo_storage_path TEXT, photo_original_filename TEXT, photo_mime_type TEXT, photo_file_size INTEGER, is_active BOOLEAN);")
    cursor.execute("CREATE TABLE site_assets (id INTEGER, asset_type TEXT, year INTEGER, storage_path TEXT, original_filename TEXT, mime_type TEXT, file_size INTEGER, width INTEGER, height INTEGER, is_active BOOLEAN);")
    cursor.execute("CREATE TABLE activities (id INTEGER, title TEXT, slug TEXT, image TEXT, category TEXT, status TEXT);")
    cursor.execute("CREATE TABLE updates (id INTEGER, title TEXT, slug TEXT, featured_image TEXT, category TEXT, status TEXT);")
    conn.commit()
    conn.close()

    report = scan_media_inventory(f"sqlite:///{src_db}")
    assert report["report_metadata"]["scan_mode"] == "READ_ONLY"
    assert report["stats"]["total_media_records"] == 1
    assert report["stats"]["cloudinary_hosted_count"] == 1
    assert report["inventory"]["gallery_items"][0]["public_id"] == "mahaveer_club/gallery/abc"


