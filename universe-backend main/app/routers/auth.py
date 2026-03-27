from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, UserRole
from app.schemas import (
    RegisterRequest, LoginRequest, TokenResponse, RefreshTokenRequest,
    UserProfileResponse, MessageResponse
)
from app.auth.utils import (
    hash_password, verify_password,
    create_access_token, create_refresh_token, decode_token
)
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    """Register a new user. Anyone can self-register as student; admin creates faculty/admin."""
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    if payload.registration_number:
        dup = db.query(User).filter(User.registration_number == payload.registration_number).first()
        if dup:
            raise HTTPException(status_code=400, detail="Registration number already exists")

    user = User(
        name=payload.name,
        email=payload.email,
        hashed_password=hash_password(payload.password),
        role=payload.role,
        department=payload.department,
        year=payload.year,
        section=payload.section,
        registration_number=payload.registration_number,
        designation=payload.designation,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    access_token = create_access_token({"sub": str(user.id), "role": user.role.value})
    refresh_token = create_refresh_token({"sub": str(user.id)})

    return TokenResponse(
        accessToken=access_token,
        refreshToken=refresh_token,
        user=UserProfileResponse.model_validate(user),
    )


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    """Login and receive JWT tokens."""
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is deactivated")

    access_token = create_access_token({"sub": str(user.id), "role": user.role.value})
    refresh_token = create_refresh_token({"sub": str(user.id)})

    return TokenResponse(
        accessToken=access_token,
        refreshToken=refresh_token,
        user=UserProfileResponse.model_validate(user),
    )


@router.post("/refresh", response_model=TokenResponse)
def refresh_token(payload: RefreshTokenRequest, db: Session = Depends(get_db)):
    """Refresh access token using a valid refresh token."""
    token_data = decode_token(payload.refreshToken)
    if not token_data or token_data.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")

    user = db.query(User).filter(User.id == token_data["sub"], User.is_active == True).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    access_token = create_access_token({"sub": str(user.id), "role": user.role.value})
    new_refresh = create_refresh_token({"sub": str(user.id)})

    return TokenResponse(
        accessToken=access_token,
        refreshToken=new_refresh,
        user=UserProfileResponse.model_validate(user),
    )


@router.post("/logout", response_model=MessageResponse)
def logout(current_user: User = Depends(get_current_user)):
    """Logout endpoint (client should discard tokens)."""
    return MessageResponse(message="Logged out successfully")


@router.get("/me", response_model=UserProfileResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """Get current authenticated user profile."""
    return UserProfileResponse.model_validate(current_user)
