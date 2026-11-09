# Mahaveer Youth Club Banza — College Minor Project Presentation (PPT)

**Project Title:** Mahaveer Youth Club Banza — Full-Stack Community & Celebrations Portal  
**Domain:** Web Engineering, Information Security & Grassroots Informatics  
**Tech Stack:** React 18, TypeScript, Tailwind CSS, FastAPI, SQLAlchemy 2.0, Alembic, PostgreSQL 16 / SQLite  

---

## Slide 1: Title Slide
- **Heading:** Mahaveer Youth Club Banza Portal
- **Subheading:** A Modern, Bilingual, Secure Full-Stack Community & Festival Platform
- **Presented by:** [Your Name] (Roll No: [Your Roll Number])
- **Department:** Department of Computer Science & Engineering / IT
- **Institution:** [Your College / University Name]
- **Project Guide:** [Guide / Professor Name]

> **Speaker Note:**  
> *"Respected panel members and guide, good morning. Today, I present my minor project: the Mahaveer Youth Club Banza Portal—a production-grade, bilingual web application designed to digitize festival management, youth member records, community welfare initiatives, and transparent donations."*

---

## Slide 2: Problem Statement & Motivation
- **Fragmented Communication:** Schedules and announcements scattered across unverified WhatsApp forwards.
- **Language Exclusion:** Most existing portals only support English, excluding village elders and native Odia devotees.
- **Lack of Digital Preservation:** Over 12 years (2012–Present) of festival pandal themes, photo memories, and charity records were unorganized.
- **Security Deficits:** Traditional community websites lack protection against XSS, brute-force attacks, and malicious file uploads.

> **Speaker Note:**  
> *"Traditional grassroots clubs face huge coordination challenges during peak festivities. Devotees miss aarti or bhog timings due to informal communication, and decades of cultural archives are lost. This project addresses these issues directly with an authoritative, accessible, and secure digital headquarters."*

---

## Slide 3: Proposed Solution & Objectives
- **Centralized Public Hub:** 100% reliable festive schedules, notices, historical photo archives, and verified contact channels.
- **Native Bilingual Accessibility:** Instant zero-latency switching between English and Odia (ଓଡ଼ିଆ) with persistent state.
- **Verified Voluntary Contributions:** Transparent official UPI QR integration, verified cash pandal guidelines, and recipient verification safety notices.
- **Secure Admin CMS:** Dedicated dashboard for real-time announcements, gallery uploads, member directory management, and system audits.

> **Speaker Note:**  
> *"Our objective was not just to build a simple website, but a resilient community platform. We prioritized native Odia language support, clear donation transparency with official club UPI details, and a high-security administrative backend."*

---

## Slide 4: Technology Stack
- **Frontend Layer:**
  - React 18 (Strict Mode)
  - TypeScript (Compile-time Type Safety)
  - Tailwind CSS (Mobile-first responsive styling)
  - Vite (Instant HMR & 2-second optimized bundle build)
- **Backend Layer:**
  - Python 3.11+ with **FastAPI** (Asynchronous ASGI architecture)
  - Pydantic v2 (Strict schema validation & serialization)
  - Uvicorn (High-performance ASGI web server)
- **Persistence & Operations:**
  - SQLAlchemy 2.0 ORM & Alembic (Automated schema migrations)
  - PostgreSQL 16 / SQLite
  - Docker & Docker Compose (Containerized local database)

> **Speaker Note:**  
> *"We chose FastAPI for the backend because of its asynchronous speed, automatic OpenAPI generation, and strict data validation using Pydantic. On the frontend, React with TypeScript ensures robust type safety and eliminates runtime errors."*

---

## Slide 5: System Architecture (Modular Monolith)
- **Client Tier:** React SPA / PWA making RESTful HTTPS requests with JWT Bearer authentication.
- **Application Tier (FastAPI):**
  - Modular routers: Public, Auth, Updates, Activities, Gallery, Members, Assets, Audit Logs.
  - Middleware: CORS whitelisting, rate limiting, and exception handlers.
- **Persistence Tier:** SQLAlchemy declarative models with automated database schema migration on startup.
- **Media Pipeline:** Local streaming & optional Cloudinary cloud storage with MIME magic-byte validation.

> **Speaker Note:**  
> *"The project follows a clean Modular Monolith architecture. The frontend communicates with the backend via RESTful endpoints. Security middleware handles rate limiting and CORS, while Alembic guarantees that the database schema is always in sync."*

---

## Slide 6: Bilingual Localization Engine (English & Odia)
- **Custom React Context (`LanguageContext`):**
  - Lightweight, custom dictionary-based i18n system (`en.ts` and `or.ts`).
  - Zero external bloat; fast and reactive.
- **Seamless User Experience:**
  - Instant language switching without page reloads or API round-trips.
  - Persistent state in browser `localStorage` (`myc_language`).
  - Accessible Odia typography and localized cultural terms.

> **Speaker Note:**  
> *"A standout feature of this project is its bilingual capability. With one click in the top navigation bar, the entire website dynamically re-renders in Odia or English. Devotees and elders can read updates comfortably in their mother tongue."*

---

## Slide 7: Enterprise-Grade Security Architecture
- **Argon2id Password Hashing:** Memory-hard cryptography, immune to GPU/ASIC brute-force attacks.
- **Multi-Factor Authentication (TOTP 2FA):** Standard RFC 6238 time-based one-time passwords for administrative sessions.
- **Stateless JWT Tokens:** 15-minute access token lifecycles with secure sliding refresh tokens.
- **Binary Magic-Byte Inspection:** Media uploads are checked at the binary byte header level, preventing executable scripts disguised as images.
- **Immutable Audit Logging:** Every create, edit, or delete action is permanently logged with actor email, IP address, and timestamp.

> **Speaker Note:**  
> *"Security was designed from day one. Instead of outdated MD5 or SHA256, we use Argon2id. We enforce two-factor authentication for admins, and all uploaded images are scanned for real file headers so malicious files cannot compromise the server."*

---

## Slide 8: Key Features & Demonstration
- **1. Public Experience:**
  - Hero section with live festival branding and 2012 foundation badge.
  - Interactive Celebrations Gallery with dynamic year and category filters.
  - Official Notices & Announcements with client-side keyword search.
  - Voluntary donation guidance with copy-to-clipboard UPI ID and official QR.
- **2. Administrative Control Management (CMS):**
  - Centralized dashboard displaying statistics and system health.
  - Full CRUD operations for circulars, activities, and member records.
  - Live audit log viewer displaying tamper-resistant history.
- **3. Interactive Swagger Documentation (`/docs`):**
  - Real-time OpenAPI explorer for live API inspection.

> **Speaker Note:**  
> *"I will now demonstrate the live platform: first, the public pages and language switcher; second, the admin portal with CRUD management and audit logs; and finally, our interactive Swagger API explorer."*

---

## Slide 9: Testing & Quality Assurance
- **Automated Backend Test Suite:**
  - Built with `pytest` and `pytest-asyncio`.
  - Comprehensive unit and integration coverage across Auth, Security, Media, Gallery, Members, and Health.
  - **Result: 100 Passed, 0 Failed (100% Pass Rate in ~11 seconds).**
- **Frontend Build Stability:**
  - Strict TypeScript compilation (`tsc -b && vite build`).
  - **Result: 0 Type Errors, production bundle generated in ~1.9 seconds.**
- **Progressive Web App (PWA):**
  - Web App Manifest configured for installability on mobile and desktop.

> **Speaker Note:**  
> *"We validated the system using an automated test suite. Pytest runs 100 test cases verifying our security rules, API endpoints, and database transactions with a 100% pass rate. The frontend builds with zero TypeScript warnings."*

---

## Slide 10: Conclusion & Future Scope
- **Conclusion:**
  - Successfully delivered an authoritative, bilingual, and secure digital platform for Mahaveer Youth Club Banza.
  - Surpasses academic minor project requirements with enterprise security and automated testing.
- **Future Roadmap (Phase 2 & 3):**
  - YouTube Live Darshan stream integration for Ganesh Puja.
  - Emergency voluntary blood donor directory for local healthcare assistance.
  - Service worker offline caching for festival schedules.

> **Speaker Note:**  
> *"In conclusion, this project combines cultural heritage with modern software engineering and cybersecurity best practices. In future phases, we plan to introduce live darshan streaming and a blood donor registry. Thank you, and I look forward to your questions."*
