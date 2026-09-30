import hashlib
import hmac
import secrets
import string
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional, Tuple

import argon2
from argon2.exceptions import VerifyMismatchError, VerificationError, InvalidHashError
import jwt
import pyotp

from backend.app.core.config import settings

# Initialize Argon2id Password Hasher with OWASP recommended parameters
ph = argon2.PasswordHasher(
    time_cost=3,
    memory_cost=65536,  # 64 MB
    parallelism=4,
    hash_len=32,
    type=argon2.Type.ID,
)

ALGORITHM = "HS256"


def hash_password(password: str) -> str:
    """
    Hashes a plaintext password using Argon2id.
    """
    return ph.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifies a plaintext password against an Argon2id hash using constant-time comparison.
    """
    try:
        return ph.verify(hashed_password, plain_password)
    except (VerifyMismatchError, VerificationError, InvalidHashError):
        # Constant-time dummy check to prevent timing leaks on invalid hash formats
        return False
    except Exception:
        return False


def hash_token(token: str) -> str:
    """
    Generates a SHA-256 hex digest of a raw token for secure database storage.
    """
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def create_access_token(user_id: int, email: str, is_admin: bool = True) -> str:
    """
    Creates a short-lived JWT access token with standard claims.
    """
    now = datetime.now(timezone.utc)
    expire = now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    jti = secrets.token_hex(16)

    payload: Dict[str, Any] = {
        "sub": str(user_id),
        "email": email,
        "is_admin": is_admin,
        "type": "access",
        "iat": int(now.timestamp()),
        "exp": int(expire.timestamp()),
        "jti": jti,
    }

    return jwt.encode(payload, settings.SECRET_KEY, algorithm=ALGORITHM)


def create_2fa_challenge_token(user_id: int, email: str) -> str:
    """
    Creates a dedicated short-lived 2FA challenge token with '2fa_pending' scope.
    This token is strictly rejected by standard authenticated endpoints.
    """
    now = datetime.now(timezone.utc)
    expire = now + timedelta(minutes=5)  # 5 minutes validity
    jti = secrets.token_hex(16)

    payload: Dict[str, Any] = {
        "sub": str(user_id),
        "email": email,
        "type": "2fa_pending",
        "iat": int(now.timestamp()),
        "exp": int(expire.timestamp()),
        "jti": jti,
    }

    return jwt.encode(payload, settings.SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> Dict[str, Any]:
    """
    Decodes and verifies a JWT token signature and expiration.
    """
    return jwt.decode(
        token,
        settings.SECRET_KEY,
        algorithms=[ALGORITHM],
        options={"require": ["sub", "type", "exp", "iat"]},
    )


def create_refresh_token() -> Tuple[str, str, datetime]:
    """
    Generates a cryptographically secure random refresh token.
    Returns (raw_token, token_hash, expires_at).
    """
    raw_token = secrets.token_urlsafe(48)
    token_h = hash_token(raw_token)
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    return raw_token, token_h, expires_at


def generate_totp_secret() -> str:
    """
    Generates an RFC 6238 base32 secret for TOTP multi-factor authentication.
    """
    return pyotp.random_base32()


def get_totp_uri(secret: str, email: str) -> str:
    """
    Generates a standard otpauth:// provisioning URI for QR code generation.
    """
    totp = pyotp.TOTP(secret)
    return totp.provisioning_uri(name=email, issuer_name="Mahaveer Youth Club Banza")


def verify_totp_code(secret: str, code: str) -> bool:
    """
    Verifies a 6-digit TOTP code against a base32 secret with 1-step window tolerance.
    """
    if not secret or not code or len(code.strip()) != 6:
        return False
    try:
        totp = pyotp.TOTP(secret)
        return totp.verify(code.strip(), valid_window=1)
    except Exception:
        return False


def generate_recovery_codes(count: int = 8) -> List[str]:
    """
    Generates cryptographically random single-use backup recovery codes.
    Format: XXXX-XXXX (high entropy alphanumeric).
    """
    charset = string.ascii_uppercase + string.digits
    # Remove ambiguous characters (0, O, 1, I, L)
    clean_charset = "".join(c for c in charset if c not in "0O1IL")
    
    codes: List[str] = []
    for _ in range(count):
        part1 = "".join(secrets.choice(clean_charset) for _ in range(4))
        part2 = "".join(secrets.choice(clean_charset) for _ in range(4))
        codes.append(f"{part1}-{part2}")
    return codes


def normalize_recovery_code(code: str) -> str:
    """
    Normalizes a recovery code by stripping whitespace and dashes.
    """
    return code.replace("-", "").replace(" ", "").upper().strip()


def hash_recovery_code(code: str) -> str:
    """
    Hashes a normalized recovery code using SHA-256.
    """
    normalized = normalize_recovery_code(code)
    return hashlib.sha256(normalized.encode("utf-8")).hexdigest()


def verify_recovery_code(plain_code: str, hashed_code: str) -> bool:
    """
    Verifies a plain recovery code against a stored hash using constant-time comparison.
    """
    candidate_hash = hash_recovery_code(plain_code)
    return hmac.compare_digest(candidate_hash, hashed_code)
