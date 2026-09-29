from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.core.security import verify_password, create_access_token, get_password_hash
from backend.app.models.user import User
from backend.app.schemas.auth import LoginRequest, Token, UserResponse
from backend.app.api.deps import get_current_user

router = APIRouter()


@router.post("/login", response_model=Token, summary="Admin Login")
def login(login_data: LoginRequest, db: Session = Depends(get_db)) -> Token:
    """
    Authenticates user by email and password, returning a JWT bearer token.
    """
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user or not verify_password(login_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive. Please contact administrator.",
        )

    # Record last login
    user.last_login_at = datetime.now(timezone.utc)
    db.commit()

    token = create_access_token(subject=user.id, role=user.role)
    return Token(
        access_token=token,
        token_type="bearer",
        user_name=user.name,
        user_email=user.email,
        user_role=user.role,
    )


@router.post("/logout", summary="Admin Logout")
def logout() -> dict:
    """
    Client-side logout acknowledgement.
    """
    return {"message": "Logged out successfully."}


@router.get("/me", response_model=UserResponse, summary="Current User Profile")
def get_me(current_user: User = Depends(get_current_user)) -> User:
    """
    Returns profile information of currently authenticated admin user.
    """
    return current_user
