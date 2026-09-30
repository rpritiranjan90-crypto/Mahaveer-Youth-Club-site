# Security Architecture & Policies — Mahaveer Youth Club Banza V2

## 1. Overview
This document outlines the security controls, authentication architecture, and cryptographic specifications implemented in Phase 3 of the Mahaveer Youth Club Banza V2 portal.

---

## 2. Password Security & Hashing
- **Algorithm**: **Argon2id** (OWASP recommended parameters: `time_cost=3`, `memory_cost=64MB`, `parallelism=4`, `hash_len=32`).
- **Constant-Time Verification**: Verification operations execute in constant time to eliminate timing side-channel attacks.
- **Password Policy**:
  - Minimum length: **12 characters**.
  - New password must differ from current password on change.
- **Storage**: Plaintext passwords are never stored, transmitted in logs, or written to disk.

---

## 3. Session & Token Architecture
- **JWT Access Tokens**:
  - Algorithm: `HS256` signed using `SECRET_KEY`.
  - Expiration: **15 minutes** (`ACCESS_TOKEN_EXPIRE_MINUTES`).
  - Claims: `sub` (User ID), `email`, `is_admin`, `type="access"`, `iat`, `exp`, `jti`.
- **Refresh Tokens**:
  - High-entropy cryptographic token (`secrets.token_urlsafe(48)`).
  - Stored in database as a **SHA-256 hash** (`token_hash`), never raw.
  - Expiration: **7 days** (`REFRESH_TOKEN_EXPIRE_DAYS`).
  - Explicit revocation supported on logout and password changes.
- **Dedicated 2FA Challenge Tokens**:
  - Scope: `type="2fa_pending"`.
  - Expiration: **5 minutes**.
  - Strictly rejected by standard authenticated endpoints (`get_current_user`).

---

## 4. Two-Factor Authentication (RFC 6238 TOTP)
- **Algorithm**: RFC 6238 Time-Based One-Time Password with HMAC-SHA1.
- **Secret Generation**: Base32 secret generated via `pyotp.random_base32()`.
- **Provisioning URI**: Standard `otpauth://` URI compatible with Google Authenticator, Microsoft Authenticator, Authy, and 1Password.
- **Two-Step Activation**: 2FA is not enabled until the administrator proves possession by providing a valid 6-digit TOTP code against a temporary secret.
- **Disable Protection**: Disabling 2FA requires verifying both current password and a valid TOTP/recovery code.

---

## 5. Backup Recovery Codes
- **Generation**: 8 high-entropy alphanumeric codes (`XXXX-XXXX`) generated via Python `secrets` module with unambiguous characters.
- **Storage**: Stored in the `recovery_codes` table as **SHA-256 hashes**. Plaintext recovery codes are never stored.
- **Single-Use Enforcement**: Immediately marked as `is_used=True` with `used_at` timestamp upon successful authentication. Reuse attempts are rejected.
- **Displayed Once**: Returned to the administrator once upon 2FA activation/regeneration and never displayed again via API.

---

## 6. Login Rate Limiting & Brute-Force Protection
- **Sliding Window Limiter**: Tracks failed attempts by `(IP Address, Normalized Email)` key.
- **Threshold**: Maximum **5 failed attempts** within a **5-minute window** (300 seconds).
- **HTTP 429 Response**: Returns generic rate limit response without revealing account existence.
- **Reset**: Counter resets immediately upon successful password verification.

---

## 7. Security Audit Logging
- **Immutable Log Model (`AuditLog`)**: Records `action`, `user_id`, `user_email`, `ip_address`, `details`, and `created_at`.
- **Monitored Events**: `LOGIN_SUCCESS`, `LOGIN_FAILURE`, `LOGIN_RATE_LIMITED`, `LOGIN_2FA_CHALLENGE`, `2FA_SETUP_INIT`, `2FA_ENABLED`, `2FA_DISABLED`, `2FA_VERIFY_FAILURE`, `RECOVERY_CODE_USED`, `RECOVERY_CODES_REGENERATED`, `PASSWORD_CHANGED`, `LOGOUT`.
- **Strict Credential Redaction**: All sensitive keys (`password`, `token`, `secret`, `code`, `authorization`, `cookie`, `jwt`) are automatically redacted prior to database insertion.

---

## 8. HTTP & Network Security
- **Security Headers**:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `X-XSS-Protection: 1; mode=block`
  - `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()`
  - `Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data: https:; connect-src 'self' http://localhost:* http://127.0.0.1:* https://*; frame-ancestors 'none'; object-src 'none'; base-uri 'self';`
  - `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload` (enabled in production / HTTPS)
- **CORS Configuration**: Discrete whitelist parsing from `CORS_ORIGINS` (wildcards prohibited in production).
- **Generic Error Responses**: Standardized JSON error structure (`{"error": {"code": "...", "message": "..."}}`) with zero internal stack trace, filesystem path, or SQL query leakage.

---

## 9. Rate Limiter Deployment Architecture & Limitations
- **Current In-Memory Limiter**:
  - Implemented as a thread-safe sliding window in `backend/app/core/rate_limit.py`.
  - Optimal for single-process deployments (zero external service dependencies, low-cost/college community infrastructure).
- **Multi-Worker & Multi-Instance Limitation**:
  - In a multi-worker Uvicorn deployment (`--workers 4`) or multi-server cluster, memory is partitioned per worker/node. An attacker could theoretically distribute attempts across worker processes.
- **Production Mitigations**:
  1. **Nginx Reverse Proxy Gateway (Active in DEPLOYMENT.md)**: Nginx enforces centralized connection and request rate limiting (`limit_req_zone $binary_remote_addr zone=auth_limit:10m rate=5r/m;`) before traffic reaches FastAPI workers.
  2. **Distributed Redis Limiter (Horizontal Scaling Roadmap)**: For multi-host deployments, replace the in-memory bucket with a Redis-backed sliding window key (`ratelimit:auth:<ip>:<email>`).

---

## 10. Token Storage & Transport Security Implementation
- **Current Active Token Architecture**:
  - **Access Token (15-minute JWT)**: Managed by `AuthContext` and stored strictly in browser `sessionStorage` (`myc_admin_access_token`). It clears automatically when the tab/browser is closed and is never written to `localStorage`.
  - **Refresh Token (7-day High-Entropy Token)**: Issued as an **`HttpOnly; SameSite=Lax; Secure` cookie** (`myc_refresh_token`) scoped to `/api/v1/auth`. JavaScript executing in the browser cannot read or extract the refresh token, providing complete immunity against XSS token harvesting.
  - **Token Rotation**: The `/api/v1/auth/refresh` endpoint cryptographically invalidates the prior refresh token on each exchange and issues a new token pair.
  - **Single-Origin & Revocation**: Refresh tokens are revoked immediately in the database upon logout or password change.

