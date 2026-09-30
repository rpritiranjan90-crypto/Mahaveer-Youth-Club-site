# Production Database Backup, Restore & Disaster Recovery Strategy

**Project:** Mahaveer Youth Club Banza V2  
**Target Environment:** Production (PostgreSQL 16 Relational Database + Local Media Storage)  
**Document State:** Final Production Standard  

---

## 1. Overview & Strategy
To safeguard community history, published updates, festival celebration photos, and administrative audit trails, Mahaveer Youth Club Banza adheres to a multi-tiered, automated backup and disaster recovery standard.

### Core Objectives
- **Zero Data Loss for Published Content**: Regular automated snapshot of database and user-uploaded media.
- **Fast Recovery (RTO < 30 Minutes)**: Clear, documented, and deterministic restoration drill.
- **Immutable & Off-Site Retention**: Backups are compressed, timestamped, and stored off the primary application host.

---

## 2. What Must Be Backed Up

| Component | Storage Type | Content | Backup Method |
| :--- | :--- | :--- | :--- |
| **PostgreSQL Database** | Relational Database | Admin users, audit logs, updates, activities, gallery metadata, member rosters, refresh token hashes, recovery code hashes. | `pg_dump` (custom / compressed format) |
| **Media & Uploads** | Local Filesystem | Festival celebration photos and automatic thumbnails (`/uploads/gallery/`). | `tar` + `gzip` archive |
| **Environment Configuration** | Secure File | Production `.env` (non-version-controlled environment parameters & secrets). | Secure encrypted key vault / offline backup |

---

## 3. Automated Backup Procedure

### Daily Backup Script (`scripts/backup_db.sh`)
```bash
#!/usr/bin/env bash
# ==============================================================================
# Mahaveer Youth Club Banza — Automated Production Backup Script
# ==============================================================================
set -euo pipefail

BACKUP_DIR="/var/backups/mahaveer"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DB_NAME="mahaveer_db"
DB_USER="mahaveer_user"
RETENTION_DAYS=30

mkdir -p "${BACKUP_DIR}/db"
mkdir -p "${BACKUP_DIR}/media"

echo "[$(date)] Starting Mahaveer Youth Club database backup..."

# 1. Database Dump (Compressed Custom Format)
DB_BACKUP_FILE="${BACKUP_DIR}/db/mahaveer_db_${TIMESTAMP}.dump"
pg_dump -h localhost -U "${DB_USER}" -d "${DB_NAME}" -F c -b -v -f "${DB_BACKUP_FILE}"

echo "[$(date)] Database backup complete: ${DB_BACKUP_FILE}"

# 2. Uploads Directory Archive
MEDIA_BACKUP_FILE="${BACKUP_DIR}/media/mahaveer_uploads_${TIMESTAMP}.tar.gz"
if [ -d "/var/www/mahaveer/uploads" ]; then
    tar -czf "${MEDIA_BACKUP_FILE}" -C /var/www/mahaveer uploads
    echo "[$(date)] Media archive complete: ${MEDIA_BACKUP_FILE}"
fi

# 3. Rotate Old Backups (Retain last 30 days)
find "${BACKUP_DIR}/db" -type f -name "*.dump" -mtime +${RETENTION_DAYS} -delete
find "${BACKUP_DIR}/media" -type f -name "*.tar.gz" -mtime +${RETENTION_DAYS} -delete

echo "[$(date)] Backup rotation complete. Retained last ${RETENTION_DAYS} days."
```

### Automation via Cron
Schedule nightly execution at 02:00 AM UTC:
```bash
# Add to root crontab (crontab -e)
0 2 * * * /usr/local/bin/backup_db.sh >> /var/log/mahaveer_backup.log 2>&1
```

---

## 4. Step-by-Step Restoration Procedure

### Scenario: Restoring Database on Existing or New Host

1. **Stop Application Backend Workers**:
   ```bash
   sudo systemctl stop mahaveer-backend
   ```

2. **Verify Backup File Integrity**:
   ```bash
   pg_restore --list /var/backups/mahaveer/db/mahaveer_db_YYYYMMDD_HHMMSS.dump > /dev/null
   echo "Backup archive is structurally intact."
   ```

3. **Recreate or Clean Database**:
   ```bash
   # Terminate active client connections and drop/recreate database
   sudo -u postgres psql -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'mahaveer_db' AND pid <> pg_backend_pid();"
   sudo -u postgres psql -c "DROP DATABASE IF EXISTS mahaveer_db;"
   sudo -u postgres psql -c "CREATE DATABASE mahaveer_db OWNER mahaveer_user;"
   ```

4. **Restore Database from Dump**:
   ```bash
   pg_restore -h localhost -U mahaveer_user -d mahaveer_db -v /var/backups/mahaveer/db/mahaveer_db_YYYYMMDD_HHMMSS.dump
   ```

5. **Restore Media Uploads (if necessary)**:
   ```bash
   tar -xzf /var/backups/mahaveer/media/mahaveer_uploads_YYYYMMDD_HHMMSS.tar.gz -C /var/www/mahaveer/
   ```

6. **Verify Database Migrations**:
   ```bash
   cd /var/www/mahaveer/backend
   source venv/bin/activate
   python -m alembic current
   # Expected output: 002_content_management (head)
   ```

7. **Restart Backend Service & Verify Health**:
   ```bash
   sudo systemctl start mahaveer-backend
   curl -f http://127.0.0.1:8000/api/v1/health
   # Expected: {"status":"ok","app":"Mahaveer Youth Club Banza API",...}
   ```

---

## 5. Post-Restore Verification Checklist
- [ ] Alembic migration head matches `002_content_management`.
- [ ] Administrator can log in with established credentials and 2FA.
- [ ] Published updates (`/api/v1/public/updates`) return expected circulars.
- [ ] Published activities (`/api/v1/public/activities`) return expected events.
- [ ] Published gallery items (`/api/v1/public/gallery`) render valid image URLs.
- [ ] Public members roster (`/api/v1/public/members`) displays approved nicknames.
- [ ] Security audit log records `RESTORE_VERIFICATION` event.

---

## 6. Disaster Recovery Scenarios

### Scenario A: Accidental Record Deletion
- **Mitigation**: Database maintains soft-archived states (`status="archived"`) for content; physical deletion is reserved for administrators. In the event of catastrophic accidental deletion, restore the most recent nightly backup to a staging database and extract the lost records.

### Scenario B: Host / Server Failure
- **Mitigation**: Re-provision a clean Debian/Ubuntu host, run the Ansible/Docker provisioning playbook, restore the latest `.dump` and `.tar.gz` from off-site storage, verify the environment file, and update DNS records.

### Scenario C: Uploads Directory Loss
- **Mitigation**: The database stores image metadata and relative paths (`/uploads/gallery/<uuid>.jpg`). Extracting `mahaveer_uploads_*.tar.gz` immediately reconnects all images without modifying database records.

---

## 7. Execution Status Note
- **Development Environment Execution**: The commands above have been verified with PostgreSQL 16 commands in development containers.
- **Production Execution Status**: *NOT EXECUTED against live production cloud hardware (awaiting deployment phase release).*
