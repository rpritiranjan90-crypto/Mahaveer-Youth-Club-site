# Disaster Recovery & Operations Runbook

**Project:** Mahaveer Youth Club Banza  
**Production Stack:**
- **Frontend:** Vercel (React 18 + Vite SPA)
- **Backend:** Render Web Service (FastAPI + Python 3.13)
- **Database:** Neon Serverless PostgreSQL 16
- **Media Storage:** Cloudinary Persistent CDN
- **Health Monitoring:** UptimeRobot (Free Plan — HEAD Probing)

---

## 1. Production Configuration Inventory

| Variable | Platform | Purpose | Required? | Secret? | Example Placeholder |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `APP_ENV` | Render | Application environment flag | **Yes** | No | `production` |
| `APP_NAME` | Render | API display name in health/responses | No | No | `Mahaveer Youth Club Banza API` |
| `APP_DEBUG` | Render | Debug mode (Must be False in prod) | **Yes** | No | `false` |
| `API_V1_STR` | Render | Base API prefix | No | No | `/api/v1` |
| `SECRET_KEY` | Render | HMAC-SHA256 signing for JWT & 2FA tokens | **Yes** | **YES** | `<GENERATE_64_CHAR_HEX_KEY>` |
| `DATABASE_URL` | Render | Neon PostgreSQL connection string | **Yes** | **YES** | `postgresql://user:password@ep-xyz.neon.tech/neondb?sslmode=require` |
| `DB_POOL_SIZE` | Render | SQLAlchemy database connection pool size | No | No | `10` |
| `DB_MAX_OVERFLOW`| Render | SQLAlchemy maximum pool overflow | No | No | `20` |
| `DB_POOL_TIMEOUT` | Render | SQLAlchemy pool connection timeout (s) | No | No | `30` |
| `CORS_ORIGINS` | Render | Allowed frontend domain origins | **Yes** | No | `["https://mahaveer-youth-club-site.vercel.app"]` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Render | Admin session token duration | No | No | `15` |
| `REFRESH_TOKEN_EXPIRE_DAYS` | Render | Refresh token cookie lifespan | No | No | `7` |
| `FIRST_SUPERUSER_EMAIL` | Render | Bootstrap superuser account | Optional | No | `<ADMIN_EMAIL_ADDRESS>` |
| `FIRST_SUPERUSER_PASSWORD` | Render | Initial superuser password (omit once created) | Optional | **YES** | `<STRONG_BOOTSTRAP_PASSWORD>` |
| `CLOUDINARY_CLOUD_NAME` | Render | Cloudinary tenant account name | **Yes** | No | `<YOUR_CLOUDINARY_CLOUD_NAME>` |
| `CLOUDINARY_API_KEY` | Render | Cloudinary API Key | **Yes** | No | `<YOUR_CLOUDINARY_API_KEY>` |
| `CLOUDINARY_API_SECRET` | Render | Cloudinary API Secret for upload/delete | **Yes** | **YES** | `<YOUR_CLOUDINARY_API_SECRET>` |
| `UPLOAD_DIR` | Render | Local fallback storage folder | No | No | `uploads` |
| `MAX_UPLOAD_SIZE_BYTES` | Render | Maximum upload file limit (bytes) | No | No | `5242880` (5 MB) |
| `VITE_API_URL` | Vercel | Production backend API endpoint | **Yes** | No | `https://mahaveer-api.onrender.com/api/v1` |

---

## 2. Platform Build & Deployment Settings

### Render (Backend Web Service)
- **Repository:** `rpritiranjan90-crypto/Mahaveer-Youth-Club-site`
- **Branch:** `main`
- **Root Directory:** *(leave blank — repository root)*
- **Runtime:** `Python 3`
- **Build Command:** `pip install -r backend/requirements.txt && alembic -c backend/alembic.ini upgrade head`
- **Start Command:** `uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT`
- **Auto-Deploy:** `Yes` (deploys automatically on push to `main`)

### Vercel (Frontend Web Application)
- **Framework Preset:** `Vite`
- **Root Directory:** `frontend`
- **Build Command:** `npm run build` (`tsc -b && vite build`)
- **Output Directory:** `dist`
- **Node.js Version:** `20.x` or `22.x`

---

## 3. Disaster Scenarios & Step-by-Step Recovery

### Scenario A: Backend Web Service Failure on Render
**Symptoms:** 502 Bad Gateway or 504 Gateway Timeout on API calls.

1. **Check Render Logs:**
   - Log into [dashboard.render.com](https://dashboard.render.com).
   - Navigate to **mahaveer-api** > **Logs**.
2. **Re-deploy Previous Working Build:**
   - Go to **Manual Deploy** > **Deploy latest commit** (or roll back to a specific commit).
3. **Verify Environment Variables:**
   - Ensure `SECRET_KEY`, `DATABASE_URL`, and Cloudinary variables are populated.
4. **Verify Health:**
   ```bash
   curl -I https://mahaveer-api.onrender.com/api/v1/ready
   # Expected: HTTP/1.1 200 OK
   ```

---

### Scenario B: Database Failure / Accidental Data Loss (Neon)
**Symptoms:** `/api/v1/ready` returns `503 Service Unavailable` with `"Database service unreachable"`.

#### Method 1: Instant Point-in-Time Branch Recovery (Fastest — RTO < 5 mins)
Neon includes instant zero-cost branching on its free tier:
1. Open [console.neon.tech](https://console.neon.tech).
2. Go to your project > **Branches**.
3. Click **New Branch**:
   - Choose **Point in time** (select a timestamp immediately before the incident).
   - Name the branch (e.g., `recovery-branch-20261004`).
4. Copy the new branch connection string (`postgresql://...`).
5. In Render Dashboard > **Environment**, update `DATABASE_URL` with the new connection string.
6. Render will automatically restart the backend service and point to the restored database branch.

#### Method 2: Restoring from a Verified Backup Archive (`.dump` or `.sqlite.gz`)
If restoring into a new PostgreSQL database:
1. Ensure the backup artifact is verified:
   ```bash
   python scripts/verify_backup.py --backup-file ./backups/database/mahaveer_db_YYYYMMDD_HHMMSS.dump
   ```
2. Restore to the target database:
   ```bash
   python scripts/restore.py \
     --backup-file ./backups/database/mahaveer_db_YYYYMMDD_HHMMSS.dump \
     --target-db-url "postgresql://<USER>:<PASS>@<HOST>/<DB>?sslmode=require" \
     --manifest ./backups/database/manifest_YYYYMMDD_HHMMSS.json \
     --yes
   ```
3. Run Alembic schema upgrade to verify all migrations are at head:
   ```bash
   alembic -c backend/alembic.ini upgrade head
   ```

---

### Scenario C: Cloudinary Media Storage Reconnection
**Symptoms:** Image URLs in admin/portal render as broken or 404.

1. **Verify Credentials:**
   - Confirm `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` are present in Render environment variables.
2. **Why Cloudinary Assets Survive Database Restoration:**
   - Cloudinary is an independent, persistent cloud object store.
   - The PostgreSQL database records store permanent HTTPS delivery URLs (e.g., `https://res.cloudinary.com/...`).
   - When a database is restored from a backup, all photo and asset links immediately work without re-uploading files.
3. **Run Media Inventory Scan (Read-Only):**
   ```bash
   python scripts/inventory_media.py --db-url "postgresql://<USER>:<PASS>@<HOST>/<DB>?sslmode=require"
   ```
   This generates `backups/media_inventory.json` listing all assets, dimensions, and Cloudinary public IDs.

---

### Scenario D: Frontend Outage on Vercel
**Symptoms:** White screen or 404 when visiting `https://mahaveer-youth-club-site.vercel.app`.

1. **Check Vercel Deployments:**
   - Log into [vercel.com](https://vercel.com) > **mahaveer-youth-club-site** > **Deployments**.
2. **Verify Settings:**
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Environment Variable: `VITE_API_URL` = `https://mahaveer-api.onrender.com/api/v1`
3. **Trigger Manual Redeploy:**
   - Click **Redeploy** on the latest healthy production deployment.

---

### Scenario E: UptimeRobot Health Monitoring
**Symptoms:** UptimeRobot sends a downtime alert.

1. UptimeRobot is configured to probe `https://mahaveer-api.onrender.com/api/v1/ready` using HTTP `HEAD`.
2. Check the endpoint manually:
   ```bash
   # Test HEAD
   curl -I https://mahaveer-api.onrender.com/api/v1/ready
   # Expected: HTTP/1.1 200 OK

   # Test GET
   curl https://mahaveer-api.onrender.com/api/v1/ready
   # Expected: {"status":"ready","database":"connected"}
   ```
3. If `ready` returns 200 OK, UptimeRobot monitor will turn green/UP within 1 polling cycle (5 mins on Free tier).

---

## 4. Critical Rules: What NOT To Do

> [!CAUTION]
> **1. NEVER restore a backup over production without verifying it first.**  
> Always test the backup with `python scripts/verify_backup.py` and run a restore drill into a disposable database branch first.

> [!CAUTION]
> **2. NEVER hardcode or commit secrets.**  
> Never put `DATABASE_URL`, `SECRET_KEY`, `CLOUDINARY_API_SECRET`, or `.env` into Git repositories.

> [!CAUTION]
> **3. NEVER run destructive SQL (`DROP TABLE`, `TRUNCATE`) directly on the production Neon `main` branch.**  
> Always use Neon branching to test dangerous operations in an isolated sandbox.

> [!CAUTION]
> **4. NEVER delete Cloudinary media manually from the Cloudinary console.**  
> The free tier does not support undeleting files. Always manage media deletions via the Admin Portal UI which enforces reference checks.
