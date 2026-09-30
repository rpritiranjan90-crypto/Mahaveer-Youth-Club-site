import json
from typing import Any, Dict, Optional
from sqlalchemy.orm import Session

from backend.app.core.logging import logger
from backend.app.models.audit_log import AuditLog

# Sensitive keys that must NEVER be persisted in audit logs
SENSITIVE_KEYS = {
    "password",
    "password_hash",
    "old_password",
    "new_password",
    "current_password",
    "token",
    "access_token",
    "refresh_token",
    "challenge_token",
    "secret",
    "totp_secret",
    "code",
    "totp_code",
    "recovery_code",
    "backup_codes",
    "recovery_codes",
    "authorization",
    "cookie",
}


def sanitize_audit_details(details: Optional[Dict[str, Any]]) -> Optional[str]:
    """
    Strips sensitive keys and returns a clean JSON string representation.
    """
    if not details:
        return None

    sanitized: Dict[str, Any] = {}
    for key, value in details.items():
        if key.lower() in SENSITIVE_KEYS or any(s in key.lower() for s in ["password", "secret", "token", "code"]):
            sanitized[key] = "[REDACTED]"
        elif isinstance(value, dict):
            sanitized[key] = json.loads(sanitize_audit_details(value) or "{}")
        else:
            sanitized[key] = value

    try:
        return json.dumps(sanitized, default=str)
    except Exception:
        return None


def record_audit_event(
    db: Session,
    action: str,
    user_id: Optional[int] = None,
    user_email: Optional[str] = None,
    ip_address: Optional[str] = None,
    entity_type: str = "auth",
    entity_id: Optional[str] = None,
    details: Optional[Dict[str, Any]] = None,
) -> Optional[AuditLog]:
    """
    Persists an immutable sanitized security audit event to the database.
    """
    try:
        clean_details = sanitize_audit_details(details)
        log_entry = AuditLog(
            user_id=user_id,
            user_email=user_email,
            action=action.upper(),
            entity_type=entity_type,
            entity_id=str(entity_id) if entity_id else None,
            details=clean_details,
            ip_address=ip_address,
        )
        db.add(log_entry)
        db.commit()
        db.refresh(log_entry)
        return log_entry
    except Exception as e:
        logger.error("Failed to persist security audit event [%s]: %s", action, str(e))
        db.rollback()
        return None
