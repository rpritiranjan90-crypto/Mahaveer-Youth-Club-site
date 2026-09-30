# Production Readiness & Release Checklist

**Project:** Mahaveer Youth Club Banza V2  
**Target Release:** Production Release 1.0.0  
**Phase:** Phase 6 — Final Production QA, Security, Deployment & Release  
**Status:** AUDITED & VERIFIED  

---

## Production Verification Checklist

- [x] **1. Environment Variables Configured**: Separated into development, testing, and production templates; no hardcoded production secrets in codebase.
- [x] **2. Secrets Secured**: Production `SECRET_KEY`, database credentials, and token secrets isolated from Git. `.gitignore` validated.
- [x] **3. HTTPS Enabled**: Production Nginx configuration configured with HTTP -> HTTPS 301 redirect and Let's Encrypt automated renewal.
- [x] **4. Database Configured**: PostgreSQL 16 schema optimized with primary keys, indexes on slugs, status, and foreign keys.
- [x] **5. Database Migration Verified**: Alembic head at `002_content_management` (Down-revision: `001_phase3_auth_schema`).
- [x] **6. Database Backup Configured**: Automated nightly compressed `pg_dump` script and uploads directory archive with 30-day retention documented in [`docs/BACKUP_RESTORE.md`](file:///c:/Users/rprit/Documents/MAHAVEER%20YOUTH%20CLUB%20SITE/docs/BACKUP_RESTORE.md).
- [x] **7. Restore Procedure Documented**: Complete step-by-step restoration drill and post-restore verification steps documented in [`docs/BACKUP_RESTORE.md`](file:///c:/Users/rprit/Documents/MAHAVEER%20YOUTH%20CLUB%20SITE/docs/BACKUP_RESTORE.md).
- [x] **8. Upload Storage Configured**: Local file storage service with magic byte validation, 5MB limit, UUID filenames, and path traversal protection.
- [x] **9. Admin Authentication Verified**: Argon2id password hashing, constant-time verification, JWT access tokens (15m expiry), and SHA-256 hashed refresh tokens.
- [x] **10. 2FA Verified**: RFC 6238 TOTP with temporary challenge token (`type="2fa_pending"`), single-use hashed recovery codes, and rate limiting.
- [x] **11. Authorization Verified**: Server-side role and token validation on all admin endpoints; draft and archived items return 404 to public requests.
- [x] **12. Rate Limiting Verified**: Sliding-window rate limiter protecting login and 2FA endpoints against brute force; Nginx layer rate limiting documented.
- [x] **13. CORS Verified**: Explicit origin whitelist (`CORS_ORIGINS`); no wildcard origins in production configuration.
- [x] **14. Security Headers Verified**: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-XSS-Protection: 1; mode=block`.
- [x] **15. Error Handling Verified**: Centralized FastAPI exception handlers return sanitized JSON error objects without stack traces, database strings, or paths.
- [x] **16. Audit Logs Verified**: Immutable audit trail records all authentication, content CRUD, publishing, archiving, and deletion events with sensitive data redaction.
- [x] **17. Public/Private Content Separation Verified**: Public APIs return strictly published updates, activities, gallery photos, and visible member nicknames.
- [x] **18. English UI Verified**: 257 dictionary keys mapped in [`frontend/src/locales/en.ts`](file:///c:/Users/rprit/Documents/MAHAVEER%20YOUTH%20CLUB%20SITE/frontend/src/locales/en.ts).
- [x] **19. Odia UI Verified**: 257 authentic Odia keys mapped in [`frontend/src/locales/or.ts`](file:///c:/Users/rprit/Documents/MAHAVEER%20YOUTH%20CLUB%20SITE/frontend/src/locales/or.ts) with 100% key parity and `localStorage` persistence (`myc_language`).
- [x] **20. Donation Experience Verified**: Voluntary informational guide with responsive UPI QR display, UPI ID copy with toast, pandal cash guidance, and recipient verification notice. Zero UTR/receipts/ledger.
- [x] **21. Contact Channels Verified**: Direct `tel:` call, `wa.me/` WhatsApp without prefilled text, Google Maps directions, Instagram, and YouTube links. Zero email/forms.
- [x] **22. SEO Verified**: Meta titles and descriptions on all routes, Open Graph metadata, canonical tags.
- [x] **23. Sitemap Verified**: [`frontend/public/sitemap.xml`](file:///c:/Users/rprit/Documents/MAHAVEER%20YOUTH%20CLUB%20SITE/frontend/public/sitemap.xml) includes all 9 public routes and excludes admin/API.
- [x] **24. Robots Policy Verified**: [`frontend/public/robots.txt`](file:///c:/Users/rprit/Documents/MAHAVEER%20YOUTH%20CLUB%20SITE/frontend/public/robots.txt) permits public routes and disallows `/admin/` and `/api/`.
- [x] **25. Accessibility Verified**: Semantic HTML5 hierarchy, skip-to-content link, keyboard navigation, dynamic `<html lang="...">` sync, and image alt text.
- [x] **26. Mobile Responsiveness Verified**: Tested across 360px, 390px, 412px, 768px, 1024px, 1280px without horizontal overflow.
- [x] **27. Backend Tests Passed**: 46 / 46 pytest unit and integration tests passing (100%).
- [x] **28. Frontend Type Check Passed**: `tsc -b` completes with 0 errors.
- [x] **29. Frontend Build Passed**: `npm run build` generates clean production distribution bundle.
- [x] **30. E2E Acceptance Passed**: Automated Phase 5 verification suite ([`test_phase5_experience.py`](file:///c:/Users/rprit/Documents/MAHAVEER%20YOUTH%20CLUB%20SITE/test_phase5_experience.py)) passes 100%.
- [x] **31. Deployment Procedure Documented**: Complete Ubuntu/Debian, Systemd, Uvicorn, and Nginx deployment steps documented in [`docs/DEPLOYMENT.md`](file:///c:/Users/rprit/Documents/MAHAVEER%20YOUTH%20CLUB%20SITE/docs/DEPLOYMENT.md).
- [x] **32. Rollback Procedure Documented**: Explicit frontend static rollback and backend Alembic schema downgrade steps documented in [`docs/DEPLOYMENT.md`](file:///c:/Users/rprit/Documents/MAHAVEER%20YOUTH%20CLUB%20SITE/docs/DEPLOYMENT.md).

---

## Release Status & Real-World Data Prerequisites

> ⚠️ **BLOCKER — REAL-WORLD DATA REQUIRED BEFORE PUBLIC DOMAIN LAUNCH:**
> 1. **Official Phone & WhatsApp Number**: The current site uses approved placeholder format `910000000000`. The executive committee must replace this with the active club phone number prior to public DNS activation.
> 2. **Official UPI QR & ID**: The current site displays approved placeholder text `[OFFICIAL UPI ID — TO BE PROVIDED]`. The executive committee must provide the official club UPI QR image file and UPI VPA before fundraising announcements.
> 3. **Physical Address Details**: Official street / landmark coordinates in Banza Village to be confirmed by senior committee.
