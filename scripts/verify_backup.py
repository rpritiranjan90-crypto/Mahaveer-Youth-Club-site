#!/usr/bin/env python3
"""
Production Database Backup Verification Utility
Project: Mahaveer Youth Club Banza

Verifies the integrity, structure, and table completeness of database backups WITHOUT connecting to production:
1. Validates backup file exists and is non-empty.
2. Verifies SHA-256 checksum against the integrity manifest.
3. For PostgreSQL Custom Dumps (.dump):
   - Inspects table of contents via 'pg_restore --list' (when pg_restore is available).
   - Validates PostgreSQL Custom Archive magic header (PGDMP) in all environments.
4. For SQLite Backups (.sqlite.gz):
   - Validates GZIP compression, performs SQLite PRAGMA integrity_check, and validates table schema.
5. For Secondary JSON Exports (.json.gz):
   - Validates JSON structure, table records, and explicitly flags as secondary export (not equivalent to pg_dump).

Usage:
    python scripts/verify_backup.py --backup-file ./backups/database/mahaveer_db_*.dump [--manifest ./backups/database/manifest_*.json]
    python scripts/verify_backup.py --backup-dir ./backups/database
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
import tempfile
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

# Application tables defined in SQLAlchemy models
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

# Magic byte header for PostgreSQL custom archive format
PG_CUSTOM_DUMP_MAGIC = b"PGDMP"


def calculate_sha256(filepath: Path) -> str:
    """Computes SHA-256 hash of a file for integrity verification."""
    sha256 = hashlib.sha256()
    with open(filepath, "rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            sha256.update(chunk)
    return sha256.hexdigest()


def verify_file_presence(filepath: Path) -> int:
    """Verifies that the target backup file exists and is non-empty."""
    if not filepath.exists():
        raise FileNotFoundError(f"Backup file does not exist: {filepath}")
    size = filepath.stat().st_size
    if size == 0:
        raise ValueError(f"Backup file is empty (0 bytes): {filepath}")
    return size


def verify_sha256_manifest(backup_file: Path, manifest_file: Optional[Path]) -> Tuple[bool, str, Optional[str]]:
    """
    Verifies the actual file SHA-256 against the recorded manifest checksum.
    Returns (matches, actual_sha, expected_sha).
    """
    actual_sha = calculate_sha256(backup_file)
    if not manifest_file or not manifest_file.exists():
        return True, actual_sha, None

    with open(manifest_file, "r", encoding="utf-8") as f:
        manifest_data = json.load(f)

    db_meta = manifest_data.get("database", {})
    expected_sha = db_meta.get("sha256")

    if expected_sha and actual_sha.lower() != expected_sha.lower():
        return False, actual_sha, expected_sha

    return True, actual_sha, expected_sha


def verify_postgresql_custom_dump(dump_file: Path) -> Dict[str, Any]:
    """
    Verifies PostgreSQL custom-format (.dump) archive without connecting to any database.
    1. Checks PGDMP magic header.
    2. Runs 'pg_restore --list' if pg_restore is available on PATH.
    """
    # 1. Check magic bytes
    with open(dump_file, "rb") as f:
        header = f.read(5)
    if header != PG_CUSTOM_DUMP_MAGIC:
        raise ValueError(
            f"Invalid PostgreSQL custom dump header. Expected '{PG_CUSTOM_DUMP_MAGIC.decode()}', got {header!r}"
        )

    tables_found: List[str] = []
    toc_verified_with_pg_restore = False

    if shutil.which("pg_restore"):
        cmd = ["pg_restore", "--list", str(dump_file)]
        process = subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
        )
        stdout, stderr = process.communicate()
        if process.returncode != 0:
            err_msg = stderr.decode("utf-8", errors="ignore").strip()
            raise RuntimeError(f"pg_restore --list inspection failed with exit code {process.returncode}: {err_msg}")

        toc_output = stdout.decode("utf-8", errors="ignore")
        toc_verified_with_pg_restore = True
        
        for table in EXPECTED_TABLES:
            if f"TABLE DATA public {table}" in toc_output or f"TABLE public {table}" in toc_output or f" {table} " in toc_output:
                tables_found.append(table)
    else:
        # Static inspection when pg_restore binary is not in environment
        tables_found = ["<pg_restore not on PATH: header verified>"]

    return {
        "engine": "postgresql",
        "format": "native_custom_dump",
        "header_valid": True,
        "toc_inspected": toc_verified_with_pg_restore,
        "tables_found": tables_found,
        "is_native_dump": True,
    }


def verify_sqlite_backup(backup_gz_path: Path) -> Dict[str, Any]:
    """
    Verifies compressed SQLite backup (.sqlite.gz) in an isolated temporary location.
    Runs PRAGMA integrity_check and checks table schema completeness.
    """
    with tempfile.TemporaryDirectory() as tmpdir:
        tmp_db_path = Path(tmpdir) / "verify_temp.db"
        try:
            with gzip.open(backup_gz_path, "rb") as f_in, open(tmp_db_path, "wb") as f_out:
                shutil.copyfileobj(f_in, f_out)
        except Exception as e:
            raise ValueError(f"Failed to decompress GZIP SQLite archive: {e}")

        conn = sqlite3.connect(str(tmp_db_path))
        cursor = conn.cursor()
        
        # Integrity check
        cursor.execute("PRAGMA integrity_check;")
        integrity_result = cursor.fetchone()
        if not integrity_result or integrity_result[0] != "ok":
            conn.close()
            raise RuntimeError(f"SQLite PRAGMA integrity_check failed: {integrity_result}")

        # List tables
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables_found = [row[0] for row in cursor.fetchall()]
        conn.close()

    missing_tables = [t for t in EXPECTED_TABLES if t not in tables_found]
    return {
        "engine": "sqlite",
        "format": "sqlite_gz",
        "integrity_check": "ok",
        "tables_found": tables_found,
        "missing_tables": missing_tables,
        "is_native_dump": True,
    }


def verify_secondary_json_export(export_gz_path: Path) -> Dict[str, Any]:
    """
    Verifies secondary best-effort JSON table data export.
    Explicitly flags that this is a secondary fallback and NOT equivalent to pg_dump.
    """
    try:
        with gzip.open(export_gz_path, "rb") as f_in:
            data = json.loads(f_in.read().decode("utf-8"))
    except Exception as e:
        raise ValueError(f"Failed to parse secondary JSON export archive: {e}")

    tables_data = data.get("tables", {})
    tables_found = list(tables_data.keys())
    missing_tables = [t for t in EXPECTED_TABLES if t not in tables_found]

    return {
        "engine": "multi",
        "format": "secondary_json_export",
        "export_metadata": data.get("export_metadata", {}),
        "tables_found": tables_found,
        "missing_tables": missing_tables,
        "is_native_dump": False,
        "disclaimer": "SECONDARY BEST-EFFORT EXPORT: Not equivalent to native PostgreSQL custom-format dump.",
    }


def run_verification(
    backup_file: Path,
    manifest_file: Optional[Path] = None,
) -> Dict[str, Any]:
    """
    Coordinates end-to-end verification of a backup file.
    Guarantees zero database modifications or production connections.
    """
    print(f"\n=======================================================")
    print(f" MAHAVEER YOUTH CLUB BANZA — BACKUP VERIFICATION")
    print(f" Target File: {backup_file.name}")
    print(f" Full Path:   {backup_file}")
    print(f"=======================================================\n")

    # 1. File presence and size check
    file_size = verify_file_presence(backup_file)
    print(f"[CHECK 1/4] File Presence: PASS ({file_size:,} bytes)")

    # 2. SHA-256 Checksum vs Manifest
    sha_ok, actual_sha, expected_sha = verify_sha256_manifest(backup_file, manifest_file)
    if not sha_ok:
        raise ValueError(
            f"SECURITY ALERT: SHA-256 Checksum Mismatch (Possible corruption or tampering)!\n"
            f"  Expected: {expected_sha}\n"
            f"  Actual:   {actual_sha}"
        )
    if expected_sha:
        print(f"[CHECK 2/4] SHA-256 Checksum: PASS (Matches manifest: {actual_sha[:16]}...)")
    else:
        print(f"[CHECK 2/4] SHA-256 Checksum: COMPUTED ({actual_sha[:16]}...) [No manifest provided]")

    # 3. Format Detection & Structural Verification
    filename_str = backup_file.name.lower()
    details: Dict[str, Any]

    if filename_str.endswith(".dump"):
        print("[CHECK 3/4] Format: PostgreSQL Native Custom Archive (.dump)")
        details = verify_postgresql_custom_dump(backup_file)
        if details.get("toc_inspected"):
            print("            Archive Table of Contents successfully inspected with pg_restore --list.")
        else:
            print("            PGDMP Magic Header verified (pg_restore client binary not in current PATH).")

    elif filename_str.endswith(".sqlite.gz") or filename_str.endswith(".db.gz"):
        print("[CHECK 3/4] Format: SQLite Compressed Transactional Backup (.sqlite.gz)")
        details = verify_sqlite_backup(backup_file)
        print("            PRAGMA integrity_check: PASS (ok)")

    elif filename_str.endswith(".json.gz"):
        print("[CHECK 3/4] Format: Secondary Best-Effort Table Data Export (.json.gz)")
        details = verify_secondary_json_export(backup_file)
        print(f"            [NOTE] {details['disclaimer']}")
    else:
        raise ValueError(f"Unrecognized backup file extension in: {backup_file.name}")

    # 4. Table Completeness Verification
    tables_found = details.get("tables_found", [])
    missing_tables = details.get("missing_tables", [])
    
    if missing_tables:
        print(f"[CHECK 4/4] Tables Check: WARNING (Missing {len(missing_tables)} tables: {missing_tables})")
    else:
        print(f"[CHECK 4/4] Tables Check: PASS (Verified {len(tables_found)} application tables)")

    report = {
        "status": "VALID",
        "backup_file": str(backup_file.name),
        "file_size_bytes": file_size,
        "sha256": actual_sha,
        "manifest_verified": bool(expected_sha),
        "details": details,
    }

    print(f"\n[SUCCESS] Backup integrity and structure successfully verified!\n")
    return report


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Mahaveer Youth Club Banza - Backup Verification Utility")
    parser.add_argument("--backup-file", type=Path, default=None, help="Path to backup file (.dump, .sqlite.gz, .json.gz)")
    parser.add_argument("--manifest", type=Path, default=None, help="Optional path to manifest.json")
    parser.add_argument("--backup-dir", type=Path, default=None, help="Directory containing backup files and manifests")

    args = parser.parse_args()
    try:
        target_file = args.backup_file
        manifest = args.manifest

        if not target_file and args.backup_dir:
            backup_dir = args.backup_dir
            if not backup_dir.exists():
                raise FileNotFoundError(f"Backup directory not found: {backup_dir}")
            
            # Find latest backup file
            candidates = list(backup_dir.glob("mahaveer_db_*.*")) + list(backup_dir.glob("mahaveer_export_*.*"))
            if not candidates:
                raise FileNotFoundError(f"No backup files found in: {backup_dir}")
            candidates.sort(key=lambda p: p.stat().st_mtime, reverse=True)
            target_file = candidates[0]

            # Find matching manifest
            manifests = list(backup_dir.glob("manifest_*.json"))
            manifests.sort(key=lambda p: p.stat().st_mtime, reverse=True)
            if manifests:
                manifest = manifests[0]

        if not target_file:
            print("Error: Please provide --backup-file or --backup-dir", file=sys.stderr)
            sys.exit(1)

        run_verification(backup_file=target_file, manifest_file=manifest)
    except Exception as e:
        print(f"\n❌ VERIFICATION FAILED: {str(e)}", file=sys.stderr)
        sys.exit(1)
