# Mahaveer Youth Club Banza V2 — Development Guide

## 1. Overview & Architecture
Mahaveer Youth Club Banza V2 is structured as a clean, production-oriented monorepo:
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Python 3.11+ + FastAPI + Uvicorn + SQLAlchemy 2.x
- **Database**: PostgreSQL 16 (configured with connection pooling and async engine capability)
- **Migrations**: Alembic

---

## 2. Prerequisites
- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher
- **Python**: `3.11+`
- **Docker & Docker Compose** (for PostgreSQL database)

---

## 3. Local Development Setup

### 3.1. Clone and Environment Setup
Copy the example environment template:
```bash
cp .env.example .env
```
Ensure your `.env` contains:
```ini
APP_ENV=development
APP_NAME=Mahaveer Youth Club Banza API
APP_DEBUG=true
DATABASE_URL=postgresql://myc_user:myc_password@localhost:5432/myc_db
CORS_ORIGINS=["http://localhost:5173","http://localhost:3000","http://127.0.0.1:5173"]
SECRET_KEY=dev-secret-key-change-in-production-only
VITE_API_URL=http://localhost:8000/api/v1
```

### 3.2. Start PostgreSQL with Docker
```bash
docker compose up -d postgres
```
This starts PostgreSQL 16 on port `5432` with database `myc_db`.

### 3.3. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
python -m venv venv
# On Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# On Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run database migrations
alembic upgrade head

# Start development server with reload
uvicorn backend.app.main:app --reload --port 8000
```
Backend API will be accessible at: `http://localhost:8000`  
API Docs (Swagger): `http://localhost:8000/docs`  
Health Check: `http://localhost:8000/api/v1/health`  
Readiness Check: `http://localhost:8000/api/v1/ready`

### 3.4. Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
Frontend web application will be accessible at: `http://localhost:5173`

---

## 4. Testing & Verification

### 4.1. Backend Tests
Run the pytest test suite:
```bash
cd backend
pytest -v
```

### 4.2. Frontend Type Checking & Build
Run strict TypeScript compilation and production bundle build:
```bash
cd frontend
npm run build
```

---

## 5. Development Standards
1. **Never invent real-world club info**: Use placeholders like `[OFFICIAL PHONE NUMBER — TO BE PROVIDED]`, `[OFFICIAL UPI ID — TO BE PROVIDED]`.
2. **Founding date**: Established in 2012.
3. **Member roster**: Uses placeholders `Member Nickname 01` through `Member Nickname 40` until official roster confirmation.
4. **Error handling**: All backend endpoints return structured error JSON without leaking internal database, path, or credential details.
5. **Logging**: Security-conscious structured logging without logging tokens, passwords, or credentials.
