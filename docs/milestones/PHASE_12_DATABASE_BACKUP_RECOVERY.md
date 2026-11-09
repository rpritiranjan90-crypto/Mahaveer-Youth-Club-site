# PHASE 12 — DATABASE & BACKUP RECOVERY STRATEGY
## Project: Mahaveer Youth Club Banza V2

---

### 1. Overview & Objectives

This document establishes the official **Database Backup, Media Archive, and Disaster Recovery Procedures** for Mahaveer Youth Club Banza V2.

Because the system stores critical club archives, member portraits, festive celebration photos, official notices, and security audit trails, backups must cover:
1. **Database Relational Data** (PostgreSQL or SQLite)
2. **Persistent Upload Media** (`uploads/` directory containing gallery photos, member images, logo, and circular media)
3. **Cryptographic Checksum Verification** (SHA-256 manifests)

---

### 2. Database Architecture & Schema Structure

The application utilizes SQLAlchemy 2.0 with Alembic version control across four clean migration stages:

```
001_phase3_auth (users, recovery_codes, refresh_tokens, audit_logs)
       ↓
002_content_management (updates, activities, gallery_items, members legacy)
       ↓
003_site_assets (site_assets for official logo and current-year Ganesh)
       ↓
004_member_management (members roster, designations, portraits, ordering, active visibility)
```

#### Table Indexing & Relationships:
- **`users`**: Indexed on `id`, UNIQUE index on `email`.
- **`recovery_codes`**: Foreign key to `users.id` (ON DELETE CASCADE), indexed on `user_id`.
- **`refresh_tokens`**: Foreign key to `users.id` (ON DELETE CASCADE), indexed on `token_hash`, `user_id`.
- **`audit_logs`**: Foreign key to `users.id` (ON DELETE SET NULL), indexed on `action`, `created_at`.
- **`updates`**: UNIQUE index on `slug`, indexed on `status`, `created_at`.
- **`activities`**: UNIQUE index on `slug`, indexed on `status`, `category`, `date`.
- **`gallery_items`**: Indexed on `status`, `year`, `category`.
- **`site_assets`**: Foreign key to `users.id` (ON DELETE SET NULL), indexed on `asset_type`, `is_active`.
- **`members`**: Foreign key to `users.id` (ON DELETE SET NULL), indexed on `display_order`, `is_active`.

---

### 3. Automated Backup Tooling (`scripts/backup.py`)

A cross-platform backup utility is provided at [`scripts/backup.py`](file:///c:/Users/rprit/Documents/MAHAVEER%20YOUTH%20CLUB%20SITE/scripts/backup.py).

#### Features:
- **PostgreSQL**: Invokes `pg_dump` with `--clean --if-exists --no-owner --no-privileges`, piping into gzip-compressed `.sql.gz`. Password is passed strictly via process environment (`PGPASSWORD`) and never printed.
- **SQLite**: Utilizes SQLite's Online Backup API (`sqlite3.connect().backup()`) for zero-downtime, transactionally consistent snapshots into `.sqlite.gz`.
- **Media Archiving**: Compresses `uploads/` into a timestamped `.tar.gz` archive.
- **Manifest Integrity**: Generates `manifest.json` containing SHA-256 checksums, uncompressed & compressed byte sizes, table row counts, and UTC timestamps.

#### Running Backup:
```bash
# Full backup (database + media)
python scripts/backup.py --output-dir ./backups

# Database-only backup
python scripts/backup.py --output-dir ./backups --skip-media
```

---

### 4. Restoration & Disaster Recovery Tooling (`scripts/restore.py`)

A verified restore utility is provided at [`scripts/restore.py`](file:///c:/Users/rprit/Documents/MAHAVEER%20YOUTH%20CLUB%20SITE/scripts/restore.py).

#### Restoration Flow:
1. **Manifest & Checksum Verification**: Reads `manifest.json` and verifies SHA-256 checksums of database and media archives before applying any changes.
2. **Database Restoration**:
   - For SQLite: Decompresses `.sqlite.gz` and executes `PRAGMA integrity_check` to ensure zero corruption.
   - For PostgreSQL: Decompresses `.sql.gz` and applies SQL dump via `psql`.
3. **Media Restoration**: Extracts `media_backup_*.tar.gz` into the target `uploads/` directory with path traversal protection.

#### Running Restoration:
```bash
# Restore to target database and media directory
python scripts/restore.py --backup-dir ./backups/backup_20260930_184738 --target-db-url postgresql://user:pass@localhost:5432/mahaveer_db

# Restore test verification on separate SQLite test file
python scripts/restore.py --backup-dir ./backups/backup_20260930_184738 --target-db-url sqlite:///./test_restore.db --skip-media
```

---

### 5. Recommended Backup Policy & Retention Schedule

| Backup Type | Frequency | Retention | Storage Location |
| :--- | :--- | :--- | :--- |
| **Daily Full Backup** | Once daily (e.g. 02:00 UTC) | 7 days | Primary server backup volume |
| **Weekly Snapshot** | Every Sunday | 4 weeks | Off-site / Cloud object storage |
| **Monthly Archive** | 1st of every month | 12 months | Cold cloud storage (encrypted) |

#### Operator Production Checklist:
- [ ] Run `python scripts/backup.py` prior to applying any production updates or migrations.
- [ ] Verify `manifest.json` SHA-256 checksums.
- [ ] Test restore procedure quarterly on a staging database to verify data validity.
- [ ] Ensure the `backups/` directory is excluded from web access and source control.
