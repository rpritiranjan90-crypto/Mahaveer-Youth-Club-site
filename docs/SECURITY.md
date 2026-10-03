# Security Architecture & Production Hardening — Mahaveer Youth Club Banza

## 1. Executive Summary & Security Philosophy
This document details the production security architecture, access controls, cryptographic specifications, media storage policies, and threat mitigation mechanisms implemented for the **Mahaveer Youth Club Banza** web application.

The platform follows a **defense-in-depth, zero-trust backend authorization, and privacy-first design** to ensure robust protection against web application vulnerabilities while remaining simple and reliable for non-technical community administrators.

---

## 2. Authentication Architecture & Cryptography

### 2.1 Password Security & Hashing
- **Algorithm**: **Argon2id** (OWASP recommended parameters: `time_cost=3`, `memory_cost=64MB`, `parallelism=4`, `hash_len=32`).
- **Constant-Time Verification**: Password verification uses constant-time comparison to eliminate timing side-channel attacks.
- **Password Policy**:
  - Minimum length: **12 characters**.
  - New passwords must differ from existing passwords upon update.
- **Storage**: Plaintext passwords are never stored, logged, or serialized.

### 2.2 JWT Access Tokens
- **Algorithm**: `HS256` signed using `SECRET_KEY`.
- **Lifespan**: **15 minutes** (`ACCESS_TOKEN_EXPIRE_MINUTES = 15`).
- **Standard Claims**: `sub` (User ID), `email`, `is_admin`, `type="access"`, `iat`, `exp`, `jti`.
- **Dedicated 2FA Challenge Tokens**: Scoped strictly as `type="2fa_pending"` with a 5-minute lifespan; strictly rejected by all standard authenticated endpoints.

### 2.3 Refresh Tokens & Session Invalidation
- **High-Entropy Token**: 48 bytes base64url random token (`secrets.token_urlsafe(48)`).
- **Database Storage**: Stored exclusively as **SHA-256 hashes** (`token_hash`), never in raw plaintext.
- **Single-Use Rotation**: Every token exchange via `/api/v1/auth/refresh` immediately invalidates the prior refresh token and issues a fresh pair.
- **Cookie Security**: Delivered via `HttpOnly`, `SameSite=Lax`, and `Secure` (in production) cookies restricted to path `/api/v1/auth`.
- **Explicit Revocation**: Active refresh tokens are immediately revoked upon logout or password change.

### 2.4 Multi-Factor Authentication (RFC 6238 TOTP)
- **Algorithm**: RFC 6238 Time-Based One-Time Password with HMAC-SHA1.
- **Secret Generation**: High-entropy base32 secret via `pyotp.random_base32()`.
- **Two-Step Activation**: 2FA is activated only after the administrator proves possession with a valid 6-digit TOTP code against a temporary secret.
- **Backup Recovery Codes**: 8 single-use alphanumeric codes (`XXXX-XXXX`), stored as SHA-256 hashes, invalidated immediately upon use.

---

## 3. Authorization & Role-Based Access Control (RBAC)

- **Backend Independence**: Authorization is enforced on the backend via FastAPI dependency injection (`get_current_admin`), independent of frontend navigation guards.
- **Strict Role Boundaries**:
  - **Public Visitors**: Read-only access to published circulars, published activities, published gallery photos, active roster members, and active site assets. Draft and archived records return HTTP 404.
  - **Non-Admin Users**: Access to public data; strictly forbidden (HTTP 403) from administrative mutations, previews, audit logs, or media uploads.
  - **Administrators**: Full management privileges for content, members, media, settings, and security audits.

---

## 4. Media Storage & Upload Security (SEC-01 Hardening)

### 4.1 Multi-Layer Upload Validation
1. **Streaming Memory Protection**: Chunked reading with early byte-size threshold (`MAX_UPLOAD_SIZE_BYTES = 5MB`) prevents memory exhaustion attacks from oversized multipart payloads.
2. **MIME Whitelist**: Strictly permits `image/jpeg`, `image/png`, and `image/webp`. Executable files, scripts, and HTML are rejected.
3. **Magic Byte Signature Inspection**: Verifies binary magic bytes (`\xFF\xD8\xFF` for JPEG, `\x89PNG\r\n\x1a\n` for PNG, `RIFF....WEBP` for WebP).
4. **Pillow Decoding Integrity**: Executes `Image.open(BytesIO).verify()` to discard corrupted images, polyglot payloads, and malformed binaries.
5. **Decompression Bomb Prevention**: `Image.MAX_IMAGE_PIXELS = 25_000_000` protects against memory decompression bombs.
6. **SVG Prohibition**: SVGs (`image/svg+xml`) are forbidden in upload endpoints to eliminate SVG-based Stored XSS vectors.

### 4.2 Safe Storage & Cloudinary CDN Integration
- **Server-Generated Naming**: Public IDs and filenames are generated server-side using `uuid.uuid4().hex`. Client-provided filenames are never used as storage paths.
- **HTTPS Delivery**: All Cloudinary delivery and transformation URLs use HTTPS (`secure=True`, `quality="auto"`, `fetch_format="auto"`).
- **Shared Media Reference Tracking**: `safe_delete_media_file()` verifies whether a media asset URL is referenced across any other database table before destroying it.

---

## 5. Network, API & CORS Security

### 5.1 CORS Configuration
- Explicit origin whitelist matching the production Vercel frontend, official custom domains, and local development ports.
- Verified regex pattern for Vercel preview environments (`r"^https:\/\/mahaveer-youth-club(-site)?(-[a-zA-Z0-9_-]+)?\.vercel\.app$"`).
- Wildcard `allow_origins=["*"]` is strictly disallowed in production for credentialed requests.

### 5.2 HTTP Security Headers
The `SecurityHeadersMiddleware` injects the following security headers into every response:
- `X-Content-Type-Options: nosniff` (MIME sniffing prevention)
- `X-Frame-Options: DENY` (Clickjacking prevention)
- `Referrer-Policy: strict-origin-when-cross-origin`
- `X-XSS-Protection: 1; mode=block`
- `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()`
- `Content-Security-Policy`: Restricts scripts, styles, fonts, and images, and sets `frame-ancestors 'none'`.
- `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload` (enforced over HTTPS).

### 5.3 Input Validation & Injection Prevention
- **Pydantic v2 Schemas**: Strict data typing, bounded strings (`max_length`), and integer ranges.
- **SQL Injection Prevention**: SQLAlchemy parameterized ORM queries across all endpoints and search filters (`.ilike(f"%{pattern}%")`). Zero string-concatenated SQL queries.
- **XSS Sanitization**: Server-side HTML sanitization in `services/sanitizer.py` strips dangerous tags (`<script>`, `<iframe>`, `<object>`), event handlers (`onload`, `onclick`), and `javascript:` protocols.

---

## 6. Rate Limiting & Abuse Prevention

- **Sliding Window In-Memory Limiter**: Tracks failed authentication attempts by `(IP Address, Normalized Email)` key.
- **Threshold**: Maximum **5 failed attempts** within a **5-minute window** (300 seconds).
- **HTTP 429 Response**: Returns standard rate limit error without revealing whether an email exists.
- **Multi-Node Scaling Roadmap**: For horizontal multi-instance scaling, Redis-backed rate limiting can be connected via `REDIS_URL` without altering API contracts.

---

## 7. Error Handling & Information Leakage Prevention

- **Standardized Error Envelope**:
  ```json
  {
    "error": {
      "code": "UNAUTHORIZED",
      "message": "Authentication credentials were not provided."
    }
  }
  ```
- **Zero Information Leakage**: Stack traces, database connection strings, SQL queries, internal filesystem paths, and third-party API keys are never exposed in API responses.

---

## 8. Immutable Security Audit Logging

- **Audit Model (`AuditLog`)**: Records `action`, `user_id`, `user_email`, `ip_address`, `details`, and `created_at`.
- **Audited Events**: Login successes/failures/rate-limits, 2FA challenges/activations/disables, recovery code usage, password changes, logouts, member CRUD, gallery uploads, activity changes, and site asset replacements.
- **Credential Redaction**: Passwords, tokens, secrets, codes, cookies, and authorization headers are scrubbed before persistence.

---

## 9. Disaster Recovery & Backup Security

- **Backup Tools**: Automated utilities in `scripts/` generating native custom PostgreSQL dumps (`pg_dump -F c`), SQLite transactional backups, and JSON fallback exports.
- **SHA-256 Manifests**: Backups include cryptographic checksum manifests and table row counts to ensure data integrity.
- **Credential Masking**: Backup logs automatically mask database connection passwords.
- **Non-Destructive Restores**: Preflight validation verifies target connectivity and schema compatibility before restore execution.

---

## 10. Incident Response & Secret Management Protocol

1. **Production Secret Handling**:
   - `SECRET_KEY`, `DATABASE_URL`, `CLOUDINARY_URL`, and API credentials are stored solely in hosting environment variables (Render Dashboard).
   - `validate_production_safety()` in `Settings` prevents startup if default development keys are detected in production.
2. **Key Rotation Protocol**:
   - If a secret is compromised:
     1. Generate new secret in third-party provider (e.g. Cloudinary, Neon).
     2. Update environment variable in Render.
     3. Verify deployment health and end-to-end functionality.
     4. Only then revoke/disable the previous secret.
