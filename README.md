# Ganesh Puja Club Website — Mahaveer Youth Club

Official web portal and administrative management system for **Mahaveer Youth Club**, powering the annual Ganesh Puja (Ganesh Utsav) festival, community welfare initiatives (blood donation camps, disaster relief, sports tournaments), and digital donation reconciliation.

---

## 1. Tech Stack

- **Frontend:** React 18, TypeScript (Strict Mode), Vite 5, Tailwind CSS, React Router v6
- **Backend:** Python 3.13+, FastAPI, Pydantic v2 (Settings), SQLAlchemy 2, Alembic, Uvicorn
- **Database:** PostgreSQL 16 (Docker-ready)
- **Testing & Quality:** Pytest, HTTPX, TypeScript compiler (`tsc --noEmit`), ESLint
- **Version Control:** Git

---

## 2. Project Structure

```text
MAHAVEER YOUTH CLUB SITE/
├── backend/
│   ├── alembic/                # Database migrations (Alembic environment)
│   │   ├── versions/           # Migration revision scripts
│   │   └── env.py              # Migration runtime configuration
│   ├── app/
│   │   ├── api/                # API versioned routers
│   │   │   └── v1/
│   │   │       ├── endpoints/  # API route handlers (/health, etc.)
│   │   │       └── api.py      # v1 router aggregator
│   │   ├── core/               # Core configuration, DB session, logging
│   │   │   ├── config.py       # Pydantic Settings
│   │   │   ├── database.py     # SQLAlchemy engine & session dependency
│   │   │   └── logging.py      # Structured sanitized logger
│   │   ├── models/             # SQLAlchemy ORM declarative models
│   │   ├── schemas/            # Pydantic data validation schemas
│   │   ├── services/           # Business logic layer
│   │   └── main.py             # FastAPI entry point, CORS & exception handlers
│   ├── tests/                  # Backend test suite (Pytest & TestClient)
│   ├── alembic.ini             # Alembic migration settings
│   ├── pytest.ini              # Pytest configuration
│   └── requirements.txt        # Python dependencies
│
├── frontend/
│   ├── public/                 # Static assets (favicons, icons)
│   ├── src/
│   │   ├── components/         # Reusable React components & placeholders
│   │   ├── types/              # TypeScript interface & type definitions
│   │   ├── App.tsx             # Root router with 8 approved public routes
│   │   ├── index.css           # Tailwind base, components, utilities
│   │   └── main.tsx            # React DOM mounting entry point
│   ├── index.html              # HTML5 entry template
│   ├── package.json            # Frontend dependencies and npm scripts
│   ├── postcss.config.js       # PostCSS plugins
│   ├── tailwind.config.js      # Tailwind CSS configuration
│   ├── tsconfig.json           # TypeScript project references
│   ├── tsconfig.app.json       # TypeScript app configuration (strict)
│   └── vite.config.ts          # Vite build config with backend API proxy
│
├── docs/                       # Project documentation & design artifacts
├── docker-compose.yml          # Minimal PostgreSQL 16 local database service
├── .env.example                # Environment variable configuration template
├── .gitignore                  # Git ignore rules for Python, Node, & secrets
├── PRD.md                      # Product Requirements Document
└── README.md                   # Project setup and developer guide
```

---

## 3. Local Development Setup

### Prerequisites
- **Node.js:** v18+ (v20+ recommended) & npm
- **Python:** v3.10+ (v3.13 supported)
- **Docker & Docker Compose** (for PostgreSQL, optional for offline mock)
- **Git**

---

### Step 1: Clone & Configure Environment

```bash
# Clone the repository
git clone <repository-url>
cd "MAHAVEER YOUTH CLUB SITE"

# Copy environment template
cp .env.example .env
```

---

### Step 2: Database Setup (PostgreSQL)

Start the local PostgreSQL container:

```bash
docker compose up -d postgres
```

---

### Step 3: Backend Setup (FastAPI)

```bash
# Navigate to backend directory
cd backend

# Create & activate virtual environment
python -m venv .venv

# On Windows (PowerShell):
.venv\Scripts\Activate.ps1
# On macOS/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run backend test suite
pytest tests

# Start FastAPI development server (runs on http://localhost:8000)
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Verify backend health check:
- URL: `http://localhost:8000/api/v1/health`
- Response: `{"status": "ok", "service": "Mahaveer Youth Club API", "version": "1.0.0", "environment": "development"}`
- Interactive API Docs: `http://localhost:8000/api/v1/docs`

---

### Step 4: Frontend Setup (React + Vite)

In a separate terminal window:

```bash
# Navigate to frontend directory
cd frontend

# Install npm dependencies
npm install

# Run TypeScript type check & production build
npm run build

# Start Vite dev server (runs on http://localhost:5173)
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 4. Phase 4 — Backend, Database & Admin Architecture

### 4.1 Architecture Flow
```text
Admin User
   │
   ▼
Admin Panel (/admin) [React + TypeScript + Tailwind CSS]
   │
   ▼ (Bearer JWT Authorization)
Secure REST API (/api/v1/) [FastAPI + Pydantic v2]
   │
   ├────────► Database (PostgreSQL / SQLite) [SQLAlchemy 2 + Alembic]
   │
   └────────► Media Storage (Uploads directory with MIME & size validation)
   │
   ▼ (Read-Only Public Endpoints & Fallback Data)
Public Website (/ , /about , /puja , /gallery , /history , /updates , /donate , /contact)
```

---

### 4.2 Database Models & Schemas
1. **User / Admin (`users`)**: `id`, `name`, `email` (unique index), `password_hash`, `role` (default: `admin`), `is_active`, `created_at`, `updated_at`, `last_login_at`.
2. **Club Information (`club_settings`)**: `id`, `name`, `tagline`, `description`, `location`, `address`, `landmark`, `phone`, `email`, `registration_number`, `instagram_url`, `facebook_url`, `youtube_url`, `updated_at`.
3. **Updates & Notices (`updates`)**: `id`, `title`, `slug` (unique index), `excerpt`, `content`, `image_url`, `category`, `published` (index), `published_at`, `created_at`, `updated_at`.
4. **Photo Gallery (`gallery`)**: `id`, `title`, `description`, `image_url`, `category`, `year`, `published` (index), `sort_order`, `created_at`, `updated_at`.
5. **Activities & Rituals (`activities`)**: `id`, `title`, `description`, `category` (Ritual, Welfare, Cultural, Sports), `date`, `time`, `location`, `image_url`, `featured`, `published` (index), `created_at`, `updated_at`.
6. **History Milestones (`history`)**: `id`, `year`, `title`, `description`, `tag`, `image_url`, `sort_order`, `published` (index), `created_at`, `updated_at`.
7. **Donation Settings (`donation_settings`)**: `id`, `club_name`, `upi_id`, `qr_image_url`, `description`, `suggested_amounts`, `updated_at`. *(Version 1: Official Club UPI QR only; no payment gateways or automated verification).*

---

### 4.3 Database Migrations (Alembic)
To apply database migrations to the latest revision:
```bash
cd backend
python -m alembic upgrade head
```

To rollback all migrations:
```bash
python -m alembic downgrade base
```

---

### 4.4 Authentication & Security
- **Algorithm:** JWT (HS256) with configurable expiration via `ACCESS_TOKEN_EXPIRE_MINUTES`.
- **Password Hashing:** Bcrypt with unique salt per user.
- **Authorization Guard:** `get_current_admin` FastAPI dependency enforces active admin credentials on all administrative endpoints.
- **Development Admin Credentials:**
  - Email: `admin@mahaveeryouthclub.org`
  - Password: `AdminPassword123!`

---

### 4.5 API Overview

#### Public APIs (Read-only, Published Content Only)
- `GET /api/v1/public/club` — Club profile and official contact information
- `GET /api/v1/public/updates` — Published notices (supports `?category=` filter)
- `GET /api/v1/public/updates/{slug}` — Single published notice by URL slug
- `GET /api/v1/public/gallery` — Published gallery photos (supports `?category=` and `?year=` filters)
- `GET /api/v1/public/activities` — Published rituals and welfare events (supports `?category=` filter)
- `GET /api/v1/public/history` — Published chronological history milestones
- `GET /api/v1/public/donation` — Official club UPI identifier and contribution presets

#### Admin APIs (Protected via Bearer Token)
- `POST /api/v1/auth/login` — Authenticate and receive JWT token
- `POST /api/v1/auth/logout` — Invalidate session
- `GET /api/v1/auth/me` — Current authenticated administrator profile
- `GET /api/v1/admin/stats` — Content metrics and recent notice submissions
- `GET / POST / PATCH / DELETE /api/v1/admin/updates` — Manage announcements
- `GET / POST / PATCH / DELETE /api/v1/admin/gallery` — Manage photo gallery
- `GET / POST / PATCH / DELETE /api/v1/admin/activities` — Manage schedule and events
- `GET / POST / PATCH / DELETE /api/v1/admin/history` — Manage historical chronicle
- `GET / PATCH /api/v1/admin/club` — Update club profile settings
- `GET / PATCH /api/v1/admin/donation` — Update official UPI credentials & QR
- `POST /api/v1/admin/upload` — Secure media file uploader (MIME and size verified)

---

### 4.6 Media Storage Security
- Allowed file types: `.jpg`, `.jpeg`, `.png`, `.webp` (MIME: `image/jpeg`, `image/png`, `image/webp`).
- Max upload limit: 5 MB (`MAX_UPLOAD_SIZE_BYTES`).
- Path traversal protection: Filenames with `..`, `/`, or `\` are rejected; stored files receive randomized UUID names.
- Public static serving mounted at `/uploads`.

---

### 4.7 Admin Management Panel (`/admin`)
- `/admin/login` — Accessible admin authentication interface.
- `/admin` — Real-time metrics dashboard with quick-action shortcuts.
- `/admin/updates` — Full notice management with category filtering and publication toggling.
- `/admin/gallery` — Image upload with year/category tagging and preview.
- `/admin/activities` — Ritual and event scheduling.
- `/admin/history` — Milestone chronological management.
- `/admin/club` — Club identity, registration, and social link settings.
- `/admin/donation` — Official UPI QR and contribution tier settings.

---

## 5. Development Roadmap Status

- [x] **Phase 1 — Project Foundation**
- [x] **Phase 2 — Design System & UI Foundation**
- [x] **Phase 3 — Public Website**
- [x] **Phase 4 — Backend, Database & Admin Foundation**

