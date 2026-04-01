from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Job, UserRole
from app.schemas import CreateJobRequest, JobResponse, MessageResponse
from app.auth.dependencies import get_current_user, require_admin, require_student

router = APIRouter(prefix="/jobs", tags=["Career & Placements"])


@router.post("", response_model=JobResponse, status_code=status.HTTP_201_CREATED)
def create_job(
    payload: CreateJobRequest,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Admin: Post a new job/placement opportunity."""
    job = Job(
        company_name=payload.companyName,
        role=payload.role,
        package=payload.package,
        deadline=payload.deadline,
        description=payload.description,
        created_by=current_user.id,
    )
    db.add(job)
    db.commit()
    job = db.query(Job).filter(Job.id == job.id).first()
    return JobResponse.from_orm_with_user(job, current_user.id)


@router.get("", response_model=List[JobResponse])
def get_jobs(
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    pageSize: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get all job listings."""
    query = db.query(Job)
    if status:
        query = query.filter(Job.status == status)
    if search:
        query = query.filter(
            (Job.company_name.ilike(f"%{search}%")) |
            (Job.role.ilike(f"%{search}%")) |
            (Job.description.ilike(f"%{search}%"))
        )

    jobs = (
        query.order_by(Job.deadline.asc())
        .offset((page - 1) * pageSize)
        .limit(pageSize)
        .all()
    )
    return [JobResponse.from_orm_with_user(j, current_user.id) for j in jobs]


@router.get("/{job_id}", response_model=JobResponse)
def get_job(
    job_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get a specific job."""
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return JobResponse.from_orm_with_user(job, current_user.id)


@router.post("/{job_id}/apply", response_model=JobResponse)
def apply_for_job(
    job_id: str,
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db),
):
    """Student: Apply for a job."""
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    if job.status.value == "closed":
        raise HTTPException(status_code=400, detail="Job is no longer accepting applications")

    from datetime import date
    if job.deadline < date.today():
        raise HTTPException(status_code=400, detail="Application deadline has passed")

    already = any(str(u.id) == str(current_user.id) for u in job.applicants)
    if already:
        raise HTTPException(status_code=400, detail="Already applied to this job")

    job.applicants.append(current_user)
    db.commit()
    job = db.query(Job).filter(Job.id == job_id).first()
    return JobResponse.from_orm_with_user(job, current_user.id)


@router.delete("/{job_id}/apply", response_model=JobResponse)
def withdraw_application(
    job_id: str,
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db),
):
    """Student: Withdraw job application."""
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    applied = any(str(u.id) == str(current_user.id) for u in job.applicants)
    if not applied:
        raise HTTPException(status_code=400, detail="You haven't applied to this job")

    job.applicants.remove(current_user)
    db.commit()
    job = db.query(Job).filter(Job.id == job_id).first()
    return JobResponse.from_orm_with_user(job, current_user.id)


@router.get("/{job_id}/applicants", response_model=List[dict])
def get_applicants(
    job_id: str,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Admin: Get all applicants for a job."""
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    return [
        {
            "id": str(u.id),
            "name": u.name,
            "email": u.email,
            "department": u.department,
            "year": u.year,
            "registrationNumber": u.registration_number,
        }
        for u in job.applicants
    ]


@router.delete("/{job_id}", response_model=MessageResponse)
def delete_job(
    job_id: str,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Admin: Delete a job listing."""
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    db.delete(job)
    db.commit()
    return MessageResponse(message="Job deleted")
