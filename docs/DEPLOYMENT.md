# Mahaveer Youth Club Banza V2 — Production Deployment & Operations Guide

**Project:** Mahaveer Youth Club Banza V2  
**Target Architecture:** Modular Monolith (FastAPI + React SPA + PostgreSQL 16 + Nginx Reverse Proxy)  
**Document State:** Final Production Standard  

---

## 1. Production Architecture Overview

The production system is designed for high reliability, fast performance, low hosting cost, and simplicity:

```text
[ Internet HTTPS Devotees & Admins ]
                │
                ▼
      [ Nginx Reverse Proxy ]
     (SSL/TLS, Rate Limiting, CSP)
       │                    │
       ▼                    ▼
[ /assets, / (SPA) ]    [ /api/v1/..., /uploads/... ]
Static HTML/JS/CSS     FastAPI ASGI Service (Uvicorn)
                            │
                            ▼
                  [ PostgreSQL 16 DB ]
```

---

## 2. Server Prerequisites & Sizing

| Resource | Minimum | Recommended | Notes |
| :--- | :--- | :--- | :--- |
| **CPU / RAM** | 1 vCPU / 1 GB RAM | 2 vCPU / 2 GB RAM | Fits easily within $5–$10/mo cloud VPS |
| **Disk** | 20 GB SSD | 40 GB SSD | Accommodates database & festival photos |
| **Operating System** | Ubuntu 22.04 LTS / Debian 12 | Ubuntu 24.04 LTS | Standard LTS release |
| **Runtimes** | Python 3.11+, Node 18+ LTS | Python 3.13, Node 24 | Standard package managers |
| **Database** | PostgreSQL 16 | PostgreSQL 16 | Relational store with ACID guarantees |

---

## 3. Environment & Configuration Separation

### Backend Production Configuration (`/var/www/mahaveer/backend/.env`)
```env
APP_ENV=production
APP_NAME="Mahaveer Youth Club Banza API"
APP_DEBUG=false
API_V1_STR=/api/v1

# Secure 64-character secret key (generate with: openssl rand -hex 32)
SECRET_KEY=GENERATE_SECURE_64_CHAR_HEX_STRING_FOR_PRODUCTION

# PostgreSQL 16 Production Connection
DATABASE_URL=postgresql://mahaveer_admin:STRONG_DB_PASSWORD@localhost:5432/mahaveer_db

# Allowed Production Origins (Strict domains, no wildcards)
CORS_ORIGINS=["https://mahaveeryouthclub.org","https://www.mahaveeryouthclub.org"]

# Upload & File Storage
UPLOAD_DIR=/var/www/mahaveer/uploads
MAX_UPLOAD_SIZE_BYTES=5242880

# Session Expiry
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7
```

### Frontend Production Environment (`/var/www/mahaveer/frontend/.env.production`)
```env
VITE_API_URL=https://mahaveeryouthclub.org/api/v1
```

---

## 4. Systemd Service Unit (`/etc/systemd/system/mahaveer-backend.service`)
```ini
[Unit]
Description=Mahaveer Youth Club Banza FastAPI Service
After=network.target postgresql.service

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=/var/www/mahaveer/backend
EnvironmentFile=/var/www/mahaveer/backend/.env
ExecStart=/var/www/mahaveer/backend/venv/bin/uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --workers 4 --proxy-headers --forwarded-allow-ips='127.0.0.1'
Restart=always
RestartSec=5s
KillSignal=SIGTERM

# Sandboxing
ProtectSystem=full
PrivateTmp=true

[Install]
WantedBy=multi-user.target
```

---

## 5. Nginx Reverse Proxy Configuration (`/etc/nginx/sites-available/mahaveeryouthclub.org`)
```nginx
# Throttling zones for brute-force protection
limit_req_zone $binary_remote_addr zone=api_general:10m rate=30r/s;
limit_req_zone $binary_remote_addr zone=auth_strict:10m rate=5r/m;

server {
    listen 80;
    listen [::]:80;
    server_name mahaveeryouthclub.org www.mahaveeryouthclub.org;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name mahaveeryouthclub.org www.mahaveeryouthclub.org;

    # SSL Certificates (Let's Encrypt Certbot)
    ssl_certificate /etc/letsencrypt/live/mahaveeryouthclub.org/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/mahaveeryouthclub.org/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Security Headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://mahaveeryouthclub.org;" always;

    # Frontend Single Page App Root
    root /var/www/mahaveer/frontend/dist;
    index index.html;

    # Client-side React Router fallback
    location / {
        try_files $uri $uri/ /index.html;
        expires 1h;
        add_header Cache-Control "public, no-transform";
    }

    # Static Assets with Immutable Caching
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Backend API Routing
    location /api/ {
        limit_req zone=api_general burst=50 nodelay;
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Sensitive Authentication Endpoint Throttling
    location /api/v1/auth/login {
        limit_req zone=auth_strict burst=5 nodelay;
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Uploaded Festival Images
    location /uploads/ {
        alias /var/www/mahaveer/uploads/;
        expires 30d;
        add_header Cache-Control "public, no-transform";
        add_header X-Content-Type-Options "nosniff";
    }
}
```

---

## 6. Step-by-Step Production Deployment Procedure

1. **Clone Repository & Set Up Working Directory**:
   ```bash
   sudo mkdir -p /var/www/mahaveer
   sudo chown -R $USER:$USER /var/www/mahaveer
   git clone <REPO_URL> /var/www/mahaveer
   cd /var/www/mahaveer
   ```

2. **Configure Backend & Run Migrations**:
   ```bash
   cd /var/www/mahaveer/backend
   python3 -m venv venv
   source venv/bin/activate
   pip install --upgrade pip
   pip install -r requirements.txt
   
   # Copy and populate production .env
   cp ../.env.example .env
   # Edit .env with production parameters and database password
   
   # Run database migrations to head
   python -m alembic upgrade head
   ```

3. **Build Frontend Production Assets**:
   ```bash
   cd /var/www/mahaveer/frontend
   npm ci
   npm run build
   # Verify dist/ output is populated
   ```

4. **Set Permissions & Start Services**:
   ```bash
   sudo mkdir -p /var/www/mahaveer/uploads
   sudo chown -R www-data:www-data /var/www/mahaveer/uploads
   sudo chmod -R 750 /var/www/mahaveer/uploads

   sudo cp deployment/mahaveer-backend.service /etc/systemd/system/
   sudo systemctl daemon-reload
   sudo systemctl enable mahaveer-backend
   sudo systemctl start mahaveer-backend
   
   # Setup Nginx
   sudo cp deployment/nginx.conf /etc/nginx/sites-available/mahaveeryouthclub.org
   sudo ln -s /etc/nginx/sites-available/mahaveeryouthclub.org /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

5. **Enable SSL/TLS Certificate**:
   ```bash
   sudo certbot --nginx -d mahaveeryouthclub.org -d www.mahaveeryouthclub.org
   ```

---

## 7. Rollback Procedure

### Scenario A: Frontend Rollback
```bash
# Revert to previous release bundle backup
sudo cp -r /var/backups/mahaveer/frontend_dist_previous/* /var/www/mahaveer/frontend/dist/
sudo systemctl reload nginx
```

### Scenario B: Backend & Database Rollback
```bash
cd /var/www/mahaveer/backend
source venv/bin/activate

# 1. Downgrade database schema by 1 revision
python -m alembic downgrade -1

# 2. Check out previous Git release tag
git checkout v1.0.0

# 3. Restart backend service
sudo systemctl restart mahaveer-backend
```
