from datetime import datetime, timezone
import secrets
from typing import Any, Dict, Optional
from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy.orm import Session
import jwt

from backend.app.api.deps import get_client_ip, get_current_admin, get_current_user
from backend.app.core.config import settings
from backend.app.core.database import get_db
from backend.app.core.logging import logger
from backend.app.core.rate_limit import login_rate_limiter
from backend.app.core.security import (
    create_access_token,
    create_2fa_challenge_token,
    create_refresh_token,
    decode_token,
    generate_recovery_codes,
    generate_totp_secret,
    get_totp_uri,
    hash_password,
    hash_recovery_code,
    hash_token,
    verify_password,
    verify_recovery_code,
    verify_totp_code,
)
from backend.app.models.recovery_code import RecoveryCode
from backend.app.models.refresh_token import RefreshToken
from backend.app.models.user import User
from backend.app.schemas.auth import (
    LoginRequest,
    LoginResponse,
    PasswordChangeRequest,
    RecoveryCodesRegenerateRequest,
    TwoFactorDisableRequest,
    TwoFactorEnableRequest,
    TwoFactorEnableResponse,
    TwoFactorSetupResponse,
    TwoFactorVerifyRequest,
    UserOut,
)
from backend.app.services.audit import record_audit_event

router = APIRouter()


@router.post("/login", response_model=LoginResponse, summary="Admin Login")
def login(
    request_data: LoginRequest,
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
) -> LoginResponse:
    """
    Authenticates administrative users with brute-force protection.
    Returns 2FA challenge token if TOTP is enabled, or standard access token if disabled.
    """
    client_ip = get_client_ip(request)
    normalized_email = request_data.email.strip().lower()

    # 1. Check Rate Limiter
    if not login_rate_limiter.is_allowed(client_ip, normalized_email):
        record_audit_event(
            db,
            action="LOGIN_RATE_LIMITED",
            user_email=normalized_email,
            ip_address=client_ip,
            details={"reason": "Excessive failed attempts"},
        )
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many failed login attempts. Please try again in 5 minutes.",
        )

    # 2. Query User
    user = db.query(User).filter(User.email == normalized_email).first()

    # 3. Password Verification (generic response prevents user enumeration)
    if not user or not verify_password(request_data.password, user.password_hash):
        login_rate_limiter.record_failed_attempt(client_ip, normalized_email)
        record_audit_event(
            db,
            action="LOGIN_FAILURE",
            user_id=user.id if user else None,
            user_email=normalized_email,
            ip_address=client_ip,
            details={"reason": "Invalid credentials"},
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    if not user.is_active:
        record_audit_event(
            db,
            action="LOGIN_INACTIVE_USER",
            user_id=user.id,
            user_email=user.email,
            ip_address=client_ip,
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account has been deactivated.",
        )

    # Reset rate limit counter on successful password verification
    login_rate_limiter.reset(client_ip, normalized_email)

    # 4. Handle 2FA Challenge
    if user.totp_enabled:
        challenge_token = create_2fa_challenge_token(user.id, user.email)
        record_audit_event(
            db,
            action="LOGIN_2FA_CHALLENGE",
            user_id=user.id,
            user_email=user.email,
            ip_address=client_ip,
        )
        return LoginResponse(requires_2fa=True, challenge_token=challenge_token)

    # 5. Handle Direct Login (if 2FA is not yet enabled)
    user.last_login_at = datetime.now(timezone.utc)
    access_token = create_access_token(user.id, user.email, user.is_admin)
    raw_refresh, refresh_hash, refresh_expires = create_refresh_token()

    ref_token_entry = RefreshToken(
        user_id=user.id,
        token_hash=refresh_hash,
        jti=secrets.token_hex(16),
        expires_at=refresh_expires,
    )
    db.add(ref_token_entry)
    db.commit()
    db.refresh(user)

    record_audit_event(
        db,
        action="LOGIN_SUCCESS",
        user_id=user.id,
        user_email=user.email,
        ip_address=client_ip,
        details={"auth_method": "password_direct"},
    )

    response.set_cookie(
        key="myc_refresh_token",
        value=raw_refresh,
        httponly=True,
        secure=(settings.APP_ENV == "production"),
        samesite="lax",
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 3600,
        path=f"{settings.API_V1_STR}/auth",
    )

    return LoginResponse(
        requires_2fa=False,
        access_token=access_token,
        refresh_token=raw_refresh,
        token_type="bearer",
        user=UserOut.model_validate(user),
    )


@router.post("/2fa/verify", response_model=LoginResponse, summary="Verify 2FA Challenge")
def verify_2fa(
    verify_data: TwoFactorVerifyRequest,
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
) -> LoginResponse:
    """
    Verifies a 2FA challenge token using either a 6-digit TOTP code or a single-use recovery code.
    """
    client_ip = get_client_ip(request)

    # 1. Decode Challenge Token
    try:
        payload = decode_token(verify_data.challenge_token)
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="2FA challenge token has expired. Please log in again.",
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid 2FA challenge token.",
        )

    if payload.get("type") != "2fa_pending":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token scope for 2FA verification.",
        )

    user_id = int(payload.get("sub", "0"))
    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.is_active or not user.totp_enabled:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User authentication state invalid.",
        )

    # 2. Check TOTP Code
    input_code = verify_data.code.strip()
    is_totp_valid = False
    if user.totp_secret and len(input_code) == 6 and input_code.isdigit():
        is_totp_valid = verify_totp_code(user.totp_secret, input_code)

    is_recovery_valid = False
    used_recovery_entry: Optional[RecoveryCode] = None

    # 3. Check Recovery Code if TOTP didn't match
    if not is_totp_valid:
        active_codes = (
            db.query(RecoveryCode)
            .filter(RecoveryCode.user_id == user.id, RecoveryCode.is_used.is_(False))
            .all()
        )
        for rc in active_codes:
            if verify_recovery_code(input_code, rc.code_hash):
                is_recovery_valid = True
                used_recovery_entry = rc
                break

    if not is_totp_valid and not is_recovery_valid:
        record_audit_event(
            db,
            action="2FA_VERIFY_FAILURE",
            user_id=user.id,
            user_email=user.email,
            ip_address=client_ip,
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication code.",
        )

    # If recovery code used, mark as consumed immediately (single-use)
    if is_recovery_valid and used_recovery_entry:
        used_recovery_entry.is_used = True
        used_recovery_entry.used_at = datetime.now(timezone.utc)
        record_audit_event(
            db,
            action="RECOVERY_CODE_USED",
            user_id=user.id,
            user_email=user.email,
            ip_address=client_ip,
            details={"code_id": used_recovery_entry.id},
        )

    # Issue Authenticated Session
    user.last_login_at = datetime.now(timezone.utc)
    access_token = create_access_token(user.id, user.email, user.is_admin)
    raw_refresh, refresh_hash, refresh_expires = create_refresh_token()

    ref_token_entry = RefreshToken(
        user_id=user.id,
        token_hash=refresh_hash,
        jti=secrets.token_hex(16),
        expires_at=refresh_expires,
    )
    db.add(ref_token_entry)
    db.commit()
    db.refresh(user)

    record_audit_event(
        db,
        action="LOGIN_SUCCESS",
        user_id=user.id,
        user_email=user.email,
        ip_address=client_ip,
        details={"auth_method": "totp" if is_totp_valid else "recovery_code"},
    )

    response.set_cookie(
        key="myc_refresh_token",
        value=raw_refresh,
        httponly=True,
        secure=(settings.APP_ENV == "production"),
        samesite="lax",
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 3600,
        path=f"{settings.API_V1_STR}/auth",
    )

    return LoginResponse(
        requires_2fa=False,
        access_token=access_token,
        refresh_token=raw_refresh,
        token_type="bearer",
        user=UserOut.model_validate(user),
    )


@router.post("/refresh", response_model=LoginResponse, summary="Refresh Access Token")
def refresh_session_token(
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
) -> LoginResponse:
    """
    Refreshes access token using secure HttpOnly cookie or authorization header.
    Rotates the refresh token securely upon each exchange.
    """
    raw_refresh = request.cookies.get("myc_refresh_token")
    if not raw_refresh:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            raw_refresh = auth_header.split(" ", 1)[1].strip()

    if not raw_refresh:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token missing or expired.",
        )

    token_hash_val = hash_token(raw_refresh)
    token_entry = (
        db.query(RefreshToken)
        .filter(
            RefreshToken.token_hash == token_hash_val,
            RefreshToken.is_revoked.is_(False),
        )
        .first()
    )

    if not token_entry:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token invalid or expired.",
        )

    expires = token_entry.expires_at
    is_token_expired = (
        expires < datetime.now(timezone.utc)
        if expires.tzinfo is not None
        else expires < datetime.now(timezone.utc).replace(tzinfo=None)
    )

    if is_token_expired:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token invalid or expired.",
        )

    user = db.query(User).filter(User.id == token_entry.user_id).first()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account inactive or unavailable.",
        )

    # Invalidate old refresh token (Rotation)
    token_entry.is_revoked = True
    token_entry.revoked_at = datetime.now(timezone.utc)

    # Issue fresh tokens
    new_access_token = create_access_token(user.id, user.email, user.is_admin)
    new_raw_refresh, new_refresh_hash, new_refresh_expires = create_refresh_token()

    new_token_entry = RefreshToken(
        user_id=user.id,
        token_hash=new_refresh_hash,
        jti=secrets.token_hex(16),
        expires_at=new_refresh_expires,
    )
    db.add(new_token_entry)
    db.commit()
    db.refresh(user)

    response.set_cookie(
        key="myc_refresh_token",
        value=new_raw_refresh,
        httponly=True,
        secure=(settings.APP_ENV == "production"),
        samesite="lax",
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 3600,
        path=f"{settings.API_V1_STR}/auth",
    )

    return LoginResponse(
        requires_2fa=False,
        access_token=new_access_token,
        refresh_token=new_raw_refresh,
        token_type="bearer",
        user=UserOut.model_validate(user),
    )


@router.post("/2fa/setup", response_model=TwoFactorSetupResponse, summary="Initialize 2FA Setup")
def setup_2fa(
    request: Request,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> TwoFactorSetupResponse:
    """
    Generates a new TOTP secret and provisioning URI.
    2FA is NOT activated until proven via /2fa/enable.
    """
    client_ip = get_client_ip(request)
    secret = generate_totp_secret()
    current_user.totp_temp_secret = secret
    db.commit()

    provisioning_uri = get_totp_uri(secret, current_user.email)

    record_audit_event(
        db,
        action="2FA_SETUP_INIT",
        user_id=current_user.id,
        user_email=current_user.email,
        ip_address=client_ip,
    )

    return TwoFactorSetupResponse(secret=secret, provisioning_uri=provisioning_uri)


@router.post("/2fa/enable", response_model=TwoFactorEnableResponse, summary="Activate 2FA")
def enable_2fa(
    enable_data: TwoFactorEnableRequest,
    request: Request,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> TwoFactorEnableResponse:
    """
    Verifies possession of authenticator and activates 2FA.
    Generates 8 single-use recovery codes stored as secure hashes.
    """
    client_ip = get_client_ip(request)

    if not current_user.totp_temp_secret:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="2FA setup has not been initiated. Call /2fa/setup first.",
        )

    if not verify_totp_code(current_user.totp_temp_secret, enable_data.code):
        record_audit_event(
            db,
            action="2FA_ENABLE_FAILED",
            user_id=current_user.id,
            user_email=current_user.email,
            ip_address=client_ip,
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid 6-digit verification code.",
        )

    # Activate TOTP
    current_user.totp_secret = current_user.totp_temp_secret
    current_user.totp_temp_secret = None
    current_user.totp_enabled = True

    # Delete existing recovery codes if any
    db.query(RecoveryCode).filter(RecoveryCode.user_id == current_user.id).delete()

    # Generate 8 new recovery codes
    raw_recovery_codes = generate_recovery_codes(8)
    for code in raw_recovery_codes:
        db.add(
            RecoveryCode(
                user_id=current_user.id,
                code_hash=hash_recovery_code(code),
                is_used=False,
            )
        )

    db.commit()

    record_audit_event(
        db,
        action="2FA_ENABLED",
        user_id=current_user.id,
        user_email=current_user.email,
        ip_address=client_ip,
    )

    return TwoFactorEnableResponse(recovery_codes=raw_recovery_codes)


@router.post("/2fa/disable", summary="Disable 2FA")
def disable_2fa(
    disable_data: TwoFactorDisableRequest,
    request: Request,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> Dict[str, str]:
    """
    Disables 2FA. Requires both current password and a valid TOTP or recovery code.
    """
    client_ip = get_client_ip(request)

    # 1. Verify Password
    if not verify_password(disable_data.current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password verification failed.",
        )

    # 2. Verify TOTP or Recovery Code
    code = disable_data.code.strip()
    is_valid = False

    if current_user.totp_secret and len(code) == 6 and code.isdigit():
        is_valid = verify_totp_code(current_user.totp_secret, code)

    if not is_valid:
        active_codes = (
            db.query(RecoveryCode)
            .filter(RecoveryCode.user_id == current_user.id, RecoveryCode.is_used.is_(False))
            .all()
        )
        for rc in active_codes:
            if verify_recovery_code(code, rc.code_hash):
                is_valid = True
                break

    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid authentication code.",
        )

    # Disable 2FA & remove all recovery codes
    current_user.totp_enabled = False
    current_user.totp_secret = None
    current_user.totp_temp_secret = None

    db.query(RecoveryCode).filter(RecoveryCode.user_id == current_user.id).delete()
    db.commit()

    record_audit_event(
        db,
        action="2FA_DISABLED",
        user_id=current_user.id,
        user_email=current_user.email,
        ip_address=client_ip,
    )

    return {"status": "ok", "message": "Two-factor authentication disabled successfully."}


@router.post("/2fa/recovery-codes/regenerate", summary="Regenerate Recovery Codes")
def regenerate_recovery_codes(
    regen_data: RecoveryCodesRegenerateRequest,
    request: Request,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    """
    Regenerates a fresh set of recovery codes. Requires current password and valid TOTP code.
    Previous recovery codes are immediately invalidated.
    """
    client_ip = get_client_ip(request)

    if not current_user.totp_enabled or not current_user.totp_secret:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="2FA is not enabled on this account.",
        )

    # Verify Password
    if not verify_password(regen_data.current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password verification failed.",
        )

    # Verify TOTP
    if not verify_totp_code(current_user.totp_secret, regen_data.code):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid 6-digit verification code.",
        )

    # Invalidate existing recovery codes
    db.query(RecoveryCode).filter(RecoveryCode.user_id == current_user.id).delete()

    # Generate 8 new recovery codes
    raw_recovery_codes = generate_recovery_codes(8)
    for code in raw_recovery_codes:
        db.add(
            RecoveryCode(
                user_id=current_user.id,
                code_hash=hash_recovery_code(code),
                is_used=False,
            )
        )
    db.commit()

    record_audit_event(
        db,
        action="RECOVERY_CODES_REGENERATED",
        user_id=current_user.id,
        user_email=current_user.email,
        ip_address=client_ip,
    )

    return {
        "recovery_codes": raw_recovery_codes,
        "message": "New recovery codes generated. Save them immediately.",
    }


@router.post("/password/change", summary="Change Password")
def change_password(
    pwd_data: PasswordChangeRequest,
    request: Request,
    response: Response,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> Dict[str, str]:
    """
    Changes administrator password and revokes all active refresh tokens.
    """
    client_ip = get_client_ip(request)

    # Verify current password
    if not verify_password(pwd_data.current_password, current_user.password_hash):
        record_audit_event(
            db,
            action="PASSWORD_CHANGE_FAILED",
            user_id=current_user.id,
            user_email=current_user.email,
            ip_address=client_ip,
            details={"reason": "Incorrect current password"},
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password verification failed.",
        )

    # Verify new password differs
    if pwd_data.new_password == pwd_data.current_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be different from current password.",
        )

    # Update hash and revoke tokens
    current_user.password_hash = hash_password(pwd_data.new_password)
    db.query(RefreshToken).filter(RefreshToken.user_id == current_user.id).update(
        {"is_revoked": True, "revoked_at": datetime.now(timezone.utc)}
    )
    db.commit()

    record_audit_event(
        db,
        action="PASSWORD_CHANGED",
        user_id=current_user.id,
        user_email=current_user.email,
        ip_address=client_ip,
    )

    response.delete_cookie(key="myc_refresh_token", path=f"{settings.API_V1_STR}/auth")

    return {"status": "ok", "message": "Password changed successfully."}


@router.post("/logout", summary="Logout")
def logout(
    request: Request,
    response: Response,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Dict[str, str]:
    """
    Invalidates active refresh tokens and records logout event.
    """
    client_ip = get_client_ip(request)

    db.query(RefreshToken).filter(RefreshToken.user_id == current_user.id).update(
        {"is_revoked": True, "revoked_at": datetime.now(timezone.utc)}
    )
    db.commit()

    record_audit_event(
        db,
        action="LOGOUT",
        user_id=current_user.id,
        user_email=current_user.email,
        ip_address=client_ip,
    )

    response.delete_cookie(key="myc_refresh_token", path=f"{settings.API_V1_STR}/auth")

    return {"status": "ok", "message": "Logged out successfully."}


@router.get("/me", response_model=UserOut, summary="Current User Profile")
def get_me(
    current_user: User = Depends(get_current_user),
) -> UserOut:
    """
    Returns sanitized current authenticated user profile without credentials or secrets.
    """
    return UserOut.model_validate(current_user)
