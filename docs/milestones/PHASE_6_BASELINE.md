# Phase 6 Baseline Technical Specification & Environment Record

**Project:** Mahaveer Youth Club Banza V2  
**Date:** September 30, 2026  
**Auditor / Reviewer:** Senior Full-Stack & Production Systems Reviewer  
**Phase State:** Phase 1–5 Complete, Entering Phase 6 Production QA, Security, Deployment & Release  

---

## 1. System Runtime & Tooling Versions

| Runtime / Tool | Version | Purpose |
| :--- | :--- | :--- |
| **Node.js** | `v24.18.0` | Frontend build and asset pipeline runtime |
| **npm** | `11.16.0` | Frontend package manager |
| **Python** | `3.13.5` | Backend application runtime & test runner |
| **Database** | PostgreSQL 16 (Alpine in Docker) | Primary relational database |
| **Frontend Build Engine** | Vite `5.4.5` / TypeScript `5.5.3` | Bundling, static analysis, type checking |
| **Backend Web Server** | Uvicorn `0.30+` / FastAPI `0.115+` | ASGI asynchronous server & REST API framework |
| **ORM / Migration Tool** | SQLAlchemy `2.0.30+` / Alembic `1.13+` | Database mapping and versioned migrations |

---

## 2. Core Dependencies Baseline

### Backend Dependencies (`backend/requirements.txt`)
- `fastapi>=0.115.0,<1.0.0`
- `uvicorn[standard]>=0.30.0,<1.0.0`
- `pydantic[email]>=2.8.0,<3.0.0`
- `pydantic-settings>=2.4.0,<3.0.0`
- `sqlalchemy>=2.0.30,<3.0.0`
- `alembic>=1.13.0,<2.0.0`
- `psycopg2-binary>=2.9.9,<3.0.0`
- `python-dotenv>=1.0.1,<2.0.0`
- `pytest>=8.2.0,<9.0.0`
- `httpx>=0.27.0,<1.0.0`
- `pytest-asyncio>=0.23.0,<1.0.0`
- `pyjwt>=2.9.0,<3.0.0`
- `passlib>=1.7.4`
- `bcrypt>=4.0.1`
- `argon2-cffi>=23.1.0`
- `pyotp>=2.9.0`
- `python-multipart>=0.0.9`
- `email-validator>=2.2.0`

### Frontend Dependencies (`frontend/package.json`)
- `react`: `^18.3.1`
- `react-dom`: `^18.3.1`
- `react-router-dom`: `^6.26.2`
- `clsx`: `^2.1.1`
- `tailwind-merge`: `^2.5.2`
- `lucide-react`: `^1.16.0`
- `tailwindcss`: `^3.4.11`
- `typescript`: `^5.5.3`
- `vite`: `^5.4.5`

---

## 3. Database Schema & Migration Baseline
- **Migration Head**: `002_content_management` (Down-revision: `001_phase3_auth_schema`)
- **Tables**:
  1. `admin_users` (UUID primary key, email, argon2id password_hash, role, is_active, failed_login_attempts, locked_until, totp_secret, totp_enabled, backup_codes)
  2. `admin_audit_logs` (UUID primary key, user_id, action, resource_type, resource_id, ip_address, user_agent, details, created_at)
  3. `updates` (UUID primary key, title, slug, excerpt, content, category, status, featured_image, published_at, archived_at, created_at, updated_at)
  4. `activities` (UUID primary key, title, slug, description, category, date, image, status, published_at, archived_at, created_at, updated_at)
  5. `gallery_items` (UUID primary key, title, image_url, thumbnail_url, year, category, alt_text, status, published_at, archived_at, created_at, updated_at)
  6. `members` (UUID primary key, display_name, role, sort_order, is_visible, created_at, updated_at)

---

## 4. Environment Variables Baseline
- `APP_ENV`: `development` | `testing` | `production`
- `APP_NAME`: `"Mahaveer Youth Club Banza API"`
- `APP_DEBUG`: `bool`
- `API_V1_STR`: `"/api/v1"`
- `SECRET_KEY`: string (min 32 chars in production)
- `DATABASE_URL`: PostgreSQL connection string
- `CORS_ORIGINS`: JSON array of allowed origin strings
- `UPLOAD_DIR`: Local filesystem path for file uploads
- `MAX_UPLOAD_SIZE`: Bytes limit (5MB default)
- `ACCESS_TOKEN_EXPIRE_MINUTES`: 15
- `REFRESH_TOKEN_EXPIRE_DAYS`: 7

---

## 5. Current Baseline Commands & Status

| Task | Command | Baseline Status |
| :--- | :--- | :--- |
| **Backend Unit & API Tests** | `pytest -v` | 38 passed in 3.42s |
| **Frontend Type Check** | `tsc -b` | 0 errors |
| **Frontend Production Build** | `npm run build` | Clean build in 1.75s |
| **Phase 5 Verification Suite** | `python test_phase5_experience.py` | 100% passed |
| **Alembic Head Verification** | `python -m alembic heads` | `002_content_management` (head) |
