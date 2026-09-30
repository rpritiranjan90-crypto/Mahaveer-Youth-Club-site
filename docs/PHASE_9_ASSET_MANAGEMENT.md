# Phase 9 — Logo & Yearly Ganesh Image Management Report
**Project:** Mahaveer Youth Club Banza V2  
**Date:** September 30, 2026  
**Reviewer:** Senior Full-Stack Engineer, Security Engineer, QA & Production-Readiness Reviewer  
**Audit Scope:** Official Club Logo Management, Current-Year Ganesh Image Management, Secure Storage, Database Metadata, Public & Admin APIs, Frontend Integration  

---

## 1. Objective

Phase 9 implements secure, production-ready asset management for:
1. **Official Mahaveer Youth Club Banza Logo**: Upload, preview, replace, and delete capabilities with seamless public header/navbar and footer integration, falling back to the text brand badge when no logo is uploaded or if asset retrieval fails.
2. **Current-Year Ganesh / Puja Festival Image**: Dedicated annual idol and mandap celebration image management with explicit festival year metadata (e.g. 2026), displayed naturally in the homepage hero/about showcase section with graceful fallbacks.

The administrator can manage these critical branding assets directly from the admin panel without modifying code or redeploying the application.

---

## 2. Architecture

```text
Admin Portal (/admin/assets)
    │
    ▼ (Authenticated via HttpOnly Cookie + Session Token, 2FA protected)
Admin Asset API (/api/v1/admin/assets/{logo, ganesh/current})
    │
    ▼ (MIME, Magic Bytes, Pillow Verification, Max 5MB, UUID Sanitization)
Secure Storage Pipeline (uploads/assets/<uuid>.<ext>)
    │
    ▼ (Metadata Tracking: Dimensions, File Size, Mime Type, Year, Active Flag)
Database Table (site_assets)
    │
    ▼ (Audit Event Logging: UPLOAD_*, REPLACE_*, DELETE_*)
Audit Logs Table (audit_logs)
    │
    ▼ (Public Safe Metadata & Cached Delivery with Version Tokens)
Public Client Pages (Navbar, Footer, HomePage Showcase)
```

---

## 3. Database Changes

### Table: `site_assets`
Created via Alembic Migration `003_site_assets.py` (`backend/alembic/versions/003_site_assets.py`).

| Column | Type | Constraints / Details |
| :--- | :--- | :--- |
| `id` | `INTEGER` | Primary Key, Auto-increment, Indexed |
| `asset_type` | `VARCHAR(50)` | Indexed (`'LOGO'`, `'GANESH_CURRENT'`) |
| `year` | `INTEGER` | Nullable, Indexed (e.g. `2026` for festival image) |
| `storage_path` | `VARCHAR(500)` | Public URL path (`/uploads/assets/<uuid>.<ext>`) |
| `original_filename` | `VARCHAR(255)` | Sanitized client original filename |
| `mime_type` | `VARCHAR(50)` | Validated MIME type (`image/jpeg`, `image/png`, `image/webp`) |
| `file_size` | `INTEGER` | Exact file size in bytes |
| `width` | `INTEGER` | Image width in pixels |
| `height` | `INTEGER` | Image height in pixels |
| `is_active` | `BOOLEAN` | Indexed, default `True` |
| `created_by` | `INTEGER` | Foreign Key (`users.id`, `ON DELETE SET NULL`) |
| `created_at` | `TIMESTAMP` | Server default `CURRENT_TIMESTAMP` |
| `updated_at` | `TIMESTAMP` | Auto-updated on modification |

---

## 4. API Endpoints

### Public Endpoints
- `GET /api/v1/public/assets/logo` (and `/api/v1/assets/logo`): Returns active official logo public metadata or `404 Not Found` if none uploaded.
- `GET /api/v1/public/assets/ganesh/current` (and `/api/v1/assets/ganesh/current`): Returns active current-year Ganesh image public metadata or `404 Not Found` if none uploaded.

### Protected Admin Endpoints (`get_current_admin` required)
- `GET /api/v1/admin/assets/logo`: Fetches current logo asset metadata.
- `POST /api/v1/admin/assets/logo`: Uploads or replaces the official logo (`multipart/form-data`).
- `DELETE /api/v1/admin/assets/logo`: Deletes active logo and purges physical file.
- `GET /api/v1/admin/assets/ganesh/current`: Fetches current-year Ganesh image metadata.
- `POST /api/v1/admin/assets/ganesh/current`: Uploads or replaces current-year Ganesh image (`file`, `year: int`).
- `DELETE /api/v1/admin/assets/ganesh/current`: Deletes active Ganesh image and purges physical file.

---

## 5. Storage

- Storage Service: `backend/app/services/storage.py` (`StorageService.save_site_asset`).
- Upload Directory: `uploads/assets/` under project root.
- Server-side UUID generation: Completely isolates storage path from user-supplied filenames.
- Path traversal protection: Path verification ensures files cannot be written or deleted outside `upload_root`.

---

## 6. Official Logo Management

- **Upload & Replace**: Administrators can upload a high-resolution PNG, WebP, or JPEG logo.
- **Navbar & Footer Display**: Loaded dynamically via `BrandContext`. Renders responsive, crisp logo image in public navbar and footer.
- **Fallback**: When no logo has been uploaded or if network loading fails, gracefully displays the classic text-based brand badge (`MYC`) and title without breaking layout.
- **Real Data Compliance**: No placeholder or AI-generated logo is invented; system defaults cleanly to text fallback until the real club emblem is uploaded.

---

## 7. Current-Year Ganesh Image Management

- **Explicit Year Support**: Stores year metadata (e.g. 2026, 2027) in the database and links to the annual puja cycle.
- **Homepage Integration**: Displayed in `HomePage.tsx` alongside the core values section in a devotional showcase card.
- **Responsive & Un-distorted**: Maintains natural proportions, responsive aspect ratios, and subtle warm accents without intrusive filters or aggressive zoom.
- **Fallback**: Displays clean status text when pending upload.

---

## 8. Upload Validation

- **MIME & Magic Bytes**: Verifies initial bytes (`\xFF\xD8\xFF` for JPEG, `\x89PNG` for PNG, `RIFF...WEBP` for WebP).
- **Pillow Integrity Verification**: `PIL.Image.open().verify()` ensures non-corrupted and valid image streams.
- **SVG & Script Rejection**: SVG, HTML, JavaScript, and polyglot executables are strictly rejected with `HTTP 400 Bad Request`.
- **Max File Size**: Hard limit of **5 MB** enforced at backend level.

---

## 9. Authorization & Security

- All administrative asset endpoints strictly require `get_current_admin` dependency (Argon2id + 2FA TOTP verified session).
- Unauthorized requests return `401 Unauthorized`; non-admin authenticated users receive `403 Forbidden`.
- Every upload, replacement, and deletion writes an immutable record to `audit_logs` table (`UPLOAD_LOGO`, `REPLACE_LOGO`, `DELETE_LOGO`, `UPLOAD_GANESH_CURRENT`, `REPLACE_GANESH_CURRENT`, `DELETE_GANESH_CURRENT`).

---

## 10. Deletion Behavior

1. Administrator confirms deletion in modal dialog.
2. Endpoint locates active database record.
3. Database record is deleted.
4. Physical file is unlinked from storage via `StorageService.delete_file()`.
5. Audit log event is recorded.
6. Public website immediately returns 404 for asset and falls back to text brand / pending state.

---

## 11. Replacement Behavior

1. Administrator uploads new image file (and year for Ganesh image).
2. Backend validates magic bytes, structure, and size.
3. New image is written with unique UUID to `uploads/assets/`.
4. Previous active database records are replaced.
5. Old physical files are cleaned up from storage to prevent orphan file accumulation.
6. Cache-busting version token (`?v=<timestamp>`) is updated so users immediately see the new asset without browser cache lock-in.

---

## 12. Frontend Changes

- **Types**: Added `SiteAsset` interface in `frontend/src/types/content.ts`.
- **API Service**: Added 7 asset API methods in `frontend/src/services/api.ts`.
- **Brand Context**: Created `frontend/src/context/BrandContext.tsx` providing reactive `logo` and `currentGanesh` state with auto-refresh and error recovery.
- **Admin Assets Page**: Created `frontend/src/pages/admin/AdminAssetsPage.tsx` with dual upload/preview/replace/delete panels, dimension display, and confirmation modals.
- **Admin Navigation**: Updated `AdminLayout.tsx` and `AdminDashboardPage.tsx` with "Assets" management link.
- **Navbar & Footer**: Updated `Navbar.tsx` and `Footer.tsx` with dynamic brand logo and text fallback.
- **Homepage**: Updated `HomePage.tsx` with current-year Ganesh Puja showcase card.
- **Localization**: Added full English and Odia translation keys in `en.ts` and `or.ts` with 100% parity.

---

## 13. Accessibility (a11y)

- Logo `alt` text: `"Mahaveer Youth Club Banza official logo"` / `"Mahaveer Youth Club Banza ଅଫିସିଆଲ୍ ଲୋଗୋ"`.
- Ganesh `alt` text: `"Mahaveer Youth Club Banza Ganesh Chaturthi 2026"` / `"Mahaveer Youth Club Banza ଗଣେଶ ଚତୁର୍ଥୀ 2026"`.
- Focus outlines, screen-reader labels, aria-modal dialogs, and minimum 44×44px touch targets enforced across all controls.

---

## 14. Tests Executed

### Backend Test Suite:
```bash
python -m pytest -v
```
**Results:** `57 passed in 11.26s` (10 new asset tests + 47 existing regression tests).

Test cases covered:
1. `test_admin_upload_logo_success`
2. `test_unauthorized_user_cannot_upload_logo`
3. `test_admin_replaces_and_deletes_logo`
4. `test_admin_upload_current_ganesh_success`
5. `test_unauthorized_user_cannot_upload_ganesh`
6. `test_admin_replaces_and_deletes_current_ganesh`
7. `test_svg_and_script_rejection`
8. `test_invalid_magic_bytes_rejection`
9. `test_oversized_file_rejection`
10. `test_invalid_festival_year_rejection`

---

## 15. Build Verification

- **TypeScript Compilation**:
  ```bash
  npx tsc -b
  ```
  **Result:** `0 errors` (Clean exit code 0).

- **Production Bundle Build**:
  ```bash
  npm run build
  ```
  **Result:** `dist/assets/index-zWhy6j9z.js` (410.51 kB / gzip: 105.73 kB) built in 1.88s.

---

## 16. Security Verification

- Phase 7 security baseline strictly maintained:
  - `HttpOnly` refresh token cookie + `sessionStorage` access token
  - Content Security Policy (CSP) allowing only self-hosted media and verified fonts
  - Permissions-Policy and anti-clickjacking headers (`X-Frame-Options: DENY`)
  - 2FA TOTP enforcement for administrative actions
  - Magic byte and Pillow image verification preventing polyglot file execution

---

## 17. Real Assets Status & Known Limitations

- **Current Assets**: Official logo and current-year Ganesh photo are not seeded with fake images. The system is in clean fallback mode, ready to receive the official real logo and 2026 Ganesh Puja photograph via the admin panel.
- **Scope Limit**: Phase 9 handles official logo and current-year Ganesh image only; member photo management and full gallery management are reserved for subsequent phases.

---

## 18. Future Phase 10 Requirements

- Member roster photograph management and individual avatar upload controls.
- Dedicated member profile card management and privacy toggles.

---

## 19. Phase 9 Acceptance Checklist

- [x] Logo upload works
- [x] Logo preview works
- [x] Logo replacement works
- [x] Logo deletion works
- [x] Logo fallback works
- [x] Ganesh upload works
- [x] Ganesh preview works
- [x] Ganesh replacement works
- [x] Ganesh deletion works
- [x] Ganesh fallback works
- [x] Festival year stored in database
- [x] Secure storage pipeline reused
- [x] Backend validation (magic bytes, Pillow, MIME, size) works
- [x] Unauthorized access blocked
- [x] IDOR protection verified
- [x] Public API works
- [x] Admin UI works
- [x] Homepage integration works
- [x] Accessibility verified
- [x] English translations verified
- [x] Odia translations verified
- [x] Mobile responsive layout verified
- [x] All 57 backend tests pass
- [x] TypeScript passes with 0 errors
- [x] Production build passes cleanly
- [x] Documentation created

---

## 20. Final Status

**FINAL PHASE 9 STATUS:** `PASS`
