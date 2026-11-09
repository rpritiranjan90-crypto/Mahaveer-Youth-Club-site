# Project Report: Mahaveer Youth Club Community & Celebrations Portal

**Project Type:** College Minor Project  
**Domain:** Full-Stack Web Development, Cybersecurity & Community Informatics  
**Technology Stack:** React 18, TypeScript, Tailwind CSS, FastAPI, SQLAlchemy 2.0, Alembic, PostgreSQL 16 / SQLite  

---

## 1. Abstract
The **Mahaveer Youth Club Banza Portal** is an enterprise-grade, bilingual (English and Odia) web application and administrative content management system (CMS) engineered for grassroots community management and festival coordination. Founded in 2012, Mahaveer Youth Club Banza organizes annual devotional celebrations (Ganesh Chaturthi) alongside social welfare drives including blood donation camps, relief distribution, and sports tournaments. 

This project solves the historical problem of communication fragmentation, unverified social media forwards, and administrative overhead by establishing a secure, centralized digital headquarters. The portal features high-performance client-side rendering with instant language toggle, verified voluntary donation channels with official UPI QR integration, and an administrative CMS protected by multi-factor authentication (TOTP 2FA), Argon2id cryptographic hashing, binary magic-byte upload validation, and immutable security audit trails.

---

## 2. Problem Statement & Motivation
Grassroots community clubs in regional India typically struggle with:
1. **Misinformation & Scheduling Delays:** Devotees and youth volunteers miss daily ritual schedules, puja darshan timings, or blood drive notices due to delayed word-of-mouth or unverified WhatsApp forwards.
2. **Language Barriers:** Existing tech solutions often only cater to English speakers, ignoring local village elders and native devotees who require Odia (ଓଡ଼ିଆ).
3. **Absence of Centralized Archiving:** Photos, historical pandal themes, and youth member contributions across 12+ years (2012–Present) are scattered or lost across personal devices.
4. **Security Vulnerabilities:** Traditional web portals for local clubs often lack adequate cybersecurity defenses, leaving them open to SQL injection, cross-site scripting (XSS), credential stuffing, and malicious script uploads.

---

## 3. System Architecture & Design

### 3.1 High-Level Architecture
The application adopts a **Modular Monolith** architecture:

```text
┌────────────────────────────────────────────────────────┐
│               Client Tier (Browser / PWA)              │
│       React 18 + TypeScript + Tailwind CSS + Vite      │
└───────────────────────────┬────────────────────────────┘
                            │ HTTPS / REST JSON
┌───────────────────────────▼────────────────────────────┐
│               Application Server (FastAPI)             │
│  - Middleware: CORS, Rate Limiter, Error Handlers      │
│  - Security: JWT Bearer Tokens, Argon2id, TOTP 2FA     │
│  - Services: Storage (Cloudinary/Local), Audit Logger  │
└───────────────────────────┬────────────────────────────┘
                            │ SQLAlchemy 2.0 ORM
┌───────────────────────────▼────────────────────────────┐
│                    Persistence Tier                    │
│           PostgreSQL 16 / SQLite Database              │
│     (Schema migrations managed via Alembic)            │
└────────────────────────────────────────────────────────┘
```

### 3.2 Key Technical Highlights
- **Strict Type Safety:** End-to-end typing via TypeScript on the frontend and Pydantic v2 schemas on the backend.
- **Client-Side Localization Engine:** Custom React Context providing zero-latency switching between English and Odia with `localStorage` state persistence.
- **Defense-in-Depth Security:**
  - **Argon2id** password hashing with memory hardness.
  - **TOTP (RFC 6238)** two-factor authentication for administrators.
  - **Stateless JWT Tokens** with short-lived access lifecycles (15 mins) and sliding refresh tokens (7 days).
  - **Binary Magic-Byte File Validation:** Uploaded media is inspected at the binary header level (preventing executable PHP/JS disguised as JPEG).
  - **Immutable Audit Logging:** Every administrative action is automatically logged with actor email, action type, IP address, and timestamp.

---

## 4. Database Schema & Entities

```text
+------------------+         +------------------+
|      users       |         |    audit_logs    |
+------------------+         +------------------+
| id (PK)          |         | id (PK)          |
| email            |         | actor_email      |
| password_hash    |         | action           |
| is_admin         |         | target_type      |
| totp_enabled     |         | target_id        |
| totp_secret      |         | details          |
| created_at       |         | timestamp        |
+------------------+         +------------------+

+------------------+         +------------------+
|     updates      |         |    activities    |
+------------------+         +------------------+
| id (PK)          |         | id (PK)          |
| title_en         |         | title_en         |
| title_or         |         | title_or         |
| content_en       |         | description_en   |
| content_or       |         | description_or   |
| category         |         | date             |
| status           |         | image_url        |
| published_at     |         | status           |
+------------------+         +------------------+

+------------------+         +------------------+
|  gallery_photos  |         |     members      |
+------------------+         +------------------+
| id (PK)          |         | id (PK)          |
| title_en         |         | name             |
| title_or         |         | nickname         |
| year             |         | designation_en   |
| category         |         | designation_or   |
| image_url        |         | category         |
| status           |         | status           |
+------------------+         +------------------+
```

---

## 5. Testing & Verification

The project includes an automated test suite verifying core functional and security behaviors:
- **Test Runner:** Pytest 8.x + pytest-asyncio
- **Coverage Areas:**
  - Authentication & 2FA lifecycle (Argon2id verification, TOTP enrollment & challenge)
  - Security Content & File Upload magic-byte checks
  - CRUD operations for Updates, Activities, Gallery, and Members
  - Database Backup & Restore integrity verification
  - Health & Readiness probes (`/api/v1/health`, `/api/v1/ready`)
- **Results:** **100 Passed, 0 Failed** across 100 automated test cases.

---

## 6. Viva Voce Defense Guide (Frequently Asked Questions)

### Q1: Why use FastAPI instead of Flask or Django?
**Answer:** FastAPI provides native asynchronous (`async/await`) execution out of the box, offering near NodeJS/Go level performance. It utilizes Python type hints and Pydantic v2 for automatic input validation and serialization, and generates interactive Swagger (`/docs`) and ReDoc documentation automatically.

### Q2: How does the application prevent unauthorized uploads?
**Answer:** The upload pipeline does not rely on client-supplied file extensions or MIME headers. Instead, it reads the binary magic bytes (the file signature at offset 0) using Python's Pillow and byte inspection to verify that the file is authentic JPEG, PNG, or WebP. Files are streamed with memory limits to prevent Denial of Service (DoS) attacks.

### Q3: How is password security managed?
**Answer:** Passwords are hashed using **Argon2id**, the winner of the Password Hashing Competition. Unlike MD5 or SHA256, Argon2id is memory-hard, making it highly resistant to GPU and ASIC brute-force cracking attacks.

### Q4: How is data consistency maintained across schema changes?
**Answer:** The backend uses **Alembic** migration scripts. On startup, the FastAPI lifespan event automatically applies all pending migrations to the database head, ensuring zero schema drift across environments without data loss.

---

## 7. Conclusion
The Mahaveer Youth Club Portal successfully bridges modern web technologies with grassroots cultural preservation. By combining strict type safety, multilingual capabilities, enterprise security standards, and comprehensive automated test coverage, the project fulfills all criteria of an academic minor project while remaining production-deployable.

