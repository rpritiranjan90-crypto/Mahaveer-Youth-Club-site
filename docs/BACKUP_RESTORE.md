# Database Backup, Restore & Disaster Recovery Guide

**Project:** Mahaveer Youth Club Banza  
**Production Stack:** Neon Serverless PostgreSQL 16 + Render + Cloudinary CDN + Vercel  
**Primary Runbook:** [docs/DISASTER_RECOVERY.md](file:///c:/Users/rprit/Documents/MAHAVEER%20YOUTH%20CLUB%20SITE/docs/DISASTER_RECOVERY.md)

---

## 1. Overview & Tooling Architecture

All backup, verification, and restoration tasks are executed via cross-platform, production-safe Python utilities located in the `scripts/` directory:

| Utility | Script | Purpose |
|---|---|---|
| **Database Backup** | `scripts/backup.py` | Creates custom-format PostgreSQL `.dump` or SQLite `.sqlite.gz` with SHA-256 manifest |
| **Backup Verification** | `scripts/verify_backup.py` | Standalone verification of SHA-256 checksums, magic headers, and table schemas |
| **Database Restore** | `scripts/restore.py` | Verified restoration into target database with pre-flight SHA-256 validation |
| **Media Inventory** | `scripts/inventory_media.py` | Read-only scan of media references across database entities and Cloudinary public IDs |

---

## 2. Backup Workflow

### A. Performing a Production Database Backup
```bash
python scripts/backup.py --output-dir ./backups/database --db-url "postgresql://<USER>:<PASS>@<HOST>/<DB>?sslmode=require"
```
**Outputs:**
- `backups/database/mahaveer_db_YYYYMMDD_HHMMSS.dump` (PostgreSQL native custom archive)
- `backups/database/manifest_YYYYMMDD_HHMMSS.json` (SHA-256 checksum and table row counts)

### B. Performing a Local/Test SQLite Backup
```bash
python scripts/backup.py --output-dir ./backups/database --db-url sqlite:///./mahaveer.db
```

---

## 3. Verification Workflow

Run offline verification on any backup artifact:
```bash
python scripts/verify_backup.py --backup-dir ./backups/database
```
**Verification Checks:**
1. File presence and non-zero byte size.
2. SHA-256 checksum match against `manifest.json`.
3. Structural validation (PGDMP magic header / `pg_restore --list` / SQLite `PRAGMA integrity_check`).
4. Schema validation for all 10 application tables.

---

## 4. Disaster Recovery & Restorations

For complete step-by-step instructions on disaster scenarios, Neon database branching, Cloudinary media persistence, and Vercel/Render redeployment, refer to the master runbook:

👉 **[docs/DISASTER_RECOVERY.md](file:///c:/Users/rprit/Documents/MAHAVEER%20YOUTH%20CLUB%20SITE/docs/DISASTER_RECOVERY.md)**
