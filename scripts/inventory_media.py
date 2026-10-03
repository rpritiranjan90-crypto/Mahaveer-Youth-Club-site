#!/usr/bin/env python3
"""
Cloudinary Media Asset Inventory Utility (READ-ONLY)
Project: Mahaveer Youth Club Banza

Performs a read-only scan of media references across database entities:
- Extracts public IDs and HTTPS delivery URLs
- Correlates assets with Gallery, Members, Site Assets, Activities, and Updates
- Reports dimension metadata, file sizes, and MIME types
- Generates a local JSON inventory report WITHOUT modifying any production data or deleting any assets

Usage:
    python scripts/inventory_media.py [--db-url URL] [--output ./backups/media_inventory.json]
"""

import argparse
import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List
from urllib.parse import urlparse

PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from backend.app.services.storage import extract_cloudinary_public_id


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


def scan_media_inventory(db_url: str) -> Dict[str, Any]:
    """
    Executes a read-only query across all media-referencing tables.
    Guarantees ZERO modifications to database or Cloudinary assets.
    """
    from sqlalchemy import create_engine, text
    normalized_url = db_url.replace("postgres://", "postgresql://", 1) if db_url.startswith("postgres://") else db_url
    engine = create_engine(normalized_url, pool_pre_ping=True)

    inventory: Dict[str, List[Dict[str, Any]]] = {
        "gallery_items": [],
        "members": [],
        "site_assets": [],
        "activities": [],
        "updates": [],
    }
    stats = {
        "total_media_records": 0,
        "cloudinary_hosted_count": 0,
        "local_hosted_count": 0,
    }

    with engine.connect() as conn:
        # 1. Gallery Items
        try:
            res = conn.execute(text("SELECT id, title, image_url, thumbnail_url, year, category, status FROM gallery_items"))
            for row in res.fetchall():
                url = row[2]
                public_id = extract_cloudinary_public_id(url)
                is_cloud = bool(public_id or "cloudinary.com" in (url or ""))
                inventory["gallery_items"].append({
                    "id": row[0],
                    "title": row[1],
                    "image_url": url,
                    "thumbnail_url": row[3],
                    "year": row[4],
                    "category": row[5],
                    "status": row[6],
                    "public_id": public_id,
                    "is_cloudinary": is_cloud,
                })
                stats["total_media_records"] += 1
                if is_cloud:
                    stats["cloudinary_hosted_count"] += 1
                else:
                    stats["local_hosted_count"] += 1
        except Exception as e:
            print(f"    [WARN] Gallery query skipped: {e}", file=sys.stderr)

        # 2. Members
        try:
            res = conn.execute(text(
                "SELECT id, name, designation, photo_storage_path, photo_original_filename, photo_mime_type, photo_file_size, is_active FROM members"
            ))
            for row in res.fetchall():
                url = row[3]
                if url:
                    public_id = extract_cloudinary_public_id(url)
                    is_cloud = bool(public_id or "cloudinary.com" in url)
                    inventory["members"].append({
                        "id": row[0],
                        "name": row[1],
                        "designation": row[2],
                        "photo_storage_path": url,
                        "original_filename": row[4],
                        "mime_type": row[5],
                        "file_size_bytes": row[6],
                        "is_active": row[7],
                        "public_id": public_id,
                        "is_cloudinary": is_cloud,
                    })
                    stats["total_media_records"] += 1
                    if is_cloud:
                        stats["cloudinary_hosted_count"] += 1
                    else:
                        stats["local_hosted_count"] += 1
        except Exception as e:
            print(f"    [WARN] Members query skipped: {e}", file=sys.stderr)

        # 3. Site Assets
        try:
            res = conn.execute(text(
                "SELECT id, asset_type, year, storage_path, original_filename, mime_type, file_size, width, height, is_active FROM site_assets"
            ))
            for row in res.fetchall():
                url = row[3]
                public_id = extract_cloudinary_public_id(url)
                is_cloud = bool(public_id or "cloudinary.com" in (url or ""))
                inventory["site_assets"].append({
                    "id": row[0],
                    "asset_type": row[1],
                    "year": row[2],
                    "storage_path": url,
                    "original_filename": row[4],
                    "mime_type": row[5],
                    "file_size_bytes": row[6],
                    "width": row[7],
                    "height": row[8],
                    "is_active": row[9],
                    "public_id": public_id,
                    "is_cloudinary": is_cloud,
                })
                stats["total_media_records"] += 1
                if is_cloud:
                    stats["cloudinary_hosted_count"] += 1
                else:
                    stats["local_hosted_count"] += 1
        except Exception as e:
            print(f"    [WARN] SiteAssets query skipped: {e}", file=sys.stderr)

        # 4. Activities
        try:
            res = conn.execute(text("SELECT id, title, slug, image, category, status FROM activities WHERE image IS NOT NULL"))
            for row in res.fetchall():
                url = row[3]
                if url:
                    public_id = extract_cloudinary_public_id(url)
                    is_cloud = bool(public_id or "cloudinary.com" in url)
                    inventory["activities"].append({
                        "id": row[0],
                        "title": row[1],
                        "slug": row[2],
                        "image": url,
                        "category": row[4],
                        "status": row[5],
                        "public_id": public_id,
                        "is_cloudinary": is_cloud,
                    })
                    stats["total_media_records"] += 1
                    if is_cloud:
                        stats["cloudinary_hosted_count"] += 1
                    else:
                        stats["local_hosted_count"] += 1
        except Exception as e:
            print(f"    [WARN] Activities query skipped: {e}", file=sys.stderr)

        # 5. Updates
        try:
            res = conn.execute(text("SELECT id, title, slug, featured_image, category, status FROM updates WHERE featured_image IS NOT NULL"))
            for row in res.fetchall():
                url = row[3]
                if url:
                    public_id = extract_cloudinary_public_id(url)
                    is_cloud = bool(public_id or "cloudinary.com" in url)
                    inventory["updates"].append({
                        "id": row[0],
                        "title": row[1],
                        "slug": row[2],
                        "featured_image": url,
                        "category": row[4],
                        "status": row[5],
                        "public_id": public_id,
                        "is_cloudinary": is_cloud,
                    })
                    stats["total_media_records"] += 1
                    if is_cloud:
                        stats["cloudinary_hosted_count"] += 1
                    else:
                        stats["local_hosted_count"] += 1
        except Exception as e:
            print(f"    [WARN] Updates query skipped: {e}", file=sys.stderr)

    engine.dispose()

    return {
        "report_metadata": {
            "app_name": "Mahaveer Youth Club Banza API",
            "timestamp_utc": datetime.now(timezone.utc).isoformat(),
            "target_database": mask_db_url(db_url),
            "scan_mode": "READ_ONLY",
        },
        "stats": stats,
        "inventory": inventory,
    }


def run_inventory_report(db_url_override: str = None, output_path: Path = None) -> Path:
    """Coordinates read-only inventory scan and writes JSON report."""
    db_url = db_url_override or os.environ.get("DATABASE_URL")
    if not db_url:
        try:
            from backend.app.core.config import settings
            db_url = settings.DATABASE_URL
        except Exception:
            pass

    if not db_url:
        raise ValueError("DATABASE_URL is missing. Please set DATABASE_URL or pass --db-url.")

    output_file = output_path or (PROJECT_ROOT / "backups" / "media_inventory.json")
    output_file.parent.mkdir(parents=True, exist_ok=True)

    print(f"\n=======================================================")
    print(f" MAHAVEER YOUTH CLUB BANZA — MEDIA INVENTORY (READ-ONLY)")
    print(f" Source: {mask_db_url(db_url)}")
    print(f" Target: {output_file}")
    print(f"=======================================================\n")

    report = scan_media_inventory(db_url)
    stats = report["stats"]

    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)

    print(f"--> Inventory Scan Complete:")
    print(f"    Total Media Records:      {stats['total_media_records']}")
    print(f"    Cloudinary CDN Hosted:    {stats['cloudinary_hosted_count']}")
    print(f"    Local Filesystem Fallback:{stats['local_hosted_count']}")
    print(f"\n[SUCCESS] Media inventory report saved cleanly at: {output_file}\n")
    return output_file


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Mahaveer Youth Club Banza - Media Inventory Tool (Read-Only)")
    parser.add_argument("--db-url", type=str, default=None, help="Database connection URL")
    parser.add_argument("--output", type=Path, default=None, help="Output JSON report file path")

    args = parser.parse_args()
    try:
        run_inventory_report(db_url_override=args.db_url, output_path=args.output)
    except Exception as e:
        print(f"\n❌ INVENTORY FAILED: {str(e)}", file=sys.stderr)
        sys.exit(1)
