"""
All Pydantic schemas for UniVerse API.
Response models use camelCase to be directly consumable by React frontends.
"""
from __future__ import annotations
from datetime import datetime, date, time
from typing import Optional, List, Any
from uuid import UUID
from pydantic import BaseModel, EmailStr, Field, field_validator, model_validator
from app.models import UserRole, AnnouncementType, EventCategory, AttendanceStatus, JobStatus


# ─── Base Config ──────────────────────────────────────────────────────────────

class CamelModel(BaseModel):
    """Base model that serializes to camelCase for React frontend."""
    model_config = {
        "populate_by_name": True,
        "from_attributes": True,
    }

    def model_dump(self, **kwargs):
        kwargs.setdefault("by_alias", True)
        return super().model_dump(**kwargs)

    def model_dump_json(self, **kwargs):
        kwargs.setdefault("by_alias", True)
        return super().model_dump_json(**kwargs)


def to_camel(string: str) -> str:
    components = string.split("_")
    return components[0] + "".join(x.title() for x in components[1:])


# ─── Common Responses ─────────────────────────────────────────────────────────

class MessageResponse(BaseModel):
    message: str
    success: bool = True


class PaginatedResponse(BaseModel):
    items: List[Any]
    total: int
    page: int
    pageSize: int
    totalPages: int


# ─── AUTH SCHEMAS ──────────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=200)
    email: EmailStr
    password: str = Field(..., min_length=6)
    role: UserRole = UserRole.student
    department: Optional[str] = None
    year: Optional[int] = Field(None, ge=1, le=6)
    section: Optional[str] = None
    registration_number: Optional[str] = None
    designation: Optional[str] = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    accessToken: str
    refreshToken: str
    tokenType: str = "Bearer"
    user: "UserProfileResponse"


class RefreshTokenRequest(BaseModel):
    refreshToken: str


# ─── USER SCHEMAS ─────────────────────────────────────────────────────────────

class UserProfileResponse(CamelModel):
    id: UUID
    name: str
    email: str
    role: UserRole
    avatar_url: Optional[str] = Field(None, alias="avatarUrl")
    is_active: bool = Field(True, alias="isActive")
    created_at: datetime = Field(alias="createdAt")

    # Student fields
    department: Optional[str] = None
    year: Optional[int] = None
    section: Optional[str] = None
    registration_number: Optional[str] = Field(None, alias="registrationNumber")
    overall_attendance: Optional[float] = Field(None, alias="overallAttendance")

    # Faculty fields
    designation: Optional[str] = None

    model_config = {"populate_by_name": True, "from_attributes": True}


class UpdateProfileRequest(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=200)
    department: Optional[str] = None
    year: Optional[int] = Field(None, ge=1, le=6)
    section: Optional[str] = None
    designation: Optional[str] = None


class AdminUpdateUserRequest(UpdateProfileRequest):
    is_active: Optional[bool] = None
    role: Optional[UserRole] = None


# ─── ANNOUNCEMENT SCHEMAS ─────────────────────────────────────────────────────

class CreateAnnouncementRequest(BaseModel):
    title: str = Field(..., min_length=3, max_length=300)
    body: str = Field(..., min_length=10)
    type: AnnouncementType = AnnouncementType.general
    date: Optional[date] = None
    isUrgent: bool = False


class AnnouncementResponse(BaseModel):
    """Matches frontend: { id, title, body, type, date, urgent }"""
    id: UUID
    title: str
    body: str
    type: str
    date: date
    urgent: bool  # Frontend uses 'urgent' not 'isUrgent'
    createdBy: Optional[str] = None  # creator name

    model_config = {"from_attributes": False}

    @classmethod
    def from_orm(cls, obj: Any) -> "AnnouncementResponse":
        return cls(
            id=obj.id,
            title=obj.title,
            body=obj.body,
            type=obj.type.value if hasattr(obj.type, "value") else obj.type,
            date=obj.date,
            urgent=obj.is_urgent,
            createdBy=obj.creator.name if obj.creator else None,
        )


# ─── EVENT SCHEMAS ────────────────────────────────────────────────────────────

class CreateEventRequest(BaseModel):
    title: str = Field(..., min_length=3, max_length=300)
    description: Optional[str] = None
    date: date
    time: time
    venue: Optional[str] = None
    category: EventCategory = EventCategory.technical
    totalSlots: int = Field(100, ge=1)


class EventResponse(BaseModel):
    """Matches frontend: { id, title, date, time, venue, description, category, registered }"""
    id: UUID
    title: str
    date: date
    time: time
    venue: Optional[str]
    description: Optional[str]
    category: str
    registered: bool  # Whether current user is registered
    totalSlots: int
    registeredCount: int
    createdBy: Optional[str] = None

    model_config = {"from_attributes": False}

    @classmethod
    def from_orm_with_user(cls, obj: Any, user_id: Optional[UUID] = None) -> "EventResponse":
        registered = False
        if user_id:
            registered = any(str(s.id) == str(user_id) for s in obj.registered_students)
        return cls(
            id=obj.id,
            title=obj.title,
            date=obj.date,
            time=obj.time,
            venue=obj.venue,
            description=obj.description,
            category=obj.category.value if hasattr(obj.category, "value") else obj.category,
            registered=registered,
            totalSlots=obj.total_slots,
            registeredCount=obj.registered_count,
            createdBy=obj.creator.name if obj.creator else None,
        )


# ─── ATTENDANCE SCHEMAS ───────────────────────────────────────────────────────

class MarkAttendanceRequest(BaseModel):
    studentId: UUID
    subject: str
    date: date
    status: AttendanceStatus


class BulkMarkAttendanceRequest(BaseModel):
    subject: str
    date: date
    records: List[dict]  # [{registration_number, present}]


class AttendanceResponse(BaseModel):
    """Matches frontend: { subject, present, total, percentage }"""
    subject: str
    present: int
    total: int
    percentage: float

    model_config = {"from_attributes": False}

    @classmethod
    def from_orm(cls, obj: Any) -> "AttendanceResponse":
        return cls(
            subject=obj.subject,
            present=obj.attended_classes,
            total=obj.total_classes,
            percentage=round(obj.percentage, 2),
        )


class DayAttendanceResponse(BaseModel):
    id: UUID
    registrationNumber: str      # CHANGED from studentId: UUID
    date: date
    subject: str
    status: str
    markedBy: Optional[str] = None

    model_config = {"from_attributes": False}

    @classmethod
    def from_orm(cls, obj: Any) -> "DayAttendanceResponse":
        return cls(
            id=obj.id,
            registrationNumber=obj.registration_number,   # CHANGED from obj.student_id
            date=obj.date,
            subject=obj.subject,
            status=obj.status.value if hasattr(obj.status, "value") else obj.status,
            markedBy=obj.faculty.name if obj.faculty else None,
        )


class AttendanceSummaryResponse(BaseModel):
    studentId: str        # CHANGED: str instead of UUID to support unregistered students
    studentName: str
    overallPercentage: float
    subjects: List[AttendanceResponse]


# ─── POST / SOCIAL FEED SCHEMAS ───────────────────────────────────────────────

class CreatePostRequest(BaseModel):
    content: str = Field(..., min_length=1, max_length=5000)


class CommentRequest(BaseModel):
    content: str = Field(..., min_length=1, max_length=1000)


class CommentResponse(BaseModel):
    id: UUID
    userName: str
    userRole: str
    content: str
    timePosted: str

    model_config = {"from_attributes": False}

    @classmethod
    def from_orm(cls, obj: Any) -> "CommentResponse":
        return cls(
            id=obj.id,
            userName=obj.user.name,
            userRole=obj.user.role.value if hasattr(obj.user.role, "value") else obj.user.role,
            content=obj.content,
            timePosted=obj.created_at.isoformat(),
        )


class PostResponse(BaseModel):
    """Matches frontend: { id, userName, userRole, content, timePosted, likes, comments }"""
    id: UUID
    userName: str
    userRole: str
    content: str
    timePosted: str
    likes: int
    comments: int
    userAvatar: Optional[str] = None
    isLiked: bool = False  # whether current user liked it

    model_config = {"from_attributes": False}

    @classmethod
    def from_orm_with_user(cls, obj: Any, user_id: Optional[UUID] = None) -> "PostResponse":
        is_liked = False
        if user_id:
            is_liked = any(str(u.id) == str(user_id) for u in obj.liked_by)
        return cls(
            id=obj.id,
            userName=obj.user.name,
            userRole=obj.user.role.value if hasattr(obj.user.role, "value") else obj.user.role,
            content=obj.content,
            timePosted=obj.created_at.isoformat(),
            likes=obj.likes_count,
            comments=obj.comments_count,
            userAvatar=obj.user.avatar_url,
            isLiked=is_liked,
        )


# ─── TIMETABLE SCHEMAS ────────────────────────────────────────────────────────

class CreateTimetableRequest(BaseModel):
    day: str = Field(..., description="Monday, Tuesday, ...")
    subject: str
    startTime: time
    endTime: time
    facultyId: Optional[UUID] = None
    room: Optional[str] = None
    department: Optional[str] = None
    section: Optional[str] = None
    year: Optional[int] = None


class TimetableResponse(BaseModel):
    id: UUID
    day: str
    subject: str
    startTime: str
    endTime: str
    facultyName: Optional[str] = None
    room: Optional[str] = None
    department: Optional[str] = None
    section: Optional[str] = None
    year: Optional[int] = None

    model_config = {"from_attributes": False}

    @classmethod
    def from_orm(cls, obj: Any) -> "TimetableResponse":
        return cls(
            id=obj.id,
            day=obj.day,
            subject=obj.subject,
            startTime=obj.start_time.strftime("%H:%M"),
            endTime=obj.end_time.strftime("%H:%M"),
            facultyName=obj.faculty.name if obj.faculty else None,
            room=obj.room,
            department=obj.department,
            section=obj.section,
            year=obj.year,
        )


# ─── JOB SCHEMAS ──────────────────────────────────────────────────────────────

class CreateJobRequest(BaseModel):
    companyName: str = Field(..., min_length=2)
    role: str
    package: Optional[str] = None
    deadline: date
    description: Optional[str] = None


class JobResponse(BaseModel):
    id: UUID
    companyName: str
    role: str
    package: Optional[str]
    deadline: date
    description: Optional[str]
    status: str
    applied: bool = False
    applicantCount: int = 0

    model_config = {"from_attributes": False}

    @classmethod
    def from_orm_with_user(cls, obj: Any, user_id: Optional[UUID] = None) -> "JobResponse":
        applied = False
        if user_id:
            applied = any(str(u.id) == str(user_id) for u in obj.applicants)
        return cls(
            id=obj.id,
            companyName=obj.company_name,
            role=obj.role,
            package=obj.package,
            deadline=obj.deadline,
            description=obj.description,
            status=obj.status.value if hasattr(obj.status, "value") else obj.status,
            applied=applied,
            applicantCount=len(obj.applicants),
        )


# ─── NOTIFICATION SCHEMAS ─────────────────────────────────────────────────────

class NotificationResponse(BaseModel):
    id: UUID
    title: str
    message: str
    isRead: bool
    createdAt: str

    model_config = {"from_attributes": False}

    @classmethod
    def from_orm(cls, obj: Any) -> "NotificationResponse":
        return cls(
            id=obj.id,
            title=obj.title,
            message=obj.message,
            isRead=obj.is_read,
            createdAt=obj.created_at.isoformat(),
        )