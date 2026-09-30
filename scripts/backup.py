#!/usr/bin/env python3
"""
Production Database & Media Backup Utility
Project: Mahaveer Youth Club Banza V2

Backs up:
1. Database (PostgreSQL via pg_dump or SQLite via online transactional backup API)
2. Media Uploads (uploads/ directory tar.gz archive)
3. Generates a signed SHA-256 manifest JSON with file metadata and table counts.

Usage:
    python scripts/backup.py [--output-dir ./backups] [--skip-media] [--db-url URL]
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
import tarfile
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlparse

# Ensure project root is in sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from backend.app.core.config import settings


def calculate_sha256(filepath: Path) -> str:
    """Computes SHA-256 hash of a file for integrity verification."""
    sha256 = hashlib.sha256()
    with open(filepath, "rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            sha256.update(chunk)
    return sha256.hexdigest()


def backup_sqlite(db_path: Path, output_gz_path: Path) -> dict:
    """
    Performs a consistent online transactional backup of SQLite using Python's backup API.
    """
    if not db_path.exists():
        raise FileNotFoundError(f"SQLite database file not found at: {db_path}")

    temp_raw_backup = output_gz_path.with_suffix(".tmp")
    
    # 1. Connect and perform online backup to temporary file
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
            cursor.execute(f"SELECT COUNT(*) FROM \"{table}\";")
            table_counts[table] = cursor.fetchone()[0]
        except Exception:
            table_counts[table] = 0
            
    dest_conn.close()
    src_conn.close()

    # 2. Compress to .gz
    with open(temp_raw_backup, "rb") as f_in, gzip.open(output_gz_path, "wb", compresslevel=9) as f_out:
        shutil.copyfileobj(f_in, f_out)

    if temp_raw_backup.exists():
        temp_raw_backup.unlink()

    return {
        "engine": "sqlite",
        "original_file": str(db_path.name),
        "compressed_size_bytes": output_gz_path.stat().st_size,
        "sha256": calculate_sha256(output_gz_path),
        "table_counts": table_counts,
    }


def backup_postgresql(db_url: str, output_gz_path: Path) -> dict:
    """
    Performs a pg_dump backup of a PostgreSQL database with safe credential handling.
    """
    parsed = urlparse(db_url)
    username = parsed.username or "postgres"
    password = parsed.password or ""
    hostname = parsed.hostname or "localhost"
    port = str(parsed.port or 5432)
    database = parsed.path.lstrip("/")

    env = os.environ.copy()
    if password:
        env["PGPASSWORD"] = password

    cmd = [
        "pg_dump",
        "-h", hostname,
        "-p", port,
        "-U", username,
        "-d", database,
        "--clean",
        "--if-exists",
        "--no-owner",
        "--no-privileges",
    ]

    try:
        process = subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            env=env,
        )
        stdout, stderr = process.communicate()
        if process.returncode != 0:
            err_msg = stderr.decode("utf-8", errors="ignore").strip()
            raise RuntimeError(f"pg_dump failed with exit code {process.returncode}: {err_msg}")

        with gzip.open(output_gz_path, "wb", compresslevel=9) as f_out:
            f_out.write(stdout)

    except FileNotFoundError:
        raise RuntimeError("pg_dump executable not found in system PATH. Ensure PostgreSQL client tools are installed.")

    return {
        "engine": "postgresql",
        "database": database,
        "host": hostname,
        "port": port,
        "compressed_size_bytes": output_gz_path.stat().st_size,
        "sha256": calculate_sha256(output_gz_path),
    }


def backup_media(upload_dir: Path, output_tar_gz_path: Path) -> dict:
    """
    Creates a compressed tar.gz archive of the persistent media uploads directory.
    """
    if not upload_dir.exists():
        upload_dir.mkdir(parents=True, exist_ok=True)

    file_count = 0
    total_uncompressed_bytes = 0

    with tarfile.open(output_tar_gz_path, "w:gz", compresslevel=9) as tar:
        for root, _, files in os.walk(upload_dir):
            for file in files:
                file_path = Path(root) / file
                if file.startswith(".") or file.endswith(".tmp"):
                    continue
                arcname = file_path.relative_to(upload_dir.parent)
                tar.add(file_path, arcname=str(arcname))
                file_count += 1
                total_uncompressed_bytes += file_path.stat().st_size

    return {
        "file_count": file_count,
        "uncompressed_size_bytes": total_uncompressed_bytes,
        "compressed_size_bytes": output_tar_gz_path.stat().st_size,
        "sha256": calculate_sha256(output_tar_gz_path),
    }


def run_backup(output_dir: Path, skip_media: bool = False, db_url_override: str = None) -> Path:
    """
    Coordinates end-to-end database and media backup.
    """
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    backup_target_dir = output_dir / f"backup_{timestamp}"
    backup_target_dir.mkdir(parents=True, exist_ok=True)

    db_url = db_url_override or settings.DATABASE_URL
    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Starting backup in: {backup_target_dir}")

    # 1. Database Backup
    db_backup_filename = f"db_backup_{timestamp}.sql.gz"
    if db_url.startswith("sqlite"):
        db_path_str = db_url.replace("sqlite:///", "").replace("sqlite://", "")
        # Resolve relative SQLite path
        db_file = Path(db_path_str) if Path(db_path_str).is_absolute() else (PROJECT_ROOT / db_path_str)
        db_backup_file = backup_target_dir / f"db_backup_{timestamp}.sqlite.gz"
        print(f"--> Backing up SQLite database: {db_file.name} ...")
        db_meta = backup_sqlite(db_file, db_backup_file)
    elif db_url.startswith("postgres"):
        db_backup_file = backup_target_dir / db_backup_filename
        print("--> Backing up PostgreSQL database ...")
        db_meta = backup_postgresql(db_url, db_backup_file)
    else:
        raise ValueError(f"Unsupported database scheme in URL: {db_url}")

    print(f"    [OK] Database backup completed ({db_meta['compressed_size_bytes']:,} bytes)")

    # 2. Media Backup
    media_meta = None
    if not skip_media:
        upload_path = PROJECT_ROOT / settings.UPLOAD_DIR
        media_backup_file = backup_target_dir / f"media_backup_{timestamp}.tar.gz"
        print(f"--> Backing up media assets from: {upload_path} ...")
        media_meta = backup_media(upload_path, media_backup_file)
        print(f"    [OK] Media backup completed: {media_meta['file_count']} files ({media_meta['compressed_size_bytes']:,} bytes)")
    else:
        print("--> Skipping media backup (--skip-media set)")

    # 3. Write Manifest
    manifest = {
        "version": "2.0.0",
        "app_name": settings.APP_NAME,
        "timestamp_utc": datetime.now(timezone.utc).isoformat(),
        "environment": settings.APP_ENV,
        "database": db_meta,
        "media": media_meta,
    }

    manifest_file = backup_target_dir / "manifest.json"
    with open(manifest_file, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)

    print(f"    [OK] Manifest generated: {manifest_file.name}")
    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Backup successfully created at: {backup_target_dir}\n")
    return backup_target_dir


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Mahaveer Youth Club Banza V2 - Backup Tool")
    parser.add_argument("--output-dir", type=Path, default=PROJECT_ROOT / "backups", help="Target backup directory")
    parser.add_argument("--skip-media", action="store_true", help="Skip media files backup")
    parser.add_argument("--db-url", type=str, default=None, help="Override database URL for backup")

    args = parser.parse_args()
    try:
        run_backup(output_dir=args.output_dir, skip_media=args.skip_media, db_url_override=args.db_url)
    except Exception as e:
        print(f"ERROR: Backup failed: {str(e)}", file=sys.stderr)
        sys.exit(1)
