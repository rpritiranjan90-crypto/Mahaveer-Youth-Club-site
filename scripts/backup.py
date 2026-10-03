#!/usr/bin/env python3
"""
Production Database Backup Utility
Project: Mahaveer Youth Club Banza

Creates timestamped, verified backups of the application database:
1. PostgreSQL: Native custom-format compressed archive (pg_dump -F c)
2. SQLite (Dev/Test): Online transactional backup via Python sqlite3 backup API (.sqlite.gz)
3. Best-effort Python fallback: JSON table data export (secondary fallback when pg_dump is absent)

Generates a SHA-256 integrity manifest with table row counts and file metadata.

Usage:
    python scripts/backup.py [--output-dir ./backups/database] [--db-url URL] [--format {native,json-export}]
"""

import argparse
import gzip
import hashlib
import json
import os
import shutil
import sqlite3
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List, Optional, Tuple
from urllib.parse import urlparse

# Ensure project root is in sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

# Tables managed by application models
EXPECTED_TABLES = [
    "users",
    "recovery_codes",
    "refresh_tokens",
    "audit_logs",
    "updates",
    "activities",
    "gallery_items",
    "members",
    "site_assets",
    "alembic_version",
]


def mask_db_url(url: str) -> str:
    """Masks database passwords in connection URLs for safe logging."""
    if not url:
        return "<EMPTY>"
    try:
        parsed = urlparse(url)
        if parsed.password:
            netloc = f"{parsed.username or ''}:***@{parsed.hostname or ''}"
            if parsed.port:
                netloc += f":{parsed.port}"
            return parsed._replace(netloc=netloc).geturl()
        return url
    except Exception:
        return "<UNPARSEABLE_DB_URL>"


def calculate_sha256(filepath: Path) -> str:
    """Computes SHA-256 checksum of a file for integrity verification."""
    sha256 = hashlib.sha256()
    with open(filepath, "rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            sha256.update(chunk)
    return sha256.hexdigest()


def count_postgres_tables(db_url: str) -> Dict[str, int]:
    """Queries PostgreSQL database to gather table row counts for the manifest."""
    table_counts: Dict[str, int] = {}
    try:
        from sqlalchemy import create_engine, text
        normalized_url = db_url.replace("postgres://", "postgresql://", 1) if db_url.startswith("postgres://") else db_url
        engine = create_engine(normalized_url, pool_pre_ping=True)
        with engine.connect() as conn:
            for table in EXPECTED_TABLES:
                try:
                    res = conn.execute(text(f'SELECT COUNT(*) FROM "{table}"'))
                    table_counts[table] = res.scalar() or 0
                except Exception:
                    table_counts[table] = 0
        engine.dispose()
    except Exception as e:
        print(f"    [WARN] Could not retrieve live table row counts: {e}", file=sys.stderr)
    return table_counts


def backup_postgresql_native(db_url: str, output_dump_path: Path) -> dict:
    """
    Performs native custom-format PostgreSQL backup using pg_dump -F c.
    This is the primary production backup method for PostgreSQL.
    """
    parsed = urlparse(db_url)
    username = parsed.username or "postgres"
    password = parsed.password or ""
    hostname = parsed.hostname or "localhost"
    port = str(parsed.port or 5432)
    database = parsed.path.lstrip("/")

    # Check pg_dump availability
    if not shutil.which("pg_dump"):
        raise FileNotFoundError(
            "pg_dump executable not found in system PATH.\n"
            "To perform a native PostgreSQL backup, install PostgreSQL client tools or use --format json-export for a best-effort secondary export."
        )

    env = os.environ.copy()
    if password:
        env["PGPASSWORD"] = password

    cmd = [
        "pg_dump",
        "-h", hostname,
        "-p", port,
        "-U", username,
        "-d", database,
        "-F", "c",          # Custom archive format (compressed, supports pg_restore)
        "-b",               # Include large objects
        "-v",               # Verbose
        "-f", str(output_dump_path),
    ]

    print(f"--> Executing native PostgreSQL dump to {output_dump_path.name} ...")
    process = subprocess.Popen(
        cmd,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        env=env,
    )
    _, stderr = process.communicate()
    if process.returncode != 0:
        err_msg = stderr.decode("utf-8", errors="ignore").strip()
        raise RuntimeError(f"pg_dump failed with exit code {process.returncode}: {err_msg}")

    if not output_dump_path.exists() or output_dump_path.stat().st_size == 0:
        raise RuntimeError(f"pg_dump produced an empty or missing file at: {output_dump_path}")

    table_counts = count_postgres_tables(db_url)

    return {
        "engine": "postgresql",
        "format": "custom_dump",
        "database": database,
        "host": hostname,
        "port": port,
        "backup_file": output_dump_path.name,
        "file_size_bytes": output_dump_path.stat().st_size,
        "sha256": calculate_sha256(output_dump_path),
        "table_counts": table_counts,
        "is_native_dump": True,
    }


def backup_sqlite(db_path: Path, output_gz_path: Path) -> dict:
    """
    Performs a consistent online transactional backup of SQLite using Python's backup API.
    """
    if not db_path.exists():
        raise FileNotFoundError(f"SQLite database file not found at: {db_path}")

    temp_raw_backup = output_gz_path.with_suffix(".tmp")
    
    src_conn = sqlite3.connect(str(db_path))
    dest_conn = sqlite3.connect(str(temp_raw_backup))
    with dest_conn:
        src_conn.backup(dest_conn, pages=100)
    
    # Query table row counts for manifest
    cursor = dest_conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';")
    tables = [row[0] for row in cursor.fetchall()]
    table_counts = {}
    for table in tables:
        try:
            cursor.execute(f'SELECT COUNT(*) FROM "{table}";')
            table_counts[table] = cursor.fetchone()[0]
        except Exception:
            table_counts[table] = 0
            
    dest_conn.close()
    src_conn.close()

    # Compress to .gz
    with open(temp_raw_backup, "rb") as f_in, gzip.open(output_gz_path, "wb", compresslevel=9) as f_out:
        shutil.copyfileobj(f_in, f_out)

    if temp_raw_backup.exists():
        temp_raw_backup.unlink()

    return {
        "engine": "sqlite",
        "format": "sqlite_gz",
        "original_file": str(db_path.name),
        "backup_file": output_gz_path.name,
        "file_size_bytes": output_gz_path.stat().st_size,
        "sha256": calculate_sha256(output_gz_path),
        "table_counts": table_counts,
        "is_native_dump": True,
    }


def backup_python_json_export(db_url: str, output_gz_path: Path) -> dict:
    """
    Secondary best-effort Python table data export using SQLAlchemy.
    NOTE: This is NOT equivalent to a native PostgreSQL custom-format dump;
    it serves as a secondary best-effort data recovery export when pg_dump is unavailable.
    """
    from sqlalchemy import create_engine, text
    normalized_url = db_url.replace("postgres://", "postgresql://", 1) if db_url.startswith("postgres://") else db_url
    engine = create_engine(normalized_url, pool_pre_ping=True)
    
    export_data = {
        "export_metadata": {
            "app_name": "Mahaveer Youth Club Banza API",
            "timestamp_utc": datetime.now(timezone.utc).isoformat(),
            "export_type": "secondary_best_effort_json_export",
            "note": "Secondary table data export. Not equivalent to native PostgreSQL custom-format dump.",
        },
        "tables": {},
    }
    table_counts: Dict[str, int] = {}

    with engine.connect() as conn:
        for table in EXPECTED_TABLES:
            try:
                res = conn.execute(text(f'SELECT * FROM "{table}"'))
                columns = list(res.keys())
                rows = []
                for row in res.fetchall():
                    row_dict = {}
                    for col, val in zip(columns, row):
                        if isinstance(val, (datetime, bytes)):
                            row_dict[col] = val.isoformat() if isinstance(val, datetime) else val.hex()
                        else:
                            row_dict[col] = val
                    rows.append(row_dict)
                export_data["tables"][table] = rows
                table_counts[table] = len(rows)
            except Exception as e:
                print(f"    [WARN] Skipping table {table}: {e}", file=sys.stderr)
                table_counts[table] = 0

    engine.dispose()

    json_bytes = json.dumps(export_data, indent=2, default=str).encode("utf-8")
    with gzip.open(output_gz_path, "wb", compresslevel=9) as f_out:
        f_out.write(json_bytes)

    return {
        "engine": "postgresql" if db_url.startswith("postgres") else "sqlite",
        "format": "secondary_json_export",
        "backup_file": output_gz_path.name,
        "file_size_bytes": output_gz_path.stat().st_size,
        "sha256": calculate_sha256(output_gz_path),
        "table_counts": table_counts,
        "is_native_dump": False,
        "disclaimer": "Secondary best-effort JSON export. Not equivalent to native PostgreSQL custom-format dump.",
    }


def run_backup(
    output_dir: Path,
    db_url_override: Optional[str] = None,
    backup_format: str = "native",
) -> Path:
    """
    Coordinates verified database backup and manifest creation.
    """
    # 1. Resolve DATABASE_URL from override, config, or environment
    db_url = db_url_override or os.environ.get("DATABASE_URL")
    if not db_url:
        try:
            from backend.app.core.config import settings
            db_url = settings.DATABASE_URL
        except Exception:
            pass

    if not db_url:
        raise ValueError(
            "DATABASE_URL is missing. Please set the DATABASE_URL environment variable or pass --db-url."
        )

    output_dir.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    masked_url = mask_db_url(db_url)

    print(f"\n=======================================================")
    print(f" MAHAVEER YOUTH CLUB BANZA — DATABASE BACKUP")
    print(f" Timestamp (UTC): {timestamp}")
    print(f" Target Engine:   {masked_url}")
    print(f" Output Folder:   {output_dir}")
    print(f" Format Mode:     {backup_format}")
    print(f"=======================================================\n")

    db_meta: dict
    if db_url.startswith("sqlite"):
        db_path_str = db_url.replace("sqlite:///", "").replace("sqlite://", "")
        db_file = Path(db_path_str) if Path(db_path_str).is_absolute() else (PROJECT_ROOT / db_path_str)
        output_file = output_dir / f"mahaveer_db_{timestamp}.sqlite.gz"
        print(f"--> Starting SQLite online transactional backup ...")
        db_meta = backup_sqlite(db_file, output_file)

    elif db_url.startswith("postgres"):
        if backup_format == "native":
            output_file = output_dir / f"mahaveer_db_{timestamp}.dump"
            db_meta = backup_postgresql_native(db_url, output_file)
        elif backup_format == "json-export":
            output_file = output_dir / f"mahaveer_export_{timestamp}.json.gz"
            print("--> Performing secondary best-effort table data export ...")
            db_meta = backup_python_json_export(db_url, output_file)
        else:
            raise ValueError(f"Unknown backup format option: {backup_format}")
    else:
        raise ValueError(f"Unsupported database URL scheme in: {masked_url}")

    # Verify backup exists and is not empty
    if not output_file.exists() or output_file.stat().st_size == 0:
        raise RuntimeError(f"Backup verification failed: File {output_file} does not exist or is 0 bytes.")

    print(f"    [OK] Backup created: {output_file.name} ({output_file.stat().st_size:,} bytes)")
    print(f"    [OK] SHA-256 Checksum: {db_meta['sha256']}")

    # 2. Write SHA-256 Integrity Manifest
    manifest = {
        "version": "2.0.0",
        "app_name": "Mahaveer Youth Club Banza API",
        "timestamp_utc": datetime.now(timezone.utc).isoformat(),
        "database": db_meta,
    }

    manifest_file = output_dir / f"manifest_{timestamp}.json"
    with open(manifest_file, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)

    print(f"    [OK] SHA-256 Integrity Manifest: {manifest_file.name}")
    print(f"\n[SUCCESS] Backup completed cleanly at: {output_dir}\n")
    return output_file


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Mahaveer Youth Club Banza - Production Database Backup Utility")
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=PROJECT_ROOT / "backups" / "database",
        help="Destination directory for database backups (default: backups/database)",
    )
    parser.add_argument(
        "--db-url",
        type=str,
        default=None,
        help="Optional database URL override (otherwise read from environment)",
    )
    parser.add_argument(
        "--format",
        choices=["native", "json-export"],
        default="native",
        help="Backup format: 'native' (pg_dump -F c / sqlite online backup) or 'json-export' (secondary best-effort fallback)",
    )

    args = parser.parse_args()
    try:
        run_backup(
            output_dir=args.output_dir,
            db_url_override=args.db_url,
            backup_format=args.format,
        )
    except Exception as e:
        print(f"\n❌ BACKUP FAILED: {str(e)}", file=sys.stderr)
        sys.exit(1)
