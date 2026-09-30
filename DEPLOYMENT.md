# 🚀 Mahaveer Youth Club — Production Deployment Guide

This document contains comprehensive instructions for deploying the **Mahaveer Youth Club** website and administrative backend into a secure, performant production environment.

---

## 1. Prerequisites

Ensure the production host or cloud virtual machine meets the following baseline requirements:

| Component | Minimum Version | Recommended |
| :--- | :--- | :--- |
| **Operating System** | Ubuntu 22.04 LTS / Debian 12 | Ubuntu 24.04 LTS |
| **Python** | Python 3.11+ | Python 3.12 or 3.13 |
| **Node.js & npm** | Node 18+ / npm 9+ | Node 20 LTS |
| **Database** | PostgreSQL 14+ | PostgreSQL 16 |
| **Web Server / Reverse Proxy** | Nginx 1.18+ | Nginx 1.24+ with HTTP/2 |
| **SSL / TLS** | Certbot 2.0+ (Let's Encrypt) | Automated renewal via cron/systemd |
| **Process Manager** | systemd or Docker Compose | systemd + Uvicorn workers |

---

## 2. Environment Variables Configuration

> ⚠️ **CRITICAL SECURITY RULE:** Never commit production `.env` files or secret values to version control. Generate cryptographically strong random keys for production.

### A. Backend Production Environment (`backend/.env`)

Generate a secure 64-character secret key on your server:
```bash
python3 -c "import secrets; print(secrets.token_urlsafe(48))"
```

Create `/opt/mahaveer-club/backend/.env`:
```env
# Application Environment
ENVIRONMENT=production
DEBUG=False
PROJECT_NAME="Mahaveer Youth Club API"
API_V1_STR=/api/v1

# Security & Secrets (GENERATE UNIQUE IN PRODUCTION)
SECRET_KEY=replace_with_at_least_32_characters_random_hex_or_base64_string
ACCESS_TOKEN_EXPIRE_MINUTES=480

# Production Database (PostgreSQL)
DATABASE_URL=postgresql://mahaveer_admin:YOUR_SECURE_DB_PASSWORD@localhost:5432/mahaveer_db

# CORS Configuration (Only allowed production domains, comma-separated)
CORS_ORIGINS=https://mahaveeryouthclub.org,https://www.mahaveeryouthclub.org

# File Storage Configuration
UPLOAD_DIR=/opt/mahaveer-club/backend/uploads
MAX_UPLOAD_SIZE_MB=5
ALLOWED_EXTENSIONS=["jpg", "jpeg", "png", "webp"]

# Initial Admin Bootstrap (Optional first-run bootstrap; unset after initial setup)
FIRST_RUN_ADMIN_USERNAME=admin
FIRST_RUN_ADMIN_EMAIL=admin@mahaveeryouthclub.org
FIRST_RUN_ADMIN_PASSWORD=REPLACE_WITH_STRONG_INITIAL_PASSWORD
```

### B. Frontend Production Environment (`frontend/.env.production`)

Create `/opt/mahaveer-club/frontend/.env.production`:
```env
VITE_API_URL=https://mahaveeryouthclub.org/api/v1
```

---

## 3. Production PostgreSQL Setup

Log into PostgreSQL on the server and create a dedicated database and non-superuser role:

```sql
-- Connect to PostgreSQL as superuser
sudo -u postgres psql

-- Create database user with secure password
CREATE USER mahaveer_admin WITH PASSWORD 'YOUR_SECURE_DB_PASSWORD';

-- Create production database
CREATE DATABASE mahaveer_db OWNER mahaveer_admin;

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE mahaveer_db TO mahaveer_admin;
\c mahaveer_db
GRANT ALL ON SCHEMA public TO mahaveer_admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO mahaveer_admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO mahaveer_admin;

\q
```

---

## 4. Database Migrations (Alembic)

Always run database schema migrations via Alembic before starting the application:

```bash
cd /opt/mahaveer-club/backend
source venv/bin/activate

# Execute all pending migrations up to latest revision
alembic upgrade head

# Verify current revision
alembic current
```

---

## 5. Storage & Upload Directory Permissions

Ensure the upload directory exists and is strictly owned by the web application service user (`www-data` or `mahaveer`):

```bash
# Create directory for persisted media uploads
sudo mkdir -p /opt/mahaveer-club/backend/uploads
sudo chown -R www-data:www-data /opt/mahaveer-club/backend/uploads
sudo chmod 750 /opt/mahaveer-club/backend/uploads
```

---

## 6. Frontend Build & Static Deployment

Build the optimized Vite production distribution:

```bash
cd /opt/mahaveer-club/frontend
npm ci --omit=dev
npm run build

# Copy build artifacts to Nginx webroot
sudo mkdir -p /var/www/mahaveeryouthclub.org/html
sudo cp -r dist/* /var/www/mahaveeryouthclub.org/html/
sudo chown -R www-data:www-data /var/www/mahaveeryouthclub.org/html
```

---

## 7. Backend Process Management (systemd + Uvicorn)

Create a systemd service file at `/etc/systemd/system/mahaveer-api.service`:

```ini
[Unit]
Description=Mahaveer Youth Club FastAPI Backend
After=network.target postgresql.service

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=/opt/mahaveer-club/backend
EnvironmentFile=/opt/mahaveer-club/backend/.env
ExecStart=/opt/mahaveer-club/backend/venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000 --workers 4 --proxy-headers --forwarded-allow-ips='127.0.0.1'
Restart=always
RestartSec=5s
KillSignal=SIGTERM

[Install]
WantedBy=multi-user.target
```

Enable and start the service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable mahaveer-api
sudo systemctl start mahaveer-api
sudo systemctl status mahaveer-api
```

---

## 8. Nginx Reverse Proxy & Domain Routing

Create Nginx site configuration at `/etc/nginx/sites-available/mahaveeryouthclub.org`:

```nginx
# Rate Limiting Zones
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=20r/s;
limit_req_zone $binary_remote_addr zone=auth_limit:10m rate=5r/m;

server {
    listen 80;
    listen [::]:80;
    server_name mahaveeryouthclub.org www.mahaveeryouthclub.org;

    # Redirect all HTTP traffic to HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name mahaveeryouthclub.org www.mahaveeryouthclub.org;

    # SSL Certificates (Configured by Certbot)
    ssl_certificate /etc/letsencrypt/live/mahaveeryouthclub.org/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/mahaveeryouthclub.org/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Security Headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Frontend Static Files
    root /var/www/mahaveeryouthclub.org/html;
    index index.html;

    # SPA Routing (Fall back to index.html for React Router)
    location / {
        try_files $uri $uri/ /index.html;
        expires 1h;
        add_header Cache-Control "public, no-transform";
    }

    # Static Assets Cache
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Backend API Proxy
    location /api/ {
        limit_req zone=api_limit burst=30 nodelay;
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Auth Rate Limit Protection (Centralized multi-worker rate limiting)
    location /api/v1/auth/login {
        limit_req zone=auth_limit burst=5 nodelay;
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Uploaded Media Proxy
    location /uploads/ {
        alias /opt/mahaveer-club/backend/uploads/;
        expires 30d;
        add_header Cache-Control "public, no-transform";
        add_header X-Content-Type-Options "nosniff";
    }
}

---

## 8.1 Production Security & Architecture Decisions

### Rate Limiting Across Multiple Workers/Instances
- **Single Host / Community Deployment**: The FastAPI backend contains an in-memory sliding window rate limiter (`backend/app/core/rate_limit.py`). When running multiple Uvicorn workers, the **Nginx reverse proxy** (above) serves as the primary centralized throttling gateway (`limit_req zone=auth_limit burst=5 nodelay`), ensuring brute-force protection across all workers.
- **Horizontal Multi-Server Scaling**: When deploying across multiple virtual machines or Kubernetes pods behind a load balancer, connect the backend rate limiter to a shared **Redis** instance.

### Token Transport & Storage Decision
- **Current Model**: 15-minute JWT stored in browser `sessionStorage` and sent via `Authorization: Bearer <token>` headers.
- **XSS Mitigation**: Short token expiry (15 min), tab-isolation via `sessionStorage`, and strict HTTP security headers (`nosniff`, `DENY`, `strict-origin-when-cross-origin`).
- **Production Hardening Pathway**: For high-security requirements, upgrade to **In-Memory React State + HttpOnly Refresh Cookie** where the refresh token is stored in an `HttpOnly` cookie and the short-lived access token exists solely in JavaScript memory.

```

Enable site configuration:
```bash
sudo ln -s /etc/nginx/sites-available/mahaveeryouthclub.org /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 9. HTTPS Setup with Let's Encrypt

Obtain free SSL/TLS certificates via Certbot:

```bash
sudo certbot --nginx -d mahaveeryouthclub.org -d www.mahaveeryouthclub.org
```

Verify automated SSL renewal:
```bash
sudo certbot renew --dry-run
```

---

## 10. Automated Database & Media Backups

Create a daily backup script at `/opt/mahaveer-club/scripts/backup.sh`:

```bash
#!/bin/bash
set -e

BACKUP_DIR="/var/backups/mahaveer-club"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DB_NAME="mahaveer_db"
DB_USER="mahaveer_admin"

mkdir -p "$BACKUP_DIR"

# 1. PostgreSQL Database Dump
pg_dump -U "$DB_USER" -F c -b -v -f "$BACKUP_DIR/db_${TIMESTAMP}.dump" "$DB_NAME"

# 2. Archive Uploaded Media
tar -czf "$BACKUP_DIR/media_${TIMESTAMP}.tar.gz" -C /opt/mahaveer-club/backend uploads

# 3. Retain only last 14 days of backups
find "$BACKUP_DIR" -type f -mtime +14 -delete

echo "Backup completed successfully at $(date)"
```

Make executable and register in cron:
```bash
chmod +x /opt/mahaveer-club/scripts/backup.sh

# Add to crontab to run daily at 02:30 AM
(crontab -l 2>/dev/null; echo "30 2 * * * /opt/mahaveer-club/scripts/backup.sh >> /var/log/mahaveer_backup.log 2>&1") | crontab -
```

---

## 11. Rollback Strategy

If a deployment must be rolled back:

### Frontend Rollback:
```bash
# Revert to previous build directory
sudo cp -r /var/backups/mahaveer-frontend-previous/* /var/www/mahaveeryouthclub.org/html/
sudo systemctl reload nginx
```

### Backend & Database Rollback:
```bash
# 1. Rollback Alembic database schema by 1 revision
cd /opt/mahaveer-club/backend
source venv/bin/activate
alembic downgrade -1

# 2. Check out previous stable release tag
git checkout v1.0.0

# 3. Restart API service
sudo systemctl restart mahaveer-api
```

---

## 12. Troubleshooting & Health Verification

### Common Issues:

1. **CORS Errors (403 Forbidden / Failed to Fetch):**
   - Check `CORS_ORIGINS` in `backend/.env`. Ensure it includes the exact protocol and domain (`https://mahaveeryouthclub.org`).
2. **502 Bad Gateway:**
   - Verify FastAPI backend is active: `sudo systemctl status mahaveer-api`
   - Check backend application logs: `journalctl -u mahaveer-api -n 50 --no-pager`
3. **Database Connection Errors:**
   - Verify PostgreSQL service status: `sudo systemctl status postgresql`
   - Test connection string: `psql -U mahaveer_admin -d mahaveer_db -h localhost`
4. **Image Upload Failures (413 Payload Too Large / Permission Denied):**
   - Check Nginx `client_max_body_size 10M;`
   - Verify permissions on `/opt/mahaveer-club/backend/uploads` (`chown -R www-data:www-data`).
