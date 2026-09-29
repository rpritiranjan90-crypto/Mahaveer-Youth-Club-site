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

Open `http://localhost:5173` in your browser. All 8 routes (`/`, `/about`, `/history`, `/puja`, `/gallery`, `/updates`, `/donate`, `/contact`) are registered and ready for Phase 2 styling and Phase 3 page composition.

---

## 4. Development Roadmap & Phases

- [x] **Phase 0 — Planning & Specifications (PRD.md)**
- [x] **Phase 1 — Technical Project Foundation (FastAPI + React + Vite + Tailwind + DB Architecture)**
- [ ] **Phase 2 — UI Foundation & Design System (Tokens, Themes, Core Layouts)**
- [ ] **Phase 3 — Public Website Implementation (8 Pages)**
- [ ] **Phase 4 — Backend Features & Database Models**
- [ ] **Phase 5 — Admin Management Panel**
- [ ] **Phase 6 — Security, Rate Limiting & Auditing**
- [ ] **Phase 7 — Donation & Dynamic UPI Reconciliation**
- [ ] **Phase 8 — Real Content & Media Integration**
- [ ] **Phase 9 — Comprehensive End-to-End Testing**
- [ ] **Phase 10 — Production Deployment & CI/CD**
- [ ] **Phase 11 — Launch & Festive Operations**
