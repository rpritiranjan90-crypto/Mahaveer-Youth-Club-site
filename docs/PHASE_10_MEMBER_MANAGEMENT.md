# PHASE 10 — MEMBER ROSTER & MEMBER PHOTO MANAGEMENT REPORT
## Project: Mahaveer Youth Club Banza V2

---

### 1. Objective
Implement a secure, production-ready, privacy-first **Member Management System** for Mahaveer Youth Club Banza.
The system empowers authorized administrators to maintain real club members, designations, optional biographies, photographs, display ordering, and public visibility without code changes or redeployments.

---

### 2. Architecture & Flow

```
Admin Login (2FA / Session)
        ↓
Admin Member Management (/admin/members)
        ↓
Add / Edit / Photo Upload / Visibility / Reorder / Delete
        ↓
Backend Validation (MIME, Magic Bytes, Pillow Integrity, Dimensions)
        ↓
Secure File Storage (/uploads/members/UUID.ext)
        ↓
Database Record & Audit Trail (members table, audit_logs)
        ↓
Public Member Roster (/members) — Privacy Protected (Active Only)
```

---

### 3. Database Schema

#### `members` Table (`backend/app/models/member.py`)
| Column | Type | Nullable | Description |
| :--- | :--- | :--- | :--- |
| `id` | Integer | No (PK) | Auto-incrementing primary key |
| `name` | VARCHAR(150) | No | Member's full name |
| `designation` | VARCHAR(150) | No | Role (e.g., President, Secretary, Member) |
| `bio` | TEXT | Yes | Optional short profile / contribution summary |
| `photo_storage_path` | VARCHAR(500) | Yes | Safe relative URL (`/uploads/members/uuid.ext`) |
| `photo_original_filename`| VARCHAR(255) | Yes | Original uploaded filename |
| `photo_mime_type` | VARCHAR(50) | Yes | Validated MIME type (`image/jpeg`, `image/png`, `image/webp`) |
| `photo_file_size` | INTEGER | Yes | File size in bytes |
| `photo_width` | INTEGER | Yes | Image width in pixels |
| `photo_height` | INTEGER | Yes | Image height in pixels |
| `display_order` | INTEGER | No | Custom display order (default `0`, indexed) |
| `is_active` | BOOLEAN | No | Public visibility flag (default `True`, indexed) |
| `created_by` | INTEGER | Yes | Foreign key to `users.id` (ondelete SET NULL) |
| `updated_by` | INTEGER | Yes | Foreign key to `users.id` (ondelete SET NULL) |
| `created_at` | DATETIME | No | Server timestamp (default CURRENT_TIMESTAMP) |
| `updated_at` | DATETIME | Yes | Auto-updating timestamp |

*Backward Compatibility*: Hybrid properties map `display_name` <-> `name`, `role` <-> `designation`, `sort_order` <-> `display_order`, and `is_visible` <-> `is_active`.

---

### 4. Database Migration
- **Migration File**: [`backend/alembic/versions/004_member_management.py`](file:///c:/Users/rprit/Documents/MAHAVEER%20YOUTH%20CLUB%20SITE/backend/alembic/versions/004_member_management.py)
- **Revision ID**: `004_member_management` (revises `003_site_assets`)
- **Status**: Applied successfully to SQLite database `mahaveer.db`.

---

### 5. API Endpoints

#### Public Endpoints
- `GET /api/v1/public/members`
  - **Access**: Public (Anonymous)
  - **Query Params**: `page` (default 1), `page_size` (default 100)
  - **Filters**: Returns only `is_active == True`
  - **Sorting**: `display_order ASC, id ASC`
  - **Fields Returned**: `id`, `name`, `designation`, `bio`, `display_order`, `photo_url`, `photo_width`, `photo_height`
  - **Privacy**: Zero PII, no created_by/updated_by, no internal filesystem paths.

#### Admin Endpoints (Require `get_current_admin`)
- `GET /api/v1/admin/members` — List members with pagination, active filter (`is_active`), and search (`search`)
- `POST /api/v1/admin/members` — Create member profile (records `MEMBER_CREATED` audit log)
- `GET /api/v1/admin/members/{member_id}` — Get member detail
- `PATCH /api/v1/admin/members/{member_id}` / `PUT` — Update member details (records `MEMBER_UPDATED` audit log)
- `POST /api/v1/admin/members/{member_id}/photo` — Upload/replace photograph with secure validation (records `MEMBER_PHOTO_UPLOADED` / `MEMBER_PHOTO_REPLACED`)
- `DELETE /api/v1/admin/members/{member_id}/photo` — Delete photograph and clean up file from storage (records `MEMBER_PHOTO_DELETED`)
- `POST /api/v1/admin/members/{member_id}/activate` — Make member publicly visible (records `MEMBER_ACTIVATED`)
- `POST /api/v1/admin/members/{member_id}/deactivate` — Hide member from public view (records `MEMBER_DEACTIVATED`)
- `POST /api/v1/admin/members/reorder` — Batch update display orders (records `MEMBER_REORDERED`)
- `DELETE /api/v1/admin/members/{member_id}` — Permanently remove member and clean up photo file (records `MEMBER_DELETED`)

---

### 6. Admin Workflow
1. **Navigate to Members Tab** in Admin Control Panel (`/admin/members`).
2. **Add Member**: Click `+ Add Member`, fill Full Name, select/type Designation, enter optional bio, set display order and visibility checkbox, click `Save Member`.
3. **Upload / Manage Photo**: Click `📷 Photo`, choose file. Image is previewed with dimensions and file size. Click `Replace Photo` or `Delete Photo` as needed.
4. **Visibility Toggle**: Click the `VISIBLE` / `HIDDEN` status badge to instantly toggle public view without deletion.
5. **Reorder**: Click `▲` / `▼` to adjust sequential ordering.
6. **Delete Member**: Click `🗑️`, inspect confirmation modal displaying member name and photo preview, confirm deletion.

---

### 7. Public Workflow & Member Card UI
- Clean, respectful public Members page (`/members`).
- Displays member portrait avatar in circular frame with warm accent border.
- **Initials Fallback**: When no photo is uploaded or image is unavailable, automatically derives uppercase initials (e.g., "SD" for Subhashree Dash) against a warm gradient background.
- Sequential index badge (`#01`, `#02`, ...).
- Responsive grid (1 column on mobile, 2 on sm, 3 on md, 4 on lg).
- Clean empty state with zero fake data when no members are published.

---

### 8. Photo Storage & Validation Pipeline
- **Storage Subfolder**: `uploads/members/`
- **Filename Generation**: Randomized secure UUID (`uuid.uuid4().hex`)
- **Allowed Types**: `image/jpeg`, `image/png`, `image/webp`
- **Rejection Vectors**: SVG (XSS vector), HTML, scripts, executables, oversized files (>5MB), corrupted image bytes.
- **Verification**: Validated via magic bytes inspection and Pillow `Image.open().verify()`.
- **Atomic Replacement**: Old image is removed only *after* the new image is validated and saved to disk.

---

### 9. Privacy & Security Protections
- **Zero Sensitive Data**: No Aadhaar, PAN, personal phone numbers, emails, home addresses, or private banking details are collected or exposed.
- **IDOR Protection**: Strict administrative authorization checks on all mutating member endpoints (`get_current_admin`).
- **Path Traversal Guards**: Filename sanitization, UUID paths, upload directory containment checks.
- **Audit Trails**: Every creation, modification, photo change, status toggle, and deletion is recorded in `audit_logs`.

---

### 10. Localization (English & Odia Parity)
- All public and administrative strings localized with 100% key parity across:
  - [`frontend/src/locales/en.ts`](file:///c:/Users/rprit/Documents/MAHAVEER%20YOUTH%20CLUB%20SITE/frontend/src/locales/en.ts)
  - [`frontend/src/locales/or.ts`](file:///c:/Users/rprit/Documents/MAHAVEER%20YOUTH%20CLUB%20SITE/frontend/src/locales/or.ts)

---

### 11. Test & Build Verification

#### Automated Tests
- **Command**: `python -m pytest -v`
- **Result**: `62 passed in 12.19s` (100% passing)
  - `backend/tests/test_members.py`: 7 test suites covering CRUD, photo upload/replace/delete, security validations, public filtering, privacy, IDOR, reordering.
  - Full regression test suite: 62/62 passed.

#### Frontend Build
- **Command**: `npm run build` (`tsc -b && vite build`)
- **Result**: `0 errors, built in 1.85s`

---

### 12. Real Member Data Status
- **Real Members Entered**: `0` (Clean empty state active)
- **Real Member Photos Uploaded**: `0`
- The system is completely prepared for the club administrator to input verified club members and upload official member photographs.
