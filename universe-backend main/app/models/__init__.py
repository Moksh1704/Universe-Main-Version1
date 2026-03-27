import uuid
from datetime import datetime, date, time
from sqlalchemy import (
    Column, String, Boolean, Integer, Float, Text,
    DateTime, Date, Time, ForeignKey, Enum as SAEnum, Table
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base
import enum


# ─── Enums ────────────────────────────────────────────────────────────────────

class UserRole(str, enum.Enum):
    student = "student"
    faculty = "faculty"
    admin = "admin"


class AnnouncementType(str, enum.Enum):
    exam = "exam"
    result = "result"
    holiday = "holiday"
    general = "general"


class EventCategory(str, enum.Enum):
    technical = "technical"
    cultural = "cultural"
    sports = "sports"


class AttendanceStatus(str, enum.Enum):
    present = "present"
    absent = "absent"


class JobStatus(str, enum.Enum):
    open = "open"
    closed = "closed"


# ─── Association Tables ────────────────────────────────────────────────────────

event_registrations = Table(
    "event_registrations",
    Base.metadata,
    Column("student_id", UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
    Column("event_id", UUID(as_uuid=True), ForeignKey("events.id", ondelete="CASCADE"), primary_key=True),
    Column("registered_at", DateTime, default=datetime.utcnow),
)

job_applications = Table(
    "job_applications",
    Base.metadata,
    Column("student_id", UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
    Column("job_id", UUID(as_uuid=True), ForeignKey("jobs.id", ondelete="CASCADE"), primary_key=True),
    Column("applied_at", DateTime, default=datetime.utcnow),
)

post_likes = Table(
    "post_likes",
    Base.metadata,
    Column("user_id", UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
    Column("post_id", UUID(as_uuid=True), ForeignKey("posts.id", ondelete="CASCADE"), primary_key=True),
)


# ─── User Model ───────────────────────────────────────────────────────────────

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(200), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    role = Column(SAEnum(UserRole), nullable=False, default=UserRole.student)
    avatar_url = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Student-specific
    department = Column(String(200), nullable=True)
    year = Column(Integer, nullable=True)
    section = Column(String(10), nullable=True)
    registration_number = Column(String(50), unique=True, nullable=True)
    overall_attendance = Column(Float, default=0.0)

    # Faculty-specific
    designation = Column(String(200), nullable=True)

    # Relationships
    posts = relationship("Post", back_populates="user", cascade="all, delete-orphan")
    comments = relationship("Comment", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    registered_events = relationship("Event", secondary=event_registrations, back_populates="registered_students")
    applied_jobs = relationship("Job", secondary=job_applications, back_populates="applicants")
    timetable_entries = relationship("Timetable", back_populates="faculty")
    liked_posts = relationship("Post", secondary=post_likes, back_populates="liked_by")
    # REMOVED: attendance_records and subject_attendance
    # Attendance is now keyed by registration_number, not user FK


# ─── Announcement Model ───────────────────────────────────────────────────────

class Announcement(Base):
    __tablename__ = "announcements"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(300), nullable=False)
    body = Column(Text, nullable=False)
    type = Column(SAEnum(AnnouncementType), nullable=False, default=AnnouncementType.general)
    date = Column(Date, default=date.today)
    is_urgent = Column(Boolean, default=False)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    creator = relationship("User", foreign_keys=[created_by])


# ─── Event Model ──────────────────────────────────────────────────────────────

class Event(Base):
    __tablename__ = "events"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(300), nullable=False)
    description = Column(Text, nullable=True)
    date = Column(Date, nullable=False)
    time = Column(Time, nullable=False)
    venue = Column(String(300), nullable=True)
    category = Column(SAEnum(EventCategory), nullable=False, default=EventCategory.technical)
    total_slots = Column(Integer, default=100)
    registered_count = Column(Integer, default=0)
    image_url = Column(String(500), nullable=True)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    creator = relationship("User", foreign_keys=[created_by])
    registered_students = relationship("User", secondary=event_registrations, back_populates="registered_events")


# ─── Attendance Models ────────────────────────────────────────────────────────
# CHANGED: Both tables now use registration_number (String) instead of
# student_id (UUID FK → users). This allows faculty to mark attendance
# for students who are not yet registered in the app.

class SubjectAttendance(Base):
    __tablename__ = "subject_attendance"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    # CHANGED from: student_id = Column(UUID, ForeignKey("users.id"), ...)
    registration_number = Column(String(50), nullable=False, index=True)
    subject = Column(String(200), nullable=False)
    total_classes = Column(Integer, default=0)
    attended_classes = Column(Integer, default=0)
    percentage = Column(Float, default=0.0)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # REMOVED: student = relationship("User", back_populates="subject_attendance")


class DayAttendance(Base):
    __tablename__ = "day_attendance"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    # CHANGED from: student_id = Column(UUID, ForeignKey("users.id"), ...)
    registration_number = Column(String(50), nullable=False, index=True)
    date = Column(Date, nullable=False)
    subject = Column(String(200), nullable=False)
    status = Column(SAEnum(AttendanceStatus), nullable=False)
    marked_by = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # REMOVED: student = relationship(...) — no longer linked to users table
    faculty = relationship("User", foreign_keys=[marked_by])  # kept — faculty is always a registered user


# ─── Post / Social Feed Models ───────────────────────────────────────────────

class Post(Base):
    __tablename__ = "posts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    content = Column(Text, nullable=False)
    image_url = Column(String(500), nullable=True)
    likes_count = Column(Integer, default=0)
    comments_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="posts", foreign_keys=[user_id])
    comments = relationship("Comment", back_populates="post", cascade="all, delete-orphan")
    # ✅ FIXED — remove back_populates entirely since User no longer has liked_posts
    liked_by = relationship("User", secondary=post_likes)


class Comment(Base):
    __tablename__ = "comments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    post_id = Column(UUID(as_uuid=True), ForeignKey("posts.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    post = relationship("Post", back_populates="comments")
    user = relationship("User", back_populates="comments")


# ─── Timetable Model ──────────────────────────────────────────────────────────

class Timetable(Base):
    __tablename__ = "timetable"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    day = Column(String(20), nullable=False)  # Monday, Tuesday, etc.
    subject = Column(String(200), nullable=False)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    faculty_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    room = Column(String(100), nullable=True)
    department = Column(String(200), nullable=True)
    section = Column(String(10), nullable=True)
    year = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    faculty = relationship("User", back_populates="timetable_entries")


# ─── Job / Placement Model ───────────────────────────────────────────────────

class Job(Base):
    __tablename__ = "jobs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_name = Column(String(300), nullable=False)
    role = Column(String(300), nullable=False)
    package = Column(String(100), nullable=True)
    deadline = Column(Date, nullable=False)
    description = Column(Text, nullable=True)
    status = Column(SAEnum(JobStatus), default=JobStatus.open)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    creator = relationship("User", foreign_keys=[created_by])
    applicants = relationship("User", secondary=job_applications, back_populates="applied_jobs")


# ─── Notification Model ───────────────────────────────────────────────────────

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(300), nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="notifications")