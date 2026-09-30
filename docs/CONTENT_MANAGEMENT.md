# Content Management & Dynamic Publishing Architecture — Phase 4

## 1. Overview
Phase 4 introduces a full content-management system (CMS) and connects the Mahaveer Youth Club Banza public website to live, secured backend APIs.

It establishes a strict three-state lifecycle:
```
Draft  ──(Admin Publish)──>  Published  ──(Admin Archive)──>  Archived
  │                                ▲                               │
  └────────(Admin Archive)─────────┘                               │
  ▲                                                                │
  └──────────────────(Admin Restore to Draft)──────────────────────┘
```

---

## 2. Content Status Lifecycle & Rules

| Status | Public Visibility | Admin Access | Description |
| :--- | :--- | :--- | :--- |
| **`draft`** | ❌ Strictly Hidden (returns 404) | Full (Edit, Preview, Delete) | Work in progress. Not visible on public pages. |
| **`published`** | ✅ Visible through Public APIs | Full (Edit, Archive, Delete) | Approved content live on public pages. Sets `published_at`. |
| **`archived`** | ❌ Strictly Hidden (returns 404) | Full (Restore, Publish, Delete) | Retained in database but hidden publicly. Sets `archived_at`. |

### Timestamp Rules
- `published_at`: Automatically set to `CURRENT_TIMESTAMP` upon transition to `published`.
- `archived_at`: Automatically set to `CURRENT_TIMESTAMP` upon transition to `archived`.
- When an item returns to `draft`: `published_at` and `archived_at` are reset to `None` to prevent showing stale publication timestamps.

---

## 3. Database Content Models & Schema

### A. Updates (`updates` table)
- `id` (Integer PK, auto-increment)
- `title` (String 255, required)
- `slug` (String 255, unique, indexed) — Auto-generated lowercase hyphenated string with collision handling.
- `category` (String 100, default `'Official Notice'`)
- `excerpt` (Text, optional summary)
- `content` (Text, HTML/Rich text — server-side sanitized to prevent XSS)
- `featured_image` (String 500, optional image URL)
- `status` (String 20, default `'draft'`, indexed)
- `published_at` (DateTime with tz, nullable, indexed)
- `archived_at` (DateTime with tz, nullable)
- `created_at` (DateTime with tz, default `CURRENT_TIMESTAMP`)
- `updated_at` (DateTime with tz, onupdate `CURRENT_TIMESTAMP`)

### B. Activities (`activities` table)
- `id` (Integer PK, auto-increment)
- `title` (String 255, required)
- `slug` (String 255, unique, indexed)
- `description` (Text, required)
- `date` (String 100, required)
- `category` (String 100, default `'Puja & Rituals'`, indexed)
- `image` (String 500, optional)
- `status` (String 20, default `'draft'`, indexed)
- `published_at` (DateTime with tz, nullable, indexed)
- `archived_at` (DateTime with tz, nullable)
- `created_at` (DateTime with tz, default `CURRENT_TIMESTAMP`)
- `updated_at` (DateTime with tz, onupdate `CURRENT_TIMESTAMP`)

### C. Gallery Items (`gallery_items` table)
- `id` (Integer PK, auto-increment)
- `title` (String 255, required)
- `image_url` (String 500, required)
- `thumbnail_url` (String 500, optional)
- `year` (String 10, required, indexed) — **Dynamic**: Never hardcoded. Dynamically queried.
- `category` (String 100, default `'Ganesh Puja'`, indexed)
- `alt_text` (String 255, required for accessibility)
- `status` (String 20, default `'draft'`, indexed)
- `published_at` (DateTime with tz, nullable)
- `archived_at` (DateTime with tz, nullable)
- `created_at` (DateTime with tz, default `CURRENT_TIMESTAMP`)
- `updated_at` (DateTime with tz, onupdate `CURRENT_TIMESTAMP`)

### D. Members (`members` table)
- `id` (Integer PK, auto-increment)
- `display_name` (String 100, required) — **Privacy-Enforced: Public nicknames only**.
- `role` (String 100, optional, default `'Club Youth Member'`)
- `sort_order` (Integer, default `0`, indexed)
- `is_visible` (Boolean, default `True`, indexed)
- `created_at` (DateTime with tz, default `CURRENT_TIMESTAMP`)
- `updated_at` (DateTime with tz, onupdate `CURRENT_TIMESTAMP`)

> [!IMPORTANT]
> **Strict Privacy Control**: The Members model explicitly omits phone numbers, email addresses, personal addresses, dates of birth, government IDs, and individual photos.

---

## 4. API Endpoints Reference

### Public Endpoints (Unauthenticated, `status == "published"` ONLY)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/public/updates` | List published circulars (paginated, search by title/excerpt, newest first) |
| `GET` | `/api/v1/public/updates/{slug}` | Get single published circular by unique slug (404 if draft or archived) |
| `GET` | `/api/v1/public/activities` | List published activities (paginated, category filter, date ordered) |
| `GET` | `/api/v1/public/activities/{slug}` | Get single published activity by unique slug |
| `GET` | `/api/v1/public/gallery` | List published photos (paginated, year filter, category filter) |
| `GET` | `/api/v1/public/gallery/years` | Dynamic distinct years from published photos |
| `GET` | `/api/v1/public/gallery/categories`| Dynamic distinct categories from published photos |
| `GET` | `/api/v1/public/members` | List public member nicknames (ordered by `sort_order` asc) |

### Admin Endpoints (Authenticated Admin Required)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/admin/updates` | List updates across all statuses with pagination & search |
| `POST` | `/api/v1/admin/updates` | Create new update (draft or published) |
| `GET` | `/api/v1/admin/updates/{id}` | Get update detail for editing |
| `GET` | `/api/v1/admin/updates/{id}/preview` | Preview draft/archived update safely |
| `PATCH` | `/api/v1/admin/updates/{id}` | Update metadata / sanitized content |
| `POST` | `/api/v1/admin/updates/{id}/status` | Transition status (`draft`, `published`, `archived`) |
| `DELETE` | `/api/v1/admin/updates/{id}` | Permanently delete update with audit trail |
| `GET` | `/api/v1/admin/activities` | List all club activities |
| `POST` | `/api/v1/admin/activities` | Create activity |
| `GET` | `/api/v1/admin/activities/{id}` | Get activity detail |
| `GET` | `/api/v1/admin/activities/{id}/preview` | Preview draft activity |
| `PATCH` | `/api/v1/admin/activities/{id}` | Update activity |
| `POST` | `/api/v1/admin/activities/{id}/status` | Transition activity status |
| `DELETE` | `/api/v1/admin/activities/{id}` | Delete activity |
| `GET` | `/api/v1/admin/gallery` | List gallery photos across all statuses |
| `POST` | `/api/v1/admin/gallery` | Create gallery item metadata |
| `POST` | `/api/v1/admin/gallery/upload` | Upload JPEG/PNG/WebP image with auto thumbnail |
| `GET` | `/api/v1/admin/gallery/{id}` | Get gallery item detail |
| `PATCH` | `/api/v1/admin/gallery/{id}` | Update gallery item metadata |
| `POST` | `/api/v1/admin/gallery/{id}/status` | Transition gallery status |
| `DELETE` | `/api/v1/admin/gallery/{id}` | Delete photo and remove files from disk |
| `GET` | `/api/v1/admin/members` | List roster members |
| `POST` | `/api/v1/admin/members` | Add member nickname |
| `GET` | `/api/v1/admin/members/{id}` | Get member detail |
| `PATCH` | `/api/v1/admin/members/{id}` | Update member nickname, role, visibility |
| `POST` | `/api/v1/admin/members/reorder` | Batch reorder member sort orders |
| `DELETE` | `/api/v1/admin/members/{id}` | Delete member from roster |

---

## 5. Security & Storage Controls
1. **Magic Bytes Validation**: Verifies genuine JPEG (`FF D8 FF`), PNG (`89 50 4E 47`), and WebP (`RIFF...WEBP`) file headers.
2. **File Size Limit**: Strict 5MB ceiling per upload.
3. **Safe Server Naming**: All files stored with cryptographically generated UUIDs (`uuid.uuid4().hex`) and safe extensions.
4. **Path Traversal Protection**: Guarded against `../` path trickery on upload and deletion.
5. **HTML Sanitization**: Server-side whitelisting of safe semantic tags; strips `<script>`, `<iframe>`, `javascript:`, and all `on*` event handlers.
6. **Audit Trail**: Every create, edit, status transition, reorder, and deletion generates an immutable audit log entry.
