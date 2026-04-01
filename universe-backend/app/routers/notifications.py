from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Notification
from app.schemas import NotificationResponse, MessageResponse
from app.auth.dependencies import get_current_user, require_admin

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("", response_model=List[NotificationResponse])
def get_notifications(
    unread_only: bool = Query(False),
    page: int = Query(1, ge=1),
    pageSize: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get notifications for current user."""
    query = db.query(Notification).filter(Notification.user_id == current_user.id)

    if unread_only:
        query = query.filter(Notification.is_read == False)

    notifications = (
        query.order_by(Notification.created_at.desc())
        .offset((page - 1) * pageSize)
        .limit(pageSize)
        .all()
    )
    return [NotificationResponse.from_orm(n) for n in notifications]


@router.post("/{notification_id}/read", response_model=NotificationResponse)
def mark_as_read(
    notification_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Mark a notification as read."""
    notif = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id,
    ).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")

    notif.is_read = True
    db.commit()
    db.refresh(notif)
    return NotificationResponse.from_orm(notif)


@router.post("/read-all", response_model=MessageResponse)
def mark_all_as_read(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Mark all notifications as read."""
    db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False,
    ).update({"is_read": True})
    db.commit()
    return MessageResponse(message="All notifications marked as read")


@router.get("/unread-count")
def get_unread_count(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get count of unread notifications."""
    count = db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False,
    ).count()
    return {"unreadCount": count}


# Admin: Push notification to user(s)
@router.post("/send", response_model=MessageResponse)
def send_notification(
    payload: dict,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Admin: Send notification to a specific user or broadcast to all."""
    user_id = payload.get("userId")
    title = payload.get("title", "Notification")
    message = payload.get("message", "")
    broadcast = payload.get("broadcast", False)

    if broadcast:
        users = db.query(User).filter(User.is_active == True).all()
        for user in users:
            notif = Notification(user_id=user.id, title=title, message=message)
            db.add(notif)
        db.commit()
        return MessageResponse(message=f"Notification sent to {len(users)} users")

    if not user_id:
        raise HTTPException(status_code=400, detail="userId is required when not broadcasting")

    notif = Notification(user_id=user_id, title=title, message=message)
    db.add(notif)
    db.commit()
    return MessageResponse(message="Notification sent")
