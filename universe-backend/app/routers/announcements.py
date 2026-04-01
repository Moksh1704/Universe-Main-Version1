from typing import Optional, List
from datetime import date as date_type
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Announcement, UserRole
from app.schemas import CreateAnnouncementRequest, AnnouncementResponse, MessageResponse
from app.auth.dependencies import get_current_user, require_faculty_or_admin, require_admin

router = APIRouter(prefix="/announcements", tags=["Announcements"])


@router.post("", response_model=AnnouncementResponse, status_code=status.HTTP_201_CREATED)
def create_announcement(
    payload: CreateAnnouncementRequest,
    current_user: User = Depends(require_faculty_or_admin),
    db: Session = Depends(get_db),
):
    """Create announcement (Faculty/Admin only)."""
    announcement = Announcement(
        title=payload.title,
        body=payload.body,
        type=payload.type,
        date=payload.date or date_type.today(),
        is_urgent=payload.isUrgent,
        created_by=current_user.id,
    )
    db.add(announcement)
    db.commit()
    db.refresh(announcement)

    # Reload with relationship
    db.refresh(announcement)
    announcement = db.query(Announcement).filter(Announcement.id == announcement.id).first()
    return AnnouncementResponse.from_orm(announcement)


@router.get("", response_model=List[AnnouncementResponse])
def get_announcements(
    type: Optional[str] = Query(None),
    urgent: Optional[bool] = Query(None),
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    pageSize: int = Query(20, ge=1, le=100),
    _: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get all announcements (authenticated users)."""
    query = db.query(Announcement)

    if type:
        query = query.filter(Announcement.type == type)
    if urgent is not None:
        query = query.filter(Announcement.is_urgent == urgent)
    if search:
        query = query.filter(
            (Announcement.title.ilike(f"%{search}%")) | (Announcement.body.ilike(f"%{search}%"))
        )

    announcements = (
        query.order_by(Announcement.is_urgent.desc(), Announcement.created_at.desc())
        .offset((page - 1) * pageSize)
        .limit(pageSize)
        .all()
    )
    return [AnnouncementResponse.from_orm(a) for a in announcements]


@router.get("/{announcement_id}", response_model=AnnouncementResponse)
def get_announcement(
    announcement_id: str,
    _: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get single announcement."""
    ann = db.query(Announcement).filter(Announcement.id == announcement_id).first()
    if not ann:
        raise HTTPException(status_code=404, detail="Announcement not found")
    return AnnouncementResponse.from_orm(ann)


@router.delete("/{announcement_id}", response_model=MessageResponse)
def delete_announcement(
    announcement_id: str,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Delete announcement (Admin only)."""
    ann = db.query(Announcement).filter(Announcement.id == announcement_id).first()
    if not ann:
        raise HTTPException(status_code=404, detail="Announcement not found")

    db.delete(ann)
    db.commit()
    return MessageResponse(message="Announcement deleted")
