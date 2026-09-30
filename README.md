# Mahaveer Youth Club Banza V2

Official website and administrative portal for **Mahaveer Youth Club Banza** (Established 2012).

---

## 1. Project Purpose & Overview
Mahaveer Youth Club Banza V2 is a clean, production-oriented community website and application shell built with modern web best practices, strict type safety, modular monolith architecture, and security-first principles.

### Key Tenets
- **Clean V2 Architecture**: Simple, maintainable, mobile-first, and accessible.
- **Strict Data Integrity**: Confirmed 2012 founding history. No invented names, contact info, or donation credentials.
- **Foundational Security**: Environment-based secrets, strict CORS policy, safe error serialization without stack trace or credential leaks.

---

## 2. Technology Stack

- **Frontend**:
  - React 18
  - TypeScript (Strict Mode)
  - Vite
  - Tailwind CSS
  - React Router v6
- **Backend**:
  - Python 3.11+
  - FastAPI
  - Uvicorn
  - Pydantic v2 / Pydantic Settings
- **Database & ORM**:
  - PostgreSQL 16
  - SQLAlchemy 2.x
  - Alembic (database migration environment)
- **Containerization**:
  - Docker & Docker Compose (local PostgreSQL)

---

## 3. Project Structure

```text
MAHAVEER YOUTH CLUB SITE/
├── backend/
│   ├── alembic/                # Alembic migration environment
│   │   ├── versions/           # Migration revisions
│   │   └── env.py              # Migration configuration
│   ├── app/
│   │   ├── api/                # API router layer
│   │   │   └── v1/
│   │   │       ├── endpoints/  # Health and readiness endpoints
│   │   │       └── api.py      # v1 router aggregator
│   │   ├── core/               # App configuration, DB session, logging
│   │   │   ├── config.py       # Pydantic Settings
│   │   │   ├── database.py     # SQLAlchemy engine & session factory
│   │   │   └── logging.py      # Structured sanitized logger
│   │   ├── models/             # SQLAlchemy ORM declarative Base
│   │   ├── schemas/            # Pydantic validation schemas
│   │   ├── services/           # Service layer
│   │   └── main.py             # FastAPI entry point, CORS & error handlers
│   ├── tests/                  # Pytest test suite
│   ├── alembic.ini             # Alembic configuration
│   ├── pytest.ini              # Pytest configuration
│   └── requirements.txt        # Python dependencies
│
├── frontend/
│   ├── public/                 # Static assets (robots.txt, sitemap.xml, favicons)
│   ├── src/
│   │   ├── components/         # Reusable UI primitives and layout components
│   │   │   ├── layout/         # Navbar, Footer, Container, Section
│   │   │   └── ui/             # Button, Card, Badge, Spinner, Alert
│   │   ├── hooks/              # Custom hooks (usePageMeta)
│   │   ├── layouts/            # PublicLayout and AdminLayout
│   │   ├── pages/              # Public routes & admin placeholder pages
│   │   │   ├── admin/          # Admin portal, login & dashboard placeholders
│   │   │   ├── HomePage.tsx
│   │   │   ├── AboutPage.tsx
│   │   │   ├── HistoryPage.tsx
│   │   │   ├── MembersPage.tsx
│   │   │   ├── CelebrationsPage.tsx
│   │   │   ├── ActivitiesPage.tsx
│   │   │   ├── UpdatesPage.tsx
│   │   │   ├── DonatePage.tsx
│   │   │   ├── ContactPage.tsx
│   │   │   └── NotFoundPage.tsx
│   │   ├── services/           # Centralized typed API service client
│   │   ├── types/              # TypeScript interface definitions
│   │   ├── App.tsx             # Root router with public and admin routes
│   │   ├── index.css           # Tailwind base, utilities, design tokens
│   │   └── main.tsx            # React DOM mounting entry point
│   ├── index.html              # HTML5 entry template
│   ├── package.json            # Frontend dependencies & npm scripts
│   ├── tsconfig.json           # TypeScript project references
│   ├── tsconfig.app.json       # TypeScript compiler options (strict)
│   └── vite.config.ts          # Vite configuration
│
├── docs/                       # Project documentation
│   ├── DEVELOPMENT.md          # Development workflow guide
│   └── PHASE_STATUS.md         # Phase status tracker
├── docker-compose.yml          # PostgreSQL 16 container definition
├── .env.example                # Environment variables template
├── .gitignore                  # Git ignore rules
└── README.md                   # Project documentation
```

---

## 4. Getting Started & Local Development

### Prerequisites
- **Node.js**: `v18.0.0+` & npm
- **Python**: `3.11+`
- **Docker & Docker Compose** (for PostgreSQL)

---

### Step 1: Clone & Configure Environment
```bash
cp .env.example .env
```
Ensure configuration values in `.env` match your local environment. Real secrets should never be committed to source control.

---

### Step 2: Start PostgreSQL Database
```bash
docker compose up -d postgres
```

---

### Step 3: Backend Setup
```bash
# Navigate to backend
cd backend

# Create & activate Python virtual environment
python -m venv venv
# On Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# On Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run database migrations
alembic upgrade head

# Run backend tests
pytest -v

# Start development server
uvicorn backend.app.main:app --reload --port 8000
```
- Health Check: `GET http://localhost:8000/api/v1/health`
- Readiness Check: `GET http://localhost:8000/api/v1/ready`
- Interactive Docs: `http://localhost:8000/docs`

---

### Step 4: Frontend Setup
```bash
# In a separate terminal, navigate to frontend
cd frontend

# Install dependencies
npm install

# Run TypeScript check & production build
npm run build

# Start Vite development server
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 5. Public Routes (Connected to Live APIs)
- `/` — Home (with live backend connectivity widget)
- `/about` — About Us
- `/history` — History (Confirmed 2012 founding)
- `/members` — Members (Connected to live `/public/members` with privacy preservation)
- `/celebrations` — Celebrations & Photo Gallery (Connected to dynamic `/public/gallery` and `/public/gallery/years`)
- `/activities` — Activities & Welfare Programs (Connected to live `/public/activities` with category filters)
- `/updates` — Updates & Official Circulars (Connected to live `/public/updates` with search & modal reader)
- `/donate` — Donation & Contribution Information
- `/contact` — Official Contact
- `*` — 404 Not Found Page

---

## 6. Admin Control Panel (`/admin`)
- `/admin/login` — Administrator Login with Argon2id and RFC 6238 TOTP 2FA Verification
- `/admin` — CMS Dashboard with live metrics overview
- `/admin/updates` — Manage Updates & Circulars (Draft / Preview / Publish / Archive / HTML Sanitization)
- `/admin/activities` — Manage Welfare & Club Activities (Draft / Preview / Publish / Archive)
- `/admin/gallery` — Manage Festival Photos (JPEG/PNG/WebP upload, magic byte validation, automatic thumbnails, dynamic years)
- `/admin/members` — Manage Member Nicknames & Public Roster (Strict privacy, sort reordering, visibility toggle)
- `/admin/security` — Security Settings (TOTP setup wizard, single-use recovery codes, password change)
- `/admin/audit-logs` — Immutable Security & Content Audit Trail

---

## 7. Quality Standards & Rules
1. **No Invented Club Data**: Official data only. Real member nicknames only.
2. **Founding Year**: Confirmed 2012.
3. **Content Publishing Lifecycle**: Draft -> Preview -> Publish -> Archive.
4. **Member Privacy**: Nicknames only; zero personal contact details, email, or photos.
5. **Security Controls**: Server-side HTML sanitization, magic bytes image verification, UUID server filenames, path traversal protection, Argon2id password hashing, and complete audit logging.
