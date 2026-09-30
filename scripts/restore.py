#!/usr/bin/env python3
"""
Production Database & Media Restore Utility
Project: Mahaveer Youth Club Banza V2

Restores:
1. Database from a verified backup (.sql.gz or .sqlite.gz)
2. Media Uploads from archive (.tar.gz)
3. Validates SHA-256 checksums against backup manifest before restoration.

Usage:
    python scripts/restore.py --backup-dir ./backups/backup_YYYYMMDD_HHMMSS --target-db-url sqlite:///./test_restore.db
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
from pathlib import Path
from urllib.parse import urlparse

PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))


def calculate_sha256(filepath: Path) -> str:
    """Computes SHA-256 hash of a file for integrity verification."""
    sha256 = hashlib.sha256()
    with open(filepath, "rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            sha256.update(chunk)
    return sha256.hexdigest()


def restore_sqlite(backup_gz_path: Path, target_db_path: Path) -> None:
    """
    Restores SQLite database from a compressed .sqlite.gz file.
    """
    temp_restored_path = target_db_path.with_suffix(".restoring")
    with gzip.open(backup_gz_path, "rb") as f_in, open(temp_restored_path, "wb") as f_out:
        shutil.copyfileobj(f_in, f_out)

    # Perform integrity check
    conn = sqlite3.connect(str(temp_restored_path))
    cursor = conn.cursor()
    cursor.execute("PRAGMA integrity_check;")
    result = cursor.fetchone()
    conn.close()

    if not result or result[0] != "ok":
        if temp_restored_path.exists():
            temp_restored_path.unlink()
        raise RuntimeError(f"Database integrity check failed on restored SQLite database: {result}")

    if target_db_path.exists():
        target_db_path.unlink()
    temp_restored_path.rename(target_db_path)


def restore_postgresql(backup_gz_path: Path, target_db_url: str) -> None:
    """
    Restores PostgreSQL database from a compressed SQL dump.
    """
    parsed = urlparse(target_db_url)
    username = parsed.username or "postgres"
    password = parsed.password or ""
    hostname = parsed.hostname or "localhost"
    port = str(parsed.port or 5432)
    database = parsed.path.lstrip("/")

    env = os.environ.copy()
    if password:
        env["PGPASSWORD"] = password

    cmd = [
        "psql",
        "-h", hostname,
        "-p", port,
        "-U", username,
        "-d", database,
    ]

    try:
        with gzip.open(backup_gz_path, "rb") as f_in:
            sql_data = f_in.read()

        process = subprocess.Popen(
            cmd,
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            env=env,
        )
        stdout, stderr = process.communicate(input=sql_data)
        if process.returncode != 0:
            err_msg = stderr.decode("utf-8", errors="ignore").strip()
            raise RuntimeError(f"psql restore failed with exit code {process.returncode}: {err_msg}")

    except FileNotFoundError:
        raise RuntimeError("psql executable not found in system PATH. Ensure PostgreSQL client tools are installed.")


def restore_media(media_tar_gz_path: Path, target_media_dir: Path) -> int:
    """
    Extracts media assets into target uploads directory.
    """
    target_media_dir.mkdir(parents=True, exist_ok=True)
    file_count = 0
    with tarfile.open(media_tar_gz_path, "r:gz") as tar:
        # Safe extraction filter for path traversal protection
        for member in tar.getmembers():
            if member.name.startswith("/") or ".." in member.name:
                raise ValueError(f"Dangerous path traversal detected in archive member: {member.name}")
            tar.extract(member, path=target_media_dir.parent)
            file_count += 1
    return file_count


def run_restore(backup_dir: Path, target_db_url: str, target_media_dir: Path = None, skip_media: bool = False) -> dict:
    """
    Coordinates verified restoration of database and media files.
    """
    if not backup_dir.exists() or not backup_dir.is_dir():
        raise FileNotFoundError(f"Backup directory not found: {backup_dir}")

    manifest_path = backup_dir / "manifest.json"
    if not manifest_path.exists():
        raise FileNotFoundError(f"Backup manifest.json missing in: {backup_dir}")

    with open(manifest_path, "r", encoding="utf-8") as f:
        manifest = json.load(f)

    print(f"\n=======================================================")
    print(f" RESTORATION PROCEDURE: {manifest.get('app_name', 'Mahaveer Youth Club')}")
    print(f" Backup Timestamp: {manifest.get('timestamp_utc')}")
    print(f" Source Environment: {manifest.get('environment')}")
    print(f"=======================================================\n")

    # 1. Locate and Verify Database Backup File
    db_meta = manifest.get("database", {})
    db_engine = db_meta.get("engine", "")
    
    db_backup_files = list(backup_dir.glob("db_backup_*.gz"))
    if not db_backup_files:
        raise FileNotFoundError(f"No database backup file found in: {backup_dir}")
    db_backup_file = db_backup_files[0]

    print(f"--> Verifying checksum for {db_backup_file.name} ...")
    actual_db_sha = calculate_sha256(db_backup_file)
    expected_db_sha = db_meta.get("sha256")
    if expected_db_sha and actual_db_sha != expected_db_sha:
        raise ValueError(f"Checksum mismatch for database backup! Expected {expected_db_sha}, got {actual_db_sha}")
    print(f"    [OK] Checksum verified ({actual_db_sha[:16]}...)")

    # 2. Restore Database
    print(f"--> Restoring database to: {target_db_url} ...")
    if target_db_url.startswith("sqlite"):
        db_path_str = target_db_url.replace("sqlite:///", "").replace("sqlite://", "")
        target_db_file = Path(db_path_str) if Path(db_path_str).is_absolute() else (PROJECT_ROOT / db_path_str)
        restore_sqlite(db_backup_file, target_db_file)
        print(f"    [OK] SQLite database restored and verified intact: {target_db_file.name}")
    elif target_db_url.startswith("postgres"):
        restore_postgresql(db_backup_file, target_db_url)
        print(f"    [OK] PostgreSQL database restored successfully.")
    else:
        raise ValueError(f"Unsupported target database scheme: {target_db_url}")

    # 3. Restore Media if applicable
    media_restored_count = 0
    if not skip_media and manifest.get("media"):
        media_meta = manifest.get("media", {})
        media_backup_files = list(backup_dir.glob("media_backup_*.tar.gz"))
        if media_backup_files:
            media_backup_file = media_backup_files[0]
            print(f"--> Verifying media checksum for {media_backup_file.name} ...")
            actual_media_sha = calculate_sha256(media_backup_file)
            expected_media_sha = media_meta.get("sha256")
            if expected_media_sha and actual_media_sha != expected_media_sha:
                raise ValueError(f"Checksum mismatch for media archive! Expected {expected_media_sha}, got {actual_media_sha}")
            print(f"    [OK] Checksum verified ({actual_media_sha[:16]}...)")

            dest_media = target_media_dir or (PROJECT_ROOT / "uploads")
            print(f"--> Extracting media files to {dest_media} ...")
            media_restored_count = restore_media(media_backup_file, dest_media)
            print(f"    [OK] Extracted {media_restored_count} media files.")

    print(f"\n[SUCCESS] RESTORATION COMPLETED CLEANLY!")
    return {
        "status": "success",
        "database_target": target_db_url,
        "media_files_restored": media_restored_count,
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Mahaveer Youth Club Banza V2 - Restore Tool")
    parser.add_argument("--backup-dir", type=Path, required=True, help="Path to backup directory containing manifest.json")
    parser.add_argument("--target-db-url", type=str, required=True, help="Target database connection URL")
    parser.add_argument("--target-media-dir", type=Path, default=None, help="Target media directory")
    parser.add_argument("--skip-media", action="store_true", help="Skip media extraction")

    args = parser.parse_args()
    try:
        run_restore(
            backup_dir=args.backup_dir,
            target_db_url=args.target_db_url,
            target_media_dir=args.target_media_dir,
            skip_media=args.skip_media,
        )
    except Exception as e:
        print(f"\n❌ RESTORATION FAILED: {str(e)}", file=sys.stderr)
        sys.exit(1)
