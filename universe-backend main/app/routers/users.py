from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, UserRole
from app.schemas import UserProfileResponse, UpdateProfileRequest, AdminUpdateUserRequest, MessageResponse
from app.auth.dependencies import get_current_user, require_admin
from app.utils.files import save_upload_file

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=UserProfileResponse)
def get_my_profile(current_user: User = Depends(get_current_user)):
    """Get current user profile."""
    return UserProfileResponse.model_validate(current_user)


@router.patch("/me", response_model=UserProfileResponse)
def update_my_profile(
    payload: UpdateProfileRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update own profile."""
    if payload.name is not None:
        current_user.name = payload.name
    if payload.department is not None:
        current_user.department = payload.department
    if payload.year is not None:
        current_user.year = payload.year
    if payload.section is not None:
        current_user.section = payload.section
    if payload.designation is not None:
        current_user.designation = payload.designation

    db.commit()
    db.refresh(current_user)
    return UserProfileResponse.model_validate(current_user)


@router.post("/me/avatar", response_model=UserProfileResponse)
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Upload profile avatar."""
    url = await save_upload_file(file, folder="avatars")
    current_user.avatar_url = url
    db.commit()
    db.refresh(current_user)
    return UserProfileResponse.model_validate(current_user)


@router.get("", response_model=List[UserProfileResponse])
def get_all_users(
    role: Optional[UserRole] = Query(None),
    department: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    pageSize: int = Query(20, ge=1, le=100),
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Admin: Get all users with optional filters."""
    query = db.query(User)
    if role:
        query = query.filter(User.role == role)
    if department:
        query = query.filter(User.department.ilike(f"%{department}%"))
    if search:
        query = query.filter(
            (User.name.ilike(f"%{search}%")) | (User.email.ilike(f"%{search}%"))
        )

    users = query.offset((page - 1) * pageSize).limit(pageSize).all()
    return [UserProfileResponse.model_validate(u) for u in users]


@router.get("/{user_id}", response_model=UserProfileResponse)
def get_user(
    user_id: str,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Admin: Get specific user by ID."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserProfileResponse.model_validate(user)


@router.patch("/{user_id}", response_model=UserProfileResponse)
def admin_update_user(
    user_id: str,
    payload: AdminUpdateUserRequest,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Admin: Update any user."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    for field, value in payload.model_dump(exclude_none=True).items():
        # convert camelCase payload fields to snake_case model attrs
        snake = {"isActive": "is_active"}.get(field, field)
        setattr(user, snake, value)

    db.commit()
    db.refresh(user)
    return UserProfileResponse.model_validate(user)


@router.delete("/{user_id}", response_model=MessageResponse)
def delete_user(
    user_id: str,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Admin: Delete a user."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    db.delete(user)
    db.commit()
    return MessageResponse(message="User deleted successfully")
