from typing import Optional, List
from datetime import date as date_type, datetime
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, SubjectAttendance, DayAttendance, UserRole, AttendanceStatus
from app.schemas import (
    MarkAttendanceRequest,
    AttendanceResponse, DayAttendanceResponse, AttendanceSummaryResponse,
    MessageResponse
)
from app.auth.dependencies import get_current_user, require_faculty_or_admin, require_student

router = APIRouter(prefix="/attendance", tags=["Attendance"])


# ─── POST /attendance/bulk ────────────────────────────────────────────────────
# Faculty marks attendance for a full class by registration_number.
# No dependency on users table — works for unregistered students too.
# ─────────────────────────────────────────────────────────────────────────────
@router.post("/bulk")
def mark_bulk_attendance(
    payload: dict,
    current_user: User = Depends(require_faculty_or_admin),
    db: Session = Depends(get_db),
):
    """
    Faculty: Submit attendance for all students in a class.

    Expected payload:
    {
        "subject": "Data Structures",
        "date": "2024-03-25T00:00:00.000Z",
        "students": [
            { "registration_number": "322506402355", "present": true },
            { "registration_number": "322506402356", "present": false }
        ]
    }
    """
    subject  = payload.get("subject")
    date_raw = payload.get("date")
    students = payload.get("students", [])

    if not subject or not date_raw or not students:
        raise HTTPException(status_code=400, detail="subject, date, and students are required")

    # Parse ISO date string from frontend (e.g. "2024-03-25T00:00:00.000Z")
    try:
        parsed_date = datetime.fromisoformat(date_raw.replace("Z", "+00:00")).date()
    except (ValueError, AttributeError):
        raise HTTPException(status_code=400, detail=f"Invalid date format: {date_raw}")

    for s in students:
        reg_no  = s.get("registration_number")
        present = s.get("present", False)

        if not reg_no:
            continue  # skip malformed entries silently

        att_status = AttendanceStatus.present if present else AttendanceStatus.absent

        # ── DayAttendance: upsert ─────────────────────────────────────────
        # If faculty re-submits the same class, update status instead of
        # creating a duplicate row. This prevents double-counting total_classes.
        existing_day = db.query(DayAttendance).filter(
            DayAttendance.registration_number == reg_no,
            DayAttendance.date               == parsed_date,
            DayAttendance.subject            == subject,
        ).first()

        if existing_day:
            # Only update if status actually changed
            old_status = (
                existing_day.status.value
                if hasattr(existing_day.status, "value")
                else existing_day.status
            )
            new_status = att_status.value if hasattr(att_status, "value") else att_status

            if old_status != new_status:
                existing_day.status    = att_status
                existing_day.marked_by = current_user.id

                # Fix the subject-level count to reflect the status flip
                record = db.query(SubjectAttendance).filter(
                    SubjectAttendance.registration_number == reg_no,
                    SubjectAttendance.subject             == subject,
                ).first()

                if record:
                    if old_status == "present" and new_status == "absent":
                        record.attended_classes = max(0, record.attended_classes - 1)
                    elif old_status == "absent" and new_status == "present":
                        record.attended_classes += 1

                    record.percentage = round(
                        (record.attended_classes / record.total_classes * 100)
                        if record.total_classes > 0 else 0.0, 2
                    )
        else:
            # ── Brand-new day record ──────────────────────────────────────
            new_day = DayAttendance(
                registration_number = reg_no,
                date                = parsed_date,
                subject             = subject,
                status              = att_status,
                marked_by           = current_user.id,
            )
            db.add(new_day)

            # ── SubjectAttendance: upsert ─────────────────────────────────
            record = db.query(SubjectAttendance).filter(
                SubjectAttendance.registration_number == reg_no,
                SubjectAttendance.subject             == subject,
            ).first()

            if not record:
                record = SubjectAttendance(
                    registration_number = reg_no,
                    subject             = subject,
                    total_classes       = 0,
                    attended_classes    = 0,
                    percentage          = 0.0,
                )
                db.add(record)

            record.total_classes += 1
            if present:
                record.attended_classes += 1
            record.percentage = round(
                (record.attended_classes / record.total_classes * 100)
                if record.total_classes > 0 else 0.0, 2
            )

    db.commit()
    return {"message": "Attendance saved successfully"}


# ─── GET /attendance/me ───────────────────────────────────────────────────────
# Student fetches their own subject-wise attendance using registration_number.
# ─────────────────────────────────────────────────────────────────────────────
@router.get("/me", response_model=List[AttendanceResponse])
def get_my_attendance(
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db),
):
    """Student: Get own subject-wise attendance."""
    records = db.query(SubjectAttendance).filter(
        SubjectAttendance.registration_number == current_user.registration_number
    ).all()
    return [AttendanceResponse.from_orm(r) for r in records]


# ─── GET /attendance/me/daily ─────────────────────────────────────────────────
@router.get("/me/daily", response_model=List[DayAttendanceResponse])
def get_my_daily_attendance(
    subject:   Optional[str]       = Query(None),
    from_date: Optional[date_type] = Query(None),
    to_date:   Optional[date_type] = Query(None),
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db),
):
    """Student: Get own day-wise attendance, optionally filtered by subject/date."""
    query = db.query(DayAttendance).filter(
        DayAttendance.registration_number == current_user.registration_number
    )
    if subject:
        query = query.filter(DayAttendance.subject == subject)
    if from_date:
        query = query.filter(DayAttendance.date >= from_date)
    if to_date:
        query = query.filter(DayAttendance.date <= to_date)

    records = query.order_by(DayAttendance.date.desc()).all()
    return [DayAttendanceResponse.from_orm(r) for r in records]


# ─── GET /attendance/me/summary ───────────────────────────────────────────────
@router.get("/me/summary", response_model=AttendanceSummaryResponse)
def get_my_attendance_summary(
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db),
):
    """Student: Get attendance summary with computed overall percentage."""
    records = db.query(SubjectAttendance).filter(
        SubjectAttendance.registration_number == current_user.registration_number
    ).all()

    total_classes  = sum(r.total_classes    for r in records)
    total_attended = sum(r.attended_classes for r in records)
    overall_pct    = round(
        (total_attended / total_classes * 100) if total_classes > 0 else 0.0, 2
    )

    return AttendanceSummaryResponse(
        studentId         = str(current_user.id),
        studentName       = current_user.name,
        overallPercentage = overall_pct,
        subjects          = [AttendanceResponse.from_orm(r) for r in records],
    )


# ─── GET /attendance/student/{reg_no} ────────────────────────────────────────
# Faculty looks up any student by registration_number (not user ID).
# ─────────────────────────────────────────────────────────────────────────────
@router.get("/student/{reg_no}", response_model=AttendanceSummaryResponse)
def get_student_attendance(
    reg_no: str,
    current_user: User = Depends(require_faculty_or_admin),
    db: Session = Depends(get_db),
):
    """Faculty/Admin: Get attendance summary for any student by registration number."""
    records = db.query(SubjectAttendance).filter(
        SubjectAttendance.registration_number == reg_no
    ).all()

    if not records:
        raise HTTPException(status_code=404, detail=f"No attendance records found for {reg_no}")

    total_classes  = sum(r.total_classes    for r in records)
    total_attended = sum(r.attended_classes for r in records)
    overall_pct    = round(
        (total_attended / total_classes * 100) if total_classes > 0 else 0.0, 2
    )

    # Try to resolve name from users table — OK if student isn't registered
    student = db.query(User).filter(
        User.registration_number == reg_no
    ).first()

    return AttendanceSummaryResponse(
        studentId         = str(student.id) if student else reg_no,
        studentName       = student.name    if student else reg_no,
        overallPercentage = overall_pct,
        subjects          = [AttendanceResponse.from_orm(r) for r in records],
    )


# ─── GET /attendance/daily/{reg_no} ──────────────────────────────────────────
@router.get("/daily/{reg_no}", response_model=List[DayAttendanceResponse])
def get_student_daily_attendance(
    reg_no:  str,
    subject: Optional[str]       = Query(None),
    date:    Optional[date_type] = Query(None),
    current_user: User = Depends(require_faculty_or_admin),
    db: Session = Depends(get_db),
):
    """Faculty/Admin: Get day-wise attendance for any student by registration number."""
    query = db.query(DayAttendance).filter(
        DayAttendance.registration_number == reg_no
    )
    if subject:
        query = query.filter(DayAttendance.subject == subject)
    if date:
        query = query.filter(DayAttendance.date == date)

    records = query.order_by(DayAttendance.date.desc()).all()
    return [DayAttendanceResponse.from_orm(r) for r in records]