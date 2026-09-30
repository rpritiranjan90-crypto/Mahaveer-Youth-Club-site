# Mahaveer Youth Club Banza V2

Official website, multilingual public experience, and administrative portal for **Mahaveer Youth Club Banza** (Established 2012).

---

## 1. Project Purpose & Overview
Mahaveer Youth Club Banza V2 is a clean, production-oriented community website and application shell built with modern web best practices, strict type safety, modular monolith architecture, and security-first principles.

### Key Tenets
- **Clean Multilingual Experience**: High-quality English and Odia (ଓଡ଼ିଆ) localization with persistent language toggle (`myc_language`).
- **Strict Data Integrity**: Confirmed 2012 founding history. No invented names, contact info, or donation credentials.
- **Simplified Voluntary Donation**: Clear official UPI QR image, UPI ID copy with toast, cash pandal guidance, and recipient safety verification warning.
- **Direct Contact Channels**: Instant phone call, WhatsApp direct messaging, Google Maps directions, and official social channels.
- **Foundational Security & Privacy**: Environment-based secrets, strict CORS policy, member nickname-only privacy model, magic byte file upload validation, server-side HTML sanitization, and immutable audit trails.

---

## 2. Technology Stack

- **Frontend**:
  - React 18
  - TypeScript (Strict Mode)
  - Vite
  - Tailwind CSS
  - React Router v6
  - Custom Lightweight Localization System (English & Odia)
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
│   │   │       ├── endpoints/  # Health, Auth, CMS (Updates, Activities, Gallery, Members)
│   │   │       └── api.py      # v1 router aggregator
│   │   ├── core/               # App configuration, DB session, logging, security
│   │   │   ├── config.py       # Pydantic Settings
│   │   │   ├── database.py     # SQLAlchemy engine & session factory
│   │   │   ├── security.py     # Argon2id, JWT, TOTP 2FA
│   │   │   └── logging.py      # Structured sanitized logger
│   │   ├── models/             # SQLAlchemy ORM declarative models
│   │   ├── schemas/            # Pydantic validation schemas
│   │   ├── services/           # Storage, HTML sanitizer, Audit logger
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
│   │   │   ├── layout/         # Navbar (with English/Odia toggle), Footer, Container, Section
│   │   │   ├── content/        # SectionHeader, CTASection
│   │   │   ├── gallery/        # GalleryGrid, GalleryLightbox
│   │   │   └── ui/             # Button, Card, Badge, Spinner, Alert, Modal, EmptyState, LoadingState, ErrorState
│   │   ├── context/            # LanguageContext (English & Odia switcher with persistence)
│   │   ├── locales/            # en.ts & or.ts translation dictionaries
│   │   ├── hooks/              # Custom hooks (usePageMeta)
│   │   ├── layouts/            # PublicLayout and AdminLayout
│   │   ├── pages/              # Multilingual public routes & admin CMS pages
│   │   │   ├── admin/          # Admin login, dashboard, updates, activities, gallery, members, security, audit logs
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
│   │   ├── App.tsx             # Root router wrapped with LanguageProvider & AuthProvider
│   │   ├── index.css           # Tailwind base, utilities, design tokens
│   │   └── main.tsx            # React DOM mounting entry point
│   ├── index.html              # HTML5 entry template with Open Graph & SEO
│   ├── package.json            # Frontend dependencies & npm scripts
│   ├── tsconfig.json           # TypeScript project references
│   ├── tsconfig.app.json       # TypeScript compiler options (strict)
│   └── vite.config.ts          # Vite configuration
│
├── docs/                       # Project documentation
│   ├── DEVELOPMENT.md          # Development workflow guide
│   ├── PHASE_STATUS.md         # Phase status tracker
│   ├── PUBLIC_EXPERIENCE.md    # Public experience, localization & donation guide
│   └── SECURITY.md             # Security architecture & controls
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

## 5. Multilingual Public Routes (Connected to Live APIs)
- `/` — Home (Devotional heritage hero, CMS preview cards, system health widget)
- `/about` — About Us (Confirmed 2012 founding story, community purpose pillars)
- `/history` — History & Milestones (Confirmed 2012 chronological timeline)
- `/members` — Members (Connected to live `/public/members` with privacy preservation)
- `/celebrations` — Celebrations & Photo Gallery (Dynamic years from `/gallery/years`, photo lightbox)
- `/activities` — Activities & Welfare Programs (Connected to `/public/activities` with category filters)
- `/updates` — Updates & Official Circulars (Connected to `/public/updates` with search & modal reader)
- `/donate` — Simplified Voluntary Donation Guide (UPI QR, UPI ID copy, cash instructions, verification notice)
- `/contact` — Contact Channels (Direct Call, WhatsApp, Google Maps directions, Instagram, YouTube)
- `*` — 404 Not Found Page

---

## 6. Admin Control Panel (`/admin` — English Only)
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
3. **Localization Integrity**: 100% key parity between English and Odia with safe fallback to English. Admin panel remains English-only.
4. **Content Publishing Lifecycle**: Draft -> Preview -> Publish -> Archive.
5. **Member Privacy**: Nicknames only; zero personal contact details, email, or photos.
6. **Security Controls**: Server-side HTML sanitization, magic bytes image verification, UUID server filenames, path traversal protection, Argon2id password hashing, and complete audit logging.
