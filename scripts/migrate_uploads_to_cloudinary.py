#!/usr/bin/env python3
"""
One-Time Safe Production Migration Utility: Local Uploads -> Cloudinary
Project: Mahaveer Youth Club Banza V2

Features:
- Dry-run mode by default or explicit flag (--dry-run / --execute)
- Scans all database tables storing media (members, gallery_items, site_assets, activities, updates)
- Detects existing Cloudinary CDN URLs and skips them
- Checks for the physical existence of local /uploads/ files
- Uploads found local files to Cloudinary in their appropriate folders
- Updates PostgreSQL database records ONLY after successful Cloudinary upload
- If a local file is missing on disk (e.g. previously deleted by ephemeral container), keeps the DB record intact and flags as MISSING
- Handles errors on a per-file basis and continues processing remaining records
- Produces a clear migration summary at the end
- NEVER deletes local files during migration

Usage:
    python scripts/migrate_uploads_to_cloudinary.py --dry-run
    python scripts/migrate_uploads_to_cloudinary.py --execute
"""

import argparse
import os
import sys
from pathlib import Path
from typing import Dict, List, Optional, Tuple

# Ensure project root is in sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

import cloudinary
import cloudinary.uploader
import cloudinary.utils

from backend.app.core.config import settings
from backend.app.core.database import SessionLocal
from backend.app.core.logging import logger
from backend.app.models.activity import Activity
from backend.app.models.gallery import GalleryItem
from backend.app.models.member import Member
from backend.app.models.site_asset import SiteAsset
from backend.app.models.update import Update
from backend.app.services.storage import (
    CLOUDINARY_FOLDER_MAP,
    configure_cloudinary,
    get_upload_dir,
    validate_image_file,
)


class MigrationStats:
    def __init__(self):
        self.found: int = 0
        self.already_cloudinary: int = 0
        self.migrated: int = 0
        self.missing_local_files: int = 0
        self.failed: int = 0
        self.skipped_empty: int = 0

    def print_summary(self, is_dry_run: bool):
        mode_str = "[DRY RUN MODE — NO DATABASE CHANGES MADE]" if is_dry_run else "[EXECUTE MODE — DATABASE COMMITTED]"
        print("\n" + "=" * 70)
        print(f"📊 CLOUDINARY MEDIA MIGRATION SUMMARY {mode_str}")
        print("=" * 70)
        print(f"  Total Media References Inspected : {self.found}")
        print(f"  Already on Cloudinary CDN        : {self.already_cloudinary}")
        print(f"  Successfully Migrated            : {self.migrated}")
        print(f"  Missing Local Files (Orphaned)   : {self.missing_local_files}")
        print(f"  Failed Uploads / Errors          : {self.failed}")
        print(f"  Empty / Unset References         : {self.skipped_empty}")
        print("=" * 70 + "\n")


def is_cloudinary_url(url: Optional[str]) -> bool:
    if not url:
        return False
    return "cloudinary.com" in url or (url.startswith("http") and "res.cloudinary" in url)


def resolve_local_file_path(url: str, upload_root: Path) -> Optional[Path]:
    """Resolves a relative /uploads/... or uploads/... URL to an existing local file."""
    if not url:
        return None
    clean = url.strip()
    if clean.startswith("/uploads/"):
        rel = clean.replace("/uploads/", "", 1).lstrip("/")
    elif clean.startswith("uploads/"):
        rel = clean.replace("uploads/", "", 1).lstrip("/")
    else:
        rel = clean.lstrip("/")

    # Check directly inside upload_root
    target = (upload_root / rel).resolve()
    if target.exists() and target.is_file():
        return target

    # Check project root fallback
    project_target = (PROJECT_ROOT / "uploads" / rel).resolve()
    if project_target.exists() and project_target.is_file():
        return project_target

    return None


def migrate_single_file(
    local_path: Path,
    subfolder: str,
    is_dry_run: bool,
) -> Tuple[Optional[str], Optional[str]]:
    """
    Uploads a local image file to Cloudinary.
    Returns (secure_url, thumbnail_url).
    """
    if is_dry_run:
        fake_uuid = local_path.stem
        folder = CLOUDINARY_FOLDER_MAP.get(subfolder, f"mahaveer_club/{subfolder}")
        return f"https://res.cloudinary.com/{settings.CLOUDINARY_CLOUD_NAME or 'cloud'}/image/upload/{folder}/{fake_uuid}.jpg", None

    with open(local_path, "rb") as f:
        file_bytes = f.read()

    # Pre-validate file bytes
    try:
        validate_image_file(file_bytes, None)
    except Exception as e:
        logger.warning("File validation warning for [%s]: %s (proceeding with caution)", local_path, str(e))

    folder = CLOUDINARY_FOLDER_MAP.get(subfolder, f"mahaveer_club/{subfolder}")
    public_id = f"{folder}/{local_path.stem}"

    upload_res = cloudinary.uploader.upload(
        file_bytes,
        public_id=public_id,
        resource_type="image",
        overwrite=True,
        secure=True,
    )
    secure_url = upload_res.get("secure_url") or upload_res.get("url")

    thumb_url, _ = cloudinary.utils.cloudinary_url(
        public_id,
        width=600,
        height=600,
        crop="limit",
        quality="auto",
        fetch_format="auto",
        secure=True,
    )
    return secure_url, thumb_url


def run_migration(is_dry_run: bool = True):
    print("=" * 70)
    print("🚀 MAHAVEER YOUTH CLUB — CLOUDINARY MEDIA MIGRATION")
    print("=" * 70)
    print(f"Mode: {'DRY RUN (Preview Only)' if is_dry_run else 'EXECUTE (Live Upload & DB Update)'}")
    print(f"Cloudinary Configured: {settings.is_cloudinary_configured}")
    print(f"Cloud Name: {settings.CLOUDINARY_CLOUD_NAME or '(from CLOUDINARY_URL or not set)'}")
    print("=" * 70 + "\n")

    if not is_dry_run and not settings.is_cloudinary_configured:
        print("❌ ERROR: Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your environment or .env file before running with --execute.")
        sys.exit(1)

    if not is_dry_run:
        configure_cloudinary()

    upload_root = get_upload_dir()
    stats = MigrationStats()

    db = SessionLocal()
    try:
        # ---------------------------------------------------------------------
        # 1. Members
        # ---------------------------------------------------------------------
        print("📂 Checking Table: members (photo_storage_path)...")
        members = db.query(Member).all()
        for member in members:
            path = member.photo_storage_path
            if not path:
                stats.skipped_empty += 1
                continue
            stats.found += 1

            if is_cloudinary_url(path):
                stats.already_cloudinary += 1
                print(f"  [Member #{member.id} - {member.name}] Already Cloudinary -> {path}")
                continue

            local_file = resolve_local_file_path(path, upload_root)
            if not local_file:
                stats.missing_local_files += 1
                print(f"  ⚠️ [Member #{member.id} - {member.name}] Missing local file for path: {path} (Keeping DB record intact)")
                continue

            try:
                print(f"  ⬆️ [Member #{member.id} - {member.name}] Uploading {local_file.name} to Cloudinary...")
                new_url, _ = migrate_single_file(local_file, "members", is_dry_run)
                if not is_dry_run and new_url:
                    member.photo_storage_path = new_url
                    db.commit()
                stats.migrated += 1
                print(f"  ✅ [Member #{member.id}] Migrated -> {new_url}")
            except Exception as e:
                stats.failed += 1
                print(f"  ❌ [Member #{member.id}] Migration failed: {e}")

        # ---------------------------------------------------------------------
        # 2. Gallery Items
        # ---------------------------------------------------------------------
        print("\n📂 Checking Table: gallery_items (image_url & thumbnail_url)...")
        gallery_items = db.query(GalleryItem).all()
        for item in gallery_items:
            path = item.image_url
            if not path:
                stats.skipped_empty += 1
                continue
            stats.found += 1

            if is_cloudinary_url(path):
                stats.already_cloudinary += 1
                print(f"  [Gallery #{item.id} - {item.title}] Already Cloudinary -> {path}")
                continue

            local_file = resolve_local_file_path(path, upload_root)
            if not local_file:
                stats.missing_local_files += 1
                print(f"  ⚠️ [Gallery #{item.id} - {item.title}] Missing local file for path: {path} (Keeping DB record intact)")
                continue

            try:
                print(f"  ⬆️ [Gallery #{item.id} - {item.title}] Uploading {local_file.name} to Cloudinary...")
                new_url, new_thumb = migrate_single_file(local_file, "gallery", is_dry_run)
                if not is_dry_run and new_url:
                    item.image_url = new_url
                    if new_thumb:
                        item.thumbnail_url = new_thumb
                    db.commit()
                stats.migrated += 1
                print(f"  ✅ [Gallery #{item.id}] Migrated -> {new_url}")
            except Exception as e:
                stats.failed += 1
                print(f"  ❌ [Gallery #{item.id}] Migration failed: {e}")

        # ---------------------------------------------------------------------
        # 3. Site Assets (Logo & Current Ganesh)
        # ---------------------------------------------------------------------
        print("\n📂 Checking Table: site_assets (storage_path)...")
        site_assets = db.query(SiteAsset).all()
        for asset in site_assets:
            path = asset.storage_path
            if not path:
                stats.skipped_empty += 1
                continue
            stats.found += 1

            if is_cloudinary_url(path):
                stats.already_cloudinary += 1
                print(f"  [SiteAsset #{asset.id} - {asset.asset_type}] Already Cloudinary -> {path}")
                continue

            local_file = resolve_local_file_path(path, upload_root)
            if not local_file:
                stats.missing_local_files += 1
                print(f"  ⚠️ [SiteAsset #{asset.id} - {asset.asset_type}] Missing local file for path: {path} (Keeping DB record intact)")
                continue

            try:
                print(f"  ⬆️ [SiteAsset #{asset.id} - {asset.asset_type}] Uploading {local_file.name} to Cloudinary...")
                new_url, _ = migrate_single_file(local_file, "assets", is_dry_run)
                if not is_dry_run and new_url:
                    asset.storage_path = new_url
                    db.commit()
                stats.migrated += 1
                print(f"  ✅ [SiteAsset #{asset.id}] Migrated -> {new_url}")
            except Exception as e:
                stats.failed += 1
                print(f"  ❌ [SiteAsset #{asset.id}] Migration failed: {e}")

        # ---------------------------------------------------------------------
        # 4. Activities
        # ---------------------------------------------------------------------
        print("\n📂 Checking Table: activities (image)...")
        activities = db.query(Activity).all()
        for act in activities:
            path = act.image
            if not path:
                stats.skipped_empty += 1
                continue
            stats.found += 1

            if is_cloudinary_url(path):
                stats.already_cloudinary += 1
                print(f"  [Activity #{act.id} - {act.title}] Already Cloudinary -> {path}")
                continue

            local_file = resolve_local_file_path(path, upload_root)
            if not local_file:
                stats.missing_local_files += 1
                print(f"  ⚠️ [Activity #{act.id} - {act.title}] Missing local file for path: {path} (Keeping DB record intact)")
                continue

            try:
                print(f"  ⬆️ [Activity #{act.id} - {act.title}] Uploading {local_file.name} to Cloudinary...")
                new_url, _ = migrate_single_file(local_file, "activities", is_dry_run)
                if not is_dry_run and new_url:
                    act.image = new_url
                    db.commit()
                stats.migrated += 1
                print(f"  ✅ [Activity #{act.id}] Migrated -> {new_url}")
            except Exception as e:
                stats.failed += 1
                print(f"  ❌ [Activity #{act.id}] Migration failed: {e}")

        # ---------------------------------------------------------------------
        # 5. Updates
        # ---------------------------------------------------------------------
        print("\n📂 Checking Table: updates (featured_image)...")
        updates = db.query(Update).all()
        for upd in updates:
            path = upd.featured_image
            if not path:
                stats.skipped_empty += 1
                continue
            stats.found += 1

            if is_cloudinary_url(path):
                stats.already_cloudinary += 1
                print(f"  [Update #{upd.id} - {upd.title}] Already Cloudinary -> {path}")
                continue

            local_file = resolve_local_file_path(path, upload_root)
            if not local_file:
                stats.missing_local_files += 1
                print(f"  ⚠️ [Update #{upd.id} - {upd.title}] Missing local file for path: {path} (Keeping DB record intact)")
                continue

            try:
                print(f"  ⬆️ [Update #{upd.id} - {upd.title}] Uploading {local_file.name} to Cloudinary...")
                new_url, _ = migrate_single_file(local_file, "updates", is_dry_run)
                if not is_dry_run and new_url:
                    upd.featured_image = new_url
                    db.commit()
                stats.migrated += 1
                print(f"  ✅ [Update #{upd.id}] Migrated -> {new_url}")
            except Exception as e:
                stats.failed += 1
                print(f"  ❌ [Update #{upd.id}] Migration failed: {e}")

    finally:
        db.close()

    stats.print_summary(is_dry_run)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Migrate local upload files to Cloudinary CDN")
    parser.add_argument(
        "--execute",
        action="store_true",
        help="Execute the live migration (uploads files and commits database changes). Default is dry-run.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Run in preview/dry-run mode without modifying any database records or performing real uploads.",
    )

    args = parser.parse_args()
    is_dry = not args.execute
    run_migration(is_dry_run=is_dry)
